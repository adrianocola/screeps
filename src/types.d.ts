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
  BASE = 'base',
  TOWERS = 'towers',
  EXTRACTOR = 'extractor',
  CONTAINER_SOURCE_1 = 'containerSource1',
  CONTAINER_SOURCE_2 = 'containerSource2',
  CONTAINER_CONTROLLER = 'containerController',
  CONTAINER_EXTRACTOR = 'containerExtractor',
  LINK_SOURCE_1 = 'linkSource1',
  LINK_SOURCE_2 = 'linkSource2',
  LINK_CONTROLLER = 'linkController',
  EXT_PACK_1 = 'extPack1',
  EXT_PACK_2 = 'extPack2',
  EXT_PACK_3 = 'extPack3',
  EXT_PACK_4 = 'extPack4',
  EXT_PACK_5 = 'extPack5',
  EXT_PACK_6 = 'extPack6',
  EXT_PACK_7 = 'extPack7',
  EXT_PACK_8 = 'extPack8',
  EXT_PACK_9 = 'extPack9',
  EXT_PACK_10 = 'extPack10',
  EXT_PACK_11 = 'extPack11',
  EXT_PACK_12 = 'extPack12',
  OBSERVER = 'observer',
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
  COLLECTOR = 'collector',
  CUSTOM = 'custom',
  DEFENDER = 'defender',
  DISTRIBUTOR = 'distributor',
  FIXER = 'fixer',
  HARVESTER = 'harvester',
  HARVESTER_WALKER = 'harvesterWalker',
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

declare const enum ROOM_SYSTEMS {
  BACKUP = 'backup',
  BLUEPRINT = 'blueprint',
  BUILD = 'build',
  COLLECT = 'collect',
  CREEPS = 'creeps',
  CUSTOM = 'custom',
  DEFENSE = 'defense',
  DISTRIBUTE = 'distribute',
  FIX = 'fix',
  HARVEST = 'harvest',
  HEAL = 'heal',
  SCAN = 'scan',
  STRUCTURES = 'structures',
  SPAWN = 'spawn',
  TRANSFER = 'transfer',
  UPGRADE = 'upgrade',
  VISUALS = 'visuals',
}

declare const enum ROOM_OWNERSHIP {
  ME_CONTROLLED = 'meContolled',
  ME_RESERVED = 'meReserved',
  INVADER_CONTROLLED = 'invaderController',
  INVADER_RESERVED = 'invaderReserved',
  PLAYER_CONTROLLED = 'playerControlled',
  PLAYER_RESERVED = 'playerReserved',
  NEUTRAL = 'neutral',
  UNCONTROLLED = 'uncontrolled',
  HIGHWAY = 'highway',
}

declare const enum ROOM_FEATURE {
  BASIC = 'basic',
  CONTROLLED = 'controlled',
  CONTROLLER_HAVE_CONTAINER_OR_LINK = 'controllerHaveContainerOrLink',
  HAVE_TOWERS = 'haveTowers',
  MINERALS_HAVE_CONTAINER = 'mineralsHaveContainer',
  MINERALS_HAVE_EXTRACTOR = 'mineralsHaveExtractor',
  SAFE_MODE_ACTIVE = 'safeModeActive',
  SPAWN = 'spawn',
  SPAWN_HAVE_CONTAINER = 'spawnHaveContainer',
  SOURCES_HAVE_CONTAINER = 'sourcesHaveContainer',
  SOURCES_HAVE_LINK = 'sourcesHaveLink',
  SOURCES_HAVE_CONTAINER_OR_LINK = 'sourcesHaveContainerOrLink',
  STORAGE = 'storage',
  STORAGE_HAVE_LINK = 'storageHaveLink',
  TERMINAL = 'terminal',
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
}

declare const enum TRANSFERER_TASKS {
  FILL_SPAWN1 = 'fillSpawn1',
  FILL_SPAWN2 = 'fillSpawn2',
  FILL_TOWER1 = 'fillTower1',
  FILL_TERMINAL_ENERGY = 'fillTerminalEnergy',
  FILL_TERMINAL_RESOURCE = 'fillTerminalResource',
  FREE_TERMINAL_ENERGY = 'freeTerminalEnergy',
  FREE_TERMINAL_RESOURCE = 'freeTerminalResource',
  WITHDRAW_LINK = 'withdrawLink',
  TRANSFER_LINK_CONTROLLER = 'transferLinkController',
  TRANSFER_LINK_TOWERS = 'transferLinkTowers',
  WAIT = 'wait',
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
  opts?: SystemSpawnOptions;
}

interface SystemBuild extends RoomSystem {
  createConstructionSite: (room: Room, pos: Pos, structureType: BuildableStructureConstant, priority?: number) => void;
}

interface SystemSpawn extends RoomSystem {
  spawn: (room: Room, id: string, workerType: CREEP_TYPE, quantity: number, opts?: SystemSpawnOptions) => void;
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
}

