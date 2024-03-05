import BlueprintScanner from 'blueprints/BlueprintScanner';
import Blueprints from 'blueprints/Blueprints';
import { getObjectById } from 'utils/game';
import { BASE_DIRECTIONS, INVADER, MINERALS_REGISTER_TICKS } from 'consts';
import { isRoomHighway } from 'utils/room';

const BASE_SCORE = 50;

const basePathDistance = (pos: RoomPosition, target: RoomPosition | _HasRoomPosition, range?: number): number => {
  return pos.findPathTo(target, { ignoreCreeps: true, ignoreRoads: true, plainCost: 2, swampCost: 3, range }).length;
};

const ownershipScore: Record<ROOM_OWNERSHIP, number> = {
  [ROOM_OWNERSHIP.ME_CONTROLLED]: 2,
  [ROOM_OWNERSHIP.ME_RESERVED]: 0,
  [ROOM_OWNERSHIP.INVADER_CONTROLLED]: -5,
  [ROOM_OWNERSHIP.INVADER_RESERVED]: 0.5,
  [ROOM_OWNERSHIP.PLAYER_CONTROLLED]: -5,
  [ROOM_OWNERSHIP.PLAYER_RESERVED]: -2,
  [ROOM_OWNERSHIP.UNCONTROLLED]: 1,
  [ROOM_OWNERSHIP.HIGHWAY]: 0.5,
  [ROOM_OWNERSHIP.NEUTRAL]: 2,
};

export default (
  room: Room,
  scanSources: Record<string, RoomMemoryScanSource> = {},
  scanMineral?: RoomMemoryScanMineral,
): number => {
  // if (room.controller?.my) return 0;

  if (!room.controller) return 0;
  if (Game.map.getRoomStatus(room.name).status !== 'normal') return 0;

  const baseBlueprint = Blueprints.find(b => b.base)!;
  const modBaseBlueprint = { ...baseBlueprint, maxCount: 10 };
  const baseResult = new BlueprintScanner(room.name).scanBlueprint(modBaseBlueprint);

  // If the base blueprint doesn't fit in the room, exclude the room
  if (!baseResult) return 0;

  const basePos = new RoomPosition(baseResult.x, baseResult.y, room.name);
  let score = 0;

  // controller
  score += BASE_SCORE - basePathDistance(basePos, room.controller);

  // mineral
  const mineral = getObjectById(scanMineral?.mineralId);
  if (mineral) {
    score += BASE_SCORE - basePathDistance(basePos, room.controller);
    const lastMineralScan = Memory.global.minerals[mineral.mineralType];
    // if not have access to this mineral, increase score
    if (!lastMineralScan || lastMineralScan < Game.time - MINERALS_REGISTER_TICKS) {
      score += BASE_SCORE;
    }
  }

  // sources
  for (const sourceId in scanSources) {
    const source = getObjectById(sourceId as Id<Source>)!;
    const sourceData = scanSources[sourceId];
    score += BASE_SCORE;
    score += (sourceData.slotsAvailable * BASE_SCORE) / 10;
    score += BASE_SCORE - basePathDistance(basePos, source);
  }

  // invader controlled
  if (room.controller.owner?.username === INVADER) {
    score -= BASE_SCORE / 2;

    // player controlled
  } else if (room.controller.owner?.username) {
    score -= BASE_SCORE * room.controller.level * 3;
  }

  // enemy structures
  const structures = room.find(FIND_STRUCTURES, {
    filter: s => s.structureType !== STRUCTURE_WALL && (!('my' in s) || !s.my),
  });
  const structuresHits = structures.reduce((acc, s) => acc + (s.hits ?? 0), 0);
  score -= structuresHits / 1_000_000;

  // adjacents rooms
  const exits = Game.map.describeExits(room.name) ?? {};
  for (const dir of BASE_DIRECTIONS) {
    const exitRoom = exits[dir];
    if (!exitRoom) {
      score += BASE_SCORE / 2;
    } else if (isRoomHighway(room)) {
      score += BASE_SCORE / 4;
    } else {
      const exitRoomMemory = Memory.rooms[exitRoom];
      // don't know what is in the neighbor room, dangerous
      if (!exitRoomMemory || !exitRoomMemory.scan?.ownership) {
        score -= 2 * BASE_SCORE;
      } else if (exitRoomMemory.scan.ownership) {
        score += BASE_SCORE * (ownershipScore[exitRoomMemory.scan.ownership] ?? 0);
      }
    }
  }

  // exit positions
  const exitPositions = room.find(FIND_EXIT);
  score -= exitPositions.length;

  // previous expansion attempts
  score -= (room.memory.expansionAttempts ?? 0) * BASE_SCORE * 2;

  if (isNaN(score)) return -1;

  return score;
};
