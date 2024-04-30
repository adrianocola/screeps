import {
  getMainResourceHolder,
  getRoomClosestEmptyExtension,
  getRoomEmptySpawn,
  getRoomEmptyTower,
  getRoomSpawn,
} from 'utils/room';
import { moveTo, pickup, signController, transfer, withdraw } from 'utils/creep';
import { getBaseTower, getControllerContainer, getMineralContainer, getSpawn1, getSpawn2 } from 'utils/blueprint';
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

const withdrawEnergy = (creep: Creep, mainResourceHolder: StructureStorage | StructureContainer | Tombstone) => {
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
      const spawn = getRoomSpawn(creep.room);
      if (spawn) {
        const tombstones = spawn.pos.findInRange(FIND_TOMBSTONES, 1);
        for (const tombstone of tombstones) {
          if (tombstone.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            withdrawEnergy(creep, tombstone);
            return;
          }
        }

        const resources = spawn.pos.findInRange(FIND_DROPPED_RESOURCES, 1);
        for (const resource of resources) {
          if (resource.resourceType === RESOURCE_ENERGY) {
            pickup(creep, resource);
            return;
          }
        }
      }
      withdrawEnergy(creep, mainResourceHolder);
      return;
    }

    // if next to the main source and have some space, grab some energy (can continue moving)
    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) !== 0) {
      const spawn1 = getSpawn1(creep.room);
      const spawn2 = getSpawn2(creep.room);
      const tower = getBaseTower(creep.room);
      const termn = creep.room.terminal;
      if (
        creep.pos.isNearTo(mainResourceHolder.pos) &&
        mainResourceHolder.store.getUsedCapacity(RESOURCE_ENERGY) !== 0
      ) {
        creep.withdraw(mainResourceHolder, RESOURCE_ENERGY);
      } else if (creep.room.memory.scan?.features?.[ROOM_FEATURE.STORAGE_HAVE_LINK]) {
        if (spawn1 && creep.pos.isNearTo(spawn1.pos) && spawn1.store.getUsedCapacity(RESOURCE_ENERGY) !== 0) {
          creep.withdraw(spawn1, RESOURCE_ENERGY);
        } else if (spawn2 && creep.pos.isNearTo(spawn2.pos) && spawn2.store.getUsedCapacity(RESOURCE_ENERGY) !== 0) {
          creep.withdraw(spawn2, RESOURCE_ENERGY);
        } else if (tower && creep.pos.isNearTo(tower.pos) && tower.store.getUsedCapacity(RESOURCE_ENERGY) !== 0) {
          creep.withdraw(tower, RESOURCE_ENERGY);
        } else if (termn && creep.pos.isNearTo(termn.pos) && termn.store.getUsedCapacity(RESOURCE_ENERGY) !== 0) {
          creep.withdraw(termn, RESOURCE_ENERGY);
        }
      }
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
