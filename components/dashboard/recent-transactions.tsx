"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"

interface Transaction {
  id: string
  type: "buy" | "sell"
  asset: string
  amount: number
  price: number
  total: number
  timestamp: string
  status: "completed" | "pending" | "failed"
}

export function RecentTransactions() {
  const [transactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "buy",
      asset: "BTC",
      amount: 0.0234,
      price: 44327.6,
      total: 1037.27,
      timestamp: "2024-01-15T10:30:00Z",
      status: "completed",
    },
    {
      id: "2",
      type: "sell",
      asset: "ETH",
      amount: 2.5,
      price: 2650.4,
      total: 6626.0,
      timestamp: "2024-01-15T09:15:00Z",
      status: "completed",
    },
    {
      id: "3",
      type: "buy",
      asset: "BNB",
      amount: 10,
      price: 315.2,
      total: 3152.0,
      timestamp: "2024-01-14T16:45:00Z",
      status: "pending",
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                tx.type === "buy" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
              }`}
            >
              {tx.type === "buy" ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
            </div>
            <div>
              <p className="font-medium">
                {tx.type === "buy" ? "Buy" : "Sell"} {tx.asset}
              </p>
              <p className="text-sm text-gray-500">
                {tx.amount} {tx.asset} @ ${tx.price.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">${tx.total.toLocaleString()}</p>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(tx.status)}>{tx.status}</Badge>
              <span className="text-xs text-gray-500">{formatDate(tx.timestamp)}</span>
            </div>
          </div>
        </div>
      ))}
      <div className="pt-2 border-t">
        <button className="text-blue-600 text-sm hover:underline">View All</button>
      </div>
    </div>
  )
}
