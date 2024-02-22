import { harvest, transfer } from 'utils/creep';
import { getSource, getTarget } from 'utils/worker';

// 3000 / 300 / 2 = 5
const WORK_PARTS_HARVEST_SINGLE_SOURCE = Math.ceil(SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME / HARVEST_POWER);

const harvesterCreepType: CreepType = {
  name: CREEP_TYPE.HARVESTER,
  sectionParts: {
    [WORK]: 1,
    [MOVE]: 1,
  },
  fixedParts: [CARRY, CARRY],
  maxSections: WORK_PARTS_HARVEST_SINGLE_SOURCE + 1,
  run(creep) {
    const source = getSource(creep) as Source | Mineral;
    const target = getTarget(creep) as StructureContainer;

    if (!source || !target) return;

    if (!creep.memory.worker?.working && creep.store.getUsedCapacity() === 0) {
      if (creep.memory.worker) {
        creep.memory.worker.working = true;
      }
    }
    if (creep.memory.worker?.working && creep.store.getFreeCapacity() === 0) {
      creep.memory.worker.working = false;
    }

    const resource = creep.memory.worker?.resource || RESOURCE_ENERGY;
    if (creep.memory.worker?.working) {
      const targetHaveSpace = target.store.getFreeCapacity(resource) > 0;

      let canHarvest = false;
      if (source instanceof Source) canHarvest = source.energy > 0;
      else if (source instanceof Mineral) canHarvest = !source.ticksToRegeneration && source.mineralAmount > 0;

      const creepUsedCapacity = creep.store.getUsedCapacity(resource);
      if (canHarvest) {
        if (harvest(creep, source) === OK) {
          if (creepUsedCapacity && targetHaveSpace && creepUsedCapacity / creep.store.getCapacity() >= 0.9) {
            creep.transfer(target, resource); // try to transfer energy, if possible
          }
        }
      } else if (creepUsedCapacity && targetHaveSpace) {
        creep.transfer(target, resource);
      }
    } else {
      transfer(creep, target, resource);
    }

    return;
  },
};

export default harvesterCreepType;
