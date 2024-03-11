import { roomCallback } from 'creepTypes/explorer';

const customCreepType: CreepType = {
  name: CREEP_TYPE.CUSTOM,
  run(creep) {
    creep.notifyWhenAttacked(false);

    const target = new RoomPosition(8, 31, 'W43S52');
    const searchResult = PathFinder.search(creep.pos, { pos: target, range: 0 }, { roomCallback, swampCost: 2 });
    creep.moveByPath(searchResult.path);
  },
};

export default customCreepType;
