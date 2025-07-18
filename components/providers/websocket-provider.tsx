"use client"

import type React from "react"
import { createContext, useContext, useRef, useCallback, useEffect } from "react"

interface WebSocketContextType {
  subscribe: (channel: string, callback: (data: any) => void) => void
  unsubscribe: (channel: string) => void
  isConnected: boolean
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null)
  const subscriptionsRef = useRef<Map<string, (data: any) => void>>(new Map())
  const isConnectedRef = useRef(false)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080"
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        console.log("WebSocket connected")
        isConnectedRef.current = true
      }

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          const callback = subscriptionsRef.current.get(data.channel)
          if (callback) {
            callback(data)
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      wsRef.current.onclose = () => {
        console.log("WebSocket disconnected")
        isConnectedRef.current = false
        // Attempt to reconnect after 3 seconds
        setTimeout(connect, 3000)
      }

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error)
        isConnectedRef.current = false
      }
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error)
    }
  }, [])

  const subscribe = useCallback((channel: string, callback: (data: any) => void) => {
    subscriptionsRef.current.set(channel, callback)

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "subscribe", channel }))
    }
  }, [])

  const unsubscribe = useCallback((channel: string) => {
    subscriptionsRef.current.delete(channel)

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "unsubscribe", channel }))
    }
  }, [])

  useEffect(() => {
    connect()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connect])

  const contextValue: WebSocketContextType = {
    subscribe,
    unsubscribe,
    isConnected: isConnectedRef.current,
  }

  return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider")
  }
  return context
}
