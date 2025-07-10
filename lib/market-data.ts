export interface MarketData {
  symbol: string
  price: number
  change24h: number
  changePercent24h: number
  volume24h: number
  high24h: number
  low24h: number
  marketCap: number
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
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Mock market data - in a real application, this would come from external APIs
const mockMarketData: Record<string, MarketData> = {
  "BTC/USDT": {
    symbol: "BTC/USDT",
    price: 43250.75,
    change24h: 1250.3,
    changePercent24h: 2.98,
    volume24h: 28450000,
    high24h: 43800.0,
    low24h: 41900.5,
    marketCap: 847000000000,
    lastUpdated: new Date(),
  },
  "ETH/USDT": {
    symbol: "ETH/USDT",
    price: 2650.4,
    change24h: -85.2,
    changePercent24h: -3.11,
    volume24h: 15200000,
    high24h: 2750.8,
    low24h: 2620.15,
    marketCap: 318000000000,
    lastUpdated: new Date(),
  },
  "BNB/USDT": {
    symbol: "BNB/USDT",
    price: 315.8,
    change24h: 12.45,
    changePercent24h: 4.1,
    volume24h: 890000,
    high24h: 320.5,
    low24h: 298.2,
    marketCap: 47000000000,
    lastUpdated: new Date(),
  },
}

export async function getMarketData(symbol?: string): Promise<MarketData | MarketData[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  if (symbol) {
    const data = mockMarketData[symbol]
    if (!data) {
      throw new Error(`Market data not found for symbol: ${symbol}`)
    }
    return data
  }

  return Object.values(mockMarketData)
}

export async function getOrderBook(symbol: string): Promise<OrderBook> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Generate mock order book data
  const basePrice = mockMarketData[symbol]?.price || 50000
  const bids: OrderBookEntry[] = []
  const asks: OrderBookEntry[] = []

  // Generate bids (buy orders) - prices below current price
  for (let i = 0; i < 20; i++) {
    const price = basePrice - (i + 1) * (basePrice * 0.0001)
    const amount = Math.random() * 10 + 0.1
    bids.push({
      price: Number(price.toFixed(2)),
      amount: Number(amount.toFixed(4)),
      total: Number((price * amount).toFixed(2)),
    })
  }

  // Generate asks (sell orders) - prices above current price
  for (let i = 0; i < 20; i++) {
    const price = basePrice + (i + 1) * (basePrice * 0.0001)
    const amount = Math.random() * 10 + 0.1
    asks.push({
      price: Number(price.toFixed(2)),
      amount: Number(amount.toFixed(4)),
      total: Number((price * amount).toFixed(2)),
    })
  }

  return {
    symbol,
    bids,
    asks,
    lastUpdated: new Date(),
  }
}

export async function getCandlestickData(symbol: string, interval = "1h", limit = 100): Promise<CandlestickData[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  const basePrice = mockMarketData[symbol]?.price || 50000
  const data: CandlestickData[] = []
  const now = Date.now()
  const intervalMs = getIntervalMs(interval)

  for (let i = limit - 1; i >= 0; i--) {
    const timestamp = now - i * intervalMs
    const open = basePrice + (Math.random() - 0.5) * basePrice * 0.02
    const close = open + (Math.random() - 0.5) * open * 0.01
    const high = Math.max(open, close) + Math.random() * Math.max(open, close) * 0.005
    const low = Math.min(open, close) - Math.random() * Math.min(open, close) * 0.005
    const volume = Math.random() * 1000 + 100

    data.push({
      timestamp,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Number(volume.toFixed(2)),
    })
  }

  return data
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
  }

  return intervals[interval] || intervals["1h"]
}

export async function getTopMovers(): Promise<MarketData[]> {
  const allData = (await getMarketData()) as MarketData[]
  return allData.sort((a, b) => Math.abs(b.changePercent24h) - Math.abs(a.changePercent24h))
}

export async function searchMarkets(query: string): Promise<MarketData[]> {
  const allData = (await getMarketData()) as MarketData[]
  return allData.filter((market) => market.symbol.toLowerCase().includes(query.toLowerCase()))
}
