import { type NextRequest, NextResponse } from "next/server"
import { generateOTP, saveOTP } from "@/lib/otp"
import { sendOTPEmail } from "@/lib/email"
import { connectToDatabase } from "@/lib/mongodb"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    console.log("=== SEND OTP API START ===")

    const body = await request.json()
    console.log("Request body:", body)

    const { email } = body

    if (!email) {
      console.log("Email is missing from request")
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log("Processing OTP request for email:", email)

    // Check if user already exists
    const { db } = await connectToDatabase()
    console.log("Connected to database")

    const existingUser = await db.collection("users").findOne({ email })
    console.log("Existing user check:", existingUser ? "Found" : "Not found")

    if (existingUser) {
      console.log("User already exists, returning error")
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Generate and save OTP
    console.log("Generating OTP...")
    const otp = generateOTP()
    console.log("OTP generated:", otp)

    console.log("Saving OTP to database...")
    await saveOTP(email, otp)
    console.log("OTP saved successfully")

    // Send OTP email
    console.log("Sending OTP email...")
    await sendOTPEmail(email, otp)
    console.log("OTP email sent successfully")

    console.log("=== SEND OTP API SUCCESS ===")
    return NextResponse.json({ message: "OTP sent successfully" })
  } catch (error) {
    console.error("=== SEND OTP API ERROR ===")
    console.error("Send OTP error:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 })
  }
}
