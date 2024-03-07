import buildSystem from './build';
import BlueprintScanner from 'blueprints/BlueprintScanner';
import Blueprints from 'blueprints/Blueprints';
import { getObjectById, getRootSpawn } from 'utils/game';
import { getBlueprintDirection, getBlueprintRoadsToLevel, getSpawn1 } from 'utils/blueprint';
import { getOppositeBaseDirection, getPosIndex, getRelativePosition, rotateDirection } from 'utils/directions';
import { BLUEPRINT_START_BUILDING_ROADS_LEVEL, ROOM_SIZE } from 'consts';

// check is room pos is empty (not wall, blocking building or blueprint planned structure)
export const isPosEmptyForSpawning = (room: Room, pos: Pos) => {
  const foundAtList = room.lookAt(pos.x, pos.y);
  for (const found of foundAtList) {
    if (found.type === LOOK_STRUCTURES) {
      if (
        found.structure?.structureType === STRUCTURE_ROAD ||
        found.structure?.structureType === STRUCTURE_CONTAINER ||
        (found.structure?.structureType === STRUCTURE_RAMPART && (found.structure as StructureRampart)?.my)
      ) {
        continue;
      }
      return false;
    } else if (found.type === LOOK_TERRAIN) {
      if (found.terrain === 'wall') return false;
    }
  }

  if (!room.memory.blueprint) return true;

  for (const blueprint of Blueprints) {
    const memoryBlueprint = room.memory.blueprint.schemas?.[blueprint.id];
    if (!memoryBlueprint) continue;

    // first check if the blueprint and pos can even overlap before doing more complex checks
    const biggerSize = Math.max(blueprint.width, blueprint.height);
    if (memoryBlueprint.pos.x + biggerSize < pos.x || memoryBlueprint.pos.x - biggerSize > pos.x) continue;
    if (memoryBlueprint.pos.y + biggerSize < pos.y || memoryBlueprint.pos.y - biggerSize > pos.y) continue;

    const blueprintOriented = BlueprintScanner.blueprintToDirection(blueprint, memoryBlueprint.dir);
    for (let x = 0; x < blueprintOriented.width; x++) {
      for (let y = 0; y < blueprintOriented.height; y++) {
        const item = blueprintOriented.schema[y][x];
        if (item) {
          const itemPos = { x: memoryBlueprint.pos.x + x, y: memoryBlueprint.pos.y + y };
          if (item.structure === STRUCTURE_ROAD || item.structure === STRUCTURE_CONTAINER) continue;
          if (pos.x === itemPos.x && pos.y === itemPos.y) return false;
        }
      }
    }
  }

  return true;
};

export const checkSpawnDir = (spawn: StructureSpawn, dir: DirectionConstant): DirectionConstant | undefined => {
  const pos = getRelativePosition(spawn.pos, dir);
  return isPosEmptyForSpawning(spawn.room, pos) ? dir : undefined;
};

const checkAllSpawnDirs = (spawn: StructureSpawn, dir: DirectionConstant, rotate: DIRECTION_ROTATION) =>
  [
    checkSpawnDir(spawn, rotateDirection(dir, rotate, 3)),
    checkSpawnDir(spawn, rotateDirection(dir, rotate, 4)),
    checkSpawnDir(spawn, rotateDirection(dir, rotate, 2)),
    checkSpawnDir(spawn, rotateDirection(dir, rotate, 1)),
    checkSpawnDir(spawn, rotateDirection(dir, rotate, 5)),
  ].filter(Boolean) as DirectionConstant[];

// Set spawn directions based on the blueprint schema (each spawn have different positions)
const setSpawnDirections = (spawn: StructureSpawn) => {
  if (spawn.memory.dirs) return;

  const blueprintDir = getBlueprintDirection(spawn.room, BLUEPRINT_ID.BASE);
  if (spawn.id === spawn.room.memory.blueprint?.structures[BLUEPRINT_STRUCTURE.SPAWN1]) {
    const oppositeDir = getOppositeBaseDirection(blueprintDir);
    spawn.memory.dirs = checkAllSpawnDirs(spawn, oppositeDir, DIRECTION_ROTATION.ROTATE_COUNTER_CLOCKWISE);
    spawn.memory.fixedDirs = [rotateDirection(blueprintDir, DIRECTION_ROTATION.ROTATE_COUNTER_CLOCKWISE, 3)];
  } else if (spawn.id === spawn.room.memory.blueprint?.structures[BLUEPRINT_STRUCTURE.SPAWN2]) {
    spawn.memory.dirs = checkAllSpawnDirs(spawn, blueprintDir, DIRECTION_ROTATION.ROTATE_CLOCKWISE);
    spawn.memory.fixedDirs = [rotateDirection(blueprintDir, DIRECTION_ROTATION.ROTATE_COUNTER_CLOCKWISE, 1)];
  } else if (spawn.id === spawn.room.memory.blueprint?.structures[BLUEPRINT_STRUCTURE.SPAWN3]) {
    const oppositeDir = getOppositeBaseDirection(blueprintDir);
    spawn.memory.dirs = checkAllSpawnDirs(spawn, oppositeDir, DIRECTION_ROTATION.ROTATE_CLOCKWISE);
  }
};

const createMemoryBlueprintSchemas = (room: Room, spawn?: StructureSpawn) => {
  const blueprintResults = new BlueprintScanner(room.name).scan(spawn);
  const schemas: Partial<Record<BLUEPRINT_ID, RoomMemoryBlueprintSchema>> = {};
  Object.entries(blueprintResults).map(([blueprintId, blueprintResult]) => {
    schemas[blueprintId as BLUEPRINT_ID] = {
      dir: blueprintResult.dir,
      pos: { x: blueprintResult.x, y: blueprintResult.y },
    };
  });

  return schemas;
};

