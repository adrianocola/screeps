import { getExitsDistances, getIsPathPaved, getRawPath, rawPathDistance } from './scanUtils';
import { getMineralContainer, getMineralExtractor } from 'utils/blueprint';
import { SOURCE_KEEPER } from 'consts';

export default (room: Room): RoomMemoryScanMineral | undefined => {
  const foundMinerals: Mineral[] = room.find(FIND_MINERALS);
  if (!foundMinerals.length) return;

  const mineral = foundMinerals[0];

  const sourceKeeperLairs = room.controller
    ? []
    : mineral.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5, {
        filter: { owner: { username: SOURCE_KEEPER } },
      });
  const mineralContainer = getMineralContainer(room);
  const extractor = getMineralExtractor(room);

  const sourceKeeper = sourceKeeperLairs.length > 0;

  return {
    containerId: mineralContainer?.id,
    exitsDistances: getExitsDistances(mineral.pos),
    extractorId: extractor?.id,
    mineralId: mineral.id,
    paved: room.storage ? getIsPathPaved(room, getRawPath(room.storage.pos, mineralContainer)) : false,
    storageDistance: rawPathDistance(mineral.pos, room.storage),
    sourceKeeper,
    sourceKeeperId: sourceKeeper ? sourceKeeperLairs[0].id : undefined,
    type: mineral.mineralType,
  };
};
