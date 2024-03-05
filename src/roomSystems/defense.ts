import spawnSystem from './spawn';
import { countBodyParts } from 'utils/creepBody';
import workerDefender from 'creepTypes/defender';

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
      room.memory.defense = { queue: [] };
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
