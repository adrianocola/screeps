import link from './link';
import tower from './tower';

// execution order ⬇️
const Structures: Partial<Record<StructureConstant, SystemStructure<any>>> = {
  [link.structureType]: link,
  [tower.structureType]: tower,
};

export default Structures;
