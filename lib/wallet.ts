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
  type: "deposit" | "withdrawal" | "trade"
  symbol: string
  amount: number
  status: "pending" | "completed" | "failed"
  txHash?: string
  address?: string
  createdAt: Date
  updatedAt: Date
}

export async function getUserBalances(userId: string): Promise<Balance[]> {
  const { db } = await connectToDatabase()

  return (await db.collection("balances").find({ userId }).toArray()) as Balance[]
}

export async function getUserBalance(userId: string, symbol: string): Promise<Balance | null> {
  const { db } = await connectToDatabase()

  return (await db.collection("balances").findOne({ userId, symbol })) as Balance | null
}

export async function updateBalance(
  userId: string,
  symbol: string,
  availableChange: number,
  lockedChange = 0,
): Promise<void> {
  const { db } = await connectToDatabase()

  const existingBalance = await getUserBalance(userId, symbol)

  if (existingBalance) {
    const newAvailable = existingBalance.available + availableChange
    const newLocked = existingBalance.locked + lockedChange
    const newTotal = newAvailable + newLocked

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
    )
  } else {
    const balance: Omit<Balance, "_id"> = {
      userId,
      symbol,
      available: Math.max(0, availableChange),
      locked: Math.max(0, lockedChange),
      total: Math.max(0, availableChange + lockedChange),
      updatedAt: new Date(),
    }

    await db.collection("balances").insertOne(balance)
  }
}

export async function lockBalance(userId: string, symbol: string, amount: number): Promise<boolean> {
  const balance = await getUserBalance(userId, symbol)

  if (!balance || balance.available < amount) {
    return false
  }

  await updateBalance(userId, symbol, -amount, amount)
  return true
}

export async function unlockBalance(userId: string, symbol: string, amount: number): Promise<void> {
  await updateBalance(userId, symbol, amount, -amount)
}

export async function createTransaction(
  transactionData: Omit<Transaction, "_id" | "createdAt" | "updatedAt">,
): Promise<Transaction> {
  const { db } = await connectToDatabase()

  const transaction: Omit<Transaction, "_id"> = {
    ...transactionData,
    status: "pending",
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

  return (await db.collection("transactions").find({ userId }).sort({ createdAt: -1 }).toArray()) as Transaction[]
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
  const transaction = await createTransaction({
    userId,
    type: "deposit",
    symbol,
    amount,
    txHash,
    status: "completed",
  })

  // Update user balance
  await updateBalance(userId, symbol, amount)

  // Update transaction status
  await updateTransactionStatus(transaction._id!.toString(), "completed", txHash)
}

export async function processWithdrawal(
  userId: string,
  symbol: string,
  amount: number,
  address: string,
): Promise<Transaction | null> {
  const balance = await getUserBalance(userId, symbol)

  if (!balance || balance.available < amount) {
    return null
  }

  // Lock the balance
  const locked = await lockBalance(userId, symbol, amount)
  if (!locked) {
    return null
  }

  // Create withdrawal transaction
  const transaction = await createTransaction({
    userId,
    type: "withdrawal",
    symbol,
    amount,
    address,
    status: "pending",
  })

  return transaction
}

export async function getTransactionById(transactionId: string): Promise<Transaction | null> {
  const { db } = await connectToDatabase()

  return (await db.collection("transactions").findOne({ _id: new ObjectId(transactionId) })) as Transaction | null
}

export async function initializeUserBalances(userId: string): Promise<void> {
  const commonSymbols = ["BTC", "ETH", "USDT", "BNB", "ADA", "DOT", "LINK", "LTC"]

  for (const symbol of commonSymbols) {
    const existingBalance = await getUserBalance(userId, symbol)
    if (!existingBalance) {
      await updateBalance(userId, symbol, 0, 0)
    }
  }
}
