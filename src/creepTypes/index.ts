import basic from './basic';
import builder from './builder';
import collector from './collector';
import custom from './custom';
import defender from './defender';
import distributor from './distributor';
import fixer from './fixer';
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
  [CREEP_TYPE.FIXER]: fixer,
  [CREEP_TYPE.CUSTOM]: custom,
};

export default CreepTypes;
