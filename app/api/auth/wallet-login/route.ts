import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { address, signature, message } = await request.json()

    if (!address || !signature || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("Wallet login attempt for address:", address)

    const { db } = await connectToDatabase()

    // Find or create user with wallet address
    let user = await db.collection("users").findOne({ walletAddress: address.toLowerCase() })

    if (!user) {
      // Create new user with wallet address
      const newUser = {
        name: `User ${address.slice(0, 6)}`,
        email: `${address.toLowerCase()}@wallet.local`,
        walletAddress: address.toLowerCase(),
        isVerified: true,
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await db.collection("users").insertOne(newUser)
      user = { ...newUser, _id: result.insertedId }
      console.log("Created new wallet user:", user._id)
    } else {
      console.log("Found existing wallet user:", user._id)
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        walletAddress: address.toLowerCase(),
        role: user.role || "user",
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" },
    )

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        walletAddress: user.walletAddress,
        role: user.role || "user",
      },
    })

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Wallet login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
