import Blueprints, { BlueprintsMap } from './Blueprints';
import {
  checkIsOppositeBaseDirection,
  checkIsValidBuildablePos,
  checkPos,
  getAdjacentsPositions,
  getDirectionRotation,
  getOppositeBaseDirection,
  getPosIndex,
  oppositePos,
  rotateBaseDirection,
  rotatePos,
} from 'utils/directions';
import { BASE_DIRECTIONS } from 'consts';

class BlueprintScanner {
  private roomName: string;
  private room: Room;
  private buildingCostMatrix: CostMatrix;
  private buildingsAndPathsCostMatrix: CostMatrix;
  private terrain: RoomTerrain;
  private results: Record<string, BlueprintScanResult>;

  public constructor(roomName: string) {
    this.roomName = roomName;
    this.room = Game.rooms[roomName];
    this.buildingCostMatrix = new PathFinder.CostMatrix();
    this.buildingsAndPathsCostMatrix = new PathFinder.CostMatrix();
    this.terrain = new Room.Terrain(roomName);
    this.results = {};

    this.setInitialCostMatrixes();
  }

  public static rotateSchema(schema: (SchemaItem | undefined)[][], rotate: DIRECTION_ROTATION) {
    if (rotate === DIRECTION_ROTATION.ROTATE_CLOCKWISE) {
      return schema[0].map((val, index) => schema.map(row => row[index]).reverse());
    }
    if (rotate === DIRECTION_ROTATION.ROTATE_COUNTER_CLOCKWISE) {
      return schema[0].map((val, index) => schema.map(row => row[row.length - 1 - index]));
    }

    return schema;
  }

