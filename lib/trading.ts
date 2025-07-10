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
  buyerId: string
  sellerId: string
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

  return (await db.collection("orders").find({ userId }).sort({ createdAt: -1 }).limit(50).toArray()) as Order[]
}

export async function getOrderBook(symbol: string): Promise<{
  bids: Array<{ price: number; amount: number }>
  asks: Array<{ price: number; amount: number }>
}> {
  const { db } = await connectToDatabase()

  const [buyOrders, sellOrders] = await Promise.all([
    db
      .collection("orders")
      .find({
        symbol,
        type: "buy",
        status: "pending",
      })
      .sort({ price: -1 })
      .limit(20)
      .toArray() as Promise<Order[]>,
    db
      .collection("orders")
      .find({
        symbol,
        type: "sell",
        status: "pending",
      })
      .sort({ price: 1 })
      .limit(20)
      .toArray() as Promise<Order[]>,
  ])

  const bids = buyOrders.map((order) => ({
    price: order.price || 0,
    amount: order.amount,
  }))

  const asks = sellOrders.map((order) => ({
    price: order.price || 0,
    amount: order.amount,
  }))

  return { bids, asks }
}

export async function matchOrders(symbol: string): Promise<Trade[]> {
  const { db } = await connectToDatabase()

  // Get pending buy and sell orders
  const [buyOrders, sellOrders] = await Promise.all([
    db
      .collection("orders")
      .find({
        symbol,
        type: "buy",
        status: "pending",
      })
      .sort({ price: -1, createdAt: 1 })
      .toArray() as Promise<Order[]>,
    db
      .collection("orders")
      .find({
        symbol,
        type: "sell",
        status: "pending",
      })
      .sort({ price: 1, createdAt: 1 })
      .toArray() as Promise<Order[]>,
  ])

  const trades: Trade[] = []

  for (const buyOrder of buyOrders) {
    for (const sellOrder of sellOrders) {
      if (!buyOrder.price || !sellOrder.price) continue
      if (buyOrder.price < sellOrder.price) break

      const tradeAmount = Math.min(buyOrder.amount, sellOrder.amount)
      const tradePrice = sellOrder.price // Price taker gets

      // Create trade record
      const trade: Omit<Trade, "_id"> = {
        buyOrderId: buyOrder._id!.toString(),
        sellOrderId: sellOrder._id!.toString(),
        symbol,
        amount: tradeAmount,
        price: tradePrice,
        buyerId: buyOrder.userId,
        sellerId: sellOrder.userId,
        createdAt: new Date(),
      }

      const result = await db.collection("trades").insertOne(trade)
      trades.push({ ...trade, _id: result.insertedId })

      // Update order amounts
      buyOrder.amount -= tradeAmount
      sellOrder.amount -= tradeAmount

      // Update orders in database
      await Promise.all([
        db.collection("orders").updateOne(
          { _id: buyOrder._id },
          {
            $set: {
              amount: buyOrder.amount,
              status: buyOrder.amount === 0 ? "filled" : "pending",
              updatedAt: new Date(),
            },
          },
        ),
        db.collection("orders").updateOne(
          { _id: sellOrder._id },
          {
            $set: {
              amount: sellOrder.amount,
              status: sellOrder.amount === 0 ? "filled" : "pending",
              updatedAt: new Date(),
            },
          },
        ),
      ])

      if (sellOrder.amount === 0) break
    }
  }

  return trades
}

export async function getUserTrades(userId: string): Promise<Trade[]> {
  const { db } = await connectToDatabase()

  return (await db
    .collection("trades")
    .find({
      $or: [{ buyerId: userId }, { sellerId: userId }],
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray()) as Trade[]
}

export async function cancelOrder(orderId: string, userId: string): Promise<boolean> {
  const { db } = await connectToDatabase()

  const result = await db.collection("orders").updateOne(
    {
      _id: new ObjectId(orderId),
      userId,
      status: "pending",
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
