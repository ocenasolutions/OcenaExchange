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

export interface OrderBookEntry {
  price: number
  amount: number
  total: number
}

export interface OrderBook {
  symbol: string
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
  lastUpdated: Date
}

export interface CandlestickData {
  symbol: string
  interval: string
  openTime: Date
  closeTime: Date
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Mock data for development
const mockMarketData: MarketData[] = [
  {
    symbol: "BTCUSDT",
    price: 43250.75,
    change24h: 1250.25,
    changePercent24h: 2.98,
    volume24h: 28450000,
    high24h: 44100.0,
    low24h: 41800.5,
    marketCap: 847000000000,
    lastUpdated: new Date(),
  },
  {
    symbol: "ETHUSDT",
    price: 2650.45,
    change24h: -85.32,
    changePercent24h: -3.12,
    volume24h: 15200000,
    high24h: 2750.8,
    low24h: 2580.2,
    marketCap: 318000000000,
    lastUpdated: new Date(),
  },
  {
    symbol: "BNBUSDT",
    price: 315.67,
    change24h: 12.45,
    changePercent24h: 4.1,
    volume24h: 890000,
    high24h: 325.8,
    low24h: 298.5,
    marketCap: 47000000000,
    lastUpdated: new Date(),
  },
  {
    symbol: "ADAUSDT",
    price: 0.485,
    change24h: 0.025,
    changePercent24h: 5.43,
    volume24h: 450000,
    high24h: 0.495,
    low24h: 0.445,
    marketCap: 17000000000,
    lastUpdated: new Date(),
  },
  {
    symbol: "DOTUSDT",
    price: 7.25,
    change24h: -0.35,
    changePercent24h: -4.61,
    volume24h: 125000,
    high24h: 7.85,
    low24h: 7.05,
    marketCap: 9500000000,
    lastUpdated: new Date(),
  },
]

export async function fetchMarketData(): Promise<MarketData[]> {
  // In a real application, this would fetch from external APIs
  // For now, return mock data with some randomization
  return mockMarketData.map((data) => ({
    ...data,
    price: data.price * (0.98 + Math.random() * 0.04), // ±2% variation
    change24h: data.change24h * (0.8 + Math.random() * 0.4), // ±20% variation
    changePercent24h: data.changePercent24h * (0.8 + Math.random() * 0.4),
    volume24h: data.volume24h * (0.9 + Math.random() * 0.2), // ±10% variation
    lastUpdated: new Date(),
  }))
}

export async function getMarketData(symbol?: string): Promise<MarketData[]> {
  const { db } = await connectToDatabase()

  try {
    const filter = symbol ? { symbol } : {}
    const data = (await db.collection("market_data").find(filter).toArray()) as MarketData[]

    if (data.length === 0) {
      // If no data in database, return mock data
      const mockData = await fetchMarketData()
      if (symbol) {
        return mockData.filter((d) => d.symbol === symbol)
      }
      return mockData
    }

    return data
  } catch (error) {
    console.error("Error fetching market data:", error)
    // Fallback to mock data
    const mockData = await fetchMarketData()
    if (symbol) {
      return mockData.filter((d) => d.symbol === symbol)
    }
    return mockData
  }
}

export async function updateMarketData(data: MarketData[]): Promise<void> {
  const { db } = await connectToDatabase()

  for (const item of data) {
    await db
      .collection("market_data")
      .updateOne({ symbol: item.symbol }, { $set: { ...item, lastUpdated: new Date() } }, { upsert: true })
  }
}

export async function getOrderBook(symbol: string): Promise<OrderBook> {
  const { db } = await connectToDatabase()

  try {
    // Get orders from database
    const buyOrders = await db
      .collection("orders")
      .find({ symbol, type: "buy", status: "pending" })
      .sort({ price: -1 })
      .limit(20)
      .toArray()

    const sellOrders = await db
      .collection("orders")
      .find({ symbol, type: "sell", status: "pending" })
      .sort({ price: 1 })
      .limit(20)
      .toArray()

    // Convert to order book format
    const bids: OrderBookEntry[] = buyOrders.map((order, index) => ({
      price: order.price || 0,
      amount: order.amount,
      total: buyOrders.slice(0, index + 1).reduce((sum, o) => sum + o.amount, 0),
    }))

    const asks: OrderBookEntry[] = sellOrders.map((order, index) => ({
      price: order.price || 0,
      amount: order.amount,
      total: sellOrders.slice(0, index + 1).reduce((sum, o) => sum + o.amount, 0),
    }))

    return {
      symbol,
      bids,
      asks,
      lastUpdated: new Date(),
    }
  } catch (error) {
    console.error("Error fetching order book:", error)
    // Return mock order book
    return {
      symbol,
      bids: [
        { price: 43200, amount: 0.5, total: 0.5 },
        { price: 43150, amount: 1.2, total: 1.7 },
        { price: 43100, amount: 0.8, total: 2.5 },
      ],
      asks: [
        { price: 43300, amount: 0.7, total: 0.7 },
        { price: 43350, amount: 1.1, total: 1.8 },
        { price: 43400, amount: 0.9, total: 2.7 },
      ],
      lastUpdated: new Date(),
    }
  }
}

export async function getCandlestickData(symbol: string, interval = "1h", limit = 100): Promise<CandlestickData[]> {
  // Mock candlestick data for development
  const data: CandlestickData[] = []
  const basePrice = 43000
  let currentPrice = basePrice

  for (let i = limit; i > 0; i--) {
    const openTime = new Date(Date.now() - i * 60 * 60 * 1000) // 1 hour intervals
    const closeTime = new Date(openTime.getTime() + 60 * 60 * 1000)

    const open = currentPrice
    const change = (Math.random() - 0.5) * 1000 // ±500 price change
    const close = open + change
    const high = Math.max(open, close) + Math.random() * 200
    const low = Math.min(open, close) - Math.random() * 200
    const volume = Math.random() * 1000

    data.push({
      symbol,
      interval,
      openTime,
      closeTime,
      open,
      high,
      low,
      close,
      volume,
    })

    currentPrice = close
  }

  return data
}

export async function getTopGainers(limit = 10): Promise<MarketData[]> {
  const marketData = await fetchMarketData()
  return marketData
    .filter((data) => data.changePercent24h > 0)
    .sort((a, b) => b.changePercent24h - a.changePercent24h)
    .slice(0, limit)
}

export async function getTopLosers(limit = 10): Promise<MarketData[]> {
  const marketData = await fetchMarketData()
  return marketData
    .filter((data) => data.changePercent24h < 0)
    .sort((a, b) => a.changePercent24h - b.changePercent24h)
    .slice(0, limit)
}

export async function searchMarkets(query: string): Promise<MarketData[]> {
  const marketData = await fetchMarketData()
  return marketData.filter((data) => data.symbol.toLowerCase().includes(query.toLowerCase()))
}
