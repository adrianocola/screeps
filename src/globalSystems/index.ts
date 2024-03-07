import expansionCheck from 'globalSystems/expansionCheck';
import expand from 'globalSystems/expand';

// execution order ⬇️
export const SYSTEMS: Partial<Record<GLOBAL_SYSTEMS, GlobalSystem>> = {
  [GLOBAL_SYSTEMS.EXPAND]: expand,
  [GLOBAL_SYSTEMS.EXPANSION_CHECK]: expansionCheck,
};

const globalSystems = () => {
  const start = Game.cpu.getUsed();
  for (const systemName in SYSTEMS) {
    const system = SYSTEMS[systemName as GLOBAL_SYSTEMS];
    if (!system) continue;

    const lastRun = Memory.global.lastRuns[systemName];
    const forceRun = !!Memory.global.forceRun?.[systemName as ROOM_SYSTEMS];
    if (!forceRun && lastRun && Game.time < lastRun + system.interval) continue;

    if (forceRun) {
      if (!Memory.global.forceRun) Memory.global.forceRun = {};
      delete Memory.global.forceRun[systemName as ROOM_SYSTEMS];
    }

    system.run();
    Memory.global.lastRuns[systemName] = Game.time;
  }
  Memory.global.duration = Game.cpu.getUsed() - start;
};

export default globalSystems;
