import React, { useState } from "react"
import { DragGhost, type DragGhostTab, Button, Checkbox, Label, ToggleGroup, ToggleGroupItem } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { MessageCircle, FileText, Compass } from "lucide-react"

const sampleTabs: DragGhostTab[] = [
  { id: "chat", title: "New Chat", icon: MessageCircle },
  { id: "notes", title: "My Notes", icon: FileText, miniAppId: "notes", miniAppColor: "bg-accent-indigo", miniAppInitial: "N" },
  { id: "explore", title: "Explore", icon: Compass },
]

export function DragGhostDemo() {
  const [activeTab, setActiveTab] = useState("chat")
  const [overSidebar, setOverSidebar] = useState(false)

  return (
    <>
      <Section title="DragGhost" props={[
        { name: "tabId", type: "string", description: "Tab being dragged" },
        { name: "x", type: "number", description: "Ghost X position" },
        { name: "y", type: "number", description: "Ghost Y position" },
        { name: "overSidebar", type: "boolean", description: "Whether ghost is over sidebar drop zone" },
        { name: "tabs", type: "DragGhostTab[]", description: "All tabs for lookup" },
      ]} code={`import { DragGhost Button, } from "@cherry-studio/ui"

<DragGhost tabId="chat" x={100} y={50} overSidebar={false} tabs={tabs} />`}>
        <div className="space-y-4 max-w-md">
          <ToggleGroup type="single" value={activeTab} onValueChange={v => { if (v) setActiveTab(v) }} className="flex gap-2 flex-wrap">
            {sampleTabs.map(tab => (
              <ToggleGroupItem
                key={tab.id}
                value={tab.id}
                className="px-3 py-1.5 text-xs rounded-[12px] border transition-colors data-[state=on]:bg-accent data-[state=on]:border-primary/30"
              >
                {tab.title}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox checked={overSidebar} onCheckedChange={(v) => setOverSidebar(v === true)} />
            Simulate over sidebar (dock mode)
          </Label>
          <div className="relative h-24 border rounded-[12px] bg-muted/20 overflow-hidden">
            <DragGhost
              tabId={activeTab}
              x={120}
              y={40}
              overSidebar={overSidebar}
              tabs={sampleTabs}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            The ghost follows the cursor during tab drag. It changes style when hovering over the sidebar drop zone.
          </p>
        </div>
      </Section>
    </>
  )
}
