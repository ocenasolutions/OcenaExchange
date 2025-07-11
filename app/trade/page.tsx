import { TradingInterface } from "@/components/trading/trading-interface"

export default function TradePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trade</h1>
        <p className="text-gray-600 dark:text-gray-400">Buy and sell cryptocurrencies</p>
      </div>
      <TradingInterface />
    </div>
  )
}
