import basic from './basic';
import builder from './builder';
import claimer from './claimer';
import cleaner from './cleaner';
import collector from './collector';
import custom from './custom';
import defender from './defender';
import distributor from './distributor';
import explorer from './explorer';
import harvester from './harvester';
import harvesterWalker from './harvesterWalker';
import transferer from './transferer';
import upgrader from './upgrader';
import upgraderEmergency from './upgraderEmergency';
import neighborCollector from './neighborCollector';
import neighborDefender from './neighborDefender';
import neighborHarvester from './neighborHarvester';
import neighborReserver from './neighborReserver';
import scavenger from './scavenger';

const CreepTypes: Partial<Record<CREEP_TYPE, CreepType>> = {
  [CREEP_TYPE.BASIC]: basic,
  [CREEP_TYPE.DEFENDER]: defender,
  [CREEP_TYPE.HARVESTER]: harvester,
  [CREEP_TYPE.HARVESTER_WALKER]: harvesterWalker,
  [CREEP_TYPE.TRANSFERER]: transferer,
  [CREEP_TYPE.COLLECTOR]: collector,
  [CREEP_TYPE.DISTRIBUTOR]: distributor,
  [CREEP_TYPE.BUILDER]: builder,
  [CREEP_TYPE.UPGRADER]: upgrader,
  [CREEP_TYPE.UPGRADER_EMERGENCY]: upgraderEmergency,
  [CREEP_TYPE.CLEANER]: cleaner,
  [CREEP_TYPE.CLAIMER]: claimer,
  [CREEP_TYPE.NEIGHBOR_COLLECTOR]: neighborCollector,
  [CREEP_TYPE.NEIGHBOR_DEFENDER]: neighborDefender,
  [CREEP_TYPE.NEIGHBOR_HARVESTER]: neighborHarvester,
  [CREEP_TYPE.NEIGHBOR_RESERVER]: neighborReserver,
  [CREEP_TYPE.EXPLORER]: explorer,
  [CREEP_TYPE.SCAVENGER]: scavenger,
  [CREEP_TYPE.CUSTOM]: custom,
};

export default CreepTypes;
