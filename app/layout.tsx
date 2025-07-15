import type React from "react"
import type { Metadata } from "next/types"
import ClientLayout from "./ClientLayout"

export const metadata: Metadata = {
  title: "OC Exchange - Cryptocurrency Trading Platform",
  description: "Professional cryptocurrency trading platform with advanced features",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientLayout>{children}</ClientLayout>
}

