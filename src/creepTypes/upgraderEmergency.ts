import { upgradeController, withdraw } from 'utils/creep';
import { getMainResourceHolder } from 'utils/room';
import { getControllerLinkOrContainer } from 'utils/blueprint';

const upgraderEmergencyCreepType: CreepType = {
  name: CREEP_TYPE.UPGRADER_EMERGENCY,
  run(creep) {
    if (!creep.room.controller) return;

    const mainResourceHolder = getMainResourceHolder(creep.room);
    const energyContainer = getControllerLinkOrContainer(creep.room);
    if (!mainResourceHolder && !energyContainer) return;

    if (creep.store.getUsedCapacity() === 0) {
      if (energyContainer && energyContainer.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
        withdraw(creep, energyContainer, RESOURCE_ENERGY);
      } else if (mainResourceHolder) {
        withdraw(creep, mainResourceHolder, RESOURCE_ENERGY);
      }
    } else {
      upgradeController(creep, creep.room.controller);
    }
  },
};

export default upgraderEmergencyCreepType;
