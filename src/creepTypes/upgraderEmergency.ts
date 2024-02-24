import { upgradeController, withdraw } from 'utils/creep';
import { getSource } from 'utils/worker';

const upgraderEmergencyCreepType: CreepType = {
  name: CREEP_TYPE.UPGRADER_EMERGENCY,
  run(creep) {
    if (!creep.room.controller) return;

    const source = getSource(creep) as StructureContainer | StructureStorage | undefined;

    if (!source) return;

    if (creep.store.getUsedCapacity() === 0) {
      withdraw(creep, source, RESOURCE_ENERGY);
    } else {
      upgradeController(creep, creep.room.controller);
    }
  },
};

export default upgraderEmergencyCreepType;
