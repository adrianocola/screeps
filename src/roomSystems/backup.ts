import spawnSystem from './spawn';
import { getRandomSourceId } from 'utils/room';

import basicCreepType from 'creepTypes/basic';

const createBasic = (room: Room, sourceId: string, nameSuffix: string | number, quantity: number) => {
  const demandId = `${basicCreepType.name}-${nameSuffix}`;
  spawnSystem.spawn(room, `${basicCreepType.name}-${nameSuffix}`, basicCreepType.name, quantity, {
    urgent: true,
    memory: {
      role: 'worker',
      worker: {
        type: basicCreepType.name,
        demandId,
        roomName: room.name,
        source: sourceId,
      },
    },
  });
};

const systemBackup: RoomSystem = {
  interval: TICKS.TICK_20,
  name: ROOM_SYSTEMS.BACKUP,
  requiredFeatures: {
    [ROOM_FEATURE.CONTROLLED]: true,
  },
  run(room: Room) {
    // SAFE MEASURE IF ALL CREEPS IN THE ROOM DIE
    const allCreeps = room.find(FIND_MY_CREEPS);
    if (!allCreeps.length && !room.memory.state?.features.basic) {
      const randomSourceId = getRandomSourceId(room);
      if (randomSourceId) {
        return createBasic(room, randomSourceId, 'backup', 1);
      }
    }

    if (!room.memory.state?.features[ROOM_FEATURE.BASIC]) return;

    const constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES).length;
    // add more creeps to compensate for movement and add even more if there are no construction sites
    // (probably there is only upgrating controller left to do and we can speed up the process)
    const extraCreepsPerSource = constructionSites ? 1 : 2;

    for (const [sourceId, sourceData] of Object.entries(room.memory.state?.sources || {})) {
      if (sourceData.sourceKeeper) continue;

      const desiredInitials = Math.min(sourceData.slotsAvailable, 4) + extraCreepsPerSource;

      createBasic(room, sourceId, sourceData.index, desiredInitials);
    }
  },
};

export default systemBackup;
