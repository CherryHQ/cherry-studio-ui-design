import React, { useState } from "react"
import {
  ResourceCard, Badge, Input, Button,
  Avatar, AvatarFallback,
  Tabs, TabsList, TabsTrigger, TabsContent
} from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { Search, Star, Play, BookOpen } from "lucide-react"

interface Resource {
  emoji: string
  title: string
  subtitle: string
  description: string
  tags: string[]
  stats: React.ReactNode
  type: "agent" | "assistant" | "knowledge"
  featured?: boolean
}

const resources: Resource[] = [
  {
    emoji: "🤖",
    title: "Code Reviewer",
    subtitle: "AI Agent",
    description: "Automatically reviews pull requests, identifies bugs, and suggests improvements with context-aware analysis.",
    tags: ["Coding", "Review", "CI/CD"],
    stats: <><Star className="h-3 w-3" /> 3.2k &middot; <Play className="h-3 w-3" /> 18k runs</>,
    type: "agent",
    featured: true,
  },
  {
    emoji: "✍️",
    title: "Technical Writer",
    subtitle: "Assistant",
    description: "Helps write and polish technical documentation, API references, and README files.",
    tags: ["Writing", "Docs"],
    stats: <><Star className="h-3 w-3" /> 1.5k</>,
    type: "assistant",
  },
  {
    emoji: "📚",
    title: "ML Research Papers",
    subtitle: "Knowledge Base",
    description: "Curated collection of 500+ machine learning papers with semantic search and citation tracking.",
    tags: ["Research", "ML", "Papers"],
    stats: <><BookOpen className="h-3 w-3" /> 512 docs</>,
    type: "knowledge",
  },
  {
    emoji: "🎨",
    title: "UI/UX Advisor",
    subtitle: "Assistant",
    description: "Provides design feedback, suggests UI patterns, and helps create consistent design systems.",
    tags: ["Design", "UX", "Figma"],
    stats: <><Star className="h-3 w-3" /> 2.1k</>,
    type: "assistant",
    featured: true,
  },
  {
    emoji: "🔍",
    title: "Data Analyst",
    subtitle: "AI Agent",
    description: "Analyzes datasets, generates visualizations, and produces insight reports from CSV, JSON, or SQL.",
    tags: ["Data", "Analytics", "SQL"],
    stats: <><Star className="h-3 w-3" /> 890 &middot; <Play className="h-3 w-3" /> 5.4k runs</>,
    type: "agent",
  },
  {
    emoji: "📖",
    title: "Company Wiki",
    subtitle: "Knowledge Base",
    description: "Internal company documentation including onboarding guides, policies, and architecture decisions.",
    tags: ["Internal", "Wiki"],
    stats: <><BookOpen className="h-3 w-3" /> 234 docs</>,
    type: "knowledge",
  },
]

function ResourceGrid({ items }: { items: Resource[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((r) => (
        <ResourceCard
          key={r.title}
          avatar={<Avatar className="h-10 w-10"><AvatarFallback className="text-lg">{r.emoji}</AvatarFallback></Avatar>}
          title={r.title}
          subtitle={r.subtitle}
          description={r.description}
          tags={r.tags}
          stats={r.stats}
          actions={<Button size="sm" className="h-7 text-[11px]">Try</Button>}
          badge={r.featured ? <Badge variant="secondary" className="text-[9px]">Featured</Badge> : undefined}
        />
      ))}
    </div>
  )
}

const exploreModuleProps: PropDef[] = [
  { name: "className", type: "string", default: "undefined", description: "Additional CSS" },
]

export function ExploreModuleDemo() {
  const [search, setSearch] = useState("")

  const filtered = (items: Resource[]) =>
    items.filter(
      (r) =>
        !search ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    )

  return (
    <Section title="Explore Module" install="npm install @cherry-studio/ui" props={exploreModuleProps} code={`<Tabs defaultValue="all">
  <TabsList>
    <TabsTrigger value="all">All</TabsTrigger>
    <TabsTrigger value="agents">Agents</TabsTrigger>
  </TabsList>
  <TabsContent value="all">
    <div className="grid grid-cols-3 gap-4">
      {items.map(r => (
        <ResourceCard key={r.title} title={r.title} description={r.description} tags={r.tags} />
      ))}
    </div>
  </TabsContent>
</Tabs>`}>
      <div className="max-w-3xl space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents, assistants, and knowledge bases..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="assistants">Assistants</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <ResourceGrid items={filtered(resources)} />
          </TabsContent>
          <TabsContent value="agents" className="mt-4">
            <ResourceGrid items={filtered(resources.filter((r) => r.type === "agent"))} />
          </TabsContent>
          <TabsContent value="assistants" className="mt-4">
            <ResourceGrid items={filtered(resources.filter((r) => r.type === "assistant"))} />
          </TabsContent>
          <TabsContent value="knowledge" className="mt-4">
            <ResourceGrid items={filtered(resources.filter((r) => r.type === "knowledge"))} />
          </TabsContent>
        </Tabs>
      </div>
    </Section>
  )
}
