import { getPontentialCreepHeal } from 'utils/creepBody';

const getTowerDamage = (tower: StructureTower, target: RoomPosition | _HasRoomPosition): number => {
  const distance = tower.pos.getRangeTo(target);
  if (distance <= TOWER_OPTIMAL_RANGE) return TOWER_POWER_ATTACK;
  if (distance >= TOWER_FALLOFF_RANGE) return TOWER_POWER_ATTACK * (1 - TOWER_FALLOFF);
  return (
    TOWER_POWER_ATTACK *
    (1 - (TOWER_FALLOFF * (distance - TOWER_OPTIMAL_RANGE)) / (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE))
  );
};

export const calculateTimeToKill = (tower: StructureTower, creep: Creep): number => {
  const damage = getTowerDamage(tower, creep);
  const heal = getPontentialCreepHeal(creep);
  const effectiveDamage = damage - heal;

  if (effectiveDamage <= 0) return Number.MAX_SAFE_INTEGER;

  return Math.ceil(creep.hits / effectiveDamage);
};

export const calculateTimeToKillAll = (towers: StructureTower[], creeps: Creep[]): number => {
  if (!towers.length) return Number.MAX_SAFE_INTEGER;
  if (!creeps.length) return 0;

  const sampleCreep = creeps[0];
  const damage = towers.reduce((acc, tower) => acc + getTowerDamage(tower, sampleCreep), 0);
  const heal = creeps.reduce((acc, creep) => acc + getPontentialCreepHeal(creep), 0);

  const effectiveDamage = damage - heal;

  if (effectiveDamage <= 0) return Number.MAX_SAFE_INTEGER;

  const hits = creeps.reduce((acc, creep) => acc + creep.hits, 0);
  return Math.ceil(hits / effectiveDamage);
};
