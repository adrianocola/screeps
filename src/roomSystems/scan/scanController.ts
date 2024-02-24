import { getExitsDistances, getIsPathPaved, getRawPath } from './scanUtils';
import { getMainResourceHolderId } from 'utils/room';
import { getObjectById } from 'utils/game';
import { getControllerContainer, getControllerLink } from 'utils/blueprint';

export default (room: Room) => {
  let controller: RoomMemoryScanController | undefined;
  if (room.controller) {
    let paved = false;
    let storageDistance = -1;

    const spawnContainerId = getMainResourceHolderId(room);
    if (spawnContainerId) {
      const spawnContainer = getObjectById<StructureContainer | StructureStorage>(spawnContainerId);
      if (spawnContainer) {
        const containerToControllerPath = getRawPath(spawnContainer.pos, room.controller);
        paved = getIsPathPaved(room, containerToControllerPath);
        storageDistance = containerToControllerPath.length;
      }
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
