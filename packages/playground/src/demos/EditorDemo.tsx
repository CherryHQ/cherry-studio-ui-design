import React from "react"
import {
  Toolbar, ToolbarSeparator, Button, Textarea, MarkdownRenderer,
  Tabs, TabsList, TabsTrigger, TabsContent, Separator, Badge,
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Bold, Italic, Strikethrough, Link, Code, List, ListOrdered, Image, Table, Heading } from "lucide-react"

const sampleMarkdown = `# Hello World

This is a **bold** and *italic* text example.

## Features

- Markdown preview
- Toolbar formatting
- Word count

\`\`\`typescript
function greet(name: string) {
  return \`Hello, \${name}!\`
}
\`\`\`

> This is a blockquote with some wisdom.

| Feature | Status |
|---------|--------|
| Bold    | ✅     |
| Italic  | ✅     |
| Code    | ✅     |
`

export function EditorDemo() {
  const [content, setContent] = React.useState(sampleMarkdown)
  const [tab, setTab] = React.useState("edit")

  const charCount = content.length
  const wordCount = content.trim()
    ? content.trim().split(/\s+/).length + (content.match(/[\u4e00-\u9fff]/g)?.length ?? 0)
    : 0

  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const insertAtCursor = (prefix: string, suffix = "") => {
    const ta = textareaRef.current
    if (!ta) { setContent((prev) => prev + prefix + suffix); return }
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = content.slice(start, end)
    const newText = content.slice(0, start) + prefix + selected + suffix + content.slice(end)
    setContent(newText)
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = start + prefix.length + selected.length + suffix.length
      ta.focus()
    })
  }

  return (
    <>
      {/* Full editor */}
      <Section
        title="Rich Text Editor"
        props={[
          { name: "content", type: "string", description: "Editor content (markdown)" },
          { name: "onChange", type: "(value: string) => void", description: "Content change handler" },
        ]}
        code={`import { Toolbar, Button, Textarea, MarkdownRenderer, Tabs } from "@cherry-studio/ui"

<Toolbar>
  <Button variant="ghost" size="icon"><Bold /></Button>
  <Button variant="ghost" size="icon"><Italic /></Button>
</Toolbar>
<Textarea value={content} onChange={setContent} />`}
      >
        <div className="max-w-2xl border rounded-[var(--radius-card)] overflow-hidden">
          {/* Toolbar */}
          <Toolbar className="rounded-none border-0 border-b">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertAtCursor("**", "**")}>
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertAtCursor("*", "*")}>
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertAtCursor("~~", "~~")}>
              <Strikethrough className="h-4 w-4" />
            </Button>
            <ToolbarSeparator />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertAtCursor("[link](url)")}>
              <Link className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertAtCursor("`", "`")}>
              <Code className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertAtCursor("# ")}>
              <Heading className="h-4 w-4" />
            </Button>
            <ToolbarSeparator />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertAtCursor("\n- ")}>
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertAtCursor("\n1. ")}>
              <ListOrdered className="h-4 w-4" />
            </Button>
            <ToolbarSeparator />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertAtCursor("\n![alt](image-url)")}>
              <Image className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertAtCursor("\n\n| Col1 | Col2 |\n|------|------|\n| A    | B    |\n")}>
              <Table className="h-4 w-4" />
            </Button>
          </Toolbar>

          {/* Tabs: Edit / Preview */}
          <Tabs value={tab} onValueChange={setTab}>
            <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/30">
              <TabsList className="h-8">
                <TabsTrigger value="edit" className="text-xs h-7 px-3">编辑</TabsTrigger>
                <TabsTrigger value="preview" className="text-xs h-7 px-3">预览</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">{charCount} 字符</Badge>
                <Badge variant="secondary" className="text-[10px]">{wordCount} 词</Badge>
              </div>
            </div>

            <TabsContent value="edit" className="m-0">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px] border-0 rounded-none resize-none focus-visible:ring-0 font-mono text-sm"
                placeholder="输入 Markdown 内容..."
              />
            </TabsContent>

            <TabsContent value="preview" className="m-0">
              <div className="min-h-[300px] p-4 overflow-auto">
                {content.trim() ? (
                  <MarkdownRenderer content={content} />
                ) : (
                  <p className="text-sm text-muted-foreground">暂无内容</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Section>

      {/* Toolbar only */}
      <Section title="Standalone Toolbar">
        <Toolbar>
          <Button variant="ghost" size="icon" className="h-8 w-8"><Bold className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8"><Italic className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8"><Strikethrough className="h-4 w-4" /></Button>
          <ToolbarSeparator />
          <Button variant="ghost" size="icon" className="h-8 w-8"><Link className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8"><Code className="h-4 w-4" /></Button>
        </Toolbar>
      </Section>

      {/* Markdown preview */}
      <Section title="Markdown Preview">
        <div className="max-w-2xl border rounded-[var(--radius-card)] p-4">
          <MarkdownRenderer content={`**Markdown** supports *rich formatting*:\n\n- Lists\n- \`Code\`\n- [Links](https://example.com)\n\n> And blockquotes too.`} />
        </div>
      </Section>
    </>
  )
}
