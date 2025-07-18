"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"

interface Asset {
  symbol: string
  name: string
  amount: number
  value: number
  change24h: number
  icon: string
}

export function PortfolioOverview() {
  const [totalValue, setTotalValue] = useState(45678.9)
  const [change24h, setChange24h] = useState(2345.67)
  const [changePercent, setChangePercent] = useState(5.42)
  const [assets, setAssets] = useState<Asset[]>([
    {
      symbol: "BTC",
      name: "Bitcoin",
      amount: 0.5432,
      value: 27890.45,
      change24h: 4.23,
      icon: "₿",
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      amount: 8.7654,
      value: 15432.1,
      change24h: -2.15,
      icon: "Ξ",
    },
    {
      symbol: "USDT",
      name: "Tether",
      amount: 2356.35,
      value: 2356.35,
      change24h: 0.01,
      icon: "₮",
    },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
          <div className="flex items-center space-x-2 text-sm">
            {changePercent >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={changePercent >= 0 ? "text-green-500" : "text-red-500"}>
              ${Math.abs(change24h).toLocaleString()} ({Math.abs(changePercent)}%) 24h
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Assets</h3>
        {assets.map((asset) => (
          <div
            key={asset.symbol}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {asset.icon}
              </div>
              <div>
                <p className="font-medium">{asset.name}</p>
                <p className="text-sm text-gray-500">
                  {asset.amount} {asset.symbol}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">${asset.value.toLocaleString()}</p>
              <p className={`text-sm ${asset.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                {asset.change24h >= 0 ? "+" : ""}
                {asset.change24h}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
