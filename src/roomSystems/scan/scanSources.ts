import { getExitsDistances, getIsPathPaved, getRawPath, rawPathDistance } from './scanUtils';
import { getSourceContainer, getSourceLink } from 'utils/blueprint';
import { getRelativePosition } from 'utils/directions';
import { ALL_DIRECTIONS, SOURCE_KEEPER } from 'consts';

export const OBJECT_WEIGHT: { [K in SLOT_TYPE]: number } = {
  [SLOT_TYPE.CONTAINER]: 1, // nice
  [SLOT_TYPE.ROAD]: 2, // nice
  [SLOT_TYPE.RAMPART]: 3, // nice
  [SLOT_TYPE.SWAMP]: 4, // can build roads over
  [SLOT_TYPE.WALL]: 5, // can build roads over
  [SLOT_TYPE.STRUCTURE]: 6, // can't remove
};

// ENERGY available per DAY per SOURCE (tick 3s, source 3k) = 288k

const MAX_SECTIONS_PER_HARVESTERS: { [index: number]: number } = {
  1: 6,
  2: 3,
  3: 3,
  4: 2,
  5: 2,
};

const MAX_SLOTS_PER_LEVEL: { [index: number]: number } = {
  0: 3,
  1: 3,
  2: 3,
  3: 2,
  4: 1,
  5: 1,
  6: 1,
  7: 1,
  8: 1,
};

const getMaxSectionsPerHarvesters = (slots: number) => {
  return MAX_SECTIONS_PER_HARVESTERS[slots] || 6;
};

const getSourceMaxSlots = (room: Room) => {
  return MAX_SLOTS_PER_LEVEL[room.controller?.level || 0] || 5;
};

const getDesiredNumberOfHarvesters = (room: Room, slotsAvailable: number) => {
  const sourceMaxSlots = getSourceMaxSlots(room);
  return Math.min(sourceMaxSlots, slotsAvailable);
};

const getNextSourceDistance = (source: Source, nextSource: Source): number => {
  if (source === nextSource) return -1;

  return rawPathDistance(source.pos, nextSource);
};

export default (room: Room, spawn?: StructureSpawn) => {
  const foundSources: Source[] = room.find(FIND_SOURCES);
  const sources: { [index: string]: RoomMemoryScanSource } = {};
  for (let i = 0; i < foundSources.length; i += 1) {
    const source = foundSources[i];
    const nextSource = foundSources[(i + 1) % foundSources.length];
    const sourceKeeperLairs = room.controller
      ? []
      : source.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5, {
          filter: { owner: { username: SOURCE_KEEPER } },
        });
    const map: DirectionMap<SLOT_TYPE> = {};
    const slots = ALL_DIRECTIONS.reduce<DirectionMap<SLOT_TYPE>>((acc, direction: DirectionConstant) => {
      const relativePos = getRelativePosition(source.pos, direction);
      const objects = room.lookAt(new RoomPosition(relativePos.x, relativePos.y, room.name));

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
    }, map);

    const sourceContainer = getSourceContainer(room, i);
    const sourceLink = getSourceLink(room, i);

    const sourceKeeper = sourceKeeperLairs.length > 0;

    const slotsAvailable = TOP_LEFT - Object.keys(slots).length;
    const harvestersDesired = getDesiredNumberOfHarvesters(room, slotsAvailable);

    sources[source.id] = {
      exitsDistances: getExitsDistances(source.pos),
      index: i,
      sourceLinkId: sourceLink?.id,
      slots,
      slotsAvailable,
      sourceKeeper,
      sourceKeeperId: sourceKeeper ? sourceKeeperLairs[0].id : undefined,
      controllerDistance: rawPathDistance(source.pos, room.controller),
      spawnDistance: rawPathDistance(source.pos, spawn),
      storageDistance: rawPathDistance(source.pos, room.storage),
      paved:
        room.storage && sourceContainer ? getIsPathPaved(room, getRawPath(room.storage.pos, sourceContainer)) : false,
      sourceContainerId: sourceContainer?.id,
      harvestersDesired,
      harvestersMaxSections: getMaxSectionsPerHarvesters(harvestersDesired),
      nextSourceDistance: getNextSourceDistance(source, nextSource),
    };
  }

  return sources;
};
