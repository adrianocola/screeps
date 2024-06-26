import { getExitsDistances, getIsPathPaved } from './scanUtils';
import { getBaseEntrancePos, getControllerContainer, getControllerLink } from 'utils/blueprint';
import { getRawPath } from 'utils/path';

export default (room: Room, scanPaths?: boolean): RoomMemoryScanController | undefined => {
  if (!room.controller) return undefined;

  const controllerMemory = room.memory.scan?.controller;
  let paved = false;
  let storageDistance = -1;

  if (scanPaths) {
    const baseEntrancePos = getBaseEntrancePos(room);
    if (baseEntrancePos) {
      const containerToControllerPath = getRawPath(baseEntrancePos, room.controller, 1);
      paved = getIsPathPaved(room, containerToControllerPath.path);
      storageDistance = containerToControllerPath.path.length;
    }
  }

  const container = getControllerContainer(room);
  const link = getControllerLink(room);

  return {
    exitsDistances: scanPaths ? getExitsDistances(room.controller.pos) : controllerMemory?.exitsDistances ?? {},
    paved: scanPaths ? paved : controllerMemory?.paved || undefined,
    storageDistance: scanPaths ? storageDistance : controllerMemory?.storageDistance ?? -1,
    containerId: container?.id,
    linkId: link?.id,
  };
};
