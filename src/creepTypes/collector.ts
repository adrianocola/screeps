import { moveTo, withdraw } from 'utils/creep';
import { getMainResourceHolder } from 'utils/room';
import { getMineralContainer, getSourceContainer } from 'utils/blueprint';
import { dontStandOnRoads } from 'utils/worker';

const collectorCreepType: CreepType = {
  name: CREEP_TYPE.COLLECTOR,
  maxSections: 5,
  sectionParts: {
    [CARRY]: 2,
    [MOVE]: 2,
  },
  run(creep) {
    const resource = creep.memory.resource || RESOURCE_ENERGY;
    const energyOrMineralContainer =
      resource === RESOURCE_ENERGY
        ? getSourceContainer(creep.room, creep.memory.sourceIndex)
        : getMineralContainer(creep.room);

    const resourceHolder =
      resource === RESOURCE_ENERGY ? getMainResourceHolder(creep.room) : creep.room.terminal || creep.room.storage;

    if (!energyOrMineralContainer || !resourceHolder) return;

    if (!creep.pos.isNearTo(energyOrMineralContainer) && creep.store.getUsedCapacity() === 0) {
      moveTo(creep, energyOrMineralContainer, { range: 1 });
    } else if (creep.store.getUsedCapacity()) {
      if (creep.pos.isNearTo(resourceHolder)) {
        if (resourceHolder.store.getFreeCapacity() > 0) {
          creep.transfer(resourceHolder, resource);
        } else {
          dontStandOnRoads(creep, resourceHolder);
        }
      } else {
        moveTo(creep, resourceHolder, { range: 1 });
      }
    } else if (energyOrMineralContainer.store.getUsedCapacity() >= creep.store.getCapacity()) {
      withdraw(creep, energyOrMineralContainer, resource);
    } else {
      // don't stand on the road (can block other creeps)
      dontStandOnRoads(creep, energyOrMineralContainer);
    }
  },
};

export default collectorCreepType;
