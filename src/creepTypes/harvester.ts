import { moveTo } from 'utils/creep';
import { getObjectById } from 'utils/game';
import { getMineralContainer, getMineralExtractor, getSourceLinkOrContainer } from 'utils/blueprint';

const harvest = (
  creep: Creep,
  sourceOrMineral: Source | Mineral,
  resourceHolder: StructureContainer | StructureLink,
  canHarvest: boolean,
  canTransfer: boolean,
  resource: ResourceConstant,
) => {
  const creepUsedCapacity = creep.store.getUsedCapacity(resource);

  if (creep.ticksToLive === 1 && creepUsedCapacity > 0) {
    creep.transfer(resourceHolder, resource);
    return;
  }

  const resourceHolderFreeCapacity = resourceHolder.store.getFreeCapacity(resource) ?? 0;
  const resourceHolderHaveSpace = resourceHolderFreeCapacity > 0;

  if (canHarvest) {
    if (creep.harvest(sourceOrMineral) === OK) {
      const harvestPower =
        creep.getActiveBodyparts(WORK) * (resource === RESOURCE_ENERGY ? HARVEST_POWER : HARVEST_MINERAL_POWER);
      // try to transfer energy in the same tick it mined, if already have enough energy stored
      if (
        canTransfer &&
        creepUsedCapacity &&
        resourceHolderHaveSpace &&
        creep.store.getCapacity(resource) - creepUsedCapacity <= harvestPower
      ) {
        creep.transfer(resourceHolder, resource);
      }
    }
  } else if (canTransfer && creepUsedCapacity && resourceHolderHaveSpace) {
    creep.transfer(resourceHolder, resource);
  }
};

const harvestEnergy = (creep: Creep) => {
  const resourceHolder = getSourceLinkOrContainer(creep.room, creep.memory.worker?.sourceIndex);
  const source = getObjectById(creep.memory.worker?.sourceId);

  if (!source || !resourceHolder) return;

  if (!creep.pos.isNearTo(source)) {
    moveTo(creep, source, { range: 1 });
    return;
  }

  const canHarvest = source.energy > 0;
  harvest(creep, source, resourceHolder, canHarvest, true, RESOURCE_ENERGY);
};

const harvestMineral = (creep: Creep) => {
  const resourceHolder = getMineralContainer(creep.room);
  const mineral = getObjectById(creep.memory.worker?.mineralId);
  const extractor = getMineralExtractor(creep.room);

  if (!mineral || !resourceHolder || !extractor) return;

  if (!creep.pos.isNearTo(mineral)) {
    moveTo(creep, mineral, { range: 1 });
    return;
  }

  const resource = creep.memory.worker?.resource || RESOURCE_ENERGY;
  const canHarvest = !mineral.ticksToRegeneration && mineral.mineralAmount > 0 && !extractor.cooldown;
  const canTransfer = extractor.cooldown === 0;

  harvest(creep, mineral, resourceHolder, canHarvest, canTransfer, resource);
};

const harvesterCreepType: CreepType = {
  name: CREEP_TYPE.HARVESTER,
  sectionParts: {
    [WORK]: 1,
    [MOVE]: 1,
  },
  fixedParts: [CARRY, CARRY],
  run(creep) {
    if (!creep.memory.worker) return;

    if (creep.memory.worker?.mineralId) {
      harvestMineral(creep);
    } else {
      harvestEnergy(creep);
    }
  },
};

export default harvesterCreepType;
