"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

const marketData = [
  { symbol: "BTC", name: "Bitcoin", price: 45234.56, change: 2.5, volume: "1.2B" },
  { symbol: "ETH", name: "Ethereum", price: 3187.23, change: 1.8, volume: "890M" },
  { symbol: "ADA", name: "Cardano", price: 1.23, change: -0.5, volume: "234M" },
  { symbol: "DOT", name: "Polkadot", price: 23.45, change: 3.2, volume: "156M" },
  { symbol: "LINK", name: "Chainlink", price: 28.67, change: -1.2, volume: "98M" },
]

export default function MarketsPage() {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Markets</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Real-time cryptocurrency market data and prices</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cryptocurrency Markets</CardTitle>
            <CardDescription>Live prices and 24h changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketData.map((coin) => (
                <div key={coin.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="font-bold text-sm">{coin.symbol}</span>
                    </div>
                    <div>
                      <p className="font-medium">{coin.name}</p>
                      <p className="text-sm text-muted-foreground">{coin.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${coin.price.toLocaleString()}</p>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={coin.change > 0 ? "default" : "destructive"}
                        className="flex items-center space-x-1"
                      >
                        {coin.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        <span>
                          {coin.change > 0 ? "+" : ""}
                          {coin.change}%
                        </span>
                      </Badge>
                      <span className="text-sm text-muted-foreground">Vol: {coin.volume}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
