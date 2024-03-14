import spawnSystem from './spawn';
import creepExplorer from 'creepTypes/explorer';
import { EXPLORE_TICKS_INTERVAL } from 'consts';

const getExploreQueue = (roomName: string, levels: number, fromRoom?: string): string[] => {
  const queue: string[] = [roomName];
  if (!levels) return queue;

  const exits = Game.map.describeExits(roomName);

  for (const exitDir in exits) {
    const exitRoom = exits[exitDir as ExitKey]!;

    // no need to go to rooms already in the queue
    if (exitRoom === fromRoom) continue;

    // no need to go to rooms that are already controlled by me
    if (Game.rooms[exitRoom]?.controller?.my) continue;

    queue.push(...getExploreQueue(exitRoom, levels - 1, roomName));
    queue.push(roomName);
  }

  return queue;
};

const getExploreDataForRoom = (roomName: string, levels: number): RoomMemoryExplore => {
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
      room.memory.explore = getExploreDataForRoom(room.name, 4);
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
