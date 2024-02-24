import { upgradeController, withdraw } from 'utils/creep';
import { getMainResourceHolder } from 'utils/room';

const upgraderEmergencyCreepType: CreepType = {
  name: CREEP_TYPE.UPGRADER_EMERGENCY,
  run(creep) {
    if (!creep.room.controller) return;

    const mainResourceHolder = getMainResourceHolder(creep.room);
    if (!mainResourceHolder) return;

    if (creep.store.getUsedCapacity() === 0) {
      withdraw(creep, mainResourceHolder, RESOURCE_ENERGY);
    } else {
      upgradeController(creep, creep.room.controller);
    }
  },
};

export default upgraderEmergencyCreepType;
