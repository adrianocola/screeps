import { keyBy } from 'lodash';
import Blueprints from 'blueprints/Blueprints';
import BlueprintScanner from 'blueprints/BlueprintScanner';
import BlueprintVisualizer from 'blueprints/BlueprintVisualizer';

const drawBlueprint = (room: Room) => {
  if (!room.memory.visuals?.blueprint || !room.memory.blueprint) return;

  const blueprintsMap = keyBy(Blueprints, 'id');
  const basicResults: BlueprintScanResult[] = Object.entries(room.memory.blueprint.schemas).map(([id, schema]) => {
    const blueprint = blueprintsMap[id as BLUEPRINT_ID];
    return {
      x: schema.pos.x,
      y: schema.pos.y,
      totalCost: 0,
      dir: schema.dir,
      blueprint: BlueprintScanner.blueprintToDirection(blueprint, schema.dir),
      costs: [], // TODO also calc paths
    } as BlueprintScanResult;
  });

  new BlueprintVisualizer(room.name).draw(basicResults);
};

export default drawBlueprint;
