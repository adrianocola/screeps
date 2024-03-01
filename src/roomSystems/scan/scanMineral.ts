import { getExitsDistances, getIsPathPaved, getRawPath } from './scanUtils';
import { getBaseEntrancePos, getMineralContainer, getMineralExtractor } from 'utils/blueprint';
import { SOURCE_KEEPER } from 'consts';

export default (room: Room, scanPaths?: boolean): RoomMemoryScanMineral | undefined => {
  const foundMinerals: Mineral[] = room.find(FIND_MINERALS);
  if (!foundMinerals.length) return;

  const mineral = foundMinerals[0];
  const mineralMemory = room.memory.state?.mineral;

  const sourceKeeperLairs = room.controller
    ? []
    : mineral.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5, {
        filter: { owner: { username: SOURCE_KEEPER } },
      });
  const mineralContainer = getMineralContainer(room);
  const extractor = getMineralExtractor(room);
  const baseEntrancePos = getBaseEntrancePos(room);

  const sourceKeeper = sourceKeeperLairs.length > 0;

  return {
    containerId: mineralContainer?.id,
    exitsDistances: scanPaths ? getExitsDistances(mineral.pos) : mineralMemory?.exitsDistances ?? {},
    extractorId: extractor?.id,
    mineralId: mineral.id,
    paved: scanPaths
      ? getIsPathPaved(room, getRawPath(baseEntrancePos, mineral.pos, 1))
      : mineralMemory?.paved ?? false,
    sourceKeeper,
    sourceKeeperId: sourceKeeper ? sourceKeeperLairs[0].id : undefined,
    type: mineral.mineralType,
  };
};
