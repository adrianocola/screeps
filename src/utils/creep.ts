import { getRoomSpawn, roomPathFinderOptions } from 'utils/room';
import { dontStandOnRoads } from 'utils/worker';

export const suicide = (creep: Creep, message?: string) => {
  if (message) console.log(`${creep.name}: ${message}`);
  return creep.suicide();
};

export const moveTo = (
  creep: Creep,
  target: RoomPosition | { pos: RoomPosition },
  opts?: MoveToOpts,
): ScreepsReturnCode => {
  if (creep.fatigue) return ERR_TIRED;
  // // by default, ignore creeps, so that creeps in opposite directions can cross each other in the same road
  // const finalOpts:MoveToOpts = {
  //   reusePath: 10,
  //   ignoreCreeps: true,
  //   visualizePathStyle: PATH_STROKE,
  //   ...opts
  // };
  //
  // if(creep.fatigue === 0 && creep.memory.worker && creep.memory._move){
  //   const lastPosition = creep.memory.worker.movement?.lastPos;
  //   let stuckCount = creep.memory.worker.movement?.stuckCount || 0;
  //   // check if creep is stuck (in the same place for some time)
  //   if(lastPosition && creep.pos.x === lastPosition.x && creep.pos.y === lastPosition.y){
  //     // stuck creeps reset their path and consider other creeps for path finding
  //     if(stuckCount >= 2){
  //       creep.memory._move = null;
  //       finalOpts.ignoreCreeps = false;
  //       stuckCount = 0;
  //     }else{
  //       stuckCount += 1;
  //     }
  //   }
  //
  //   creep.memory.worker.movement = {
  //     lastPos: creep.pos,
  //     stuckCount,
  //   };
  // }
  return creep.moveTo(target, opts);
};

export const harvest = (
  creep: Creep,
  target: Source | Mineral | Deposit,
): CreepActionReturnCode | ERR_NOT_FOUND | ERR_NOT_ENOUGH_RESOURCES => {
  if (creep.pos.isNearTo(target)) {
    if (target instanceof Source) {
      if (target.energy === 0) return ERR_NOT_ENOUGH_RESOURCES;
    } else if (target instanceof Mineral) {
      if (target.mineralAmount === 0) return ERR_NOT_ENOUGH_RESOURCES;
    }

    return creep.harvest(target);
  } else {
    moveTo(creep, target);
    return ERR_NOT_IN_RANGE;
  }
};

export const transfer = (
  creep: Creep,
  target: AnyCreep | Structure,
  resourceType: ResourceConstant,
  amount?: number,
): ScreepsReturnCode => {
  if (creep.pos.isNearTo(target)) {
    return creep.transfer(target, resourceType, amount);
  } else {
    return moveTo(creep, target);
  }
};

export const pickup = (creep: Creep, target: Resource): CreepActionReturnCode | ERR_FULL => {
  if (creep.pos.isNearTo(target)) {
    return creep.pickup(target);
  } else {
    moveTo(creep, target);
    return ERR_NOT_IN_RANGE;
  }
};

export const withdraw = (
  creep: Creep,
  target: StructureContainer | StructureLink | StructureStorage | StructureTerminal | Tombstone | Ruin,
  resourceType: ResourceConstant,
  amount?: number,
): ScreepsReturnCode => {
  if (creep.pos.isNearTo(target)) {
    if (target.store.getUsedCapacity(resourceType) === 0) {
      dontStandOnRoads(creep, target, 1);
      return ERR_NOT_ENOUGH_RESOURCES;
    }
    return creep.withdraw(target, resourceType, amount);
  } else {
    return moveTo(creep, target);
  }
};

export const upgradeController = (creep: Creep, target: StructureController, range: number = 3): ScreepsReturnCode => {
  if (creep.pos.inRangeTo(target, range)) {
    return creep.upgradeController(target);
  } else {
    return moveTo(creep, target);
  }
};

export const signController = (creep: Creep, target: StructureController, text: string): ScreepsReturnCode => {
  if (creep.pos.isNearTo(target)) {
    return creep.signController(target, text);
  } else {
    return moveTo(creep, target);
  }
};

export const repair = (
  creep: Creep,
  target: Structure,
  range: number = 3,
): CreepActionReturnCode | ERR_NOT_ENOUGH_RESOURCES => {
  if (creep.pos.inRangeTo(target, range)) {
    return creep.repair(target);
  } else {
    moveTo(creep, target);
    return ERR_NOT_IN_RANGE;
  }
};

