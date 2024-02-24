import { forEach, sample } from 'lodash';
import { getBaseSpawnContainer } from 'utils/blueprint';
import { getObjectById } from 'utils/game';

const POSITION_DIFF_MAP: { [K in DirectionConstant]: { x: number; y: number } } = {
  [TOP]: { x: 0, y: -1 },
  [TOP_RIGHT]: { x: 1, y: -1 },
  [RIGHT]: { x: 1, y: 0 },
  [BOTTOM_RIGHT]: { x: 1, y: 1 },
  [BOTTOM]: { x: 0, y: 1 },
  [BOTTOM_LEFT]: { x: -1, y: 1 },
  [LEFT]: { x: -1, y: 0 },
  [TOP_LEFT]: { x: -1, y: -1 },
};

export const getRelativePosition = (pos: RoomPosition, direction: DirectionConstant, amount: number = 1) => {
  const diff = POSITION_DIFF_MAP[direction];
  return new RoomPosition(pos.x + diff.x * amount, pos.y + diff.y * amount, pos.roomName);
};

export const getRandomSourceId = (room: Room): string | undefined => {
  const availableSourcesIds: string[] = [];
  forEach(room.memory.state?.sources || {}, (source, sourceId) => {
    if (sourceId && !source.sourceKeeper) availableSourcesIds.push(sourceId);
  });
  return sample(availableSourcesIds);
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

export const getRoomClosestEmptyTower = (
  room: Room,
  ignoreTowerId?: Id<StructureTower>,
): StructureTower | undefined => {
  const foundTowerData = room.memory.state?.towers.find(towerData => {
    if (towerData.id === ignoreTowerId) return undefined;

    const tower = getObjectById(towerData.id as Id<StructureTower>);
    return tower && tower.store.getFreeCapacity(RESOURCE_ENERGY) > 150;
  });
  if (!foundTowerData) return undefined;

  return getObjectById(foundTowerData.id as Id<StructureTower>);
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

export const getMainEnergySource = (room: Room) => {
  if (room.storage) return room.storage;

  return getBaseSpawnContainer(room);
};

export const getMainEnergySourceId = (room: Room): Id<StructureStorage> | Id<StructureContainer> | undefined =>
  getMainEnergySource(room)?.id;
