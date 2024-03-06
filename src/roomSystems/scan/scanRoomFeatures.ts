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
): Partial<Record<ROOM_FEATURE, boolean>> | undefined => {
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

  const features: Partial<Record<ROOM_FEATURE, boolean>> = {};
  if (!allSourcesHaveContainerOrLink || (!spawnHaveContainer && !room.storage)) features[ROOM_FEATURE.BASIC] = true;
  if (room.controller?.my) features[ROOM_FEATURE.CONTROLLED] = true;
  if (controllerHaveContainerOrLink) features[ROOM_FEATURE.CONTROLLER_HAVE_CONTAINER_OR_LINK] = true;
  if (controllerHaveLink) features[ROOM_FEATURE.CONTROLLER_HAVE_LINK] = true;
  if (Memory.global?.expanding?.from === room.name) features[ROOM_FEATURE.EXPANDING] = true;
  if (towers.length > 0) features[ROOM_FEATURE.HAVE_TOWERS] = true;
  if (allMineralsHaveContainer) features[ROOM_FEATURE.MINERALS_HAVE_CONTAINER] = true;
  if (allMineralsHaveExtractor) features[ROOM_FEATURE.MINERALS_HAVE_EXTRACTOR] = true;
  if (room.controller?.safeMode) features[ROOM_FEATURE.SAFE_MODE_ACTIVE] = true;
  if (allSourcesHaveContainer) features[ROOM_FEATURE.SOURCES_HAVE_CONTAINER] = true;
  if (allSourcesHaveLink) features[ROOM_FEATURE.SOURCES_HAVE_LINK] = true;
  if (allSourcesHaveContainerOrLink) features[ROOM_FEATURE.SOURCES_HAVE_CONTAINER_OR_LINK] = true;
  if (spawnHaveContainer) features[ROOM_FEATURE.SPAWN_HAVE_CONTAINER] = true;
  if (spawn) features[ROOM_FEATURE.SPAWN] = true;
  if (room.storage) features[ROOM_FEATURE.STORAGE] = true;
  if (storageHaveLink) features[ROOM_FEATURE.STORAGE_HAVE_LINK] = true;
  if (room.terminal) features[ROOM_FEATURE.TERMINAL] = true;

  return features;
};
