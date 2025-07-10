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
  type: "deposit" | "withdrawal" | "trade"
  symbol: string
  amount: number
  fee: number
  status: "pending" | "completed" | "failed"
  txHash?: string
  address?: string
  createdAt: Date
  updatedAt: Date
}

export async function getUserBalances(userId: string): Promise<Balance[]> {
  const { db } = await connectToDatabase()

  let balances = (await db.collection("balances").find({ userId }).toArray()) as Balance[]

  // If no balances exist, create default ones
  if (balances.length === 0) {
    const defaultBalances = [
      { userId, symbol: "BTC", available: 0, locked: 0, total: 0, updatedAt: new Date() },
      { userId, symbol: "ETH", available: 0, locked: 0, total: 0, updatedAt: new Date() },
      { userId, symbol: "USDT", available: 1000, locked: 0, total: 1000, updatedAt: new Date() }, // Demo balance
    ]

    await db.collection("balances").insertMany(defaultBalances)
    balances = defaultBalances
  }

  return balances
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
      $set: {
        updatedAt: new Date(),
      },
    },
    { upsert: true },
  )
}

export async function lockBalance(userId: string, symbol: string, amount: number): Promise<boolean> {
  const { db } = await connectToDatabase()

  const balance = (await db.collection("balances").findOne({ userId, symbol })) as Balance | null

  if (!balance || balance.available < amount) {
    return false
  }

  await db.collection("balances").updateOne(
    { userId, symbol },
    {
      $inc: {
        available: -amount,
        locked: amount,
      },
      $set: {
        updatedAt: new Date(),
      },
    },
  )

  return true
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
      $set: {
        updatedAt: new Date(),
      },
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

  return (await db
    .collection("transactions")
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray()) as Transaction[]
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
    fee: 0,
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
  fee: number,
): Promise<Transaction> {
  const { db } = await connectToDatabase()

  // Check if user has sufficient balance
  const balance = (await db.collection("balances").findOne({ userId, symbol })) as Balance | null

  if (!balance || balance.available < amount + fee) {
    throw new Error("Insufficient balance")
  }

  // Create transaction record
  const transaction = await createTransaction({
    userId,
    type: "withdrawal",
    symbol,
    amount,
    fee,
    status: "pending",
    address,
  })

  // Lock the balance
  await updateBalance(userId, symbol, -(amount + fee))

  return transaction
}
