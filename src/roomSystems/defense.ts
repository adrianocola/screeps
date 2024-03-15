import spawnSystem from './spawn';
import { countBodyParts } from 'utils/creepBody';
import workerDefender from 'creepTypes/defender';
import scavengeCreepType from 'creepTypes/scavenger';
import workerHarvesterWalker from 'creepTypes/harvesterWalker';

const SCAVENGE_ENERGY_THRESHOLD = 2000;

const scavengeResources = (room: Room) => {
  let energy: number = 0;
  const tombstones = room.find(FIND_TOMBSTONES);

  const goodToScavenge = tombstones.some(tombstone => {
    energy += tombstone.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0;
    const haveResourceOtherThanEnergy = Object.keys(tombstone.store).some(r => r !== RESOURCE_ENERGY);
    return haveResourceOtherThanEnergy || energy > SCAVENGE_ENERGY_THRESHOLD;
  });

  if (!goodToScavenge) {
    spawnSystem.removeSpawn(room, scavengeCreepType.name);
    return;
  }

  spawnSystem.spawn(room, scavengeCreepType.name, workerHarvesterWalker.name, 1, 10, {
    sectionParts: {
      [CARRY]: 1,
      [MOVE]: 1,
    },
    maxSections: 10,
    memory: {
      type: scavengeCreepType.name,
      demandId: scavengeCreepType.name,
      roomName: room.name,
    },
  });
};

const systemDefense: RoomSystem = {
  interval: TICKS.TICK_2,
  name: ROOM_SYSTEMS.DEFENSE,
  requiredFeatures: {
    [ROOM_FEATURE.CONTROLLED]: true,
  },
  run(room: Room) {
    const enemies = room.find(FIND_HOSTILE_CREEPS);

    if (enemies.length) {
      const enemiesHealPartsSorted = enemies.map(e => countBodyParts(e, HEAL)).sort((a, b) => b - a);
      room.memory.defense = { queue: enemiesHealPartsSorted.map((c, i) => enemies[i].id) };
      // if (
      //   !room.controller?.safeMode &&
      //   room.controller?.safeModeAvailable &&
      //   enemies.length > 1 &&
      //   enemies.some(e => e.owner.username !== INVADER && e.body.length > 10 && countOffensiveBodyParts(e) > 0)
      // ) {
      //   const result = room.controller.activateSafeMode();
      //   if (result === ERR_BUSY) {
      //     console.log('There is another room with safe mode!');
      //   }
      // }
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
