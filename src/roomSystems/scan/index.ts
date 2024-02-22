import scanController from './scanController';
import scanMineral from './scanMineral';
import scanRoomFeatures from './scanRoomFeatures';
import scanRoomOwnership from './scanRoomOwnership';
import scanSources from './scanSources';
import scanStorage from './scanStorage';
import scanTowers from './scanTowers';
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

    const structures: StructureMap<Structure[]> = {};
    const myStructuresFound = room.find<AnyOwnedStructure>(FIND_STRUCTURES);

    myStructuresFound.forEach(structure => {
      if (MAPPED_STRUCTURES[structure.structureType]) {
        const list = structures[structure.structureType] || [];
        list.push(structure);
        structures[structure.structureType] = list;

        counts[structure.structureType] = (counts[structure.structureType] || 0) + 1;
      }
    });

    const factories = (structures[STRUCTURE_FACTORY] || []) as StructureFactory[];
    const observers = (structures[STRUCTURE_OBSERVER] || []) as StructureObserver[];
    const spawn = getBaseSpawn(room);

    // the order of these scan matter because of the link roles (last one registered have more priority)
    const controller = scanController(room);
    const storage = scanStorage(room);
    const sources = scanSources(room, spawn);
    const mineral = scanMineral(room);

    room.memory.state = {
      tick: Game.time,
      counts,
      controller,
      factoryId: factories.length ? factories[0].id : undefined,
      observerId: observers.length ? observers[0].id : undefined,
      mineral,
      sources,
      baseSpawnId: spawn?.id,
      features: scanRoomFeatures(room, sources, structures, controller, mineral, spawn),
      storage,
      ownership: scanRoomOwnership(room),
      towers: scanTowers(room, structures),
    };
  },
};

export default systeScan;
