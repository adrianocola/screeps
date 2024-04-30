import { attack, moveTo } from 'utils/creep';
import { moveToRoomWork } from 'utils/worker';
import { BlueprintsMap } from 'blueprints/Blueprints';
import BlueprintScanner from 'blueprints/BlueprintScanner';
import { getObjectById } from 'utils/game';

const cleanerCreepType: CreepType = {
  name: CREEP_TYPE.CLEANER,
  maxSections: 10,
  sectionParts: {
    [ATTACK]: 1,
    [MOVE]: 1,
  },
  run(creep) {
    if (moveToRoomWork(creep)) return;

    let target: Creep | Structure | null | undefined = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);

    if (!target) {
      target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
        filter: { structureType: STRUCTURE_INVADER_CORE },
      });
    }

    if (!target) {
      target = creep.pos.findClosestByPath(FIND_HOSTILE_SPAWNS);
    }

    if (!target) {
      target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
        filter: structure => {
          const storeStructure = structure as AnyStoreStructure;
          if (!storeStructure.store) return true;

          return !storeStructure.store.getUsedCapacity(RESOURCE_ENERGY);
        },
      });
    }

    // if there is some structure on top of where the spawn should be, attack it
    if (!target) {
      const baseBlueprint = creep.room.memory.blueprint?.schemas?.[BLUEPRINT_ID.BASE];
      if (baseBlueprint) {
        const blueprintToDir = BlueprintScanner.blueprintToDirection(
          BlueprintsMap[BLUEPRINT_ID.BASE],
          baseBlueprint.dir,
        );
        const spawnRelPos = BlueprintScanner.getRelativeStructurePos(blueprintToDir, BLUEPRINT_STRUCTURE.SPAWN1)!;
        const spawnPos = new RoomPosition(
          baseBlueprint.pos.x + spawnRelPos.x,
          baseBlueprint.pos.y + spawnRelPos.y,
          creep.room.name,
        );
        const structure = creep.room.lookForAt(LOOK_STRUCTURES, spawnPos).find(s => 'my' in s && !s.my);
        if (structure) {
          target = getObjectById(structure.id);
        }
      }
    }

    if (target) attack(creep, target);
    else if (creep.room.controller) {
      moveTo(creep, creep.room.controller, { range: 5 });
    }
  },
};

export default cleanerCreepType;
