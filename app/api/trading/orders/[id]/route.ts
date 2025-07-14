import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { verifyToken } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(id), userId: decoded.userId, status: "pending" },
      {
        $set: {
          status: "cancelled",
          updatedAt: new Date(),
        },
      },
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Order not found or not pending" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Order cancelled successfully" })
  } catch (error) {
    console.error("Cancel order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
