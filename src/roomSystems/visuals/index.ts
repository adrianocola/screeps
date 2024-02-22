import drawBlueprint from './drawBlueprint';

const systemBVisuals: RoomSystem = {
  interval: TICKS.TICK_1,
  name: ROOM_SYSTEMS.VISUALS,
  run(room: Room) {
    drawBlueprint(room);
  },
};

export default systemBVisuals;
