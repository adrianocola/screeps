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
      blueprintResult.costs.forEach(cost => {
        this.visual.poly([entrancePos, ...cost.path], { lineStyle: 'dashed', stroke: color, opacity: 0.5 });
      });

      this.visual.circle(entrancePos.x, entrancePos.y, {
        fill: 'white',
        radius: 0.3,
        opacity: 0.25,
      });
    }

    // this.visual.text(blueprintResult.blueprint.id, blueprintResult.x, blueprintResult.y, { color: 'white' });
  }

  public draw(blueprintResults: BlueprintScanResult[]) {
    blueprintResults.forEach(blueprintResult => this.drawBlueprintResult(blueprintResult));
  }
}

export default BlueprintVisualizer;
