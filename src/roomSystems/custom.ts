import spawnSystem from './spawn';
import workerCustom from 'creepTypes/custom';

// specific code, to dome some very specific task
const systemCustom: RoomSystem = {
  interval: TICKS.ALWAYS,
  name: ROOM_SYSTEMS.CUSTOM,
  requiredFeatures: {
    [ROOM_FEATURE.BASIC]: false,
  },
  run(room: Room) {
    if (room.name !== 'W46S58') return;

    spawnSystem.spawn(room, 'custom-W46S58-1', workerCustom.name, 1, 1000, {
      sectionParts: {
        [CARRY]: 1,
        [MOVE]: 1,
      },
      maxSections: 20,
      memory: {
        type: workerCustom.name,
        demandId: 'custom-W46S58-1',
        roomName: room.name,
        workRoom: 'W46S59',
      },
    });

    // const constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
    // if (constructionSites.length) return;
    //
    // spawnSystem.spawn(room, 'custom-W42S54', workerCustom.name, 1, 1000, {
    //   maxSections: 9,
    //   sectionParts: {
    //     [MOVE]: 2,
    //     [CARRY]: 1,
    //     [WORK]: 1,
    //   },
    //   memory: {
    //     type: workerCustom.name,
    //     demandId: 'custom-W42S54',
    //     roomName: room.name,
    //     workRoom: 'W42S54',
    //     sourceId: '5bbcaabe9099fc012e6321ea' as Id<Source>,
    //     containerId: '65db6404de565795da439dc0' as Id<StructureLink>,
    //   },
    // });

    // spawnSystem.spawn(room, 'custom-W42S56', workerCustom.name, 1, 1000, {
    //   maxSections: 10,
    //   sectionParts: {
    //     [MOVE]: 2,
    //     [CARRY]: 1,
    //     [WORK]: 1,
    //   },
    //   memory: {
    //     role: 'worker',
    //     worker: {
    //       type: workerCustom.name,
    //       demandId: 'custom-W42S56',
    //       roomName: room.name,
    //       workRoom: 'W42S56',
    //       sourceId: '5bbcaabf9099fc012e6321f0' as Id<Source>,
    //       containerId: '65d4aa62055de57e01d76adf' as Id<StructureContainer>,
    //     },
    //   },
    // });

    // spawnSystem.spawn(room, 'custom-W43S55-1', workerCustom.name, 1, 1000, {
    //   maxSections: 12,
    //   sectionParts: {
    //     [MOVE]: 2,
    //     [CARRY]: 1,
    //     [WORK]: 1,
    //   },
    //   memory: {
    //     role: 'worker',
    //     worker: {
    //       type: workerCustom.name,
    //       demandId: 'custom-W43S55-1',
    //       roomName: room.name,
    //       workRoom: 'W43S55',
    //       sourceId: '5bbcaab39099fc012e632068' as Id<Source>,
    //       containerId: '65d5cbe8e0f6620b30313cd1' as Id<StructureContainer>,
    //     },
    //   },
    // });
    //
    // spawnSystem.spawn(room, 'custom-W43S55-2', workerCustom.name, 1, 1000, {
    //   maxSections: 12,
    //   sectionParts: {
    //     [MOVE]: 2,
    //     [CARRY]: 1,
    //     [WORK]: 1,
    //   },
    //   memory: {
    //     role: 'worker',
    //     worker: {
    //       type: workerCustom.name,
    //       demandId: 'custom-W43S55-2',
    //       roomName: room.name,
    //       workRoom: 'W43S55',
    //       sourceId: '5bbcaab39099fc012e632066' as Id<Source>,
    //       containerId: '65d5cbe8e0f6620b30313cd1' as Id<StructureContainer>,
    //     },
    //   },
    // });
  },
};

export default systemCustom;
