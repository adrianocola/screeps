import spawnSystem from './spawn';
import workerHarvester from 'creepTypes/harvester';
import workerHarvesterWalker from 'creepTypes/harvesterWalker';
import { getSourceContainer } from 'utils/blueprint';
import { ENERGY_HARVESTER_MAX_SECTIONS } from 'consts';

const calcNumberWorkPartsNeeded = (sources: Record<string, RoomMemoryScanSource>) => {
  const totalDistance = Object.values(sources).reduce((total, sourceData) => {
    return total + (sourceData.nextSourceDistance === -1 ? 0 : sourceData.nextSourceDistance);
  }, 0);
  const sourcesCount = Object.keys(sources).length;

  const ticksToHarvest = ENERGY_REGEN_TIME - totalDistance;
  const harvestRate = (SOURCE_ENERGY_CAPACITY * sourcesCount) / HARVEST_POWER;
  return Math.ceil(harvestRate / ticksToHarvest);
};

const spawnOneHarvesterPerRoom = (room: Room) => {
  const demandId = workerHarvesterWalker.name;
  const sources = room.memory.scan?.sources ?? {};
  const paved = Object.values(sources).every(sourceData => sourceData.paved);
  const maxSections = calcNumberWorkPartsNeeded(sources);

  spawnSystem.spawn(room, demandId, workerHarvesterWalker.name, 1, 30, {
    essential: true,
    forRoads: paved,
    sectionParts: {
      [WORK]: 1,
      [MOVE]: 1,
    },
    fixedParts: [CARRY, CARRY, CARRY, CARRY],
    maxSections,
    memory: {
      type: workerHarvesterWalker.name,
      demandId,
      roomName: room.name,
    },
  });
};

const spawnOneHarvesterPerSource = (room: Room) => {
  const sourcesData = room.memory.scan?.sources || {};
  for (const sourceId in sourcesData) {
    const sourceData = sourcesData[sourceId];

    if (sourceData.sourceKeeper) continue;

    const sourceContainer = getSourceContainer(room, sourceData.index);
    const demandId = `${workerHarvester.name}-S${sourceData.index}`;
    spawnSystem.spawn(room, demandId, workerHarvester.name, 1, 30, {
      essential: true,
      maxSections: ENERGY_HARVESTER_MAX_SECTIONS,
      forRoads: sourceData.paved,
      sectionParts: {
        [WORK]: 1,
        [MOVE]: 1,
      },
      // if there is a container, no need to have CARRY parts (resources are harvested directly to the container)
      fixedParts: sourceContainer ? undefined : [CARRY, CARRY],
      memory: {
        type: workerHarvester.name,
        demandId,
        roomName: room.name,
        sourceId: sourceId as Id<Source>,
        sourceIndex: sourceData.index,
      },
    });
  }
};

const systemHarvest: RoomSystem = {
  interval: TICKS.TICK_10,
  name: ROOM_SYSTEMS.HARVEST,
  requiredFeatures: {
    [ROOM_FEATURE.BASIC]: false,
    [ROOM_FEATURE.CONTROLLED]: true,
    [ROOM_FEATURE.SOURCES_HAVE_CONTAINER_OR_LINK]: true,
  },
  run(room: Room) {
    const sourcesHaveLink = room.memory.scan?.features[ROOM_FEATURE.SOURCES_HAVE_LINK];
    const numSources = Object.keys(room.memory.scan?.sources ?? {}).length;

    if (sourcesHaveLink && numSources >= 2) {
      spawnOneHarvesterPerRoom(room);
    } else {
      spawnOneHarvesterPerSource(room);
    }
  },
};

export default systemHarvest;
