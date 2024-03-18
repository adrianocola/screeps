import { attack, heal, moveTo } from 'utils/creep';
import { moveToRoomWork } from 'utils/worker';
import { countOffensiveBodyParts } from 'utils/creepBody';

const defenderCreepType: CreepType = {
  name: CREEP_TYPE.NEIGHBOR_DEFENDER,
  run(creep) {
    creep.notifyWhenAttacked(false);
    if (moveToRoomWork(creep)) return;

    let target: Creep | Structure | null = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {
      filter: c => countOffensiveBodyParts(c),
    });

    if (!target) {
      target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
        filter: { structureType: STRUCTURE_INVADER_CORE },
      });
    }

    if (target) {
      attack(creep, target);
      return;
    }

    if (creep.hits < creep.hitsMax) {
      creep.heal(creep);
      return;
    }

    target = creep.pos.findClosestByPath(FIND_MY_CREEPS, { filter: c => c.hits < c.hitsMax });
    if (target) {
      heal(creep, target);
      return;
    }

    if (creep.room.controller) {
      moveTo(creep, creep.room.controller, { range: 5 });
    }
  },
};

export default defenderCreepType;
