import React, { useState } from "react"
import { Toaster } from "@cherry-studio/ui"
import { Sidebar } from "./components/Sidebar"
import { demos } from "./demos"

export function App() {
  const [active, setActive] = useState(demos[0].id)
  const [dark, setDark] = useState(false)
  const activeDemo = demos.find((d) => d.id === active)

  return (
    <div className={dark ? "dark" : ""}>
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar
          demos={demos}
          active={active}
          onSelect={setActive}
          dark={dark}
          onToggleDark={() => setDark(!dark)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-10">
            <h1 className="text-2xl font-semibold mb-1">{activeDemo?.title}</h1>
            <p className="text-sm text-muted-foreground mb-8">
              {activeDemo?.description}
            </p>
            <div className="space-y-8">
              {activeDemo?.component && <activeDemo.component />}
            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  )
}
