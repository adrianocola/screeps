export const getRootSpawn = (): StructureSpawn => {
  return Game.spawns[Memory.rootSpawn];
};

export const getRootSpawnRoomName = () => {
  const spawn = getRootSpawn();
  return spawn?.room.name;
};

// overrides Game.getObjectById so it returns undefined instead of null
export const getObjectById = <T extends _HasId>(id?: Id<T>): T | undefined => {
  if (!id) return undefined;
  return Game.getObjectById(id) ?? undefined;
};
