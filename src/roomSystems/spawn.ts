import { SPAWN_MAX_DEMAND_TICKS } from 'consts';
import CreepTypes from 'creepTypes';
import { bodyFixedCost, bodySectionCost, buildBodyPartsArray, maxBodySections } from 'utils/worker';
import { removeSpawn } from 'utils/room';

const sortByPriority = (a: SpawnDemandItem, b: SpawnDemandItem) => a.priority - b.priority;

// TODO permitir especificar qual spawn deve ser usado
const systemSpawn: SystemSpawn = {
  interval: TICKS.TICK_10,
  name: ROOM_SYSTEMS.SPAWN,
  requiredFeatures: {
    [ROOM_FEATURE.CONTROLLED]: true,
    [ROOM_FEATURE.SPAWN]: true,
  },
  spawn(room, id, workerType, quantity: number, priority = 100, opts?) {
    if (!room.memory.spawn) room.memory.spawn = { demand: {} };

    room.memory.spawn.demand[id] = { id, quantity, workerType, priority, opts, at: Game.time };
  },
  removeSpawn(room, id) {
    removeSpawn(room, id);
  },
  doSpawn(room: Room, spawn: StructureSpawn, item: SpawnDemandItem, energyAvailable: number): number | undefined {
    const worker = CreepTypes[item.workerType];

    if (!worker) {
      console.log(`Removing spawn of worker "${item.workerType}" (${item.id}) because creep type was not found`);
      this.removeSpawn(room, item.id);
      return;
    }

    const opts: SystemSpawnOptions = item.opts ? { ...item.opts } : {};
    const sectionParts = opts.sectionParts ?? worker.sectionParts;
    const fixedParts = opts.fixedParts ?? worker.fixedParts ?? [];
    const maxSections = opts.maxSections ?? worker.maxSections ?? MAX_CREEP_SIZE;

    opts.directions = item.opts?.directions ?? (opts.fixedDir ? spawn.memory.fixedDirs : spawn.memory.dirs);

    if (!sectionParts) {
      console.log(`Removing spawn of worker "${item.workerType}" (${item.id}) because "sectionParts" is missing`);
      this.removeSpawn(room, item.id);
      return;
    }

    const sectionCost = bodySectionCost(sectionParts, opts.forRoads);
    const fixedCost = bodyFixedCost(fixedParts);
    if (sectionCost + fixedCost > room.energyCapacityAvailable) {
      console.log(
        `Removing spawn of worker "${item.workerType}" (${item.id}) because it can never be spawned (${sectionCost}/${room.energyCapacityAvailable})`,
      );
      this.removeSpawn(room, item.id);
      return;
    }
    const energy = opts.essential ? Math.max(SPAWN_ENERGY_START, energyAvailable) : room.energyCapacityAvailable;
    let sectionsAllowedByEnergy = sectionCost ? Math.floor(energy / sectionCost) : 0;
    while (fixedCost && sectionsAllowedByEnergy >= 2 && sectionsAllowedByEnergy * sectionCost + fixedCost > energy) {
      sectionsAllowedByEnergy -= 1;
    }

    const totalSections = maxSections
      ? Math.min(sectionsAllowedByEnergy, maxSections, maxBodySections(sectionParts, fixedParts, opts.forRoads))
      : sectionsAllowedByEnergy;
    const finalCost = totalSections * sectionCost + fixedCost;
    if ((sectionParts && totalSections === 0) || energy < finalCost) {
      console.log(
        `Not enough energy to spawn a single section of worker "${item.workerType}" (${finalCost}/${energy})`,
        totalSections,
      );
      return;
    }

    const bodyPartsArray = buildBodyPartsArray(sectionParts, totalSections, fixedParts, opts);
    const spawnResult = spawn.spawnCreep(bodyPartsArray, `${room.name}-${item.id}-${Game.time}`, opts);
    if (spawnResult === OK) {
      return finalCost;
    }

    return;
  },
  run(room: Room, roomCreeps) {
    if (!room.memory.spawn) return;

    const demand = room.memory.spawn?.demand || {};
    if (!Object.keys(demand).length || room.energyAvailable < 100) return;

    const availableSpawns = room.find(FIND_MY_SPAWNS, { filter: s => !s.spawning });
    if (!availableSpawns.length) return;

    const creepsByDemand: { [index: string]: Creep[] } = {};
    const creepsArrays = Object.values(roomCreeps);
    for (const creeps of creepsArrays) {
      for (const creep of creeps) {
        const demandId = creep.memory.demandId || 'unknown';
        const creepsList = creepsByDemand[demandId] || [];
        creepsList.push(creep);
        creepsByDemand[demandId] = creepsList;
      }
    }

    const spawnDemand: SpawnDemandItem[] = [];
    const demandKeys = Object.keys(demand);
    for (const demandId of demandKeys) {
      const creepDemand = demand[demandId];
      const aliveCreeps = creepsByDemand[demandId] || [];
      if (Game.time - creepDemand.at > SPAWN_MAX_DEMAND_TICKS) {
        delete room.memory.spawn.demand[demandId];
      } else if (creepDemand.quantity) {
        if (aliveCreeps.length < creepDemand.quantity) {
          spawnDemand.push(creepDemand);
        } else if (aliveCreeps.length === creepDemand.quantity) {
          const ticksToSpawn = aliveCreeps[0].body.length * CREEP_SPAWN_TIME;
          const someWillDieSoon = aliveCreeps.some(c => !c.spawning && (c.ticksToLive || 0) <= ticksToSpawn);
          if (someWillDieSoon) {
            spawnDemand.push(creepDemand);
          }
        }
      }
    }

    if (!spawnDemand.length) return;

    const sortedQueue = spawnDemand.sort(sortByPriority);
    console.log(
      'SPAWN DEMAND ',
      room.name,
      sortedQueue.map(qi => `${qi.id}:${qi.priority}:${qi.quantity}`),
    );

    let energyAvailable = room.energyAvailable;
    const resolvedItems: Record<string, boolean> = {};

    for (const spawn of availableSpawns) {
      if (energyAvailable < 300) break;

      for (const item of sortedQueue) {
        if (resolvedItems[item.id]) continue;

        // check if this spawn can resolve a fixedDir demand
        if (item.opts?.fixedDir && !spawn.memory.fixedDirs) {
          continue;
        }

        const result = this.doSpawn(room, spawn, item, energyAvailable);
        if (result) {
          energyAvailable -= result;
          resolvedItems[item.id] = true;
          break;
        }
      }
    }
  },
};

export default systemSpawn;
