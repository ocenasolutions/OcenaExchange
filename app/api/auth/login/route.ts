export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, twoFactorCode } = await request.json()

    console.log("Login attempt for:", email)

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Authenticate user
    const result = await authenticateUser(email, password, twoFactorCode)

    if (!result.success) {
      console.log("Authentication failed:", result.error)
      return NextResponse.json({ error: result.error }, { status: 401 })
    }

    console.log("Authentication successful for:", email)

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user!._id,
        name: result.user!.name,
        email: result.user!.email,
        role: result.user!.role || "user",
        isEmailVerified: result.user!.isEmailVerified,
        kycStatus: result.user!.kycStatus || "pending",
      },
    })

    response.cookies.set("auth-token", result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
