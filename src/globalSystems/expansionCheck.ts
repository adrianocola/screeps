import { EXPANSION_TICKS_LIMIT } from 'consts';

const globalExpansionCheck: ExpansionCheckGlobalSystem = {
  interval: TICKS.TICK_10000,
  name: GLOBAL_SYSTEMS.EXPANSION_CHECK,
  cancelExpansion() {
    if (!Memory.global.expanding) return;

    const toMemory = Memory.rooms[Memory.global.expanding.to];
    toMemory.expansionAttempts = (toMemory.expansionAttempts || 0) + 1;
    delete Memory.global.expanding;
  },
  run() {
    if (Memory.global.expanding) {
      // considere a failure
      if (Game.time - Memory.global.expanding.tick >= EXPANSION_TICKS_LIMIT) {
        this.cancelExpansion();
        Game.notify(
          `Canceled expansion from room ${Memory.global.expanding.from} to ${Memory.global.expanding.to} due to time limit.`,
        );
      }
      return;
    }

    // TODO also check if the room is not under attack or any other emergency state
    const elegibleRooms = Object.values(Game.rooms).filter(
      room =>
        room.controller?.my &&
        room.controller.level >= 6 &&
        (room.storage?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0) >= 20_000,
    );

    let bestResult = { from: '', to: '', score: 0 };
    for (const elegibleRoom of elegibleRooms) {
      const exities = Game.map.describeExits(elegibleRoom.name);
      const sortedNeighbourRooms = Object.values(exities)
        .map(roomName => Memory.rooms[roomName])
        .sort((a, b) => (b.scan?.score ?? 0) - (a.scan?.score ?? 0));
      const bestNeighbour = sortedNeighbourRooms[0];
      const bestNeighbourScore = bestNeighbour.scan?.score ?? 0;
      if (bestNeighbourScore > bestResult.score) {
        bestResult = { from: elegibleRoom.name, to: bestNeighbour.name, score: bestNeighbourScore };
      }
    }

    if (!bestResult.score) return;

    Memory.global.expanding = {
      from: bestResult.from,
      to: bestResult.to,
      tick: Game.time,
      status: EXPANSION_STATUS.CLEANNING,
    };
  },
};

export default globalExpansionCheck;
