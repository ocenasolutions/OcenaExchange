"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { AuthProvider } from "@/components/providers/auth-provider"
import { WebSocketProvider } from "@/components/providers/websocket-provider"
import { Toaster } from "@/components/ui/toaster"
import { Navigation } from "@/components/layout/navigation"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()

  // Define paths where navigation should NOT appear
  const noNavPaths = ["/", "/auth/login", "/auth/register"]
  const showNavigation = !noNavPaths.includes(pathname)

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <WebSocketProvider>
              {showNavigation && <Navigation />}
              <main className="flex-1">{children}</main>
              <Toaster />
            </WebSocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