  public static oppositeSchema(schema: (SchemaItem | undefined)[][]) {
    const height = schema.length;
    const width = schema[0].length;
    const newSchema: (SchemaItem | undefined)[][] = new Array(height)
      .fill(undefined)
      .map(() => new Array(width).fill(undefined) as (SchemaItem | undefined)[]);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const opossitePos = oppositePos({ x, y }, width, height);
        newSchema[opossitePos.y][opossitePos.x] = schema[y][x];
      }
    }
    return newSchema;
  }

  public static rotateBlueprint(blueprint: Blueprint, rotate: DIRECTION_ROTATION) {
    if (!blueprint.dir) return blueprint;

    const dir = rotateBaseDirection(blueprint.dir, rotate);
    return {
      ...blueprint,
      dir,
      width: blueprint.height,
      height: blueprint.width,
      schema: BlueprintScanner.rotateSchema(blueprint.schema, rotate),
      entrance: blueprint.entrance && rotatePos(blueprint.entrance, blueprint.width, blueprint.height, rotate),
    };
  }

  public static oppositeBlueprint(blueprint: Blueprint) {
    return {
      ...blueprint,
      dir: blueprint.dir && getOppositeBaseDirection(blueprint.dir),
      schema: BlueprintScanner.oppositeSchema(blueprint.schema),
      entrance: blueprint.entrance && oppositePos(blueprint.entrance, blueprint.width, blueprint.height),
    };
  }

  public static blueprintToDirection(blueprint: Blueprint, direction: BaseDirectionConstant) {
    if (!blueprint.dir || blueprint.dir === direction) return blueprint;

    if (checkIsOppositeBaseDirection(blueprint.dir, direction)) return BlueprintScanner.oppositeBlueprint(blueprint);

    return BlueprintScanner.rotateBlueprint(blueprint, getDirectionRotation(blueprint.dir, direction));
  }

  private isNearKeyPoint(pos: Pos, ignoreNearKeyPoints?: boolean) {
    if (ignoreNearKeyPoints) return false;

    const roomPos = new RoomPosition(pos.x, pos.y, this.roomName);
    if (this.room.controller && roomPos.inRangeTo(this.room.controller.pos, 2)) return true;

    if (this.room.find(FIND_SOURCES).some(s => roomPos.isNearTo(s))) return true;

    if (this.room.find(FIND_MINERALS).some(s => roomPos.isNearTo(s))) return true;

    return false;
  }

  private checkIfBlueprintFit(pos: Pos, blueprint: Blueprint, costMatrix: CostMatrix) {
    for (let y = pos.y; y < pos.y + blueprint.height; y++) {
      for (let x = pos.x; x < pos.x + blueprint.width; x++) {
        if (!checkIsValidBuildablePos({ x, y })) return false;

        const code = this.terrain.get(x, y);
        if (code === TERRAIN_MASK_WALL || costMatrix.get(x, y) === 0xff || this.isNearKeyPoint({ x, y })) {
          return false;
        }
      }
    }

    return true;
  }

  private getBlueprintCosts(pos: Pos, blueprint: Blueprint) {
    if (!blueprint.closeTo) return [];

    const costs: BlueprintCost[] = [];

    const entrancePos = new RoomPosition(
      pos.x + (blueprint.entrance?.x ?? 0),
      pos.y + (blueprint.entrance?.y ?? 0),
      this.roomName,
    );

    const costMatrix = this.buildingCostMatrix.clone();

    blueprint.schema.forEach((row, y) => {
      row.forEach((item, x) => {
        if (item) {
          costMatrix.set(pos.x + x, pos.y + y, 0xff);
        }
      });
    });

    const roomCallback = () => costMatrix;

    const searchOptions = { roomCallback, maxRooms: 1 };

    for (const closeTo of blueprint.closeTo) {
      if (closeTo.what === STRUCTURE_CONTROLLER && this.room.controller) {
        const result = PathFinder.search(
          entrancePos,
          { pos: this.room.controller.pos, range: closeTo.range ?? 1 },
          searchOptions,
        );
        if (result.incomplete) return [];
        costs.push({ value: result.cost, weight: closeTo.weight ?? 1, path: result.path });
      } else if (closeTo.what === FIND_SOURCES || closeTo.what === FIND_MINERALS) {
        let findings = this.room.find(closeTo.what);
        if (closeTo.index !== undefined) {
          findings = [findings[closeTo.index]];
        }
        for (const item of findings) {
          const result = PathFinder.search(entrancePos, { pos: item.pos, range: closeTo.range ?? 1 }, searchOptions);
          if (result.incomplete) return [];
          costs.push({ value: result.cost, weight: closeTo.weight ?? 1, path: result.path });
        }
      } else if (typeof closeTo.what === 'string') {
        const blueprintResult = this.results[closeTo.what];
        const goalPos = new RoomPosition(
          blueprintResult.x + (blueprintResult.blueprint.entrance?.x ?? 0),
          blueprintResult.y + (blueprintResult.blueprint.entrance?.y ?? 0),
          this.roomName,
        );
        const result = PathFinder.search(entrancePos, { pos: goalPos, range: closeTo.range ?? 1 }, searchOptions);
        if (result.incomplete) return [];
        costs.push({ value: result.cost, weight: closeTo.weight ?? 1, path: result.path });
      } else {
        let findings = this.room.find(closeTo.what);
        if (findings.length) {
          if (closeTo.index !== undefined) {
            findings = [findings[closeTo.index]];
          }
          for (const item of findings) {
            const result = PathFinder.search(entrancePos, { pos: item, range: closeTo.range ?? 1 }, searchOptions);
            if (result.incomplete) return [];
            costs.push({ value: result.cost, weight: closeTo.weight ?? 1, path: result.path });
          }
        }
      }
    }

    return costs;
  }

  private getBlueprintTotalCosts(costs: BlueprintCost[]) {
    return costs.reduce((acc, cost) => acc + cost.value * cost.weight, 0) / costs.length;
  }

  private radialScan(pos: Pos, minRange: number, maxRange: number, callback: (pos: Pos) => boolean | undefined) {
    const scannedPositions: Record<string, boolean> = {};
    let scanPositions: Pos[] = [pos];
    let found = false;
    let range = 0;

    do {
      const newScanPositions: Pos[] = [];

      for (const scanPos of scanPositions) {
        const posIndex = getPosIndex(scanPos);
        if (scannedPositions[posIndex]) continue;

        scannedPositions[posIndex] = true;
        if (!checkIsValidBuildablePos(scanPos)) continue;

        if (range > 0) {
          const code = this.terrain.get(scanPos.x, scanPos.y);
          if (code === TERRAIN_MASK_WALL) continue;
        }

        if (range >= minRange && callback(scanPos)) {
          found = true;
          break;
        }

        newScanPositions.push(...getAdjacentsPositions(scanPos));
      }

      scanPositions = newScanPositions;

      range++;
    } while (!found && range <= maxRange);
  }

  private getPossibleBlueprintPositions(pos: Pos, blueprint: Blueprint) {
    const minRange = blueprint.minRange ?? 2;
    const maxRange = blueprint.maxRange ?? 50;
    const maxCount = blueprint.maxCount ?? 100;
    const possiblePositions: BlueprintScanResult[] = [];
    const costMatrix = blueprint.ignorePaths ? this.buildingCostMatrix : this.buildingsAndPathsCostMatrix;
    const directions = blueprint.dir ? BASE_DIRECTIONS : [RIGHT];
    const is1x1 = blueprint.width === 1 && blueprint.height === 1;

    this.radialScan(pos, minRange, maxRange, testPos => {
      if (costMatrix.get(testPos.x, testPos.y) === 0xff || this.isNearKeyPoint(testPos, blueprint.ignoreNearKeyPoints))
        return;

      directions.forEach(dir => {
        const dirBlueprint = BlueprintScanner.blueprintToDirection(blueprint, dir);
        if (is1x1 || this.checkIfBlueprintFit(testPos, dirBlueprint, costMatrix)) {
          const costs = this.getBlueprintCosts(testPos, dirBlueprint);
          if (!dirBlueprint.ignoreNearKeyPoints && !costs.length) return;
          const totalCost = this.getBlueprintTotalCosts(costs);
          possiblePositions.push({
            x: testPos.x,
            y: testPos.y,
            totalCost,
            dir,
            blueprint: dirBlueprint,
            costs,
          });
        }
      });

      return !!maxCount && possiblePositions.length >= maxCount;
    });

    return possiblePositions;
  }

  private getBestBlueprintPosition = (possibleResults: BlueprintScanResult[]) => {
    if (!possibleResults.length) return;

    return possibleResults.reduce((acc, rect) => (rect.totalCost < acc.totalCost ? rect : acc), possibleResults[0]);
  };

  private getStartPos(startFrom: StartFrom | Pos | STRUCTURE_CONTROLLER | string) {
    if (startFrom === STRUCTURE_CONTROLLER) {
      return this.room.controller?.pos;
    } else if (typeof startFrom === 'string') {
      const result = this.results[startFrom];
      if (result) {
        return new RoomPosition(
          result.x + (result.blueprint.entrance?.x ?? 0),
          result.y + (result.blueprint.entrance?.y ?? 0),
          this.roomName,
        );
      }
    } else if (checkPos(startFrom)) {
      return new RoomPosition(startFrom.x, startFrom.y, this.roomName);
    } else if (startFrom.what === FIND_SOURCES || startFrom.what === FIND_MINERALS) {
      const item = this.room.find(startFrom.what)[startFrom.index];
      return item?.pos;
    }

    return undefined;
  }

  private getRelativeStructurePos = (
    blueprint: Blueprint,
    blueprintStructure: BLUEPRINT_STRUCTURE,
  ): Pos | undefined => {
    for (let y = 0; y < blueprint.height; y++) {
      for (let x = 0; x < blueprint.width; x++) {
        if (blueprint.schema[y][x]?.id === blueprintStructure) {
          return { x, y };
        }
      }
    }

    return undefined;
  };

  private scanBaseBlueprint(rootSpawn?: StructureSpawn) {
    const baseBlueprint = BlueprintsMap[BLUEPRINT_ID.BASE];
    if (!baseBlueprint) throw new Error('No base blueprint found');

    if (rootSpawn) {
      const spawn1Pos = this.getRelativeStructurePos(baseBlueprint, BLUEPRINT_STRUCTURE.SPAWN1);
      if (!spawn1Pos) throw new Error('No spawn1 found in base blueprint');

      const initialPos = { x: rootSpawn.pos.x - spawn1Pos.x, y: rootSpawn.pos.y - spawn1Pos.y };

      const costs = this.getBlueprintCosts(initialPos, baseBlueprint);
      return this.scanRegularBlueprint(baseBlueprint, {
        ...initialPos,
        totalCost: this.getBlueprintTotalCosts(costs),
        dir: baseBlueprint.dir ?? RIGHT,
        blueprint: baseBlueprint,
        costs,
      });
    }

    const basePosition = this.scanRegularBlueprint(baseBlueprint);

    // TODO tratar caso de não achar posição válida (salvar essa informação na memory da room)
    if (!basePosition) throw new Error('No base result found');

    return basePosition;
  }

  private scanRegularBlueprint = (blueprint: Blueprint, forceBestPosition?: BlueprintScanResult) => {
    const pos = this.getStartPos(blueprint.startFrom);
    if (!pos) return;

    let bestPosition = forceBestPosition;

    if (!bestPosition) {
      const possiblePositions = this.getPossibleBlueprintPositions(pos, blueprint);
      bestPosition = this.getBestBlueprintPosition(possiblePositions);
    }

    if (bestPosition) {
      this.results[blueprint.id] = bestPosition;
      this.updateBuildingCostMatrix(bestPosition);
    }

    return bestPosition;
  };

  private setInitialCostMatrixes = () => {
    const structure = this.room.find(FIND_STRUCTURES);
    for (const struct of structure) {
      if (struct.structureType === STRUCTURE_WALL || struct.structureType === STRUCTURE_RAMPART) {
        this.buildingCostMatrix.set(struct.pos.x, struct.pos.y, 0xff);
        this.buildingsAndPathsCostMatrix.set(struct.pos.x, struct.pos.y, 0xff);
      }
    }
  };

  private updateBuildingCostMatrix = (blueprintResult: BlueprintScanResult) => {
    blueprintResult.blueprint.schema.forEach((row, y) => {
      row.forEach((item, x) => {
        if (item) {
          this.buildingCostMatrix.set(blueprintResult.x + x, blueprintResult.y + y, 0xff);
        }
        this.buildingsAndPathsCostMatrix.set(blueprintResult.x + x, blueprintResult.y + y, 0xff);
      });
    });

    blueprintResult.costs.forEach(cost => {
      cost.path.forEach(pos => {
        this.buildingsAndPathsCostMatrix.set(pos.x, pos.y, 0xff);
      });
    });
  };

  public scan(rootSpawn?: StructureSpawn) {
    if (Object.keys(this.results).length) return this.results;

    this.scanBaseBlueprint(rootSpawn);
    const blueprintsWithoutBase = Blueprints.filter(b => !b.base);

    blueprintsWithoutBase.forEach(blueprint => {
      this.scanRegularBlueprint(blueprint);
    });

    return this.results;
  }
}

export default BlueprintScanner;

// CONTINUAR AQUI!!!
//  - Como salvar resultado do scan de blueprint na memória
//  - Como reconhecer primeiro spawn (colocado na mão) no blueprint
//  - Como permitir que demais estruturas (observer, link) sejam colocadas no blueprint depois e funcionem corretamente
