import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    const orders = await db.collection("orders").find({ userId: decoded.userId }).sort({ createdAt: -1 }).toArray()

    const formattedOrders = orders.map((order) => ({
      id: order._id.toString(),
      symbol: order.symbol,
      type: order.type,
      amount: order.amount,
      price: order.price || 0, // Ensure price is a number, fallback to 0
      total: order.total,
      status: order.status,
      timestamp: order.createdAt.toISOString(),
    }))

    return NextResponse.json({ orders: formattedOrders })
  } catch (error) {
    console.error("Get orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { symbol, type, orderType, amount, price, total } = await request.json()

    if (!symbol || !type || !amount || !total) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let finalPrice: number

    if (orderType === "market") {
      finalPrice = Number.parseFloat(total) / Number.parseFloat(amount)
    } else if (orderType === "limit") {
      if (price === undefined || price === null) {
        return NextResponse.json({ error: "Price is required for limit orders" }, { status: 400 })
      }
      finalPrice = Number.parseFloat(price)
    } else {
      return NextResponse.json({ error: "Invalid order type" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Create order
    const order = {
      userId: decoded.userId,
      symbol,
      type,
      orderType,
      amount: Number.parseFloat(amount),
      price: finalPrice, // This will always be a number
      total: Number.parseFloat(total),
      status: orderType === "market" ? "filled" : "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const orderResult = await db.collection("orders").insertOne(order)

    // If market order, create immediate trade
    if (orderType === "market") {
      const trade = {
        userId: decoded.userId,
        orderId: orderResult.insertedId.toString(),
        symbol,
        type,
        amount: Number.parseFloat(amount),
        price: finalPrice, // Use finalPrice for trade
        total: Number.parseFloat(total),
        fee: Number.parseFloat(total) * 0.001, // 0.1% fee
        createdAt: new Date(),
      }

      await db.collection("trades").insertOne(trade)

      // Update user balance (mock implementation)
      const balanceUpdate =
        type === "buy"
          ? { [symbol.replace("USDT", "")]: Number.parseFloat(amount), USDT: -Number.parseFloat(total) }
          : { [symbol.replace("USDT", "")]: -Number.parseFloat(amount), USDT: Number.parseFloat(total) }

      await db.collection("balances").updateOne(
        { userId: decoded.userId },
        {
          $inc: balanceUpdate,
          $set: { updatedAt: new Date() },
        },
        { upsert: true },
      )
    }

    return NextResponse.json({
      success: true,
      orderId: orderResult.insertedId.toString(),
      status: order.status,
    })
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
