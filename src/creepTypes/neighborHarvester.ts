import { fleeFrom, moveTo, repair } from 'utils/creep';
import { getObjectById } from 'utils/game';
import { moveToRoomWork } from 'utils/worker';
import { findSingleStructureInRange } from 'roomSystems/scan/scanUtils';

const workerNeighborHarvester: CreepType = {
  name: CREEP_TYPE.NEIGHBOR_HARVESTER,
  run(creep) {
    creep.notifyWhenAttacked(false);
    if (moveToRoomWork(creep)) return;

    const source = getObjectById(creep.memory.sourceId as Id<Source>);
    if (!source) return;

    const containerId = creep.room.memory.scan?.sources[source.id]?.sourceContainerId;
    const container =
      getObjectById(containerId as Id<StructureContainer>) ??
      findSingleStructureInRange(source.pos, 1, STRUCTURE_CONTAINER);

    // build container if it doesn't exist
    if (!container) {
      const containerConstructionSites = source.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 1, {
        filter: { structureType: STRUCTURE_CONTAINER },
      });
      if (!containerConstructionSites.length) {
        const exit = source.room.findExitTo(creep.memory.roomName);
        const closestExit = source.pos.findClosestByPath(exit as ExitConstant);
        const exitPath = source.pos.findPathTo(closestExit!, { ignoreCreeps: true, range: 1 });
        const closestPos = exitPath[0];
        const roomPos = new RoomPosition(closestPos.x, closestPos.y, source.room.name);
        source.room.createConstructionSite(roomPos, STRUCTURE_CONTAINER);
        return;
      } else if (creep.store.getUsedCapacity(RESOURCE_ENERGY) / creep.store.getCapacity(RESOURCE_ENERGY) >= 0.75) {
        const constructionSite = containerConstructionSites[0];
        creep.build(constructionSite);
        return;
      }
    } else if (!creep.memory.containerId) {
      delete creep.room.memory.lastRuns[ROOM_SYSTEMS.SCAN];
      creep.memory.containerId = container.id;
    }

    if (
      container &&
      creep.store.getUsedCapacity(RESOURCE_ENERGY) / creep.store.getCapacity(RESOURCE_ENERGY) >= 0.75 &&
      container.hits < container.hitsMax
    ) {
      repair(creep, container);
      return;
    }

    // TODO se for uma sala neutra, só sai de perto do source
    // TODO se for uma sala normal, provavelmente é um invader, corre para a sala original pra se proteger
    const sourceData = creep.room.memory.scan?.sources[source.id];
    if (sourceData?.sourceKeeper) {
      const enemiesNearSource = source.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
      if (enemiesNearSource.length) {
        fleeFrom(creep, enemiesNearSource[0].pos, 5);
        return;
      }
    }

    if (container) {
      if (!creep.pos.isEqualTo(container)) {
        moveTo(creep, container);
        return;
      }
    } else if (!creep.pos.isNearTo(source)) {
      moveTo(creep, source);
      return;
    }

    if (source.energy > 0 && creep.room.controller?.reservation?.username === Memory.username) {
      if (!container || (container && container.store.getFreeCapacity(RESOURCE_ENERGY) > 0)) {
        creep.harvest(source);
      }
    }
  },
};

export default workerNeighborHarvester;
