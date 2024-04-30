import spawnSystem from './spawn';
import { countBodyParts, countOffensiveOrHealBodyParts } from 'utils/creepBody';
import workerDefender from 'creepTypes/defender';
import scavengeCreepType from 'creepTypes/scavenger';
import workerHarvesterWalker from 'creepTypes/harvesterWalker';
import { bodySectionCost } from 'utils/worker';
import { INVADER } from 'consts';
import { countCreepTotalResources } from 'utils/creep';

const scavengeResources = (room: Room) => {
  if (!room.storage) return;

  let energy: number = 0;
  const tombstones = room.find(FIND_TOMBSTONES);
  const maxSections = 10;
  const sectionParts: BodyPartsMap<number> = {
    [CARRY]: 1,
    [MOVE]: 1,
  };
  const sectionCost = bodySectionCost(sectionParts);
  const totalCost = sectionCost * maxSections;

  const goodToScavenge = tombstones.some(tombstone => {
    energy += tombstone.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0;
    const haveResourceOtherThanEnergy = Object.keys(tombstone.store).some(r => r !== RESOURCE_ENERGY);
    return haveResourceOtherThanEnergy || energy > totalCost;
  });

  if (!goodToScavenge) return;

  spawnSystem.spawn(room, scavengeCreepType.name, workerHarvesterWalker.name, 1, 10, {
    sectionParts,
    maxSections,
    memory: {
      type: scavengeCreepType.name,
      demandId: scavengeCreepType.name,
      roomName: room.name,
    },
  });
};

const systemDefense: RoomSystem = {
  interval: TICKS.ALWAYS,
  name: ROOM_SYSTEMS.DEFENSE,
  requiredFeatures: {
    [ROOM_FEATURE.CONTROLLED]: true,
  },
  run(room: Room) {
    const enemies = room.find(FIND_HOSTILE_CREEPS);

    if (enemies.length) {
      // filter creeps that are not a threat or don't carry anything valuable (save tower energy)
      const possibleEnemies = enemies.filter((c: Creep) => {
        if (c.owner.username === INVADER) return true; // always kill invaders
        if (c.body.length <= 10) return true; // easy to kill
        if (countOffensiveOrHealBodyParts(c)) return true; // kill other players theats
        if (countCreepTotalResources(c) >= 500) return true; // creep might have something worth scavenging

        return false;
      });
      const possibleEnemiesSorted = possibleEnemies.map(e => countBodyParts(e, HEAL)).sort((a, b) => b - a);
      room.memory.defense = { queue: possibleEnemiesSorted.map((c, i) => possibleEnemies[i].id) };
      if (
        !room.controller?.safeMode &&
        room.controller?.safeModeAvailable &&
        room.controller?.my &&
        possibleEnemies.length >= 2 &&
        possibleEnemies.some(
          e => e.owner.username !== INVADER && e.body.length >= 20 && countOffensiveOrHealBodyParts(e) >= 10,
        )
      ) {
        const result = room.controller.activateSafeMode();
        if (result === ERR_BUSY) {
          console.log('There is another room with safe mode!');
        } else {
          Game.notify(`Room ${room.name} is under attack! Activate safe mode at tick ${Game.time}!`);
        }
      }
    } else {
      // if there was a queue, it means that some enemy might have died and have some resources to scavenge
      if (room.memory.defense?.queue.length) {
        scavengeResources(room);
      }

      delete room.memory.defense;
    }

    if (room.memory.scan?.features?.[ROOM_FEATURE.HAVE_TOWERS]) return;

    const demandId = workerDefender.name;

    if (enemies.length) {
      spawnSystem.spawn(room, demandId, workerDefender.name, 1, 20, {
        memory: {
          type: workerDefender.name,
          demandId: workerDefender.name,
          roomName: room.name,
        },
      });
    } else {
      spawnSystem.removeSpawn(room, demandId);
    }
  },
};

export default systemDefense;
