import spawnSystem from './spawn';
import workerHarvester from 'creepTypes/harvester';

const systemHarvest: RoomSystem = {
  interval: TICKS.TICK_10,
  name: ROOM_SYSTEMS.HARVEST,
  requiredFeatures: {
    [ROOM_FEATURE.BASIC]: false,
    [ROOM_FEATURE.CONTROLLED]: true,
    [ROOM_FEATURE.SOURCES_HAVE_CONTAINER_OR_LINK]: true,
  },
  run(room: Room) {
    const sourcesData = room.memory.state?.sources || {};
    for (const sourceId in sourcesData) {
      const sourceData = sourcesData[sourceId];

      if (sourceData.sourceKeeper) continue;

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
            sourceId: sourceId as Id<Source>,
            sourceIndex: sourceData.index,
          },
        },
      });
    }
  },
};

export default systemHarvest;
