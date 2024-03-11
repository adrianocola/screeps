import { getExitsDistances } from './scanUtils';

export default (room: Room): RoomMemoryScanStorage | undefined => {
  if (!room.storage) return undefined;

  return {
    exitsDistances: getExitsDistances(room.storage.pos),
  };
};
