import systemSpawn from './spawn';
import { getMainEnergySourceId } from 'utils/room';
import { bodySectionCost } from 'utils/worker';
import workerCollector from 'creepTypes/collector';
import workerHarvester from 'creepTypes/harvester';
import { getObjectById } from 'utils/game';

const collectFromMineral = (
  room: Room,
  roomCreeps: { [index: string]: Creep[] },
  mineralData?: RoomMemoryScanMineral,
) => {
  if (!mineralData) return;
  if (
    mineralData.sourceKeeper ||
    !mineralData.containerId ||
    !mineralData.extractorId ||
    room.terminal?.store.getFreeCapacity() === 0
  )
    return;
  const mineralContainer = getObjectById(mineralData.containerId as Id<StructureContainer>);
  if (!mineralContainer || mineralContainer.store.getUsedCapacity(mineralData.type) < 1500) return;

  const harvesters: Creep[] = roomCreeps[workerHarvester.name] || [];
  const miners = harvesters.filter(c => c.memory.worker?.source === mineralData.mineralId).length;

  const demandId = `${workerCollector.name}-M`;
  if (miners) {
    systemSpawn.spawn(room, demandId, workerCollector.name, 1, 61, {
      maxSections: 6,
      optimizeForRoads: mineralData.paved,
      memory: {
        role: 'worker',
        worker: {
          type: workerCollector.name,
          demandId,
          roomName: room.name,
          source: mineralData.containerId,
          target: room.terminal?.id || room.storage?.id,
          resource: mineralData.type,
        },
      },
    });
  } else {
    systemSpawn.removeSpawn(room, demandId);
  }
};

const systemCollect: RoomSystem = {
  interval: TICKS.TICK_20,
  name: ROOM_SYSTEMS.COLLECT,
  requiredFeatures: {
    [ROOM_FEATURE.BASIC]: false,
    [ROOM_FEATURE.CONTROLLED]: true,
  },
  run(room: Room, roomCreeps) {
    if (!room.memory.state?.baseSpawnId) return;

    // collect from sources
    for (const [, sourceData] of Object.entries(room.memory.state?.sources || {})) {
      if (sourceData.sourceKeeper || !sourceData.sourceContainerId || sourceData.sourceLinkId) continue;

      const distance = sourceData.storageDistance === -1 ? sourceData.spawnDistance : sourceData.storageDistance;

      const sectionCost = bodySectionCost(workerCollector.sectionParts || {}, sourceData.paved);
      const maxSections = Math.min(
        Math.ceil(room.energyCapacityAvailable / sectionCost),
        workerCollector.maxSections || 8,
      );

      const harvesterWorkSectionWeight = workerHarvester.sectionParts ? workerHarvester.sectionParts[WORK] || 1 : 1;
      const harvestedInTime =
        2 *
        distance *
        (HARVEST_POWER * sourceData.harvestersDesired * sourceData.harvestersMaxSections * harvesterWorkSectionWeight);
      const desired = Math.max(1, Math.floor(harvestedInTime / (maxSections * CARRY_CAPACITY)));

      const demandId = `${workerCollector.name}-S${sourceData.index}`;
      systemSpawn.spawn(room, demandId, workerCollector.name, desired, 31, {
        urgent: true,
        optimizeForRoads: sourceData.paved,
        memory: {
          role: 'worker',
          worker: {
            type: workerCollector.name,
            demandId,
            roomName: room.name,
            source: sourceData.sourceContainerId,
            target: getMainEnergySourceId(room),
            resource: RESOURCE_ENERGY,
          },
        },
      });
    }

    collectFromMineral(room, roomCreeps, room.memory.state?.mineral);
  },
};

export default systemCollect;
