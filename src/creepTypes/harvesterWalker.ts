import { harvest, moveTo, transfer } from 'utils/creep';
import { getObjectById } from 'utils/game';
import { getSourceLinkOrContainer } from 'utils/blueprint';

const getInitialSourceIndex = (room: Room): number => {
  let bestSource: Source | undefined;
  let bestSourceIndex: number | undefined;
  for (const sourceId in room.memory.scan?.sources) {
    const sourceData = room.memory.scan?.sources[sourceId];
    const source = getObjectById(sourceId as Id<Source>);
    if (source) {
      if (source.energy === source.energyCapacity) {
        return sourceData.index;
      }

      if (bestSource) {
        if (source.ticksToRegeneration < bestSource.ticksToRegeneration) {
          bestSource = source;
          bestSourceIndex = sourceData.index;
        }
      } else {
        bestSource = source;
        bestSourceIndex = sourceData.index;
      }
    }
  }
  return bestSourceIndex ?? 0;
};

const harvesterWalkerCreepType: CreepType = {
  name: CREEP_TYPE.HARVESTER_WALKER,
  run(creep) {
    if (!creep.room.memory.scan?.sources) return;

    if (creep.memory.sourceIndex === undefined) {
      creep.memory.sourceIndex = getInitialSourceIndex(creep.room);
    }

    let sourceId: string | undefined;
    let sourceData: RoomMemoryScanSource | undefined;
    let sourceIndex: number | undefined;
    const sources = creep.room.memory.scan.sources;

    for (const sId in sources) {
      const sourceD = sources[sId];
      if (sourceD.index === creep.memory.sourceIndex) {
        sourceId = sId;
        sourceData = sourceD;
        sourceIndex = sourceD.index;
        break;
      }
    }

    if (!sourceId || !sourceData || sourceIndex === undefined) return;

    const source = getObjectById(sourceId as Id<Source>);
    const sourceStorage = getSourceLinkOrContainer(creep.room, sourceData.index);

    if (!source || !sourceStorage) return;

    const targetHaveSpace = sourceStorage.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
    const creepUsedCapacity = creep.store.getUsedCapacity(RESOURCE_ENERGY);

    if (!creep.pos.isNearTo(source.pos)) {
      moveTo(creep, source.pos, { range: 1 });
    } else if (source.energy > 0) {
      if (harvest(creep, source) === OK) {
        creep.memory.harvested = true;
        const harvestPower = creep.getActiveBodyparts(WORK) * HARVEST_POWER;
        if (creepUsedCapacity && targetHaveSpace && creep.store.getCapacity() - creepUsedCapacity <= harvestPower) {
          transfer(creep, sourceStorage, RESOURCE_ENERGY); // try to transfer energy, if possible
        }
      }
    } else if (creepUsedCapacity && targetHaveSpace) {
      transfer(creep, sourceStorage, RESOURCE_ENERGY);
    } else if (creep.memory.harvested) {
      creep.memory.sourceIndex = (sourceIndex + 1) % Object.keys(sources).length;
      creep.memory.harvested = false;
    }

    return;
  },
};

export default harvesterWalkerCreepType;
