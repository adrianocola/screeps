import { getBlueprintRoadsToLevel } from 'utils/blueprint';

export const STRUCTURES_COLORS: Partial<Record<BuildableStructureConstant, string>> = {
  [STRUCTURE_SPAWN]: 'red',
  [STRUCTURE_EXTENSION]: 'yellow',
  [STRUCTURE_ROAD]: 'grey',
  [STRUCTURE_WALL]: 'brown',
  [STRUCTURE_RAMPART]: 'white',
  [STRUCTURE_LINK]: 'purple',
  [STRUCTURE_STORAGE]: 'orange',
  [STRUCTURE_TOWER]: 'blue',
  [STRUCTURE_LAB]: 'cyan',
  [STRUCTURE_TERMINAL]: 'green',
  [STRUCTURE_FACTORY]: 'magenta',
  [STRUCTURE_CONTAINER]: 'silver',
  [STRUCTURE_EXTRACTOR]: 'gold',
  [STRUCTURE_OBSERVER]: 'red',
};

class BlueprintVisualizer {
  private roomName: string;
  private visual: RoomVisual;

  public constructor(roomName: string) {
    this.roomName = roomName;
    this.visual = new RoomVisual(roomName);
  }

  private drawBlueprintResult(blueprintResult: BlueprintScanResult) {
    const isBase = !!blueprintResult.blueprint.base;

    const color = isBase ? '#00ff00' : '#0000ff';

    this.visual.rect(
      blueprintResult.x,
      blueprintResult.y,
      blueprintResult.blueprint.width - 1,
      blueprintResult.blueprint.height - 1,
      {
        fill: color,
        stroke: color,
        opacity: 0.05,
      },
    );

    blueprintResult.blueprint.schema.forEach((row, y) => {
      row.forEach((item, x) => {
        if (!item) return;
        const structureColor = STRUCTURES_COLORS[item?.structure];
        if (!color) return;

        this.visual.circle(blueprintResult.x + x, blueprintResult.y + y, {
          fill: structureColor,
          opacity: 0.2,
          radius: 0.2,
        });
      });
    });

    if (blueprintResult.blueprint.entrance) {
      const entrancePos = new RoomPosition(
        blueprintResult.x + blueprintResult.blueprint.entrance.x,
        blueprintResult.y + blueprintResult.blueprint.entrance.y,
        this.roomName,
      );

      this.visual.circle(entrancePos.x, entrancePos.y, {
        fill: 'white',
        radius: 0.3,
        opacity: 0.25,
      });

      if (blueprintResult.blueprint.label) {
        this.visual.text(blueprintResult.blueprint.label, entrancePos.x, entrancePos.y + 0.25, {
          color: 'black',
          opacity: 0.5,
        });
      }
    }
  }

  private drawRoads() {
    const roadsList = getBlueprintRoadsToLevel(Game.rooms[this.roomName], 8);
    roadsList.forEach(road => {
      this.visual.poly(road, { lineStyle: 'dashed', stroke: 'gray', opacity: 0.2 });
    });
  }

  public draw(blueprintResults: BlueprintScanResult[]) {
    blueprintResults.forEach(blueprintResult => this.drawBlueprintResult(blueprintResult));
    this.drawRoads();
  }
}

export default BlueprintVisualizer;
