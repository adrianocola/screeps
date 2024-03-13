import { moveTo, upgradeController, withdraw } from 'utils/creep';
import { getControllerLinkOrContainer } from 'utils/blueprint';
import { findFreeSpaceAround, isSpaceBlocked } from 'utils/room';

const upgraderCreepType: CreepType = {
  name: CREEP_TYPE.UPGRADER,
  run(creep) {
    if (!creep.room.controller) return;

    const energyContainer = getControllerLinkOrContainer(creep.room);
    if (!energyContainer) return;

    if (!creep.memory.targetPos) {
      creep.memory.targetPos = findFreeSpaceAround(creep.room, energyContainer.pos);
    }

    // find a free space around the energy container
    if (creep.memory.targetPos) {
      if (creep.pos.x !== creep.memory.targetPos.x && creep.pos.y !== creep.memory.targetPos.y) {
        if (isSpaceBlocked(creep.room, creep.memory.targetPos, true)) {
          creep.memory.targetPos = findFreeSpaceAround(creep.room, energyContainer.pos);
        } else {
          const targetPos = new RoomPosition(creep.memory.targetPos.x, creep.memory.targetPos.y, creep.room.name);
          moveTo(creep, targetPos);
        }
        return;
      }
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
