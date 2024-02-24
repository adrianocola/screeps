import spawnSystem from './spawn';
import { getBaseSpawnContainer } from 'utils/blueprint';
import workerUpgrader from 'creepTypes/upgrader';
import upgraderEmergency from 'creepTypes/upgraderEmergency';
import { getLevelRate } from 'utils/controller';
import { CONTROLLER_TICKS_TO_DOWNGRADE_EMERGENCY } from 'consts';

const getDesiredNumberOfUpgraders = (room: Room): number => {
  let levelRate = 0.5;
  let energyAvailable = 0;
  if (room.storage) {
    levelRate = getLevelRate(room);
    energyAvailable = room.storage?.store.getUsedCapacity(RESOURCE_ENERGY) || 0;
  } else if (room.memory.state?.baseSpawnId) {
    const spawnContainer = getBaseSpawnContainer(room);
    energyAvailable = spawnContainer?.store.getUsedCapacity(RESOURCE_ENERGY) || 0;
    levelRate = 0.5;
  }

  const roomLevel = room.controller?.level || 0;
  if (roomLevel === 8) return energyAvailable > 100000 ? 1 : 0;

  if (energyAvailable <= levelRate * 500) return 0;
  if (energyAvailable <= levelRate * 1000) return 1;
  if (energyAvailable <= levelRate * 2000) return 2;
  if (energyAvailable <= levelRate * 4000) return 3;
  if (energyAvailable <= levelRate * 8000) return 4;
  return 5;
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
    if (!room.controller || !room.controller.my || !room.memory.state?.baseSpawnId) return;

    // Make sure to spawn an emergency upgrader if the controller is about to downgrade
    if (!room.controller.upgradeBlocked && room.controller.ticksToDowngrade < CONTROLLER_TICKS_TO_DOWNGRADE_EMERGENCY) {
      spawnSystem.spawn(room, upgraderEmergency.name, upgraderEmergency.name, 1, 2, {
        urgent: true,
        maxSections: 3,
        sectionParts: {
          [WORK]: 1,
          [CARRY]: 1,
          [MOVE]: 2,
        },
        fixedParts: [],
        memory: {
          role: 'worker',
          worker: {
            type: upgraderEmergency.name,
            demandId: upgraderEmergency.name,
            roomName: room.name,
          },
        },
      });
    }

    if (!room.memory.state.features[ROOM_FEATURE.CONTROLLER_HAVE_CONTAINER_OR_LINK]) return;

    const desired = getDesiredNumberOfUpgraders(room);

    if (!desired) {
      spawnSystem.removeSpawn(room, workerUpgrader.name);
      return;
    }

    const roomLevel = room.controller?.level || 0;
    const memoryController = room.memory.state?.controller;

    spawnSystem.spawn(room, workerUpgrader.name, workerUpgrader.name, desired, 140, {
      optimizeForRoads: memoryController?.paved,
      maxSections: roomLevel === 8 ? 5 : 12, // because lvl8 controllers are limited to 15 per tick,
      sectionParts: {
        [WORK]: 3,
        [MOVE]: 1,
      },
      fixedParts: [CARRY, CARRY],
      memory: {
        role: 'worker',
        worker: {
          type: workerUpgrader.name,
          demandId: workerUpgrader.name,
          roomName: room.name,
        },
      },
    });
  },
};

export default systemUpgrade;
