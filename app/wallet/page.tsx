import { WalletInterface } from "@/components/wallet/wallet-interface"

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Wallet</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your cryptocurrency assets</p>
      </div>
      <WalletInterface />
    </div>
  )
}
