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

    const trades = await db.collection("trades").find({ userId: decoded.userId }).sort({ createdAt: -1 }).toArray()

    const formattedTrades = trades.map((trade) => ({
      id: trade._id.toString(),
      symbol: trade.symbol,
      type: trade.type,
      amount: trade.amount,
      price: trade.price,
      total: trade.total,
      fee: trade.fee,
      timestamp: trade.createdAt.toISOString(),
    }))

    return NextResponse.json({ trades: formattedTrades })
  } catch (error) {
    console.error("Get trades error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
