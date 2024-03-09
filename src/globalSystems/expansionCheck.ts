import {
  EXPANSION_COUNTDOWN_SCORE,
  EXPANSION_MIN_STORAGE_ENERGY,
  EXPANSION_REQUIRED_FEATURE,
  EXPANSION_START_COUNTDOWN,
} from 'consts';
import { getRoomNeighbours } from 'utils/room';

const globalExpansionCheck: ExpansionCheckGlobalSystem = {
  interval: TICKS.TICK_10000,
  name: GLOBAL_SYSTEMS.EXPANSION_CHECK,
  resetExpansion() {
    delete Memory.global.expanding;
    Memory.global.expansionCountdown = EXPANSION_START_COUNTDOWN;
  },
  completeExpansion() {
    if (!Memory.global.expanding) return;

    const { from, to } = Memory.global.expanding;
    Game.notify(`Completed expansion from room ${from} to ${to} in ${Game.time - Memory.global.expanding.tick} ticks.`);
    this.resetExpansion();
  },
  cancelExpansion(reason = 'unknown') {
    if (!Memory.global.expanding) return;

    const toMemory = Memory.rooms[Memory.global.expanding.to];
    toMemory.expansionAttempts = (toMemory.expansionAttempts || 0) + 1;
    Game.notify(
      `Canceled expansion from room ${Memory.global.expanding.from} to ${Memory.global.expanding.to}: ${reason}.`,
    );
    this.resetExpansion();
  },
  run() {
    if (Memory.global.expanding) return;

    const controlledRoomsCount = Object.values(Game.rooms).filter(room => room.controller?.my).length;

    // TODO if avg CPU is too high, also don't expand
    if (!controlledRoomsCount || controlledRoomsCount >= Game.gcl.level - 1) return;

    if (Memory.global.expansionCountdown > 0) {
      Memory.global.expansionCountdown -= 1;
    }

    // TODO also check if the room is not under attack or any other emergency state
    const elegibleFromRooms = Object.values(Game.rooms).filter(
      room =>
        room.controller?.my &&
        room.memory.scan?.features?.[EXPANSION_REQUIRED_FEATURE] &&
        (room.storage?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0) >= EXPANSION_MIN_STORAGE_ENERGY,
    );

    if (!elegibleFromRooms.length) return;

    const expansionCountdown = Memory.global.expansionCountdown ?? 0;
    const minScore = expansionCountdown * EXPANSION_COUNTDOWN_SCORE;

    // best result following the rules (in order)
    //    - best score (respecting minScore)
    //    - closest room
    //    - highest level
    let bestResult = { from: '', to: '', score: 0, distance: 1000, level: 0 };
    for (const elegibleFromRoom of elegibleFromRooms) {
      const neighbourRooms = getRoomNeighbours(elegibleFromRoom.name, 2);
      const sortedNeighbourRooms = neighbourRooms
        .map(roomName => Memory.rooms[roomName])
        .sort((a, b) => (b.scan?.score ?? 0) - (a.scan?.score ?? 0));

      const bestNeighbour = sortedNeighbourRooms[0];
      const bestNeighbourScore = bestNeighbour.scan?.score ?? 0;

      if (bestNeighbourScore < minScore) continue;
      if (bestNeighbourScore < bestResult.score) continue;

      const distance = Game.map.getRoomLinearDistance(elegibleFromRoom.name, bestNeighbour.name);
      if (bestNeighbourScore === bestResult.score && distance > bestResult.distance) continue;

      const level = elegibleFromRoom.controller?.level ?? 0;
      if (distance === bestResult.distance && level < bestResult.level) continue;

      bestResult = { from: elegibleFromRoom.name, to: bestNeighbour.name, score: bestNeighbourScore, distance, level };
    }

    if (!bestResult.score || bestResult.score <= 0) return;

    Memory.global.expansionCountdown = EXPANSION_START_COUNTDOWN;
    Memory.global.expanding = {
      from: bestResult.from,
      to: bestResult.to,
      tick: Game.time,
      status: EXPANSION_STATUS.CLEANNING,
      score: bestResult.score,
    };
    Game.notify(
      `Started expansion from room ${bestResult.from} to ${bestResult.to} in ${Game.time}. Score: ${bestResult.score}.`,
    );
  },
};

export default globalExpansionCheck;
