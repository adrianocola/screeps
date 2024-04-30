import { getObjectById } from 'utils/game';
import { build, dismantle, moveTo, repair, transfer, upgradeController, withdraw } from 'utils/creep';
import { moveToRoomWork } from 'utils/worker';
import { CONTROLLER_TICKS_TO_DOWNGRADE_EMERGENCY } from 'consts';

/**
 * Does a little bit of everything to get the colony started (or in case of emergency)
 */
const basicCreepType: CreepType = {
  name: CREEP_TYPE.BASIC,
  maxSections: 4,
  sectionParts: {
    [WORK]: 1,
    [CARRY]: 1,
    [MOVE]: 2,
  },
  run(creep) {
    creep.notifyWhenAttacked(false);

    if (!creep.memory.reached && moveToRoomWork(creep)) return;

    creep.memory.reached = true;
    if (creep.memory.working && creep.store.getUsedCapacity() === 0) {
      creep.memory.working = false;
      delete creep.memory.upgrading;
    } else if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
      creep.memory.working = true;
    }

    const room = Game.rooms[creep.memory.workRoom ?? creep.memory.roomName];
    if (creep.memory.working) {
      if (
        room.controller &&
        !room.controller.upgradeBlocked &&
        (room.controller.ticksToDowngrade < CONTROLLER_TICKS_TO_DOWNGRADE_EMERGENCY || creep.memory.upgrading)
      ) {
        creep.memory.upgrading = true;
        upgradeController(creep, room.controller, 2);
        return;
      }

      const spawnsOrExtensions = room.find(FIND_MY_STRUCTURES, {
        filter: structure => {
          return (
            (structure.structureType === STRUCTURE_SPAWN || structure.structureType === STRUCTURE_EXTENSION) &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
          );
        },
      });
      if (spawnsOrExtensions.length) {
        transfer(creep, spawnsOrExtensions[0], RESOURCE_ENERGY);
        return;
      }

      const towers = room.find<StructureTower>(FIND_MY_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_TOWER,
      });
      if (towers.length) {
        for (const tower of towers) {
          if (tower.store.getFreeCapacity(RESOURCE_ENERGY) >= 300) {
            transfer(creep, tower, RESOURCE_ENERGY);
            return;
          }
        }
      } else {
        const structuresToRepair = room.find(FIND_MY_STRUCTURES, {
          filter: structure => {
            return structure.hitsMax - structure.hits > 1000 && structure.hits < 5000;
          },
        });
        if (structuresToRepair.length) {
          repair(creep, structuresToRepair[0]);
          return;
        }
      }

      const queue = room.memory.build?.queue || [];
      for (const queueItem of queue) {
        const constructionSite = getObjectById<ConstructionSite>(queueItem.constructionSiteId as Id<ConstructionSite>);
        if (!constructionSite || constructionSite.progressTotal === constructionSite.progress) continue;

        build(creep, constructionSite);
        return;
      }

      const constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
      if (constructionSites.length) {
        build(creep, constructionSites[0]);
        return;
      }

      if (room.controller && !room.controller.upgradeBlocked) {
        // try to keep as close as possible to the controller, to avoid upgrading without leaving a source (others might need it)
        upgradeController(creep, room.controller, 2);
      }
    } else {
      // try to get energy from hostile structures (in them or dismantling them)
      const hostileStructures = room.find(FIND_HOSTILE_STRUCTURES);
      if (hostileStructures && creep.store.getFreeCapacity() !== 0) {
        const hostileStructureWithEnergy = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
          filter: structure => {
            const storeStructure = structure as AnyStoreStructure;
            if (!storeStructure.store) return false;
            return !!storeStructure.store.getUsedCapacity(RESOURCE_ENERGY);
          },
        });
        if (hostileStructureWithEnergy) {
          withdraw(creep, hostileStructureWithEnergy as AnyStoreStructure, RESOURCE_ENERGY);
          return;
        }

        const hostileStructure = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
          filter: structure => 'store' in structure,
        });
        if (hostileStructure) {
          dismantle(creep, hostileStructure);
          return;
        }
      }

      const source = getObjectById(creep.memory.sourceId);
      if (!source) return;

      if (creep.store.getFreeCapacity() !== 0) {
        if (creep.pos.isNearTo(source)) {
          if (source.energy) creep.harvest(source);
          return;
        } else {
          moveTo(creep, source, { reusePath: 6 });
          return;
        }
      }
    }
  },
};

export default basicCreepType;
