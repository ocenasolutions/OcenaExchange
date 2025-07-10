import { connectToDatabase } from "./mongodb"
import { ObjectId } from "mongodb"

export interface Balance {
  _id?: ObjectId
  userId: string
  symbol: string
  available: number
  locked: number
  total: number
  updatedAt: Date
}

export interface Transaction {
  _id?: ObjectId
  userId: string
  type: "deposit" | "withdrawal" | "trade" | "fee"
  symbol: string
  amount: number
  fee?: number
  status: "pending" | "completed" | "failed" | "cancelled"
  txHash?: string
  address?: string
  orderId?: string
  createdAt: Date
  updatedAt: Date
}

export async function getUserBalances(userId: string): Promise<Balance[]> {
  const { db } = await connectToDatabase()

  let balances = (await db.collection("balances").find({ userId }).toArray()) as Balance[]

  // If no balances exist, create default ones
  if (balances.length === 0) {
    const defaultBalances = [
      { userId, symbol: "BTC", available: 0, locked: 0, total: 0 },
      { userId, symbol: "ETH", available: 0, locked: 0, total: 0 },
      { userId, symbol: "USDT", available: 1000, locked: 0, total: 1000 }, // Demo balance
      { userId, symbol: "BNB", available: 0, locked: 0, total: 0 },
      { userId, symbol: "ADA", available: 0, locked: 0, total: 0 },
      { userId, symbol: "SOL", available: 0, locked: 0, total: 0 },
      { userId, symbol: "DOT", available: 0, locked: 0, total: 0 },
      { userId, symbol: "MATIC", available: 0, locked: 0, total: 0 },
    ].map((balance) => ({
      ...balance,
      updatedAt: new Date(),
    }))

    await db.collection("balances").insertMany(defaultBalances)
    balances = defaultBalances as Balance[]
  }

  return balances
}

export async function getBalance(userId: string, symbol: string): Promise<Balance | null> {
  const { db } = await connectToDatabase()

  let balance = (await db.collection("balances").findOne({ userId, symbol })) as Balance | null

  // Create balance if it doesn't exist
  if (!balance) {
    const newBalance: Omit<Balance, "_id"> = {
      userId,
      symbol,
      available: symbol === "USDT" ? 1000 : 0, // Demo balance for USDT
      locked: 0,
      total: symbol === "USDT" ? 1000 : 0,
      updatedAt: new Date(),
    }

    const result = await db.collection("balances").insertOne(newBalance)
    balance = { ...newBalance, _id: result.insertedId }
  }

  return balance
}

export async function updateBalance(
  userId: string,
  symbol: string,
  availableChange: number,
  lockedChange = 0,
): Promise<void> {
  const { db } = await connectToDatabase()

  await db.collection("balances").updateOne(
    { userId, symbol },
    {
      $inc: {
        available: availableChange,
        locked: lockedChange,
        total: availableChange + lockedChange,
      },
      $set: { updatedAt: new Date() },
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
      available: { $gte: amount },
    },
    {
      $inc: {
        available: -amount,
        locked: amount,
      },
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
      $inc: {
        available: amount,
        locked: -amount,
      },
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

export async function updateTransactionStatus(
  transactionId: string,
  status: Transaction["status"],
  txHash?: string,
): Promise<void> {
  const { db } = await connectToDatabase()

  const updateData: any = {
    status,
    updatedAt: new Date(),
  }

  if (txHash) {
    updateData.txHash = txHash
  }

  await db.collection("transactions").updateOne({ _id: new ObjectId(transactionId) }, { $set: updateData })
}

export async function processDeposit(userId: string, symbol: string, amount: number, txHash: string): Promise<void> {
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
  fee = 0,
): Promise<Transaction> {
  const { db } = await connectToDatabase()

  // Check if user has sufficient balance
  const balance = await getBalance(userId, symbol)
  if (!balance || balance.available < amount + fee) {
    throw new Error("Insufficient balance")
  }

  // Lock the withdrawal amount + fee
  const lockSuccess = await lockBalance(userId, symbol, amount + fee)
  if (!lockSuccess) {
    throw new Error("Failed to lock balance")
  }

  // Create withdrawal transaction
  const transaction = await createTransaction({
    userId,
    type: "withdrawal",
    symbol,
    amount,
    fee,
    status: "pending",
    address,
  })

  return transaction
}

export async function getTotalPortfolioValue(userId: string): Promise<number> {
  const balances = await getUserBalances(userId)

  // Mock prices for demo (in a real app, you'd fetch from market data)
  const mockPrices: Record<string, number> = {
    BTC: 45000,
    ETH: 3000,
    USDT: 1,
    BNB: 300,
    ADA: 0.5,
    SOL: 100,
    DOT: 25,
    MATIC: 1.2,
  }

  let totalValue = 0
  for (const balance of balances) {
    const price = mockPrices[balance.symbol] || 0
    totalValue += balance.total * price
  }

  return totalValue
}
