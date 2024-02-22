import CreepTypes from 'creepTypes';

const systemWorkers: RoomSystem = {
  interval: TICKS.ALWAYS,
  name: ROOM_SYSTEMS.CREEPS,
  run: (room: Room) => {
    const creeps: Creep[] = room.find(FIND_MY_CREEPS);
    for (const creep of creeps) {
      if (!creep.memory.worker?.type || creep.spawning) continue;

      const runner = CreepTypes[creep.memory.worker?.type];
      if (runner) runner.run(creep);
    }
  },
};

export default systemWorkers;
