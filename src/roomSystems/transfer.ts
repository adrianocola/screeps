import spawnSystem from './spawn';
import workerTransferer from 'creepTypes/transferer';
import { getSpawn2 } from 'utils/blueprint';

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
    const haveMultipleSpawns = !!getSpawn2(room);
    spawnSystem.spawn(room, workerTransferer.name, workerTransferer.name, 1, 6, {
      essential: true,
      fixedDir: true,
      forRoads: true,
      maxSections: 6,
      sectionParts: {
        [CARRY]: 2,
        [MOVE]: haveMultipleSpawns ? 1 : 0,
      },
      fixedParts: haveMultipleSpawns ? undefined : [MOVE],
      memory: {
        type: workerTransferer.name,
        demandId: workerTransferer.name,
        roomName: room.name,
      },
    });
  },
};

export default systemDistribute;
