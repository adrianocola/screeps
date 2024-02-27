import { moveTo, upgradeController, withdraw } from 'utils/creep';
import { getControllerLinkOrContainer } from 'utils/blueprint';

const upgraderCreepType: CreepType = {
  name: CREEP_TYPE.UPGRADER,
  run(creep) {
    if (!creep.room.controller) return;

    const source = getControllerLinkOrContainer(creep.room);

    if (!source) return;

    if (!creep.pos.isNearTo(source)) {
      moveTo(creep, source, { range: 1 });
      return;
    }

    const usedCapacity = creep.store.getUsedCapacity();
    if (usedCapacity) {
      upgradeController(creep, creep.room.controller);
    }
    const upgradePower = creep.getActiveBodyparts(WORK) * UPGRADE_CONTROLLER_POWER;
    if (usedCapacity <= upgradePower) {
      withdraw(creep, source, RESOURCE_ENERGY);
    }
  },
};

export default upgraderCreepType;
