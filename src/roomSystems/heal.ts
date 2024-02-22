const comparator = (a: Creep, b: Creep) => (a.hitsMax - a.hits < b.hitsMax - b.hits ? 1 : -1);

const systemFix: RoomSystem = {
  interval: TICKS.TICK_10,
  name: ROOM_SYSTEMS.HEAL,
  requiredFeatures: {
    [ROOM_FEATURE.BASIC]: false,
    [ROOM_FEATURE.CONTROLLED]: true,
    [ROOM_FEATURE.HAVE_TOWERS]: true,
  },
  run(room: Room) {
    const allCreeps = room.find(FIND_MY_CREEPS);
    const creepsHurt = allCreeps.reduce((result: Creep[], creep) => {
      if (creep.hitsMax !== creep.hits) {
        result.push(creep);
      }
      return result;
    }, []);

    let queue: string[] = [];
    if (creepsHurt.length) {
      queue = creepsHurt
        .sort(comparator)
        .slice(0, 10)
        .map(creep => creep.id);
    }

    room.memory.heal = { queue };
  },
};

export default systemFix;
