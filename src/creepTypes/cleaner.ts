import { attack, moveTo } from 'utils/creep';
import { moveToRoomWork } from 'utils/worker';

const cleanerCreepType: CreepType = {
  name: CREEP_TYPE.CLEANER,
  maxSections: 10,
  sectionParts: {
    [ATTACK]: 1,
    [MOVE]: 1,
  },
  run(creep) {
    if (!moveToRoomWork(creep)) return;

    let target: Creep | Structure | null = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);

    if (!target) {
      target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
        filter: { structureType: STRUCTURE_INVADER_CORE },
      });
    }

    if (!target) {
      target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES);
    }

    if (target) attack(creep, target);
    else if (creep.room.controller) {
      moveTo(creep, creep.room.controller, { range: 5 });
    }
  },
};

export default cleanerCreepType;
