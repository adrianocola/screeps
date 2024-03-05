import spawnSystem from './spawn';
import { getBaseSpawnContainer } from 'utils/blueprint';
import { getObjectById } from 'utils/game';
import { getLevelRate } from 'utils/controller';
import workerBuilder from 'creepTypes/builder';

const comparator = (a: BuildQueueItem, b: BuildQueueItem) => {
  if (a.priority !== b.priority) return a.priority - b.priority;

  return a.constructionSiteId < b.constructionSiteId ? -1 : 1;
};

const getDesiredNumberOfBuilders = (room: Room): number => {
  let levelRate = 1;
  let energyAvailable = 0;
  if (room.storage) {
    levelRate = getLevelRate(room);
    energyAvailable = room.storage?.store.getUsedCapacity(RESOURCE_ENERGY) || 0;
  } else if (room.memory.scan?.baseSpawnId) {
    const spawnContainer = getBaseSpawnContainer(room);
    energyAvailable = spawnContainer?.store.getUsedCapacity(RESOURCE_ENERGY) || 0;
  }

  if (energyAvailable <= levelRate * 250) return 0;
  if (energyAvailable <= levelRate * 1000) return 1;
  if (energyAvailable <= levelRate * 2000) return 2;
  return 3;
};

const sortQueue = (queue: BuildQueueItem[]) => queue.sort(comparator);

const systemBuild: SystemBuild = {
  interval: TICKS.TICK_20,
  name: ROOM_SYSTEMS.BUILD,
  requiredFeatures: {
    [ROOM_FEATURE.CONTROLLED]: true,
  },
  createConstructionSite(room: Room, pos: Pos, structureType: BuildableStructureConstant, priority = 20) {
    let result: ScreepsReturnCode;
    if (structureType === STRUCTURE_SPAWN) {
      const spawns = room.find(FIND_MY_SPAWNS);
      const spawnName = `${room.name}-${spawns.length + 1}`;
      result = room.createConstructionSite(pos.x, pos.y, structureType, spawnName);
    } else {
      result = room.createConstructionSite(pos.x, pos.y, structureType);
    }

    if (result === OK) {
      if (!room.memory.build) room.memory.build = { queue: [], requests: [] };
      room.memory.build.requests.push({ pos, structureType, priority });
    }
  },
  run(room: Room) {
    if (!room.memory.scan?.baseSpawnId) return;

    if (!room.memory.build) room.memory.build = { queue: [], requests: [] };

    const queue = room.memory.build?.queue ?? [];
    const existingConstructionSitesMap: Record<string, boolean> = {};

    // check if all construction sites in the queue still exist
    const validQueue: BuildQueueItem[] = [];
    for (const item of queue) {
      const constructionSite = getObjectById(item.constructionSiteId as Id<ConstructionSite>);
      if (constructionSite) {
        existingConstructionSitesMap[constructionSite.id] = true;
        validQueue.push(item);
      } else {
        // some structure was built, next scan should check if paths have changed
        room.memory.scanPaths = true;
      }
    }

    if (room.memory.build?.requests?.length) {
      for (const request of room.memory.build.requests) {
        const requestConstructionSites = room.lookForAt(LOOK_CONSTRUCTION_SITES, request.pos.x, request.pos.y);
        if (requestConstructionSites.length) {
          const constructionSite = requestConstructionSites[0];
          existingConstructionSitesMap[constructionSite.id] = true;
          validQueue.push({
            constructionSiteId: constructionSite.id,
            structureType: constructionSite.structureType,
            priority: request.priority,
          });
        }
      }

      room.memory.build.requests = [];
    } else {
      const constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
      for (const constructionSite of constructionSites) {
        if (!existingConstructionSitesMap[constructionSite.id]) {
          const buildings = room.lookForAt(LOOK_STRUCTURES, constructionSite.pos.x, constructionSite.pos.y);
          const alreadyBuild = buildings.some(building => building.structureType === constructionSite.structureType);
          if (alreadyBuild) {
            constructionSite.remove();
          } else {
            validQueue.push({
              constructionSiteId: constructionSite.id,
              structureType: constructionSite.structureType,
              priority: 100,
            });
          }
        }
      }
    }

    room.memory.build.queue = sortQueue(validQueue);

    if (!validQueue.length) {
      spawnSystem.removeSpawn(room, workerBuilder.name);
      return;
    }

    // down't spawn builders if spawn don't have a container
    if (!room.memory.scan.features[ROOM_FEATURE.SPAWN_HAVE_CONTAINER]) return;

    const desiredBuilders = getDesiredNumberOfBuilders(room);

    spawnSystem.spawn(room, workerBuilder.name, workerBuilder.name, desiredBuilders, 120, {
      memory: {
        type: workerBuilder.name,
        demandId: workerBuilder.name,
        roomName: room.name,
      },
    });
  },
};

export default systemBuild;
