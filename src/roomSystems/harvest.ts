import { reduce, size } from 'lodash';
import spawnSystem from './spawn';
import workerHarvester from 'creepTypes/harvester';
import workerHarvesterWalker from 'creepTypes/harvesterWalker';
import { getSourceLinkOrContainer } from 'utils/blueprint';

const spawnOneHarvesterPerRoom = (room: Room) => {
  const demandId = workerHarvesterWalker.name;
  const totalDistance = reduce(
    room.memory.state?.sources,
    (total, sourceData) => {
      return total + (sourceData.nextSourceDistance === -1 ? 0 : sourceData.nextSourceDistance);
    },
    0,
  );

  let maxSections = 5;
  if (totalDistance < 40) {
    maxSections = 3;
  } else if (totalDistance < 80) {
    maxSections = 4;
  }

  spawnSystem.spawn(room, demandId, workerHarvesterWalker.name, 1, {
    urgent: true,
    maxSections,
    memory: {
      role: 'worker',
      worker: {
        type: workerHarvesterWalker.name,
        demandId,
        roomName: room.name,
      },
    },
  });
};

const spawnOneHarvesterPerSource = (room: Room) => {
  const entries = Object.entries(room.memory.state?.sources || {});
  for (let i = 0; i < entries.length; i++) {
    // for (const [sourceId, sourceData] of Object.entries(room.memory.state?.sources || {})) {
    const [sourceId, sourceData] = entries[i];

    const sourceLinkOrContainer = getSourceLinkOrContainer(room, i);
    if (sourceData.sourceKeeper || !sourceLinkOrContainer) continue;

    const demandId = `${workerHarvester.name}-S${sourceData.index}`;
    spawnSystem.spawn(room, demandId, workerHarvester.name, sourceData.harvestersDesired, {
      urgent: true,
      maxSections: sourceData.harvestersMaxSections,
      memory: {
        role: 'worker',
        worker: {
          type: workerHarvester.name,
          demandId,
          roomName: room.name,
          source: sourceId,
          target: sourceLinkOrContainer?.id,
          resource: RESOURCE_ENERGY,
        },
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
    const level = room.controller?.level || 1;
    const numSources = size(room.memory.state?.sources);
    const storageEnergy = room.storage?.store.getUsedCapacity(RESOURCE_ENERGY) || 0;
    if (level >= 7 && numSources >= 2 && storageEnergy > 20_000) {
      spawnOneHarvesterPerRoom(room);
    } else {
      spawnOneHarvesterPerSource(room);
    }
  },
};

export default systemHarvest;
