import { forEach, size } from 'lodash';
import { harvest, moveTo, transfer } from 'utils/creep';
import { getObjectById } from 'utils/game';

const getInitialSourceIndex = (room: Room): number => {
  let bestSource: Source | undefined;
  let bestSourceIndex: number | undefined;
  for (const sourceId in room.memory.state?.sources) {
    const sourceData = room.memory.state?.sources[sourceId];
    const source = getObjectById(sourceId as Id<Source>);
    if (source) {
      if (source.energy === source.energyCapacity) {
        bestSource = source;
        bestSourceIndex = sourceData?.index;
        break;
      } else if (bestSource) {
        if (source.ticksToRegeneration < bestSource.ticksToRegeneration) {
          bestSource = source;
          bestSourceIndex = sourceData?.index;
        }
      } else {
        bestSource = source;
        bestSourceIndex = sourceData?.index;
      }
    }
  }
  return bestSourceIndex || 0;
};

const harvesterWalkerCreepType: CreepType = {
  name: CREEP_TYPE.HARVESTER_WALKER,
  sectionParts: {
    [WORK]: 4,
    [MOVE]: 5,
    [CARRY]: 1,
  },
  maxSections: 5,
  run(creep) {
    if (!creep.memory.worker) return;

    if (!creep.memory.worker?.harvesterWalker) {
      creep.memory.worker.harvesterWalker = {
        sourceIndex: getInitialSourceIndex(creep.room),
        harvested: false,
      };
    }

    let sourceId: string | undefined;
    let sourceData: RoomMemoryScanSource | undefined;
    forEach(creep.room.memory.state?.sources, (sourceD, id) => {
      if (sourceD.index === creep.memory.worker?.harvesterWalker?.sourceIndex) {
        sourceId = id;
        sourceData = sourceD;
        return false;
      }
      return true;
    });

    if (!sourceId || !sourceData) return;

    const source = getObjectById(sourceId as Id<Source>);
    let target;
    if (sourceData.sourceLinkId) {
      target = getObjectById(sourceData.sourceLinkId);
    } else if (sourceData.sourceContainerId) {
      target = getObjectById(sourceData.sourceContainerId);
    }

    if (!source || !target) return;

    if (!creep.memory.worker?.working && creep.store.getUsedCapacity() === 0) {
      if (creep.memory.worker) {
        creep.memory.worker.working = true;
      }
    }
    if (creep.memory.worker?.working && creep.store.getFreeCapacity() === 0) {
      creep.memory.worker.working = false;
    }

    if (creep.memory.worker?.working) {
      const targetHaveSpace = target.store.getFreeCapacity(RESOURCE_ENERGY) > 0;

      const creepUsedCapacity = creep.store.getUsedCapacity(RESOURCE_ENERGY);
      if (targetHaveSpace) {
        if (source.energy > 0) {
          if (harvest(creep, source) === OK) {
            creep.memory.worker.harvesterWalker.harvested = true;
            if (creepUsedCapacity && targetHaveSpace && creepUsedCapacity / creep.store.getCapacity() >= 0.75) {
              transfer(creep, target, RESOURCE_ENERGY); // try to transfer energy, if possible
            }
          }
        } else if (creepUsedCapacity) {
          transfer(creep, target, RESOURCE_ENERGY);
        } else {
          moveTo(creep, source);
        }
      }
    } else {
      transfer(creep, target, RESOURCE_ENERGY);
    }

    if (source.energy === 0 && creep.memory.worker.harvesterWalker?.harvested) {
      creep.memory.worker.harvesterWalker = {
        sourceIndex: (creep.memory.worker.harvesterWalker.sourceIndex + 1) % size(creep.room.memory.state?.sources),
        harvested: false,
      };
    }

    return;
  },
};

export default harvesterWalkerCreepType;
