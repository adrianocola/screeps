import backup from './backup';
import build from './build';
import collect from './collect';
import creeps from './creeps';
import custom from './custom';
import defense from './defense';
import distribute from './distribute';
import fix from './fix';
import harvest from './harvest';
import heal from './heal';
import mine from './mine';
import spawn from './spawn';
import transfer from './transfer';
import upgrade from './upgrade';
import blueprint from './blueprint';
import scan from './scan';
import structures from './structures';
import visuals from './visuals';

import { SIMULATOR_ROOM } from 'consts';

// execution order ⬇️
export const SYSTEMS: Partial<Record<ROOM_SYSTEMS, RoomSystem>> = {
  [ROOM_SYSTEMS.BLUEPRINT]: blueprint,
  [ROOM_SYSTEMS.BACKUP]: backup,
  [ROOM_SYSTEMS.BUILD]: build,
  [ROOM_SYSTEMS.COLLECT]: collect,
  [ROOM_SYSTEMS.DEFENSE]: defense,
  [ROOM_SYSTEMS.DISTRIBUTE]: distribute,
  [ROOM_SYSTEMS.FIX]: fix,
  [ROOM_SYSTEMS.HARVEST]: harvest,
  [ROOM_SYSTEMS.HEAL]: heal,
  [ROOM_SYSTEMS.TRANSFER]: transfer,
  [ROOM_SYSTEMS.MINE]: mine,
  [ROOM_SYSTEMS.UPGRADE]: upgrade,
  [ROOM_SYSTEMS.SCAN]: scan,
  [ROOM_SYSTEMS.SPAWN]: spawn, // must happen after all other systems might have requested something to spawn
  [ROOM_SYSTEMS.CREEPS]: creeps,
  [ROOM_SYSTEMS.STRUCTURES]: structures,
  [ROOM_SYSTEMS.CUSTOM]: custom,
  [ROOM_SYSTEMS.VISUALS]: visuals, // must be last
};

const getCreepsGroupedByRoomAndRole = () => {
  const roomCreeps: { [index: string]: { [index: string]: Creep[] } } = {};

  Object.values(Game.creeps).forEach(creep => {
    if (!(creep.name in Game.creeps)) {
      delete Memory.creeps[creep.name];
    }

    const roomName = creep.memory?.worker?.roomName;
    const jobName = creep.memory?.worker?.type;
    if (!roomName || !jobName) return;

    const room = roomCreeps[roomName] || {};
    const jobArray = room[jobName] || [];
    jobArray.push(creep);
    room[jobName] = jobArray;
    roomCreeps[roomName] = room;
  });

  return roomCreeps;
};

// TODO create creeps replacements before the old one dies

const roomSystems = () => {
  const groupedCreeps = getCreepsGroupedByRoomAndRole();

  for (const roomId in Game.rooms) {
    const start = Game.cpu.getUsed();
    const room: Room = Game.rooms[roomId];

    if (!room.memory) room.memory = { lastRuns: {}, forceRun: {}, name: room.name, duration: 0 };
    if (!room.memory.lastRuns) room.memory.lastRuns = {};
    if (!room.memory.forceRun) room.memory.forceRun = {};
    if (!room.memory.name) room.memory.name = room.name;

    const roomCreeps = groupedCreeps[roomId] || {};

    if (!room.memory.state) scan.run(room, roomCreeps); // force a initial scan

    const roomFeatures = room.memory.state?.features;
    const roomOwnership = room.memory.state?.ownership;

    const controllerLevel = room.controller?.level ?? 0;

    for (const systemName in SYSTEMS) {
      const system = SYSTEMS[systemName as ROOM_SYSTEMS];
      if (!system) continue;

      const lastRun = room.memory.lastRuns[systemName];
      const forceRun = !!room.memory.forceRun[systemName as ROOM_SYSTEMS];
      const isSimulatorRoom = room.name === SIMULATOR_ROOM;
      if (
        !forceRun &&
        !isSimulatorRoom && // force run all systems in simulator room
        (!roomFeatures || (lastRun && Game.time < lastRun + system.interval))
      )
        continue;

      if (forceRun) {
        room.memory.forceRun[systemName as ROOM_SYSTEMS] = false;
      }

      const haveControllerLevel = !system.controllerLevel || system.controllerLevel >= controllerLevel;

      const haveRequiredFeatures =
        !system.requiredFeatures ||
        Object.entries(system.requiredFeatures).every(([feature, reqValue]) => {
          return roomFeatures?.[feature as ROOM_FEATURE] === reqValue;
        });

      const haveRequiredOwnership =
        !system.requiredOwnership || system.requiredOwnership.some(ownership => ownership === roomOwnership);

      if (haveControllerLevel && haveRequiredFeatures && haveRequiredOwnership) {
        system.run(room, roomCreeps);
        room.memory.lastRuns[systemName] = Game.time;
      }
    }

    room.memory.duration = Game.cpu.getUsed() - start;
  }
};

export default roomSystems;
