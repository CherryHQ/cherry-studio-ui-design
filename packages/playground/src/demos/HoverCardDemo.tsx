import React from "react"
import {
  HoverCard, HoverCardContent, HoverCardTrigger,
  Avatar, AvatarFallback, AvatarImage, Badge, Button
} from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { CalendarDays, MapPin, Link as LinkIcon, Bot, Star, GitFork, Eye } from "lucide-react"

export function HoverCardDemo() {
  return (
    <>
      <Section title="User Profile Card" install="npx shadcn@latest add hover-card" props={[
        { name: "openDelay", type: "number", default: "700", description: "Delay before opening" },
        { name: "closeDelay", type: "number", default: "300", description: "Delay before closing" },
      ]} code={`import { HoverCard, HoverCardContent, HoverCardTrigger, Button } from "@cherry-studio/ui"

<HoverCard>
  <HoverCardTrigger asChild>
    <Button variant="link">@username</Button>
  </HoverCardTrigger>
  <HoverCardContent className="w-80">
    <p>Profile details here.</p>
  </HoverCardContent>
</HoverCard>`}>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link" className="text-base p-0 h-auto">@cherry-studio</Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="flex justify-between space-x-4">
              <Avatar>
                <AvatarFallback>🍒</AvatarFallback>
              </Avatar>
              <div className="space-y-1 flex-1">
                <h4 className="text-sm font-semibold">Cherry Studio</h4>
                <p className="text-sm text-muted-foreground">
                  An AI-powered development environment for building smart applications.
                </p>
                <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
                  <span className="flex items-center"><CalendarDays className="mr-1 h-3 w-3" /> Dec 2024</span>
                  <span className="flex items-center"><MapPin className="mr-1 h-3 w-3" /> Chengdu</span>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </Section>

      <Section title="Repository Card">
        <p className="text-sm text-muted-foreground mb-3">
          Check out the{" "}
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="link" className="p-0 h-auto text-sm">cherry-studio/ui</Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">🍒</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold">cherry-studio/ui</span>
                  </div>
                  <Badge variant="outline" className="text-xs">Public</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  A comprehensive UI component library built with Shadcn/UI, Radix, and Tailwind CSS.
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> TypeScript
                  </span>
                  <span className="flex items-center gap-1"><Star className="h-3 w-3" /> 2.4k</span>
                  <span className="flex items-center gap-1"><GitFork className="h-3 w-3" /> 186</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> 42</span>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>{" "}
          repository for the component library.
        </p>
      </Section>

      <Section title="AI Model Card">
        <div className="flex flex-wrap gap-3">
          {[
            { name: "GPT-4o", emoji: "🧠", desc: "Most capable multimodal model. Supports text, images, and audio.", provider: "OpenAI", ctx: "128K" },
            { name: "Claude Opus", emoji: "🎯", desc: "Advanced reasoning and analysis. Best for complex coding tasks.", provider: "Anthropic", ctx: "200K" },
            { name: "Gemini Pro", emoji: "💎", desc: "Google's advanced model with strong multilingual capabilities.", provider: "Google", ctx: "1M" },
          ].map((model) => (
            <HoverCard key={model.name} openDelay={200} closeDelay={100}>
              <HoverCardTrigger asChild>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent px-3 py-1.5 text-sm gap-1.5">
                  <Bot className="h-3.5 w-3.5" /> {model.name}
                </Badge>
              </HoverCardTrigger>
              <HoverCardContent className="w-72" side="bottom">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{model.emoji}</span>
                    <div>
                      <h4 className="text-sm font-semibold">{model.name}</h4>
                      <p className="text-xs text-muted-foreground">{model.provider}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{model.desc}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Context: {model.ctx}</Badge>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      </Section>

      <Section title="Link Preview">
        <p className="text-sm text-muted-foreground">
          Visit our{" "}
          <HoverCard openDelay={300}>
            <HoverCardTrigger asChild>
              <Button variant="link" className="p-0 h-auto text-sm">documentation site</Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-72" side="top">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  docs.cherrystudio.dev
                </div>
                <p className="text-sm text-muted-foreground">
                  Complete guides, API reference, and examples for Cherry Studio UI components.
                </p>
                <div className="text-xs text-muted-foreground">Last updated: 2 days ago</div>
              </div>
            </HoverCardContent>
          </HoverCard>{" "}
          for detailed guides.
        </p>
      </Section>
    </>
  )
}
