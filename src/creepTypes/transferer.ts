import { transfer, withdraw } from 'utils/creep';
import {
  MARKET_RAW_RESOURCE_SELL_POINT,
  MAX_TERMINAL_RESOURCE,
  MIN_CONTROLLER_LINK_ENERGY,
  MIN_TERMINAL_ENERGY,
} from 'consts';
import { getSpawn1, getSpawn2, getStorageLink } from 'utils/blueprint';

const transfererCreepType: CreepType = {
  name: CREEP_TYPE.TRANSFERER,
  sectionParts: {
    [CARRY]: 1,
  },
  fixedParts: [MOVE],
  run(creep) {
    const storageLink = getStorageLink(creep.room);
    const storage = creep.room.storage;

    if (!storageLink || !storage || !creep.memory.worker) return;

    const terminal = creep.room.terminal;

    if (!creep.memory.worker?.transferer) {
      creep.memory.worker.transferer = {
        inPos: false,
        task: undefined,
      };
    }

    const linkEnergy = storageLink.store.getUsedCapacity(RESOURCE_ENERGY);
    const creepEnergy = creep.store.getUsedCapacity(RESOURCE_ENERGY);
    const creepCapacity = creep.store.getCapacity(RESOURCE_ENERGY);
    const roomResource = creep.room.memory.state?.mineral?.type;

    const baseSpawn1 = getSpawn1(creep.room);
    const baseSpawn2 = getSpawn2(creep.room);

    // define task
    if (creep.memory.worker && !creep.memory.worker?.transferer?.task) {
      if (linkEnergy >= LINK_CAPACITY - 1) {
        creep.memory.worker.transferer.task = TRANSFERER_TASKS.TRANSFER_LINK;
      } else if (
        baseSpawn1 &&
        baseSpawn1.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
        storage.store.getUsedCapacity(RESOURCE_ENERGY) > 1000
      ) {
        creep.memory.worker.transferer.task = TRANSFERER_TASKS.FILL_SPAWN1;
      } else if (
        baseSpawn2 &&
        baseSpawn2.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
        storage.store.getUsedCapacity(RESOURCE_ENERGY) > 1000
      ) {
        creep.memory.worker.transferer.task = TRANSFERER_TASKS.FILL_SPAWN2;
      } else if (
        terminal &&
        terminal.store.getUsedCapacity(RESOURCE_ENERGY) < MIN_TERMINAL_ENERGY &&
        storage.store.getUsedCapacity(RESOURCE_ENERGY) > 50000
      ) {
        creep.memory.worker.transferer.task = TRANSFERER_TASKS.FILL_TERMINAL_ENERGY;
      } else if (terminal && terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 1.5 * MIN_TERMINAL_ENERGY) {
        creep.memory.worker.transferer.task = TRANSFERER_TASKS.FREE_TERMINAL_ENERGY;
      } else if (terminal && terminal.store.getUsedCapacity(roomResource) > MAX_TERMINAL_RESOURCE) {
        creep.memory.worker.transferer.task = TRANSFERER_TASKS.FREE_TERMINAL_RESOURCE;
      } else if (
        terminal &&
        terminal.store.getUsedCapacity(roomResource) < MARKET_RAW_RESOURCE_SELL_POINT &&
        storage.store.getUsedCapacity(roomResource) > 0
      ) {
        creep.memory.worker.transferer.task = TRANSFERER_TASKS.FILL_TERMINAL_RESOURCE;
      } else {
        creep.memory.worker.transferer.task = TRANSFERER_TASKS.TRANSFER_LINK;
      }
    }

    // execute task
    switch (creep.memory.worker?.transferer.task) {
      case TRANSFERER_TASKS.TRANSFER_LINK: {
        if (linkEnergy < MIN_CONTROLLER_LINK_ENERGY) {
          const neededEnergy = MIN_CONTROLLER_LINK_ENERGY - linkEnergy;
          if (creepEnergy < neededEnergy) {
            withdraw(creep, storage, RESOURCE_ENERGY, Math.min(neededEnergy - creepEnergy, creepCapacity));
          } else {
            transfer(creep, storageLink, RESOURCE_ENERGY, neededEnergy);
            creep.memory.worker.transferer.task = undefined;
          }
        } else if (linkEnergy > MIN_CONTROLLER_LINK_ENERGY) {
          if (creepEnergy === 0) {
            withdraw(
              creep,
              storageLink,
              RESOURCE_ENERGY,
              Math.min(linkEnergy - MIN_CONTROLLER_LINK_ENERGY, creepCapacity),
            );
          } else {
            transfer(creep, storage, RESOURCE_ENERGY);
            creep.memory.worker.transferer.task = undefined;
          }
        } else if (creepEnergy > 0) {
          transfer(creep, storage, RESOURCE_ENERGY);
          creep.memory.worker.transferer.task = undefined;
        }
        break;
      }

      case TRANSFERER_TASKS.FILL_SPAWN1: {
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
          withdraw(creep, storage, RESOURCE_ENERGY);
        } else if (baseSpawn1) {
          transfer(creep, baseSpawn1, RESOURCE_ENERGY);
          creep.memory.worker.transferer.task = undefined;
        }
        break;
      }

      case TRANSFERER_TASKS.FILL_SPAWN2: {
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
          withdraw(creep, storage, RESOURCE_ENERGY);
        } else if (baseSpawn2) {
          transfer(creep, baseSpawn2, RESOURCE_ENERGY);
          creep.memory.worker.transferer.task = undefined;
        }
        break;
      }

      case TRANSFERER_TASKS.FILL_TERMINAL_ENERGY: {
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
          withdraw(creep, storage, RESOURCE_ENERGY);
        } else if (terminal) {
          transfer(creep, terminal, RESOURCE_ENERGY);
          creep.memory.worker.transferer.task = undefined;
        }
        break;
      }

      case TRANSFERER_TASKS.FILL_TERMINAL_RESOURCE: {
        if (roomResource) {
          if (creep.store.getUsedCapacity(roomResource) === 0) {
            withdraw(creep, storage, roomResource);
          } else if (terminal) {
            transfer(creep, terminal, roomResource);
            creep.memory.worker.transferer.task = undefined;
          }
        }
        break;
      }

      case TRANSFERER_TASKS.FREE_TERMINAL_ENERGY: {
        if (terminal && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
          withdraw(creep, terminal, RESOURCE_ENERGY);
        } else {
          transfer(creep, storage, RESOURCE_ENERGY);
          creep.memory.worker.transferer.task = undefined;
        }
        break;
      }

      case TRANSFERER_TASKS.FREE_TERMINAL_RESOURCE: {
        if (roomResource) {
          if (terminal && creep.store.getUsedCapacity(roomResource) === 0) {
            withdraw(creep, terminal, roomResource);
          } else {
            transfer(creep, storage, roomResource);
            creep.memory.worker.transferer.task = undefined;
          }
        }
        break;
      }

      default: {
        if (creep.memory.worker?.transferer) {
          creep.memory.worker.transferer.task = undefined;
        }
        break;
      }
    }
  },
};

export default transfererCreepType;
