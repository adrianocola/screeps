import { moveTo } from 'utils/creep';
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

    if (!creep.pos.isNearTo(source)) {
      moveTo(creep, source, { range: 1 });
      return;
    }

    const resource = creep.memory.worker?.resource || RESOURCE_ENERGY;
    const creepUsedCapacity = creep.store.getUsedCapacity();
    const targetHaveSpace = target.store.getFreeCapacity() > 0;
    const canHarvest =
      source instanceof Source ? source.energy > 0 : !source.ticksToRegeneration && source.mineralAmount > 0;

    if (canHarvest) {
      if (creep.harvest(source) === OK) {
        // try to transfer energy in the same tick it mined, if already have enough energy stored
        if (creepUsedCapacity && targetHaveSpace && creepUsedCapacity / creep.store.getCapacity() >= 0.9) {
          creep.transfer(target, resource);
        }
      }
    } else if (creepUsedCapacity && targetHaveSpace) {
      creep.transfer(target, resource);
    }
  },
};

export default harvesterCreepType;
