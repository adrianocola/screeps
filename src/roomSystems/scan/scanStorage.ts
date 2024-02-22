import { getExitsDistances } from './scanUtils';
import { getStorageLink } from 'utils/blueprint';

export default (room: Room) => {
  let storage: RoomMemoryScanStorage | undefined;
  if (room.storage) {
    storage = {
      exitsDistances: getExitsDistances(room.storage.pos),
      linkId: getStorageLink(room)?.id,
    };
  }

  return storage;
};
