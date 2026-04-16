"use client"

import { useState, useRef } from "react"
import type React from "react"

export interface DragGhostState {
  tabId: string
  x: number
  y: number
  overSidebar: boolean
}

export interface TabDragCallbacks {
  onDockToSidebar: (tabId: string) => void
  onDetachTab: (tabId: string, x: number, y: number) => void
}

export interface SidebarDragCallbacks {
  onUndockFromSidebar: (tabId: string) => void
}

export interface UseTabDragReturn {
  dragGhost: DragGhostState | null
  sidebarContainerRef: React.RefObject<HTMLDivElement | null>
  startTabDrag: (
    e: React.MouseEvent,
    tabId: string,
    callbacks: TabDragCallbacks,
  ) => void
  startSidebarDrag: (
    e: React.MouseEvent,
    tabId: string,
    callbacks: SidebarDragCallbacks,
  ) => void
}

function useTabDrag(): UseTabDragReturn {
  const [dragGhost, setDragGhost] = useState<DragGhostState | null>(null)
  const sidebarContainerRef = useRef<HTMLDivElement>(null)

  const startTabDrag = (
    e: React.MouseEvent,
    tabId: string,
    callbacks: TabDragCallbacks,
  ) => {
    if (e.button !== 0) return
    const startX = e.clientX
    const startY = e.clientY
    let dragging = false

    const isOverSidebar = (cx: number, cy: number) => {
      if (!sidebarContainerRef.current) return false
      const r = sidebarContainerRef.current.getBoundingClientRect()
      return cx >= r.left && cx <= r.right + 20 && cy >= r.top && cy <= r.bottom
    }

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      if (!dragging && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        dragging = true
        document.body.style.cursor = "grabbing"
        document.body.style.userSelect = "none"
      }
      if (dragging) {
        const over = isOverSidebar(ev.clientX, ev.clientY)
        setDragGhost({ tabId, x: ev.clientX, y: ev.clientY, overSidebar: over })
      }
    }
    const onUp = (ev: MouseEvent) => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
      if (dragging) {
        const over = isOverSidebar(ev.clientX, ev.clientY)
        if (over) {
          callbacks.onDockToSidebar(tabId)
        } else if (Math.abs(ev.clientY - startY) > 50) {
          callbacks.onDetachTab(tabId, ev.clientX - 100, ev.clientY - 20)
        }
      }
      setDragGhost(null)
    }
    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
  }

  const startSidebarDrag = (
    e: React.MouseEvent,
    tabId: string,
    callbacks: SidebarDragCallbacks,
  ) => {
    if (e.button !== 0) return
    const startX = e.clientX
    const startY = e.clientY
    let dragging = false

    const isOverSidebar = (cx: number, cy: number) => {
      if (!sidebarContainerRef.current) return true
      const r = sidebarContainerRef.current.getBoundingClientRect()
      return (
        cx >= r.left && cx <= r.right + 10 && cy >= r.top && cy <= r.bottom
      )
    }

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      if (!dragging && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        dragging = true
        document.body.style.cursor = "grabbing"
        document.body.style.userSelect = "none"
      }
      if (dragging) {
        const over = isOverSidebar(ev.clientX, ev.clientY)
        setDragGhost({ tabId, x: ev.clientX, y: ev.clientY, overSidebar: over })
      }
    }
    const onUp = (ev: MouseEvent) => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
      if (dragging) {
        const over = isOverSidebar(ev.clientX, ev.clientY)
        if (!over) {
          callbacks.onUndockFromSidebar(tabId)
        }
      }
      setDragGhost(null)
    }
    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
  }

  return {
    dragGhost,
    sidebarContainerRef,
    startTabDrag,
    startSidebarDrag,
  }
}

export { useTabDrag }
