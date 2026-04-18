"use client"

import * as React from "react"

type KeyHandler = (e: KeyboardEvent) => void

interface Shortcut {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
  handler: KeyHandler
  enabled?: boolean
  preventDefault?: boolean
}

function useKeyboard(shortcuts: Shortcut[], deps: React.DependencyList = []) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const s of shortcuts) {
        if (s.enabled === false) continue

        const keyMatch = e.key.toLowerCase() === s.key.toLowerCase()
        const ctrlMatch = !!s.ctrl === (e.ctrlKey || e.metaKey)
        const shiftMatch = !!s.shift === e.shiftKey
        const altMatch = !!s.alt === e.altKey

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          if (s.preventDefault !== false) e.preventDefault()
          s.handler(e)
          return
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export { useKeyboard }
export type { Shortcut }
