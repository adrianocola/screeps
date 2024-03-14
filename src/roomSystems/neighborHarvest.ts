import spawnSystem from './spawn';
import workerNeighborCleaner from 'creepTypes/neighborCleaner';
import workerNeighborCollector from 'creepTypes/neighborCollector';
import workerNeighborHarvester from 'creepTypes/neighborHarvester';
import workerNeighborReserver from 'creepTypes/neighborReserver';
import { INVADER } from 'consts';
import { getOppositeExitKey } from 'utils/directions';
import { countOffensiveBodyParts } from 'utils/creepBody';

interface NeighborSourceData {
  room: string;
  sourceId: Id<Source>;
  sourceIndex: number;
  sourceContainerId?: Id<StructureContainer>;
  distance: number;
}

const HARVESTER_MAX_PARTS = 6;
const CLEANER_MAX_SECTIONS = 5;
const STRONG_CLEANER_MAX_SECTIONS = 2 * CLEANER_MAX_SECTIONS;

const spawnHarvester = (room: Room, neighborSourceData: NeighborSourceData, neighborRoom?: Room) => {
  if (neighborRoom && neighborRoom.controller?.reservation?.username !== Memory.username) return;

  const demandId = `${workerNeighborHarvester.name}-${neighborSourceData.room}-S${neighborSourceData.sourceIndex}`;
  spawnSystem.spawn(room, demandId, workerNeighborHarvester.name, 1, 60, {
    sectionParts: {
      [WORK]: 1,
      [MOVE]: 1,
    },
    fixedParts: [CARRY],
    maxSections: HARVESTER_MAX_PARTS,
    memory: {
      demandId,
      type: workerNeighborHarvester.name,
      sourceId: neighborSourceData.sourceId,
      containerId: neighborSourceData.sourceContainerId,
      roomName: room.name,
      workRoom: neighborSourceData.room,
    },
  });
};

const spawnCollector = (room: Room, neighborSourceData: NeighborSourceData, neighborRoom?: Room) => {
  if (!neighborSourceData.sourceContainerId) return;
  if (!neighborRoom || neighborRoom.controller?.reservation?.username !== Memory.username) return;

  const maxSections = Math.floor(
    (neighborSourceData.distance * 2 * HARVEST_POWER * HARVESTER_MAX_PARTS) / CARRY_CAPACITY,
  );

  const demandId = `${workerNeighborCollector.name}-${neighborSourceData.room}-S${neighborSourceData.sourceIndex}`;
  spawnSystem.spawn(room, demandId, workerNeighborCollector.name, 1, 61, {
    sectionParts: {
      [CARRY]: 1,
      [MOVE]: 1,
    },
    maxSections: Math.min(maxSections, 25),
    memory: {
      demandId,
      type: workerNeighborCollector.name,
      sourceId: neighborSourceData.sourceId,
      containerId: neighborSourceData.sourceContainerId,
      roomName: room.name,
      workRoom: neighborSourceData.room,
    },
  });
};

const spawnReserver = (room: Room, neighborName: string, neighborRoom?: Room) => {
  const ticksToEnd = neighborRoom?.controller?.reservation?.ticksToEnd || 0;
  const isInvader = neighborRoom?.controller?.reservation?.username === INVADER;
  const demandId = `${workerNeighborReserver.name}-${neighborName}`;
  if ((!neighborRoom || neighborRoom?.controller) && (isInvader || ticksToEnd <= 2000)) {
    spawnSystem.spawn(room, demandId, workerNeighborReserver.name, 1, 59, {
      maxSections: 5,
      sectionParts: {
        [MOVE]: 1,
        [CLAIM]: 1,
      },
      memory: {
        type: workerNeighborReserver.name,
        demandId,
        roomName: room.name,
        workRoom: neighborName,
      },
    });
  } else {
    spawnSystem.removeSpawn(room, demandId);
  }
};

const spawnCleaner = (room: Room, neighborName: string, neighborCleaners: Creep[], neighborRoom?: Room) => {
  const currentCleaners = neighborCleaners.filter(c => c.memory.workRoom === neighborName).length;
  if (currentCleaners >= 1) return;

  const numEnemies = (neighborRoom?.find(FIND_HOSTILE_CREEPS) || []).filter(c => countOffensiveBodyParts(c) > 0).length;
  const numInvaderCores = (
    neighborRoom?.find(FIND_HOSTILE_STRUCTURES, { filter: { structureType: STRUCTURE_INVADER_CORE } }) || []
  ).length;

  const demandId = `${workerNeighborCleaner.name}-${neighborName}`;
  if (numEnemies || numInvaderCores) {
    const strong = numEnemies > 1;
    spawnSystem.spawn(room, demandId, workerNeighborCleaner.name, 1, 58, {
      maxSections: strong ? STRONG_CLEANER_MAX_SECTIONS : CLEANER_MAX_SECTIONS,
      sectionParts: {
        [ATTACK]: 1,
        [MOVE]: 1,
      },
      memory: {
        type: workerNeighborCleaner.name,
        demandId,
        roomName: room.name,
        workRoom: neighborName,
      },
    });
  } else {
    spawnSystem.removeSpawn(room, demandId);
  }
};

