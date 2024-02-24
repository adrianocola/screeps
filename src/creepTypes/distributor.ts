import {
  getMainResourceHolder,
  getRoomClosestEmptyExtension,
  getRoomClosestEmptyTower,
  getRoomEmptySpawn,
} from 'utils/room';
import { moveTo, signController, transfer, withdraw } from 'utils/creep';
import { getBaseTower, getBlueprintEntrance, getControllerContainer } from 'utils/blueprint';

const distributorCreepType: CreepType = {
  name: CREEP_TYPE.DISTRIBUTOR,
  maxSections: 25,
  sectionParts: {
    [CARRY]: 1,
    [MOVE]: 1,
  },
  run(creep) {
    if (!creep.memory.worker) return;

    const mainResourceHolder = getMainResourceHolder(creep.room);
    if (!mainResourceHolder) return;

    const ticksToLive = creep.ticksToLive || 0;
    // if almost dying, run to the source and transfer all energy
    if (ticksToLive < 20) {
      if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
        transfer(creep, mainResourceHolder, RESOURCE_ENERGY);
      } else {
        creep.suicide();
      }
      return;
    }

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

    // if there is a storage link, there is a transferer. It should be responsible for filling the base tower
    const baseTowerId = storageHaveLink ? getBaseTower(creep.room)?.id : undefined;

    if (creep.room.energyAvailable === creep.room.energyCapacityAvailable) {
      target = getRoomClosestEmptyTower(creep.room, baseTowerId);
      if (!target) target = getControllerContainer(creep.room);
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
      const ext1Entrance = getBlueprintEntrance(creep.room, BLUEPRINT_ID.EXT_PACK_1);
      if (ext1Entrance && !creep.pos.isEqualTo(ext1Entrance.x, ext1Entrance.y)) {
        moveTo(creep, { pos: new RoomPosition(ext1Entrance.x, ext1Entrance.y, creep.room.name) });
      }
    }
  },
};

export default distributorCreepType;
