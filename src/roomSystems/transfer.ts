import spawnSystem from './spawn';
import workerTransferer from 'creepTypes/transferer';

const MAX_PARTS_PER_LEVEL: { [index: number]: number } = {
  1: 6,
  2: 6,
  3: 6,
  4: 6,
  5: 6,
  6: 10,
  7: 16,
  8: 16,
};

const systemDistribute: RoomSystem = {
  interval: TICKS.TICK_20,
  name: ROOM_SYSTEMS.TRANSFER,
  requiredFeatures: {
    [ROOM_FEATURE.BASIC]: false,
    [ROOM_FEATURE.CONTROLLED]: true,
    [ROOM_FEATURE.STORAGE]: true,
    [ROOM_FEATURE.STORAGE_HAVE_LINK]: true,
  },
  run(room: Room) {
    const storageData = room.memory.state?.storage;

    const maxSections = MAX_PARTS_PER_LEVEL[room.controller?.level || 1] || 6;

    spawnSystem.spawn(room, workerTransferer.name, workerTransferer.name, 1, {
      urgent: true,
      fixedDir: true,
      maxSections,
      memory: {
        role: 'worker',
        worker: {
          type: workerTransferer.name,
          demandId: workerTransferer.name,
          roomName: room.name,
          source: storageData?.linkId,
        },
      },
    });
  },
};

export default systemDistribute;
