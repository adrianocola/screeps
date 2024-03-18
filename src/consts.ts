export const INVADER = 'Invader';
export const SOURCE_KEEPER = 'Source Keeper';
export const SIMULATOR_ROOM = 'sim';

export const ROOM_SIZE = 50;
export const OBSERVERS_MAX_DEMAND_TICKS = 100;
export const SPAWN_MAX_DEMAND_TICKS = 300;
export const EXPLORE_TICKS_INTERVAL = 30_000;
export const ENERGY_HARVESTER_MAX_SECTIONS = 6;

export const MINERALS_REGISTER_TICKS = 1_0000;

export const EXPANSION_REQUIRED_FEATURE = ROOM_FEATURE.TERMINAL;
export const EXPANSION_MIN_STORAGE_ENERGY = 10_000;
export const EXPANSION_COUNTDOWN_SCORE = 100;
export const EXPANSION_START_COUNTDOWN = 12; // will try to expand to room with this score * EXPANSION_COUNTDOWN_SCORE, decreasing every expansionCheck run
export const EXPANSION_TICKS_LIMIT = 50_000; // if expansion don't finish in this time, stop it and considere a failure
export const ROOM_MAX_TICKS_IN_MEMORY = 50_000; // max ticks to keep room data in memory

export const MIN_TERMINAL_ENERGY = 20_000;
export const MAX_TERMINAL_RESOURCE = 250_000;
export const MAX_STORAGE_RESOURCE = STORAGE_CAPACITY / 2;
export const MARKET_RAW_RESOURCE_SELL_POINT = 200_000;
export const MARKET_MAX_RESOURCE_SELL = 50_000;
export const CONTROLLER_TICKS_TO_DOWNGRADE_EMERGENCY = 2_000;
export const BLUEPRINT_START_BUILDING_ROADS_LEVEL = 3; // blueprint start building roads after this level

// TOWERS
export const TOWER_RESERVED_ENERGY = 500; // energy towers reserve to attack/heal

// LINKS
export const MID_CONTROLLER_LINK_ENERGY = 400;
export const MIN_CONTROLLER_LINK_ENERGY = 100;
export const MIN_TOWERS_LINK_ENERGY = 100;
export const MID_TOWERS_LINK_ENERGY = TOWER_RESERVED_ENERGY;

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
