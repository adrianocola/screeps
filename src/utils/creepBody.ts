export const countBodyParts = (creep: Creep, type: BodyPartConstant) => {
  return creep.body.filter(c => c.type === type).length;
};

export const countOffensiveBodyParts = (creep: Creep) => {
  return creep.body.filter(c => c.type === ATTACK || c.type === RANGED_ATTACK).length;
};

export const getPontentialCreepHeal = (creep: Creep) => {
  return creep.body.reduce((acc, part) => (part.hits && part.type === HEAL ? acc + HEAL_POWER : acc), 0);
};
