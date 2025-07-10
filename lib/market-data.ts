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
}

export interface OrderBookData {
  symbol: string
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
  lastUpdated: Date
}

export interface CandlestickData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface TradeData {
  id: string
  symbol: string
  price: number
  amount: number
  side: "buy" | "sell"
  timestamp: number
}

// Mock market data for demo purposes
const mockMarketData: MarketData[] = [
  {
    symbol: "BTCUSDT",
    price: 45234.56,
    change24h: 1234.56,
    changePercent24h: 2.81,
    volume24h: 28456789.12,
    high24h: 46000.0,
    low24h: 44000.0,
    marketCap: 890000000000,
    lastUpdated: new Date(),
  },
  {
    symbol: "ETHUSDT",
    price: 3045.78,
    change24h: -89.22,
    changePercent24h: -2.85,
    volume24h: 15678901.34,
    high24h: 3150.0,
    low24h: 3000.0,
    marketCap: 365000000000,
    lastUpdated: new Date(),
  },
  {
    symbol: "BNBUSDT",
    price: 312.45,
    change24h: 15.67,
    changePercent24h: 5.28,
    volume24h: 5678901.23,
    high24h: 320.0,
    low24h: 295.0,
    marketCap: 48000000000,
    lastUpdated: new Date(),
  },
  {
    symbol: "ADAUSDT",
    price: 0.4567,
    change24h: 0.0234,
    changePercent24h: 5.41,
    volume24h: 2345678.9,
    high24h: 0.47,
    low24h: 0.43,
    marketCap: 16000000000,
    lastUpdated: new Date(),
  },
  {
    symbol: "DOTUSDT",
    price: 24.78,
    change24h: -1.23,
    changePercent24h: -4.73,
    volume24h: 1234567.89,
    high24h: 26.0,
    low24h: 24.0,
    marketCap: 28000000000,
    lastUpdated: new Date(),
  },
]

export async function fetchMarketData(): Promise<MarketData[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Add some random price fluctuation for demo
  return mockMarketData.map((data) => ({
    ...data,
    price: data.price * (1 + (Math.random() - 0.5) * 0.02), // ±1% random change
    lastUpdated: new Date(),
  }))
}

export async function getMarketData(symbol: string): Promise<MarketData | null> {
  const allData = await fetchMarketData()
  return allData.find((data) => data.symbol === symbol) || null
}

export async function getCandlestickData(symbol: string, interval = "1h"): Promise<CandlestickData[]> {
  // Generate mock candlestick data
  const data: CandlestickData[] = []
  const now = Date.now()
  const intervalMs = 60 * 60 * 1000 // 1 hour

  let basePrice = 45000 // Starting price
  if (symbol.includes("ETH")) basePrice = 3000
  if (symbol.includes("BNB")) basePrice = 300

  for (let i = 99; i >= 0; i--) {
    const timestamp = now - i * intervalMs
    const open = basePrice * (1 + (Math.random() - 0.5) * 0.05)
    const close = open * (1 + (Math.random() - 0.5) * 0.03)
    const high = Math.max(open, close) * (1 + Math.random() * 0.02)
    const low = Math.min(open, close) * (1 - Math.random() * 0.02)
    const volume = Math.random() * 1000000

    data.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume,
    })

    basePrice = close
  }

  return data
}

export async function getOrderBookData(symbol: string): Promise<OrderBookData> {
  const marketData = await getMarketData(symbol)
  const currentPrice = marketData?.price || 45000

  // Generate mock order book data
  const bids: OrderBookEntry[] = []
  const asks: OrderBookEntry[] = []

  // Generate bids (buy orders) below current price
  for (let i = 0; i < 20; i++) {
    const price = currentPrice * (1 - (i + 1) * 0.001) // Decreasing prices
    const amount = Math.random() * 10 + 0.1
    bids.push({ price, amount })
  }

  // Generate asks (sell orders) above current price
  for (let i = 0; i < 20; i++) {
    const price = currentPrice * (1 + (i + 1) * 0.001) // Increasing prices
    const amount = Math.random() * 10 + 0.1
    asks.push({ price, amount })
  }

  return {
    symbol,
    bids,
    asks,
    lastUpdated: new Date(),
  }
}

