import { transfer, withdraw } from 'utils/creep';
import {
  MARKET_RAW_RESOURCE_SELL_POINT,
  MAX_TERMINAL_RESOURCE,
  MIN_CONTROLLER_LINK_ENERGY,
  MIN_TERMINAL_ENERGY,
  MIN_TOWERS_LINK_ENERGY,
  TOWER_RESERVED_ENERGY,
} from 'consts';
import { getBaseTower, getControllerLink, getSpawn1, getSpawn2, getStorageLink, getTowersLink } from 'utils/blueprint';

const transfererCreepType: CreepType = {
  name: CREEP_TYPE.TRANSFERER,
  run(creep) {
    const storageLink = getStorageLink(creep.room);
    const storage = creep.room.storage;

    if (!storageLink || !storage) return;

    const terminal = creep.room.terminal;

    const linkEnergy = storageLink.store.getUsedCapacity(RESOURCE_ENERGY);
    const storageUsedEnergy = storage.store.getUsedCapacity(RESOURCE_ENERGY);
    const roomResource = creep.room.memory.scan?.mineral?.type;

    const baseSpawn1 = getSpawn1(creep.room);
    const baseSpawn2 = getSpawn2(creep.room);
    const baseTower = getBaseTower(creep.room);
    const controllerLink = getControllerLink(creep.room);
    const towersLink = getTowersLink(creep.room);

    const havePlentyEnergy = storageUsedEnergy > 1000;

    // define task
    if (!creep.memory.task) {
      if (havePlentyEnergy && baseSpawn1 && baseSpawn1.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        creep.memory.task = TRANSFERER_TASKS.FILL_SPAWN1;
      } else if (
        havePlentyEnergy &&
        baseTower &&
        baseTower.store.getUsedCapacity(RESOURCE_ENERGY) <= TOWER_RESERVED_ENERGY
      ) {
        creep.memory.task = TRANSFERER_TASKS.FILL_TOWER1;
      } else if (havePlentyEnergy && baseSpawn2 && baseSpawn2.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        creep.memory.task = TRANSFERER_TASKS.FILL_SPAWN2;
      } else if (
        havePlentyEnergy &&
        towersLink &&
        towersLink.store.getUsedCapacity(RESOURCE_ENERGY) < MIN_TOWERS_LINK_ENERGY
      ) {
        creep.memory.task = TRANSFERER_TASKS.TRANSFER_LINK_TOWERS;
      } else if (
        havePlentyEnergy &&
        controllerLink &&
        controllerLink.store.getUsedCapacity(RESOURCE_ENERGY) < MIN_CONTROLLER_LINK_ENERGY
      ) {
        creep.memory.task = TRANSFERER_TASKS.TRANSFER_LINK_CONTROLLER;
      } else if (linkEnergy / LINK_CAPACITY >= 0.75) {
        creep.memory.task = TRANSFERER_TASKS.WITHDRAW_LINK;
      } else if (
        terminal &&
        terminal.store.getUsedCapacity(RESOURCE_ENERGY) < MIN_TERMINAL_ENERGY &&
        storageUsedEnergy > 50000
      ) {
        creep.memory.task = TRANSFERER_TASKS.FILL_TERMINAL_ENERGY;
      } else if (terminal && terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 1.5 * MIN_TERMINAL_ENERGY) {
        creep.memory.task = TRANSFERER_TASKS.FREE_TERMINAL_ENERGY;
      } else if (roomResource && terminal && terminal.store.getUsedCapacity(roomResource) > MAX_TERMINAL_RESOURCE) {
        creep.memory.task = TRANSFERER_TASKS.FREE_TERMINAL_RESOURCE;
      } else if (
        roomResource &&
        terminal &&
        storage.store.getUsedCapacity(roomResource) > 0 &&
        terminal.store.getUsedCapacity(roomResource) < MARKET_RAW_RESOURCE_SELL_POINT &&
        storageUsedEnergy > 0
      ) {
        creep.memory.task = TRANSFERER_TASKS.FILL_TERMINAL_RESOURCE;
      } else {
        creep.memory.task = TRANSFERER_TASKS.WITHDRAW_LINK;
      }
    }

    // execute task
    switch (creep.memory.task) {
      case TRANSFERER_TASKS.WITHDRAW_LINK: {
        if (
          creep.store.getFreeCapacity(RESOURCE_ENERGY) !== 0 &&
          storageLink.store.getUsedCapacity(RESOURCE_ENERGY) > 0
        ) {
          withdraw(creep, storageLink, RESOURCE_ENERGY);
        } else {
          transfer(creep, storage, RESOURCE_ENERGY);
          creep.memory.task = undefined;
        }
        break;
      }

      case TRANSFERER_TASKS.TRANSFER_LINK_TOWERS: {
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) !== 0) {
          withdraw(creep, storage, RESOURCE_ENERGY);
        } else {
          transfer(creep, storageLink, RESOURCE_ENERGY);
          creep.memory.task = TRANSFERER_TASKS.WAIT;
        }
        break;
      }

      case TRANSFERER_TASKS.TRANSFER_LINK_CONTROLLER: {
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) !== 0) {
          withdraw(creep, storage, RESOURCE_ENERGY);
        } else {
          transfer(creep, storageLink, RESOURCE_ENERGY);
          creep.memory.task = TRANSFERER_TASKS.WAIT;
        }
        break;
      }

      case TRANSFERER_TASKS.FILL_TOWER1: {
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
          withdraw(creep, storage, RESOURCE_ENERGY);
        } else if (baseTower) {
          transfer(creep, baseTower, RESOURCE_ENERGY);
          creep.memory.task = undefined;
        }
        break;
      }

      case TRANSFERER_TASKS.FILL_SPAWN1: {
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) !== 0) {
          withdraw(creep, storage, RESOURCE_ENERGY);
        } else if (baseSpawn1) {
          transfer(creep, baseSpawn1, RESOURCE_ENERGY);
          creep.memory.task = undefined;
        }
        break;
      }

      case TRANSFERER_TASKS.FILL_SPAWN2: {
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) !== 0) {
          withdraw(creep, storage, RESOURCE_ENERGY);
        } else if (baseSpawn2) {
          transfer(creep, baseSpawn2, RESOURCE_ENERGY);
          creep.memory.task = undefined;
        }
        break;
      }

      case TRANSFERER_TASKS.FILL_TERMINAL_ENERGY: {
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) !== 0) {
          withdraw(creep, storage, RESOURCE_ENERGY);
        } else if (terminal) {
          transfer(creep, terminal, RESOURCE_ENERGY);
          creep.memory.task = undefined;
        }
        break;
      }

      case TRANSFERER_TASKS.FILL_TERMINAL_RESOURCE: {
        if (roomResource) {
          if (creep.store.getUsedCapacity(roomResource) === 0) {
            withdraw(creep, storage, roomResource);
          } else if (terminal) {
            transfer(creep, terminal, roomResource);
            creep.memory.task = undefined;
          }
        }
        break;
      }

      case TRANSFERER_TASKS.FREE_TERMINAL_ENERGY: {
        if (terminal && creep.store.getFreeCapacity(RESOURCE_ENERGY) !== 0) {
          withdraw(creep, terminal, RESOURCE_ENERGY);
        } else {
          transfer(creep, storage, RESOURCE_ENERGY);
          creep.memory.task = undefined;
        }
        break;
      }

      case TRANSFERER_TASKS.FREE_TERMINAL_RESOURCE: {
        if (roomResource) {
          if (terminal && creep.store.getFreeCapacity(RESOURCE_ENERGY) !== 0) {
            withdraw(creep, terminal, roomResource);
          } else {
            transfer(creep, storage, roomResource);
            creep.memory.task = undefined;
          }
        }
        break;
      }

      case TRANSFERER_TASKS.WAIT: {
        creep.memory.task = undefined;
        break;
      }

      default: {
        if (creep.memory.task) {
          creep.memory.task = undefined;
        }
        break;
      }
    }
  },
};

export default transfererCreepType;
