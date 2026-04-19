"use client"

import { useState, useEffect, useCallback } from "react"
import type React from "react"

export interface Tab {
  /** Unique identifier */
  id: string
  /** Display label */
  label: string
  /** Optional icon element */
  icon?: React.ReactNode
  /** Whether the tab is pinned */
  isPinned?: boolean
  /** Whether the tab is currently active */
  isActive?: boolean
  /** Whether the tab can be closed */
  closeable?: boolean
  /** Whether the tab is docked in the sidebar */
  isSidebarDocked?: boolean
  /** Arbitrary metadata */
  meta?: Record<string, unknown>
}

export interface UseTabsOptions {
  /** Initial tabs to show */
  defaultTabs?: Tab[]
  /** Default active tab id */
  defaultActiveId?: string
  /** Persistence key for localStorage (set to null to disable persistence) */
  storageKey?: string | null
  /** Multi-instance item IDs that allow duplicate tabs */
  multiInstanceIds?: string[]
}

export interface UseTabsReturn {
  /** Current list of tabs */
  tabs: Tab[]
  /** Set tabs directly */
  setTabs: React.Dispatch<React.SetStateAction<Tab[]>>
  /** Currently active tab id */
  activeTabId: string
  /** Set the active tab */
  setActiveTabId: React.Dispatch<React.SetStateAction<string>>
  /** Close a tab by id */
  closeTab: (id: string) => void
  /** Add a new tab */
  addTab: (tab: Tab) => void
  /** Pin or unpin a tab */
  togglePin: (tabId: string) => void
  /** Dock a tab to the sidebar */
  dockToSidebar: (tabId: string) => void
  /** Undock a tab from the sidebar */
  undockFromSidebar: (tabId: string) => void
  /** Tabs currently docked in the sidebar */
  dockedTabs: Tab[]
}

function useTabs(options: UseTabsOptions = {}): UseTabsReturn {
  const {
    defaultTabs = [],
    defaultActiveId,
    storageKey = null,
    multiInstanceIds = [],
  } = options

  const loadTabs = (): Tab[] => {
    if (storageKey) {
      try {
        const json = localStorage.getItem(storageKey)
        if (json) {
          const parsed = JSON.parse(json)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch {
        /* ignore */
      }
    }
    return defaultTabs
  }

  const loadActiveId = (): string => {
    if (storageKey) {
      try {
        const id = localStorage.getItem(`${storageKey}-active`)
        if (id) return id
      } catch {
        /* ignore */
      }
    }
    return defaultActiveId ?? (defaultTabs[0]?.id ?? "")
  }

  const [tabs, setTabs] = useState<Tab[]>(loadTabs)
  const [activeTabId, setActiveTabId] = useState(loadActiveId)

  // Persist to localStorage
  useEffect(() => {
    if (!storageKey) return
    try {
      // Strip icon (non-serializable) before saving
      const serializable = tabs.map(({ icon, ...rest }) => rest)
      localStorage.setItem(storageKey, JSON.stringify(serializable))
    } catch {
      /* ignore */
    }
  }, [tabs, storageKey])

  useEffect(() => {
    if (!storageKey) return
    try {
      localStorage.setItem(`${storageKey}-active`, activeTabId)
    } catch {
      /* ignore */
    }
  }, [activeTabId, storageKey])

  const closeTab = useCallback(
    (id: string) => {
      setTabs((prev) => {
        const newTabs = prev.filter((t) => t.id !== id)
        if (activeTabId === id && newTabs.length > 0) {
          const closeable = newTabs.filter((t) => t.closeable)
          setActiveTabId(
            closeable.length > 0
              ? closeable[closeable.length - 1].id
              : newTabs[0].id,
          )
        }
        return newTabs
      })
    },
    [activeTabId],
  )

  const addTab = useCallback(
    (tab: Tab) => {
      // For non-multi-instance items, switch to existing tab if present
      if (tab.meta?.menuItemId && !multiInstanceIds.includes(tab.meta.menuItemId as string)) {
        const existing = tabs.find(
          (t) => t.meta?.menuItemId === tab.meta?.menuItemId,
        )
        if (existing) {
          setActiveTabId(existing.id)
          return
        }
      }
      setTabs((prev) => [...prev, tab])
      setActiveTabId(tab.id)
    },
    [tabs, multiInstanceIds],
  )

  const togglePin = useCallback((tabId: string) => {
    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.id === tabId)
      if (idx === -1) return prev
      const tab = prev[idx]
      const updated = { ...tab, isPinned: !tab.isPinned }
      const rest = prev.filter((_, i) => i !== idx)
      let lastPinned = -1
      for (let i = rest.length - 1; i >= 0; i--) {
        if (rest[i].isPinned) { lastPinned = i; break }
      }
      const insertAt = lastPinned + 1
      return [...rest.slice(0, insertAt), updated, ...rest.slice(insertAt)]
    })
  }, [])

  const dockToSidebar = useCallback((tabId: string) => {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === tabId ? { ...t, isSidebarDocked: true, isPinned: false } : t,
      ),
    )
  }, [])

  const undockFromSidebar = useCallback((tabId: string) => {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === tabId ? { ...t, isSidebarDocked: false } : t,
      ),
    )
  }, [])

  const dockedTabs = tabs.filter((t) => t.isSidebarDocked)

  return {
    tabs,
    setTabs,
    activeTabId,
    setActiveTabId,
    closeTab,
    addTab,
    togglePin,
    dockToSidebar,
    undockFromSidebar,
    dockedTabs,
  }
}

export { useTabs }