interface CloseTo {
  what: STRUCTURE_CONTROLLER | FIND_SOURCES | FIND_MINERALS | ExitConstant | BLUEPRINT_ID;
  index?: number; // from the "what list" (ie: FIND_SOURCES), the index of the item
  range?: number; // how close to the "what" it should be
  weight?: number; // the weight of this close to (relative to the others)
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
  startFrom: StartFrom | STRUCTURE_CONTROLLER | Pos | BLUEPRINT_ID; // start from a source, mineral, or a specific position
  closeTo?: CloseTo[]; // search for a place close to something
  ignoreNearKeyPoints?: boolean; // if being next to key points should be ignored when finding the structure location
  ignorePaths?: boolean; // if paths should be ignored when finding the structure location
  entrance?: Pos; // must be relative to the blueprint. Paths will be calculated from this point
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
  optimizeForRoads?: boolean; // if should only include 1 WALK part
  urgent?: boolean; // if should spawn with the amount of energy available (instead of waiting for the optimal capacity)
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
}

interface SpawnMemory {
  dirs: DirectionConstant[];
  fixedDirs?: DirectionConstant[];
}

interface CreepMemoryWorker {
  type: CREEP_TYPE;
  demandId: string;
  working?: boolean;
  roomName: string;
  workRoomName?: string;
  harvesterWalker?: {
    harvested: boolean;
    sourceIndex: number;
  };
  transferer?: {
    inPos: boolean;
    task?: TRANSFERER_TASKS;
  };
  distributor?: {
    fromTheGround?: boolean;
  };
  source?: string; // structure id
  target?: string; // structure id
  resource?: ResourceConstant;
  roomsPath?: string[]; // choosen way/path of rooms to move between two rooms that are not adjacent (must include source and destination)
  movement?: {
    stuckCount: number;
    lastPos: Pos;
  };
}

interface CreepMemory {
  role: string;
  worker?: CreepMemoryWorker;
  _move?: any; // screeps internal path reusing logic
}

interface RoomMemoryScanController {
  id: string;
  paved: boolean;
  storageDistance: number;
  exitsDistances: ExitMap<number>;
  containerId?: Id<StructureContainer>;
  linkId?: Id<StructureLink>;
}

interface RoomMemoryScanMineral {
  containerId?: string;
  exitsDistances: ExitMap<number>;
  extractorId?: string;
  mineralId: string;
  paved: boolean;
  storageDistance: number;
  sourceKeeper: boolean;
  sourceKeeperId?: string;
  type: MineralConstant;
}

declare interface RoomMemoryScanSource {
  index: number;
  sourceKeeper: boolean;
  sourceKeeperId?: string;
  spawnDistance: number;
  storageDistance: number;
  controllerDistance: number;
  sourceContainerId?: Id<StructureContainer>;
  sourceLinkId?: Id<StructureLink>;
  paved: boolean;
  slots: DirectionMap<SLOT_TYPE>;
  slotsAvailable: number;
  exitsDistances: ExitMap<number>;
  harvestersDesired: number;
  harvestersMaxSections: number;
  nextSourceDistance: number;
}

interface RoomMemoryScanSpawn {
  index: number;
  containerId?: string;
}

interface RoomMemoryScanStorage {
  exitsDistances: ExitMap<number>;
  linkId?: string;
}

interface RoomMemoryScanTower {
  id: string;
  storageDistance: number;
}

interface RoomMemoryState {
  tick: number;
  counts: StructureMap<number>;
  controller?: RoomMemoryScanController;
  factoryId?: Id<StructureFactory>;
  observerId?: Id<StructureObserver>;
  mineral?: RoomMemoryScanMineral;
  sources: { [index: string]: RoomMemoryScanSource };
  baseSpawnId?: Id<StructureSpawn>;
  features: Record<ROOM_FEATURE, boolean>;
  ownership: ROOM_OWNERSHIP;
  storage?: RoomMemoryScanStorage;
  towers: RoomMemoryScanTower[];
}

interface RoomMemoryBlueprintSchema {
  pos: Pos;
  dir: BaseDirectionConstant;
}

interface RoomMemoryBlueprint {
  version: number;
  schemas: Partial<Record<BLUEPRINT_ID, RoomMemoryBlueprintSchema>>;
  structures: Partial<Record<BLUEPRINT_STRUCTURE, string>>;
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

interface RoomMemory {
  lastRuns: { [index: string]: number };
  forceRun: Partial<Record<ROOM_SYSTEMS, boolean>>; // ignore the interval and force the system to run (still checks for requirements)
  duration: number;
  name: string;
  defense?: RoomMemoryDefense;
  fix?: RoomMemoryFix;
  heal?: RoomMemoryHeal;
  build?: RoomMemoryBuild;
  blueprint?: RoomMemoryBlueprint;
  state?: RoomMemoryState;
  spawn?: RoomMemorySpawn;
  visuals?: RoomMemoryVisuals;
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
