export const countBodyParts = (creep: Creep, type: BodyPartConstant) => {
  return creep.body.filter(c => c.type === type).length;
};

export const countOffensiveBodyParts = (creep: Creep) => {
  return creep.body.filter(c => c.type === ATTACK || c.type === RANGED_ATTACK).length;
};

export const getPontentialCreepHeal = (creep: Creep) => {
  return creep.body.reduce((acc, part) => (part.hits && part.type === HEAL ? acc + HEAL_POWER : acc), 0);
};

export const getBodyPartsMap = (creep: Creep) => {
  const map: BodyPartsMap<number> = {};
  for (const part of creep.body) {
    const type = part.type;
    map[type] = (map[type] || 0) + 1;
  }
  return map;
};
