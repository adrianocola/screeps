import { getMainResourceHolder } from 'utils/room';
import { getStorageLink } from 'utils/blueprint';

const checkControllerHaveLink = (controller?: RoomMemoryScanController) => !!controller?.linkId;

const checkControllerHaveContainerOrLink = (controller?: RoomMemoryScanController) =>
  !!controller?.containerId || !!controller?.linkId;

const checkAllMineralsHaveContainer = (mineral?: RoomMemoryScanMineral): boolean => !!mineral && !!mineral.containerId;

const checkAllMineralsHaveExtractor = (mineral?: RoomMemoryScanMineral): boolean => !!mineral && !!mineral.extractorId;

const checkAllSourcesHaveContainer = (sources: { [index: string]: RoomMemoryScanSource }): boolean =>
  Object.values(sources).every(source => source.sourceKeeper || source.sourceContainerId);

const checkAllSourcesHaveLink = (sources: { [index: string]: RoomMemoryScanSource }): boolean =>
  Object.values(sources).every(source => source.sourceKeeper || source.sourceLinkId);

const checkAllSourcesHaveContainerOrLink = (sources: { [index: string]: RoomMemoryScanSource }): boolean =>
  Object.values(sources).every(source => source.sourceKeeper || source.sourceContainerId || source.sourceLinkId);

const checkSpawnHaveContainer = (room: Room): boolean => !!getMainResourceHolder(room);

const checkStorageHaveLink = (room: Room): boolean => {
  if (!room.storage) return false;
  const storageLink = getStorageLink(room);

  return !!storageLink;
};

export default (
  room: Room,
  sources: { [index: string]: RoomMemoryScanSource },
  structures: StructureMap<Structure[]>,
  controller?: RoomMemoryScanController,
  mineral?: RoomMemoryScanMineral,
  spawn?: StructureSpawn,
): Record<ROOM_FEATURE, boolean> | undefined => {
  if (!room.controller?.my) return undefined;

  const controllerHaveLink = checkControllerHaveLink(controller);
  const controllerHaveContainerOrLink = checkControllerHaveContainerOrLink(controller);
  const allMineralsHaveContainer = checkAllMineralsHaveContainer(mineral);
  const allMineralsHaveExtractor = checkAllMineralsHaveExtractor(mineral);
  const allSourcesHaveContainer = checkAllSourcesHaveContainer(sources);
  const allSourcesHaveLink = checkAllSourcesHaveLink(sources);
  const allSourcesHaveContainerOrLink = checkAllSourcesHaveContainerOrLink(sources);
  const spawnHaveContainer = checkSpawnHaveContainer(room);
  const storageHaveLink = checkStorageHaveLink(room);
  const towers = structures[STRUCTURE_TOWER] ?? [];

  return {
    [ROOM_FEATURE.BASIC]: !allSourcesHaveContainerOrLink || (!spawnHaveContainer && !room.storage),
    [ROOM_FEATURE.CONTROLLED]: !!room.controller?.my,
    [ROOM_FEATURE.CONTROLLER_HAVE_CONTAINER_OR_LINK]: controllerHaveContainerOrLink,
    [ROOM_FEATURE.CONTROLLER_HAVE_LINK]: controllerHaveLink,
    [ROOM_FEATURE.EXPANDING]: Memory.global?.expanding?.from === room.name,
    [ROOM_FEATURE.HAVE_TOWERS]: towers.length > 0,
    [ROOM_FEATURE.MINERALS_HAVE_CONTAINER]: allMineralsHaveContainer,
    [ROOM_FEATURE.MINERALS_HAVE_EXTRACTOR]: allMineralsHaveExtractor,
    [ROOM_FEATURE.SAFE_MODE_ACTIVE]: !!room.controller?.safeMode,
    [ROOM_FEATURE.SOURCES_HAVE_CONTAINER]: allSourcesHaveContainer,
    [ROOM_FEATURE.SOURCES_HAVE_LINK]: allSourcesHaveLink,
    [ROOM_FEATURE.SOURCES_HAVE_CONTAINER_OR_LINK]: allSourcesHaveContainerOrLink,
    [ROOM_FEATURE.SPAWN_HAVE_CONTAINER]: spawnHaveContainer,
    [ROOM_FEATURE.SPAWN]: !!spawn,
    [ROOM_FEATURE.STORAGE]: !!room.storage,
    [ROOM_FEATURE.STORAGE_HAVE_LINK]: storageHaveLink,
    [ROOM_FEATURE.TERMINAL]: !!room.terminal,
  };
};
