import { getBaseSpawnContainer } from 'utils/blueprint';
import { getObjectById } from 'utils/game';
import { ALL_DIRECTIONS, TOWER_RESERVED_ENERGY } from 'consts';
import { getOppositeExitKey, getRelativePosition } from 'utils/directions';
import { shuffleArray } from 'utils/random';

export const getRoomCallback = (roomName: string): CostMatrix | boolean => {
  const room = Game.rooms[roomName];
  if (!room) return false;

  const costs = new PathFinder.CostMatrix();

  room.find(FIND_STRUCTURES).forEach(function (struct) {
    if (struct.structureType === STRUCTURE_ROAD) {
      costs.set(struct.pos.x, struct.pos.y, 1);
    } else if (
      struct.structureType !== STRUCTURE_CONTAINER &&
      (struct.structureType !== STRUCTURE_RAMPART || !struct.my)
    ) {
      costs.set(struct.pos.x, struct.pos.y, 0xff);
    }
  });

  // Avoid creeps in the room
  room.find(FIND_CREEPS).forEach(function (creep) {
    costs.set(creep.pos.x, creep.pos.y, 0xff);
  });

  return costs;
};

export const roomPathFinderOptions: PathFinderOpts = {
  roomCallback: getRoomCallback,
  plainCost: 2,
  swampCost: 10,
};

export const getRoomSpawn = (room: Room): StructureSpawn | undefined => {
  if (!room.memory?.scan?.baseSpawnId) return undefined;
  return getObjectById<StructureSpawn>(room.memory.scan.baseSpawnId);
};

export const getRoomFactory = (room: Room): StructureFactory | undefined => {
  if (!room.memory?.scan?.factoryId) return undefined;
  return getObjectById(room.memory.scan.factoryId);
};

export const getRoomNumberOfSources = (room: Room): number => {
  return Object.keys(room.memory.scan?.sources || {}).length;
};

export const getRoomClosestEmptyExtension = (room: Room, half: 1 | 2): StructureExtension | undefined => {
  const extensionsPerLevel = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][room.controller?.level ?? 0];
  const start = half === 2 ? extensionsPerLevel / 2 : 1;
  const end = half === 1 ? extensionsPerLevel / 2 : extensionsPerLevel;
  for (let i = start; i <= end; i += 1) {
    const blueprintId = `EX${i}` as BLUEPRINT_STRUCTURE;
    const extensionId = room.memory.blueprint?.structures[blueprintId];

    if (!extensionId) continue;

    const extension = getObjectById(extensionId as Id<StructureExtension>);
    if (extension && extension.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
      return extension;
    }
  }

  return undefined;
};

export const getRoomEmptyTower = (room: Room, ignoreTowerId?: Id<StructureTower>): StructureTower | undefined => {
  const towers: StructureTower[] = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });
  for (const tower of towers) {
    if (tower.id !== ignoreTowerId && tower.store.getUsedCapacity(RESOURCE_ENERGY) <= TOWER_RESERVED_ENERGY) {
      return tower;
    }
  }

  return undefined;
};

export const getRoomEmptySpawn = (room: Room): StructureSpawn | undefined => {
  const spawns = room.find(FIND_MY_SPAWNS);
  for (const spawn of spawns) {
    if (spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0) return spawn;
  }

  return undefined;
};

export const roomNumberParser = (roomName: string): { x: number; y: number } | null => {
  const match = roomName.match(/\w(\d+)\w(\d+)/);
  if (!match) return null;

  return {
    x: parseInt(match[1], 10),
    y: parseInt(match[2], 10),
  };
};

export const isRoomHighway = (room: Room | string): boolean => {
  const roomPos = roomNumberParser(typeof room === 'string' ? room : room.name);
  return !!roomPos && (roomPos.x % 10 === 0 || roomPos.y % 10 === 0);
};

export const getRoomByName = (roomName: string): Room | undefined => {
  return Game.rooms[roomName];
};

export const getRoomMemory = (roomName?: string | null): RoomMemory | undefined => {
  if (!roomName) return;

  return Memory.rooms[roomName];
};

export const getNeighborRoomName = (currentRoomName: string, exit: ExitConstant): string | undefined => {
  const exists = Game.map.describeExits(currentRoomName);
  return exists[exit];
};

export const getNeighborRoomMemory = (currentRoomName: string, exit: ExitConstant): RoomMemory | undefined => {
  const neighborRoomName = getNeighborRoomName(currentRoomName, exit);
  return getRoomMemory(neighborRoomName);
};

export const getMainResourceHolder = (room: Room) => {
  if (room.storage) return room.storage;

  return getBaseSpawnContainer(room);
};

export const getMainResourceHolderId = (room: Room): Id<StructureStorage> | Id<StructureContainer> | undefined =>
  getMainResourceHolder(room)?.id;

export const getRoomNeighbours = (roomName: string, distance: number, fromExit?: ExitKey): string[] => {
  const list: string[] = [];
  if (!distance) return list;

  const exits = Game.map.describeExits(roomName);
  const reverseFromExit = fromExit ? getOppositeExitKey(fromExit) : undefined;

  for (const exitDir in exits) {
    const exitDirTyped = exitDir as ExitKey;
    if (exitDirTyped === reverseFromExit) continue;

    const exitRoom = exits[exitDirTyped]!;

    list.push(exitRoom, ...getRoomNeighbours(exitRoom, distance - 1, exitDirTyped));
  }

  return [...new Set(list)];
};

export const getSlotsAvailable = (sourceData: RoomMemoryScanSource): DirectionConstant[] => {
  const available: DirectionConstant[] = [];
  for (const direction of ALL_DIRECTIONS) {
    if (!sourceData.slots[direction]) {
      available.push(direction);
    }
  }
  return available;
};

export const isSpaceBlocked = (room: Room, pos: Pos, roadsBlock = false): boolean => {
  if (room.lookForAt(LOOK_TERRAIN, pos.x, pos.y).some(terrain => terrain === 'wall')) {
    return true;
  }
  if (
    room
      .lookForAt(LOOK_STRUCTURES, pos.x, pos.y)
      .some(s => s.structureType !== STRUCTURE_ROAD || (roadsBlock && s.structureType === STRUCTURE_ROAD))
  ) {
    return true;
  }
  if (room.lookForAt(LOOK_CREEPS, pos.x, pos.y).length) {
    return true;
  }

  return false;
};

export const findFreeSpaceAround = (room: Room, target: Pos): Pos | undefined => {
  const shuffledDirections = shuffleArray(ALL_DIRECTIONS);
  for (const dir of shuffledDirections) {
    const pos = getRelativePosition(target, dir);
    if (isSpaceBlocked(room, pos, true)) {
      continue;
    }

    return pos;
  }

  return undefined;
};

export const removeSpawn = (room: Room, id: string) => {
  delete room.memory.spawn?.demand[id];
};
