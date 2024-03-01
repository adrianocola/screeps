import systemSpawn from './spawn';
import { bodySectionCost, getMaxSectionsPerHarvesters } from 'utils/worker';
import workerCollector from 'creepTypes/collector';
import workerHarvester from 'creepTypes/harvester';
import { getObjectById } from 'utils/game';

const MINER_COLLECTOR_DEMAND_ID = `${workerCollector.name}-M`;

const collectFromSources = (room: Room, sourcesData: Record<string, RoomMemoryScanSource> = {}) => {
  if (!sourcesData || room.memory.state?.features[ROOM_FEATURE.SOURCES_HAVE_LINK]) return;

  for (const sourceId in sourcesData) {
    const sourceData = sourcesData[sourceId];
    const demandId = `${workerCollector.name}-S${sourceData.index}`;
    if (sourceData.sourceKeeper || !sourceData.sourceContainerId || sourceData.sourceLinkId) {
      systemSpawn.removeSpawn(room, workerCollector.name);
      continue;
    }

    const distance = sourceData.spawnDistance;

    const sectionCost = bodySectionCost(workerCollector.sectionParts || {}, sourceData.paved);
    const maxSections = Math.min(
      Math.ceil(room.energyCapacityAvailable / sectionCost),
      workerCollector.maxSections || 8,
    );

    const harvesterWorkSectionWeight = workerHarvester.sectionParts ? workerHarvester.sectionParts[WORK] || 1 : 1;
    const harvestersMaxSections = getMaxSectionsPerHarvesters(sourceData.harvestersDesired);
    const harvestedInTime =
      2 *
      distance *
      (HARVEST_POWER * sourceData.harvestersDesired * harvestersMaxSections * harvesterWorkSectionWeight);
    const desired = Math.max(1, Math.floor(harvestedInTime / (maxSections * CARRY_CAPACITY)));

    systemSpawn.spawn(room, demandId, workerCollector.name, desired, 31, {
      urgent: true,
      optimizeForRoads: sourceData.paved,
      memory: {
        role: 'worker',
        worker: {
          type: workerCollector.name,
          demandId,
          roomName: room.name,
          sourceIndex: sourceData.index,
        },
      },
    });
  }
};

const collectFromMineral = (room: Room, mineralData?: RoomMemoryScanMineral) => {
  if (!mineralData) return;
  if (!room.memory.state?.features[ROOM_FEATURE.MINERALS_HAVE_EXTRACTOR]) return;

  if (
    mineralData.sourceKeeper ||
    !mineralData.containerId ||
    !mineralData.extractorId ||
    room.terminal?.store.getFreeCapacity() === 0
  )
    return;

  const mineralContainer = getObjectById(mineralData.containerId);
  if (!mineralContainer || mineralContainer.store.getUsedCapacity(mineralData.type) < 1500) {
    systemSpawn.removeSpawn(room, MINER_COLLECTOR_DEMAND_ID);
    return;
  }

  systemSpawn.spawn(room, MINER_COLLECTOR_DEMAND_ID, workerCollector.name, 1, 61, {
    maxSections: 6,
    optimizeForRoads: mineralData.paved,
    memory: {
      role: 'worker',
      worker: {
        type: workerCollector.name,
        demandId: MINER_COLLECTOR_DEMAND_ID,
        roomName: room.name,
        resource: mineralData.type,
      },
    },
  });
};

const systemCollect: RoomSystem = {
  interval: TICKS.TICK_20,
  name: ROOM_SYSTEMS.COLLECT,
  requiredFeatures: {
    [ROOM_FEATURE.BASIC]: false,
    [ROOM_FEATURE.CONTROLLED]: true,
  },
  run(room: Room) {
    if (!room.memory.state?.baseSpawnId) return;

    collectFromSources(room, room.memory.state?.sources);
    collectFromMineral(room, room.memory.state?.mineral);
  },
};

export default systemCollect;
