import scanController from './scanController';
import scanMineral from './scanMineral';
import scanRoomFeatures from './scanRoomFeatures';
import scanRoomOwnership from './scanRoomOwnership';
import scanSources from './scanSources';
import scanRoomScore from './scanRoomScore';
import { getBaseSpawn } from 'utils/blueprint';
import scanStorage from 'roomSystems/scan/scanStorage';
import { MIN_SCAN_BUCKET_CPU, SIMULATOR_ROOM } from 'consts';

export const MAPPED_STRUCTURES: StructureMap<boolean> = {
  [STRUCTURE_TOWER]: true,
  [STRUCTURE_CONTAINER]: true,
  [STRUCTURE_EXTENSION]: true,
  [STRUCTURE_SPAWN]: true,
  [STRUCTURE_FACTORY]: true,
  [STRUCTURE_OBSERVER]: true,
};

const systemScan: RoomSystem = {
  interval: TICKS.TICK_1000,
  name: ROOM_SYSTEMS.SCAN,
  canRun: () => {
    // already ran a scan this tick (of any room)
    if (Memory.global.lastScan === Game.time) return false;
    // not enough CPU to scan
    if (Game.cpu.bucket < MIN_SCAN_BUCKET_CPU) return false;

    return true;
  },
  run(room) {
    Memory.global.lastScan = Game.time;

    const counts: StructureMap<number> = {};

    const scanPaths = room.memory.scanPaths === undefined ? true : room.memory.scanPaths;
    const structuresMap: StructureMap<Structure[]> = {};
    const structuresFound = room.find<AnyOwnedStructure>(FIND_STRUCTURES, {
      filter: ({ structureType }) => MAPPED_STRUCTURES[structureType],
    });

    structuresFound.forEach(structure => {
      const list = structuresMap[structure.structureType] || [];
      list.push(structure);
      structuresMap[structure.structureType] = list;

      counts[structure.structureType] = (counts[structure.structureType] || 0) + 1;
    });

    const factories = (structuresMap[STRUCTURE_FACTORY] || []) as StructureFactory[];
    const observers = (structuresMap[STRUCTURE_OBSERVER] || []) as StructureObserver[];
    const spawn = getBaseSpawn(room);

    // the order of these scan matter because of the link roles (last one registered have more priority)
    const controller = scanController(room, scanPaths);
    const sources = scanSources(room, spawn, scanPaths);
    const mineral = scanMineral(room, scanPaths);

    if (room.name !== SIMULATOR_ROOM) console.log('SCAN', room.name, Game.cpu.bucket);
    room.memory.scan = {
      tick: Game.time,
      counts,
      controller,
      factoryId: factories.length ? factories[0].id : undefined,
      observerId: observers.length ? observers[0].id : undefined,
      mineral,
      sources,
      baseSpawnId: spawn?.id,
      storage: scanStorage(room),
      features: scanRoomFeatures(room, sources, structuresMap, controller, mineral, spawn),
      ownership: scanRoomOwnership(room),
      score: scanRoomScore(room, sources, mineral),
    };

    room.memory.scanPaths = false;
  },
};

export default systemScan;
