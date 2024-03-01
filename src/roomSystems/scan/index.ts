import scanController from './scanController';
import scanMineral from './scanMineral';
import scanRoomFeatures from './scanRoomFeatures';
import scanRoomOwnership from './scanRoomOwnership';
import scanSources from './scanSources';
import { getBaseSpawn } from 'utils/blueprint';

export const MAPPED_STRUCTURES: StructureMap<boolean> = {
  [STRUCTURE_TOWER]: true,
  [STRUCTURE_CONTAINER]: true,
  [STRUCTURE_EXTENSION]: true,
  [STRUCTURE_SPAWN]: true,
  [STRUCTURE_FACTORY]: true,
  [STRUCTURE_OBSERVER]: true,
};

// TODO no need to recalculate some stuff everytime
const systeScan: RoomSystem = {
  interval: TICKS.TICK_300,
  name: ROOM_SYSTEMS.SCAN,
  run(room) {
    // already ran the scan this tick (can happen if this is a new room)
    if (room.memory.state?.tick === Game.time) return;

    const counts: StructureMap<number> = {};

    const scanPaths = room.memory.scanPaths;
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

    room.memory.state = {
      tick: Game.time,
      counts,
      controller,
      factoryId: factories.length ? factories[0].id : undefined,
      observerId: observers.length ? observers[0].id : undefined,
      mineral,
      sources,
      baseSpawnId: spawn?.id,
      features: scanRoomFeatures(room, sources, structuresMap, controller, mineral, spawn),
      ownership: scanRoomOwnership(room),
    };
    room.memory.scanPaths = false;
  },
};

export default systeScan;
