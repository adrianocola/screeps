import spawnSystem from './spawn';

import basicCreepType from 'creepTypes/basic';

const createBasic = (room: Room, sourceId: string, nameSuffix: string | number, quantity: number, priority: number) => {
  const demandId = `${basicCreepType.name}-${nameSuffix}`;
  spawnSystem.spawn(room, `${basicCreepType.name}-${nameSuffix}`, basicCreepType.name, quantity, priority, {
    essential: true,
    memory: {
      type: basicCreepType.name,
      sourceId: sourceId as Id<Source>,
      demandId,
      roomName: room.name,
    },
  });
};

const systemBackup: RoomSystem = {
  interval: TICKS.TICK_20,
  name: ROOM_SYSTEMS.BACKUP,
  requiredFeatures: {
    [ROOM_FEATURE.BASIC]: true,
    [ROOM_FEATURE.CONTROLLED]: true,
  },
  run(room: Room) {
    const constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES).length;
    const isExpandingToRoom = room.memory.scan?.features?.[ROOM_FEATURE.EXPANDING_TO];
    // add more creeps to compensate for movement and add even more if there are no construction sites
    // (probably there is only upgrade controller left to do and we can speed up the process)
    const extraCreepsPerSource = (constructionSites ? 1 : 2) - (isExpandingToRoom ? 2 : 0);
    const sources = room.memory.scan?.sources || {};

    for (const sourceId in sources) {
      const sourceData = sources[sourceId];
      if (sourceData.sourceKeeper) continue;

      const desiredInitials = Math.min(sourceData.slotsAvailable, 4) + extraCreepsPerSource;

      createBasic(room, sourceId, sourceData.index, desiredInitials, 5);
    }
  },
};

export default systemBackup;
