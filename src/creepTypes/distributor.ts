import {
  getMainEnergySource,
  getRoomClosestEmptyExtension,
  getRoomClosestEmptyTower,
  getRoomEmptySpawn,
} from 'utils/room';
import { moveTo, signController, transfer, withdraw } from 'utils/creep';
import { getControllerContainer } from 'utils/blueprint';

const distributorCreepType: CreepType = {
  name: CREEP_TYPE.DISTRIBUTOR,
  maxSections: 25,
  sectionParts: {
    [CARRY]: 1,
    [MOVE]: 1,
  },
  run(creep) {
    if (!creep.memory.worker) return;

    const source = getMainEnergySource(creep.room);
    if (!source) return;

    const ticksToLive = creep.ticksToLive || 0;
    // if almost dying, run to the source and transfer all energy
    if (ticksToLive < 20) {
      if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
        transfer(creep, source, RESOURCE_ENERGY);
      } else {
        creep.suicide();
      }
      return;
    }

    if (creep.room.controller?.my && creep.room.controller?.sign?.username !== Memory.username) {
      signController(creep, creep.room.controller, 'War is the price of peace');
      return;
    }

    if (creep.memory.worker?.working && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.worker.working = false;
    } else if (
      !creep.memory.worker?.working &&
      (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0 || source.store.getUsedCapacity(RESOURCE_ENERGY) === 0)
    ) {
      creep.memory.worker.working = true;
    }

    if (creep.memory.worker?.working) {
      let target: StructureExtension | StructureLink | StructureContainer | StructureTower | StructureSpawn | undefined;

      if (creep.room.energyAvailable === creep.room.energyCapacityAvailable) {
        target = getRoomClosestEmptyTower(creep.room);
        if (!target) target = getControllerContainer(creep.room);
      } else {
        target = getRoomEmptySpawn(creep.room);
        if (!target) target = getRoomClosestEmptyExtension(creep.room, 1);
        if (!target) target = getRoomClosestEmptyTower(creep.room);
        if (!target) target = getRoomClosestEmptyExtension(creep.room, 2);
      }

      if (target && target.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        transfer(creep, target, RESOURCE_ENERGY);
      } else if (creep.memory.worker.distributor?.fromTheGround && source.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        transfer(creep, source, RESOURCE_ENERGY);
      } else if (!creep.pos.isNearTo(source)) {
        moveTo(creep, source);
      }
    } else {
      // const tombstones = creep.room.find(FIND_TOMBSTONES);
      // if (tombstones.length) {
      //   for (const tombstone of tombstones) {
      //     if (tombstone.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
      //       withdraw(creep, tombstone, RESOURCE_ENERGY);
      //       creep.memory.worker.distributor = { fromTheGround: true };
      //       return;
      //     }
      //   }
      // }

      delete creep.memory.worker.distributor;
      withdraw(creep, source, RESOURCE_ENERGY);
    }
  },
};

export default distributorCreepType;
