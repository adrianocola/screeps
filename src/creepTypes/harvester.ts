import { moveTo } from 'utils/creep';
import { getObjectById } from 'utils/game';
import { getMineralContainer, getSourceLinkOrContainer } from 'utils/blueprint';

const harvesterCreepType: CreepType = {
  name: CREEP_TYPE.HARVESTER,
  sectionParts: {
    [WORK]: 1,
    [MOVE]: 1,
  },
  fixedParts: [CARRY, CARRY],
  run(creep) {
    const resourceHolder = creep.memory.worker?.mineralId
      ? getMineralContainer(creep.room)
      : getSourceLinkOrContainer(creep.room, creep.memory.worker?.sourceIndex);
    const sourceOrMineral = creep.memory.worker?.mineralId
      ? getObjectById(creep.memory.worker?.mineralId)
      : getObjectById(creep.memory.worker?.sourceId);

    if (!sourceOrMineral || !resourceHolder) return;

    if (!creep.pos.isNearTo(sourceOrMineral)) {
      moveTo(creep, sourceOrMineral, { range: 1 });
      return;
    }

    const resource = creep.memory.worker?.resource || RESOURCE_ENERGY;
    const creepUsedCapacity = creep.store.getUsedCapacity();
    const resourceHolderFreeCapacity = resourceHolder.store.getFreeCapacity(resource) ?? 0;
    const resourceHolderHaveSpace = resourceHolderFreeCapacity > 0;
    const canHarvest =
      sourceOrMineral instanceof Source
        ? sourceOrMineral.energy > 0
        : !sourceOrMineral.ticksToRegeneration && sourceOrMineral.mineralAmount > 0;

    if (canHarvest) {
      if (creep.harvest(sourceOrMineral) === OK) {
        // try to transfer energy in the same tick it mined, if already have enough energy stored
        if (creepUsedCapacity && resourceHolderHaveSpace && creepUsedCapacity / creep.store.getCapacity() >= 0.9) {
          creep.transfer(resourceHolder, resource);
        }
      }
    } else if (creepUsedCapacity && resourceHolderHaveSpace) {
      creep.transfer(resourceHolder, resource);
    }
  },
};

export default harvesterCreepType;
