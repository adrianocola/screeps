import {
  getMainResourceHolder,
  getRoomClosestEmptyExtension,
  getRoomClosestEmptyTower,
  getRoomEmptySpawn,
} from 'utils/room';
import { moveTo, signController, transfer, withdraw } from 'utils/creep';
import { getBaseTower, getBlueprintEntrance, getControllerContainer, getMineralContainer } from 'utils/blueprint';

const isAlmostDyingAndTransferEnerggy = (creep: Creep, mainResourceHolder: StructureStorage | StructureContainer) => {
  const ticksToLive = creep.ticksToLive || 0;
  // if almost dying, run to the source and transfer all energy
  if (ticksToLive < 20) {
    const roomMineral = creep.room.memory.state?.mineral?.type;
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

const collectMineralResource = (creep: Creep, mainResourceHolder: StructureStorage | StructureContainer) => {
  const roomMineral = creep.room.memory.state?.mineral?.type;

  if (!roomMineral) return undefined;

  if (creep.store.getUsedCapacity(roomMineral) > 0) {
    transfer(creep, mainResourceHolder, roomMineral);
    return OK;
  }

  const mineralContainer = getMineralContainer(creep.room);
  if (roomMineral && mineralContainer && creep.room.energyAvailable === creep.room.energyCapacityAvailable) {
    if (mineralContainer.store.getUsedCapacity(roomMineral) >= creep.store.getCapacity(roomMineral) / 2) {
      if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
        transfer(creep, mainResourceHolder, RESOURCE_ENERGY);
      } else {
        withdraw(creep, mineralContainer, roomMineral);
      }
      return OK;
    }
  }

  return undefined;
};

const distributorCreepType: CreepType = {
  name: CREEP_TYPE.DISTRIBUTOR,
  sectionParts: {
    [CARRY]: 2,
    [MOVE]: 2, // better to have MOVE as multiple of 2 because of road calculations
  },
  run(creep) {
    if (!creep.memory.worker) return;

    const mainResourceHolder = getMainResourceHolder(creep.room);
    if (!mainResourceHolder) return;

    if (isAlmostDyingAndTransferEnerggy(creep, mainResourceHolder) === OK) return;

    // TODO don't do this if the room is under attack or any other emergency state
    if (collectMineralResource(creep, mainResourceHolder) === OK) return;

    if (creep.room.controller?.my && creep.room.controller?.sign?.username !== Memory.username) {
      signController(creep, creep.room.controller, 'War is the price of peace');
      return;
    }

    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
      withdraw(creep, mainResourceHolder, RESOURCE_ENERGY);
      return;
    }

    // if next to the main source and have some space, grab some energy (can continue moving)
    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) !== 0 && creep.pos.isNearTo(mainResourceHolder.pos)) {
      creep.withdraw(mainResourceHolder, RESOURCE_ENERGY);
    }

    let target: StructureExtension | StructureLink | StructureContainer | StructureTower | StructureSpawn | undefined;
    const storageHaveLink = !!creep.room.memory.state?.features[ROOM_FEATURE.STORAGE_HAVE_LINK];
    const controllerHaveLink = !!creep.room.memory.state?.features[ROOM_FEATURE.CONTROLLER_HAVE_LINK];

    // if there is a storage link, there is a transferer. It should be responsible for filling the base tower
    const baseTowerId = storageHaveLink ? getBaseTower(creep.room)?.id : undefined;

    if (creep.room.energyAvailable === creep.room.energyCapacityAvailable) {
      target = getRoomClosestEmptyTower(creep.room, baseTowerId);
      // if the controller has a link, no need to fill the container
      if (!controllerHaveLink && !target) target = getControllerContainer(creep.room);
    } else {
      // if there is a storage link, there is a transferer. It should be responsible for fillling the spawn
      if (!storageHaveLink) target = getRoomEmptySpawn(creep.room);
      if (!target) target = getRoomClosestEmptyExtension(creep.room, 1);
      if (!target) target = getRoomClosestEmptyTower(creep.room, baseTowerId);
      if (!target) target = getRoomClosestEmptyExtension(creep.room, 2);
    }

    if (target && target.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
      transfer(creep, target, RESOURCE_ENERGY);
    } else if (creep.store.getFreeCapacity(RESOURCE_ENERGY) !== 0) {
      withdraw(creep, mainResourceHolder, RESOURCE_ENERGY);
    } else {
      // try not stand in the way of other creeps
      const towersEntrance = getBlueprintEntrance(creep.room, BLUEPRINT_ID.TOWERS);
      if (towersEntrance && !creep.pos.isEqualTo(towersEntrance.x, towersEntrance.y)) {
        moveTo(creep, { pos: new RoomPosition(towersEntrance.x, towersEntrance.y, creep.room.name) });
      }
    }
  },
};

export default distributorCreepType;
