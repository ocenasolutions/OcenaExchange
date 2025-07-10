import { connectToDatabase } from "./mongodb"

export interface OTPRecord {
  email: string
  otp: string
  expiresAt: Date
  createdAt: Date
}

export async function generateOTP(): Promise<string> {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function saveOTP(email: string, otp: string): Promise<void> {
  try {
    const { db } = await connectToDatabase()

    // Delete any existing OTP for this email
    await db.collection("otps").deleteMany({ email })

    // Save new OTP with 10 minute expiration
    const otpRecord: OTPRecord = {
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      createdAt: new Date(),
    }

    await db.collection("otps").insertOne(otpRecord)
    console.log("OTP saved for email:", email)
  } catch (error) {
    console.error("Error saving OTP:", error)
    throw new Error("Failed to save OTP")
  }
}

export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()

    const otpRecord = (await db.collection("otps").findOne({
      email,
      otp,
      expiresAt: { $gt: new Date() },
    })) as OTPRecord | null

    if (otpRecord) {
      // Delete the OTP after successful verification
      await db.collection("otps").deleteOne({ email, otp })
      console.log("OTP verified and deleted for email:", email)
      return true
    }

    console.log("OTP verification failed for email:", email)
    return false
  } catch (error) {
    console.error("Error verifying OTP:", error)
    return false
  }
}

export async function deleteOTP(email: string): Promise<void> {
  try {
    const { db } = await connectToDatabase()
    await db.collection("otps").deleteMany({ email })
    console.log("OTP deleted for email:", email)
  } catch (error) {
    console.error("Error deleting OTP:", error)
  }
}

// Clean up expired OTPs (can be called periodically)
export async function cleanupExpiredOTPs(): Promise<void> {
  try {
    const { db } = await connectToDatabase()
    const result = await db.collection("otps").deleteMany({
      expiresAt: { $lt: new Date() },
    })
    console.log("Cleaned up expired OTPs:", result.deletedCount)
  } catch (error) {
    console.error("Error cleaning up expired OTPs:", error)
  }
}
