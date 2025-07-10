import { connectToDatabase } from "./mongodb"

export interface MarketData {
  symbol: string
  price: number
  change24h: number
  changePercent24h: number
  volume24h: number
  high24h: number
  low24h: number
  marketCap?: number
  lastUpdated: Date
}

export interface Candlestick {
  symbol: string
  interval: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  timestamp: Date
}

export interface CandlestickData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface OrderBookEntry {
  price: number
  amount: number
  total: number
}

export interface OrderBook {
  symbol: string
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
  updatedAt: Date
}

export interface OrderBookData {
  symbol: string
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
  lastUpdated: Date
}

// Mock market data for demo purposes
const mockMarketData: Record<string, MarketData> = {
  BTCUSDT: {
    symbol: "BTCUSDT",
    price: 45234.56,
    change24h: 1234.56,
    changePercent24h: 2.81,
    volume24h: 28456789.12,
    high24h: 46123.45,
    low24h: 43987.23,
    marketCap: 876543210987,
    lastUpdated: new Date(),
  },
  ETHUSDT: {
    symbol: "ETHUSDT",
    price: 3045.78,
    change24h: -87.23,
    changePercent24h: -2.78,
    volume24h: 15678234.56,
    high24h: 3156.89,
    low24h: 2987.45,
    marketCap: 365432109876,
    lastUpdated: new Date(),
  },
  BNBUSDT: {
    symbol: "BNBUSDT",
    price: 312.45,
    change24h: 15.67,
    changePercent24h: 5.28,
    volume24h: 5678901.23,
    high24h: 318.92,
    low24h: 298.76,
    marketCap: 48765432109,
    lastUpdated: new Date(),
  },
  ADAUSDT: {
    symbol: "ADAUSDT",
    price: 0.4567,
    change24h: 0.0234,
    changePercent24h: 5.41,
    volume24h: 3456789.01,
    high24h: 0.4789,
    low24h: 0.4321,
    marketCap: 15432109876,
    lastUpdated: new Date(),
  },
  SOLUSDT: {
    symbol: "SOLUSDT",
    price: 98.76,
    change24h: -3.45,
    changePercent24h: -3.38,
    volume24h: 2345678.9,
    high24h: 103.21,
    low24h: 95.43,
    marketCap: 42109876543,
    lastUpdated: new Date(),
  },
  DOTUSDT: {
    symbol: "DOTUSDT",
    price: 24.89,
    change24h: 1.23,
    changePercent24h: 5.2,
    volume24h: 1234567.89,
    high24h: 25.67,
    low24h: 23.45,
    marketCap: 28765432109,
    lastUpdated: new Date(),
  },
  MATICUSDT: {
    symbol: "MATICUSDT",
    price: 1.2345,
    change24h: 0.0678,
    changePercent24h: 5.81,
    volume24h: 987654.32,
    high24h: 1.2987,
    low24h: 1.1876,
    marketCap: 11234567890,
    lastUpdated: new Date(),
  },
}

export async function fetchMarketData(symbol?: string): Promise<MarketData | MarketData[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  if (symbol) {
    const data = mockMarketData[symbol.toUpperCase()]
    if (!data) {
      throw new Error(`Market data not found for symbol: ${symbol}`)
    }

    // Add some random price fluctuation
    const fluctuation = (Math.random() - 0.5) * 0.02 // ±1% random change
    data.price = data.price * (1 + fluctuation)
    data.lastUpdated = new Date()

    return data
  }

  // Return all market data with random fluctuations
  const allData = Object.values(mockMarketData).map((data) => {
    const fluctuation = (Math.random() - 0.5) * 0.02
    return {
      ...data,
      price: data.price * (1 + fluctuation),
      lastUpdated: new Date(),
    }
  })

  return allData
}

export async function getMarketData(symbol?: string): Promise<MarketData | MarketData[]> {
  return fetchMarketData(symbol)
}

export async function getCandlestickData(symbol: string, interval = "1h", limit = 100): Promise<Candlestick[]> {
  // Mock candlestick data generation
  const candlesticks: Candlestick[] = []
  const basePrice = mockMarketData[symbol.toUpperCase()]?.price || 100

  for (let i = limit; i > 0; i--) {
    const timestamp = new Date(Date.now() - i * 60 * 60 * 1000) // 1 hour intervals
    const open = basePrice * (1 + (Math.random() - 0.5) * 0.1)
    const close = open * (1 + (Math.random() - 0.5) * 0.05)
    const high = Math.max(open, close) * (1 + Math.random() * 0.02)
    const low = Math.min(open, close) * (1 - Math.random() * 0.02)
    const volume = Math.random() * 1000

    candlesticks.push({
      symbol,
      interval,
      open,
      high,
      low,
      close,
      volume,
      timestamp,
    })
  }

  return candlesticks
}

