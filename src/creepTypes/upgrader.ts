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
    if (usedCapacity / creep.store.getCapacity() < 0.1) {
      withdraw(creep, source, RESOURCE_ENERGY);
    }
  },
};

export default upgraderCreepType;
