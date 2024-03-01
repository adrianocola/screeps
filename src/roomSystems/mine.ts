import spawnSystem from './spawn';
import harvesterCreepType from 'creepTypes/harvester';
import { MAX_STORAGE_RESOURCE } from 'consts';

const DEMAND_ID = `${harvesterCreepType.name}-M`;

const MAX_PARTS_PER_LEVEL: { [index: number]: number } = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 24,
  7: 24,
  8: 24,
};

const systemMine: RoomSystem = {
  interval: TICKS.TICK_20,
  name: ROOM_SYSTEMS.MINE,
  requiredFeatures: {
    [ROOM_FEATURE.CONTROLLED]: true,
    [ROOM_FEATURE.MINERALS_HAVE_EXTRACTOR]: true,
    [ROOM_FEATURE.MINERALS_HAVE_CONTAINER]: true,
  },
  run(room: Room) {
    const mineralData = room.memory.state?.mineral;
    if (!mineralData) return;

    if (mineralData.sourceKeeper || !mineralData.containerId || !mineralData.extractorId || !mineralData.mineralId)
      return;

    const mineral = Game.getObjectById<Mineral>(mineralData.mineralId);
    const terminalFreeCapacity = room.terminal?.store.getFreeCapacity();
    const storageUsedCapacity = room.storage?.store.getUsedCapacity(mineralData.type) || 0;
    if (
      !mineral ||
      !mineral.mineralAmount ||
      terminalFreeCapacity === 0 ||
      storageUsedCapacity >= MAX_STORAGE_RESOURCE
    ) {
      spawnSystem.removeSpawn(room, DEMAND_ID);
      return;
    }

    const level = room.controller?.level || 1;
    const maxSections = MAX_PARTS_PER_LEVEL[level] || 12;

    spawnSystem.spawn(room, DEMAND_ID, harvesterCreepType.name, 1, 60, {
      forRoads: mineralData.paved,
      maxSections,
      sectionParts: {
        [WORK]: 1,
        [MOVE]: 1,
      },
      memory: {
        type: harvesterCreepType.name,
        demandId: DEMAND_ID,
        roomName: room.name,
        mineralId: mineralData.mineralId,
        resource: mineralData.type,
      },
    });
  },
};

export default systemMine;
