import { getBaseSpawnContainer } from 'utils/blueprint';
import { getObjectById } from 'utils/game';
import { TOWER_RESERVED_ENERGY } from 'consts';

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
  if (!room.memory?.state?.baseSpawnId) return undefined;
  return getObjectById<StructureSpawn>(room.memory.state.baseSpawnId);
};

export const getRoomFactory = (room: Room): StructureFactory | undefined => {
  if (!room.memory?.state?.factoryId) return undefined;
  return getObjectById(room.memory.state.factoryId);
};

export const getRoomNumberOfSources = (room: Room): number => {
  return Object.keys(room.memory.state?.sources || {}).length;
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

export const isRoomHighway = (room: Room): boolean => {
  const roomPos = roomNumberParser(room.name);
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
