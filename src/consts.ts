export const INVADER = 'Invader';
export const SOURCE_KEEPER = 'Source Keeper';
export const SIMULATOR_ROOM = 'sim';

export const ROOM_SIZE = 50;
export const OBSERVERS_MAX_DEMAND_TICKS = 100;
export const SPAWN_MAX_DEMAND_TICKS = 500;
export const MID_CONTROLLER_LINK_ENERGY = 500;
export const MIN_CONTROLLER_LINK_ENERGY = 200;
export const MIN_TOWERS_LINK_ENERGY = 200;
export const MID_TOWERS_LINK_ENERGY = 500;
export const MIN_BASE_TOWER_ENERGY = 500;
export const MIN_TERMINAL_ENERGY = 20000;
export const MAX_TERMINAL_RESOURCE = 250000;
export const MAX_STORAGE_RESOURCE = STORAGE_CAPACITY / 2;
export const MARKET_RAW_RESOURCE_SELL_POINT = 200000;
export const MARKET_MAX_RESOURCE_SELL = 50000;
export const CONTROLLER_TICKS_TO_DOWNGRADE_EMERGENCY = 2000;

export const BASE_DIRECTIONS: BaseDirectionConstant[] = [TOP, RIGHT, BOTTOM, LEFT];
export const ALL_DIRECTIONS: DirectionConstant[] = [
  TOP,
  TOP_RIGHT,
  RIGHT,
  BOTTOM_RIGHT,
  BOTTOM,
  BOTTOM_LEFT,
  LEFT,
  TOP_LEFT,
];
