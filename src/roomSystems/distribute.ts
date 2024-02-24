import spawnSystem from './spawn';
import { getMainEnergySourceId } from 'utils/room';
import workerDistributor from 'creepTypes/distributor';

const MAX_PARTS_PER_LEVEL: { [index: number]: number } = {
  1: 4,
  2: 4,
  3: 8,
  4: 12,
  5: 12,
  6: 12,
  7: 20,
  8: 25,
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
      maxSections,
      memory: {
        role: 'worker',
        worker: {
          type: workerDistributor.name,
          demandId: workerDistributor.name,
          roomName: room.name,
          source: getMainEnergySourceId(room),
        },
      },
    });
  },
};

export default systemDistribute;
