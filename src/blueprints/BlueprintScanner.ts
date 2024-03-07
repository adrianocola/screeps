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
import { BASE_DIRECTIONS, ROOM_SIZE } from 'consts';

const PATH_ROAD_COST = 1;
const PATH_PLAIN_COST = 3;
const PATH_SWAMP_COST = 5;
const PATH_WALL_COST = 20;

class BlueprintScanner {
  private roomName: string;
  private room: Room;
  private buildingCostMatrix: CostMatrix;
  private buildingsAndPathsCostMatrix: CostMatrix;
  private pathFindingCostMatrix: CostMatrix;
  private terrain: RoomTerrain;
  private results: Record<string, BlueprintScanResult>;

  public constructor(roomName: string) {
    this.roomName = roomName;
    this.room = Game.rooms[roomName];
    this.buildingCostMatrix = new PathFinder.CostMatrix();
    this.buildingsAndPathsCostMatrix = new PathFinder.CostMatrix();
    this.pathFindingCostMatrix = BlueprintScanner.getWalkablePathCostMatrix(this.room);
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

  public static getWalkablePathCostMatrix = (room: Room) => {
    const costMatrix = new PathFinder.CostMatrix();

    const terrain = room.getTerrain();
    for (let y = 1; y < ROOM_SIZE - 1; y += 1) {
      for (let x = 1; x < ROOM_SIZE - 1; x += 1) {
        const tile = terrain.get(x, y);
        if (tile === TERRAIN_MASK_SWAMP) {
          costMatrix.set(x, y, PATH_SWAMP_COST);
        } else if (tile === TERRAIN_MASK_WALL) {
          costMatrix.set(x, y, PATH_WALL_COST);
        } else {
          costMatrix.set(x, y, PATH_PLAIN_COST);
        }
      }
    }

    const sources = room.find(FIND_SOURCES);
    const minerals = room.find(FIND_MINERALS);
    const structured = room.find(FIND_STRUCTURES);

    for (const source of sources) {
      costMatrix.set(source.pos.x, source.pos.y, 0xff);
    }
    for (const mineral of minerals) {
      costMatrix.set(mineral.pos.x, mineral.pos.y, 0xff);
    }
    for (const structure of structured) {
      if (structure.structureType === STRUCTURE_ROAD) {
        if (!costMatrix.get(structure.pos.x, structure.pos.y)) {
          costMatrix.set(structure.pos.x, structure.pos.y, PATH_ROAD_COST);
        }
      } else {
        costMatrix.set(structure.pos.x, structure.pos.y, 0xff);
      }
    }

    return costMatrix;
  };

  public static blueprintToDirection(blueprint: Blueprint, direction: BaseDirectionConstant) {
    if (!blueprint.dir || blueprint.dir === direction) return blueprint;

    if (checkIsOppositeBaseDirection(blueprint.dir, direction)) return BlueprintScanner.oppositeBlueprint(blueprint);

    return BlueprintScanner.rotateBlueprint(blueprint, getDirectionRotation(blueprint.dir, direction));
  }

  public static getBlueprintCosts(
    room: Room,
    pos: Pos,
    blueprint: Blueprint,
    costMatrix: CostMatrix,
    onlyPaved = false,
    getBlueprintResultEntrance: (room: Room, blueprintId: BLUEPRINT_ID) => RoomPosition | undefined,
  ) {
    if (!blueprint.closeTo) return [];

    const costs: BlueprintCost[] = [];

    const entrancePos = new RoomPosition(
      pos.x + (blueprint.entrance?.x ?? 0),
      pos.y + (blueprint.entrance?.y ?? 0),
      room.name,
    );

    const roomCallback = () => costMatrix;

    // swamps are not so bad, cuz we can build roads on top of them
    const searchOptions = { roomCallback, maxRooms: 1 };

    for (const closeTo of blueprint.closeTo) {
      if (onlyPaved && !closeTo.paved) continue;
      if (closeTo.what === STRUCTURE_CONTROLLER && room.controller) {
        const result = PathFinder.search(
          entrancePos,
          { pos: room.controller.pos, range: closeTo.range ?? 1 },
          searchOptions,
        );
        if (result.incomplete) return [];
        costs.push({ value: result.cost, weight: closeTo.weight ?? 1, path: result.path });
      } else if (closeTo.what === FIND_SOURCES || closeTo.what === FIND_MINERALS) {
        let findings = room.find(closeTo.what);
        if (closeTo.index !== undefined) {
          findings = [findings[closeTo.index]];
        }
        for (const item of findings) {
          const result = PathFinder.search(entrancePos, { pos: item.pos, range: closeTo.range ?? 1 }, searchOptions);
          if (result.incomplete) return [];
          costs.push({ value: result.cost, weight: closeTo.weight ?? 1, path: result.path });
        }
      } else if (typeof closeTo.what === 'string') {
        const otherEntrance = getBlueprintResultEntrance(room, closeTo.what as BLUEPRINT_ID);
        if (otherEntrance) {
          const result = PathFinder.search(
            entrancePos,
            { pos: otherEntrance, range: closeTo.range ?? 1 },
            searchOptions,
          );
          if (result.incomplete) return [];
          costs.push({ value: result.cost, weight: closeTo.weight ?? 1, path: result.path });
        }
      } else {
        let findings = room.find(closeTo.what);
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

  private calcBlueprintCosts = (pos: Pos, blueprint: Blueprint) => {
    if (!blueprint.closeTo) return [];

    const pathsCostMatrix = this.pathFindingCostMatrix.clone();

    blueprint.schema.forEach((row, y) => {
      row.forEach((item, x) => {
        if (item) {
          pathsCostMatrix.set(pos.x + x, pos.y + y, 0xff);
        }
      });
    });

    return BlueprintScanner.getBlueprintCosts(
      this.room,
      pos,
      blueprint,
      pathsCostMatrix,
      false,
      this.getResultEntrance,
    );
  };

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

  private getResultEntrance = (room: Room, blueprintId: BLUEPRINT_ID) => {
    const result = this.results[blueprintId];
    if (result) {
      return new RoomPosition(
        result.x + (result.blueprint.entrance?.x ?? 0),
        result.y + (result.blueprint.entrance?.y ?? 0),
        room.name,
      );
    }

    return undefined;
  };

  private getPossibleBlueprintPositions(pos: Pos, blueprint: Blueprint) {
    const minRange = blueprint.minRange ?? 2;
    const maxRange = blueprint.maxRange ?? 50;
    const maxCount = blueprint.maxCount ?? 200;
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
          const costs = this.calcBlueprintCosts(testPos, dirBlueprint);
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

  private getStartPos(startFrom: StartFrom | Pos | STRUCTURE_CONTROLLER | BLUEPRINT_ID | 'discover') {
    if (startFrom === 'discover') {
      let count = 0;
      const pos: Pos = { x: 0, y: 0 };

      if (this.room.controller) {
        pos.x += this.room.controller.pos.x;
        pos.y += this.room.controller.pos.y;
        count += 1;
      }
      const sources = this.room.find(FIND_SOURCES);
      for (const source of sources) {
        pos.x += source.pos.x;
        pos.y += source.pos.y;
        count += 1;
      }
      const minerals = this.room.find(FIND_MINERALS);
      for (const mineral of minerals) {
        pos.x += mineral.pos.x;
        pos.y += mineral.pos.y;
        count += 1;
      }

      return { x: Math.floor(pos.x / count), y: Math.floor(pos.y / count) };
    } else if (startFrom === STRUCTURE_CONTROLLER) {
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

  private scanBaseBlueprint(baseSpawn?: StructureSpawn) {
    const baseBlueprint = BlueprintsMap[BLUEPRINT_ID.BASE];
    if (!baseBlueprint) throw new Error('No base blueprint found');

    if (baseSpawn) {
      let bestResult: { totalCost: number; blueprint?: Blueprint; costs?: BlueprintCost[]; pos?: Pos } = {
        totalCost: Number.MAX_SAFE_INTEGER,
      };
      for (const dir of BASE_DIRECTIONS) {
        const blueprintToDir = BlueprintScanner.blueprintToDirection(baseBlueprint, dir);
        const spawn1Pos = this.getRelativeStructurePos(blueprintToDir, BLUEPRINT_STRUCTURE.SPAWN1);
        if (!spawn1Pos) throw new Error('No spawn1 position found');

        const initialPos = { x: baseSpawn.pos.x - spawn1Pos.x, y: baseSpawn.pos.y - spawn1Pos.y };
        const itFits = this.checkIfBlueprintFit(initialPos, blueprintToDir, this.buildingCostMatrix);
        if (!itFits) {
          continue;
        }

        const costs = this.calcBlueprintCosts(initialPos, blueprintToDir);
        const totalCosts = this.getBlueprintTotalCosts(costs);
        if (totalCosts < bestResult.totalCost) {
          bestResult = { totalCost: totalCosts, blueprint: blueprintToDir, costs, pos: initialPos };
        }
      }

      if (!bestResult.blueprint || !bestResult.pos || !bestResult.costs)
        throw new Error('Blueprint not found for base spawn');

      return this.scanBlueprint(bestResult.blueprint, {
        ...bestResult.pos,
        totalCost: bestResult.totalCost,
        dir: bestResult.blueprint.dir ?? RIGHT,
        blueprint: bestResult.blueprint,
        costs: bestResult.costs,
      });
    }

    const basePosition = this.scanBlueprint(baseBlueprint);

    // TODO tratar caso de não achar posição válida (salvar essa informação na memory da room)
    if (!basePosition) throw new Error('No base result found');

    return basePosition;
  }

  public scanBlueprint = (blueprint: Blueprint, forceBestPosition?: BlueprintScanResult) => {
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
        this.pathFindingCostMatrix.set(struct.pos.x, struct.pos.y, 0xff);
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
        this.pathFindingCostMatrix.set(blueprintResult.x + x, blueprintResult.y + y, 0xff);
      });
    });

    blueprintResult.costs.forEach(cost => {
      cost.path.forEach(pos => {
        this.buildingsAndPathsCostMatrix.set(pos.x, pos.y, 0xff);
        this.pathFindingCostMatrix.set(pos.x, pos.y, 1);
      });
    });
  };

  public scan(baseSpawn?: StructureSpawn) {
    if (Object.keys(this.results).length) return this.results;

    this.scanBaseBlueprint(baseSpawn);
    const blueprintsWithoutBase = Blueprints.filter(b => !b.base);

    blueprintsWithoutBase.forEach(blueprint => {
      this.scanBlueprint(blueprint);
    });

    return this.results;
  }
}

export default BlueprintScanner;
