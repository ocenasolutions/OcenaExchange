"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Navigation } from "@/components/layout/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownLeft, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

const walletBalances = [
  { symbol: "BTC", name: "Bitcoin", balance: 0.5234, value: 23678.45, change: 2.5 },
  { symbol: "ETH", name: "Ethereum", balance: 2.1567, value: 6876.23, change: 1.8 },
  { symbol: "ADA", name: "Cardano", balance: 1000, value: 1230.0, change: -0.5 },
  { symbol: "USD", name: "US Dollar", balance: 5000, value: 5000, change: 0 },
]

const recentTransactions = [
  { type: "deposit", symbol: "BTC", amount: 0.1, value: 4500, date: "2024-01-15", status: "completed" },
  { type: "withdrawal", symbol: "ETH", amount: 0.5, value: 1593.5, date: "2024-01-14", status: "completed" },
  { type: "deposit", symbol: "USD", amount: 1000, value: 1000, date: "2024-01-13", status: "pending" },
]

export default function WalletPage() {
  const [showBalances, setShowBalances] = useState(true)
  const totalValue = walletBalances.reduce((sum, balance) => sum + balance.value, 0)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Wallet</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your cryptocurrency holdings and transactions
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Portfolio Overview</CardTitle>
                    <CardDescription>Your total balance across all assets</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowBalances(!showBalances)}>
                    {showBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {showBalances ? `$${totalValue.toLocaleString()}` : "****"}
                  </div>
                  <p className="text-sm text-muted-foreground">Total portfolio value</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" variant="default">
                    <ArrowDownLeft className="h-4 w-4 mr-2" />
                    Deposit
                  </Button>
                  <Button className="w-full bg-transparent" variant="outline">
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Withdraw
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Balances</CardTitle>
                  <CardDescription>Your cryptocurrency holdings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {walletBalances.map((balance) => (
                      <div key={balance.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="font-bold text-sm">{balance.symbol}</span>
                          </div>
                          <div>
                            <p className="font-medium">{balance.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {showBalances ? balance.balance.toLocaleString() : "****"} {balance.symbol}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{showBalances ? `$${balance.value.toLocaleString()}` : "****"}</p>
                          {balance.change !== 0 && (
                            <Badge variant={balance.change > 0 ? "default" : "destructive"}>
                              {balance.change > 0 ? "+" : ""}
                              {balance.change}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest deposits and withdrawals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTransactions.map((tx, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              tx.type === "deposit" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                            }`}
                          >
                            {tx.type === "deposit" ? (
                              <ArrowDownLeft className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium capitalize">{tx.type}</p>
                            <p className="text-sm text-muted-foreground">{tx.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {tx.amount} {tx.symbol}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">${tx.value.toLocaleString()}</span>
                            <Badge variant={tx.status === "completed" ? "default" : "secondary"}>{tx.status}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