export const claimController = (
  creep: Creep,
  target: StructureController,
): CreepActionReturnCode | ERR_FULL | ERR_GCL_NOT_ENOUGH => {
  if (creep.pos.isNearTo(target)) {
    return creep.claimController(target);
  } else {
    moveTo(creep, target);
    return ERR_NOT_IN_RANGE;
  }
};

export const reserveController = (creep: Creep, target: StructureController): CreepActionReturnCode => {
  if (creep.pos.isNearTo(target)) {
    return creep.reserveController(target);
  } else {
    moveTo(creep, target);
    return ERR_NOT_IN_RANGE;
  }
};

export const attackController = (creep: Creep, target: StructureController): CreepActionReturnCode => {
  if (creep.pos.isNearTo(target)) {
    return creep.attackController(target);
  } else {
    creep.moveTo(target);
    return ERR_NOT_IN_RANGE;
  }
};

export const heal = (creep: Creep, target: AnyCreep): CreepActionReturnCode => {
  if (creep.pos.isNearTo(target)) {
    return creep.heal(target);
  } else {
    moveTo(creep, target);
    return ERR_NOT_IN_RANGE;
  }
};

export const rangedHeal = (creep: Creep, target: AnyCreep, range: number = 3): CreepActionReturnCode => {
  if (creep.pos.inRangeTo(target, range)) {
    return creep.rangedHeal(target);
  } else {
    moveTo(creep, target);
    return ERR_NOT_IN_RANGE;
  }
};

export const attack = (creep: Creep, target: AnyCreep | Structure): CreepActionReturnCode => {
  if (creep.pos.isNearTo(target)) {
    return creep.attack(target);
  } else {
    moveTo(creep, target);
    return ERR_NOT_IN_RANGE;
  }
};

// always try to move in the direction of the enemy, because if may move away in the same tick
export const attackMove = (creep: Creep, target: AnyCreep | Structure): CreepActionReturnCode => {
  moveTo(creep, target);
  if (creep.pos.isNearTo(target)) {
    return creep.attack(target);
  }
  return ERR_NOT_IN_RANGE;
};

export const rangedAttack = (creep: Creep, target: AnyCreep | Structure, range: number = 3): CreepActionReturnCode => {
  if (creep.pos.inRangeTo(target, range)) {
    return creep.rangedAttack(target);
  } else {
    moveTo(creep, target);
    return ERR_NOT_IN_RANGE;
  }
};

// try to keep at 3 of distance from the enemy
export const rangedAttackMove = (
  creep: Creep,
  target: AnyCreep | Structure,
  range: number = 2,
): CreepActionReturnCode => {
  const targetRange = creep.pos.getRangeTo(target);
  if (targetRange < range) {
    const fleeResult = PathFinder.search(creep.pos, { pos: target.pos, range }, { flee: true });
    creep.moveByPath(fleeResult.path);
    return creep.rangedAttack(target);
  } else if (targetRange > range) {
    moveTo(creep, target);
    return ERR_NOT_IN_RANGE;
  } else {
    return creep.rangedAttack(target);
  }
};

export const fleeFrom = (creep: Creep, pos: RoomPosition, range: number = 3) => {
  if (range === 1 ? creep.pos.isEqualTo(pos) : creep.pos.inRangeTo(pos, range - 1)) {
    const fleeResult = PathFinder.search(creep.pos, { pos, range }, { ...roomPathFinderOptions, flee: true });
    return creep.moveByPath(fleeResult.path);
  }

  return OK;
};

export const build = (
  creep: Creep,
  target: ConstructionSite,
  range: number = 3,
): CreepActionReturnCode | ERR_NOT_ENOUGH_RESOURCES | ERR_RCL_NOT_ENOUGH => {
  if (creep.pos.inRangeTo(target, range)) {
    // check if not standing on top of the construction site
    if (creep.pos.isEqualTo(target)) {
      fleeFrom(creep, target.pos, 1);
      return ERR_NOT_IN_RANGE;
    }
    dontStandOnRoads(creep, target, range);
    return creep.build(target);
  } else {
    moveTo(creep, target);
    return ERR_NOT_IN_RANGE;
  }
};

export const recycle = (creep: Creep) => {
  const spawn = getRoomSpawn(creep.room);
  if (!spawn) return;

  if (creep.pos.isNearTo(spawn)) {
    spawn.recycleCreep(creep);
  } else {
    moveTo(creep, spawn);
  }
};

export const countCreepTotalResources = (creep: Creep): number => {
  const values = Object.values(creep.store) as number[];
  return values.reduce((acc, value) => acc + (value ?? 0), 0);
};
