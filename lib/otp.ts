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
}

export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  const { db } = await connectToDatabase()

  const otpRecord = await db.collection("otps").findOne({
    email,
    otp,
    expiresAt: { $gt: new Date() },
  })

  return !!otpRecord
}

export async function deleteOTP(email: string): Promise<void> {
  const { db } = await connectToDatabase()
  await db.collection("otps").deleteMany({ email })
}
