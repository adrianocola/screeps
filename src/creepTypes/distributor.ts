import { getMainResourceHolder, getRoomClosestEmptyExtension, getRoomEmptySpawn, getRoomEmptyTower } from 'utils/room';
import { moveTo, signController, transfer, withdraw } from 'utils/creep';
import { getBaseTower, getControllerContainer, getMineralContainer } from 'utils/blueprint';
import { dontStandOnRoads } from 'utils/worker';

const isAlmostDyingAndTransferEnerggy = (creep: Creep, mainResourceHolder: StructureStorage | StructureContainer) => {
  const ticksToLive = creep.ticksToLive || 0;
  // if almost dying, run to the source and transfer all energy
  if (ticksToLive < 20) {
    const roomMineral = creep.room.memory.scan?.mineral?.type;
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
      transfer(creep, mainResourceHolder, RESOURCE_ENERGY);
    } else if (roomMineral && creep.store.getUsedCapacity(roomMineral) > 0) {
      transfer(creep, mainResourceHolder, roomMineral);
    } else {
      creep.suicide();
    }
    return OK;
  }

  return undefined;
};

const collectMineralResource = (creep: Creep) => {
  const roomMineral = creep.room.memory.scan?.mineral?.type;
  const terminalOrStorage = creep.room.terminal ?? creep.room.storage;

  if (!roomMineral || !terminalOrStorage) return undefined;

  if (creep.store.getUsedCapacity(roomMineral) > 0) {
    transfer(creep, terminalOrStorage, roomMineral);
    return OK;
  }

  const mineralContainer = getMineralContainer(creep.room);
  if (roomMineral && mineralContainer && creep.room.energyAvailable === creep.room.energyCapacityAvailable) {
    if (mineralContainer.store.getUsedCapacity(roomMineral) >= creep.store.getCapacity(roomMineral) / 2) {
      if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
        transfer(creep, terminalOrStorage, RESOURCE_ENERGY);
      } else {
        withdraw(creep, mineralContainer, roomMineral);
      }
      return OK;
    }
  }

  return undefined;
};

const withdrawEnergy = (creep: Creep, mainResourceHolder: StructureStorage | StructureContainer) => {
  if (creep.pos.isNearTo(mainResourceHolder.pos)) {
    if (mainResourceHolder.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
      // try not stand in the way of other creeps
      dontStandOnRoads(creep, mainResourceHolder, 1);
    } else {
      creep.withdraw(mainResourceHolder, RESOURCE_ENERGY);
    }
  } else {
    moveTo(creep, mainResourceHolder.pos);
  }
};

const distributorCreepType: CreepType = {
  name: CREEP_TYPE.DISTRIBUTOR,
  run(creep) {
    const mainResourceHolder = getMainResourceHolder(creep.room);
    if (!mainResourceHolder) return;

    if (isAlmostDyingAndTransferEnerggy(creep, mainResourceHolder) === OK) return;

    // TODO don't do this if the room is under attack or any other emergency state
    if (collectMineralResource(creep) === OK) return;

    if (creep.room.controller?.my && creep.room.controller?.sign?.username !== Memory.username) {
      signController(creep, creep.room.controller, 'War is the price of peace');
      return;
    }

    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
      withdrawEnergy(creep, mainResourceHolder);
      return;
    }

    // if next to the main source and have some space, grab some energy (can continue moving)
    if (
      creep.store.getFreeCapacity(RESOURCE_ENERGY) !== 0 &&
      creep.pos.isNearTo(mainResourceHolder.pos) &&
      mainResourceHolder.store.getUsedCapacity(RESOURCE_ENERGY) !== 0
    ) {
      creep.withdraw(mainResourceHolder, RESOURCE_ENERGY);
    }

    let target: StructureExtension | StructureLink | StructureContainer | StructureTower | StructureSpawn | undefined;
    const storageHaveLink = !!creep.room.memory.scan?.features?.[ROOM_FEATURE.STORAGE_HAVE_LINK];
    const controllerHaveLink = !!creep.room.memory.scan?.features?.[ROOM_FEATURE.CONTROLLER_HAVE_LINK];

    // if there is a storage link, there is a transferer. It should be responsible for filling the base tower
    const baseTowerId = storageHaveLink ? getBaseTower(creep.room)?.id : undefined;

    if (creep.room.energyAvailable === creep.room.energyCapacityAvailable) {
      target = getRoomEmptyTower(creep.room, baseTowerId);
      // if the controller has a link, no need to fill the container
      if (!controllerHaveLink && !target) {
        const controllerContainer = getControllerContainer(creep.room);
        if (controllerContainer && controllerContainer.store.getFreeCapacity(RESOURCE_ENERGY) >= 500) {
          target = controllerContainer;
        }
      }
    } else {
      // if there is a storage link, there is a transferer. It should be responsible for fillling the spawn
      if (!storageHaveLink) target = getRoomEmptySpawn(creep.room);
      if (!target) target = getRoomClosestEmptyExtension(creep.room, 1);
      if (!target) target = getRoomEmptyTower(creep.room, baseTowerId);
      if (!target) target = getRoomClosestEmptyExtension(creep.room, 2);
    }

    if (target && target.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
      transfer(creep, target, RESOURCE_ENERGY);
    } else if (creep.store.getFreeCapacity(RESOURCE_ENERGY) !== 0) {
      withdrawEnergy(creep, mainResourceHolder);
    } else {
      // try not stand in the way of other creeps
      dontStandOnRoads(creep, mainResourceHolder, 2);
    }
  },
};

export default distributorCreepType;
