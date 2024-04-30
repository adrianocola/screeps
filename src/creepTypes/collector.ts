import { moveTo, pickup, withdraw } from 'utils/creep';
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

    // if the creep just spawned, check if the previous creep tombstone contains some resources in it and get it
    if (creep.store.getUsedCapacity() === 0 && CREEP_LIFE_TIME - (creep.ticksToLive ?? 0) < 50) {
      const tombstones = creep.room.find(FIND_TOMBSTONES, {
        filter: t => t.store.getUsedCapacity(resource) && t.creep.name.includes(creep.memory.demandId),
      });
      if (tombstones.length) {
        withdraw(creep, tombstones[0], resource);
        return;
      }
    }

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
        moveTo(creep, resourceHolder, { range: 1, ignoreCreeps: true });
      }
    } else if (energyOrMineralContainer.store.getUsedCapacity() >= creep.store.getCapacity()) {
      if (creep.pos.isNearTo(energyOrMineralContainer)) {
        const resourcesAtLocation = creep.room.lookForAt(LOOK_RESOURCES, energyOrMineralContainer);
        const floorQuantity = resourcesAtLocation[0]?.amount || 0;
        if (floorQuantity) {
          pickup(creep, resourcesAtLocation[0]);
        }
        const remainingSpace = creep.store.getFreeCapacity() - floorQuantity;
        if (remainingSpace) {
          withdraw(creep, energyOrMineralContainer, resource, remainingSpace);
        }
      } else {
        moveTo(creep, energyOrMineralContainer, { range: 1, ignoreCreeps: true });
      }
    } else {
      // don't stand on the road (can block other creeps)
      dontStandOnRoads(creep, energyOrMineralContainer);
    }
  },
};

export default collectorCreepType;
