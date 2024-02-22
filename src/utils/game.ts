export const getRootSpawn = (): StructureSpawn => {
  return Game.spawns[Memory.rootSpawn];
};

export const getRootSpawnRoomName = () => {
  const spawn = getRootSpawn();
  return spawn?.room.name;
};

// overrides Game.getObjectById so it returns undefined instead of null
export const getObjectById = <T extends _HasId>(id: Id<T>): T | undefined => {
  return Game.getObjectById(id) ?? undefined;
};

export const objectIdFromDate = (date: Date) => Math.floor(date.getTime() / 1000).toString(16) + '0000000000000000';

export const dateFromObjectId = (objectId: string) => new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
