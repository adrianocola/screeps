import buildSystem from './build';
import BlueprintScanner from 'blueprints/BlueprintScanner';
import Blueprints from 'blueprints/Blueprints';
import { getObjectById, getRootSpawn } from 'utils/game';
import { getBlueprintDirection } from 'utils/blueprint';
import { getOppositeBaseDirection, getRelativePosition, rotateDirection } from 'utils/directions';

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
    const memoryBlueprint = room.memory.blueprint.schemas[blueprint.id];
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

/**
 * Create construction sites based on the blueprint schema
 */
const systemBlueprint: RoomSystem = {
  interval: TICKS.TICK_100,
  name: ROOM_SYSTEMS.BLUEPRINT,
  requiredFeatures: {
    [ROOM_FEATURE.CONTROLLED]: true,
  },
  run(room: Room) {
    if (!room.controller || !room.controller?.my || !room.memory.state) return;

    let memoryBlueprint = room.memory.blueprint;

    if (!memoryBlueprint) {
      const rootSpawn = getRootSpawn();
      const isRootSpawnRoom = room.name === rootSpawn.room.name;

      const blueprintResults = new BlueprintScanner(room.name).scan(isRootSpawnRoom ? rootSpawn : undefined);
      const schemas: Partial<Record<BLUEPRINT_ID, RoomMemoryBlueprintSchema>> = {};
      Object.entries(blueprintResults).map(([blueprintId, blueprintResult]) => {
        schemas[blueprintId as BLUEPRINT_ID] = {
          dir: blueprintResult.dir,
          pos: { x: blueprintResult.x, y: blueprintResult.y },
        };
      });

      memoryBlueprint = {
        schemas,
        version: 1,
        structures: {},
      };
    }

    if (!memoryBlueprint) return;

    const level = room.controller.level || 0;
    let forceScan = false;

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
            ? getObjectById(memoryBlueprint.structures[item.supersededBy] as Id<Structure>)
            : undefined;

          if (!builtStructureId && supersededStructure) return;

          // check is the structure continues to exist (its ID is already in memory)
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
              if (structure.structureType === item.structure) {
                return;
              }

              structure.destroy();
              delete memoryBlueprint.structures[item.id];
            }
          }

          // check if the structure was build or if there is some other structure in its place
          const itemPos = { x: memorySchema.pos.x + x, y: memorySchema.pos.y + y };
          const structures = room.lookForAt(LOOK_STRUCTURES, itemPos.x, itemPos.y);
          for (const structure of structures) {
            if (structure.structureType === item.structure) {
              memoryBlueprint.structures[item.id] = structure.id;
              forceScan = true;
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

    if (forceScan) {
      room.memory.forceRun[ROOM_SYSTEMS.SCAN] = true;
    }

    room.memory.blueprint = memoryBlueprint;
  },
};

export default systemBlueprint;

// FAZER BLUEPRINT CONSIDERAR CONSTRUCTED WALLS!!!
