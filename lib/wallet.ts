import { connectToDatabase } from "./mongodb"
import { ObjectId } from "mongodb"

export interface WalletBalance {
  _id?: ObjectId
  userId: string
  currency: string
  available: number
  locked: number
  total: number
  updatedAt: Date
}

export interface Transaction {
  _id?: ObjectId
  userId: string
  type: "deposit" | "withdrawal" | "trade" | "fee"
  currency: string
  amount: number
  status: "pending" | "completed" | "failed"
  txHash?: string
  address?: string
  createdAt: Date
  updatedAt: Date
}

export async function getWalletBalances(userId: string): Promise<WalletBalance[]> {
  const { db } = await connectToDatabase()
  return (await db.collection("wallets").find({ userId }).toArray()) as WalletBalance[]
}

export async function getWalletBalance(userId: string, currency: string): Promise<WalletBalance | null> {
  const { db } = await connectToDatabase()
  return (await db.collection("wallets").findOne({ userId, currency })) as WalletBalance | null
}

export async function updateWalletBalance(
  userId: string,
  currency: string,
  availableChange: number,
  lockedChange = 0,
): Promise<void> {
  const { db } = await connectToDatabase()

  const existingBalance = await getWalletBalance(userId, currency)

  if (existingBalance) {
    const newAvailable = existingBalance.available + availableChange
    const newLocked = existingBalance.locked + lockedChange
    const newTotal = newAvailable + newLocked

    await db.collection("wallets").updateOne(
      { userId, currency },
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
    // Create new wallet balance
    const newBalance: Omit<WalletBalance, "_id"> = {
      userId,
      currency,
      available: Math.max(0, availableChange),
      locked: Math.max(0, lockedChange),
      total: Math.max(0, availableChange + lockedChange),
      updatedAt: new Date(),
    }

    await db.collection("wallets").insertOne(newBalance)
  }
}

export async function createTransaction(
  transaction: Omit<Transaction, "_id" | "createdAt" | "updatedAt">,
): Promise<Transaction> {
  const { db } = await connectToDatabase()

  const newTransaction: Omit<Transaction, "_id"> = {
    ...transaction,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await db.collection("transactions").insertOne(newTransaction)

  return {
    ...newTransaction,
    _id: result.insertedId,
  }
}

export async function getTransactionsByUser(userId: string, limit = 50): Promise<Transaction[]> {
  const { db } = await connectToDatabase()
  return (await db
    .collection("transactions")
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()) as Transaction[]
}

export async function updateTransactionStatus(transactionId: string, status: Transaction["status"]): Promise<void> {
  const { db } = await connectToDatabase()

  await db.collection("transactions").updateOne(
    { _id: new ObjectId(transactionId) },
    {
      $set: {
        status,
        updatedAt: new Date(),
      },
    },
  )
}

export async function processDeposit(userId: string, currency: string, amount: number, txHash: string): Promise<void> {
  // Create transaction record
  const transaction = await createTransaction({
    userId,
    type: "deposit",
    currency,
    amount,
    status: "pending",
    txHash,
  })

  // In a real implementation, you would verify the transaction on the blockchain
  // For now, we'll just mark it as completed and update the balance
  await updateTransactionStatus(transaction._id!.toString(), "completed")
  await updateWalletBalance(userId, currency, amount)
}

export async function processWithdrawal(
  userId: string,
  currency: string,
  amount: number,
  address: string,
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  try {
    // Check if user has sufficient balance
    const balance = await getWalletBalance(userId, currency)
    if (!balance || balance.available < amount) {
      return { success: false, error: "Insufficient balance" }
    }

    // Lock the funds
    await updateWalletBalance(userId, currency, -amount, amount)

    // Create transaction record
    const transaction = await createTransaction({
      userId,
      type: "withdrawal",
      currency,
      amount,
      status: "pending",
      address,
    })

    // In a real implementation, you would submit the transaction to the blockchain
    // For now, we'll just mark it as completed
    setTimeout(async () => {
      await updateTransactionStatus(transaction._id!.toString(), "completed")
      await updateWalletBalance(userId, currency, 0, -amount) // Unlock the funds
    }, 5000) // Simulate 5 second processing time

    return { success: true, transactionId: transaction._id!.toString() }
  } catch (error) {
    console.error("Withdrawal processing error:", error)
    return { success: false, error: "Failed to process withdrawal" }
  }
}
