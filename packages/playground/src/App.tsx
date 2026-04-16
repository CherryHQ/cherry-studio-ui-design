import React, { useState, useEffect, useCallback } from "react"
import { Toaster } from "@cherry-studio/ui"
import { Sidebar } from "./components/Sidebar"
import { ThemePanel } from "./components/ThemePanel"
import { demos } from "./demos"

export function App() {
  const [active, setActive] = useState(() => {
    const hash = window.location.hash.slice(1)
    return hash && demos.find((d) => d.id === hash) ? hash : demos[0].id
  })
  const [dark, setDark] = useState(false)
  const activeDemo = demos.find((d) => d.id === active)

  // URL hash routing
  const setActiveDemo = useCallback((id: string) => {
    setActive(id)
    window.location.hash = id
  }, [])

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (hash && demos.find((d) => d.id === hash)) {
        setActive(hash)
      }
    }
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  // Toggle dark mode — single source of truth on <html>
  const toggleDark = useCallback(() => {
    // Disable all CSS transitions during theme switch to prevent flash
    const css = document.createElement("style")
    css.textContent = "*, *::before, *::after { transition: none !important; }"
    document.head.appendChild(css)

    setDark((prev) => {
      const next = !prev
      if (next) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
      return next
    })

    // Re-enable transitions after a frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.head.removeChild(css)
      })
    })
  }, [])

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Left: Sidebar */}
      <Sidebar
        demos={demos}
        active={active}
        onSelect={setActiveDemo}
        dark={dark}
        onToggleDark={toggleDark}
      />

      {/* Center: Preview */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="mb-6">
            <h1 className="text-xl font-semibold mb-1">{activeDemo?.title}</h1>
            <p className="text-sm text-muted-foreground">{activeDemo?.description}</p>
          </div>
          <div className="space-y-6">
            {activeDemo?.component && <activeDemo.component />}
          </div>
        </div>
      </main>

      {/* Right: Theme Panel (always visible) */}
      <ThemePanel dark={dark} onToggleDark={toggleDark} />
      <Toaster />
    </div>
  )
}
