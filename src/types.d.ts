/*
  Example types, expand on these or remove them and add your own.
  Note: Values, properties defined here do no fully *exist* by this type definiton alone.
        You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

  Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
  Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
*/

/**
 * ENUMS
 */
declare const enum BLUEPRINT_ID {
  BASE = 'b',
  TOWERS = 't',
  EXTRACTOR = 'e',
  CONTAINER_SOURCE_1 = 'cs1',
  CONTAINER_SOURCE_2 = 'cs2',
  CONTAINER_CONTROLLER = 'cc',
  CONTAINER_EXTRACTOR = 'ce',
  LINK_SOURCE_1 = 'ls1',
  LINK_SOURCE_2 = 'ls2',
  LINK_CONTROLLER = 'lc',
  EXT_PACK_1 = 'ep1',
  EXT_PACK_2 = 'ep2',
  EXT_PACK_3 = 'ep3',
  EXT_PACK_4 = 'ep4',
  EXT_PACK_5 = 'ep5',
  EXT_PACK_6 = 'ep6',
  EXT_PACK_7 = 'ep7',
  EXT_PACK_8 = 'ep8',
  EXT_PACK_9 = 'ep9',
  EXT_PACK_10 = 'ep10',
  EXT_PACK_11 = 'ep11',
  EXT_PACK_12 = 'ep12',
  OBSERVER = 'o',
}

declare const enum BLUEPRINT_STRUCTURE {
  CONTAINER1 = 'CO1',
  CONTAINER2 = 'CO2',
  CONTAINER3 = 'CO3',
  CONTAINER4 = 'CO4',
  CONTAINER5 = 'CO5',
  EXTENSION1 = 'EX1',
  EXTENSION2 = 'EX2',
  EXTENSION3 = 'EX3',
  EXTENSION4 = 'EX4',
  EXTENSION5 = 'EX5',
  EXTENSION6 = 'EX6',
  EXTENSION7 = 'EX7',
  EXTENSION8 = 'EX8',
  EXTENSION9 = 'EX9',
  EXTENSION10 = 'EX10',
  EXTENSION11 = 'EX11',
  EXTENSION12 = 'EX12',
  EXTENSION13 = 'EX13',
  EXTENSION14 = 'EX14',
  EXTENSION15 = 'EX15',
  EXTENSION16 = 'EX16',
  EXTENSION17 = 'EX17',
  EXTENSION18 = 'EX18',
  EXTENSION19 = 'EX19',
  EXTENSION20 = 'EX20',
  EXTENSION21 = 'EX21',
  EXTENSION22 = 'EX22',
  EXTENSION23 = 'EX23',
  EXTENSION24 = 'EX24',
  EXTENSION25 = 'EX25',
  EXTENSION26 = 'EX26',
  EXTENSION27 = 'EX27',
  EXTENSION28 = 'EX28',
  EXTENSION29 = 'EX29',
  EXTENSION30 = 'EX30',
  EXTENSION31 = 'EX31',
  EXTENSION32 = 'EX32',
  EXTENSION33 = 'EX33',
  EXTENSION34 = 'EX34',
  EXTENSION35 = 'EX35',
  EXTENSION36 = 'EX36',
  EXTENSION37 = 'EX37',
  EXTENSION38 = 'EX38',
  EXTENSION39 = 'EX39',
  EXTENSION40 = 'EX40',
  EXTENSION41 = 'EX41',
  EXTENSION42 = 'EX42',
  EXTENSION43 = 'EX43',
  EXTENSION44 = 'EX44',
  EXTENSION45 = 'EX45',
  EXTENSION46 = 'EX46',
  EXTENSION47 = 'EX47',
  EXTENSION48 = 'EX48',
  EXTENSION49 = 'EX49',
  EXTENSION50 = 'EX50',
  EXTENSION51 = 'EX51',
  EXTENSION52 = 'EX52',
  EXTENSION53 = 'EX53',
  EXTENSION54 = 'EX54',
  EXTENSION55 = 'EX55',
  EXTENSION56 = 'EX56',
  EXTENSION57 = 'EX57',
  EXTENSION58 = 'EX58',
  EXTENSION59 = 'EX59',
  EXTENSION60 = 'EX60',
  EXTRACTOR = 'EXT',
  FACTORY = 'FAC',
  LAB1 = 'LA1',
  LAB2 = 'LA2',
  LAB3 = 'LA3',
  LAB4 = 'LA4',
  LAB5 = 'LA5',
  LAB6 = 'LA6',
  LAB7 = 'LA7',
  LAB8 = 'LA8',
  LAB9 = 'LA9',
  LAB10 = 'LA10',
  LINK1 = 'LI1',
  LINK2 = 'LI2',
  LINK3 = 'LI3',
  LINK4 = 'LI4',
  LINK5 = 'LI5',
  LINK6 = 'LI6',
  NUKER = 'NUK',
  OBSERVER = 'OBS',
  POWER_SPAWN = 'PSP',
  SPAWN1 = 'SP1',
  SPAWN2 = 'SP2',
  SPAWN3 = 'SP3',
  STORAGE = 'STO',
  TERMINAL = 'TER',
  TOWER1 = 'TO1',
  TOWER2 = 'TO2',
  TOWER3 = 'TO3',
  TOWER4 = 'TO4',
  TOWER5 = 'TO5',
  TOWER6 = 'TO6',
  ROAD1 = 'RO1',
  ROAD2 = 'RO2',
  ROAD3 = 'RO3',
  ROAD4 = 'RO4',
  ROAD5 = 'RO5',
  ROAD6 = 'RO6',
}

