import { getRelativePosition } from 'utils/directions';
import { randomArrayElement, shuffleArray } from 'utils/random';
import { ALL_DIRECTIONS } from 'consts';
import { isSpaceBlocked } from 'utils/room';
import { moveToUsingPath } from 'utils/path';
import { transfer } from 'utils/creep';

export const BODY_PARTS_PRIORITY: BodyPartsMap<number> = {
  [TOUGH]: 10,
  [CARRY]: 20,
  [WORK]: 30,
  [ATTACK]: 40,
  [RANGED_ATTACK]: 50,
  [CLAIM]: 60,
  [MOVE]: 70,
  [HEAL]: 88,
};

export const FIGHTER_BODY_PARTS_PRIORITY: BodyPartsMap<number> = {
  [MOVE]: (BODY_PARTS_PRIORITY[TOUGH] ?? 0) + 1,
};

export const moveRoadWeight = (weight: number) => Math.ceil(weight / 2);

export const maxBodySections = (
  sectionParts: BodyPartsMap<number>,
  fixedParts: BodyPartConstant[],
  optimizeForRoads: boolean = false,
) => {
  let sectionWeight: number = 0;
  for (const [bodyPart, weight = 1] of Object.entries(sectionParts)) {
    sectionWeight += bodyPart === MOVE && optimizeForRoads ? moveRoadWeight(weight) : weight;
  }
  const fixedWeight = fixedParts?.length || 0;
  let maxSections = Math.floor(MAX_CREEP_SIZE / sectionWeight);
  if (fixedWeight) {
    while (maxSections > 0 && maxSections * sectionWeight + fixedWeight > MAX_CREEP_SIZE) {
      maxSections -= 1;
    }
  }
  return maxSections;
};

export const bodySectionCost = (sectionWeightMap: BodyPartsMap<number>, optimizeForRoads = false) => {
  let cost: number = 0;
  for (const [bodyPart, weight = 1] of Object.entries(sectionWeightMap)) {
    const finalWeight = bodyPart === MOVE && optimizeForRoads ? moveRoadWeight(weight) : weight;
    cost += BODYPART_COST[bodyPart as BodyPartConstant] * finalWeight;
  }

  return cost;
};

export const bodyFixedCost = (fixedParts?: BodyPartConstant[]) => {
  if (!fixedParts || !fixedParts.length) return 0;

  let cost: number = 0;
  for (const bodyPart of fixedParts) {
    cost += BODYPART_COST[bodyPart];
  }

  return cost;
};

const defaultBodyPartsSorter = (a: BodyPartConstant, b: BodyPartConstant) => {
  return (BODY_PARTS_PRIORITY[a] || 0) - (BODY_PARTS_PRIORITY[b] || 0);
};

const sortBodyParts = (partsArray: BodyPartConstant[], sortingWeight?: BodyPartsMap<number>) => {
  if (!sortingWeight) return partsArray.sort(defaultBodyPartsSorter);

  const bodyPartsSorter = (a: BodyPartConstant, b: BodyPartConstant) => {
    return (sortingWeight[a] ?? BODY_PARTS_PRIORITY[a] ?? 0) - (sortingWeight[b] ?? BODY_PARTS_PRIORITY[b] ?? 0);
  };

  return partsArray.sort(bodyPartsSorter);
};

export const buildBodyPartsArray = (
  sectionWeightMap: BodyPartsMap<number>,
  sections: number,
  fixedParts?: BodyPartConstant[],
  options: SystemSpawnOptions = {},
): BodyPartConstant[] => {
  const partsArray: BodyPartConstant[] = [];
  let moveCount = 0;
  const bodyPartEntries = Object.entries(sectionWeightMap);
  for (let s = 0; s < sections; s += 1) {
    for (const [bodyPart, weight = 1] of bodyPartEntries) {
      for (let w = 0; w < weight; w += 1) {
        if (options.forRoads && bodyPart === MOVE) {
          if (moveCount % 2 === 0) {
            partsArray.push(bodyPart as BodyPartConstant);
          }
          moveCount += 1;
        } else {
          partsArray.push(bodyPart as BodyPartConstant);
        }
      }
    }
  }

  if (fixedParts && fixedParts.length) {
    for (const bodyPart of fixedParts) {
      partsArray.push(bodyPart);
    }
  }

  return sortBodyParts(partsArray, options.sortingWeight);
};

export const getRoom = (creep: Creep): Room => {
  return creep.memory.roomName ? Game.rooms[creep.memory.roomName] : creep.room;
};

export const moveToRoom = (creep: Creep, roomName: string): boolean => {
  if (creep.room.name === roomName) return false;

  moveToUsingPath(creep, new RoomPosition(25, 25, roomName), 10, 10);
  return true;
};

export const moveToRoomHome = (creep: Creep): boolean => {
  if (!creep.memory?.roomName) return false;
  return moveToRoom(creep, creep.memory?.roomName);
};

export const moveToRoomWork = (creep: Creep): boolean => {
  if (!creep.memory?.workRoom) return false;
  return moveToRoom(creep, creep.memory?.workRoom);
};

export const findFreeSpaceAroundCreep = (
  creep: Creep,
  target: RoomPosition,
  range: number,
): RoomPosition | undefined => {
  const shuffledDirections = shuffleArray(ALL_DIRECTIONS);
  for (const dir of shuffledDirections) {
    const { x, y } = getRelativePosition(creep.pos, dir);
    const newPos = new RoomPosition(x, y, creep.room.name);
    if (isSpaceBlocked(creep.room, newPos, true)) {
      continue;
    }
    if (!newPos.inRangeTo(target, range)) {
      continue;
    }

    return newPos;
  }

  return undefined;
};

export const dontStandOnRoads = (creep: Creep, target: RoomPosition | { pos: RoomPosition }, range = 1) => {
  const targetPos = target instanceof RoomPosition ? target : target.pos;
  // if standing on roads
  if (creep.room.lookForAt(LOOK_STRUCTURES, creep).length) {
    let freePos = findFreeSpaceAroundCreep(creep, targetPos, range);
    if (!freePos) {
      // get random direction
      const randomDir = randomArrayElement(ALL_DIRECTIONS);
      const relativePos = getRelativePosition(creep.pos, randomDir);
      freePos = new RoomPosition(relativePos.x, relativePos.y, creep.room.name);
    }
    creep.moveTo(freePos);
  }
};

export const transferAllResources = (creep: Creep, mainResourceHolder: StructureContainer | StructureStorage) => {
  const resources = Object.keys(creep.store);
  for (const resource of resources) {
    transfer(creep, mainResourceHolder, resource as ResourceConstant);
    return true;
  }

  return false;
};
