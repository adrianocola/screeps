import spawnSystem from './spawn';
import { getBaseSpawnContainer } from 'utils/blueprint';
import workerUpgrader from 'creepTypes/upgrader';
import upgraderEmergency from 'creepTypes/upgraderEmergency';
import { getLevelRate } from 'utils/controller';
import { CONTROLLER_TICKS_TO_DOWNGRADE_EMERGENCY } from 'consts';

const MAX_WORK_PARTS_LVL8 = 15;
const WORK_PARTS_WEIGHT = 3;

const getDesiredNumberOfUpgraders = (room: Room): number => {
  let levelRate = 0.5;
  let energyAvailable = 0;
  if (room.storage) {
    levelRate = getLevelRate(room);
    energyAvailable = room.storage?.store.getUsedCapacity(RESOURCE_ENERGY) || 0;
  } else if (room.memory.scan?.baseSpawnId) {
    const spawnContainer = getBaseSpawnContainer(room);
    energyAvailable = spawnContainer?.store.getUsedCapacity(RESOURCE_ENERGY) || 0;
    levelRate = 0.5;
  }

  const roomLevel = room.controller?.level || 0;
  if (roomLevel === 8) return energyAvailable > 100000 ? 1 : 0;

  if (energyAvailable <= levelRate * 500) return 0;
  if (energyAvailable <= levelRate * 1000) return 1;
  if (energyAvailable <= levelRate * 2000) return 2;
  return 3;
};

const systemUpgrade: RoomSystem = {
  interval: TICKS.TICK_10,
  name: ROOM_SYSTEMS.UPGRADE,
  requiredFeatures: {
    [ROOM_FEATURE.BASIC]: false,
    [ROOM_FEATURE.CONTROLLED]: true,
    [ROOM_FEATURE.SPAWN_HAVE_CONTAINER]: true,
  },
  run(room: Room) {
    if (!room.controller || !room.controller.my || !room.memory.scan?.baseSpawnId) return;

    const memoryController = room.memory.scan?.controller;

    // Make sure to spawn an emergency upgrader if the controller is about to downgrade
    if (!room.controller.upgradeBlocked && room.controller.ticksToDowngrade < CONTROLLER_TICKS_TO_DOWNGRADE_EMERGENCY) {
      spawnSystem.spawn(room, upgraderEmergency.name, upgraderEmergency.name, 1, 2, {
        essential: true,
        forRoads: memoryController?.paved,
        maxSections: 2,
        sectionParts: {
          [WORK]: 1,
          [CARRY]: 1,
          [MOVE]: 2,
        },
        memory: {
          type: upgraderEmergency.name,
          demandId: upgraderEmergency.name,
          roomName: room.name,
        },
      });
    }

    if (!room.memory.scan.features?.[ROOM_FEATURE.CONTROLLER_HAVE_CONTAINER_OR_LINK]) return;
    // don't upgrade if expanding (to save some energy)
    if (room.memory.scan.features?.[ROOM_FEATURE.EXPANDING_FROM]) return;
    // don't upgrade if building
    if (room.memory.build?.queue.length) return;

    const desired = getDesiredNumberOfUpgraders(room);

    if (!desired) {
      spawnSystem.removeSpawn(room, workerUpgrader.name);
      return;
    }

    const roomLevel = room.controller?.level || 0;

    spawnSystem.spawn(room, workerUpgrader.name, workerUpgrader.name, desired, 140, {
      forRoads: memoryController?.paved,
      maxSections: roomLevel === 8 ? Math.ceil(MAX_WORK_PARTS_LVL8 / WORK_PARTS_WEIGHT) : 10, // because lvl8 controllers are limited to 15 per tick,
      sectionParts: {
        [WORK]: WORK_PARTS_WEIGHT,
        [MOVE]: 2,
      },
      fixedParts: [CARRY, CARRY, CARRY, CARRY],
      memory: {
        type: workerUpgrader.name,
        demandId: workerUpgrader.name,
        roomName: room.name,
      },
    });
  },
};

export default systemUpgrade;