export async function fetchCandlestickData(symbol: string, interval = "1h", limit = 100): Promise<CandlestickData[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 150))

  const basePrice = mockMarketData[symbol.toUpperCase()]?.price || 100
  const data: CandlestickData[] = []

  const now = Date.now()
  const intervalMs = getIntervalMs(interval)

  for (let i = limit - 1; i >= 0; i--) {
    const timestamp = now - i * intervalMs
    const randomChange = (Math.random() - 0.5) * 0.05 // ±2.5% random change
    const open = basePrice * (1 + randomChange)
    const close = open * (1 + (Math.random() - 0.5) * 0.03) // ±1.5% from open
    const high = Math.max(open, close) * (1 + Math.random() * 0.02) // Up to 2% higher
    const low = Math.min(open, close) * (1 - Math.random() * 0.02) // Up to 2% lower
    const volume = Math.random() * 1000000

    data.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume,
    })
  }

  return data
}

export async function getOrderBook(symbol: string): Promise<OrderBook> {
  const basePrice = mockMarketData[symbol.toUpperCase()]?.price || 100

  // Generate mock order book data
  const bids: OrderBookEntry[] = []
  const asks: OrderBookEntry[] = []

  // Generate bids (buy orders) - prices below current price
  for (let i = 0; i < 20; i++) {
    bids.push({
      price: basePrice * (1 - (i + 1) * 0.001), // Decreasing prices
      amount: Math.random() * 10 + 0.1,
      total: basePrice * (1 - (i + 1) * 0.001) * (Math.random() * 10 + 0.1),
    })
  }

  // Generate asks (sell orders) - prices above current price
  for (let i = 0; i < 20; i++) {
    asks.push({
      price: basePrice * (1 + (i + 1) * 0.001), // Increasing prices
      amount: Math.random() * 10 + 0.1,
      total: basePrice * (1 + (i + 1) * 0.001) * (Math.random() * 10 + 0.1),
    })
  }

  return {
    symbol,
    bids: bids.sort((a, b) => b.price - a.price), // Highest bid first
    asks: asks.sort((a, b) => a.price - b.price), // Lowest ask first
    updatedAt: new Date(),
  }
}

export async function fetchOrderBook(symbol: string): Promise<OrderBookData> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  const basePrice = mockMarketData[symbol.toUpperCase()]?.price || 100
  const bids: OrderBookEntry[] = []
  const asks: OrderBookEntry[] = []

  // Generate mock order book data
  for (let i = 0; i < 20; i++) {
    const bidPrice = basePrice * (1 - (i + 1) * 0.001) // Decreasing prices
    const askPrice = basePrice * (1 + (i + 1) * 0.001) // Increasing prices
    const bidAmount = Math.random() * 10 + 0.1
    const askAmount = Math.random() * 10 + 0.1

    bids.push({
      price: bidPrice,
      amount: bidAmount,
      total: bidPrice * bidAmount,
    })

    asks.push({
      price: askPrice,
      amount: askAmount,
      total: askPrice * askAmount,
    })
  }

  return {
    symbol,
    bids,
    asks,
    lastUpdated: new Date(),
  }
}

export async function updateMarketData(symbol: string, price: number, volume: number): Promise<void> {
  const { db } = await connectToDatabase()

  await db.collection("market_data").updateOne(
    { symbol },
    {
      $set: {
        price,
        volume24h: volume,
        lastUpdated: new Date(),
      },
    },
    { upsert: true },
  )
}

export async function getTradeHistory(symbol: string, limit = 50): Promise<any[]> {
  // Mock trade history
  const trades = []
  const basePrice = mockMarketData[symbol.toUpperCase()]?.price || 100

  for (let i = 0; i < limit; i++) {
    trades.push({
      id: `trade_${i}`,
      symbol,
      price: basePrice * (1 + (Math.random() - 0.5) * 0.02),
      amount: Math.random() * 5 + 0.1,
      side: Math.random() > 0.5 ? "buy" : "sell",
      timestamp: new Date(Date.now() - i * 60 * 1000), // 1 minute intervals
    })
  }

  return trades.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export async function fetchTicker24hr(symbol?: string): Promise<MarketData | MarketData[]> {
  return fetchMarketData(symbol)
}

export async function fetchTradingPairs(): Promise<string[]> {
  return Object.keys(mockMarketData)
}

function getIntervalMs(interval: string): number {
  const intervalMap: Record<string, number> = {
    "1m": 60 * 1000,
    "5m": 5 * 60 * 1000,
    "15m": 15 * 60 * 1000,
    "30m": 30 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "4h": 4 * 60 * 60 * 1000,
    "1d": 24 * 60 * 60 * 1000,
    "1w": 7 * 24 * 60 * 60 * 1000,
  }

  return intervalMap[interval] || intervalMap["1h"]
}

// Real-time price updates simulation
export function subscribeToMarketData(symbols: string[], callback: (data: MarketData) => void): () => void {
  const intervals = symbols.map((symbol) => {
    return setInterval(
      () => {
        const data = mockMarketData[symbol.toUpperCase()]
        if (data) {
          const fluctuation = (Math.random() - 0.5) * 0.01 // ±0.5% random change
          const updatedData = {
            ...data,
            price: data.price * (1 + fluctuation),
            lastUpdated: new Date(),
          }
          callback(updatedData)
        }
      },
      2000 + Math.random() * 3000,
    ) // Random interval between 2-5 seconds
  })

  // Return cleanup function
  return () => {
    intervals.forEach((interval) => clearInterval(interval))
  }
}