declare const enum CREEP_TYPE {
  BASIC = 'basic',
  BUILDER = 'builder',
  CLAIMER = 'claimer',
  CLEANER = 'cleaner',
  COLLECTOR = 'collector',
  CUSTOM = 'custom',
  DEFENDER = 'defender',
  DISTRIBUTOR = 'distributor',
  EXPLORER = 'explorer',
  HARVESTER = 'harvester',
  HARVESTER_WALKER = 'harvesterWalker',
  NEIGHBOR_CLEANER = 'nCleaner',
  NEIGHBOR_COLLECTOR = 'nCollector',
  NEIGHBOR_HARVESTER = 'nHarvester',
  NEIGHBOR_RESERVER = 'nReserver',
  SCAVENGER = 'scavenger',
  TRANSFERER = 'transferer',
  UPGRADER = 'upgrader',
  UPGRADER_EMERGENCY = 'upgraderEmergency',
}

declare const enum DIRECTION_ROTATION {
  ROTATE_CLOCKWISE = 1,
  ROTATE_COUNTER_CLOCKWISE = -1,
  ROTATE_NONE = 0,
}

// TODO use the constants from the game
declare const enum SLOT_TYPE {
  CONTAINER = 'CONTAINER',
  ROAD = 'ROAD',
  SWAMP = 'SWAMP',
  WALL = 'WALL',
  RAMPART = 'RAMPART',
  STRUCTURE = 'STRUCTURE',
}

declare const enum GLOBAL_SYSTEMS {
  EXPAND = 'expand',
  EXPANSION_CHECK = 'expansionCheck',
}

declare const enum ROOM_SYSTEMS {
  BACKUP = 'backup',
  BLUEPRINT = 'blueprint',
  BUILD = 'build',
  COLLECT = 'collect',
  CREEPS = 'creeps',
  CUSTOM = 'custom',
  DEFENSE = 'defense',
  DISTRIBUTE = 'distribute',
  EXPLORE = 'explore',
  FIX = 'fix',
  HARVEST = 'harvest',
  HEAL = 'heal',
  MARKET = 'market',
  MINE = 'mine',
  NEIGHBOR_HARVEST = 'nHarvest',
  SCAN = 'scan',
  STRUCTURES = 'structures',
  SPAWN = 'spawn',
  TRANSFER = 'transfer',
  UPGRADE = 'upgrade',
  VISUALS = 'visuals',
}

declare const enum ROOM_OWNERSHIP {
  ME_CONTROLLED = 'mc',
  ME_RESERVED = 'mr',
  INVADER_CONTROLLED = 'ic',
  INVADER_RESERVED = 'ir',
  PLAYER_CONTROLLED = 'pc',
  PLAYER_RESERVED = 'pr',
  NEUTRAL = 'n',
  UNCONTROLLED = 'u',
  HIGHWAY = 'h',
}

declare const enum ROOM_FEATURE {
  BASIC = 'b',
  CONTROLLED = 'c',
  CONTROLLER_HAVE_CONTAINER_OR_LINK = 'chcol',
  CONTROLLER_HAVE_LINK = 'chl',
  EXPANDING_FROM = 'expf',
  EXPANDING_TO = 'expt',
  HAVE_TOWERS = 'ht',
  MINERALS_HAVE_CONTAINER = 'mhc',
  MINERALS_HAVE_EXTRACTOR = 'mhe',
  SAFE_MODE_ACTIVE = 'sma',
  SPAWN = 's',
  SPAWN_HAVE_CONTAINER = 'shc',
  SOURCES_HAVE_CONTAINER = 'sohc',
  SOURCES_HAVE_LINK = 'sohl',
  SOURCES_HAVE_CONTAINER_OR_LINK = 'sohcol',
  STORAGE = 'st',
  STORAGE_HAVE_LINK = 'sthl',
  TERMINAL = 't',
}

