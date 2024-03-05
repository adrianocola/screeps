import { moveTo, upgradeController, withdraw } from 'utils/creep';
import { getControllerLinkOrContainer } from 'utils/blueprint';
import { dontStandOnRoads } from 'utils/worker';

const upgraderCreepType: CreepType = {
  name: CREEP_TYPE.UPGRADER,
  run(creep) {
    if (!creep.room.controller) return;

    const energyContainer = getControllerLinkOrContainer(creep.room);

    if (!energyContainer) return;

    if (!creep.pos.isNearTo(energyContainer)) {
      moveTo(creep, energyContainer, { range: 1 });
      return;
    }

    if (creep.pos.isNearTo(energyContainer)) {
      dontStandOnRoads(creep, energyContainer);
    }
    const usedCapacity = creep.store.getUsedCapacity();
    if (usedCapacity) {
      upgradeController(creep, creep.room.controller);
    }
    const upgradePower = creep.getActiveBodyparts(WORK) * UPGRADE_CONTROLLER_POWER;
    if (usedCapacity <= upgradePower) {
      withdraw(creep, energyContainer, RESOURCE_ENERGY);
    }
  },
};

export default upgraderCreepType;
