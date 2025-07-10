import { connectToDatabase } from "./mongodb"
import { ObjectId } from "mongodb"

export interface Order {
  _id?: ObjectId
  userId: string
  symbol: string
  type: "buy" | "sell"
  orderType: "market" | "limit" | "stop"
  amount: number
  price?: number
  stopPrice?: number
  status: "pending" | "filled" | "cancelled" | "partial"
  filledAmount: number
  createdAt: Date
  updatedAt: Date
}

export interface Trade {
  _id?: ObjectId
  buyOrderId: string
  sellOrderId: string
  buyerId: string
  sellerId: string
  symbol: string
  amount: number
  price: number
  createdAt: Date
}

export async function createOrder(orderData: Omit<Order, "_id" | "createdAt" | "updatedAt">): Promise<Order> {
  const { db } = await connectToDatabase()

  const order: Omit<Order, "_id"> = {
    ...orderData,
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

  const orders = await db.collection("orders").find({ userId }).sort({ createdAt: -1 }).limit(100).toArray()

  return orders as Order[]
}

export async function getOrderBook(symbol: string): Promise<{
  bids: Array<{ price: number; amount: number }>
  asks: Array<{ price: number; amount: number }>
}> {
  const { db } = await connectToDatabase()

  const [bids, asks] = await Promise.all([
    db
      .collection("orders")
      .find({
        symbol,
        type: "buy",
        status: "pending",
      })
      .sort({ price: -1 })
      .limit(20)
      .toArray(),
    db
      .collection("orders")
      .find({
        symbol,
        type: "sell",
        status: "pending",
      })
      .sort({ price: 1 })
      .limit(20)
      .toArray(),
  ])

  return {
    bids: bids.map((order: any) => ({
      price: order.price,
      amount: order.amount - order.filledAmount,
    })),
    asks: asks.map((order: any) => ({
      price: order.price,
      amount: order.amount - order.filledAmount,
    })),
  }
}

export async function matchOrders(newOrder: Order): Promise<Trade[]> {
  const { db } = await connectToDatabase()
  const trades: Trade[] = []

  if (newOrder.orderType !== "market" && newOrder.orderType !== "limit") {
    return trades
  }

  const oppositeType = newOrder.type === "buy" ? "sell" : "buy"
  const priceFilter =
    newOrder.type === "buy" ? { price: { $lte: newOrder.price } } : { price: { $gte: newOrder.price } }

  const matchingOrders = await db
    .collection("orders")
    .find({
      symbol: newOrder.symbol,
      type: oppositeType,
      status: "pending",
      ...(newOrder.orderType === "limit" ? priceFilter : {}),
    })
    .sort({
      price: newOrder.type === "buy" ? 1 : -1,
      createdAt: 1,
    })
    .toArray()

  let remainingAmount = newOrder.amount - newOrder.filledAmount

  for (const matchingOrder of matchingOrders) {
    if (remainingAmount <= 0) break

    const tradeAmount = Math.min(remainingAmount, matchingOrder.amount - matchingOrder.filledAmount)
    const tradePrice = matchingOrder.price

    // Create trade record
    const trade: Omit<Trade, "_id"> = {
      buyOrderId: newOrder.type === "buy" ? newOrder._id!.toString() : matchingOrder._id.toString(),
      sellOrderId: newOrder.type === "sell" ? newOrder._id!.toString() : matchingOrder._id.toString(),
      buyerId: newOrder.type === "buy" ? newOrder.userId : matchingOrder.userId,
      sellerId: newOrder.type === "sell" ? newOrder.userId : matchingOrder.userId,
      symbol: newOrder.symbol,
      amount: tradeAmount,
      price: tradePrice,
      createdAt: new Date(),
    }

    const tradeResult = await db.collection("trades").insertOne(trade)
    trades.push({ ...trade, _id: tradeResult.insertedId })

    // Update orders
    await Promise.all([
      db.collection("orders").updateOne(
        { _id: newOrder._id },
        {
          $inc: { filledAmount: tradeAmount },
          $set: {
            status: newOrder.filledAmount + tradeAmount >= newOrder.amount ? "filled" : "partial",
            updatedAt: new Date(),
          },
        },
      ),
      db.collection("orders").updateOne(
        { _id: matchingOrder._id },
        {
          $inc: { filledAmount: tradeAmount },
          $set: {
            status: matchingOrder.filledAmount + tradeAmount >= matchingOrder.amount ? "filled" : "partial",
            updatedAt: new Date(),
          },
        },
      ),
    ])

    remainingAmount -= tradeAmount
  }

  return trades
}

export async function cancelOrder(orderId: string, userId: string): Promise<boolean> {
  const { db } = await connectToDatabase()

  const result = await db.collection("orders").updateOne(
    {
      _id: new ObjectId(orderId),
      userId,
      status: { $in: ["pending", "partial"] },
    },
    {
      $set: {
        status: "cancelled",
        updatedAt: new Date(),
      },
    },
  )

  return result.modifiedCount > 0
}

export async function getTradeHistory(userId: string): Promise<Trade[]> {
  const { db } = await connectToDatabase()

  const trades = await db
    .collection("trades")
    .find({
      $or: [{ buyerId: userId }, { sellerId: userId }],
    })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray()

  return trades as Trade[]
}

export async function getMarketTrades(symbol: string): Promise<Trade[]> {
  const { db } = await connectToDatabase()

  const trades = await db.collection("trades").find({ symbol }).sort({ createdAt: -1 }).limit(50).toArray()

  return trades as Trade[]
}
