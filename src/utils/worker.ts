const BODY_PARTS_PRIORITY: BodyPartsMap<number> = {
  [TOUGH]: 1,
  [CARRY]: 2,
  [WORK]: 3,
  [RANGED_ATTACK]: 4,
  [ATTACK]: 5,
  [CLAIM]: 6,
  [MOVE]: 7,
  [HEAL]: 8,
};

const MAX_SECTIONS_PER_HARVESTERS: { [index: number]: number } = {
  1: 6,
  2: 3,
  3: 3,
  4: 2,
  5: 2,
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

const bodyPartsSorter = (a: BodyPartConstant, b: BodyPartConstant) => {
  return (BODY_PARTS_PRIORITY[a] || 0) < (BODY_PARTS_PRIORITY[b] || 0) ? -1 : 1;
};

// TODO: sort body parts by priority
// TOUGH, CARRY, WORK, RANGED_ATTACK, ATTACK, CLAIM, MOVE, HEAL
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

  return partsArray.sort(bodyPartsSorter);
};

export const getRoom = (creep: Creep): Room => {
  return creep.memory.roomName ? Game.rooms[creep.memory.roomName] : creep.room;
};

export const moveToRoom = (creep: Creep, roomName: string, returning: boolean = false): boolean => {
  if (creep.room.name === roomName) return true;

  const goToTargetRoom = () => {
    creep.moveTo(new RoomPosition(25, 25, roomName));
    return false;
  };

  const roomsPath = creep.memory.roomsPath || [];
  if (!roomsPath.length) return goToTargetRoom();

  const currentIndex = roomsPath.indexOf(creep.room.name);
  if (currentIndex === -1) return goToTargetRoom();

  const nextIndex = currentIndex + (returning ? -1 : 1);
  const nextRoom = nextIndex >= 0 && nextIndex < roomsPath.length ? roomsPath[nextIndex] : roomName;

  creep.moveTo(new RoomPosition(25, 25, nextRoom));

  return false;
};

export const getMaxSectionsPerHarvesters = (slots: number) => {
  return MAX_SECTIONS_PER_HARVESTERS[slots] || 6;
};
