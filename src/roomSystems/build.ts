import spawnSystem from './spawn';
import { getBaseSpawnContainer } from 'utils/blueprint';
import { dateFromObjectId, getObjectById } from 'utils/game';
import { getLevelRate } from 'utils/controller';
import { getMainEnergySourceId } from 'utils/room';
import workerBuilder from 'creepTypes/builder';

const comparator = (a: BuildQueueItem, b: BuildQueueItem) => {
  if (a.priority !== b.priority) return a.priority - b.priority;

  const aDate = dateFromObjectId(a.constructionSiteId).valueOf();
  const bDate = dateFromObjectId(b.constructionSiteId).valueOf();
  return aDate - bDate;
};

const getDesiredNumberOfBuilders = (room: Room): number => {
  let levelRate = 1;
  let energyAvailable = 0;
  if (room.storage) {
    levelRate = getLevelRate(room);
    energyAvailable = room.storage?.store.getUsedCapacity(RESOURCE_ENERGY) || 0;
  } else if (room.memory.state?.baseSpawnId) {
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
    if (room.createConstructionSite(pos.x, pos.y, structureType) === OK) {
      if (!room.memory.build) room.memory.build = { queue: [], requests: [] };
      room.memory.build?.requests.push({ pos, structureType, priority });
    }
  },
  run(room: Room) {
    if (!room.memory.state?.baseSpawnId) return;

    if (!room.memory.build) room.memory.build = { queue: [], requests: [] };

    const queue = room.memory.build?.queue ?? [];

    // check if all construction site in the queue still exist
    const validQueue: BuildQueueItem[] = [];
    for (const item of queue) {
      const constructionSite = getObjectById(item.constructionSiteId as Id<ConstructionSite>);
      if (constructionSite) {
        validQueue.push(item);
      }
    }

    if (room.memory.build?.requests?.length) {
      const existingRequests: BuildRequestItem[] = [];
      for (const request of room.memory.build.requests) {
        const requestConstructionSites = room.lookForAt(LOOK_CONSTRUCTION_SITES, request.pos.x, request.pos.y);
        if (requestConstructionSites.length) {
          const constructionSite = requestConstructionSites[0];
          validQueue.push({
            constructionSiteId: constructionSite.id,
            structureType: constructionSite.structureType,
            priority: request.priority,
          });
        } else {
          existingRequests.push(request);
        }
      }

      room.memory.build.requests = existingRequests;
    }

    room.memory.build.queue = sortQueue(validQueue);

    if (!validQueue.length) {
      spawnSystem.removeSpawn(room, workerBuilder.name);
      return;
    }

    // down't spawn builders if spawn don't have a container
    if (!room.memory.state.features[ROOM_FEATURE.SPAWN_HAVE_CONTAINER]) return;

    const desiredBuilders = getDesiredNumberOfBuilders(room);

    spawnSystem.spawn(room, workerBuilder.name, workerBuilder.name, desiredBuilders, {
      memory: {
        role: 'worker',
        worker: {
          type: workerBuilder.name,
          demandId: workerBuilder.name,
          roomName: room.name,
          source: getMainEnergySourceId(room),
        },
      },
    });
  },
};

export default systemBuild;
