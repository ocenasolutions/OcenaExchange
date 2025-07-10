import { connectToDatabase } from "./mongodb"
import { ObjectId } from "mongodb"

export interface Order {
  _id?: ObjectId
  userId: string
  symbol: string
  side: "buy" | "sell"
  type: "market" | "limit" | "stop"
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
  orderId: string
  userId: string
  symbol: string
  side: "buy" | "sell"
  amount: number
  price: number
  fee: number
  createdAt: Date
}

export async function createOrder(order: Omit<Order, "_id" | "createdAt" | "updatedAt">): Promise<Order> {
  const { db } = await connectToDatabase()

  const newOrder: Omit<Order, "_id"> = {
    ...order,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await db.collection("orders").insertOne(newOrder)

  return {
    ...newOrder,
    _id: result.insertedId,
  }
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const { db } = await connectToDatabase()
  return (await db.collection("orders").find({ userId }).sort({ createdAt: -1 }).toArray()) as Order[]
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const { db } = await connectToDatabase()
  return (await db.collection("orders").findOne({ _id: new ObjectId(orderId) })) as Order | null
}

export async function updateOrderStatus(
  orderId: string,
  status: Order["status"],
  filledAmount?: number,
): Promise<void> {
  const { db } = await connectToDatabase()

  const updateData: any = {
    status,
    updatedAt: new Date(),
  }

  if (filledAmount !== undefined) {
    updateData.filledAmount = filledAmount
  }

  await db.collection("orders").updateOne({ _id: new ObjectId(orderId) }, { $set: updateData })
}

export async function cancelOrder(orderId: string): Promise<boolean> {
  const { db } = await connectToDatabase()

  const result = await db.collection("orders").updateOne(
    { _id: new ObjectId(orderId), status: "pending" },
    {
      $set: {
        status: "cancelled",
        updatedAt: new Date(),
      },
    },
  )

  return result.modifiedCount > 0
}

export async function getTradesByUser(userId: string): Promise<Trade[]> {
  const { db } = await connectToDatabase()
  return (await db.collection("trades").find({ userId }).sort({ createdAt: -1 }).toArray()) as Trade[]
}

export async function createTrade(trade: Omit<Trade, "_id" | "createdAt">): Promise<Trade> {
  const { db } = await connectToDatabase()

  const newTrade: Omit<Trade, "_id"> = {
    ...trade,
    createdAt: new Date(),
  }

  const result = await db.collection("trades").insertOne(newTrade)

  return {
    ...newTrade,
    _id: result.insertedId,
  }
}

// Mock order matching engine
export async function matchOrder(order: Order): Promise<void> {
  // This is a simplified mock implementation
  // In a real exchange, this would be much more complex

  if (order.type === "market") {
    // Market orders are filled immediately at current market price
    await updateOrderStatus(order._id!.toString(), "filled", order.amount)

    // Create a trade record
    await createTrade({
      orderId: order._id!.toString(),
      userId: order.userId,
      symbol: order.symbol,
      side: order.side,
      amount: order.amount,
      price: order.price || 50000, // Mock price
      fee: order.amount * 0.001, // 0.1% fee
    })
  }
}
