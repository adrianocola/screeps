import { getObjectById } from 'utils/game';
import { build, withdraw } from 'utils/creep';
import { getRoom } from 'utils/worker';
import { getMainEnergySource } from 'utils/room';

const builderCreepType: CreepType = {
  name: CREEP_TYPE.BUILDER,
  maxSections: 8,
  sectionParts: {
    [WORK]: 1,
    [CARRY]: 1,
    [MOVE]: 2,
  },
  run(creep) {
    if (creep.memory.worker?.working && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.worker.working = false;
    }
    if (!creep.memory.worker?.working && creep.store.getFreeCapacity() === 0) {
      if (creep.memory.worker) {
        creep.memory.worker.working = true;
      }
    }

    const room = getRoom(creep);
    const queue = room.memory.build?.queue || [];
    let target: ConstructionSite | undefined;
    for (const queueItem of queue) {
      const constructionSite = getObjectById<ConstructionSite>(queueItem.constructionSiteId as Id<ConstructionSite>);
      if (!constructionSite || constructionSite.progressTotal === constructionSite.progress) continue;

      target = constructionSite;
      break;
    }

    if (creep.memory.worker?.working) {
      if (!target) return;

      build(creep, target);
    } else {
      const source = getMainEnergySource(creep.room);
      if (source) {
        withdraw(creep, source, RESOURCE_ENERGY);
      }
    }
  },
};

export default builderCreepType;
