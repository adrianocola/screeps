const MAX_RANK = Number.MAX_SAFE_INTEGER;

const MAX_HITS_PER_LEVEL: { [index: number]: number } = {
  0: 1_000,
  1: 2_500,
  2: 25_000,
  3: 50_000,
  4: 100_000,
  5: 200_000,
  6: 300_000,
  7: 500_000,
  8: 1_000_000,
};

// higher = more priority
const STRUCTURE_REPAIR_PRIORITY: { [K in StructureConstant]?: number } = {
  [STRUCTURE_ROAD]: 4,
  [STRUCTURE_CONTAINER]: 3,
  [STRUCTURE_RAMPART]: 2,
  [STRUCTURE_WALL]: 1,
};

const comparator = (a: FixQueueItem, b: FixQueueItem) => b.rank - a.rank;

// TODO maxHits should take into account the time the room is controlled (get time from spawnId)
// TODO maxHits should take into account the number of spawns in the room
const getStructureRank = (structure: Structure): number => {
  if (!structure.hitsMax) return MAX_RANK;

  const levelMaxHits = MAX_HITS_PER_LEVEL[structure.room.controller?.level || 0];
  const maxHits = levelMaxHits > structure.hitsMax ? structure.hitsMax : levelMaxHits;
  const percentage = Math.ceil((structure.hits / maxHits) * 100);

  if (percentage >= 80) return MAX_RANK;

  const priority = STRUCTURE_REPAIR_PRIORITY[structure.structureType] || 0;
  return percentage - priority;
};

const systemFix: RoomSystem = {
  interval: TICKS.TICK_20,
  name: ROOM_SYSTEMS.FIX,
  requiredFeatures: {
    [ROOM_FEATURE.CONTROLLED]: true,
    [ROOM_FEATURE.HAVE_TOWERS]: true,
  },
  run(room: Room) {
    const allStructures = room.find(FIND_STRUCTURES);
    const structuresDamaged = allStructures.reduce((result, structure) => {
      const rank = getStructureRank(structure);
      if (rank !== MAX_RANK) {
        result.push({
          structureId: structure.id,
          structureType: structure.structureType,
          rank,
        });
      }
      return result;
    }, [] as FixQueueItem[]);

    let queue: FixQueueItem[] = [];
    if (structuresDamaged.length) {
      queue = structuresDamaged.sort(comparator).slice(0, 10);
    }

    room.memory.fix = { queue };
  },
};

export default systemFix;
