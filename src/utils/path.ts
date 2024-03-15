import { posFromIndex } from 'utils/directions';

let costMatrixCacheTick = 0;
let costMatrixCache: Record<string, CostMatrix> = {};
const getCachedCostMatrix = (roomName: string): CostMatrix | undefined => {
  if (Game.time !== costMatrixCacheTick) {
    costMatrixCache = {};
    costMatrixCacheTick = Game.time;
  }

  return costMatrixCache[roomName];
};
const setCachedCostMatrix = (roomName: string, costMatrix: CostMatrix) => {
  costMatrixCache[roomName] = costMatrix;
};

const roomCallback = (roomName: string): CostMatrix => {
  const cachedCostMatrix = getCachedCostMatrix(roomName);
  if (cachedCostMatrix) return cachedCostMatrix;

  const costs = new PathFinder.CostMatrix();
  const room = Game.rooms[roomName];
  if (!room) return costs;

  room.find(FIND_STRUCTURES).forEach(function (struct) {
    if (struct.structureType === STRUCTURE_ROAD) {
      costs.set(struct.pos.x, struct.pos.y, 1);
    } else if (
      struct.structureType !== STRUCTURE_CONTAINER &&
      (struct.structureType !== STRUCTURE_RAMPART || !struct.my)
    ) {
      // Can't walk through non-walkable buildings
      costs.set(struct.pos.x, struct.pos.y, 0xff);
    }
  });

  // Avoid my construction sites
  room.find(FIND_MY_CONSTRUCTION_SITES).forEach(function (cSite) {
    costs.set(cSite.pos.x, cSite.pos.y, 0xff);
  });

  // Avoid my creeps in the room
  room.find(FIND_MY_CREEPS).forEach(function (creep) {
    costs.set(creep.pos.x, creep.pos.y, 0xff);
  });

  // Avoid hostile creeps
  const sourceKeepers = room.find(FIND_HOSTILE_CREEPS);
  for (const sourceKeeper of sourceKeepers) {
    for (let x = -3; x <= 3; x++) {
      for (let y = -3; y <= 3; y++) {
        costs.set(sourceKeeper.pos.x + x, sourceKeeper.pos.y + y, 0xff);
      }
    }
    costs.set(sourceKeeper.pos.x, sourceKeeper.pos.y, 0xff);
  }

  setCachedCostMatrix(roomName, costs);
  return costs;
};

const getPathString = (creep: Creep, path: RoomPosition[], reusePath: number) => {
  return path
    .slice(0, reusePath)
    .map((pos, i) => {
      const prevPos = i === 0 ? creep.pos : path[i - 1];
      return prevPos.getDirectionTo(pos);
    })
    .join('');
};

export const moveToUsingPath = (
  creep: Creep,
  target: RoomPosition | { pos: RoomPosition },
  range = 1,
  reusePath = 5,
): ScreepsReturnCode => {
  if (creep.fatigue > 0) return ERR_TIRED;
  if (!reusePath) return ERR_INVALID_ARGS;

  if (creep.memory.move?.tick) {
    creep.memory.move.tick -= 1;
  }

  const targetPos = target instanceof RoomPosition ? target : target.pos;
  const memoryTargetPos = creep.memory.move
    ? new RoomPosition(creep.memory.move.target.x, creep.memory.move.target.y, creep.memory.move.target.roomName)
    : undefined;

  if (memoryTargetPos && creep.memory.move && creep.memory.move.tick > 0 && targetPos.isEqualTo(memoryTargetPos)) {
    if (!creep.memory.move.path.length) return OK;

    const lastPos = creep.memory.move.pos ? posFromIndex(creep.memory.move.pos) : undefined;
    // check if moved (only move to the next position if the creep actually moved)
    if (!lastPos || lastPos.x !== targetPos.x || lastPos.y !== targetPos.y) {
      creep.memory.move.path = creep.memory.move.path.substring(1);
      if (creep.memory.move.path.length) {
        const nextDir = parseInt(creep.memory.move.path[0], 10) as DirectionConstant;
        return creep.move(nextDir);
      }
    }
  }

  let searchResult = PathFinder.search(
    creep.pos,
    { pos: targetPos, range },
    { roomCallback, plainCost: 2, swampCost: 6 },
  );
  // if the path is incomplete, try to find a path with a larger range
  if (searchResult.incomplete) {
    searchResult = PathFinder.search(
      creep.pos,
      { pos: targetPos, range: range + 1 },
      { roomCallback, plainCost: 2, swampCost: 6 },
    );
  }

  const path = getPathString(creep, searchResult.path, reusePath);
  creep.memory.move = {
    path,
    range,
    target: targetPos,
    tick: Math.min(reusePath, path.length),
  };
  return creep.move(creep.pos.getDirectionTo(searchResult.path[0]));
};
