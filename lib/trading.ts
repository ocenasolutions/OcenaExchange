import { connectToDatabase } from "./mongodb"
import { ObjectId } from "mongodb"

export interface Order {
  _id?: ObjectId
  userId: string
  symbol: string
  type: "buy" | "sell"
  orderType: "market" | "limit"
  amount: number
  price?: number
  status: "pending" | "filled" | "cancelled"
  createdAt: Date
  updatedAt: Date
}

export interface Trade {
  _id?: ObjectId
  buyOrderId: string
  sellOrderId: string
  symbol: string
  amount: number
  price: number
  createdAt: Date
}

export async function createOrder(orderData: Omit<Order, "_id" | "createdAt" | "updatedAt">): Promise<Order> {
  const { db } = await connectToDatabase()

  const order: Omit<Order, "_id"> = {
    ...orderData,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await db.collection("orders").insertOne(order)

  return {
    ...order,
    _id: result.insertedId,
  }
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const { db } = await connectToDatabase()

  return (await db.collection("orders").find({ userId }).sort({ createdAt: -1 }).toArray()) as Order[]
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const { db } = await connectToDatabase()

  return (await db.collection("orders").findOne({ _id: new ObjectId(orderId) })) as Order | null
}

export async function updateOrderStatus(orderId: string, status: Order["status"]): Promise<void> {
  const { db } = await connectToDatabase()

  await db.collection("orders").updateOne(
    { _id: new ObjectId(orderId) },
    {
      $set: {
        status,
        updatedAt: new Date(),
      },
    },
  )
}

export async function cancelOrder(orderId: string): Promise<void> {
  await updateOrderStatus(orderId, "cancelled")
}

export async function getOpenOrders(symbol?: string): Promise<Order[]> {
  const { db } = await connectToDatabase()

  const filter: any = { status: "pending" }
  if (symbol) {
    filter.symbol = symbol
  }

  return (await db.collection("orders").find(filter).sort({ createdAt: 1 }).toArray()) as Order[]
}

export async function matchOrders(symbol: string): Promise<Trade[]> {
  const { db } = await connectToDatabase()

  const buyOrders = await db
    .collection("orders")
    .find({
      symbol,
      type: "buy",
      status: "pending",
    })
    .sort({ price: -1, createdAt: 1 })
    .toArray()

  const sellOrders = await db
    .collection("orders")
    .find({
      symbol,
      type: "sell",
      status: "pending",
    })
    .sort({ price: 1, createdAt: 1 })
    .toArray()

  const trades: Trade[] = []

  for (const buyOrder of buyOrders) {
    for (const sellOrder of sellOrders) {
      if (buyOrder.price && sellOrder.price && buyOrder.price >= sellOrder.price) {
        const tradeAmount = Math.min(buyOrder.amount, sellOrder.amount)
        const tradePrice = sellOrder.price

        const trade: Omit<Trade, "_id"> = {
          buyOrderId: buyOrder._id.toString(),
          sellOrderId: sellOrder._id.toString(),
          symbol,
          amount: tradeAmount,
          price: tradePrice,
          createdAt: new Date(),
        }

        const result = await db.collection("trades").insertOne(trade)
        trades.push({ ...trade, _id: result.insertedId })

        // Update order amounts
        buyOrder.amount -= tradeAmount
        sellOrder.amount -= tradeAmount

        // Update orders in database
        await db.collection("orders").updateOne(
          { _id: buyOrder._id },
          {
            $set: {
              amount: buyOrder.amount,
              status: buyOrder.amount === 0 ? "filled" : "pending",
              updatedAt: new Date(),
            },
          },
        )

        await db.collection("orders").updateOne(
          { _id: sellOrder._id },
          {
            $set: {
              amount: sellOrder.amount,
              status: sellOrder.amount === 0 ? "filled" : "pending",
              updatedAt: new Date(),
            },
          },
        )

        if (sellOrder.amount === 0) break
      }
    }
  }

  return trades
}

export async function getTradeHistory(userId?: string, symbol?: string): Promise<Trade[]> {
  const { db } = await connectToDatabase()

  const pipeline: any[] = []

  if (userId || symbol) {
    const matchStage: any = {}
    if (symbol) matchStage.symbol = symbol
    pipeline.push({ $match: matchStage })
  }

  if (userId) {
    pipeline.push({
      $lookup: {
        from: "orders",
        localField: "buyOrderId",
        foreignField: "_id",
        as: "buyOrder",
      },
    })
    pipeline.push({
      $lookup: {
        from: "orders",
        localField: "sellOrderId",
        foreignField: "_id",
        as: "sellOrder",
      },
    })
    pipeline.push({
      $match: {
        $or: [{ "buyOrder.userId": userId }, { "sellOrder.userId": userId }],
      },
    })
  }

  pipeline.push({ $sort: { createdAt: -1 } })

  return (await db.collection("trades").aggregate(pipeline).toArray()) as Trade[]
}
