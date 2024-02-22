import { attack, moveTo } from 'utils/creep';

const customCreepType: CreepType = {
  name: CREEP_TYPE.CUSTOM,
  run(creep) {
    creep.notifyWhenAttacked(false);

    if (creep.room.name === 'W42S55') {
      // moveTo(creep, { pos: new RoomPosition(0, 20, 'W42S55') });
      moveTo(creep, { pos: new RoomPosition(0, 31, 'W42S55') });
      return;
    }

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

    const ramparts = creep.room.find(FIND_HOSTILE_STRUCTURES, { filter: s => s.structureType === STRUCTURE_RAMPART });
    if (ramparts.length) {
      attack(creep, ramparts[0]);
      return;
    }
  },
};

export default customCreepType;