const destroyConstructedWalls = (room: Room) => {
  const constructedWalls = room.find(FIND_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_WALL && s.hits,
  });
  for (const wall of constructedWalls) {
    // don't destroy walls close to exities
    if (wall.pos.x <= 2 || wall.pos.x >= ROOM_SIZE - 3 || wall.pos.y <= 2 || wall.pos.y >= ROOM_SIZE - 3) {
      continue;
    }

    wall.destroy();
  }
};

const getOrInitializeMemoryBlueprint = (room: Room) => {
  // initialize the memory
  if (!room.memory.blueprint) {
    destroyConstructedWalls(room);
    const rootSpawn = getRootSpawn();
    room.memory.blueprint = {
      schemas: createMemoryBlueprintSchemas(room, room.name === rootSpawn.room.name ? rootSpawn : undefined),
      v: 1,
      structures: {},
    };
  }

  // if the schemas were deleted from memory (manually), initialize them (usefull to recalculate the schema)
  // TODO recalculate automatically if the version changes, also do it by controller level instead of all at wonce
  if (!room.memory.blueprint.schemas) {
    const spawn = getSpawn1(room);
    room.memory.blueprint.schemas = createMemoryBlueprintSchemas(room, spawn);
  }

  return room.memory.blueprint;
};

/**
 * Create construction sites based on the blueprint schema
 */
const systemBlueprint: RoomSystem = {
  interval: TICKS.TICK_500,
  name: ROOM_SYSTEMS.BLUEPRINT,
  requiredFeatures: {
    [ROOM_FEATURE.CONTROLLED]: true,
  },
  run(room: Room) {
    if (!room.controller || !room.controller?.my || !room.memory.scan) return;

    const memoryBlueprint = getOrInitializeMemoryBlueprint(room);

    const level = room.controller.level || 0;

    Blueprints.forEach(blueprint => {
      if (level < blueprint.controller) return;

      const memorySchema = memoryBlueprint?.schemas?.[blueprint.id];
      if (!memorySchema) return;

      const blueprintOriented = BlueprintScanner.blueprintToDirection(blueprint, memorySchema?.dir);
      blueprintOriented.schema.forEach((row, y) => {
        row.forEach((item, x) => {
          if (!item || level < item.controller || !memoryBlueprint) return;

          const builtStructureId = memoryBlueprint.structures[item.id];
          const supersededStructure = item.supersededBy
            ? getObjectById(memoryBlueprint.structures[item.supersededBy])
            : undefined;

          if (!builtStructureId && supersededStructure) return;

          const itemPos = { x: memorySchema.pos.x + x, y: memorySchema.pos.y + y };

          // check if the structure continues to exist (its ID is already in memory)
          if (builtStructureId) {
            const structure = getObjectById(memoryBlueprint.structures[item.id] as Id<Structure>);

            if (structure) {
              if (structure.structureType === STRUCTURE_SPAWN) {
                setSpawnDirections(structure as StructureSpawn);
              }
              if (supersededStructure) {
                structure.destroy();
                delete memoryBlueprint.structures[item.id];
                return;
              }
              if (
                structure.structureType === item.structure &&
                itemPos.x === structure.pos.x &&
                itemPos.y === structure.pos.y
              ) {
                return;
              }

              structure.destroy();
              delete memoryBlueprint.structures[item.id];
            } else {
              delete memoryBlueprint.structures[item.id];
            }
          }

          // check if the structure was build or if there is some other structure in its place
          const structures = room.lookForAt(LOOK_STRUCTURES, itemPos.x, itemPos.y);
          for (const structure of structures) {
            if (structure.structureType === item.structure) {
              memoryBlueprint.structures[item.id] = structure.id;
              return;
            }

            if (structure.structureType !== STRUCTURE_ROAD && structure.structureType !== STRUCTURE_RAMPART) {
              structure.destroy();
            }
          }

          // create the construction site (if it doesn't exist)
          const constructionSites = room.lookForAt(LOOK_CONSTRUCTION_SITES, itemPos.x, itemPos.y);
          for (const constructionSite of constructionSites) {
            if (constructionSite.structureType === item.structure) {
              return;
            }

            if (
              constructionSite.structureType !== STRUCTURE_ROAD &&
              constructionSite.structureType !== STRUCTURE_RAMPART
            ) {
              constructionSite.remove();
            }
          }

          buildSystem.createConstructionSite(room, itemPos, item.structure, item.priority);
        });
      });
    });

    if (level >= BLUEPRINT_START_BUILDING_ROADS_LEVEL) {
      const blueprintRoadsPos = getBlueprintRoadsToLevel(room, level);
      const builtRoads = room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_ROAD } });
      const builtRoadsPosMap = builtRoads.reduce(
        (acc, road) => {
          acc[getPosIndex(road.pos)] = true;
          return acc;
        },
        {} as Record<string, boolean>,
      );

      for (const road of blueprintRoadsPos) {
        for (const roadPos of road) {
          if (builtRoadsPosMap[getPosIndex(roadPos)]) continue;

          const constructionSites = room.lookForAt(LOOK_CONSTRUCTION_SITES, roadPos.x, roadPos.y);
          if (!constructionSites.length) {
            const isSwamp = room.lookForAt(LOOK_TERRAIN, roadPos.x, roadPos.y).some(terrain => terrain === 'swamp');
            buildSystem.createConstructionSite(room, roadPos, STRUCTURE_ROAD, isSwamp ? 1 : 2);
          }
        }
      }
    }

    room.memory.blueprint = memoryBlueprint;
  },
};

export default systemBlueprint;
