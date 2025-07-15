"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { WalletInterface } from "@/components/wallet/wallet-interface"

export default function WalletPage() {
  return (
    <ProtectedRoute>
      <div className="flex-1 p-4 lg:p-6">
        <WalletInterface />
      </div>
    </ProtectedRoute>
  )
}
