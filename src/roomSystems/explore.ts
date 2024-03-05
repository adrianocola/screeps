import spawnSystem from './spawn';
import creepExplorer from 'creepTypes/explorer';
import { EXPLORE_TICKS_INTERVAL } from 'consts';

export const getExploreQueue = (roomName: string, levels = 0): string[] => {
  const queue: string[] = [roomName];
  if (!levels) return queue;

  const exits = Game.map.describeExits(roomName);

  for (const exitDir in exits) {
    const exitRoom = exits[exitDir as ExitKey]!;

    // no need to go to rooms that are already discovered
    if (Game.rooms[exitRoom]) continue;

    queue.push(...getExploreQueue(exitRoom, levels - 1));
    queue.push(roomName);
  }

  return queue;
};

export const getExploreDataForRoom = (roomName: string, levels = 1): RoomMemoryExplore => {
  return {
    queue: getExploreQueue(roomName, levels),
    tick: Game.time,
  };
};

const systemExplore: RoomSystem = {
  interval: TICKS.TICK_100,
  name: ROOM_SYSTEMS.EXPLORE,
  requiredFeatures: {
    [ROOM_FEATURE.BASIC]: false,
    [ROOM_FEATURE.CONTROLLED]: true,
    [ROOM_FEATURE.STORAGE]: true,
  },
  run(room: Room) {
    // create the need to explore every EXPLORE_TICKS_INTERVAL ticks
    if (!room.memory.explore || Game.time - room.memory.explore.tick >= EXPLORE_TICKS_INTERVAL) {
      room.memory.explore = getExploreDataForRoom(room.name, 2);
    }

    if (room.memory.explore.queue.length) {
      spawnSystem.spawn(room, creepExplorer.name, creepExplorer.name, 1, 50, {
        memory: {
          type: creepExplorer.name,
          demandId: creepExplorer.name,
          roomName: room.name,
        },
      });
    } else {
      spawnSystem.removeSpawn(room, creepExplorer.name);
    }
  },
};

export default systemExplore;
