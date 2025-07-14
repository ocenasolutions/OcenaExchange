import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "./mongodb"
import { ObjectId } from "mongodb"
import { serialize } from "cookie"
import speakeasy from "speakeasy"
import { sendEmail } from "./email"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"
const TOKEN_EXPIRATION = "1h" // 1 hour

export interface User {
  _id: ObjectId
  name: string
  email: string
  password: string
  role: "user" | "admin"
  isEmailVerified: boolean
  twoFactorEnabled: boolean
  twoFactorSecret?: string
  kycStatus: "pending" | "approved" | "rejected"
  createdAt: Date
  updatedAt: Date
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  console.log("Hashing password with salt rounds:", saltRounds)
  const hashed = await bcrypt.hash(password, saltRounds)
  console.log("Password hashed successfully, length:", hashed.length)
  return hashed
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  console.log("=== PASSWORD VERIFICATION ===")
  console.log("Plain password:", password)
  console.log("Plain password length:", password.length)
  console.log("Hashed password:", hashedPassword.substring(0, 20) + "...")
  console.log("Hashed password length:", hashedPassword.length)

  try {
    const isValid = await bcrypt.compare(password, hashedPassword)
    console.log("Password verification result:", isValid)
    console.log("=== END PASSWORD VERIFICATION ===")
    return isValid
  } catch (error) {
    console.error("Password verification error:", error)
    console.log("=== END PASSWORD VERIFICATION (ERROR) ===")
    return false
  }
}

export function generateToken(userId: string, walletAddress?: string): string {
  const payload = { userId, walletAddress }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION })
}

export function verifyToken(token: string): { userId: string; walletAddress?: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; walletAddress?: string }
  } catch (error) {
    return null
  }
}

export function createAuthCookie(token: string): string {
  return serialize("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })
}

export function clearAuthCookie(): string {
  return serialize("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0, // Expire immediately
    path: "/",
  })
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const { db } = await connectToDatabase()
    console.log("Looking up user with ID:", userId)

    const user = (await db.collection("users").findOne({
      _id: new ObjectId(userId),
    })) as User | null

    console.log("Found user:", user ? "Yes" : "No")
    return user
  } catch (error) {
    console.error("Get user by ID error:", error)
    return null
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { db } = await connectToDatabase()
    console.log("=== GET USER BY EMAIL ===")
    console.log("Looking up user with email:", email)

    const user = (await db.collection("users").findOne({ email })) as User | null
    console.log("Found user:", user ? "Yes" : "No")

    if (user) {
      console.log("User details:", {
        id: user._id,
        email: user.email,
        name: user.name,
        hasPassword: !!user.password,
        passwordLength: user.password?.length,
        passwordStart: user.password?.substring(0, 10) + "...",
      })
    }
    console.log("=== END GET USER BY EMAIL ===")

    return user
  } catch (error) {
    console.error("Get user by email error:", error)
    return null
  }
}

export async function authenticateUser(
  email: string,
  password: string,
  twoFactorCode?: string,
): Promise<{
  success: boolean
  user?: User
  token?: string
  error?: string
}> {
  try {
    console.log("=== AUTHENTICATION START ===")
    console.log("Authenticating user:", email)
    console.log("Password provided:", !!password)
    console.log("Password length:", password?.length)

    const user = await getUserByEmail(email)
    if (!user) {
      console.log("User not found")
      console.log("=== AUTHENTICATION END (USER NOT FOUND) ===")
      return { success: false, error: "Invalid email or password" }
    }

    console.log("User found, verifying password...")
    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      console.log("Password verification failed")
      console.log("=== AUTHENTICATION END (INVALID PASSWORD) ===")
      return { success: false, error: "Invalid email or password" }
    }

    if (user.twoFactorEnabled && !twoFactorCode) {
      console.log("2FA required but not provided")
      return { success: false, error: "Two-factor authentication code required" }
    }

    if (user.twoFactorEnabled && twoFactorCode) {
      if (!/^\d{6}$/.test(twoFactorCode)) {
        return { success: false, error: "Invalid two-factor authentication code" }
      }
      const isTwoFactorValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret || "",
        encoding: "base32",
        token: twoFactorCode,
        window: 2,
      })
      if (!isTwoFactorValid) {
        console.log("2FA verification failed")
        return { success: false, error: "Invalid two-factor authentication code" }
      }
    }

    const token = generateToken(user._id.toString())

    console.log("Authentication successful")
    console.log("=== AUTHENTICATION END (SUCCESS) ===")
    return {
      success: true,
      user,
      token,
    }
  } catch (error) {
    console.error("Authentication error:", error)
    console.log("=== AUTHENTICATION END (ERROR) ===")
    return { success: false, error: "Authentication failed" }
  }
}

export async function createUser(userData: {
  name: string
  email: string
  password: string
}): Promise<User> {
  const { db } = await connectToDatabase()

  console.log("=== CREATE USER ===")
  console.log("Creating user with email:", userData.email)
  console.log("Original password:", userData.password)
  console.log("Original password length:", userData.password.length)

  const hashedPassword = await hashPassword(userData.password)
  console.log("Password hashed for storage")

  const user: Omit<User, "_id"> = {
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
    role: "user",
    isEmailVerified: true,
    twoFactorEnabled: false,
    kycStatus: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await db.collection("users").insertOne(user)
  console.log("User created with ID:", result.insertedId)
  console.log("=== END CREATE USER ===")

  return {
    ...user,
    _id: result.insertedId,
  }
}

export async function generateTwoFactorSecret(): Promise<{ secret: string; qrCode: string }> {
  try {
    const secret = speakeasy.generateSecret({
      name: "OC Exchange",
      length: 32,
    })

    return {
      secret: secret.base32,
      qrCode: secret.otpauth_url || "",
    }
  } catch (error) {
    console.error("Error generating 2FA secret:", error)
    throw new Error("Failed to generate 2FA secret")
  }
}

export async function verifyTwoFactorToken(secret: string, token: string): Promise<boolean> {
  try {
    return speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 2,
    })
  } catch (error) {
    console.error("Error verifying 2FA token:", error)
    return false
  }
}

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const subject = "Welcome to OC Exchange!"
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Welcome to OC Exchange, ${name}!</h1>
      <p>Thank you for joining OC Exchange, the professional cryptocurrency trading platform.</p>
      <p>Your account has been successfully created and verified. You can now:</p>
      <ul>
        <li>Trade cryptocurrencies with advanced tools</li>
        <li>Manage your digital wallet</li>
        <li>Access real-time market data</li>
        <li>Use our professional trading interface</li>
      </ul>
      <p>Get started by logging into your account and exploring our platform.</p>
      <p>If you have any questions, our support team is here to help.</p>
      <p>Happy trading!</p>
      <p><strong>The OC Exchange Team</strong></p>
    </div>
  `

  await sendEmail(email, subject, html)
}
