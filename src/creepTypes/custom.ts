import { moveToRoomHome, moveToRoomWork } from 'utils/worker';
import { transfer, withdraw } from 'utils/creep';

const customCreepType: CreepType = {
  name: CREEP_TYPE.CUSTOM,
  run(creep) {
    creep.notifyWhenAttacked(false);

    if (creep.store.getFreeCapacity() === 0) {
      if (moveToRoomWork(creep)) return;
      transfer(creep, creep.room.storage!, RESOURCE_ENERGY);
    } else {
      if (moveToRoomHome(creep)) return;
      withdraw(creep, creep.room.storage!, RESOURCE_ENERGY);
    }
  },
};

export default customCreepType;
