import { getRawPath } from 'utils/path';

export const getIsPathPaved = (room: Room, pathSteps: PathStep[] | RoomPosition[]): boolean => {
  return pathSteps.every(step => {
    const structures = room.lookForAt(LOOK_STRUCTURES, step.x, step.y);
    return !!structures.find(s => s.structureType === STRUCTURE_ROAD);
  });
};

export const getExitDistance = (pos: RoomPosition, exit: ExitConstant): number | undefined => {
  const closestExist = pos.findClosestByRange(exit);
  if (!closestExist) return undefined;

  return getRawPath(pos, closestExist).cost;
};

export const getExitsDistances = (pos: RoomPosition): ExitMap<number> => {
  const map: ExitMap<number> = {};
  map[FIND_EXIT_TOP] = getExitDistance(pos, FIND_EXIT_TOP);
  map[FIND_EXIT_RIGHT] = getExitDistance(pos, FIND_EXIT_RIGHT);
  map[FIND_EXIT_BOTTOM] = getExitDistance(pos, FIND_EXIT_BOTTOM);
  map[FIND_EXIT_LEFT] = getExitDistance(pos, FIND_EXIT_LEFT);
  return map;
};

export const findSingleStructureInRange = <T extends AnyStructure>(
  pos: RoomPosition,
  range: number,
  structureType: StructureConstant,
) => {
  const structures = pos.findInRange<T>(FIND_STRUCTURES, range, { filter: { structureType } });
  return structures.length ? structures[0] : undefined;
};
