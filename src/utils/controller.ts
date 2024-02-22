import { getRoomNumberOfSources } from './room';

export const getLevelRate = (room: Room): number => {
  const numberOfSources = getRoomNumberOfSources(room);
  return ((room.controller?.level || 0) ** 2.25 / 2) * numberOfSources;
};

export const isControllerFree = (room: Room) => {
  return (
    !room.controller?.owner &&
    (!room.controller?.reservation || room.controller?.reservation?.username === Memory.username)
  );
};

export const canBuildStructure = (room: Room, structure: BuildableStructureConstant): number => {
  if (!room.controller?.my) return 0;

  const structureLevels = CONTROLLER_STRUCTURES[structure];
  const structuresAtLevel = structureLevels[room.controller.level];
  const structuresCount = room.find(FIND_STRUCTURES, { filter: { structureType: structure } }).length;
  return structuresAtLevel - structuresCount;
};
