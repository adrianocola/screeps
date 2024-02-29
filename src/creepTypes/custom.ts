import { moveTo, transfer } from 'utils/creep';
import { getObjectById } from 'utils/game';

const customCreepType: CreepType = {
  name: CREEP_TYPE.CUSTOM,
  run(creep) {
    creep.notifyWhenAttacked(false);
    if (!creep.memory.worker) return;

    const containerOrLink = getObjectById(creep.memory.worker.containerId);
    if (containerOrLink) {
      if (creep.pos.isNearTo(containerOrLink)) {
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY)) {
          transfer(creep, containerOrLink, RESOURCE_ENERGY);
          return;
        }
      } else if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
        moveTo(creep, containerOrLink);
        return;
      }
    }

    const source = getObjectById(creep.memory.worker.sourceId as Id<Source>);
    if (!source) {
      moveTo(creep, { pos: new RoomPosition(25, 25, creep.memory.worker.workRoom ?? '') });
      return;
    }

    if (!creep.pos.isNearTo(source)) {
      moveTo(creep, source);
      return;
    }

    if (source.energy > 0 && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
      creep.harvest(source);
    }

    // if (creep.room.name === 'W42S55') {
    //   // moveTo(creep, { pos: new RoomPosition(0, 20, 'W42S55') });
    //   moveTo(creep, { pos: new RoomPosition(19, 0, 'W42S55') });
    //   return;
    // }
    //
    // moveTo(creep, { pos: new RoomPosition(4, 43, 'W42S54') });

    // const rampart = getObjectById('65b7a7b53487c325ae0441b0' as Id<StructureRampart>);
    // if (rampart) {
    //   attack(creep, rampart);
    //   return;
    // }

    // const invaderCore = getObjectById('65d5604e1da24646a7df9827' as Id<StructureInvaderCore>);
    // if (invaderCore) {
    //   attack(creep, invaderCore);
    //   return;
    // }

    // const otherRampart = getObjectById('65b79ed407c65e1459ed67ed' as Id<StructureInvaderCore>);
    // if (otherRampart) {
    //   attack(creep, otherRampart);
    //   return;
    // }

    // const anotherRampart = getObjectById('65b7a7b53487c325ae0441b0' as Id<StructureInvaderCore>);
    // if (anotherRampart) {
    //   attack(creep, anotherRampart);
    //   return;
    // }

    // const enemyStructures = creep.room.find(FIND_HOSTILE_STRUCTURES, {
    //   filter: s => s.structureType !== STRUCTURE_RAMPART,
    // });
    // if (enemyStructures.length) {
    //   attack(creep, enemyStructures[0]);
    //   return;
    // }

    // const ramparts = creep.room.find(FIND_HOSTILE_STRUCTURES, { filter: s => s.structureType === STRUCTURE_RAMPART });
    // if (ramparts.length) {
    //   attack(creep, ramparts[0]);
    //   return;
    // }
  },
};

export default customCreepType;
