"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"

interface MarketData {
  symbol: string
  name: string
  price: number
  change24h: number
  volume: number
}

export function MarketSummary() {
  const [marketData, setMarketData] = useState<MarketData[]>([
    {
      symbol: "BTC",
      name: "Bitcoin",
      price: 44327.6,
      change24h: -0.68,
      volume: 558954,
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      price: 45485.06,
      change24h: 4.43,
      volume: 437624,
    },
    {
      symbol: "BNB",
      name: "BNB",
      price: 51754.29,
      change24h: 2.24,
      volume: 847434,
    },
  ])

  return (
    <div className="space-y-4">
      {marketData.map((coin) => (
        <div key={coin.symbol} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {coin.symbol.slice(0, 2)}
            </div>
            <div>
              <p className="font-medium text-sm">{coin.symbol.toLowerCase()}</p>
              <p className="text-xs text-gray-500">Vol: {coin.volume.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium text-sm">${coin.price.toLocaleString()}</p>
            <div className="flex items-center space-x-1">
              {coin.change24h >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={`text-xs ${coin.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                {coin.change24h >= 0 ? "+" : ""}
                {coin.change24h}%
              </span>
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
