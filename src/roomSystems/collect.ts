import systemSpawn from './spawn';
import workerCollector from 'creepTypes/collector';
import workerHarvester from 'creepTypes/harvester';
import { getObjectById } from 'utils/game';
import { ENERGY_HARVESTER_MAX_SECTIONS } from 'consts';

const MINER_COLLECTOR_DEMAND_ID = `${workerCollector.name}-M`;

const collectFromSources = (room: Room, sourcesData: Record<string, RoomMemoryScanSource> = {}) => {
  if (!sourcesData || room.memory.scan?.features[ROOM_FEATURE.SOURCES_HAVE_LINK]) return;

  for (const sourceId in sourcesData) {
    const sourceData = sourcesData[sourceId];
    const demandId = `${workerCollector.name}-S${sourceData.index}`;
    if (sourceData.sourceKeeper || !sourceData.sourceContainerId || sourceData.sourceLinkId) {
      systemSpawn.removeSpawn(room, workerCollector.name);
      continue;
    }

    const distance = sourceData.spawnDistance;
    const harvesterWorkSectionWeight = workerHarvester.sectionParts ? workerHarvester.sectionParts[WORK] || 1 : 1;
    const collectorCarrySectionWeight = workerCollector.sectionParts ? workerCollector.sectionParts[CARRY] || 1 : 1;
    const harvestedInTime = 2 * distance * (HARVEST_POWER * ENERGY_HARVESTER_MAX_SECTIONS * harvesterWorkSectionWeight);
    const maxSections = Math.ceil(harvestedInTime / (collectorCarrySectionWeight * CARRY_CAPACITY));

    systemSpawn.spawn(room, demandId, workerCollector.name, 1, 31, {
      essential: true,
      forRoads: sourceData.paved,
      maxSections,
      memory: {
        type: workerCollector.name,
        demandId,
        roomName: room.name,
        sourceIndex: sourceData.index,
      },
    });
  }
};

const collectFromMineral = (room: Room, mineralData?: RoomMemoryScanMineral) => {
  if (!mineralData) return;
  if (!room.memory.scan?.features[ROOM_FEATURE.MINERALS_HAVE_EXTRACTOR]) return;

  if (
    mineralData.sourceKeeper ||
    !mineralData.containerId ||
    !mineralData.extractorId ||
    room.terminal?.store.getFreeCapacity() === 0
  )
    return;

  const mineralContainer = getObjectById(mineralData.containerId);
  if (!mineralContainer || mineralContainer.store.getUsedCapacity(mineralData.type) < 1800) {
    systemSpawn.removeSpawn(room, MINER_COLLECTOR_DEMAND_ID);
    return;
  }

  systemSpawn.spawn(room, MINER_COLLECTOR_DEMAND_ID, workerCollector.name, 1, 61, {
    maxSections: 4,
    forRoads: mineralData.paved,
    memory: {
      type: workerCollector.name,
      demandId: MINER_COLLECTOR_DEMAND_ID,
      roomName: room.name,
      resource: mineralData.type,
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
    if (!room.memory.scan?.baseSpawnId) return;

    collectFromSources(room, room.memory.scan?.sources);
    collectFromMineral(room, room.memory.scan?.mineral);
  },
};

export default systemCollect;
