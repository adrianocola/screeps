import { getObjectById } from 'utils/game';
import { attackMove } from 'utils/creep';

const defenderCreepType: CreepType = {
  name: CREEP_TYPE.DEFENDER,
  maxSections: 8,
  sectionParts: {
    [TOUGH]: 1,
    [ATTACK]: 1,
    [MOVE]: 2,
  },
  run(creep) {
    const defenseQueue = creep.room.memory.defense?.queue;
    if (defenseQueue && defenseQueue.length > 0) {
      for (const hostileId of defenseQueue) {
        const hostile = getObjectById(hostileId);
        if (hostile) {
          attackMove(creep, hostile);
        }
      }
    }
  },
};

export default defenderCreepType;
