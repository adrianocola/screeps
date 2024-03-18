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

        // if reached move destination, can remove the move memory
        if (creep.memory.move) {
          if (Game.time >= creep.memory.move.tick) {
            delete creep.memory.move;
          } else {
            const targetPos = new RoomPosition(
              creep.memory.move.target.x,
              creep.memory.move.target.y,
              creep.memory.move.target.roomName,
            );
            if (creep.pos.inRangeTo(targetPos, creep.memory.move.range)) {
              delete creep.memory.move;
            }
          }
        }

        runner.run(creep);
      }
    }
  },
};

export default systemWorkers;