export async function getTopGainers(): Promise<MarketData[]> {
  const allData = await fetchMarketData()
  return allData
    .filter((data) => data.changePercent24h > 0)
    .sort((a, b) => b.changePercent24h - a.changePercent24h)
    .slice(0, 10)
}

export async function getTopLosers(): Promise<MarketData[]> {
  const allData = await fetchMarketData()
  return allData
    .filter((data) => data.changePercent24h < 0)
    .sort((a, b) => a.changePercent24h - b.changePercent24h)
    .slice(0, 10)
}

export async function searchMarkets(query: string): Promise<MarketData[]> {
  const allData = await fetchMarketData()
  return allData.filter((data) => data.symbol.toLowerCase().includes(query.toLowerCase()))
}

// Real-time data simulation
export function subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): () => void {
  const interval = setInterval(() => {
    const currentData = mockMarketData.find((data) => data.symbol === symbol)
    if (currentData) {
      // Simulate price changes
      const priceChange = (Math.random() - 0.5) * currentData.price * 0.001
      const newPrice = currentData.price + priceChange

      const updatedData: MarketData = {
        ...currentData,
        price: newPrice,
        change24h: currentData.change24h + priceChange,
        changePercent24h:
          ((newPrice - (currentData.price - currentData.change24h)) / (currentData.price - currentData.change24h)) *
          100,
        lastUpdated: new Date(),
      }

      callback(updatedData)
    }
  }, 1000)

  return () => clearInterval(interval)
}

export function subscribeToOrderBook(symbol: string, callback: (data: OrderBookData) => void): () => void {
  const interval = setInterval(async () => {
    const orderBook = await getOrderBookData(symbol)
    callback(orderBook)
  }, 500)

  return () => clearInterval(interval)
}

export function subscribeToTrades(symbol: string, callback: (trades: TradeData[]) => void): () => void {
  const interval = setInterval(async () => {
    const trades = await fetchRecentTrades(symbol, 10)
    callback(trades)
  }, 2000)

  return () => clearInterval(interval)
}

export async function fetchRecentTrades(symbol: string, limit = 50): Promise<TradeData[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  const basePrice = mockMarketData.find((data) => data.symbol === symbol)?.price || 45000
  const trades: TradeData[] = []

  for (let i = 0; i < limit; i++) {
    const price = basePrice + (Math.random() - 0.5) * basePrice * 0.001
    const amount = Math.random() * 5 + 0.01
    const side = Math.random() > 0.5 ? "buy" : "sell"
    const timestamp = Date.now() - i * 1000 * Math.random() * 60

    trades.push({
      id: `trade_${Date.now()}_${i}`,
      symbol,
      price,
      amount,
      side,
      timestamp,
    })
  }

  return trades.sort((a, b) => b.timestamp - a.timestamp)
}

export async function getMarketStats(): Promise<{
  totalMarketCap: number
  total24hVolume: number
  btcDominance: number
  activeMarkets: number
}> {
  const marketData = await fetchMarketData()

  const totalMarketCap = marketData.reduce((sum, market) => sum + (market.marketCap || 0), 0)
  const total24hVolume = marketData.reduce((sum, market) => sum + market.volume24h, 0)
  const btcMarketCap = marketData.find((data) => data.symbol === "BTCUSDT")?.marketCap || 0
  const btcDominance = totalMarketCap > 0 ? (btcMarketCap / totalMarketCap) * 100 : 0

  return {
    totalMarketCap,
    total24hVolume,
    btcDominance,
    activeMarkets: marketData.length,
  }
}
