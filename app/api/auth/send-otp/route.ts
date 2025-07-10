import { type NextRequest, NextResponse } from "next/server"
import { generateOTP, saveOTP } from "@/lib/otp"
import { sendOTPEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    console.log("=== SEND OTP API START ===")

    const body = await request.json()
    console.log("Send OTP request body:", body)

    const { email } = body

    if (!email) {
      console.log("Email is required")
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("Invalid email format")
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    console.log("Generating OTP for email:", email)

    // Generate and save OTP
    const otp = await generateOTP()
    console.log("Generated OTP:", otp)

    await saveOTP(email, otp)
    console.log("OTP saved to database")

    // Send OTP email
    await sendOTPEmail(email, otp)
    console.log("OTP email sent successfully")

    console.log("=== SEND OTP API SUCCESS ===")

    return NextResponse.json({
      message: "OTP sent successfully",
      email,
    })
  } catch (error) {
    console.error("=== SEND OTP API ERROR ===")
    console.error("Send OTP error:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        error: "Failed to send OTP",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
