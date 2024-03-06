import CreepTypes from 'creepTypes';

const systemWorkers: RoomSystem = {
  interval: TICKS.ALWAYS,
  name: ROOM_SYSTEMS.CREEPS,
  requiredFeatures: {
    [ROOM_FEATURE.CONTROLLED]: true,
  },
  run: (room: Room, roomCreeps) => {
    for (const creepType in CreepTypes) {
      const runner = CreepTypes[creepType as CREEP_TYPE];
      const creeps = roomCreeps[creepType as CREEP_TYPE];
      if (!creeps || !runner) continue;

      for (const creep of creeps) {
        if (creep.spawning) continue;
        runner.run(creep);
      }
    }
  },
};

export default systemWorkers;
