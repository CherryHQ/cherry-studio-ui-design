import React from "react"
import { Toggle, ToggleGroup, ToggleGroupItem } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Code, Strikethrough, Link
} from "lucide-react"

export function ToggleDemo() {
  return (
    <>
      <Section title="Toggle" install="npx shadcn@latest add toggle" props={[
        { name: "variant", type: '"default" | "outline"', default: '"default"', description: "Visual style" },
        { name: "size", type: '"default" | "sm" | "lg"', default: '"default"', description: "Toggle size" },
        { name: "pressed", type: "boolean", default: "undefined", description: "Controlled pressed state" },
        { name: "onPressedChange", type: "(pressed) => void", default: "undefined", description: "Press handler" },
      ]} code={`import { Toggle } from "@cherry-studio/ui"
import { Bold } from "lucide-react"

<Toggle aria-label="Bold">
  <Bold className="h-4 w-4" />
</Toggle>`}>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Default</p>
            <div className="flex gap-2">
              <Toggle aria-label="Bold"><Bold className="h-4 w-4" /></Toggle>
              <Toggle aria-label="Italic"><Italic className="h-4 w-4" /></Toggle>
              <Toggle aria-label="Underline"><Underline className="h-4 w-4" /></Toggle>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Outline Variant</p>
            <div className="flex gap-2">
              <Toggle variant="outline" aria-label="Bold"><Bold className="h-4 w-4" /></Toggle>
              <Toggle variant="outline" aria-label="Italic"><Italic className="h-4 w-4" /></Toggle>
              <Toggle variant="outline" aria-label="Underline"><Underline className="h-4 w-4" /></Toggle>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">With Text</p>
            <div className="flex gap-2">
              <Toggle aria-label="Bold"><Bold className="mr-2 h-4 w-4" /> Bold</Toggle>
              <Toggle aria-label="Italic"><Italic className="mr-2 h-4 w-4" /> Italic</Toggle>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Sizes</p>
            <div className="flex items-center gap-2">
              <Toggle size="sm" aria-label="Small"><Bold className="h-3 w-3" /></Toggle>
              <Toggle aria-label="Default"><Bold className="h-4 w-4" /></Toggle>
              <Toggle size="lg" aria-label="Large"><Bold className="h-5 w-5" /></Toggle>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Disabled</p>
            <div className="flex gap-2">
              <Toggle disabled aria-label="Disabled"><Bold className="h-4 w-4" /></Toggle>
              <Toggle disabled defaultPressed aria-label="Disabled pressed"><Italic className="h-4 w-4" /></Toggle>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Toggle Group — Single Selection">
        <div className="space-y-4">
          <ToggleGroup type="single" defaultValue="center">
            <ToggleGroupItem value="left" aria-label="Left"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
            <ToggleGroupItem value="center" aria-label="Center"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
            <ToggleGroupItem value="right" aria-label="Right"><AlignRight className="h-4 w-4" /></ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup type="single" variant="outline" defaultValue="bullet">
            <ToggleGroupItem value="bullet" aria-label="Bullet list"><List className="h-4 w-4" /></ToggleGroupItem>
            <ToggleGroupItem value="numbered" aria-label="Numbered list"><ListOrdered className="h-4 w-4" /></ToggleGroupItem>
          </ToggleGroup>
        </div>
      </Section>

      <Section title="Toggle Group — Multiple Selection">
        <ToggleGroup type="multiple" defaultValue={["bold"]}>
          <ToggleGroupItem value="bold" aria-label="Bold"><Bold className="h-4 w-4" /></ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic"><Italic className="h-4 w-4" /></ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Underline"><Underline className="h-4 w-4" /></ToggleGroupItem>
          <ToggleGroupItem value="strikethrough" aria-label="Strikethrough"><Strikethrough className="h-4 w-4" /></ToggleGroupItem>
          <ToggleGroupItem value="code" aria-label="Code"><Code className="h-4 w-4" /></ToggleGroupItem>
          <ToggleGroupItem value="link" aria-label="Link"><Link className="h-4 w-4" /></ToggleGroupItem>
        </ToggleGroup>
      </Section>

      <Section title="Practical: Text Editor Toolbar">
        <div className="inline-flex items-center gap-1 rounded-[12px] border p-1">
          <ToggleGroup type="multiple" defaultValue={["bold"]}>
            <ToggleGroupItem value="bold" size="sm" aria-label="Bold"><Bold className="h-3.5 w-3.5" /></ToggleGroupItem>
            <ToggleGroupItem value="italic" size="sm" aria-label="Italic"><Italic className="h-3.5 w-3.5" /></ToggleGroupItem>
            <ToggleGroupItem value="underline" size="sm" aria-label="Underline"><Underline className="h-3.5 w-3.5" /></ToggleGroupItem>
          </ToggleGroup>
          <div className="w-px h-5 bg-border mx-0.5" />
          <ToggleGroup type="single" defaultValue="left">
            <ToggleGroupItem value="left" size="sm" aria-label="Left"><AlignLeft className="h-3.5 w-3.5" /></ToggleGroupItem>
            <ToggleGroupItem value="center" size="sm" aria-label="Center"><AlignCenter className="h-3.5 w-3.5" /></ToggleGroupItem>
            <ToggleGroupItem value="right" size="sm" aria-label="Right"><AlignRight className="h-3.5 w-3.5" /></ToggleGroupItem>
          </ToggleGroup>
        </div>
      </Section>
    </>
  )
}
