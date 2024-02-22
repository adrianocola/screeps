// import spawnSystem from './spawn';
// import workerCustom from 'creepTypes/custom';
import { SIMULATOR_ROOM } from 'consts';

// specific code, to dome some very specific task
const systemCustom: RoomSystem = {
  interval: TICKS.ALWAYS,
  name: ROOM_SYSTEMS.CUSTOM,
  requiredFeatures: {
    [ROOM_FEATURE.BASIC]: false,
  },
  run(room: Room) {
    if (room.name === SIMULATOR_ROOM) return;

    // const constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
    // if (constructionSites.length) return;
    //
    // spawnSystem.spawn(room, 'custom', workerCustom.name, 3, {
    //   maxSections: 10,
    //   sectionParts: {
    //     [ATTACK]: 2,
    //     [MOVE]: 1,
    //   },
    //   memory: {
    //     role: 'worker',
    //     worker: {
    //       type: workerCustom.name,
    //       demandId: 'custom',
    //       roomName: room.name,
    //       workRoomName: 'W43S55',
    //     },
    //   },
    // });
  },
};

export default systemCustom;