declare const enum EXPANSION_STATUS {
  CLEANNING = 'cleanning',
  CLAIMING = 'claiming',
  GROWING = 'growing',
}

declare const enum TICKS {
  ALWAYS = 0,
  TICK_1 = 1,
  TICK_2 = 2,
  TICK_3 = 3,
  TICK_5 = 5,
  TICK_10 = 10,
  TICK_20 = 20,
  TICK_100 = 100,
  TICK_200 = 200,
  TICK_300 = 300,
  TICK_500 = 500,
  TICK_1000 = 1_000,
  TICK_2000 = 2_000,
  TICK_5000 = 5_000,
  TICK_10000 = 10_000,
  TICK_20000 = 20_000,
  TICK_50000 = 50_000,
}

declare const enum TRANSFERER_TASKS {
  FILL_SPAWN1 = 'fs1',
  FILL_SPAWN2 = 'fs2',
  FILL_TOWER1 = 'ft1',
  FILL_TERMINAL_ENERGY = 'fite',
  FILL_TERMINAL_RESOURCE = 'fitr',
  FREE_TERMINAL_ENERGY = 'frte',
  FREE_TERMINAL_RESOURCE = 'frtr',
  WITHDRAW_LINK = 'wl',
  TRANSFER_LINK_CONTROLLER = 'tlc',
  TRANSFER_LINK_TOWERS = 'tlt',
  WAIT = 'w',
}

/**
 * MAPS
 */

type DirectionMap<T> = {
  [D in DirectionConstant]?: T;
};

type ExitMap<T> = {
  [E in ExitConstant]?: T;
};

interface IdMap<T> {
  [index: string]: T;
}

type StructureMap<T> = {
  [S in StructureConstant | LookConstant]?: T;
};

type BodyPartsMap<K> = { [P in BodyPartConstant]?: K };

/**
 * TYPES
 */

type BaseDirectionConstant = TOP | RIGHT | BOTTOM | LEFT;

interface CreepType {
  name: CREEP_TYPE;
  sectionParts?: BodyPartsMap<number>; // part => weight, will try to fit as many sections as possible
  fixedParts?: BodyPartConstant[]; // array of body parts to always include at the end
  maxSections?: number;
  run: (creep: Creep) => void;
}

interface GlobalSystem {
  interval: TICKS;
  name: GLOBAL_SYSTEMS;
  run: () => void;
}

interface ExpansionCheckGlobalSystem extends GlobalSystem {
  cancelExpansion: (reason?: string) => void;
  resetExpansion: () => void;
  completeExpansion: () => void;
}

interface SystemStructure<T extends Structure> {
  structureType: StructureConstant;
  run: (structure: T) => void;
}

interface RoomSystem {
  interval: TICKS;
  name: ROOM_SYSTEMS;
  emergency?: boolean; // if the system should run if the room is in emergency mode
  controllerLevel?: number;
  requiredFeatures?: Partial<Record<ROOM_FEATURE, boolean>>;
  requiredOwnership?: ROOM_OWNERSHIP[]; // the room must have some of the listed ownership
  run: (room: Room, roomCreeps: { [index: string]: Creep[] }) => void;
}

interface SpawnDemandItem {
  id: string;
  quantity: number;
  workerType: CREEP_TYPE;
  at: number; // tick it was last demanded
  priority: number; // lower is higher priority
  opts?: SystemSpawnOptions;
}

interface SystemBuild extends RoomSystem {
  createConstructionSite: (room: Room, pos: Pos, structureType: BuildableStructureConstant, priority?: number) => void;
}

interface SystemSpawn extends RoomSystem {
  spawn: (
    room: Room,
    id: string,
    workerType: CREEP_TYPE,
    quantity: number,
    priority?: number,
    opts?: SystemSpawnOptions,
  ) => void;
  removeSpawn: (room: Room, id: string) => void;
  doSpawn: (room: Room, spawn: StructureSpawn, item: SpawnDemandItem, energyAvailable: number) => number | undefined;
}

interface Pos {
  x: number;
  y: number;
}

