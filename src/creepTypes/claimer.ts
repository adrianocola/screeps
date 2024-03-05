import { moveToRoomWork } from 'utils/worker';
import { isControllerFree } from 'utils/controller';
import { attackController, claimController } from 'utils/creep';

const claimerCreepType: CreepType = {
  name: CREEP_TYPE.CLAIMER,
  maxSections: 5,
  sectionParts: {
    [CLAIM]: 1,
    [MOVE]: 1,
  },
  run(creep) {
    if (!moveToRoomWork(creep)) return;

    if (creep.room.controller) {
      if (isControllerFree(creep.room)) {
        claimController(creep, creep.room.controller);
      } else {
        attackController(creep, creep.room.controller);
      }
    }
  },
};

export default claimerCreepType;
