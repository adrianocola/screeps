import { attackController, reserveController } from 'utils/creep';
import { moveToRoomWork } from 'utils/worker';

const workerNeighborHarvester: CreepType = {
  name: CREEP_TYPE.NEIGHBOR_RESERVER,
  run(creep) {
    creep.notifyWhenAttacked(false);

    const controller = Game.rooms[creep.memory.workRoom!]?.controller;
    if (controller) {
      if (!controller.reservation || controller.reservation?.username === Memory.username) {
        reserveController(creep, controller);
      } else {
        attackController(creep, controller);
      }
    } else {
      moveToRoomWork(creep);
    }
  },
};

export default workerNeighborHarvester;
