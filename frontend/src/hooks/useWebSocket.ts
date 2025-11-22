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
  const isManualDisconnect = useRef(false)

  // Store callbacks in refs to avoid recreating connect/disconnect on every render
  const callbacksRef = useRef({ onMessage, onError, onConnect, onDisconnect })
  
  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = { onMessage, onError, onConnect, onDisconnect }
  }, [onMessage, onError, onConnect, onDisconnect])

  const BASE_WS_URL = import.meta.env.VITE_WS_BASE || 'ws://localhost:8000'

  const connect = useCallback(() => {
    if (!planId) {
      return
    }

    // Prevent multiple simultaneous connection attempts
    if (wsRef.current) {
      const currentState = wsRef.current.readyState
      // If already connecting or connected, don't create another connection
      if (currentState === WebSocket.CONNECTING || currentState === WebSocket.OPEN) {
        const currentUrl = wsRef.current.url
        if (currentUrl.includes(`/ws/plan/${planId}/`)) {
          console.log('WebSocket connection already in progress or connected, skipping')
          return
        }
      }
      // Close existing connection if it's for a different plan or closed
      wsRef.current.close()
    }

    // Get JWT token from localStorage
    const token = localStorage.getItem('kh_token')
    if (!token) {
      callbacksRef.current.onError?.('No authentication token found. Please login.')
      return
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
        isManualDisconnect.current = false
        // Clear any pending reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
          reconnectTimeoutRef.current = null
        }
        callbacksRef.current.onConnect?.()
      }

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data)
          
          // Handle errors - backend sends error before closing connection
          if (data.error) {
            console.error('WebSocket error from server:', data.error)
            setConnectionStatus('error')
            callbacksRef.current.onError?.(data.error)
            // Close connection if error received
            ws.close(1008, data.error)
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
            callbacksRef.current.onMessage?.(data)
            return
          }

          // Handle new messages
          if (data.type === 'new_message') {
            console.log('Received new message:', data)
            callbacksRef.current.onMessage?.(data)
            return
          }

          // Handle other message types
          callbacksRef.current.onMessage?.(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
          callbacksRef.current.onError?.('Failed to parse message')
        }
      }

      ws.onerror = (error) => {
        // Only log error if not already closing/closed
        // Error event doesn't provide much info, wait for onclose for details
        if (ws.readyState !== WebSocket.CLOSING && ws.readyState !== WebSocket.CLOSED) {
          console.error('WebSocket error event:', error)
          setConnectionStatus('error')
        }
      }

      ws.onclose = (event) => {
        // Only log if it's not a normal closure or manual disconnect
        if (event.code !== 1000 && !isManualDisconnect.current) {
          console.log('WebSocket closed:', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
            readyState: ws.readyState
          })
        }
        
        setIsConnected(false)
        setConnectionStatus('disconnected')
        
        // Don't show error or reconnect if it's a manual disconnect
        if (isManualDisconnect.current || event.code === 1000) {
          isManualDisconnect.current = false
          reconnectAttempts.current = 0
          callbacksRef.current.onDisconnect?.()
          return
        }

        // For code 1006 (abnormal closure), don't call onDisconnect immediately
        // as it might be a temporary issue and we'll reconnect
        if (event.code === 1006 && reconnectAttempts.current === 0) {
          // First disconnect with 1006, might be normal reconnection, don't show error yet
          // Don't call onDisconnect to avoid showing "disconnected" message
        } else {
          callbacksRef.current.onDisconnect?.()
        }

        // Determine error message based on close code
        let errorMessage = 'WebSocket connection closed'
        if (event.code === 1006) {
          // 1006 can happen during normal reconnection, only show if we've tried multiple times
          if (reconnectAttempts.current === 0) {
            // First disconnect, might be normal reconnection, don't show error yet
            // Will attempt to reconnect silently
          } else {
            errorMessage = 'Connection closed unexpectedly. Please check your network connection and try again.'
          }
        } else if (event.code === 1002) {
          errorMessage = 'Protocol error. Please refresh the page.'
        } else if (event.code === 1003) {
          errorMessage = 'Invalid data received. Please refresh the page.'
        } else if (event.code === 1008) {
          errorMessage = event.reason || 'Policy violation. Please check your authentication token.'
        } else if (event.code >= 4000 && event.code < 5000) {
          // Custom error codes from backend
          errorMessage = event.reason || 'Connection rejected by server. Please check your authentication.'
        } else if (event.code !== 1000) {
          errorMessage = `Connection closed with code ${event.code}. ${event.reason || 'Please try again.'}`
        }

        // Only show error if not a normal closure and not the first 1006 disconnect
        if (event.code !== 1000 && !(event.code === 1006 && reconnectAttempts.current === 0)) {
          callbacksRef.current.onError?.(errorMessage)
        }

        // Attempt to reconnect if not a normal closure and not a client-initiated close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000) // Exponential backoff, max 30s
          // Only log reconnect attempts if it's not the first attempt
          if (reconnectAttempts.current > 1) {
            console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`)
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          callbacksRef.current.onError?.('Failed to reconnect after multiple attempts. Please refresh the page.')
        }
      }

      wsRef.current = ws
    } catch (error) {
      console.error('Error creating WebSocket:', error)
      setConnectionStatus('error')
      callbacksRef.current.onError?.('Failed to create WebSocket connection')
    }
  }, [planId, BASE_WS_URL]) // Only depend on planId and BASE_WS_URL, callbacks are in ref

  const disconnect = useCallback(() => {
    isManualDisconnect.current = true
    
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
      callbacksRef.current.onError?.('WebSocket is not connected')
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
      callbacksRef.current.onError?.('Failed to send message')
      return false
    }
  }, [])

  const sendAction = useCallback((payload: Record<string, unknown>) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      callbacksRef.current.onError?.('WebSocket is not connected')
      return false
    }

    try {
      wsRef.current.send(JSON.stringify(payload))
      return true
    } catch (error) {
      console.error('Error sending action:', error)
      callbacksRef.current.onError?.('Failed to send action')
      return false
    }
  }, [])

  // Connect when planId changes
  useEffect(() => {
    if (!planId) {
      disconnect()
      return
    }

    // Only connect if not already connected to the same plan
    if (wsRef.current) {
      const currentState = wsRef.current.readyState
      // If already connecting or connected to the same plan, skip
      if (currentState === WebSocket.CONNECTING || currentState === WebSocket.OPEN) {
        const currentUrl = wsRef.current.url
        if (currentUrl.includes(`/ws/plan/${planId}/`)) {
          console.log('WebSocket already connected/connecting to this plan, skipping reconnect')
          return
        }
      }
    }

    // Small delay to prevent rapid reconnections
    const connectTimeout = setTimeout(() => {
      connect()
    }, 100)

    return () => {
      clearTimeout(connectTimeout)
      disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]) // Only depend on planId, connect/disconnect are stable

  return {
    isConnected,
    connectionStatus,
    sendMessage,
    connect,
    disconnect,
    sendAction,
  }
}
