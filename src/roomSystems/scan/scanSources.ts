import { findSingleStructureInRange, getExitsDistances, getIsPathPaved } from './scanUtils';
import { getBaseEntrancePos, getSourceContainer, getSourceLink } from 'utils/blueprint';
import { getRelativePosition } from 'utils/directions';
import { ALL_DIRECTIONS, SOURCE_KEEPER } from 'consts';
import { getRawPath } from 'utils/path';

export const OBJECT_WEIGHT: { [K in SLOT_TYPE]: number } = {
  [SLOT_TYPE.CONTAINER]: 1, // nice
  [SLOT_TYPE.ROAD]: 2, // nice
  [SLOT_TYPE.RAMPART]: 3, // nice
  [SLOT_TYPE.SWAMP]: 4, // can build roads over
  [SLOT_TYPE.WALL]: 5, // can build roads over
  [SLOT_TYPE.STRUCTURE]: 6, // can't remove
};

// ENERGY available per DAY per SOURCE (tick 3s, source 3k) = 288k

const getNextSourceDistance = (source: Source, nextSource: Source): number => {
  if (source === nextSource) return -1;

  return getRawPath(source.pos, nextSource).cost;
};

const getSlots = (source: Source) => {
  return ALL_DIRECTIONS.reduce<DirectionMap<SLOT_TYPE>>((acc, direction: DirectionConstant) => {
    const relativePos = getRelativePosition(source.pos, direction);
    const objects = source.room.lookAt(new RoomPosition(relativePos.x, relativePos.y, source.room.name));

    let type: SLOT_TYPE | undefined;

    objects.forEach(object => {
      let slotType: SLOT_TYPE | undefined;
      if (object.type === 'terrain') {
        if (object.terrain === 'swamp') {
          slotType = SLOT_TYPE.SWAMP;
        } else if (object.terrain === 'wall') {
          slotType = SLOT_TYPE.WALL;
        }
      } else if (object.type === 'structure') {
        if (object.structure?.structureType === STRUCTURE_CONTAINER) {
          slotType = SLOT_TYPE.CONTAINER;
        } else if (object.structure?.structureType === STRUCTURE_ROAD) {
          slotType = SLOT_TYPE.ROAD;
        } else if (object.structure?.structureType === STRUCTURE_RAMPART) {
          slotType = SLOT_TYPE.RAMPART;
        } else {
          slotType = SLOT_TYPE.STRUCTURE;
        }
      }
      if (slotType) {
        if (!type || OBJECT_WEIGHT[slotType] > OBJECT_WEIGHT[type]) {
          type = slotType;
        }
      }
    });

    if (type && OBJECT_WEIGHT[type] >= 5) {
      acc[direction] = type;
    }
    return acc;
  }, {} as DirectionMap<SLOT_TYPE>);
};

export default (room: Room, spawn?: StructureSpawn, scanPaths?: boolean) => {
  const foundSources: Source[] = room.find(FIND_SOURCES);
  const sources: { [index: string]: RoomMemoryScanSource } = {};
  for (let i = 0; i < foundSources.length; i += 1) {
    const source = foundSources[i];
    const sourceMemory = room.memory.scan?.sources?.[source.id];
    const nextSource = foundSources[(i + 1) % foundSources.length];
    const sourceKeeperLairs = room.controller
      ? []
      : source.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5, {
          filter: { owner: { username: SOURCE_KEEPER } },
        });
    const slots = scanPaths ? getSlots(source) : sourceMemory?.slots ?? {};

    const sourceContainer =
      getSourceContainer(room, i) ?? findSingleStructureInRange(source.pos, 1, STRUCTURE_CONTAINER);

    const sourceLink = getSourceLink(room, i);

    const sourceKeeper = sourceKeeperLairs.length > 0;

    const slotsAvailable = TOP_LEFT - Object.keys(slots).length;
    const baseEntrancePos = getBaseEntrancePos(room);

    sources[source.id] = {
      exitsDistances: scanPaths ? getExitsDistances(source.pos) : sourceMemory?.exitsDistances ?? {},
      index: i,
      sourceLinkId: sourceLink?.id,
      slots,
      slotsAvailable,
      sourceKeeper,
      sourceKeeperId: sourceKeeper ? sourceKeeperLairs[0].id : undefined,
      spawnDistance: scanPaths && spawn ? getRawPath(source.pos, spawn).cost : sourceMemory?.spawnDistance ?? -1,
      controllerDistance:
        scanPaths && room.controller
          ? getRawPath(source.pos, room.controller).cost
          : sourceMemory?.controllerDistance ?? -1,
      paved:
        scanPaths && baseEntrancePos
          ? getIsPathPaved(room, getRawPath(baseEntrancePos, source.pos, 1).path)
          : sourceMemory?.paved || undefined,
      sourceContainerId: sourceContainer?.id,
      nextSourceDistance: scanPaths
        ? getNextSourceDistance(source, nextSource)
        : sourceMemory?.nextSourceDistance ?? -1,
    };
  }

  return sources;
};
