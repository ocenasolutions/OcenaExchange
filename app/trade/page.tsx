"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { TradingViewWidget } from "@/components/trading/trading-view-widget" // Import TradingViewWidget

interface Order {
  id: string
  symbol: string
  type: "buy" | "sell"
  amount: number
  price: number
  total: number
  status: "pending" | "filled" | "cancelled"
  timestamp: string
}

interface Trade {
  id: string
  symbol: string
  type: "buy" | "sell"
  amount: number
  price: number
  total: number
  fee: number
  timestamp: string
}

const TRADING_PAIRS = [
  { value: "BTCUSDT", label: "BTC/USDT", price: 43250.0 },
  { value: "ETHUSDT", label: "ETH/USDT", price: 2650.0 },
  { value: "ADAUSDT", label: "ADA/USDT", price: 0.485 },
  { value: "BNBUSDT", label: "BNB/USDT", price: 320.5 },
]

export default function TradePage() {
  const { user } = useAuth()
  const [selectedPair, setSelectedPair] = useState("BTCUSDT")
  const [orderType, setOrderType] = useState<"market" | "limit">("limit")
  const [buyAmount, setBuyAmount] = useState("")
  const [buyPrice, setBuyPrice] = useState("")
  const [sellAmount, setSellAmount] = useState("")
  const [sellPrice, setSellPrice] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const currentPair = TRADING_PAIRS.find((pair) => pair.value === selectedPair)
  const currentPrice = currentPair?.price || 0

  // Load user orders and trades
  useEffect(() => {
    if (user) {
      loadUserOrders()
      loadUserTrades()
    }
  }, [user])

  const loadUserOrders = async () => {
    try {
      const response = await fetch("/api/trading/orders", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error("Failed to load orders:", error)
    }
  }

  const loadUserTrades = async () => {
    try {
      const response = await fetch("/api/trading/trades", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setTrades(data.trades || [])
      }
    } catch (error) {
      console.error("Failed to load trades:", error)
    }
  }

  const handleBuyOrder = async () => {
    if (!buyAmount || (orderType === "limit" && !buyPrice)) {
      setError("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const priceToSend = orderType === "limit" ? Number.parseFloat(buyPrice) : undefined // Send price only for limit orders
      const amount = Number.parseFloat(buyAmount)
      const calculatedPrice = orderType === "market" ? currentPrice : Number.parseFloat(buyPrice)
      const total = calculatedPrice * amount

      const response = await fetch("/api/trading/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          symbol: selectedPair,
          type: "buy",
          orderType,
          amount,
          price: priceToSend, // Only send price if it's a limit order
          total, // Always send total
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(`Buy order placed successfully!`)
        setBuyAmount("")
        setBuyPrice("")
        loadUserOrders()
        loadUserTrades()
      } else {
        setError(data.error || "Failed to place buy order")
      }
    } catch (error) {
      setError("Network error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSellOrder = async () => {
    if (!sellAmount || (orderType === "limit" && !sellPrice)) {
      setError("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const priceToSend = orderType === "limit" ? Number.parseFloat(sellPrice) : undefined // Send price only for limit orders
      const amount = Number.parseFloat(sellAmount)
      const calculatedPrice = orderType === "market" ? currentPrice : Number.parseFloat(sellPrice)
      const total = calculatedPrice * amount

      const response = await fetch("/api/trading/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          symbol: selectedPair,
          type: "sell",
          orderType,
          amount,
          price: priceToSend, // Only send price if it's a limit order
          total, // Always send total
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(`Sell order placed successfully!`)
        setSellAmount("")
        setSellPrice("")
        loadUserOrders()
        loadUserTrades()
      } else {
        setError(data.error || "Failed to place sell order")
      }
    } catch (error) {
      setError("Network error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const cancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/trading/orders/${orderId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        setSuccess("Order cancelled successfully")
        loadUserOrders()
      } else {
        setError("Failed to cancel order")
      }
    } catch (error) {
      setError("Network error occurred")
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-14 lg:pt-0">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trade</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Buy and sell cryptocurrencies with real-time trading
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trading Chart */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Trading Chart</CardTitle>
                        <CardDescription>{currentPair?.label} Price Chart</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          ${currentPrice.toLocaleString()}
                        </div>
                        <div className="text-sm text-green-600">+2.45%</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Replace placeholder with TradingViewWidget */}
                    <TradingViewWidget symbol={selectedPair} height={360} />
                  </CardContent>
                </Card>
              </div>

              {/* Trading Form */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Place Order</CardTitle>
                    <CardDescription>Buy or sell cryptocurrency</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Trading Pair Selection */}
                      <div className="space-y-2">
                        <Label>Trading Pair</Label>
                        <Select value={selectedPair} onValueChange={setSelectedPair}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TRADING_PAIRS.map((pair) => (
                              <SelectItem key={pair.value} value={pair.value}>
                                {pair.label} - ${pair.price.toLocaleString()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Order Type */}
                      <div className="space-y-2">
                        <Label>Order Type</Label>
                        <Select value={orderType} onValueChange={(value: "market" | "limit") => setOrderType(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="limit">Limit Order</SelectItem>
                            <SelectItem value="market">Market Order</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Tabs defaultValue="buy" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="buy">Buy</TabsTrigger>
                          <TabsTrigger value="sell">Sell</TabsTrigger>
                        </TabsList>

                        {/* Buy Tab */}
                        <TabsContent value="buy" className="space-y-4">
                          {orderType === "limit" && (
                            <div className="space-y-2">
                              <Label>Price (USDT)</Label>
                              <Input
                                type="number"
                                placeholder={currentPrice.toString()}
                                value={buyPrice}
                                onChange={(e) => setBuyPrice(e.target.value)}
                              />
                            </div>
                          )}
                          <div className="space-y-2">
                            <Label>Amount ({selectedPair.replace("USDT", "")})</Label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={buyAmount}
                              onChange={(e) => setBuyAmount(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Total (USDT)</Label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={
                                buyAmount &&
                                (orderType === "market" ? currentPrice : Number.parseFloat(buyPrice || "0"))
                                  ? (
                                      Number.parseFloat(buyAmount) *
                                      (orderType === "market" ? currentPrice : Number.parseFloat(buyPrice || "0"))
                                    ).toFixed(2)
                                  : ""
                              }
                              readOnly
                            />
                          </div>
                          <Button
                            onClick={handleBuyOrder}
                            disabled={isLoading}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            {isLoading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <TrendingUp className="mr-2 h-4 w-4" />
                            )}
                            Buy {selectedPair.replace("USDT", "")}
                          </Button>
                        </TabsContent>

                        {/* Sell Tab */}
                        <TabsContent value="sell" className="space-y-4">
                          {orderType === "limit" && (
                            <div className="space-y-2">
                              <Label>Price (USDT)</Label>
                              <Input
                                type="number"
                                placeholder={currentPrice.toString()}
                                value={sellPrice}
                                onChange={(e) => setSellPrice(e.target.value)}
                              />
                            </div>
                          )}
                          <div className="space-y-2">
                            <Label>Amount ({selectedPair.replace("USDT", "")})</Label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={sellAmount}
                              onChange={(e) => setSellAmount(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Total (USDT)</Label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={
                                sellAmount &&
                                (orderType === "market" ? currentPrice : Number.parseFloat(sellPrice || "0"))
                                  ? (
                                      Number.parseFloat(sellAmount) *
                                      (orderType === "market" ? currentPrice : Number.parseFloat(sellPrice || "0"))
                                    ).toFixed(2)
                                  : ""
                              }
                              readOnly
                            />
                          </div>
                          <Button
                            onClick={handleSellOrder}
                            disabled={isLoading}
                            className="w-full bg-red-600 hover:bg-red-700"
                          >
                            {isLoading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <TrendingDown className="mr-2 h-4 w-4" />
                            )}
                            Sell {selectedPair.replace("USDT", "")}
                          </Button>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Orders and Trades */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Open Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Open Orders</CardTitle>
                  <CardDescription>Your active trading orders</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No open orders</div>
                  ) : (
                    <div className="space-y-2">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            {order.type === "buy" ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <div>
                              <div className="font-medium">{order.symbol}</div>
                              <div className="text-sm text-gray-500">
                                {order.amount} @ ${order.price?.toLocaleString() || "N/A"}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={order.status === "pending" ? "secondary" : "default"}>{order.status}</Badge>
                            {order.status === "pending" && (
                              <Button size="sm" variant="outline" onClick={() => cancelOrder(order.id)}>
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Trades */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Trades</CardTitle>
                  <CardDescription>Your completed transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  {trades.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No recent trades</div>
                  ) : (
                    <div className="space-y-2">
                      {trades.slice(0, 5).map((trade) => (
                        <div
                          key={trade.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            {trade.type === "buy" ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <div>
                              <div className="font-medium">{trade.symbol}</div>
                              <div className="text-sm text-gray-500">
                                {trade.amount} @ ${trade.price?.toLocaleString() || "N/A"}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${trade.total.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">Fee: ${trade.fee.toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
