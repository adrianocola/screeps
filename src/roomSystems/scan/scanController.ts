import { getExitsDistances, getIsPathPaved, getRawPath } from './scanUtils';
import { getBaseEntrancePos, getControllerContainer, getControllerLink } from 'utils/blueprint';

export default (room: Room) => {
  let controller: RoomMemoryScanController | undefined;
  if (room.controller) {
    let paved = false;
    let storageDistance = -1;

    const baseEntrancePos = getBaseEntrancePos(room);
    if (baseEntrancePos) {
      const containerToControllerPath = getRawPath(baseEntrancePos, room.controller, 1);
      paved = getIsPathPaved(room, containerToControllerPath);
      storageDistance = containerToControllerPath.length;
    }

    const container = getControllerContainer(room);
    const link = getControllerLink(room);

    controller = {
      id: room.controller.id,
      exitsDistances: getExitsDistances(room.controller.pos),
      paved,
      storageDistance,
      containerId: container?.id,
      linkId: link?.id,
    };
  }

  return controller;
};
