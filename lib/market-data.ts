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
const mockMarketData: Record<string, MarketData> = {
  "BTC/USDT": {
    symbol: "BTC/USDT",
    price: 45234.56,
    change24h: 1234.56,
    changePercent24h: 2.81,
    volume24h: 28456789.12,
    high24h: 46123.45,
    low24h: 43987.23,
    marketCap: 885000000000,
    lastUpdated: new Date(),
  },
  "ETH/USDT": {
    symbol: "ETH/USDT",
    price: 3045.78,
    change24h: -87.23,
    changePercent24h: -2.78,
    volume24h: 15678234.56,
    high24h: 3156.89,
    low24h: 2987.45,
    marketCap: 366000000000,
    lastUpdated: new Date(),
  },
  "BNB/USDT": {
    symbol: "BNB/USDT",
    price: 312.45,
    change24h: 15.67,
    changePercent24h: 5.28,
    volume24h: 5678901.23,
    high24h: 318.92,
    low24h: 298.76,
    marketCap: 48000000000,
    lastUpdated: new Date(),
  },
  "ADA/USDT": {
    symbol: "ADA/USDT",
    price: 0.4567,
    change24h: 0.0234,
    changePercent24h: 5.41,
    volume24h: 2345678.9,
    high24h: 0.4789,
    low24h: 0.4321,
    marketCap: 16000000000,
    lastUpdated: new Date(),
  },
  "SOL/USDT": {
    symbol: "SOL/USDT",
    price: 98.76,
    change24h: -3.45,
    changePercent24h: -3.38,
    volume24h: 3456789.01,
    high24h: 103.21,
    low24h: 95.43,
    marketCap: 42000000000,
    lastUpdated: new Date(),
  },
  "DOT/USDT": {
    symbol: "DOT/USDT",
    price: 24.89,
    change24h: 1.23,
    changePercent24h: 5.2,
    volume24h: 1234567.89,
    high24h: 25.67,
    low24h: 23.45,
    marketCap: 28000000000,
    lastUpdated: new Date(),
  },
  "MATIC/USDT": {
    symbol: "MATIC/USDT",
    price: 1.2345,
    change24h: 0.0678,
    changePercent24h: 5.81,
    volume24h: 4567890.12,
    high24h: 1.2987,
    low24h: 1.1876,
    marketCap: 12000000000,
    lastUpdated: new Date(),
  },
}

export async function fetchMarketData(symbol?: string): Promise<MarketData[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  if (symbol) {
    const data = mockMarketData[symbol]
    return data ? [data] : []
  }

  return Object.values(mockMarketData)
}

export async function fetchOrderBook(symbol: string): Promise<OrderBookData> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 50))

  // Generate mock order book data
  const basePrice = mockMarketData[symbol]?.price || 45000
  const bids: OrderBookEntry[] = []
  const asks: OrderBookEntry[] = []

  // Generate bids (buy orders) - prices below current price
  for (let i = 0; i < 20; i++) {
    const price = basePrice - (i + 1) * (basePrice * 0.001)
    const amount = Math.random() * 10 + 0.1
    const total = price * amount
    bids.push({ price, amount, total })
  }

  // Generate asks (sell orders) - prices above current price
  for (let i = 0; i < 20; i++) {
    const price = basePrice + (i + 1) * (basePrice * 0.001)
    const amount = Math.random() * 10 + 0.1
    const total = price * amount
    asks.push({ price, amount, total })
  }

  return {
    symbol,
    bids,
    asks,
    lastUpdated: new Date(),
  }
}

export async function fetchCandlestickData(symbol: string, interval = "1h", limit = 100): Promise<CandlestickData[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  const basePrice = mockMarketData[symbol]?.price || 45000
  const data: CandlestickData[] = []

  const intervalMs = getIntervalMs(interval)
  const now = Date.now()

  for (let i = limit - 1; i >= 0; i--) {
    const timestamp = now - i * intervalMs
    const open = basePrice + (Math.random() - 0.5) * basePrice * 0.02
    const close = open + (Math.random() - 0.5) * open * 0.03
    const high = Math.max(open, close) + Math.random() * Math.max(open, close) * 0.01
    const low = Math.min(open, close) - Math.random() * Math.min(open, close) * 0.01
    const volume = Math.random() * 1000 + 100

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

export async function fetchRecentTrades(symbol: string, limit = 50): Promise<TradeData[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  const basePrice = mockMarketData[symbol]?.price || 45000
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
  const btcMarketCap = mockMarketData["BTC/USDT"]?.marketCap || 0
  const btcDominance = totalMarketCap > 0 ? (btcMarketCap / totalMarketCap) * 100 : 0

  return {
    totalMarketCap,
    total24hVolume,
    btcDominance,
    activeMarkets: marketData.length,
  }
}

function getIntervalMs(interval: string): number {
  const intervals: Record<string, number> = {
    "1m": 60 * 1000,
    "5m": 5 * 60 * 1000,
    "15m": 15 * 60 * 1000,
    "30m": 30 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "4h": 4 * 60 * 60 * 1000,
    "1d": 24 * 60 * 60 * 1000,
    "1w": 7 * 24 * 60 * 60 * 1000,
  }

  return intervals[interval] || intervals["1h"]
}

// Real-time data simulation
export function subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): () => void {
  const interval = setInterval(() => {
    const currentData = mockMarketData[symbol]
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

      mockMarketData[symbol] = updatedData
      callback(updatedData)
    }
  }, 1000)

  return () => clearInterval(interval)
}

export function subscribeToOrderBook(symbol: string, callback: (data: OrderBookData) => void): () => void {
  const interval = setInterval(async () => {
    const orderBook = await fetchOrderBook(symbol)
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
