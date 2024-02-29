import spawnSystem from './spawn';
import workerDistributor from 'creepTypes/distributor';

const MAX_PARTS_PER_LEVEL: { [index: number]: number } = {
  1: 2,
  2: 2,
  3: 4,
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
    [ROOM_FEATURE.BASIC]: false,
    [ROOM_FEATURE.CONTROLLED]: true,
    [ROOM_FEATURE.SPAWN_HAVE_CONTAINER]: true,
  },
  run(room: Room) {
    if (!room.memory.state?.baseSpawnId) return;

    const level = room.controller?.level || 1;
    const maxSections = MAX_PARTS_PER_LEVEL[level];

    spawnSystem.spawn(room, workerDistributor.name, workerDistributor.name, 1, 7, {
      urgent: true,
      sectionParts: {
        [CARRY]: 2,
        [MOVE]: 2, // better to have MOVE as multiple of 2 because of road calculations
      },
      maxSections,
      optimizeForRoads: true,
      memory: {
        role: 'worker',
        worker: {
          type: workerDistributor.name,
          demandId: workerDistributor.name,
          roomName: room.name,
        },
      },
    });
  },
};

export default systemDistribute;
