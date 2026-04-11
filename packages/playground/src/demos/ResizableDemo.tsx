import React from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@cherry-studio/ui"
import { Section } from "../components/Section"

export function ResizableDemo() {
  return (
    <Section title="Resizable Panels">
      <ResizablePanelGroup direction="horizontal" className="min-h-[200px] max-w-2xl rounded-lg border">
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Panel A</span>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={50}>
              <div className="flex h-full items-center justify-center p-6">
                <span className="font-semibold">Panel B</span>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50}>
              <div className="flex h-full items-center justify-center p-6">
                <span className="font-semibold">Panel C</span>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Section>
  )
}
