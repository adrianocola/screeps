import { getRelativePosition, posFromIndex } from 'utils/directions';
import { ROOM_SIZE } from 'consts';

type CostMatrixCache = Record<string, { tick: number; cm: CostMatrix }>;

const costMatrixCacheMovement: CostMatrixCache = {};
const costMatrixCacheBuildings: CostMatrixCache = {};

const getCachedCostMatrix = (roomName: string, cache: CostMatrixCache): CostMatrix | undefined => {
  if (cache[roomName]) {
    // if room loaded, only cache for the current tick
    if (Game.rooms[roomName]) {
      if (Game.time !== cache[roomName].tick) {
        delete cache[roomName];
      }
      // if not room loaded, cache for more ticks
    } else if (Game.time - cache[roomName].tick > ROOM_SIZE * 2) {
      delete cache[roomName];
    }
  }

  return cache[roomName]?.cm;
};
const setCachedCostMatrix = (roomName: string, costMatrix: CostMatrix, cache: CostMatrixCache) => {
  cache[roomName] = { tick: Game.time, cm: costMatrix };
};

const setStructuresCostMatrix = (room: Room, costs: CostMatrix) => {
  room.find(FIND_STRUCTURES, { filter: s => s.structureType !== STRUCTURE_ROAD }).forEach(function (struct) {
    if (struct.structureType !== STRUCTURE_CONTAINER && (struct.structureType !== STRUCTURE_RAMPART || !struct.my)) {
      // Can't walk through non-walkable buildings
      costs.set(struct.pos.x, struct.pos.y, 0xff);
    }
  });
};

const setConstructionSitesCostMatrix = (room: Room, costs: CostMatrix) => {
  room.find(FIND_MY_CONSTRUCTION_SITES).forEach(function (cSite) {
    costs.set(cSite.pos.x, cSite.pos.y, 0xff);
  });
};

const setRoadsCostMatrix = (room: Room, costs: CostMatrix) => {
  room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_ROAD }).forEach(function (struct) {
    costs.set(struct.pos.x, struct.pos.y, 1);
  });
};

const setMyCreepsCostMatrix = (room: Room, costs: CostMatrix) => {
  room.find(FIND_MY_CREEPS).forEach(function (creep) {
    costs.set(creep.pos.x, creep.pos.y, 0xff);
  });
};

const setHostileCreepsCostMatrix = (room: Room, costs: CostMatrix) => {
  const sourceKeepers = room.find(FIND_HOSTILE_CREEPS);
  for (const sourceKeeper of sourceKeepers) {
    for (let x = -3; x <= 3; x++) {
      for (let y = -3; y <= 3; y++) {
        costs.set(sourceKeeper.pos.x + x, sourceKeeper.pos.y + y, 0xff);
      }
    }
    costs.set(sourceKeeper.pos.x, sourceKeeper.pos.y, 0xff);
  }
};

const roomCallbackMovement = (roomName: string): CostMatrix => {
  const cachedCostMatrix = getCachedCostMatrix(roomName, costMatrixCacheMovement);
  if (cachedCostMatrix) return cachedCostMatrix;

  const costs = new PathFinder.CostMatrix();
  const room = Game.rooms[roomName];
  if (!room) return costs;

  setStructuresCostMatrix(room, costs);
  setConstructionSitesCostMatrix(room, costs);
  setRoadsCostMatrix(room, costs);
  setMyCreepsCostMatrix(room, costs);
  setHostileCreepsCostMatrix(room, costs);

  setCachedCostMatrix(roomName, costs, costMatrixCacheMovement);
  return costs;
};

const roomCallbackBuildings = (roomName: string): CostMatrix => {
  const cachedCostMatrix = getCachedCostMatrix(roomName, costMatrixCacheBuildings);
  if (cachedCostMatrix) return cachedCostMatrix;

  const costs = new PathFinder.CostMatrix();
  const room = Game.rooms[roomName];
  if (!room) return costs;

  setStructuresCostMatrix(room, costs);
  setConstructionSitesCostMatrix(room, costs);
  setRoadsCostMatrix(room, costs);

  setCachedCostMatrix(roomName, costs, costMatrixCacheBuildings);
  return costs;
};

const basePathFinderOptions: PathFinderOpts = { plainCost: 2, swampCost: 6 };

const getPathString = (creep: Creep, path: RoomPosition[], reusePath: number) => {
  return path
    .slice(0, reusePath)
    .filter(pos => pos.roomName === creep.room.name)
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

  if (creep.memory.move?.step) {
    creep.memory.move.step -= 1;
  }

  const targetPos = target instanceof RoomPosition ? target : target.pos;
  const memoryTargetPos = creep.memory.move
    ? new RoomPosition(creep.memory.move.target.x, creep.memory.move.target.y, creep.memory.move.target.roomName)
    : undefined;

  if (memoryTargetPos && creep.memory.move && creep.memory.move.step > 0 && targetPos.isEqualTo(memoryTargetPos)) {
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

  const pathFinderOptions = { ...basePathFinderOptions, roomCallback: roomCallbackMovement };
  let searchResult = PathFinder.search(creep.pos, { pos: targetPos, range }, pathFinderOptions);
  // if the path is incomplete, try to find a path with a larger range
  if (searchResult.incomplete) {
    searchResult = PathFinder.search(
      creep.pos,
      { pos: targetPos, range: range + 1 },
      { ...pathFinderOptions, maxOps: 5000 },
    );
  }

  const path = getPathString(creep, searchResult.path, reusePath);
  creep.memory.move = {
    path,
    range,
    target: targetPos,
    tick: Game.time + path.length * 2,
    step: path.length,
  };
  return creep.move(creep.pos.getDirectionTo(searchResult.path[0]));
};

export const printPath = (creep: Creep) => {
  if (!creep.memory.move) return;

  const positions: RoomPosition[] = [];
  let prevPos: Pos = creep.pos;
  for (const dir of creep.memory.move.path) {
    const dirConstant = parseInt(dir, 10) as DirectionConstant;
    prevPos = getRelativePosition(prevPos, dirConstant);
    if (prevPos.x < 0 || prevPos.y < 0 || prevPos.x >= ROOM_SIZE || prevPos.y >= ROOM_SIZE) break;
    positions.push(new RoomPosition(prevPos.x, prevPos.y, creep.room.name));
  }
  creep.room.visual.poly(positions, { stroke: '#fff', strokeWidth: 0.15, opacity: 0.2, lineStyle: 'dashed' });
};

export const getRawPath = (pos: RoomPosition, target: RoomPosition | _HasRoomPosition, range = 1): PathFinderPath =>
  PathFinder.search(
    pos,
    { pos: target instanceof RoomPosition ? target : target.pos, range },
    {
      ...basePathFinderOptions,
      roomCallback: roomCallbackBuildings,
      maxRooms: 2,
      maxOps: 500,
    },
  );
