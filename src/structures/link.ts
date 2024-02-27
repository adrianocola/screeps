import {
  MID_CONTROLLER_LINK_ENERGY,
  MID_TOWERS_LINK_ENERGY,
  MIN_CONTROLLER_LINK_ENERGY,
  MIN_TOWERS_LINK_ENERGY,
} from 'consts';
import { getControllerLink, getStorageLink, getTowersLink } from 'utils/blueprint';

const structureLink: SystemStructure<StructureLink> = {
  structureType: STRUCTURE_LINK,
  run(link) {
    const linkUsedCapacity = link.store.getUsedCapacity(RESOURCE_ENERGY);
    if (!linkUsedCapacity || link.cooldown) return;

    switch (link.id) {
      // Sources link
      case link.room.memory.blueprint?.structures[BLUEPRINT_STRUCTURE.LINK1]:
      case link.room.memory.blueprint?.structures[BLUEPRINT_STRUCTURE.LINK2]: {
        if (linkUsedCapacity / LINK_CAPACITY >= 0.5) {
          const storageEnergy = link.room.storage?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0;
          const controllerLink = getControllerLink(link.room);
          if (
            storageEnergy > 5000 &&
            controllerLink &&
            controllerLink.store.getUsedCapacity(RESOURCE_ENERGY) < MID_CONTROLLER_LINK_ENERGY
          ) {
            link.transferEnergy(controllerLink);
            return;
          }

          const towersLink = getTowersLink(link.room);
          if (
            storageEnergy > 5000 &&
            towersLink &&
            towersLink.store.getUsedCapacity(RESOURCE_ENERGY) < MID_TOWERS_LINK_ENERGY
          ) {
            link.transferEnergy(towersLink);
            return;
          }

          const storageLink = getStorageLink(link.room);
          if (
            storageLink &&
            storageLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
            linkUsedCapacity / LINK_CAPACITY >= 0.75
          ) {
            link.transferEnergy(storageLink);
            return;
          }
        }
        break;
      }
      // Base/Storage Link
      case link.room.memory.blueprint?.structures[BLUEPRINT_STRUCTURE.LINK3]: {
        if (linkUsedCapacity === 0) return;

        const controllerLink = getControllerLink(link.room);
        if (
          controllerLink &&
          controllerLink.store.getUsedCapacity(RESOURCE_ENERGY) < MIN_CONTROLLER_LINK_ENERGY &&
          linkUsedCapacity >= MIN_CONTROLLER_LINK_ENERGY
        ) {
          link.transferEnergy(controllerLink);
          return;
        }

        const towersLink = getTowersLink(link.room);
        if (
          towersLink &&
          towersLink.store.getUsedCapacity(RESOURCE_ENERGY) < MIN_TOWERS_LINK_ENERGY &&
          linkUsedCapacity >= MIN_TOWERS_LINK_ENERGY
        ) {
          link.transferEnergy(towersLink);
          return;
        }

        break;
      }
    }
  },
};

export default structureLink;
