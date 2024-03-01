import { getObjectById } from 'utils/game';
import { build, moveTo, repair, transfer, upgradeController } from 'utils/creep';

/**
 * Does a little bit of everything to get the colony started (or in case of emergency)
 */
const basicCreepType: CreepType = {
  name: CREEP_TYPE.BASIC,
  maxSections: 3,
  sectionParts: {
    [WORK]: 1,
    [CARRY]: 1,
    [MOVE]: 2,
  },
  run(creep) {
    creep.notifyWhenAttacked(false);

    const source = getObjectById(creep.memory.sourceId);
    if (!source) return;

    if (creep.pos.isNearTo(source)) {
      if (creep.store.getFreeCapacity() !== 0) {
        creep.harvest(source);
        return;
      }
    } else if (creep.store.getUsedCapacity() === 0) {
      moveTo(creep, source);
      return;
    }

    const room = creep.room;

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
  },
};

export default basicCreepType;
