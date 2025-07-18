"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChartIcon,
  BarChart3,
  Target,
  Award,
  Activity,
  Zap,
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const tradingData = [
  { name: "Jan", profit: 4000, loss: 2400, volume: 2400 },
  { name: "Feb", profit: 3000, loss: 1398, volume: 2210 },
  { name: "Mar", profit: 2000, loss: 9800, volume: 2290 },
  { name: "Apr", profit: 2780, loss: 3908, volume: 2000 },
  { name: "May", profit: 1890, loss: 4800, volume: 2181 },
  { name: "Jun", profit: 2390, loss: 3800, volume: 2500 },
]

const portfolioData = [
  { name: "Bitcoin", value: 45, color: "#f7931a" },
  { name: "Ethereum", value: 30, color: "#627eea" },
  { name: "Cardano", value: 15, color: "#0033ad" },
  { name: "Others", value: 10, color: "#8884d8" },
]

const performanceData = [
  { period: "24h", pnl: 234.56, percentage: 2.1 },
  { period: "7d", pnl: -123.45, percentage: -1.2 },
  { period: "30d", pnl: 1567.89, percentage: 8.9 },
  { period: "All time", pnl: 3456.78, percentage: 15.6 },
]

const topPerformers = [
  { symbol: "BTC", pnl: 1234.56, percentage: 12.5 },
  { symbol: "ETH", pnl: 567.89, percentage: 8.3 },
  { symbol: "ADA", pnl: -89.12, percentage: -2.1 },
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const portfolioMetrics = {
    totalValue: 125000,
    totalChange: 8.5,
    totalChangeValue: 9800,
    dayChange: 2.3,
    dayChangeValue: 2875,
    bestPerformer: "BTC",
    worstPerformer: "ADA",
  }

  const tradingStats = {
    totalTrades: 247,
    winRate: 68.4,
    avgProfit: 245,
    totalProfit: 18500,
    bestTrade: 2400,
    worstTrade: -850,
    avgHoldTime: "3.2 days",
  }

  const assetAllocation = [
    { name: "Bitcoin", symbol: "BTC", percentage: 45, value: 56250, change: 3.2 },
    { name: "Ethereum", symbol: "ETH", percentage: 30, value: 37500, change: 1.8 },
    { name: "Cardano", symbol: "ADA", percentage: 15, value: 18750, change: -2.1 },
    { name: "Solana", symbol: "SOL", percentage: 10, value: 12500, change: 5.7 },
  ]

  const recentTrades = [
    {
      id: 1,
      pair: "BTC/USDT",
      type: "Buy",
      amount: 0.25,
      price: 43200,
      profit: 450,
      date: "2024-01-15",
      status: "completed",
    },
    {
      id: 2,
      pair: "ETH/USDT",
      type: "Sell",
      amount: 5.0,
      price: 2650,
      profit: -120,
      date: "2024-01-14",
      status: "completed",
    },
    {
      id: 3,
      pair: "SOL/USDT",
      type: "Buy",
      amount: 100,
      price: 125,
      profit: 280,
      date: "2024-01-13",
      status: "completed",
    },
    {
      id: 4,
      pair: "ADA/USDT",
      type: "Sell",
      amount: 1000,
      price: 0.52,
      profit: -85,
      date: "2024-01-12",
      status: "completed",
    },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`
  }

  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your trading performance and portfolio analytics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {performanceData.map((data) => (
            <Card key={data.period}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">P&L ({data.period})</CardTitle>
                {data.pnl > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${data.pnl > 0 ? "text-green-600" : "text-red-600"}`}>
                  ${data.pnl > 0 ? "+" : ""}
                  {data.pnl.toLocaleString()}
                </div>
                <Badge variant={data.percentage > 0 ? "default" : "destructive"}>
                  {data.percentage > 0 ? "+" : ""}
                  {data.percentage}%
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
              <CardDescription>Your portfolio value over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Performance chart will be displayed here</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Your best and worst performing assets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((performer) => (
                  <div key={performer.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="font-bold text-sm">{performer.symbol}</span>
                      </div>
                      <div>
                        <p className="font-medium">{performer.symbol}</p>
                        <p className="text-sm text-muted-foreground">Cryptocurrency</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${performer.pnl > 0 ? "text-green-600" : "text-red-600"}`}>
                        ${performer.pnl > 0 ? "+" : ""}
                        {performer.pnl.toLocaleString()}
                      </p>
                      <Badge variant={performer.percentage > 0 ? "default" : "destructive"}>
                        {performer.percentage > 0 ? "+" : ""}
                        {performer.percentage}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Trading Statistics</CardTitle>
              <CardDescription>Your trading activity summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">47</div>
                  <p className="text-sm text-muted-foreground">Total Trades</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">32</div>
                  <p className="text-sm text-muted-foreground">Profitable Trades</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">68%</div>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Portfolio Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(portfolioMetrics.totalValue)}</p>
                  <div className="flex items-center mt-1">
                    {portfolioMetrics.totalChange > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        portfolioMetrics.totalChange > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatPercentage(portfolioMetrics.totalChange)}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Trades</p>
                  <p className="text-2xl font-bold">{tradingStats.totalTrades}</p>
                  <div className="flex items-center mt-1">
                    <Activity className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">This month</span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Win Rate</p>
                  <p className="text-2xl font-bold">{tradingStats.winRate}%</p>
                  <div className="flex items-center mt-1">
                    <Target className="h-4 w-4 text-purple-600 mr-1" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Above average</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Profit</p>
                  <p className="text-2xl font-bold">{formatCurrency(tradingStats.totalProfit)}</p>
                  <div className="flex items-center mt-1">
                    <Zap className="h-4 w-4 text-yellow-600 mr-1" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">+12% vs last month</span>
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                  <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4 mt-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$45,231.89</div>
                  <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$12,234.56</div>
                  <p className="text-xs text-muted-foreground">+15.3% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">68.5%</div>
                  <p className="text-xs text-muted-foreground">+2.1% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Trades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">3 new this week</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trading" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Trading Performance</CardTitle>
                <CardDescription>Your profit and loss over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={tradingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="profit" fill="#10b981" />
                    <Bar dataKey="loss" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Trading Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Trading Statistics</CardTitle>
                <CardDescription>Detailed trading performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(tradingStats.bestTrade)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Best Trade</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(tradingStats.worstTrade)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Worst Trade</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(tradingStats.avgProfit)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Profit</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-2xl font-bold text-purple-600">{tradingStats.avgHoldTime}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Hold Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Trades */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Trades</CardTitle>
                <CardDescription>Your latest trading activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTrades.map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <Badge variant={trade.type === "Buy" ? "default" : "secondary"}>{trade.type}</Badge>
                        <div>
                          <p className="font-medium">{trade.pair}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {trade.amount} @ {formatCurrency(trade.price)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${trade.profit > 0 ? "text-green-600" : "text-red-600"}`}>
                          {formatCurrency(trade.profit)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{trade.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Distribution</CardTitle>
                <CardDescription>Your current asset allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={portfolioData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {portfolioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Asset Allocation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChartIcon className="h-5 w-5" />
                  <span>Asset Allocation</span>
                </CardTitle>
                <CardDescription>Current portfolio distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assetAllocation.map((asset) => (
                    <div
                      key={asset.symbol}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="font-bold text-blue-600 dark:text-blue-400">{asset.symbol}</span>
                        </div>
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{formatCurrency(asset.value)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{asset.percentage}%</p>
                        <p className={`text-sm ${asset.change > 0 ? "text-green-600" : "text-red-600"}`}>
                          {formatPercentage(asset.change)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
