import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      console.log("No token found in cookies")
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify JWT token
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")
      console.log("Decoded token:", decoded)
    } catch (jwtError) {
      console.log("JWT verification failed:", jwtError)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (!decoded.userId) {
      console.log("No userId in token")
      return NextResponse.json({ error: "Invalid token format" }, { status: 401 })
    }

    console.log("Looking up user with ID:", decoded.userId)

    const { db } = await connectToDatabase()

    // Convert string ID to ObjectId for MongoDB query
    let userId: ObjectId
    try {
      userId = new ObjectId(decoded.userId)
    } catch (error) {
      console.log("Invalid ObjectId format:", decoded.userId)
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
    }

    const user = await db.collection("users").findOne({ _id: userId })

    if (!user) {
      console.log("User not found for ID:", decoded.userId)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("Found user:", user._id)

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        walletAddress: user.walletAddress,
        role: user.role || "user",
        isVerified: user.isVerified || false,
      },
    })
  } catch (error) {
    console.error("Auth me error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
