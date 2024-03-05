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

// execution order ⬇️
const CreepTypes: Record<CREEP_TYPE, CreepType> = {
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
  [CREEP_TYPE.EXPLORER]: explorer,
  [CREEP_TYPE.CUSTOM]: custom,
};

export default CreepTypes;
