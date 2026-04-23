import React, { useState } from "react"
import { FloatingWindow, Button, type DetachedWindow } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { MessageCircle, FileText } from "lucide-react"

const sampleWindow: DetachedWindow = {
  id: "win-1",
  tab: { id: "tab-1", title: "Chat Window", icon: MessageCircle },
  x: 80,
  y: 40,
  width: 340,
  height: 240,
}

const sampleWindow2: DetachedWindow = {
  id: "win-2",
  tab: { id: "tab-2", title: "Notes", icon: FileText, miniAppId: "notes", miniAppColor: "bg-accent-indigo", miniAppInitial: "N" },
  x: 200,
  y: 80,
  width: 300,
  height: 200,
}

export function FloatingWindowDemo() {
  const [windows, setWindows] = useState<DetachedWindow[]>([sampleWindow, sampleWindow2])

  const handleClose = (id: string) => setWindows(prev => prev.filter(w => w.id !== id))
  const handleReattach = (win: DetachedWindow) => setWindows(prev => prev.filter(w => w.id !== win.id))

  return (
    <>
      <Section title="FloatingWindow" props={[
        { name: "win", type: "DetachedWindow", description: "Window position, size, and tab info" },
        { name: "onClose", type: "(id: string) => void", description: "Close window handler" },
        { name: "onReattach", type: "(win: DetachedWindow) => void", description: "Reattach to tab bar handler" },
      ]} code={`import { FloatingWindow } from "@cherry-studio/ui"

<FloatingWindow
  win={detachedWindow}
  onClose={(id) => handleClose(id)}
  onReattach={(win) => handleReattach(win)}
/>`}>
        <div className="relative h-[360px] border rounded-[12px] overflow-hidden bg-muted/20">
          <p className="absolute top-3 left-3 text-xs text-muted-foreground">
            Drag the title bar to move windows. {windows.length} window(s) open.
          </p>
          {windows.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <Button size="sm" variant="outline" onClick={() => setWindows([sampleWindow, sampleWindow2])}>
                Restore Windows
              </Button>
            </div>
          )}
          {windows.map(win => (
            <FloatingWindow key={win.id} win={win} onClose={handleClose} onReattach={handleReattach} />
          ))}
        </div>
      </Section>
    </>
  )
}
