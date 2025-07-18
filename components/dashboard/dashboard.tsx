"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Eye, ChevronRight, Bitcoin, DollarSign, Activity } from "lucide-react"

// Mock data - replace with your actual data
const mockUser = { name: "John Doe" }

const portfolioData = {
  totalValue: 125432.50,
  change24h: 2.34,
  changeAmount: 2876.23,
  holdings: [
    { symbol: "BTC", name: "Bitcoin", amount: 2.45, value: 89234.12, change: 5.67 },
    { symbol: "ETH", name: "Ethereum", amount: 15.8, value: 28943.75, change: -2.14 },
    { symbol: "ADA", name: "Cardano", amount: 5420, value: 4321.88, change: 8.92 },
    { symbol: "DOT", name: "Polkadot", amount: 234.5, value: 2932.75, change: 1.45 },
    { symbol: "SOL", name: "Solana", amount: 45.2, value: 1876.23, change: -0.87 },
    { symbol: "LINK", name: "Chainlink", amount: 89.7, value: 1234.56, change: 3.21 }
  ]
}

const marketData = [
  { symbol: "BTC", name: "Bitcoin", price: 36421.50, change: 2.34, volume: "28.5B" },
  { symbol: "ETH", name: "Ethereum", price: 1832.75, change: -1.23, volume: "12.8B" },
  { symbol: "BNB", name: "Binance Coin", price: 234.88, change: 4.56, volume: "3.2B" },
  { symbol: "XRP", name: "Ripple", price: 0.5234, change: 1.87, volume: "2.1B" },
  { symbol: "ADA", name: "Cardano", price: 0.3421, change: 6.23, volume: "1.8B" },
  { symbol: "DOGE", name: "Dogecoin", price: 0.0789, change: -2.14, volume: "892M" },
  { symbol: "MATIC", name: "Polygon", price: 0.8234, change: 3.45, volume: "654M" },
  { symbol: "AVAX", name: "Avalanche", price: 12.34, change: 2.17, volume: "432M" }
]

const transactionData = [
  { id: 1, type: "buy", symbol: "BTC", amount: 0.5, price: 36200, date: "2024-01-15", status: "completed" },
  { id: 2, type: "sell", symbol: "ETH", amount: 2.3, price: 1840, date: "2024-01-14", status: "completed" },
  { id: 3, type: "buy", symbol: "ADA", amount: 1000, price: 0.34, date: "2024-01-13", status: "completed" },
  { id: 4, type: "sell", symbol: "SOL", amount: 5.2, price: 42.50, date: "2024-01-12", status: "completed" },
  { id: 5, type: "buy", symbol: "DOT", amount: 50, price: 6.75, date: "2024-01-11", status: "completed" },
  { id: 6, type: "buy", symbol: "LINK", amount: 25, price: 14.20, date: "2024-01-10", status: "pending" },
  { id: 7, type: "sell", symbol: "BTC", amount: 0.2, price: 35800, date: "2024-01-09", status: "completed" },
  { id: 8, type: "buy", symbol: "ETH", amount: 1.8, price: 1820, date: "2024-01-08", status: "completed" }
]

function PortfolioOverview({ showAll = false }) {
  const displayHoldings = showAll ? portfolioData.holdings : portfolioData.holdings.slice(0, 3)
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">${portfolioData.totalValue.toLocaleString()}</p>
          <div className="flex items-center gap-2 text-sm">
            {portfolioData.change24h > 0 ? (
              <ArrowUp className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDown className="h-4 w-4 text-red-500" />
            )}
            <span className={portfolioData.change24h > 0 ? "text-green-500" : "text-red-500"}>
              {portfolioData.change24h > 0 ? "+" : ""}{portfolioData.change24h}% (${portfolioData.changeAmount.toLocaleString()})
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-8 w-8 text-green-500" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-semibold">Holdings</h4>
        {displayHoldings.map((holding) => (
          <div key={holding.symbol} className="flex items-center justify-between p-2 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <Bitcoin className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-medium">{holding.symbol}</p>
                <p className="text-sm text-muted-foreground">{holding.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">${holding.value.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{holding.amount} {holding.symbol}</p>
            </div>
            <div className="flex items-center gap-1">
              {holding.change > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm ${holding.change > 0 ? "text-green-500" : "text-red-500"}`}>
                {holding.change > 0 ? "+" : ""}{holding.change}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MarketSummary({ showAll = false }) {
  const displayMarkets = showAll ? marketData : marketData.slice(0, 5)
  
  return (
    <div className="space-y-3">
      {displayMarkets.map((coin) => (
        <div key={coin.symbol} className="flex items-center justify-between p-2 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <Bitcoin className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-medium">{coin.symbol}</p>
              <p className="text-sm text-muted-foreground">{coin.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">${coin.price.toLocaleString()}</p>
            <div className="flex items-center gap-1">
              {coin.change > 0 ? (
                <ArrowUp className="h-3 w-3 text-green-500" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-500" />
              )}
              <span className={`text-sm ${coin.change > 0 ? "text-green-500" : "text-red-500"}`}>
                {coin.change > 0 ? "+" : ""}{coin.change}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function RecentTransactions({ showAll = false }) {
  const displayTransactions = showAll ? transactionData : transactionData.slice(0, 5)
  
  return (
    <div className="space-y-3">
      {displayTransactions.map((tx) => (
        <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              tx.type === "buy" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
            }`}>
              {tx.type === "buy" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </div>
            <div>
              <p className="font-medium capitalize">{tx.type} {tx.symbol}</p>
              <p className="text-sm text-muted-foreground">{tx.date}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">{tx.amount} {tx.symbol}</p>
            <p className="text-sm text-muted-foreground">${tx.price.toLocaleString()}</p>
          </div>
          <Badge variant={tx.status === "completed" ? "default" : "secondary"}>
            {tx.status}
          </Badge>
        </div>
      ))}
    </div>
  )
}

export function Dashboard() {
  const [portfolioExpanded, setPortfolioExpanded] = useState(false)
  const [marketExpanded, setMarketExpanded] = useState(false)
  const [transactionsExpanded, setTransactionsExpanded] = useState(false)

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {mockUser?.name || "User"}</h1>
        <p className="text-muted-foreground">Here's what's happening with your portfolio today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Portfolio Overview</CardTitle>
                <CardDescription>Your current portfolio performance</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPortfolioExpanded(!portfolioExpanded)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {portfolioExpanded ? "Show Less" : "View All"}
                <ChevronRight className={`h-4 w-4 transition-transform ${portfolioExpanded ? "rotate-90" : ""}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <PortfolioOverview showAll={portfolioExpanded} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Market Summary</CardTitle>
                <CardDescription>Top cryptocurrencies</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setMarketExpanded(!marketExpanded)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {marketExpanded ? "Less" : "All"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <MarketSummary showAll={marketExpanded} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest trading activity</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setTransactionsExpanded(!transactionsExpanded)}
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                {transactionsExpanded ? "Show Recent" : "View All"}
                <ChevronRight className={`h-4 w-4 transition-transform ${transactionsExpanded ? "rotate-90" : ""}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <RecentTransactions showAll={transactionsExpanded} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}