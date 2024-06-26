import { getExitsDistances, getIsPathPaved } from './scanUtils';
import { getBaseEntrancePos, getMineralContainer, getMineralExtractor } from 'utils/blueprint';
import { SOURCE_KEEPER } from 'consts';
import { getRawPath } from 'utils/path';

export default (room: Room, scanPaths?: boolean): RoomMemoryScanMineral | undefined => {
  const foundMinerals: Mineral[] = room.find(FIND_MINERALS);
  if (!foundMinerals.length) return;

  const mineral = foundMinerals[0];
  const mineralMemory = room.memory.scan?.mineral;

  const sourceKeeperLairs = room.controller
    ? []
    : mineral.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5, {
        filter: { owner: { username: SOURCE_KEEPER } },
      });
  const mineralContainer = getMineralContainer(room);
  const extractor = getMineralExtractor(room);
  const baseEntrancePos = getBaseEntrancePos(room);

  const sourceKeeper = sourceKeeperLairs.length > 0;

  if (room.controller?.my) {
    Memory.global.minerals[mineral.mineralType] = Game.time;
  }

  return {
    containerId: mineralContainer?.id,
    exitsDistances: scanPaths ? getExitsDistances(mineral.pos) : mineralMemory?.exitsDistances ?? {},
    extractorId: extractor?.id,
    mineralId: mineral.id,
    paved:
      scanPaths && baseEntrancePos
        ? getIsPathPaved(room, getRawPath(baseEntrancePos, mineral.pos, 1).path)
        : mineralMemory?.paved || undefined,
    sourceKeeper: sourceKeeper ?? undefined,
    sourceKeeperId: sourceKeeper ? sourceKeeperLairs[0].id : undefined,
    type: mineral.mineralType,
  };
};
