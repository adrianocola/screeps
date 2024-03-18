import { MARKET_MAX_RESOURCE_SELL, MARKET_RAW_RESOURCE_SELL_POINT, MIN_TERMINAL_ENERGY } from 'consts';

const calcMaxAmount = (energy: number, roomName1: string, roomName2: string) => {
  const distance = Game.map.getRoomLinearDistance(roomName1, roomName2, true);
  return Math.floor(energy / (1 - Math.exp(-distance / 30)));
};

const HISTORY_DAYS = 3;

const updateMarketStats = (
  stats: Partial<Record<ResourceConstant, RoomMemoryMarketStats>>,
  resource: ResourceConstant,
  price: number,
  amount: number,
) => {
  if (!stats[resource]) {
    stats[resource] = { count: 0, credits: 0, amount: 0 };
  }

  stats[resource]!.count += 1;
  stats[resource]!.credits += price;
  stats[resource]!.amount += amount;
};

const systemMarket: RoomSystem = {
  interval: TICKS.TICK_1000,
  name: ROOM_SYSTEMS.MARKET,
  requiredFeatures: {
    [ROOM_FEATURE.BASIC]: false,
    [ROOM_FEATURE.EXPANDING_FROM]: false,
    [ROOM_FEATURE.CONTROLLED]: true,
    [ROOM_FEATURE.TERMINAL]: true,
  },
  run(room: Room) {
    if (!room.terminal || room.terminal.cooldown || !room.memory.scan?.mineral) return;

    const roomMineralType: ResourceConstant = room.memory.scan?.mineral.type;
    if (room.terminal.store.getUsedCapacity(roomMineralType) < MARKET_RAW_RESOURCE_SELL_POINT) return;

    const energy = room.terminal.store.getUsedCapacity(RESOURCE_ENERGY);
    if (energy < MIN_TERMINAL_ENERGY) return;

    const marketHistory = Game.market.getHistory(roomMineralType);
    const lastDaysMarketHistory = marketHistory.slice(marketHistory.length - HISTORY_DAYS);
    const avgPrice = lastDaysMarketHistory.reduce((acc, curr) => acc + curr.avgPrice, 0) / HISTORY_DAYS;
    const minPrice = avgPrice * 0.9;

    const buyOrders = Game.market.getAllOrders({ type: ORDER_BUY, resourceType: roomMineralType });
    let bestDeal: { order: Order; amount: number; total: number } | undefined;
    buyOrders.forEach(order => {
      if (!order.roomName || order.price < minPrice) return;
      const maxAmount = calcMaxAmount(energy, room.name, order.roomName);
      const amount = Math.min(MARKET_MAX_RESOURCE_SELL, maxAmount, order.amount);
      const total = amount * order.price;
      if (!bestDeal || total > bestDeal.total) {
        bestDeal = { order, amount, total };
      }
    });

    if (bestDeal) {
      if (!room.memory.market) room.memory.market = { balance: 0, sell: {}, buy: {} };
      if (Game.market.deal(bestDeal.order.id, bestDeal.amount, room.name) === OK) {
        room.memory.market.balance += bestDeal.total;
        updateMarketStats(room.memory.market.sell, roomMineralType, bestDeal.total, bestDeal.amount);
      }
    }
  },
};

export default systemMarket;
