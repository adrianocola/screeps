import backup from './backup';
import build from './build';
import collect from './collect';
import creeps from './creeps';
import custom from './custom';
import defense from './defense';
import distribute from './distribute';
import explore from './explore';
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
import market from './market';
import neighborHarvest from './neighborHarvest';

import { SIMULATOR_ROOM } from 'consts';

type SystemsMap = Partial<Record<ROOM_SYSTEMS, RoomSystem>>;
interface CreepsMap {
  [index: string]: Creep[];
}
interface CreepsRoomMap {
  [index: string]: CreepsMap;
}

// execution order ⬇️
export const ALL_SYSTEMS: SystemsMap = {
  [ROOM_SYSTEMS.BUILD]: build, // must be the first, so it doesn't process the build requests the same tick they were created (the construction sites don't exist yet)
  [ROOM_SYSTEMS.BLUEPRINT]: blueprint,
  [ROOM_SYSTEMS.BACKUP]: backup,
  [ROOM_SYSTEMS.COLLECT]: collect,
  [ROOM_SYSTEMS.DEFENSE]: defense,
  [ROOM_SYSTEMS.DISTRIBUTE]: distribute,
  [ROOM_SYSTEMS.FIX]: fix,
  [ROOM_SYSTEMS.HARVEST]: harvest,
  [ROOM_SYSTEMS.HEAL]: heal,
  [ROOM_SYSTEMS.TRANSFER]: transfer,
  [ROOM_SYSTEMS.NEIGHBOR_HARVEST]: neighborHarvest,
  [ROOM_SYSTEMS.MINE]: mine,
  [ROOM_SYSTEMS.UPGRADE]: upgrade,
  [ROOM_SYSTEMS.EXPLORE]: explore,
  [ROOM_SYSTEMS.SCAN]: scan,
  [ROOM_SYSTEMS.MARKET]: market,
  [ROOM_SYSTEMS.SPAWN]: spawn, // must happen after all other systems might have requested something to spawn
  [ROOM_SYSTEMS.CREEPS]: creeps,
  [ROOM_SYSTEMS.STRUCTURES]: structures,
  [ROOM_SYSTEMS.CUSTOM]: custom,
  [ROOM_SYSTEMS.VISUALS]: visuals, // must be last
};

const UNCONTROLLED_SYSTEMS = Object.entries(ALL_SYSTEMS).reduce((acc, [name, system]) => {
  if (!system.requiredFeatures?.[ROOM_FEATURE.CONTROLLED]) {
    acc[name as ROOM_SYSTEMS] = system;
  }

  return acc;
}, {} as SystemsMap);

const getCreepsGroupedByRoomAndRole = () => {
  const roomCreeps: CreepsRoomMap = {};

  Object.values(Game.creeps).forEach(creep => {
    const roomName = creep.memory.roomName;
    const jobName = creep.memory.type;
    if (!roomName || !jobName) return;

    const room = roomCreeps[roomName] || {};
    const jobArray = room[jobName] || [];
    jobArray.push(creep);
    room[jobName] = jobArray;
    roomCreeps[roomName] = room;
  });

  return roomCreeps;
};

// {"event":2,"objectId":"65e0e8488793133931ce260a","data":{"type":"creep"}}
const TYPE_TEXT = '"type":';
const TYPE_CREEP = '"creep"';
const shouldScanPaths = (room: Room) => {
  if (room.memory.scanPaths || room.memory.scanPaths === undefined) return true;
  if (Game.time - (room.memory.lastRuns[ROOM_SYSTEMS.SCAN] ?? 0) >= 20_000) return true;
  if (!room.controller?.my) return false;

  // check in the event log if any structure in the room was destroyed
  const rawEventLog = room.getEventLog(true) as unknown as string;
  const destructionTypeIndex = rawEventLog.indexOf(TYPE_TEXT);
  if (destructionTypeIndex >= 0) {
    const type = rawEventLog.substring(
      destructionTypeIndex + TYPE_TEXT.length,
      destructionTypeIndex + TYPE_TEXT.length + TYPE_CREEP.length,
    );
    // if not a creep, it is a structure
    if (type !== TYPE_CREEP) return true;
  }

  return false;
};

const executeRoomSystems = (room: Room, systems: SystemsMap, roomCreeps: CreepsMap) => {
  const roomFeatures = room.memory.scan?.features ?? {};
  const roomOwnership = room.memory.scan?.ownership;

  const controllerLevel = room.controller?.level ?? 0;
  if (room.controller?.my) {
    // force running all system after a level change
    if (room.memory.level !== controllerLevel) {
      room.memory.lastRuns = {};
    }
    room.memory.level = controllerLevel;
  }

  for (const systemName in systems) {
    const system = systems[systemName as ROOM_SYSTEMS];
    if (!system) continue;

    const lastRun = room.memory.lastRuns[systemName as ROOM_SYSTEMS] ?? 0;
    const forceRun = !!room.memory.forceRun?.[systemName as ROOM_SYSTEMS];
    const isSimulatorRoom = room.name === SIMULATOR_ROOM;
    const interval = system.interval as number;
    if (
      !forceRun &&
      !isSimulatorRoom && // force run all systems in simulator room
      lastRun &&
      Game.time - lastRun < interval
    )
      continue;

    if (forceRun) {
      if (!room.memory.forceRun) room.memory.forceRun = {};
      delete room.memory.forceRun[systemName as ROOM_SYSTEMS];
    }

    const haveControllerLevel = !system.controllerLevel || system.controllerLevel >= controllerLevel;

    const haveRequiredFeatures =
      !system.requiredFeatures ||
      Object.entries(system.requiredFeatures).every(([feature, reqValue]) => {
        return reqValue === !!roomFeatures[feature as ROOM_FEATURE];
      });

    const haveRequiredOwnership =
      !system.requiredOwnership || system.requiredOwnership.some(ownership => ownership === roomOwnership);

    if (haveControllerLevel && haveRequiredFeatures && haveRequiredOwnership) {
      system.run(room, roomCreeps);
      room.memory.lastRuns[systemName as ROOM_SYSTEMS] = Game.time;
    }
  }
};

const roomSystems = () => {
  const groupedCreeps = getCreepsGroupedByRoomAndRole();

  for (const roomId in Game.rooms) {
    const start = Game.cpu.getUsed();
    const room: Room = Game.rooms[roomId];

    if (!room.memory) room.memory = { lastRuns: {}, forceRun: {}, name: room.name, duration: 0 };
    if (!room.memory.lastRuns) room.memory.lastRuns = {};
    if (!room.memory.name) room.memory.name = room.name;

    const roomCreeps = groupedCreeps[roomId] || {};

    if (!room.memory.scan) scan.run(room, roomCreeps); // force a initial scan

    room.memory.scanPaths = shouldScanPaths(room);

    const systems = room.controller?.my ? ALL_SYSTEMS : UNCONTROLLED_SYSTEMS;
    executeRoomSystems(room, systems, roomCreeps);

    room.memory.duration = Game.cpu.getUsed() - start;
  }
};

export default roomSystems;
