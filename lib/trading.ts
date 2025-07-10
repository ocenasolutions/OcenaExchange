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

  const createdOrder = {
    ...order,
    _id: result.insertedId,
  }

  // Try to match the order
  await matchOrders(createdOrder)

  return createdOrder
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

  const buyOrders = await db
    .collection("orders")
    .find({
      symbol,
      type: "buy",
      status: { $in: ["pending", "partial"] },
      orderType: "limit",
    })
    .sort({ price: -1 })
    .limit(20)
    .toArray()

  const sellOrders = await db
    .collection("orders")
    .find({
      symbol,
      type: "sell",
      status: { $in: ["pending", "partial"] },
      orderType: "limit",
    })
    .sort({ price: 1 })
    .limit(20)
    .toArray()

  const bids = buyOrders.map((order: any) => ({
    price: order.price,
    amount: order.amount - order.filledAmount,
  }))

  const asks = sellOrders.map((order: any) => ({
    price: order.price,
    amount: order.amount - order.filledAmount,
  }))

  return { bids, asks }
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

export async function getTradeHistory(symbol?: string, limit = 50): Promise<Trade[]> {
  const { db } = await connectToDatabase()

  const filter = symbol ? { symbol } : {}

  const trades = await db.collection("trades").find(filter).sort({ createdAt: -1 }).limit(limit).toArray()

  return trades as Trade[]
}

export async function getUserTrades(userId: string, limit = 50): Promise<Trade[]> {
  const { db } = await connectToDatabase()

  const trades = await db
    .collection("trades")
    .find({
      $or: [{ buyerId: userId }, { sellerId: userId }],
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()

  return trades as Trade[]
}

async function matchOrders(newOrder: Order): Promise<void> {
  const { db } = await connectToDatabase()

  if (newOrder.orderType === "market") {
    await executeMarketOrder(newOrder)
  } else if (newOrder.orderType === "limit") {
    await executeLimitOrder(newOrder)
  }
}

async function executeMarketOrder(order: Order): Promise<void> {
  const { db } = await connectToDatabase()

  const oppositeType = order.type === "buy" ? "sell" : "buy"
  const sortOrder = order.type === "buy" ? 1 : -1

  const matchingOrders = await db
    .collection("orders")
    .find({
      symbol: order.symbol,
      type: oppositeType,
      status: { $in: ["pending", "partial"] },
      orderType: "limit",
    })
    .sort({ price: sortOrder })
    .toArray()

  let remainingAmount = order.amount - order.filledAmount

  for (const matchingOrder of matchingOrders) {
    if (remainingAmount <= 0) break

    const tradeAmount = Math.min(remainingAmount, matchingOrder.amount - matchingOrder.filledAmount)
    const tradePrice = matchingOrder.price

    // Create trade record
    await db.collection("trades").insertOne({
      buyOrderId: order.type === "buy" ? order._id!.toString() : matchingOrder._id.toString(),
      sellOrderId: order.type === "sell" ? order._id!.toString() : matchingOrder._id.toString(),
      buyerId: order.type === "buy" ? order.userId : matchingOrder.userId,
      sellerId: order.type === "sell" ? order.userId : matchingOrder.userId,
      symbol: order.symbol,
      amount: tradeAmount,
      price: tradePrice,
      createdAt: new Date(),
    })

    // Update orders
    await updateOrderFill(order._id!.toString(), order.filledAmount + tradeAmount)
    await updateOrderFill(matchingOrder._id.toString(), matchingOrder.filledAmount + tradeAmount)

    remainingAmount -= tradeAmount
  }
}

async function executeLimitOrder(order: Order): Promise<void> {
  const { db } = await connectToDatabase()

  const oppositeType = order.type === "buy" ? "sell" : "buy"

  const matchingOrders = await db
    .collection("orders")
    .find({
      symbol: order.symbol,
      type: oppositeType,
      status: { $in: ["pending", "partial"] },
      orderType: "limit",
      price: order.type === "buy" ? { $lte: order.price } : { $gte: order.price },
    })
    .sort({ price: order.type === "buy" ? 1 : -1, createdAt: 1 })
    .toArray()

  let remainingAmount = order.amount - order.filledAmount

  for (const matchingOrder of matchingOrders) {
    if (remainingAmount <= 0) break

    const tradeAmount = Math.min(remainingAmount, matchingOrder.amount - matchingOrder.filledAmount)
    const tradePrice = matchingOrder.price

    // Create trade record
    await db.collection("trades").insertOne({
      buyOrderId: order.type === "buy" ? order._id!.toString() : matchingOrder._id.toString(),
      sellOrderId: order.type === "sell" ? order._id!.toString() : matchingOrder._id.toString(),
      buyerId: order.type === "buy" ? order.userId : matchingOrder.userId,
      sellerId: order.type === "sell" ? order.userId : matchingOrder.userId,
      symbol: order.symbol,
      amount: tradeAmount,
      price: tradePrice,
      createdAt: new Date(),
    })

    // Update orders
    await updateOrderFill(order._id!.toString(), order.filledAmount + tradeAmount)
    await updateOrderFill(matchingOrder._id.toString(), matchingOrder.filledAmount + tradeAmount)

    remainingAmount -= tradeAmount
  }
}

async function updateOrderFill(orderId: string, filledAmount: number): Promise<void> {
  const { db } = await connectToDatabase()

  const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) })
  if (!order) return

  const status = filledAmount >= order.amount ? "filled" : filledAmount > 0 ? "partial" : "pending"

  await db.collection("orders").updateOne(
    { _id: new ObjectId(orderId) },
    {
      $set: {
        filledAmount,
        status,
        updatedAt: new Date(),
      },
    },
  )
}
