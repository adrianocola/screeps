import buildSystem from './build';
import BlueprintScanner from 'blueprints/BlueprintScanner';
import Blueprints from 'blueprints/Blueprints';
import { getObjectById, getRootSpawn } from 'utils/game';
import { getBlueprintDirection } from 'utils/blueprint';
import { rotateDirection } from 'utils/directions';

const setSpawnDirections = (spawn: StructureSpawn) => {
  if (spawn.memory.dirs) return;
  if (spawn.id === spawn.room.memory.blueprint?.structures[BLUEPRINT_STRUCTURE.SPAWN3]) return;

  const blueprintDir = getBlueprintDirection(spawn.room, BLUEPRINT_ID.BASE);
  if (spawn.id === spawn.room.memory.blueprint?.structures[BLUEPRINT_STRUCTURE.SPAWN1]) {
    spawn.memory.dirs = [
      rotateDirection(blueprintDir, DIRECTION_ROTATION.ROTATE_COUNTER_CLOCKWISE, 1),
      blueprintDir,
      rotateDirection(blueprintDir, DIRECTION_ROTATION.ROTATE_CLOCKWISE, 1),
      rotateDirection(blueprintDir, DIRECTION_ROTATION.ROTATE_CLOCKWISE, 2),
      rotateDirection(blueprintDir, DIRECTION_ROTATION.ROTATE_CLOCKWISE, 3),
    ];
    spawn.memory.fixedDirs = [rotateDirection(blueprintDir, DIRECTION_ROTATION.ROTATE_COUNTER_CLOCKWISE, 3)];
  } else if (spawn.id === spawn.room.memory.blueprint?.structures[BLUEPRINT_STRUCTURE.SPAWN2]) {
    spawn.memory.dirs = [
      rotateDirection(blueprintDir, DIRECTION_ROTATION.ROTATE_CLOCKWISE, 1),
      rotateDirection(blueprintDir, DIRECTION_ROTATION.ROTATE_CLOCKWISE, 2),
      rotateDirection(blueprintDir, DIRECTION_ROTATION.ROTATE_CLOCKWISE, 3),
      rotateDirection(blueprintDir, DIRECTION_ROTATION.ROTATE_CLOCKWISE, 4),
      rotateDirection(blueprintDir, DIRECTION_ROTATION.ROTATE_CLOCKWISE, 5),
    ];
    spawn.memory.fixedDirs = [rotateDirection(blueprintDir, DIRECTION_ROTATION.ROTATE_COUNTER_CLOCKWISE, 1)];
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

          if (memoryBlueprint.structures[item.id]) {
            const structure = getObjectById(memoryBlueprint.structures[item.id] as Id<Structure>);
            if (structure) {
              if (structure.structureType === item.structure) {
                if (structure.structureType === STRUCTURE_SPAWN) {
                  setSpawnDirections(structure as StructureSpawn);
                }
                return;
              }

              structure.destroy();
              delete memoryBlueprint.structures[item.id];
            }
          }

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
