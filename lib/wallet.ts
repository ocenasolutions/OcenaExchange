import { connectToDatabase } from "./mongodb"
import { ObjectId } from "mongodb"

export interface Balance {
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
  status: "pending" | "completed" | "failed" | "cancelled"
  txHash?: string
  address?: string
  fee?: number
  description?: string
  createdAt: Date
  updatedAt: Date
}

export async function getUserBalances(userId: string): Promise<Balance[]> {
  const { db } = await connectToDatabase()

  let balances = await db.collection("balances").find({ userId }).toArray()

  // If no balances exist, create default ones
  if (balances.length === 0) {
    const defaultBalances = [
      { userId, symbol: "BTC", available: 0, locked: 0, total: 0, updatedAt: new Date() },
      { userId, symbol: "ETH", available: 0, locked: 0, total: 0, updatedAt: new Date() },
      { userId, symbol: "USDT", available: 1000, locked: 0, total: 1000, updatedAt: new Date() }, // Demo balance
      { userId, symbol: "BNB", available: 0, locked: 0, total: 0, updatedAt: new Date() },
      { userId, symbol: "ADA", available: 0, locked: 0, total: 0, updatedAt: new Date() },
      { userId, symbol: "SOL", available: 0, locked: 0, total: 0, updatedAt: new Date() },
      { userId, symbol: "DOT", available: 0, locked: 0, total: 0, updatedAt: new Date() },
      { userId, symbol: "MATIC", available: 0, locked: 0, total: 0, updatedAt: new Date() },
    ]

    await db.collection("balances").insertMany(defaultBalances)
    balances = defaultBalances
  }

  return balances as Balance[]
}

export async function getBalance(userId: string, symbol: string): Promise<Balance | null> {
  const { db } = await connectToDatabase()

  let balance = (await db.collection("balances").findOne({ userId, symbol })) as Balance | null

  // If balance doesn't exist, create it
  if (!balance) {
    const newBalance: Balance = {
      userId,
      symbol,
      available: symbol === "USDT" ? 1000 : 0, // Demo balance for USDT
      locked: 0,
      total: symbol === "USDT" ? 1000 : 0,
      updatedAt: new Date(),
    }

    await db.collection("balances").insertOne(newBalance)
    balance = newBalance
  }

  return balance
}

export async function updateBalance(
  userId: string,
  symbol: string,
  availableChange: number,
  lockedChange = 0,
): Promise<boolean> {
  const { db } = await connectToDatabase()

  const session = db.client.startSession()

  try {
    await session.withTransaction(async () => {
      const balance = await getBalance(userId, symbol)
      if (!balance) {
        throw new Error("Balance not found")
      }

      const newAvailable = balance.available + availableChange
      const newLocked = balance.locked + lockedChange
      const newTotal = newAvailable + newLocked

      if (newAvailable < 0 || newLocked < 0) {
        throw new Error("Insufficient balance")
      }

      await db.collection("balances").updateOne(
        { userId, symbol },
        {
          $set: {
            available: newAvailable,
            locked: newLocked,
            total: newTotal,
            updatedAt: new Date(),
          },
        },
        { session },
      )
    })

    return true
  } catch (error) {
    console.error("Error updating balance:", error)
    return false
  } finally {
    await session.endSession()
  }
}

export async function lockBalance(userId: string, symbol: string, amount: number): Promise<boolean> {
  return updateBalance(userId, symbol, -amount, amount)
}

export async function unlockBalance(userId: string, symbol: string, amount: number): Promise<boolean> {
  return updateBalance(userId, symbol, amount, -amount)
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

export async function getUserTransactions(userId: string, limit = 50, offset = 0): Promise<Transaction[]> {
  const { db } = await connectToDatabase()

  const transactions = await db
    .collection("transactions")
    .find({ userId })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .toArray()

  return transactions as Transaction[]
}

export async function getTransaction(transactionId: string): Promise<Transaction | null> {
  const { db } = await connectToDatabase()

  const transaction = await db.collection("transactions").findOne({
    _id: new ObjectId(transactionId),
  })

  return transaction as Transaction | null
}

export async function updateTransactionStatus(
  transactionId: string,
  status: Transaction["status"],
  txHash?: string,
): Promise<boolean> {
  const { db } = await connectToDatabase()

  const updateData: any = {
    status,
    updatedAt: new Date(),
  }

  if (txHash) {
    updateData.txHash = txHash
  }

  const result = await db
    .collection("transactions")
    .updateOne({ _id: new ObjectId(transactionId) }, { $set: updateData })

  return result.modifiedCount > 0
}

export async function processDeposit(
  userId: string,
  symbol: string,
  amount: number,
  txHash: string,
  address: string,
): Promise<boolean> {
  const { db } = await connectToDatabase()
  const session = db.client.startSession()

  try {
    await session.withTransaction(async () => {
      // Create transaction record
      await createTransaction({
        userId,
        type: "deposit",
        symbol,
        amount,
        status: "completed",
        txHash,
        address,
        description: `Deposit ${amount} ${symbol}`,
      })

      // Update balance
      const success = await updateBalance(userId, symbol, amount)
      if (!success) {
        throw new Error("Failed to update balance")
      }
    })

    return true
  } catch (error) {
    console.error("Error processing deposit:", error)
    return false
  } finally {
    await session.endSession()
  }
}

export async function processWithdrawal(
  userId: string,
  symbol: string,
  amount: number,
  address: string,
  fee = 0,
): Promise<string | null> {
  const { db } = await connectToDatabase()
  const session = db.client.startSession()

  try {
    let transactionId: string | null = null

    await session.withTransaction(async () => {
      // Check if user has sufficient balance
      const balance = await getBalance(userId, symbol)
      if (!balance || balance.available < amount + fee) {
        throw new Error("Insufficient balance")
      }

      // Create transaction record
      const transaction = await createTransaction({
        userId,
        type: "withdrawal",
        symbol,
        amount: -amount,
        status: "pending",
        address,
        fee,
        description: `Withdraw ${amount} ${symbol} to ${address}`,
      })

      transactionId = transaction._id!.toString()

      // Lock the balance (deduct from available)
      const success = await updateBalance(userId, symbol, -(amount + fee))
      if (!success) {
        throw new Error("Failed to update balance")
      }
    })

    return transactionId
  } catch (error) {
    console.error("Error processing withdrawal:", error)
    return null
  } finally {
    await session.endSession()
  }
}

export async function getTotalPortfolioValue(userId: string): Promise<number> {
  const balances = await getUserBalances(userId)

  // Mock prices for demo
  const prices: Record<string, number> = {
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
    const price = prices[balance.symbol] || 0
    totalValue += balance.total * price
  }

  return totalValue
}
