import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    console.log("=== LOGIN API START ===")

    const body = await request.json()
    console.log("Login request body:", { email: body.email, hasPassword: !!body.password })

    const { email, password, twoFactorCode } = body

    if (!email || !password) {
      console.log("Missing email or password")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log("Attempting authentication...")
    const result = await authenticateUser(email, password, twoFactorCode)
    console.log("Authentication result:", { success: result.success, error: result.error })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 })
    }

    console.log("Login successful, creating response...")

    // Create response with user data
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: result.user!._id,
        name: result.user!.name,
        email: result.user!.email,
        role: result.user!.role,
        isEmailVerified: result.user!.isEmailVerified,
        twoFactorEnabled: result.user!.twoFactorEnabled,
        kycStatus: result.user!.kycStatus,
      },
    })

    // Set HTTP-only cookie with the token
    response.cookies.set("auth-token", result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    console.log("Login successful, token set in cookie")
    console.log("=== LOGIN API SUCCESS ===")

    return response
  } catch (error) {
    console.error("=== LOGIN API ERROR ===")
    console.error("Login error:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
