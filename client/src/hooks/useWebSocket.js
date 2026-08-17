import { useEffect, useRef, useState, useCallback } from 'react'

export function useWebSocket(url) {
  const [lastMessage, setLastMessage] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const ws = useRef(null)
  const reconnectTimeout = useRef(null)

  const connect = useCallback(() => {
    ws.current = new WebSocket(url)
    ws.current.onopen = () => setIsConnected(true)
    ws.current.onclose = () => {
      setIsConnected(false)
      reconnectTimeout.current = setTimeout(connect, 3000)
    }
    ws.current.onerror = () => ws.current.close()
    ws.current.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        setLastMessage(parsed)
      } catch {}
    }
  }, [url])

  useEffect(() => {
    connect()
    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current)
      if (ws.current) ws.current.close()
    }
  }, [connect])

  return { lastMessage, isConnected }
}
