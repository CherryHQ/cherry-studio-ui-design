"use client"

import { useState, useCallback } from "react"
import type React from "react"

export interface FloatingWindowData {
  /** Unique window identifier */
  id: string
  /** Window title */
  title: string
  /** Optional icon element */
  icon?: React.ReactNode
  /** Horizontal position (px) */
  x: number
  /** Vertical position (px) */
  y: number
  /** Window width (px) */
  width: number
  /** Window height (px) */
  height: number
}

export interface DetachableItem {
  /** Unique identifier */
  id: string
  /** Display title */
  title: string
  /** Optional icon element */
  icon?: React.ReactNode
  /** Whether this item can be detached */
  closeable?: boolean
}

export interface UseFloatingWindowsReturn {
  /** Currently detached floating windows */
  windows: FloatingWindowData[]
  /** Detach an item into a floating window */
  detach: (
    itemId: string,
    x: number,
    y: number,
    items: DetachableItem[],
    onRemove: (remaining: DetachableItem[]) => void,
  ) => void
  /** Reattach a floating window, returns the item data */
  reattach: (windowId: string) => DetachableItem | null
  /** Close a floating window */
  close: (windowId: string) => void
}

function useFloatingWindows(): UseFloatingWindowsReturn {
  const [windows, setWindows] = useState<FloatingWindowData[]>([])

  const detach = useCallback(
    (
      itemId: string,
      x: number,
      y: number,
      items: DetachableItem[],
      onRemove: (remaining: DetachableItem[]) => void,
    ) => {
      const item = items.find((i) => i.id === itemId)
      if (!item || !item.closeable) return
      setWindows((prev) => [
        ...prev,
        {
          id: `w-${itemId}`,
          title: item.title,
          icon: item.icon,
          x,
          y,
          width: 480,
          height: 360,
        },
      ])
      const remaining = items.filter((i) => i.id !== itemId)
      onRemove(remaining)
    },
    [],
  )

  const reattach = useCallback(
    (windowId: string): DetachableItem | null => {
      const win = windows.find((w) => w.id === windowId)
      if (!win) return null
      setWindows((prev) => prev.filter((w) => w.id !== windowId))
      return {
        id: `t${Date.now()}`,
        title: win.title,
        icon: win.icon,
      }
    },
    [windows],
  )

  const close = useCallback((windowId: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== windowId))
  }, [])

  return {
    windows,
    detach,
    reattach,
    close,
  }
}

export { useFloatingWindows }
