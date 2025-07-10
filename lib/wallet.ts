import { connectToDatabase } from "./mongodb"
import type { ObjectId } from "mongodb"

export interface WalletBalance {
  _id?: ObjectId
  userId: string
  symbol: string
  balance: number
  lockedBalance: number
  updatedAt: Date
}

export interface Transaction {
  _id?: ObjectId
  userId: string
  type: "deposit" | "withdrawal" | "trade" | "fee"
  symbol: string
  amount: number
  status: "pending" | "completed" | "failed"
  txHash?: string
  address?: string
  createdAt: Date
  updatedAt: Date
}

export async function getUserBalances(userId: string): Promise<WalletBalance[]> {
  const { db } = await connectToDatabase()

  const balances = await db.collection("balances").find({ userId }).toArray()

  return balances as WalletBalance[]
}

export async function getBalance(userId: string, symbol: string): Promise<WalletBalance | null> {
  const { db } = await connectToDatabase()

  const balance = await db.collection("balances").findOne({ userId, symbol })

  return balance as WalletBalance | null
}

export async function updateBalance(userId: string, symbol: string, amount: number, locked = 0): Promise<void> {
  const { db } = await connectToDatabase()

  await db.collection("balances").updateOne(
    { userId, symbol },
    {
      $inc: { balance: amount, lockedBalance: locked },
      $set: { updatedAt: new Date() },
      $setOnInsert: { userId, symbol },
    },
    { upsert: true },
  )
}

export async function lockBalance(userId: string, symbol: string, amount: number): Promise<boolean> {
  const { db } = await connectToDatabase()

  const result = await db.collection("balances").updateOne(
    {
      userId,
      symbol,
      balance: { $gte: amount },
    },
    {
      $inc: { balance: -amount, lockedBalance: amount },
      $set: { updatedAt: new Date() },
    },
  )

  return result.modifiedCount > 0
}

export async function unlockBalance(userId: string, symbol: string, amount: number): Promise<void> {
  const { db } = await connectToDatabase()

  await db.collection("balances").updateOne(
    { userId, symbol },
    {
      $inc: { balance: amount, lockedBalance: -amount },
      $set: { updatedAt: new Date() },
    },
  )
}

export async function createTransaction(
  transactionData: Omit<Transaction, "_id" | "createdAt" | "updatedAt">,
): Promise<Transaction> {
  const { db } = await connectToDatabase()

  const transaction: Omit<Transaction, "_id"> = {
    ...transactionData,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await db.collection("transactions").insertOne(transaction)

  return {
    ...transaction,
    _id: result.insertedId,
  }
}

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  const { db } = await connectToDatabase()

  const transactions = await db.collection("transactions").find({ userId }).sort({ createdAt: -1 }).limit(100).toArray()

  return transactions as Transaction[]
}

export async function processDeposit(userId: string, symbol: string, amount: number, txHash: string): Promise<void> {
  const { db } = await connectToDatabase()

  // Create transaction record
  await createTransaction({
    userId,
    type: "deposit",
    symbol,
    amount,
    status: "completed",
    txHash,
  })

  // Update balance
  await updateBalance(userId, symbol, amount)
}

export async function processWithdrawal(
  userId: string,
  symbol: string,
  amount: number,
  address: string,
): Promise<boolean> {
  const { db } = await connectToDatabase()

  // Check if user has sufficient balance
  const balance = await getBalance(userId, symbol)
  if (!balance || balance.balance < amount) {
    return false
  }

  // Lock the balance
  const locked = await lockBalance(userId, symbol, amount)
  if (!locked) {
    return false
  }

  // Create withdrawal transaction
  await createTransaction({
    userId,
    type: "withdrawal",
    symbol,
    amount: -amount,
    status: "pending",
    address,
  })

  return true
}

export async function getPortfolioValue(userId: string): Promise<{ totalValue: number; assets: any[] }> {
  const balances = await getUserBalances(userId)

  // Mock prices for demo
  const prices: { [key: string]: number } = {
    BTC: 45000,
    ETH: 3000,
    USDT: 1,
    BNB: 300,
    ADA: 0.5,
    DOT: 25,
    LINK: 15,
    UNI: 8,
  }

  let totalValue = 0
  const assets = balances.map((balance) => {
    const price = prices[balance.symbol] || 0
    const value = balance.balance * price
    totalValue += value

    return {
      symbol: balance.symbol,
      balance: balance.balance,
      lockedBalance: balance.lockedBalance,
      price,
      value,
    }
  })

  return { totalValue, assets }
}
