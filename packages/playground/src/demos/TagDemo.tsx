import React from "react"
import { Badge, Button, Input, TagsCard } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { X } from "lucide-react"

const allTags = ["React", "TypeScript", "Tailwind", "Node.js", "Python", "Figma", "Docker", "GraphQL"]

export function TagDemo() {
  const [selected, setSelected] = React.useState<Set<string>>(new Set(["React", "TypeScript"]))
  const [deletable, setDeletable] = React.useState(["Cherry Studio", "AI 助手", "开源项目", "GPT-4", "Claude"])
  const [inputValue, setInputValue] = React.useState("")
  const [customTags, setCustomTags] = React.useState(["设计系统", "组件库"])

  const toggle = (tag: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(tag) ? next.delete(tag) : next.add(tag)
      return next
    })
  }

  const removeTag = (tag: string) => setDeletable((prev) => prev.filter((t) => t !== tag))

  const addTag = () => {
    const trimmed = inputValue.trim()
    if (trimmed && !customTags.includes(trimmed)) {
      setCustomTags((prev) => [...prev, trimmed])
      setInputValue("")
    }
  }

  return (
    <>
      {/* Clickable tags */}
      <Section
        title="Clickable Tags"
        props={[
          { name: "tags", type: "{ label, variant }[]", description: "Tag items" },
          { name: "title", type: "string", default: "undefined", description: "Card title" },
        ]}
        code={`import { Badge } from "@cherry-studio/ui"

<Badge variant={selected ? "default" : "outline"} onClick={toggle}>
  React
</Badge>`}
      >
        <div className="flex flex-wrap gap-2 max-w-md">
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selected.has(tag) ? "default" : "outline"}
              className="cursor-pointer select-none"
              onClick={() => toggle(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </Section>

      {/* Deletable tags */}
      <Section title="Deletable Tags">
        <div className="flex flex-wrap gap-2 max-w-md">
          {deletable.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <Button variant="ghost" size="icon" onClick={() => removeTag(tag)} className="size-4 p-0 ml-0.5 rounded-full">
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {deletable.length === 0 && (
            <span className="text-xs text-muted-foreground">All tags removed</span>
          )}
        </div>
      </Section>

      {/* Color variants */}
      <Section title="Color Variants">
        <div className="flex flex-wrap gap-2 max-w-md">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20">Blue Accent</Badge>
          <Badge className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20">Green Accent</Badge>
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20">Amber Accent</Badge>
        </div>
      </Section>

      {/* Grouped tags via TagsCard */}
      <Section title="Grouped Tags (TagsCard)">
        <div className="space-y-3 max-w-sm">
          <TagsCard title="技术" tags={[{ label: "React" }, { label: "TypeScript" }, { label: "Tailwind" }]} />
          <TagsCard title="设计" tags={[{ label: "Figma" }, { label: "UI/UX" }, { label: "Design System", variant: "outline" }]} />
          <TagsCard title="产品" tags={[{ label: "PRD" }, { label: "用户研究", variant: "outline" }, { label: "数据分析" }]} />
        </div>
      </Section>

      {/* Input to add tags */}
      <Section title="Add Tags via Input">
        <div className="max-w-sm space-y-3">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="输入标签名..."
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              className="flex-1"
            />
            <Button size="sm" onClick={addTag} disabled={!inputValue.trim()}>
              添加
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {customTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                {tag}
                <Button variant="ghost" size="icon" onClick={() => setCustomTags((prev) => prev.filter((t) => t !== tag))} className="size-4 p-0 ml-0.5 rounded-full">
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      </Section>

      {/* Overflow with +N more */}
      <Section title="Overflow (+N more)">
        <div className="max-w-[260px]">
          <OverflowTags tags={["React", "TypeScript", "Tailwind CSS", "Node.js", "Python", "Docker", "Figma", "GraphQL"]} max={4} />
        </div>
      </Section>
    </>
  )
}

function OverflowTags({ tags, max }: { tags: string[]; max: number }) {
  const visible = tags.slice(0, max)
  const remaining = tags.length - max

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {visible.map((tag) => (
        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
      ))}
      {remaining > 0 && (
        <span className="text-xs text-muted-foreground">+{remaining} more</span>
      )}
    </div>
  )
}
