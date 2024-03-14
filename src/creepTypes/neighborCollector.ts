import { getObjectById } from 'utils/game';
import { moveTo, withdraw } from 'utils/creep';
import { dontStandOnRoads, moveToRoomWork } from 'utils/worker';
import { getMainResourceHolder } from 'utils/room';

const workerNeighborCollector: CreepType = {
  name: CREEP_TYPE.NEIGHBOR_COLLECTOR,
  run(creep) {
    creep.notifyWhenAttacked(false);

    const originalRoom = Game.rooms[creep.memory.roomName];
    const resourceHolder = getMainResourceHolder(originalRoom);

    if (!resourceHolder) return;

    if (creep.store.getUsedCapacity() === 0) {
      // if the creep just spawned, check if the previous creep tombstone contains some resources in it and get it
      if (CREEP_LIFE_TIME - (creep.ticksToLive ?? 0) < 100) {
        const tombstones = creep.room.find(FIND_TOMBSTONES, {
          filter: t => t.store.getUsedCapacity(RESOURCE_ENERGY) && t.creep.name.includes(creep.memory.demandId),
        });
        if (tombstones.length) {
          withdraw(creep, tombstones[0], RESOURCE_ENERGY);
          return;
        }
      }

      const sourceContainer = getObjectById(creep.memory.containerId);
      if (sourceContainer) {
        if (creep.pos.isNearTo(sourceContainer)) {
          if (sourceContainer.store.getUsedCapacity(RESOURCE_ENERGY) >= creep.store.getCapacity()) {
            withdraw(creep, sourceContainer, RESOURCE_ENERGY);
          }
        } else {
          moveTo(creep, sourceContainer, { range: 1 });
        }
      } else {
        moveToRoomWork(creep);
      }
    } else {
      if (creep.pos.isNearTo(resourceHolder)) {
        if (resourceHolder.store.getFreeCapacity() > 0) {
          creep.transfer(resourceHolder, RESOURCE_ENERGY);
        } else {
          dontStandOnRoads(creep, resourceHolder);
        }
      } else {
        moveTo(creep, resourceHolder, { range: 1 });
      }
    }
  },
};

export default workerNeighborCollector;
