import React from "react"
import { Button, ButtonGroup, ToggleGroup, ToggleGroupItem } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  ChevronDown, List, ListOrdered, Code, Undo, Redo,
  ZoomIn, ZoomOut, RotateCcw, Grid3x3, LayoutList, LayoutGrid,
  MessageSquare, Bot, BookOpen
} from "lucide-react"

export function ButtonGroupDemo() {
  return (
    <>
      <Section title="Tab Switch (Single Select)" install="npm install @cherry-studio/ui" props={[
          { name: "type", type: '"single" | "multiple"', default: '"multiple"', description: "Selection mode" },
          { name: "value", type: "string", description: "Selected value (single mode)" },
          { name: "onValueChange", type: "(value: string) => void", description: "Selection handler" },
        ]} code={`import { ToggleGroup, ToggleGroupItem } from "@cherry-studio/ui"

<ToggleGroup type="single" defaultValue="chat">
  <ToggleGroupItem value="chat"><MessageSquare /> Chat</ToggleGroupItem>
  <ToggleGroupItem value="agents"><Bot /> Agents</ToggleGroupItem>
  <ToggleGroupItem value="knowledge"><BookOpen /> Knowledge</ToggleGroupItem>
</ToggleGroup>`}>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">With Icons</p>
            <ToggleGroup type="single" defaultValue="chat">
              <ToggleGroupItem value="chat"><MessageSquare className="h-4 w-4 mr-1.5" /> Chat</ToggleGroupItem>
              <ToggleGroupItem value="agents"><Bot className="h-4 w-4 mr-1.5" /> Agents</ToggleGroupItem>
              <ToggleGroupItem value="knowledge"><BookOpen className="h-4 w-4 mr-1.5" /> Knowledge</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Text Only</p>
            <ToggleGroup type="single" defaultValue="day">
              <ToggleGroupItem value="day">Day</ToggleGroupItem>
              <ToggleGroupItem value="week">Week</ToggleGroupItem>
              <ToggleGroupItem value="month">Month</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Icon Only</p>
            <ToggleGroup type="single" defaultValue="left">
              <ToggleGroupItem value="left"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
              <ToggleGroupItem value="center"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
              <ToggleGroupItem value="right"><AlignRight className="h-4 w-4" /></ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">View Mode</p>
            <ToggleGroup type="single" defaultValue="grid">
              <ToggleGroupItem value="grid"><LayoutGrid className="h-4 w-4 mr-1.5" /> Grid</ToggleGroupItem>
              <ToggleGroupItem value="list"><LayoutList className="h-4 w-4 mr-1.5" /> List</ToggleGroupItem>
              <ToggleGroupItem value="table"><Grid3x3 className="h-4 w-4 mr-1.5" /> Table</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </Section>

      <Section title="Joined Buttons">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Actions</p>
            <ButtonGroup>
              <Button variant="outline">Cut</Button>
              <Button variant="outline">Copy</Button>
              <Button variant="outline">Paste</Button>
            </ButtonGroup>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Icon Toolbar</p>
            <ButtonGroup>
              <Button variant="outline" size="icon"><Bold className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon"><Italic className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon"><Underline className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon"><Code className="h-4 w-4" /></Button>
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
