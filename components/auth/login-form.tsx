"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Wallet, Mail } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"

declare global {
  interface Window {
    ethereum?: any
  }
}

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isWalletLoading, setIsWalletLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, loginWithWallet } = useAuth()
  const router = useRouter()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await login(email, password)
      if (result.success) {
        router.push("/dashboard")
      } else {
        setError(result.error || "Login failed")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMetaMaskLogin = async () => {
    setIsWalletLoading(true)
    setError("")

    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed")
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found")
      }

      const address = accounts[0]

      // Create a message to sign
      const message = `Sign this message to authenticate with TradePro Exchange.\n\nAddress: ${address}\nTimestamp: ${Date.now()}`

      // Request signature
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, address],
      })

      // Login with wallet
      const result = await loginWithWallet(address, signature, message)
      if (result.success) {
        window.location.href = "/dashboard"
      } else {
        setError(result.error || "Wallet login failed")
      }
    } catch (err: any) {
      console.error("MetaMask login error:", err)
      if (err.code === 4001) {
        setError("User rejected the connection request")
      } else if (err.message.includes("not installed")) {
        setError("MetaMask is not installed. Please install MetaMask to continue.")
      } else {
        setError(err.message || "Failed to connect to MetaMask")
      }
    } finally {
      setIsWalletLoading(false)
    }
  }

  const handleWalletConnect = async () => {
    setError("WalletConnect integration coming soon!")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">Sign in to your account to continue trading</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Wallet Login Options */}
          <div className="space-y-3">
            <Button
              onClick={handleMetaMaskLogin}
              disabled={isWalletLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              size="lg"
            >
              {isWalletLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wallet className="mr-2 h-4 w-4" />
              )}
              Connect with MetaMask
            </Button>

            <Button
              onClick={handleWalletConnect}
              disabled={isWalletLoading}
              variant="outline"
              className="w-full bg-transparent"
              size="lg"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect with WalletConnect
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading} size="lg">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              Sign in with Email
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Button variant="link" className="p-0 h-auto font-normal" onClick={() => router.push("/auth/register")}>
              Sign up
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
