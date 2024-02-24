import spawnSystem from './spawn';
import workerTransferer from 'creepTypes/transferer';

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

    spawnSystem.spawn(room, workerTransferer.name, workerTransferer.name, 1, 6, {
      urgent: true,
      fixedDir: true,
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
