import { pickup, recycle, withdraw } from 'utils/creep';
import { getMainResourceHolder, removeSpawn } from 'utils/room';
import { transferAllResources } from 'utils/worker';

const scavengerCreepType: CreepType = {
  name: CREEP_TYPE.SCAVENGER,
  run(creep) {
    const mainResourceHolder = getMainResourceHolder(creep.room);
    if (!mainResourceHolder) return;

    // if already full or near to mainResourceHolder, transfer all resources to mainResourceHolder
    if (
      creep.store.getFreeCapacity() === 0 ||
      (creep.store.getFreeCapacity() !== 0 && creep.pos.isNearTo(mainResourceHolder))
    ) {
      if (transferAllResources(creep, mainResourceHolder)) return;
    }

    const tombstones = creep.room.find(FIND_TOMBSTONES);
    for (const tombstone of tombstones) {
      const resources = Object.keys(tombstone.store);
      for (const resource of resources) {
        if (resource !== RESOURCE_ENERGY && tombstone.store[resource as ResourceConstant] > 0) {
          withdraw(creep, tombstone, resource as ResourceConstant);
          return;
        }
      }
      if (tombstone.store[RESOURCE_ENERGY] > 0) {
        withdraw(creep, tombstone, RESOURCE_ENERGY);
        return;
      }
    }

    const droppedResources = creep.room.find(FIND_DROPPED_RESOURCES);
    for (const resource of droppedResources) {
      if (resource.resourceType !== RESOURCE_ENERGY) {
        pickup(creep, resource);
        return;
      }
    }
    const resourceEnergy = droppedResources[0];
    if (resourceEnergy) {
      pickup(creep, resourceEnergy);
      return;
    }

    // if there is no resources to pickup, transfer all resources to mainResourceHolder
    if (creep.store.getUsedCapacity() > 0) {
      if (transferAllResources(creep, mainResourceHolder)) return;
    }

    recycle(creep);
    removeSpawn(creep.room, creep.memory.demandId);
  },
};

export default scavengerCreepType;
