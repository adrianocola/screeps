import { getObjectById } from 'utils/game';
import { BlueprintsMap } from 'blueprints/Blueprints';
import { checkIsOppositeBaseDirection, getDirectionRotation, oppositePos, rotatePos } from 'utils/directions';

export const getBlueprintEntrance = (room: Room, blueprintId: BLUEPRINT_ID) => {
  const memoryBlueprint = room.memory.blueprint?.schemas[blueprintId];
  if (!memoryBlueprint) return;

  const blueprint = BlueprintsMap[blueprintId];
  if (!blueprint || !blueprint.entrance || !blueprint.dir) return;

  let entrance: Pos = blueprint.entrance;
  if (checkIsOppositeBaseDirection(blueprint.dir, memoryBlueprint.dir)) {
    entrance = oppositePos(entrance, blueprint.width, blueprint.height);
  } else {
    const rotation = getDirectionRotation(blueprint.dir ?? RIGHT, memoryBlueprint.dir);
    entrance = rotatePos(entrance, blueprint.width, blueprint.height, rotation);
  }

  return {
    x: memoryBlueprint.pos.x + entrance.x,
    y: memoryBlueprint.pos.y + entrance.y,
  };
};

export const getBlueprintDirection = (room: Room, blueprint: BLUEPRINT_ID) => {
  return room.memory.blueprint?.schemas[blueprint]?.dir ?? RIGHT;
};

export const getBlueprintStructureId = <T extends Structure>(
  room: Room,
  id: BLUEPRINT_STRUCTURE,
): Id<T> | undefined => {
  return room.memory.blueprint?.structures[id] as Id<T>;
};

export const getBlueprintStructure = <T extends Structure>(room: Room, id: BLUEPRINT_STRUCTURE): T | undefined => {
  const structureId = getBlueprintStructureId<T>(room, id);

  if (!structureId) return;

  return getObjectById(structureId);
};

export const getSpawn1 = (room: Room) => {
  return getBlueprintStructure<StructureContainer>(room, BLUEPRINT_STRUCTURE.SPAWN1);
};

export const getSpawn2 = (room: Room) => {
  return getBlueprintStructure<StructureContainer>(room, BLUEPRINT_STRUCTURE.SPAWN2);
};

export const getSpawn3 = (room: Room) => {
  return getBlueprintStructure<StructureContainer>(room, BLUEPRINT_STRUCTURE.SPAWN2);
};

export const getControllerContainer = (room: Room) => {
  return getBlueprintStructure<StructureContainer>(room, BLUEPRINT_STRUCTURE.CONTAINER4);
};

export const getControllerLink = (room: Room) => {
  return getBlueprintStructure<StructureLink>(room, BLUEPRINT_STRUCTURE.LINK4);
};

export const getControllerLinkOrContainer = (room: Room) => {
  return getControllerLink(room) ?? getControllerContainer(room);
};

export const getMineralContainer = (room: Room) => {
  const containerId: Id<StructureContainer> = room.memory.blueprint?.structures[
    BLUEPRINT_STRUCTURE.CONTAINER5
  ] as Id<StructureContainer>;
  if (!containerId) return;

  return getObjectById(containerId) ?? undefined;
};

export const getMineralExtractor = (room: Room) => {
  const extractorId: Id<StructureExtractor> = room.memory.blueprint?.structures[
    BLUEPRINT_STRUCTURE.EXTRACTOR
  ] as Id<StructureExtractor>;
  if (!extractorId) return;

  return getObjectById(extractorId) ?? undefined;
};

export const getSourceContainer = (room: Room, sourceIndex?: number) => {
  if (sourceIndex === undefined) return undefined;

  let containerId: Id<StructureContainer> | undefined;
  if (sourceIndex === 0)
    containerId = room.memory.blueprint?.structures[BLUEPRINT_STRUCTURE.CONTAINER1] as Id<StructureContainer>;
  if (sourceIndex === 1)
    containerId = room.memory.blueprint?.structures[BLUEPRINT_STRUCTURE.CONTAINER2] as Id<StructureContainer>;

  if (!containerId) return;

  return getObjectById(containerId);
};

export const getSourceLink = (room: Room, sourceIndex?: number) => {
  if (sourceIndex === undefined) return undefined;

  let linkId: Id<StructureLink> | undefined;
  if (sourceIndex === 0) linkId = room.memory.blueprint?.structures[BLUEPRINT_STRUCTURE.LINK1] as Id<StructureLink>;
  if (sourceIndex === 1) linkId = room.memory.blueprint?.structures[BLUEPRINT_STRUCTURE.LINK2] as Id<StructureLink>;

  if (!linkId) return;

  return getObjectById(linkId);
};

export const getSourceLinkOrContainer = (room: Room, sourceIndex?: number) => {
  return getSourceLink(room, sourceIndex) ?? getSourceContainer(room, sourceIndex);
};

export const getBaseSpawn = (room: Room) => {
  const spawnId: Id<StructureSpawn> = room.memory.blueprint?.structures[
    BLUEPRINT_STRUCTURE.SPAWN1
  ] as Id<StructureSpawn>;

  return getObjectById(spawnId);
};

export const getBaseSpawnContainer = (room: Room) => {
  const container: Id<StructureContainer> = room.memory.blueprint?.structures[
    BLUEPRINT_STRUCTURE.CONTAINER3
  ] as Id<StructureContainer>;

  if (!container) return;

  return getObjectById(container);
};

export const getStorageLink = (room: Room) => {
  const linkId: Id<StructureLink> = room.memory.blueprint?.structures[BLUEPRINT_STRUCTURE.LINK3] as Id<StructureLink>;
  if (!linkId) return;

  return getObjectById(linkId);
};

export const getBaseTower = (room: Room) => {
  const towerId: Id<StructureTower> = room.memory.blueprint?.structures[
    BLUEPRINT_STRUCTURE.TOWER1
  ] as Id<StructureTower>;
  if (!towerId) return;

  return getObjectById(towerId);
};

export const getTowersLink = (room: Room) => {
  const linkId: Id<StructureLink> = room.memory.blueprint?.structures[BLUEPRINT_STRUCTURE.LINK5] as Id<StructureLink>;
  if (!linkId) return;

  return getObjectById(linkId);
};
