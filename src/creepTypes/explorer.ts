import scanRoomScore from 'roomSystems/scan/scanRoomScore';
import { shuffleArray } from 'utils/random';
import { moveToRoom } from 'utils/worker';

const getRandomNeighbourRoom = (creep: Creep): string | undefined => {
  const exities = Game.map.describeExits(creep.room.name);
  const exitDirs = shuffleArray(Object.keys(exities));
  for (const dir of exitDirs) {
    const roomName = exities[dir as ExitKey]!;
    const exitToRoom = creep.room.findExitTo(roomName);
    const closestExit = creep.pos.findClosestByPath(exitToRoom as ExitConstant);
    if (closestExit) return roomName;
  }

  return undefined;
};

const creepTypeExporer: CreepType = {
  name: CREEP_TYPE.EXPLORER,
  maxSections: 1,
  sectionParts: {
    [TOUGH]: 1,
    [MOVE]: 1,
  },
  run(creep) {
    creep.notifyWhenAttacked(false);

    // explore queue is empty, so just move to a random neighbour room
    if (creep.memory.workRoom) {
      if (creep.room.name === creep.memory.workRoom) {
        creep.memory.workRoom = getRandomNeighbourRoom(creep);
      } else {
        moveToRoom(creep, creep.memory.workRoom);
      }

      return;
    }

    // explore queue is empty, so just move to a random neighbour room
    const explore = Memory.rooms[creep.memory.roomName]?.explore;
    if (!explore?.queue?.length) {
      creep.memory.workRoom = getRandomNeighbourRoom(creep);
      return;
    }

    // if the explorer just spawned and have a last room set, it means it died while exploring
    // so removes that room and any rooms that depend on it from the explore queue
    if ((creep.ticksToLive ?? 0) >= CREEP_LIFE_TIME - 1 && explore.last && explore.last !== creep.memory.roomName) {
      const lastRoomIndex = explore.queue.lastIndexOf(explore.last);
      if (lastRoomIndex !== -1) {
        explore.queue = explore.queue.slice(lastRoomIndex + 1);
      }
    }

    if (creep.room.name === explore.queue[0]) {
      const roomName = explore.queue[0];
      explore.queue = explore.queue.slice(1);

      // if this is the last time the explorer entered this room, force a score calculation
      if (explore.queue.indexOf(roomName) === -1) {
        const roomMemoryScan = Memory.rooms[roomName]?.scan;
        const room = Game.rooms[roomName];
        if (roomMemoryScan && room) {
          roomMemoryScan.score = scanRoomScore(room, roomMemoryScan.sources, roomMemoryScan.mineral);
        }
      }
    }

    if (explore.queue[0]) {
      moveToRoom(creep, explore.queue[0]);
    }

    explore.last = creep.room.name;
  },
};

export default creepTypeExporer;
