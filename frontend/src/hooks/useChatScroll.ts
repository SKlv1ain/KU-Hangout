import { useEffect, useRef } from "react"

interface UseChatScrollOptions {
  enabled?: boolean
  dependencies?: unknown[]
}

export function useChatScroll<T extends HTMLElement>({ enabled = true, dependencies = [] }: UseChatScrollOptions = {}) {
  const containerRef = useRef<T | null>(null)

  const scrollToBottom = () => {
    if (!enabled || !containerRef.current) return
    const node = containerRef.current
    node.scrollTop = node.scrollHeight
  }

  useEffect(() => {
    scrollToBottom()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  return { containerRef, scrollToBottom }
}
