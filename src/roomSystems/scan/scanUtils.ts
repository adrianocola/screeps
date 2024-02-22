export const rawRange = (pos: RoomPosition, target?: RoomPosition | _HasRoomPosition): number => {
  if (!target) return -1;

  return pos.getRangeTo(target);
};

export const rawPathDistance = (pos: RoomPosition, target?: RoomPosition | _HasRoomPosition): number => {
  if (!target) return -1;

  return pos.findPathTo(target, { ignoreCreeps: true }).length;
};

export const getRawPath = (pos: RoomPosition, target?: RoomPosition | _HasRoomPosition): PathStep[] => {
  if (!target) return [];

  return pos.findPathTo(target, { ignoreCreeps: true });
};

export const getIsPathPaved = (room: Room, pathSteps: PathStep[] | RoomPosition[]): boolean => {
  // stop 1 step before destination (destination space don't need to be paved)
  for (let i = 0; i < pathSteps.length - 1; i += 1) {
    const path = pathSteps[i];
    const structures = room.lookForAt(LOOK_STRUCTURES, path.x, path.y);
    if (!structures.some(s => s.structureType === STRUCTURE_ROAD)) return false;
  }

  return true;
};

export const findSingleStructureInRange = <T extends AnyStructure>(
  pos: RoomPosition,
  range: number,
  structureType: StructureConstant,
) => {
  const structures = pos.findInRange(FIND_STRUCTURES, range, { filter: { structureType } });
  return structures.length ? (structures[0] as T) : undefined;
};

export const findSingleStructureIdInRange = <T extends AnyStructure>(
  pos: RoomPosition,
  range: number,
  structureType: StructureConstant,
) => {
  const structures = pos.findInRange(FIND_STRUCTURES, range, { filter: { structureType } });
  return structures.length ? (structures[0].id as Id<T>) : undefined;
};

export const findStructuresIdInRange = (
  pos: RoomPosition,
  range: number,
  structureType: StructureConstant,
): string[] => {
  const structures = pos.findInRange(FIND_STRUCTURES, range, { filter: { structureType } });
  return structures.map(s => s.id) as string[];
};

export const getExitDistance = (pos: RoomPosition, exit: ExitConstant): number | undefined => {
  const closestExist = pos.findClosestByRange(exit);
  if (!closestExist) return undefined;

  return rawPathDistance(pos, closestExist);
};

export const getExitsDistances = (pos: RoomPosition): ExitMap<number> => {
  const map: ExitMap<number> = {};
  map[FIND_EXIT_TOP] = getExitDistance(pos, FIND_EXIT_TOP);
  map[FIND_EXIT_RIGHT] = getExitDistance(pos, FIND_EXIT_RIGHT);
  map[FIND_EXIT_BOTTOM] = getExitDistance(pos, FIND_EXIT_BOTTOM);
  map[FIND_EXIT_LEFT] = getExitDistance(pos, FIND_EXIT_LEFT);
  return map;
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
