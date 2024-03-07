import expansionCheckSystem from './expansionCheck';
import spawnSystem from 'roomSystems/spawn';
import claimerCreepType from 'creepTypes/claimer';
import cleanerCreepType from 'creepTypes/cleaner';
import basicCreepType from 'creepTypes/basic';
import { getBaseSpawnContainer, getBaseTower } from 'utils/blueprint';
import { INVADER } from 'consts';
import { getBodyPartsMap } from 'utils/creepBody';

const globalExpand: GlobalSystem = {
  interval: TICKS.TICK_20,
  name: GLOBAL_SYSTEMS.EXPAND,
  run() {
    if (!Memory.global.expanding || Memory.global.expanding.status === EXPANSION_STATUS.COMPLETED) return;

    const { status, from, to } = Memory.global.expanding;
    const fromRoom = Game.rooms[from];
    if (!fromRoom) {
      // lost access to source room, cancel expansion
      delete Memory.global.expanding;
      return;
    }

    const toRoom = Game.rooms[to] as Room | undefined;
    if (toRoom && toRoom.controller?.my && toRoom.controller?.level >= 3) {
      const spawnContainer = getBaseSpawnContainer(toRoom);
      if (spawnContainer) {
        Memory.global.expanding.status = EXPANSION_STATUS.COMPLETED;
        Game.notify(
          `Completed expansion from room ${from} to ${to} in ${Game.time - Memory.global.expanding.tick} ticks.`,
        );
        return;
      }
    }

    // always keeps a cleaner around, to prevent invaders and keep the room loaded
    const structures = toRoom?.find(FIND_HOSTILE_STRUCTURES) ?? [];
    const mainTower = toRoom ? getBaseTower(toRoom) : undefined;
    if (mainTower) {
      spawnSystem.removeSpawn(fromRoom, cleanerCreepType.name);
    } else {
      const totalHits = structures.reduce((acc, structure) => acc + structure.hits, 0);
      const cleannerQuantity = Math.min(3, Math.ceil(totalHits / 2_000_000)) || 1;
      spawnSystem.spawn(fromRoom, cleanerCreepType.name, cleanerCreepType.name, cleannerQuantity, 50, {
        memory: {
          type: cleanerCreepType.name,
          demandId: cleanerCreepType.name,
          roomName: from,
          workRoom: to,
        },
      });
    }

    if (!toRoom) return;

    // check if there are too many enemies or big enemies in the room
    // TODO if enemies are detected, spawn a big warrior to help
    const enemies = toRoom.find(FIND_HOSTILE_CREEPS, { filter: c => c.owner.username !== INVADER });
    if (enemies.length >= 3) {
      expansionCheckSystem.cancelExpansion();
      Game.notify(`Canceled expansion from room ${from} to ${to} due to too many enemies (${enemies.length}).`);
    } else {
      const hasBigWarriors = enemies.some(enemy => {
        const bodyCounts = getBodyPartsMap(enemy);
        return (
          (bodyCounts[ATTACK] ?? 0) >= 10 || (bodyCounts[RANGED_ATTACK] ?? 0) >= 10 || (bodyCounts[HEAL] ?? 0) >= 10
        );
      });
      if (hasBigWarriors) {
        expansionCheckSystem.cancelExpansion();
        Game.notify(`Canceled expansion from room ${from} to ${to} due to big enemies.`);
      }
    }

    if (status === EXPANSION_STATUS.CLEANNING) {
      if (!structures.length) {
        Memory.global.expanding.status = EXPANSION_STATUS.CLAIMING;
        spawnSystem.removeSpawn(fromRoom, cleanerCreepType.name);
      }
    }
    if (status === EXPANSION_STATUS.CLAIMING) {
      if (toRoom.controller?.my) {
        spawnSystem.removeSpawn(fromRoom, claimerCreepType.name);
        Memory.global.expanding.status = EXPANSION_STATUS.GROWING;
      } else {
        const ticksToEnd = toRoom.controller?.reservation?.ticksToEnd ?? 0;
        const maxSections = ticksToEnd ? 5 : 1;
        spawnSystem.spawn(fromRoom, claimerCreepType.name, claimerCreepType.name, 1, 49, {
          maxSections,
          memory: {
            type: claimerCreepType.name,
            demandId: claimerCreepType.name,
            roomName: from,
            workRoom: to,
          },
        });
      }
    }
    if (status === EXPANSION_STATUS.GROWING) {
      const toRoomMemory = Memory.rooms[to];
      if (toRoomMemory.scan?.sources) {
        for (const sourceId in toRoomMemory.scan.sources) {
          const sourceData = toRoomMemory.scan.sources[sourceId];
          const demandId = `${basicCreepType.name}-E-${sourceData.index}`;
          spawnSystem.spawn(fromRoom, demandId, basicCreepType.name, 1, 48, {
            maxSections: 10,
            memory: {
              demandId,
              sourceId: sourceId as Id<Source>,
              type: basicCreepType.name,
              roomName: from,
              workRoom: to,
            },
          });
        }
      }
    }
  },
};

export default globalExpand;
