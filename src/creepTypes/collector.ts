import distributorCreepType from './distributor';
import { transfer, withdraw } from 'utils/creep';
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

    if (!source) return;

    let resource = creep.memory.worker?.resource || RESOURCE_ENERGY;

    // in case there is energy in the mining container, also transfer it
    if (resource !== RESOURCE_ENERGY && source.store.getUsedCapacity(RESOURCE_ENERGY)) {
      resource = RESOURCE_ENERGY;
    }

    if (
      creep.memory.worker?.working &&
      creep.store.getUsedCapacity() === 0 &&
      source.store.getUsedCapacity(resource) > 0
    ) {
      creep.memory.worker.working = false;
    } else if (
      !creep.memory.worker?.working &&
      (creep.store.getFreeCapacity() === 0 || source.store.getUsedCapacity(resource) === 0)
    ) {
      if (creep.memory.worker) {
        creep.memory.worker.working = true;
      }
    }

    if (creep.memory.worker?.working) {
      const target = getMainEnergySource(creep.room);
      if (!target) return;

      // If the target is almost full, work as a distributor
      if (
        resource === RESOURCE_ENERGY &&
        target.store.getUsedCapacity(resource) / target.store.getCapacity(resource) >= 0.75
      ) {
        distributorCreepType.run(creep);
      } else {
        transfer(creep, target, resource);
      }
    } else {
      withdraw(creep, source, resource);
    }
  },
};

export default collectorCreepType;
