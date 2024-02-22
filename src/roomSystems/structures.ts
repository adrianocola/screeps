import { groupBy } from 'lodash';
import Structures from 'structures';

const systemStructures: RoomSystem = {
  interval: TICKS.ALWAYS,
  name: ROOM_SYSTEMS.STRUCTURES,
  requiredFeatures: {
    [ROOM_FEATURE.CONTROLLED]: true,
    [ROOM_FEATURE.HAVE_TOWERS]: true,
  },
  run: (room: Room) => {
    const allStructures = room.find(FIND_MY_STRUCTURES);
    const groupedStructuresByType = groupBy(allStructures, 'structureType');

    for (const structureType in Structures) {
      const systemStructure = Structures[structureType as StructureConstant];
      if (!systemStructure) continue;

      const structures = groupedStructuresByType[structureType] || [];

      for (const structure of structures) {
        systemStructure.run(structure);
      }
    }

    return null;
  },
};

export default systemStructures;
