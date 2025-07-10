import { connectToDatabase } from "./mongodb"

export interface OTPRecord {
  email: string
  otp: string
  expiresAt: Date
  createdAt: Date
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function saveOTP(email: string, otp: string): Promise<void> {
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
}

export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  const { db } = await connectToDatabase()

  const otpRecord = (await db.collection("otps").findOne({
    email,
    otp,
    expiresAt: { $gt: new Date() },
  })) as OTPRecord | null

  if (otpRecord) {
    // Delete the used OTP
    await db.collection("otps").deleteOne({ _id: (otpRecord as any)._id })
    console.log("OTP verified and deleted for email:", email)
    return true
  }

  console.log("OTP verification failed for email:", email)
  return false
}

export async function deleteOTP(email: string): Promise<void> {
  const { db } = await connectToDatabase()
  await db.collection("otps").deleteMany({ email })
  console.log("OTP deleted for email:", email)
}

export async function cleanupExpiredOTPs(): Promise<void> {
  const { db } = await connectToDatabase()
  const result = await db.collection("otps").deleteMany({
    expiresAt: { $lt: new Date() },
  })
  console.log("Cleaned up expired OTPs:", result.deletedCount)
}
