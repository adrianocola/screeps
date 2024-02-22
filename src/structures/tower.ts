import { getObjectById } from 'utils/game';

const TOWER_RESERVED_ENERGY = 500; // energy reserved to attack/heal

const structureTower: SystemStructure<StructureTower> = {
  structureType: STRUCTURE_TOWER,
  run(tower) {
    const defenseQueue = tower.room.memory.defense?.queue;
    const healQueue = tower.room.memory.heal?.queue;
    const fixQueue = tower.room.memory.fix?.queue;

    if (defenseQueue && defenseQueue.length > 0) {
      for (const hostileId of defenseQueue) {
        const hostile = getObjectById(hostileId as Id<Creep>);
        if (hostile) {
          tower.attack(hostile);
          return;
        }
      }
    }
    if (healQueue && healQueue.length > 0) {
      for (const creepId of healQueue) {
        const creep = getObjectById(creepId as Id<Creep>);
        if (creep && creep.hitsMax !== creep.hits) {
          tower.heal(creep);
          return;
        }
      }
    }
    if (fixQueue && fixQueue.length && tower.store.getUsedCapacity(RESOURCE_ENERGY) > TOWER_RESERVED_ENERGY) {
      for (const fixQueueItem of fixQueue) {
        const structure = getObjectById<Structure>(fixQueueItem.structureId as Id<Structure>);
        if (structure && structure.hits !== structure.hitsMax) {
          tower.repair(structure);
          return;
        }
      }
    }
  },
};

export default structureTower;
