import { ALL_DIRECTIONS, BASE_DIRECTIONS, ROOM_SIZE } from 'consts';

const POS_SEPARATOR = ':';

const OPPOSITE_BASE_DIRECTIONS: Record<BaseDirectionConstant, BaseDirectionConstant> = {
  [TOP]: BOTTOM,
  [RIGHT]: LEFT,
  [BOTTOM]: TOP,
  [LEFT]: RIGHT,
};

export const getPosIndex = (pos: Pos) => `${pos.x}${POS_SEPARATOR}${pos.y}`;

export const getOppositeBaseDirection = (dir: BaseDirectionConstant) => OPPOSITE_BASE_DIRECTIONS[dir];

export const checkIsOppositeBaseDirection = (dir1: BaseDirectionConstant, dir2: BaseDirectionConstant) => {
  return OPPOSITE_BASE_DIRECTIONS[dir1] === dir2;
};

export const rotateBaseDirection = (dir: BaseDirectionConstant, rotate: DIRECTION_ROTATION, times: number = 1) => {
  const currentIndex = (dir - 1) / 2;
  let newIndex = (currentIndex + rotate * times) % 4;
  if (newIndex < 0) {
    newIndex += 4;
  }
  return (newIndex * 2 + 1) as BaseDirectionConstant;
};

export const rotateDirection = (dir: DirectionConstant, rotate: DIRECTION_ROTATION, times: number = 1) => {
  return (((((dir - 1 + rotate * times) % 8) + 8) % 8) + 1) as DirectionConstant;
};

export const checkIsClockwiseBaseDirection = (dir1: BaseDirectionConstant, dir2: BaseDirectionConstant) => {
  return rotateBaseDirection(dir1, DIRECTION_ROTATION.ROTATE_CLOCKWISE) === dir2;
};

export const checkIsCounterClockwiseBaseDirection = (dir1: BaseDirectionConstant, dir2: BaseDirectionConstant) => {
  return rotateBaseDirection(dir1, DIRECTION_ROTATION.ROTATE_COUNTER_CLOCKWISE) === dir2;
};

export const getDirectionRotation = (dir1: BaseDirectionConstant, dir2: BaseDirectionConstant) => {
  if (checkIsClockwiseBaseDirection(dir1, dir2)) {
    return DIRECTION_ROTATION.ROTATE_CLOCKWISE;
  } else if (checkIsCounterClockwiseBaseDirection(dir1, dir2)) {
    return DIRECTION_ROTATION.ROTATE_COUNTER_CLOCKWISE;
  } else {
    return DIRECTION_ROTATION.ROTATE_NONE;
  }
};

export const rotatePos = (pos: Pos, width: number, height: number, rotate: DIRECTION_ROTATION) => {
  if (rotate === DIRECTION_ROTATION.ROTATE_CLOCKWISE) {
    return { x: height - pos.y - 1, y: pos.x };
  } else {
    return { x: pos.y, y: width - pos.x - 1 };
  }
};

export const oppositePos = (pos: Pos, width: number, height: number) => {
  return { x: width - pos.x - 1, y: height - pos.y - 1 };
};

export const checkPos = (pos: any): pos is Pos => {
  const posTyped = pos as Pos;
  return posTyped?.x !== undefined && posTyped?.y !== undefined;
};

export const getRelativeBasePosition = (pos: Pos, dir: BaseDirectionConstant): Pos => {
  switch (dir) {
    case TOP:
      return { x: pos.x, y: pos.y - 1 };
    case RIGHT:
      return { x: pos.x + 1, y: pos.y };
    case BOTTOM:
      return { x: pos.x, y: pos.y + 1 };
    case LEFT:
      return { x: pos.x - 1, y: pos.y };
  }
};

export const getRelativePosition = (pos: Pos, dir: DirectionConstant): Pos => {
  switch (dir) {
    case TOP_RIGHT:
      return { x: pos.x + 1, y: pos.y - 1 };
    case BOTTOM_RIGHT:
      return { x: pos.x + 1, y: pos.y + 1 };
    case BOTTOM_LEFT:
      return { x: pos.x - 1, y: pos.y + 1 };
    case TOP_LEFT:
      return { x: pos.x - 1, y: pos.y - 1 };
  }

  return getRelativeBasePosition(pos, dir);
};

export const getAdjacentsBasePositions = (pos: Pos): Pos[] => {
  return BASE_DIRECTIONS.map(dir => getRelativeBasePosition(pos, dir));
};

export const getAdjacentsPositions = (pos: Pos): Pos[] => {
  return ALL_DIRECTIONS.map(dir => getRelativePosition(pos, dir));
};

export const checkIsValidPos = (pos: Pos) => {
  return pos.x >= 0 && pos.x < ROOM_SIZE && pos.y >= 0 && pos.y < ROOM_SIZE;
};

export const checkIsValidBuildablePos = (pos: Pos) => {
  return pos.x >= 1 && pos.x < ROOM_SIZE - 1 && pos.y >= 1 && pos.y < ROOM_SIZE - 1;
};

export const findFreeSpaceAround = (
  room: Room,
  pos: RoomPosition,
  target: RoomPosition,
  range: number,
): RoomPosition | undefined => {
  for (const dir of ALL_DIRECTIONS) {
    const { x, y } = getRelativePosition(pos, dir);
    const newPos = new RoomPosition(x, y, room.name);
    if (room.lookForAt(LOOK_TERRAIN, newPos.x, newPos.y).some(terrain => terrain === 'wall')) {
      continue;
    }
    if (room.lookForAt(LOOK_STRUCTURES, newPos.x, newPos.y).length) {
      continue;
    }
    if (room.lookForAt(LOOK_CREEPS, newPos.x, newPos.y).length) {
      continue;
    }
    if (!target.inRangeTo(newPos, range)) {
      continue;
    }

    return newPos;
  }

  return undefined;
};
