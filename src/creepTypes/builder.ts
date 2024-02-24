import { getObjectById } from 'utils/game';
import { build, withdraw } from 'utils/creep';
import { getRoom } from 'utils/worker';
import { getMainEnergySource } from 'utils/room';

const getFirstConstructionSiteAvailable = (creep: Creep) => {
  const room = getRoom(creep);
  const queue = room.memory.build?.queue || [];
  for (const queueItem of queue) {
    const constructionSite = getObjectById<ConstructionSite>(queueItem.constructionSiteId as Id<ConstructionSite>);
    if (!constructionSite || constructionSite.progressTotal === constructionSite.progress) continue;

    return constructionSite;
  }

  return undefined;
};

const builderCreepType: CreepType = {
  name: CREEP_TYPE.BUILDER,
  maxSections: 8,
  sectionParts: {
    [WORK]: 1,
    [CARRY]: 1,
    [MOVE]: 2,
  },
  run(creep) {
    const target = getFirstConstructionSiteAvailable(creep);
    if (!target) return;

    if (creep.store.getUsedCapacity() === 0) {
      const source = getMainEnergySource(creep.room);
      if (source) {
        withdraw(creep, source, RESOURCE_ENERGY);
      }
    } else {
      build(creep, target);
    }
  },
};

export default builderCreepType;
