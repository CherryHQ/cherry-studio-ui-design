import React from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

export function ResizableDemo() {
  return (
    <>
      <Section title="Resizable Panels" install="npx shadcn@latest add resizable" props={[
          { name: "direction", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Panel direction" },
        ]} code={`import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@cherry-studio/ui"

<ResizablePanelGroup direction="horizontal">
  <ResizablePanel defaultSize={50}>Panel A</ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel defaultSize={50}>Panel B</ResizablePanel>
</ResizablePanelGroup>`}>
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

      <Section title="Vertical Panels" code={`<ResizablePanelGroup direction="vertical">
  <ResizablePanel defaultSize={40}>Top</ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel defaultSize={60}>Bottom</ResizablePanel>
</ResizablePanelGroup>`}>
        <ResizablePanelGroup direction="vertical" className="min-h-[300px] max-w-md rounded-lg border">
          <ResizablePanel defaultSize={30}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Header</span>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Content</span>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={20}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Footer</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </Section>
    </>
  )
}
