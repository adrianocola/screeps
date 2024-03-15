const customCreepType: CreepType = {
  name: CREEP_TYPE.CUSTOM,
  run(creep) {
    creep.notifyWhenAttacked(false);
  },
};

export default customCreepType;
