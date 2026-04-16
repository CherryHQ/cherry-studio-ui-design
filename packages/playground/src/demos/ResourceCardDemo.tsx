import React from "react"
import {
  ResourceCard, FileCard, StatusBadge,
  Avatar, AvatarFallback, Button, Badge
} from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import {
  Star, Play, Bot, BookOpen, Puzzle, Download,
  FileText, Image, Code, Music, MoreHorizontal,
  CheckCircle, Loader2, AlertCircle, Clock
} from "lucide-react"

export function ResourceCardDemo() {
  return (
    <>
      <Section title="Resource Cards" install="npm install @cherry-studio/ui" props={[
          { name: "title", type: "string", description: "Card title" },
          { name: "subtitle", type: "string", default: "undefined", description: "Subtitle text" },
          { name: "description", type: "string", default: "undefined", description: "Description" },
          { name: "tags", type: "string[]", default: "undefined", description: "Tag labels" },
          { name: "avatar", type: "ReactNode", default: "undefined", description: "Avatar element" },
          { name: "actions", type: "ReactNode", default: "undefined", description: "Action buttons" },
          { name: "hoverable", type: "boolean", default: "true", description: "Hover effect" },
        ]} code={`import { ResourceCard, Avatar, AvatarFallback, Button } from "@cherry-studio/ui"

<ResourceCard
  avatar={<Avatar><AvatarFallback>🤖</AvatarFallback></Avatar>}
  title="Code Assistant"
  subtitle="AI Agent"
  description="An intelligent coding assistant."
  tags={["Coding", "Review"]}
  actions={<Button size="sm">Try</Button>}
/>`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
          <ResourceCard
            avatar={<Avatar className="h-10 w-10"><AvatarFallback className="text-lg">🤖</AvatarFallback></Avatar>}
            title="Code Assistant"
            subtitle="AI Agent"
            description="An intelligent coding assistant that helps write, review, and debug code across multiple languages."
            tags={["Coding", "Review", "Debug"]}
            stats={<><Star className="h-3 w-3" /> 2.4k &middot; <Play className="h-3 w-3" /> 12k runs</>}
            actions={<Button size="sm" className="h-7 text-[11px]">Try</Button>}
            badge={<Badge className="text-[9px]">Featured</Badge>}
          />
          <ResourceCard
            avatar={<Avatar className="h-10 w-10"><AvatarFallback className="text-lg">📝</AvatarFallback></Avatar>}
            title="Writing Coach"
            subtitle="Assistant"
            description="Helps improve your writing with grammar, style, and clarity suggestions."
            tags={["Writing", "Grammar"]}
            stats={<><Star className="h-3 w-3" /> 1.8k</>}
            actions={<Button size="sm" variant="outline" className="h-7 text-[11px]">Use</Button>}
          />
          <ResourceCard
            avatar={<Avatar className="h-10 w-10"><AvatarFallback className="text-lg">📚</AvatarFallback></Avatar>}
            title="Research KB"
            subtitle="Knowledge Base"
            description="AI research papers and notes organized for quick retrieval."
            tags={["Research", "AI"]}
            stats={<><BookOpen className="h-3 w-3" /> 156 docs</>}
            actions={<Button size="sm" variant="outline" className="h-7 text-[11px]">Open</Button>}
          />
        </div>
      </Section>

      <Section title="File Cards">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl">
          <FileCard
            icon={<FileText className="h-8 w-8 text-accent-blue/50" />}
            name="README.md"
            size="2.4 KB"
            type="Markdown"
          />
          <FileCard
            icon={<Image className="h-8 w-8 text-accent-emerald/50" />}
            name="screenshot.png"
            size="1.2 MB"
            type="Image"
          />
          <FileCard
            icon={<Code className="h-8 w-8 text-accent-amber/50" />}
            name="index.tsx"
            size="4.8 KB"
            type="TypeScript"
            status={<StatusBadge variant="success" dot={false}>New</StatusBadge>}
          />
          <FileCard
            icon={<Music className="h-8 w-8 text-accent-violet/50" />}
            name="podcast.mp3"
            size="32 MB"
            type="Audio"
          />
        </div>
      </Section>

      <Section title="Status Badges">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge variant="success">Ready</StatusBadge>
            <StatusBadge variant="warning">Pending</StatusBadge>
            <StatusBadge variant="error">Failed</StatusBadge>
            <StatusBadge variant="info">Info</StatusBadge>
            <StatusBadge variant="processing">Syncing</StatusBadge>
            <StatusBadge variant="default">Draft</StatusBadge>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge variant="success" dot={false}><CheckCircle className="h-3 w-3 mr-0.5" /> Indexed</StatusBadge>
            <StatusBadge variant="processing" dot={false}><Loader2 className="h-3 w-3 mr-0.5 animate-spin" /> Embedding</StatusBadge>
            <StatusBadge variant="error" dot={false}><AlertCircle className="h-3 w-3 mr-0.5" /> Error</StatusBadge>
            <StatusBadge variant="warning" dot={false}><Clock className="h-3 w-3 mr-0.5" /> Queued</StatusBadge>
          </div>
        </div>
      </Section>

      <Section title="Practical: Data Source List">
        <div className="max-w-lg space-y-2">
          {[
            { name: "api-docs.pdf", size: "2.4 MB", chunks: 48, status: "success" as const, statusText: "Indexed" },
            { name: "architecture.md", size: "156 KB", chunks: 12, status: "processing" as const, statusText: "Embedding" },
            { name: "broken-file.csv", size: "890 KB", chunks: 0, status: "error" as const, statusText: "Parse Error" },
            { name: "meeting-notes.docx", size: "340 KB", chunks: 0, status: "warning" as const, statusText: "Queued" },
          ].map((file) => (
            <div key={file.name} className="flex items-center gap-3 rounded-xl border p-3 hover:bg-accent/30 transition-colors cursor-pointer">
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{file.name}</p>
                <p className="text-[10px] text-muted-foreground">{file.size} &middot; {file.chunks} chunks</p>
              </div>
              <StatusBadge variant={file.status}>{file.statusText}</StatusBadge>
              <Button variant="ghost" className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                <MoreHorizontal size={14} />
              </Button>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
