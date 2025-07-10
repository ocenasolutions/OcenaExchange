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

  const orders = await db.collection("orders").find({ userId }).sort({ createdAt: -1 }).toArray()

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
      status: "pending",
      orderType: "limit",
    })
    .sort({ price: -1 })
    .toArray()

  const sellOrders = await db
    .collection("orders")
    .find({
      symbol,
      type: "sell",
      status: "pending",
      orderType: "limit",
    })
    .sort({ price: 1 })
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

export async function matchOrders(symbol: string): Promise<Trade[]> {
  const { db } = await connectToDatabase()
  const trades: Trade[] = []

  // Get pending buy and sell orders
  const buyOrders = await db
    .collection("orders")
    .find({
      symbol,
      type: "buy",
      status: "pending",
      orderType: "limit",
    })
    .sort({ price: -1, createdAt: 1 })
    .toArray()

  const sellOrders = await db
    .collection("orders")
    .find({
      symbol,
      type: "sell",
      status: "pending",
      orderType: "limit",
    })
    .sort({ price: 1, createdAt: 1 })
    .toArray()

  // Simple matching logic
  for (const buyOrder of buyOrders) {
    for (const sellOrder of sellOrders) {
      if (buyOrder.price >= sellOrder.price) {
        const tradeAmount = Math.min(buyOrder.amount - buyOrder.filledAmount, sellOrder.amount - sellOrder.filledAmount)

        if (tradeAmount > 0) {
          // Create trade
          const trade: Omit<Trade, "_id"> = {
            buyOrderId: buyOrder._id.toString(),
            sellOrderId: sellOrder._id.toString(),
            buyerId: buyOrder.userId,
            sellerId: sellOrder.userId,
            symbol,
            amount: tradeAmount,
            price: sellOrder.price,
            createdAt: new Date(),
          }

          const tradeResult = await db.collection("trades").insertOne(trade)
          trades.push({ ...trade, _id: tradeResult.insertedId })

          // Update orders
          await db.collection("orders").updateOne(
            { _id: buyOrder._id },
            {
              $inc: { filledAmount: tradeAmount },
              $set: {
                status: buyOrder.filledAmount + tradeAmount >= buyOrder.amount ? "filled" : "partial",
                updatedAt: new Date(),
              },
            },
          )

          await db.collection("orders").updateOne(
            { _id: sellOrder._id },
            {
              $inc: { filledAmount: tradeAmount },
              $set: {
                status: sellOrder.filledAmount + tradeAmount >= sellOrder.amount ? "filled" : "partial",
                updatedAt: new Date(),
              },
            },
          )

          buyOrder.filledAmount += tradeAmount
          sellOrder.filledAmount += tradeAmount
        }
      }
    }
  }

  return trades
}

export async function cancelOrder(orderId: string, userId: string): Promise<boolean> {
  const { db } = await connectToDatabase()

  const result = await db.collection("orders").updateOne(
    { _id: new ObjectId(orderId), userId, status: "pending" },
    {
      $set: {
        status: "cancelled",
        updatedAt: new Date(),
      },
    },
  )

  return result.modifiedCount > 0
}

export async function getTradeHistory(symbol?: string, userId?: string): Promise<Trade[]> {
  const { db } = await connectToDatabase()

  const filter: any = {}
  if (symbol) filter.symbol = symbol
  if (userId) filter.$or = [{ buyerId: userId }, { sellerId: userId }]

  const trades = await db.collection("trades").find(filter).sort({ createdAt: -1 }).limit(100).toArray()

  return trades as Trade[]
}