interface SchemaItem {
  id: BLUEPRINT_STRUCTURE;
  structure: BuildableStructureConstant;
  controller: number;
  priority: number;
  supersededBy?: BLUEPRINT_STRUCTURE; // if this structure is built, this one should be destroyed (useful for containers)
  minSources?: number; // only build if the room has this number of sources
}

interface CloseTo {
  what: STRUCTURE_CONTROLLER | FIND_SOURCES | FIND_MINERALS | ExitConstant | BLUEPRINT_ID;
  index?: number; // from the "what list" (ie: FIND_SOURCES), the index of the item
  range?: number; // how close to the "what" it should be
  weight?: number; // the weight of this close to (relative to the others)
  paved?: boolean; // if the path to this should be paved
}

interface StartFrom {
  what: FIND_SOURCES | FIND_MINERALS;
  index: number; // from the "what list" (ie: FIND_SOURCES), the index of the item
}

interface Blueprint {
  id: BLUEPRINT_ID; // the id of the blueprint
  base?: boolean; // if it's the base blueprint
  width: number; // the width of the blueprint
  height: number; // the height of the blueprint
  minRange?: number; // minimum range to find the structure location (from startFrom)
  maxRange?: number; // maximum range to find the structure location (from startFrom)
  maxCount?: number; // maximum number of valid positions to find, then choose the best one based on the cost (proximity)
  schema: (SchemaItem | undefined)[][]; // the schema of the blueprint
  dir?: BaseDirectionConstant; // the direction of the blueprint (usually RIGHT)
  controller: number; // the controller level required to build the structure
  startFrom: StartFrom | STRUCTURE_CONTROLLER | Pos | BLUEPRINT_ID | 'discover'; // start from a source, mineral, or a specific position
  closeTo?: CloseTo[]; // search for a place close to something
  ignoreNearKeyPoints?: boolean; // if being next to key points should be ignored when finding the structure location
  ignorePaths?: boolean; // if paths should be ignored when finding the structure location
  entrance?: Pos; // must be relative to the blueprint. Paths will be calculated from this point
  label?: string; // 1 letter to show in the blueprint entrance
}

interface BlueprintCost {
  value: number;
  weight: number;
  path: RoomPosition[];
}

interface BlueprintScanResult extends Pos {
  totalCost: number;
  dir: BaseDirectionConstant;
  blueprint: Blueprint;
  costs: BlueprintCost[];
}

interface SystemSpawnOptions extends SpawnOptions {
  forRoads?: boolean; // if should reduce MOVE parts
  essential?: boolean; // if should spawn with the amount of energy available (instead of waiting for the optimal capacity)
  fixedDir?: boolean; // if should spawn using the fixed dirs in the Spawn memory
  maxSections?: number; // overwrite the job maxSections
  sectionParts?: BodyPartsMap<number>; // part => quantity, will try to fit as many sections as possible
  fixedParts?: BodyPartConstant[]; // array of body parts to always include at the end
}

interface BuildRequestItem {
  pos: Pos;
  structureType: StructureConstant;
  priority: number;
}

interface BuildQueueItem {
  constructionSiteId: string;
  structureType: StructureConstant;
  priority: number;
}

interface FixQueueItem {
  structureId: string;
  structureType: StructureConstant;
  rank: number;
}

/**
 * MEMORY
 */

interface Memory {
  username: string;
  rootSpawn: string;
  uuid: number;
  log: any;
  global: GlobalMemory;
}

interface GlobalMemory {
  minerals: Partial<Record<MineralConstant, number>>;
  lastRuns: { [index: string]: number };
  expansionCountdown: number;
  expanding?: { from: string; to: string; tick: number; score: number; status: EXPANSION_STATUS };
  forceRun?: { [index: string]: boolean };
  duration: number;
}

interface SpawnMemory {
  dirs: DirectionConstant[];
  fixedDirs?: DirectionConstant[];
}

interface CreepMemoryMove {
  tick: number;
  path: string;
  target: RoomPosition;
  range: number;
  pos?: string;
}

interface CreepMemory {
  type: CREEP_TYPE;
  demandId: string;
  roomName: string;
  workRoom?: string;
  target?: Id<Structure | Creep>;
  targetPos?: Pos;
  containerId?: Id<StructureStorage | StructureContainer | StructureLink>;
  task?: TRANSFERER_TASKS;
  harvested?: boolean; // used to control if harvesterWalker already harvested this source
  sourceIndex?: number;
  sourceId?: Id<Source>; // source id (used for harvesters and basics)
  mineralId?: Id<Mineral>; // mineral id (used for miners/harvesters)
  resource?: ResourceConstant;
  move?: CreepMemoryMove; // custom movement path logic
}

