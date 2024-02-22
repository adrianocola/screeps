import { size } from 'lodash';
import spawnSystem from './spawn';
import { getMainEnergySourceId } from 'utils/room';
import spawnFixer from 'creepTypes/fixer';

const MAX_RANK = Number.MAX_SAFE_INTEGER;

const MAX_HITS_PER_LEVEL: { [index: number]: number } = {
  0: 1000,
  1: 2500,
  2: 25000,
  3: 50000,
  4: 100000,
  5: 200000,
  6: 300000,
  7: 500000,
  8: 1000000,
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

  if (percentage >= 90) return MAX_RANK;

  const priority = STRUCTURE_REPAIR_PRIORITY[structure.structureType] || 0;
  return percentage - priority;
};

const systemFix: RoomSystem = {
  interval: TICKS.TICK_20,
  name: ROOM_SYSTEMS.FIX,
  requiredFeatures: {
    [ROOM_FEATURE.BASIC]: false,
    [ROOM_FEATURE.CONTROLLED]: true,
  },
  run(room: Room) {
    const haveTowers = !!room.memory.state?.towers && size(room.memory.state?.towers) > 0;
    const allStructures = room.find(FIND_STRUCTURES);
    const structuresDamaged = allStructures.reduce((result: FixQueueItem[], structure) => {
      const rank = getStructureRank(structure);
      if (rank !== MAX_RANK) {
        result.push({
          structureId: structure.id,
          structureType: structure.structureType,
          rank,
        });
      }
      return result;
    }, []);

    let queue: FixQueueItem[] = [];
    if (structuresDamaged.length) {
      queue = structuresDamaged.sort(comparator).slice(0, 10);
    }

    room.memory.fix = { queue };

    if (queue.length && !haveTowers && room.memory.state?.baseSpawnId) {
      spawnSystem.spawn(room, spawnFixer.name, spawnFixer.name, 1, {
        memory: {
          role: 'worker',
          worker: {
            type: spawnFixer.name,
            demandId: spawnFixer.name,
            roomName: room.name,
            source: getMainEnergySourceId(room),
          },
        },
      });
    } else {
      spawnSystem.removeSpawn(room, spawnFixer.name);
    }
  },
};

export default systemFix;