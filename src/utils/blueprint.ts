import { getObjectById } from 'utils/game';
import Blueprints, { BlueprintsMap } from 'blueprints/Blueprints';
import { checkIsOppositeBaseDirection, getDirectionRotation, oppositePos, rotatePos } from 'utils/directions';
import BlueprintScanner from 'blueprints/BlueprintScanner';

export const getBlueprintEntrance = (room: Room, blueprintId: BLUEPRINT_ID) => {
  const memoryBlueprint = room.memory.blueprint?.schemas?.[blueprintId];
  if (!memoryBlueprint) return;

  const blueprint = BlueprintsMap[blueprintId];
  if (!blueprint || !blueprint.entrance || !blueprint.dir) return;

  let entrance;
  if (blueprint.dir === memoryBlueprint.dir) {
    entrance = blueprint.entrance;
  } else if (checkIsOppositeBaseDirection(blueprint.dir, memoryBlueprint.dir)) {
    entrance = oppositePos(blueprint.entrance, blueprint.width, blueprint.height);
  } else {
    const rotation = getDirectionRotation(blueprint.dir, memoryBlueprint.dir);
    entrance = rotatePos(blueprint.entrance, blueprint.height, blueprint.width, rotation);
  }

  return new RoomPosition(memoryBlueprint.pos.x + entrance.x, memoryBlueprint.pos.y + entrance.y, room.name);
};

const getCostMatrixAndOrientedBlueprints = (room: Room) => {
  const memoryBlueprints = room.memory.blueprint?.schemas;

  const costMatrix = new PathFinder.CostMatrix();
  const orientedBlueprints: Partial<Record<BLUEPRINT_ID, Blueprint>> = {};

  if (memoryBlueprints) {
    for (const blueprint of Blueprints) {
      const memoryBlueprint = memoryBlueprints[blueprint.id];
      if (!memoryBlueprint) continue;

      const orientedBlueprint = BlueprintScanner.blueprintToDirection(blueprint, memoryBlueprint.dir);
      orientedBlueprints[blueprint.id] = orientedBlueprint;
      for (let x = 0; x < orientedBlueprint.width; x++) {
        for (let y = 0; y < orientedBlueprint.height; y++) {
          const item = orientedBlueprint.schema[y][x];
          if (item && item.structure !== STRUCTURE_ROAD && item.structure !== STRUCTURE_CONTAINER) {
            costMatrix.set(memoryBlueprint.pos.x + x, memoryBlueprint.pos.y + y, 0xff);
          }
        }
      }
    }
  }

  return { costMatrix, orientedBlueprints };
};

export const getBlueprintRoadsToLevel = (room: Room, level: number): RoomPosition[][] => {
  const roadList: RoomPosition[][] = [];
  const memoryBlueprints = room.memory.blueprint?.schemas;
  if (!memoryBlueprints) return [];

  const { costMatrix, orientedBlueprints } = getCostMatrixAndOrientedBlueprints(room);

  const getEntrance = (blueprintId: BLUEPRINT_ID) => {
    const memoryBlueprint = memoryBlueprints[blueprintId];
    const orientedBlueprint = orientedBlueprints[blueprintId];
    if (!memoryBlueprint || !orientedBlueprint) return undefined;

    return new RoomPosition(
      memoryBlueprint.pos.x + (orientedBlueprint.entrance?.x ?? 0),
      memoryBlueprint.pos.y + (orientedBlueprint.entrance?.y ?? 0),
      room.name,
    );
  };

  // then geth costs/paths
  for (const blueprint of Blueprints) {
    if (blueprint.controller > level) continue;

    const orientedBlueprint = orientedBlueprints[blueprint.id];
    const memoryBlueprint = memoryBlueprints[blueprint.id];

    if (!memoryBlueprint || !orientedBlueprint || !orientedBlueprint.entrance || !orientedBlueprint.closeTo) continue;

    const costs = BlueprintScanner.getBlueprintCosts(
      room,
      memoryBlueprint.pos,
      orientedBlueprint,
      costMatrix,
      true,
      (_, blueprintId) => getEntrance(blueprintId),
    );

    if (!costs.length) continue;

    const entrancePos = new RoomPosition(
      orientedBlueprint.entrance.x + memoryBlueprint.pos.x,
      orientedBlueprint.entrance.y + memoryBlueprint.pos.y,
      room.name,
    );

    // include entrance in the path
    for (const cost of costs) {
      cost.path.forEach(pos => costMatrix.set(pos.x, pos.y, 1));
      roadList.push([entrancePos, ...cost.path]);
    }
  }

  return roadList;
};

export const getBlueprintDirection = (room: Room, blueprint: BLUEPRINT_ID) => {
  return room.memory.blueprint?.schemas?.[blueprint]?.dir ?? RIGHT;
};

export const getBlueprintStructureId = <T extends Structure>(
  room: Room,
  id: BLUEPRINT_STRUCTURE,
): Id<T> | undefined => {
  return room.memory.blueprint?.structures[id] as Id<T>;
};

export const getBaseEntrancePos = (room: Room) => {
  return getBlueprintEntrance(room, BLUEPRINT_ID.BASE);
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
