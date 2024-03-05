import { moveTo, suicide } from 'utils/creep';
import scanRoomScore from 'roomSystems/scan/scanRoomScore';

const creepTypeExporer: CreepType = {
  name: CREEP_TYPE.EXPLORER,
  maxSections: 1,
  sectionParts: {
    [TOUGH]: 1,
    [MOVE]: 1,
  },
  run(creep) {
    creep.notifyWhenAttacked(false);

    const explore = Memory.rooms[creep.memory.roomName]?.explore;
    if (!explore?.queue?.length) {
      suicide(creep);
      return;
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
      const target = new RoomPosition(25, 25, explore.queue[0]);
      moveTo(creep, target);
    }
  },
};

export default creepTypeExporer;