const neighborHarvest: RoomSystem = {
  interval: TICKS.TICK_20,
  name: ROOM_SYSTEMS.NEIGHBOR_HARVEST,
  requiredFeatures: {
    [ROOM_FEATURE.BASIC]: false,
    [ROOM_FEATURE.CONTROLLED]: true,
    [ROOM_FEATURE.STORAGE]: true,
  },
  run(room: Room, roomCreeps) {
    const possibleSources: NeighborSourceData[] = [];
    const neighborCleaners: Creep[] = roomCreeps[workerNeighborCleaner.name] || [];

    const exities = Game.map.describeExits(room.name);

    for (const exitKey in exities) {
      const neighborName = exities[exitKey as ExitKey]!;
      const toMyRoomExit = getOppositeExitKey(exitKey as ExitKey);
      const neighborMemory = Memory.rooms[neighborName];
      const neighborScan = neighborMemory.scan;
      const storageToExitDistance = room.memory.scan?.storage?.exitsDistances[exitKey as ExitKey] ?? 100;

      if (!neighborScan || !neighborName || !neighborMemory || !neighborMemory.scan) continue;

      // cant harvest those
      if (
        neighborMemory.scan?.ownership === ROOM_OWNERSHIP.ME_CONTROLLED ||
        neighborMemory.scan?.ownership === ROOM_OWNERSHIP.PLAYER_CONTROLLED ||
        neighborMemory.scan?.ownership === ROOM_OWNERSHIP.PLAYER_RESERVED ||
        neighborMemory.scan?.ownership === ROOM_OWNERSHIP.INVADER_CONTROLLED ||
        neighborMemory.scan?.ownership === ROOM_OWNERSHIP.HIGHWAY ||
        neighborMemory.scan?.ownership === ROOM_OWNERSHIP.NEUTRAL
      )
        continue;

      for (const [neighborSourceId, neighborSourceData] of Object.entries(neighborMemory.scan.sources || {})) {
        const neighborSource = neighborMemory.neighborSource?.[neighborSourceId as Id<Source>];
        if (neighborSource?.from !== room.name && Game.time - (neighborSource?.tick ?? 0) < 1000) continue;
        const sourceToExitDistance = neighborSourceData.exitsDistances[toMyRoomExit] || 100;
        const distance = storageToExitDistance + sourceToExitDistance;

        possibleSources.push({
          distance,
          room: neighborName,
          sourceId: neighborSourceId as Id<Source>,
          sourceIndex: neighborSourceData.index,
          sourceContainerId: neighborSourceData.sourceContainerId,
        });
      }
    }

    const sortedSources = possibleSources.sort((a, b) => a.distance - b.distance);
    const closestSource = sortedSources[0];

    if (!closestSource) {
      return;
    }

    const roomSourcesCount = Object.keys(room.memory.scan?.sources ?? {}).length;
    if (roomSourcesCount > 1 && closestSource.distance > 50) return;

    const closestSourceNeighborMemory = Memory.rooms[closestSource.room];
    if (!closestSourceNeighborMemory.neighborSource) closestSourceNeighborMemory.neighborSource = {};

    const neighborRoom = Game.rooms[closestSource.room];

    closestSourceNeighborMemory.neighborSource[closestSource.sourceId] = {
      from: room.name,
      tick: Game.time,
    };

    spawnHarvester(room, closestSource, neighborRoom);
    spawnCollector(room, closestSource, neighborRoom);

    if (
      !closestSourceNeighborMemory.neighborReserve ||
      closestSourceNeighborMemory.neighborReserve?.from === room.name ||
      Game.time - closestSourceNeighborMemory.neighborReserve.tick > 20
    ) {
      closestSourceNeighborMemory.neighborReserve = {
        from: room.name,
        tick: Game.time,
      };
      spawnCleaner(room, closestSource.room, neighborCleaners, neighborRoom);
      spawnReserver(room, closestSource.room, neighborRoom);
    }
  },
};

export default neighborHarvest;
