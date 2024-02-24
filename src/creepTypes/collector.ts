import { moveTo, transfer, withdraw } from 'utils/creep';
import { getSource } from 'utils/worker';
import { getMainEnergySource } from 'utils/room';

const collectorCreepType: CreepType = {
  name: CREEP_TYPE.COLLECTOR,
  maxSections: 8,
  sectionParts: {
    [CARRY]: 1,
    [MOVE]: 1,
  },
  run(creep) {
    const source = getSource(creep) as StructureContainer;
    const target = getMainEnergySource(creep.room);

    if (!source || !target) return;

    const resource = creep.memory.worker?.resource || RESOURCE_ENERGY;

    if (!creep.pos.isNearTo(source) && creep.store.getUsedCapacity() === 0) {
      moveTo(creep, source, { range: 1 });
    } else if (creep.store.getUsedCapacity()) {
      transfer(creep, target, resource);
    } else if (source.store.getUsedCapacity() >= creep.store.getCapacity()) {
      withdraw(creep, source, resource);
    }
  },
};

export default collectorCreepType;
