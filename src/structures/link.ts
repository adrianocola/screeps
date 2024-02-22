import { MID_CONTROLLER_LINK_ENERGY, MIN_CONTROLLER_LINK_ENERGY, MIN_TOWERS_LINK_ENERGY } from 'consts';
import { getControllerLink, getStorageLink, getTowersLink } from 'utils/blueprint';

const structureLink: SystemStructure<StructureLink> = {
  structureType: STRUCTURE_LINK,
  run(link) {
    if (!link.store.getUsedCapacity(RESOURCE_ENERGY) || link.cooldown) return;

    switch (link.id) {
      // Sources link
      case link.room.memory.blueprint?.structures[BLUEPRINT_STRUCTURE.LINK1]:
      case link.room.memory.blueprint?.structures[BLUEPRINT_STRUCTURE.LINK2]: {
        if (link.store.getUsedCapacity(RESOURCE_ENERGY) >= 400) {
          const controllerLink = getControllerLink(link.room);
          if (controllerLink && controllerLink.store.getUsedCapacity(RESOURCE_ENERGY) < MID_CONTROLLER_LINK_ENERGY) {
            link.transferEnergy(controllerLink);
            return;
          }

          const storageLink = getStorageLink(link.room);
          if (storageLink && storageLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            link.transferEnergy(storageLink);
            return;
          }
        }
        break;
      }
      // Base/Storage Link
      case link.room.memory.blueprint?.structures[BLUEPRINT_STRUCTURE.LINK3]: {
        if (link.store.getUsedCapacity(RESOURCE_ENERGY) === 0) return;

        const controllerLink = getControllerLink(link.room);
        if (controllerLink && controllerLink.store.getUsedCapacity(RESOURCE_ENERGY) < MIN_CONTROLLER_LINK_ENERGY) {
          link.transferEnergy(controllerLink, MIN_CONTROLLER_LINK_ENERGY);
          return;
        }

        const towersLink = getTowersLink(link.room);
        if (towersLink && towersLink.store.getUsedCapacity(RESOURCE_ENERGY) < MIN_CONTROLLER_LINK_ENERGY) {
          link.transferEnergy(towersLink, MIN_TOWERS_LINK_ENERGY);
          return;
        }

        break;
      }
    }
  },
};

export default structureLink;
