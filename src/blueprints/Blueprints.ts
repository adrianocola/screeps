// TODO permitir setar um level máximo para algumas estruturas (ajudaria pra deletar containers inúteis, depois que faz link)
import { BLUEPRINT_START_BUILDING_ROADS_LEVEL } from 'consts';

const Blueprints: Blueprint[] = [
  {
    id: BLUEPRINT_ID.BASE,
    base: true,
    width: 5,
    height: 4,
    minRange: 0,
    maxRange: 50,
    maxCount: 200,
    entrance: { x: 4, y: 3 },
    dir: RIGHT,
    controller: 1,
    startFrom: 'discover',
    closeTo: [
      { what: STRUCTURE_CONTROLLER, range: 1, weight: 10 },
      { what: FIND_SOURCES, range: 1, weight: 10 },
      { what: FIND_MINERALS, range: 1, weight: 10 },
      { what: FIND_EXIT_TOP, range: 0, weight: 1, index: 0 },
      { what: FIND_EXIT_RIGHT, range: 0, weight: 1, index: 0 },
      { what: FIND_EXIT_BOTTOM, range: 0, weight: 1, index: 0 },
      { what: FIND_EXIT_LEFT, range: 0, weight: 1, index: 0 },
    ],
    // L1 L2 L3 TO __
    // FA R1 R2 LI __
    // S2 TE ST S1 __
    // R3 R4 R5 R6 C1
    schema: [
      [
        { id: BLUEPRINT_STRUCTURE.LAB1, controller: 7, priority: 11, structure: STRUCTURE_LAB },
        { id: BLUEPRINT_STRUCTURE.LAB2, controller: 7, priority: 12, structure: STRUCTURE_LAB },
        { id: BLUEPRINT_STRUCTURE.LAB3, controller: 7, priority: 13, structure: STRUCTURE_LAB },
        { id: BLUEPRINT_STRUCTURE.TOWER1, controller: 3, priority: 0, structure: STRUCTURE_TOWER },
        undefined,
      ],
      [
        { id: BLUEPRINT_STRUCTURE.FACTORY, controller: 7, priority: 10, structure: STRUCTURE_FACTORY },
        { id: BLUEPRINT_STRUCTURE.ROAD1, controller: 5, priority: 2, structure: STRUCTURE_ROAD },
        { id: BLUEPRINT_STRUCTURE.ROAD2, controller: 5, priority: 2, structure: STRUCTURE_ROAD },
        { id: BLUEPRINT_STRUCTURE.LINK3, controller: 5, priority: 4, structure: STRUCTURE_LINK },
        undefined,
      ],
      [
        { id: BLUEPRINT_STRUCTURE.SPAWN2, controller: 7, priority: 1, structure: STRUCTURE_SPAWN },
        { id: BLUEPRINT_STRUCTURE.TERMINAL, controller: 6, priority: 10, structure: STRUCTURE_TERMINAL },
        { id: BLUEPRINT_STRUCTURE.STORAGE, controller: 4, priority: 5, structure: STRUCTURE_STORAGE },
        { id: BLUEPRINT_STRUCTURE.SPAWN1, controller: 1, priority: 1, structure: STRUCTURE_SPAWN },
        undefined,
      ],
      [
        {
          id: BLUEPRINT_STRUCTURE.ROAD3,
          controller: BLUEPRINT_START_BUILDING_ROADS_LEVEL,
          priority: 2,
          structure: STRUCTURE_ROAD,
        },
        {
          id: BLUEPRINT_STRUCTURE.ROAD4,
          controller: BLUEPRINT_START_BUILDING_ROADS_LEVEL,
          priority: 2,
          structure: STRUCTURE_ROAD,
        },
        {
          id: BLUEPRINT_STRUCTURE.ROAD5,
          controller: BLUEPRINT_START_BUILDING_ROADS_LEVEL,
          priority: 2,
          structure: STRUCTURE_ROAD,
        },
        {
          id: BLUEPRINT_STRUCTURE.ROAD6,
          controller: BLUEPRINT_START_BUILDING_ROADS_LEVEL,
          priority: 2,
          structure: STRUCTURE_ROAD,
        },
        {
          id: BLUEPRINT_STRUCTURE.CONTAINER3,
          controller: 3,
          priority: 6,
          structure: STRUCTURE_CONTAINER,
          supersededBy: BLUEPRINT_STRUCTURE.STORAGE,
        },
      ],
    ],
  },
  {
    id: BLUEPRINT_ID.TOWERS,
    width: 3,
    height: 3,
    entrance: { x: 1, y: 1 },
    dir: RIGHT,
    controller: 5,
    startFrom: BLUEPRINT_ID.BASE,
    closeTo: [{ what: BLUEPRINT_ID.BASE, range: 1, paved: true }],
    // TO LI S3
    // TO __ __
    // TO TO TO
    schema: [
      [
        { id: BLUEPRINT_STRUCTURE.TOWER2, controller: 5, priority: 1, structure: STRUCTURE_TOWER },
        { id: BLUEPRINT_STRUCTURE.LINK5, controller: 8, priority: 5, structure: STRUCTURE_LINK },
        { id: BLUEPRINT_STRUCTURE.SPAWN3, controller: 8, priority: 1, structure: STRUCTURE_SPAWN },
      ],
      [
        { id: BLUEPRINT_STRUCTURE.TOWER3, controller: 6, priority: 1, structure: STRUCTURE_TOWER },
        undefined,
        undefined,
      ],
      [
        { id: BLUEPRINT_STRUCTURE.TOWER4, controller: 8, priority: 1, structure: STRUCTURE_TOWER },
        { id: BLUEPRINT_STRUCTURE.TOWER5, controller: 8, priority: 1, structure: STRUCTURE_TOWER },
        { id: BLUEPRINT_STRUCTURE.TOWER6, controller: 8, priority: 1, structure: STRUCTURE_TOWER },
      ],
    ],
  },
  {
    id: BLUEPRINT_ID.CONTAINER_SOURCE_1,
    width: 1,
    height: 1,
    minRange: 1,
    maxRange: 1,
    maxCount: 8,
    controller: 3,
    entrance: { x: 0, y: 0 },
    startFrom: { what: FIND_SOURCES, index: 0 },
    closeTo: [
      { what: FIND_SOURCES, range: 1, index: 0 },
      { what: BLUEPRINT_ID.BASE, range: 1, paved: true },
    ],
    ignoreNearKeyPoints: true,
    ignorePaths: true,
    schema: [
      [
        {
          id: BLUEPRINT_STRUCTURE.CONTAINER1,
          controller: 3,
          priority: 7,
          structure: STRUCTURE_CONTAINER,
          supersededBy: BLUEPRINT_STRUCTURE.LINK1,
        },
      ],
    ],
  },
  {
    id: BLUEPRINT_ID.CONTAINER_SOURCE_2,
    width: 1,
    height: 1,
    minRange: 1,
    maxRange: 1,
    maxCount: 8,
    controller: 3,
    entrance: { x: 0, y: 0 },
    startFrom: { what: FIND_SOURCES, index: 1 },
    closeTo: [
      { what: FIND_SOURCES, range: 1, index: 1 },
      { what: BLUEPRINT_ID.BASE, range: 1, paved: true },
    ],
    ignoreNearKeyPoints: true,
    ignorePaths: true,
    schema: [
      [
        {
          id: BLUEPRINT_STRUCTURE.CONTAINER2,
          controller: 3,
          priority: 8,
          structure: STRUCTURE_CONTAINER,
          supersededBy: BLUEPRINT_STRUCTURE.LINK2,
        },
      ],
    ],
  },
  {
    id: BLUEPRINT_ID.CONTAINER_CONTROLLER,
    width: 1,
    height: 1,
    minRange: 1,
    maxRange: 1,
    maxCount: 8,
    controller: 3,
    entrance: { x: 0, y: 0 },
    startFrom: STRUCTURE_CONTROLLER,
    closeTo: [
      { what: STRUCTURE_CONTROLLER, range: 1 },
      { what: BLUEPRINT_ID.BASE, range: 1, paved: true },
    ],
    ignoreNearKeyPoints: true,
    ignorePaths: true,
    schema: [
      [
        {
          id: BLUEPRINT_STRUCTURE.CONTAINER4,
          controller: 3,
          priority: 9,
          structure: STRUCTURE_CONTAINER,
          supersededBy: BLUEPRINT_STRUCTURE.LINK4,
        },
      ],
    ],
  },
  {
    id: BLUEPRINT_ID.LINK_SOURCE_1,
    width: 1,
    height: 1,
    minRange: 1,
    maxRange: 1,
    maxCount: 5,
    controller: 6,
    startFrom: BLUEPRINT_ID.CONTAINER_SOURCE_1,
    closeTo: [
      { what: BLUEPRINT_ID.CONTAINER_SOURCE_1, range: 1 },
      { what: BLUEPRINT_ID.BASE, range: 1, weight: 1 },
    ],
    ignoreNearKeyPoints: true,
    schema: [[{ id: BLUEPRINT_STRUCTURE.LINK1, controller: 6, priority: 5, structure: STRUCTURE_LINK }]],
  },
  {
    id: BLUEPRINT_ID.LINK_SOURCE_2,
    width: 1,
    height: 1,
    minRange: 1,
    maxRange: 1,
    maxCount: 5,
    controller: 7,
    startFrom: BLUEPRINT_ID.CONTAINER_SOURCE_2,
    closeTo: [
      { what: BLUEPRINT_ID.CONTAINER_SOURCE_2, range: 1 },
      { what: BLUEPRINT_ID.BASE, range: 1, weight: 1 },
    ],
    ignoreNearKeyPoints: true,
    schema: [[{ id: BLUEPRINT_STRUCTURE.LINK2, controller: 7, priority: 5, structure: STRUCTURE_LINK }]],
  },
  {
    id: BLUEPRINT_ID.LINK_CONTROLLER,
    width: 1,
    height: 1,
    minRange: 1,
    maxRange: 1,
    maxCount: 5,
    controller: 5,
    startFrom: BLUEPRINT_ID.CONTAINER_CONTROLLER,
    closeTo: [
      { what: BLUEPRINT_ID.CONTAINER_CONTROLLER, range: 1 },
      { what: BLUEPRINT_ID.BASE, range: 1, weight: 1 },
    ],
    ignoreNearKeyPoints: true,
    schema: [[{ id: BLUEPRINT_STRUCTURE.LINK4, controller: 5, priority: 5, structure: STRUCTURE_LINK }]],
  },
  {
    id: BLUEPRINT_ID.EXTRACTOR,
    width: 1,
    height: 1,
    minRange: 0,
    maxRange: 0,
    maxCount: 1,
    controller: 6,
    startFrom: { what: FIND_MINERALS, index: 0 },
    ignoreNearKeyPoints: true,
    ignorePaths: true,
    schema: [[{ id: BLUEPRINT_STRUCTURE.EXTRACTOR, controller: 6, priority: 8, structure: STRUCTURE_EXTRACTOR }]],
  },
  {
    id: BLUEPRINT_ID.CONTAINER_EXTRACTOR,
    width: 1,
    height: 1,
    minRange: 1,
    maxRange: 1,
    maxCount: 8,
    controller: 6,
    entrance: { x: 0, y: 0 },
    startFrom: BLUEPRINT_ID.EXTRACTOR,
    closeTo: [
      { what: FIND_MINERALS, range: 1, index: 0 },
      { what: BLUEPRINT_ID.BASE, range: 1, paved: true },
    ],
    ignoreNearKeyPoints: true,
    ignorePaths: true,
    schema: [[{ id: BLUEPRINT_STRUCTURE.CONTAINER5, controller: 6, priority: 9, structure: STRUCTURE_CONTAINER }]],
  },
  {
    id: BLUEPRINT_ID.EXT_PACK_1,
    label: '1',
    width: 2,
    height: 3,
    entrance: { x: 1, y: 1 },
    dir: RIGHT,
    controller: 2,
    startFrom: BLUEPRINT_ID.BASE,
    closeTo: [{ what: BLUEPRINT_ID.BASE, range: 1, paved: true }],
    // E E
    // E _
    // E E
    schema: [
      [
        { id: BLUEPRINT_STRUCTURE.EXTENSION1, controller: 2, priority: 3, structure: STRUCTURE_EXTENSION },
        { id: BLUEPRINT_STRUCTURE.EXTENSION2, controller: 2, priority: 3, structure: STRUCTURE_EXTENSION },
      ],
      [{ id: BLUEPRINT_STRUCTURE.EXTENSION3, controller: 2, priority: 3, structure: STRUCTURE_EXTENSION }, undefined],
      [
        { id: BLUEPRINT_STRUCTURE.EXTENSION4, controller: 2, priority: 3, structure: STRUCTURE_EXTENSION },
        { id: BLUEPRINT_STRUCTURE.EXTENSION5, controller: 2, priority: 3, structure: STRUCTURE_EXTENSION },
      ],
    ],
  },
  {
    id: BLUEPRINT_ID.EXT_PACK_2,
    label: '2',
    width: 2,
    height: 3,
    entrance: { x: 1, y: 1 },
    dir: RIGHT,
    controller: 3,
    startFrom: BLUEPRINT_ID.BASE,
    closeTo: [{ what: BLUEPRINT_ID.BASE, weight: 10, range: 1, paved: true }],
    schema: [
      [
        { id: BLUEPRINT_STRUCTURE.EXTENSION6, controller: 3, priority: 3, structure: STRUCTURE_EXTENSION },
        { id: BLUEPRINT_STRUCTURE.EXTENSION7, controller: 3, priority: 3, structure: STRUCTURE_EXTENSION },
      ],
      [{ id: BLUEPRINT_STRUCTURE.EXTENSION8, controller: 3, priority: 3, structure: STRUCTURE_EXTENSION }, undefined],
      [
        { id: BLUEPRINT_STRUCTURE.EXTENSION9, controller: 3, priority: 3, structure: STRUCTURE_EXTENSION },
        { id: BLUEPRINT_STRUCTURE.EXTENSION10, controller: 3, priority: 3, structure: STRUCTURE_EXTENSION },
      ],
    ],
  },
  {
    id: BLUEPRINT_ID.EXT_PACK_3,
    label: '3',
    width: 2,
    height: 3,
    entrance: { x: 1, y: 1 },
    dir: RIGHT,
    controller: 4,
    startFrom: BLUEPRINT_ID.BASE,
    closeTo: [{ what: BLUEPRINT_ID.BASE, weight: 10, range: 1, paved: true }],
    schema: [
      [
        { id: BLUEPRINT_STRUCTURE.EXTENSION11, controller: 4, priority: 3, structure: STRUCTURE_EXTENSION },
        { id: BLUEPRINT_STRUCTURE.EXTENSION12, controller: 4, priority: 3, structure: STRUCTURE_EXTENSION },
      ],
      [{ id: BLUEPRINT_STRUCTURE.EXTENSION13, controller: 4, priority: 3, structure: STRUCTURE_EXTENSION }, undefined],
      [
        { id: BLUEPRINT_STRUCTURE.EXTENSION14, controller: 4, priority: 3, structure: STRUCTURE_EXTENSION },
        { id: BLUEPRINT_STRUCTURE.EXTENSION15, controller: 4, priority: 3, structure: STRUCTURE_EXTENSION },
      ],
    ],
  },
  {
    id: BLUEPRINT_ID.EXT_PACK_4,
    label: '4',
    width: 2,
    height: 3,
    entrance: { x: 1, y: 1 },
    dir: RIGHT,
    controller: 4,
    startFrom: BLUEPRINT_ID.BASE,
    closeTo: [{ what: BLUEPRINT_ID.BASE, weight: 10, range: 1, paved: true }],
    schema: [
      [
        { id: BLUEPRINT_STRUCTURE.EXTENSION16, controller: 4, priority: 3, structure: STRUCTURE_EXTENSION },
        { id: BLUEPRINT_STRUCTURE.EXTENSION17, controller: 4, priority: 3, structure: STRUCTURE_EXTENSION },
      ],
      [{ id: BLUEPRINT_STRUCTURE.EXTENSION18, controller: 4, priority: 3, structure: STRUCTURE_EXTENSION }, undefined],
      [
        { id: BLUEPRINT_STRUCTURE.EXTENSION19, controller: 4, priority: 3, structure: STRUCTURE_EXTENSION },
        { id: BLUEPRINT_STRUCTURE.EXTENSION20, controller: 4, priority: 3, structure: STRUCTURE_EXTENSION },
      ],
    ],
  },
  {
    id: BLUEPRINT_ID.EXT_PACK_5,
    label: '5',
    width: 2,
    height: 3,
    entrance: { x: 1, y: 1 },
    dir: RIGHT,
    controller: 5,
    startFrom: BLUEPRINT_ID.BASE,
    closeTo: [{ what: BLUEPRINT_ID.BASE, weight: 10, range: 1, paved: true }],
    schema: [
      [
        { id: BLUEPRINT_STRUCTURE.EXTENSION21, controller: 5, priority: 3, structure: STRUCTURE_EXTENSION },
        { id: BLUEPRINT_STRUCTURE.EXTENSION22, controller: 5, priority: 3, structure: STRUCTURE_EXTENSION },
      ],
      [{ id: BLUEPRINT_STRUCTURE.EXTENSION23, controller: 5, priority: 3, structure: STRUCTURE_EXTENSION }, undefined],
      [
        { id: BLUEPRINT_STRUCTURE.EXTENSION24, controller: 5, priority: 3, structure: STRUCTURE_EXTENSION },
        { id: BLUEPRINT_STRUCTURE.EXTENSION25, controller: 5, priority: 3, structure: STRUCTURE_EXTENSION },
      ],
    ],
  },
  {
    id: BLUEPRINT_ID.EXT_PACK_6,
    label: '6',
    width: 2,
    height: 3,
    entrance: { x: 1, y: 1 },
    dir: RIGHT,
    controller: 5,
    startFrom: BLUEPRINT_ID.BASE,
    closeTo: [{ what: BLUEPRINT_ID.BASE, weight: 10, range: 1, paved: true }],
    schema: [
      [
        { id: BLUEPRINT_STRUCTURE.EXTENSION26, controller: 5, priority: 3, structure: STRUCTURE_EXTENSION },
        { id: BLUEPRINT_STRUCTURE.EXTENSION27, controller: 5, priority: 3, structure: STRUCTURE_EXTENSION },
      ],
      [{ id: BLUEPRINT_STRUCTURE.EXTENSION28, controller: 5, priority: 3, structure: STRUCTURE_EXTENSION }, undefined],
      [
        { id: BLUEPRINT_STRUCTURE.EXTENSION29, controller: 5, priority: 3, structure: STRUCTURE_EXTENSION },
        { id: BLUEPRINT_STRUCTURE.EXTENSION30, controller: 5, priority: 3, structure: STRUCTURE_EXTENSION },
      ],
    ],
  },
  {
    id: BLUEPRINT_ID.EXT_PACK_7,
    label: '7',
    width: 2,
    height: 3,
    entrance: { x: 1, y: 1 },
    dir: RIGHT,
    controller: 6,
    startFrom: BLUEPRINT_ID.BASE,
    closeTo: [{ what: BLUEPRINT_ID.BASE, weight: 10, range: 1, paved: true }],
    schema: [
      [
        { id: BLUEPRINT_STRUCTURE.EXTENSION31, controller: 6, priority: 3, structure: STRUCTURE_EXTENSION },
        { id: BLUEPRINT_STRUCTURE.EXTENSION32, controller: 6, priority: 3, structure: STRUCTURE_EXTENSION },
      ],
      [{ id: BLUEPRINT_STRUCTURE.EXTENSION33, controller: 6, priority: 3, structure: STRUCTURE_EXTENSION }, undefined],
      [
        { id: BLUEPRINT_STRUCTURE.EXTENSION34, controller: 6, priority: 3, structure: STRUCTURE_EXTENSION },
        { id: BLUEPRINT_STRUCTURE.EXTENSION35, controller: 6, priority: 3, structure: STRUCTURE_EXTENSION },
      ],
    ],
  },
  {
    id: BLUEPRINT_ID.EXT_PACK_8,
    label: '8',
    width: 2,
    height: 3,
    entrance: { x: 1, y: 1 },
    dir: RIGHT,
    controller: 6,
    startFrom: BLUEPRINT_ID.BASE,
    closeTo: [{ what: BLUEPRINT_ID.BASE, weight: 10, range: 1, paved: true }],
    schema: [
      [
        { id: BLUEPRINT_STRUCTURE.EXTENSION36, controller: 6, priority: 3, structure: STRUCTURE_EXTENSION },
        { id: BLUEPRINT_STRUCTURE.EXTENSION37, controller: 6, priority: 3, structure: STRUCTURE_EXTENSION },
      ],
      [{ id: BLUEPRINT_STRUCTURE.EXTENSION38, controller: 6, priority: 3, structure: STRUCTURE_EXTENSION }, undefined],
      [
        { id: BLUEPRINT_STRUCTURE.EXTENSION39, controller: 6, priority: 3, structure: STRUCTURE_EXTENSION },
        { id: BLUEPRINT_STRUCTURE.EXTENSION40, controller: 6, priority: 3, structure: STRUCTURE_EXTENSION },
      ],
    ],
  },
  {
    id: BLUEPRINT_ID.EXT_PACK_9,
    label: '9',
    width: 2,
    height: 3,
    entrance: { x: 1, y: 1 },
    dir: RIGHT,
    controller: 7,
    startFrom: BLUEPRINT_ID.BASE,
    closeTo: [{ what: BLUEPRINT_ID.BASE, weight: 10, range: 1, paved: true }],
    schema: [
      [
        { id: BLUEPRINT_STRUCTURE.EXTENSION41, controller: 7, priority: 3, structure: STRUCTURE_EXTENSION },
        { id: BLUEPRINT_STRUCTURE.EXTENSION42, controller: 7, priority: 3, structure: STRUCTURE_EXTENSION },
      ],
      [{ id: BLUEPRINT_STRUCTURE.EXTENSION43, controller: 7, priority: 3, structure: STRUCTURE_EXTENSION }, undefined],
      [
        { id: BLUEPRINT_STRUCTURE.EXTENSION44, controller: 7, priority: 3, structure: STRUCTURE_EXTENSION },
        { id: BLUEPRINT_STRUCTURE.EXTENSION45, controller: 7, priority: 3, structure: STRUCTURE_EXTENSION },
      ],
    ],
  },
  {
    id: BLUEPRINT_ID.EXT_PACK_10,
    label: '10',
    width: 2,
    height: 3,
    entrance: { x: 1, y: 1 },
    dir: RIGHT,
    controller: 7,
    startFrom: BLUEPRINT_ID.BASE,
    closeTo: [{ what: BLUEPRINT_ID.BASE, weight: 10, range: 1, paved: true }],
    schema: [
      [
        { id: BLUEPRINT_STRUCTURE.EXTENSION46, controller: 7, priority: 3, structure: STRUCTURE_EXTENSION },
        { id: BLUEPRINT_STRUCTURE.EXTENSION47, controller: 7, priority: 3, structure: STRUCTURE_EXTENSION },
      ],
      [{ id: BLUEPRINT_STRUCTURE.EXTENSION48, controller: 7, priority: 3, structure: STRUCTURE_EXTENSION }, undefined],
      [
        { id: BLUEPRINT_STRUCTURE.EXTENSION49, controller: 7, priority: 3, structure: STRUCTURE_EXTENSION },
        { id: BLUEPRINT_STRUCTURE.EXTENSION50, controller: 7, priority: 3, structure: STRUCTURE_EXTENSION },
      ],
    ],
  },
  {
    id: BLUEPRINT_ID.EXT_PACK_11,
    label: '11',
    width: 2,
    height: 3,
    entrance: { x: 1, y: 1 },
    dir: RIGHT,
    controller: 8,
    startFrom: BLUEPRINT_ID.BASE,
    closeTo: [{ what: BLUEPRINT_ID.BASE, weight: 10, range: 1, paved: true }],
    schema: [
      [
        { id: BLUEPRINT_STRUCTURE.EXTENSION51, controller: 8, priority: 3, structure: STRUCTURE_EXTENSION },
        { id: BLUEPRINT_STRUCTURE.EXTENSION52, controller: 8, priority: 3, structure: STRUCTURE_EXTENSION },
      ],
      [{ id: BLUEPRINT_STRUCTURE.EXTENSION53, controller: 8, priority: 3, structure: STRUCTURE_EXTENSION }, undefined],
      [
        { id: BLUEPRINT_STRUCTURE.EXTENSION54, controller: 8, priority: 3, structure: STRUCTURE_EXTENSION },
        { id: BLUEPRINT_STRUCTURE.EXTENSION55, controller: 8, priority: 3, structure: STRUCTURE_EXTENSION },
      ],
    ],
  },
  {
    id: BLUEPRINT_ID.EXT_PACK_12,
    label: '12',
    width: 2,
    height: 3,
    entrance: { x: 1, y: 1 },
    dir: RIGHT,
    controller: 8,
    startFrom: BLUEPRINT_ID.BASE,
    closeTo: [{ what: BLUEPRINT_ID.BASE, weight: 10, range: 1, paved: true }],
    schema: [
      [
        { id: BLUEPRINT_STRUCTURE.EXTENSION56, controller: 8, priority: 3, structure: STRUCTURE_EXTENSION },
        { id: BLUEPRINT_STRUCTURE.EXTENSION57, controller: 8, priority: 3, structure: STRUCTURE_EXTENSION },
      ],
      [{ id: BLUEPRINT_STRUCTURE.EXTENSION58, controller: 8, priority: 3, structure: STRUCTURE_EXTENSION }, undefined],
      [
        { id: BLUEPRINT_STRUCTURE.EXTENSION59, controller: 8, priority: 3, structure: STRUCTURE_EXTENSION },
        { id: BLUEPRINT_STRUCTURE.EXTENSION60, controller: 8, priority: 3, structure: STRUCTURE_EXTENSION },
      ],
    ],
  },
  {
    id: BLUEPRINT_ID.OBSERVER,
    width: 1,
    height: 1,
    controller: 8,
    startFrom: BLUEPRINT_ID.BASE,
    closeTo: [{ what: BLUEPRINT_ID.BASE, range: 1 }],
    schema: [[{ id: BLUEPRINT_STRUCTURE.OBSERVER, controller: 8, priority: 10, structure: STRUCTURE_OBSERVER }]],
  },
];

export const BlueprintsMap = Blueprints.reduce(
  (acc, blueprint) => {
    acc[blueprint.id] = blueprint;
    return acc;
  },
  {} as Record<string, Blueprint>,
);

export default Blueprints;