interface RoomMemoryScanController {
  paved?: boolean;
  storageDistance: number;
  exitsDistances: ExitMap<number>;
  containerId?: Id<StructureContainer>;
  linkId?: Id<StructureLink>;
}

interface RoomMemoryScanMineral {
  containerId?: Id<StructureContainer>;
  exitsDistances: ExitMap<number>;
  extractorId?: Id<StructureExtractor>;
  mineralId?: Id<Mineral>;
  paved?: boolean;
  sourceKeeper?: boolean;
  sourceKeeperId?: string;
  type: MineralConstant;
}

declare interface RoomMemoryScanSource {
  index: number;
  sourceKeeper: boolean;
  sourceKeeperId?: string;
  spawnDistance: number;
  sourceContainerId?: Id<StructureContainer>;
  sourceLinkId?: Id<StructureLink>;
  paved?: boolean;
  slots: DirectionMap<SLOT_TYPE>;
  slotsAvailable: number;
  exitsDistances: ExitMap<number>;
  nextSourceDistance: number;
}

declare interface RoomMemoryScanStorage {
  exitsDistances: ExitMap<number>;
}

interface RoomMemoryScan {
  tick: number;
  counts: StructureMap<number>;
  controller?: RoomMemoryScanController;
  factoryId?: Id<StructureFactory>;
  observerId?: Id<StructureObserver>;
  mineral?: RoomMemoryScanMineral;
  storage?: RoomMemoryScanStorage;
  sources: Record<string, RoomMemoryScanSource>;
  baseSpawnId?: Id<StructureSpawn>;
  features?: Partial<Record<ROOM_FEATURE, boolean>>;
  ownership: ROOM_OWNERSHIP;
  score?: number;
}

interface RoomMemoryBlueprintSchema {
  pos: Pos;
  dir: BaseDirectionConstant;
}

interface RoomMemoryBlueprint {
  v: number;
  schemas?: Partial<Record<BLUEPRINT_ID, RoomMemoryBlueprintSchema>>;
  structures: Partial<Record<BLUEPRINT_STRUCTURE, Id<Structure>>>;
}

interface RoomMemoryVisuals {
  blueprint?: boolean;
}

interface RoomMemorySpawn {
  demand: { [index: string]: SpawnDemandItem };
}

interface RoomMemoryBuild {
  requests: BuildRequestItem[];
  queue: BuildQueueItem[];
}

declare interface RoomMemoryDefense {
  queue: string[];
}

interface RoomMemoryFix {
  queue: FixQueueItem[];
}

interface RoomMemoryHeal {
  queue: string[];
}

interface RoomMemoryExplore {
  queue: string[]; // list of rooms to explore (always return to the start room between each room)
  tick: number; // tick the exploration request was created
  last?: string;
}

interface RoomMemoryMarketStats {
  count: number;
  credits: number;
  amount: number;
}

interface RoomMemoryMarket {
  balance: number;
  sell: Partial<Record<ResourceConstant, RoomMemoryMarketStats>>;
  buy: Partial<Record<ResourceConstant, RoomMemoryMarketStats>>;
}

interface RoomMemoryNeighbor {
  from: string;
  tick: number;
}

interface RoomMemory {
  duration: number;
  lastRuns: Partial<Record<ROOM_SYSTEMS, number>>;
  name: string;
  level?: number;
  forceRun?: Partial<Record<ROOM_SYSTEMS, boolean>>; // ignore the interval and force the system to run (still checks for requirements)
  scanPaths?: boolean;
  defense?: RoomMemoryDefense;
  fix?: RoomMemoryFix;
  heal?: RoomMemoryHeal;
  build?: RoomMemoryBuild;
  blueprint?: RoomMemoryBlueprint;
  explore?: RoomMemoryExplore;
  scan?: RoomMemoryScan;
  spawn?: RoomMemorySpawn;
  visuals?: RoomMemoryVisuals;
  market?: RoomMemoryMarket;
  neighborSource?: Record<string, RoomMemoryNeighbor>;
  neighborReserve?: RoomMemoryNeighbor;
  expansionAttempts?: number;
}

interface FlagMemory {
  blueprint?: string;
  contruction?: BuildableStructureConstant;
}

/**
 * GLOBAL
 */

// Syntax for adding proprties to `global` (ex "global.log")
declare namespace NodeJS {
  interface Global {
    log: any;
  }
}
