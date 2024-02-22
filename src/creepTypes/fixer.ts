import { getObjectById } from 'utils/game';
import { repair, withdraw } from 'utils/creep';
import { getMainEnergySource } from 'utils/room';

const fiexCreepType: CreepType = {
  name: CREEP_TYPE.FIXER,
  maxSections: 2,
  sectionParts: {
    [WORK]: 1,
    [CARRY]: 1,
    [MOVE]: 2,
  },
  run(creep) {
    const source = getMainEnergySource(creep.room);

    if (!source) return;

    if (creep.memory.worker?.working && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.worker.working = false;
    }
    if (!creep.memory.worker?.working && creep.store.getFreeCapacity() === 0) {
      if (creep.memory.worker) {
        creep.memory.worker.working = true;
      }
    }

    if (creep.memory.worker?.working && creep.room.memory.fix?.queue.length) {
      for (const queueItem of creep.room.memory.fix.queue) {
        const structure = getObjectById<Structure>(queueItem.structureId as Id<Structure>);
        if (!structure || structure.hits === structure.hitsMax) continue;

        repair(creep, structure);
        break;
      }
    } else {
      withdraw(creep, source, RESOURCE_ENERGY);
    }
  },
};

export default fiexCreepType;
