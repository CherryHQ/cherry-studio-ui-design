import React, { useState } from "react"
import { Button, ButtonGroup } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  ChevronDown, List, ListOrdered, Code, Undo, Redo,
  ZoomIn, ZoomOut, RotateCcw, Grid3x3, LayoutList, LayoutGrid
} from "lucide-react"

export function ButtonGroupDemo() {
  const [view, setView] = useState<string>("grid")
  const [align, setAlign] = useState<string>("left")

  return (
    <>
      <Section title="Text Buttons" install="npm install @cherry-studio/ui" props={[
          { name: "className", type: "string", default: "undefined", description: "Additional CSS" },
          { name: "children", type: "ReactNode", description: "Button elements" },
        ]} code={`import { Button, ButtonGroup } from "@cherry-studio/ui"

<ButtonGroup>
  <Button variant="outline">Cut</Button>
  <Button variant="outline">Copy</Button>
  <Button variant="outline">Paste</Button>
</ButtonGroup>`}>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Default</p>
            <ButtonGroup>
              <Button variant="outline">Cut</Button>
              <Button variant="outline">Copy</Button>
              <Button variant="outline">Paste</Button>
            </ButtonGroup>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Secondary</p>
            <ButtonGroup>
              <Button variant="secondary">Day</Button>
              <Button variant="secondary">Week</Button>
              <Button variant="secondary">Month</Button>
            </ButtonGroup>
          </div>
        </div>
      </Section>

      <Section title="Icon Buttons">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Text Formatting</p>
            <ButtonGroup>
              <Button variant="outline" size="icon"><Bold className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon"><Italic className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon"><Underline className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon"><Code className="h-4 w-4" /></Button>
            </ButtonGroup>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">List Style</p>
            <ButtonGroup>
              <Button variant="outline" size="icon"><List className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon"><ListOrdered className="h-4 w-4" /></Button>
            </ButtonGroup>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Zoom Controls</p>
            <ButtonGroup>
              <Button variant="outline" size="icon"><ZoomOut className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon"><RotateCcw className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon"><ZoomIn className="h-4 w-4" /></Button>
            </ButtonGroup>
          </div>
        </div>
      </Section>

      <Section title="Toggle Selection">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Alignment ({align})</p>
            <ButtonGroup>
              {([
                ["left", AlignLeft],
                ["center", AlignCenter],
                ["right", AlignRight],
              ] as const).map(([value, Icon]) => (
                <Button
                  key={value}
                  variant={align === value ? "default" : "outline"}
                  size="icon"
                  onClick={() => setAlign(value)}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </ButtonGroup>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">View Mode ({view})</p>
            <ButtonGroup>
              {([
                ["grid", LayoutGrid, "Grid"],
                ["list", LayoutList, "List"],
                ["table", Grid3x3, "Table"],
              ] as const).map(([value, Icon, label]) => (
                <Button
                  key={value}
                  variant={view === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView(value)}
                >
                  <Icon className="mr-1.5 h-3.5 w-3.5" /> {label}
                </Button>
              ))}
            </ButtonGroup>
          </div>
        </div>
      </Section>

      <Section title="Split Button">
        <div className="space-y-4">
          <ButtonGroup>
            <Button>Save</Button>
            <Button size="icon"><ChevronDown className="h-4 w-4" /></Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button variant="outline">Merge</Button>
            <Button variant="outline" size="icon"><ChevronDown className="h-4 w-4" /></Button>
          </ButtonGroup>
        </div>
      </Section>

      <Section title="States">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Disabled</p>
            <ButtonGroup>
              <Button variant="outline" disabled><Undo className="h-4 w-4" /></Button>
              <Button variant="outline"><Redo className="h-4 w-4" /></Button>
            </ButtonGroup>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Small Size</p>
            <ButtonGroup>
              <Button variant="outline" size="sm">Prev</Button>
              <Button variant="outline" size="sm">Next</Button>
            </ButtonGroup>
          </div>
        </div>
      </Section>
    </>
  )
}
