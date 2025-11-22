import { useEffect, useRef, useState } from 'react'

import type { NotificationItem } from '@/services/notificationsService'

export type NotificationSocketStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error'

interface UseNotificationSocketOptions {
  enabled: boolean
  onNotification?: (notification: NotificationItem) => void
  onError?: (message: string) => void
}

const DEFAULT_WS_BASE = 'ws://localhost:8000'

export function useNotificationSocket({
  enabled,
  onNotification,
  onError,
}: UseNotificationSocketOptions): NotificationSocketStatus {
  const [status, setStatus] = useState<NotificationSocketStatus>('idle')
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const attemptsRef = useRef(0)
  const wsBase = import.meta.env.VITE_WS_BASE || DEFAULT_WS_BASE
  const callbacksRef = useRef<{
    onNotification?: (notification: NotificationItem) => void
    onError?: (message: string) => void
  }>({ onNotification, onError })

  useEffect(() => {
    callbacksRef.current = { onNotification, onError }
  }, [onNotification, onError])

  useEffect(() => {
    let isActive = true

    const cleanup = () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      if (wsRef.current) {
        try {
          wsRef.current.close(1000, 'Component unmounted')
        } catch (error) {
          console.error('Error closing notification socket:', error)
        }
        wsRef.current = null
      }
    }

    if (!enabled) {
      cleanup()
      setStatus('idle')
      return () => {
        isActive = false
        cleanup()
      }
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('kh_token') : null
    if (!token) {
      setStatus('error')
      callbacksRef.current.onError?.('Missing authentication token. Please log in again.')
      return () => {
        isActive = false
        cleanup()
      }
    }

    attemptsRef.current = 0

    const connect = () => {
      if (!isActive) {
        return
      }
      setStatus('connecting')

      try {
        const ws = new WebSocket(`${wsBase}/ws/notifications/?token=${encodeURIComponent(token)}`)
        wsRef.current = ws

        ws.onopen = () => {
          if (!isActive) {
            return
          }
          attemptsRef.current = 0
          setStatus('open')
        }

        ws.onmessage = (event) => {
          if (!isActive) {
            return
          }

          try {
            const payload = JSON.parse(event.data)
            if (payload?.type === 'notification' && payload.notification) {
              callbacksRef.current.onNotification?.(payload.notification as NotificationItem)
            }
          } catch (error) {
            console.error('Failed to parse notification payload:', error)
            callbacksRef.current.onError?.('Received malformed notification payload.')
          }
        }

        ws.onerror = () => {
          if (!isActive) {
            return
          }
          setStatus('error')
          callbacksRef.current.onError?.('Notification socket encountered an error.')
        }

        ws.onclose = (event) => {
          if (!isActive) {
            return
          }

          wsRef.current = null
          setStatus('closed')

          if (event.code === 1000) {
            return
          }

          if (attemptsRef.current >= 5) {
            callbacksRef.current.onError?.('Unable to reconnect to notification socket.')
            return
          }

          attemptsRef.current += 1
          const delay = Math.min(1000 * attemptsRef.current, 5000)
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        }
      } catch (error) {
        console.error('Unable to create notification socket:', error)
        setStatus('error')
        callbacksRef.current.onError?.('Unable to open notification socket connection.')
      }
    }

    connect()

    return () => {
      isActive = false
      cleanup()
    }
  }, [enabled, wsBase])

  return status
}
