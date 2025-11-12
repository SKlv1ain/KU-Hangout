import { useEffect, useRef, useState, useCallback } from 'react'

interface WebSocketMessage {
  type?: string
  status?: string
  message?: string
  error?: string
  message_id?: number
  user?: string
  user_id?: number
  messages?: Array<{
    id: number
    user: string
    user_id: number
    message: string
    timestamp: string
  }>
  timestamp?: string
}

interface UseWebSocketOptions {
  planId: string | number | null
  onMessage?: (message: WebSocketMessage) => void
  onError?: (error: string) => void
  onConnect?: () => void
  onDisconnect?: () => void
}

export function useWebSocket({
  planId,
  onMessage,
  onError,
  onConnect,
  onDisconnect,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const BASE_WS_URL = import.meta.env.VITE_WS_BASE || 'ws://localhost:8000'

  const connect = useCallback(() => {
    if (!planId) {
      return
    }

    // Get JWT token from localStorage
    const token = localStorage.getItem('kh_token')
    if (!token) {
      onError?.('No authentication token found. Please login.')
      return
    }

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close()
    }

    setConnectionStatus('connecting')

    try {
      // Build WebSocket URL with token in query parameter
      const wsUrl = `${BASE_WS_URL}/ws/plan/${planId}/?token=${encodeURIComponent(token)}`
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setConnectionStatus('connected')
        reconnectAttempts.current = 0
        onConnect?.()
      }

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data)
          
          // Handle errors
          if (data.error) {
            console.error('WebSocket error:', data.error)
            onError?.(data.error)
            return
          }

          // Handle connection status
          if (data.status === 'connected') {
            console.log('WebSocket connection confirmed:', data.message)
            return
          }

          // Handle chat history
          if (data.type === 'chat_history') {
            console.log('Received chat history:', data.messages)
            onMessage?.(data)
            return
          }

          // Handle new messages
          if (data.type === 'new_message') {
            console.log('Received new message:', data)
            onMessage?.(data)
            return
          }

          // Handle other message types
          onMessage?.(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
          onError?.('Failed to parse message')
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionStatus('error')
        onError?.('WebSocket connection error')
      }

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason)
        setIsConnected(false)
        setConnectionStatus('disconnected')
        onDisconnect?.()

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000) // Exponential backoff, max 30s
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          onError?.('Failed to reconnect after multiple attempts')
        }
      }

      wsRef.current = ws
    } catch (error) {
      console.error('Error creating WebSocket:', error)
      setConnectionStatus('error')
      onError?.('Failed to create WebSocket connection')
    }
  }, [planId, BASE_WS_URL, onMessage, onError, onConnect, onDisconnect])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect')
      wsRef.current = null
    }
    
    setIsConnected(false)
    setConnectionStatus('disconnected')
    reconnectAttempts.current = 0
  }, [])

  const sendMessage = useCallback((message: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      onError?.('WebSocket is not connected')
      return false
    }

    try {
      wsRef.current.send(JSON.stringify({
        action: 'send_message',
        message: message.trim()
      }))
      return true
    } catch (error) {
      console.error('Error sending message:', error)
      onError?.('Failed to send message')
      return false
    }
  }, [onError])

  // Connect when planId changes
  useEffect(() => {
    if (planId) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [planId, connect, disconnect])

  return {
    isConnected,
    connectionStatus,
    sendMessage,
    connect,
    disconnect,
  }
}

