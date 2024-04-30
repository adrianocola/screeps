import spawnSystem from './spawn';
import workerDistributor from 'creepTypes/distributor';

const MAX_PARTS_PER_LEVEL: { [index: number]: number } = {
  1: 2,
  2: 2,
  3: 5,
  4: 6,
  5: 6,
  6: 6,
  7: 9,
  8: 12,
};

const systemDistribute: RoomSystem = {
  interval: TICKS.TICK_20,
  name: ROOM_SYSTEMS.DISTRIBUTE,
  requiredFeatures: {
    [ROOM_FEATURE.CONTROLLED]: true,
    [ROOM_FEATURE.SPAWN_HAVE_CONTAINER]: true,
  },
  run(room: Room) {
    if (!room.memory.scan?.baseSpawnId) return;

    const level = room.controller?.level || 1;
    const maxSections = MAX_PARTS_PER_LEVEL[level];
    let quantity = 1;

    // if don't have link and controller is far away from storage, spawn 2
    if (
      !room.memory.scan?.features?.[ROOM_FEATURE.STORAGE_HAVE_LINK] &&
      !room.memory.scan?.features?.[ROOM_FEATURE.BASIC]
    ) {
      if ((room.memory.scan?.controller?.storageDistance || 0) > 20) {
        quantity = 2;
      }
    }

    spawnSystem.spawn(room, workerDistributor.name, workerDistributor.name, quantity, 7, {
      essential: true,
      sectionParts: {
        [CARRY]: 2,
        [MOVE]: 2, // better to have MOVE as multiple of 2 because of road calculations
      },
      maxSections,
      forRoads: true,
      memory: {
        type: workerDistributor.name,
        demandId: workerDistributor.name,
        roomName: room.name,
      },
    });
  },
};

export default systemDistribute;
