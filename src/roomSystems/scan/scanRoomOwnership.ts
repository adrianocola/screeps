import { INVADER } from 'consts';
import { isRoomHighway } from 'utils/room';

export default (room: Room) => {
  if (room.controller) {
    if (room.controller.my) return ROOM_OWNERSHIP.ME_CONTROLLED;
    if (room.controller.reservation?.username === Memory.username) return ROOM_OWNERSHIP.ME_RESERVED;
    if (room.controller.reservation?.username === INVADER) return ROOM_OWNERSHIP.INVADER_RESERVED;
    if (room.controller.reservation?.username) return ROOM_OWNERSHIP.PLAYER_RESERVED;
    if (room.controller.owner?.username === INVADER) return ROOM_OWNERSHIP.INVADER_CONTROLLED;
    if (room.controller.owner?.username) return ROOM_OWNERSHIP.PLAYER_CONTROLLED;
    return ROOM_OWNERSHIP.UNCONTROLLED;
  }
  if (isRoomHighway(room)) return ROOM_OWNERSHIP.HIGHWAY;
  return ROOM_OWNERSHIP.NEUTRAL;
};
