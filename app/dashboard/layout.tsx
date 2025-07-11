"use client"

import type React from "react"

import { Navigation } from "@/components/layout/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <main className="lg:pl-64">
          <div className="p-4 lg:p-8">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
