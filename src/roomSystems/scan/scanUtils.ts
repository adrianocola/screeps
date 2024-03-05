export const rawPathDistance = (pos: RoomPosition, target?: RoomPosition | _HasRoomPosition): number => {
  if (!target) return -1;

  return pos.findPathTo(target, { ignoreCreeps: true }).length;
};

export const getRawPath = (pos?: RoomPosition, target?: RoomPosition | _HasRoomPosition, range = 0): PathStep[] => {
  if (!pos || !target) return [];

  return pos.findPathTo(target, { ignoreCreeps: true, range });
};

export const getIsPathPaved = (room: Room, pathSteps: PathStep[] | RoomPosition[]): boolean => {
  for (const step of pathSteps) {
    const structures = room.lookForAt(LOOK_STRUCTURES, step.x, step.y);
    if (!structures.find(s => s.structureType === STRUCTURE_ROAD)) return false;
  }

  return true;
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
