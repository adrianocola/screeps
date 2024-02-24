import spawnSystem from './spawn';
import workerHarvester from 'creepTypes/harvester';
import { getSourceLinkOrContainer } from 'utils/blueprint';

const systemHarvest: RoomSystem = {
  interval: TICKS.TICK_10,
  name: ROOM_SYSTEMS.HARVEST,
  requiredFeatures: {
    [ROOM_FEATURE.BASIC]: false,
    [ROOM_FEATURE.CONTROLLED]: true,
    [ROOM_FEATURE.SOURCES_HAVE_CONTAINER_OR_LINK]: true,
  },
  run(room: Room) {
    const entries = Object.entries(room.memory.state?.sources || {});
    for (let i = 0; i < entries.length; i++) {
      // for (const [sourceId, sourceData] of Object.entries(room.memory.state?.sources || {})) {
      const [sourceId, sourceData] = entries[i];

      const sourceLinkOrContainer = getSourceLinkOrContainer(room, i);
      if (sourceData.sourceKeeper || !sourceLinkOrContainer) continue;

      const demandId = `${workerHarvester.name}-S${sourceData.index}`;
      spawnSystem.spawn(room, demandId, workerHarvester.name, sourceData.harvestersDesired, 30, {
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
  },
};

export default systemHarvest;
