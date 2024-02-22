import { rawPathDistance } from './scanUtils';

export default (room: Room, structures: StructureMap<Structure[]>) => {
  const mappedTowers = (structures[STRUCTURE_TOWER] || []) as StructureTower[];
  const towers: RoomMemoryScanTower[] = [];
  for (const mappedTower of mappedTowers) {
    if (!mappedTower.my) continue;

    towers.push({
      id: mappedTower.id,
      storageDistance: rawPathDistance(mappedTower.pos, room.storage),
    });
  }

  return towers.sort((t1, t2) => t1.storageDistance - t2.storageDistance);
};
