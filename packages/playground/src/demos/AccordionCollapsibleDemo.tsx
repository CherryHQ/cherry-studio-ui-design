import React from "react"
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
  Collapsible, CollapsibleContent, CollapsibleTrigger, Button, Badge
} from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { ChevronsUpDown, Settings, Palette, Shield, Zap } from "lucide-react"

export function AccordionCollapsibleDemo() {
  return (
    <>
      <Section title="Accordion — Single" install="npx shadcn@latest add accordion" props={[
        { name: "type", type: '"single" | "multiple"', description: "Single or multiple open items" },
        { name: "collapsible", type: "boolean", default: "false", description: "Allow all items to close" },
        { name: "defaultValue", type: "string | string[]", description: "Initially open items" },
      ]} code={`import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@cherry-studio/ui"

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Question?</AccordionTrigger>
    <AccordionContent>Answer.</AccordionContent>
  </AccordionItem>
</Accordion>`}>
        <Accordion type="single" collapsible className="w-full max-w-lg">
          <AccordionItem value="item-1">
            <AccordionTrigger>What is Cherry Studio?</AccordionTrigger>
            <AccordionContent>
              Cherry Studio is an AI-powered development environment for building smart applications.
              It supports multiple LLM providers, knowledge bases, and autonomous agents.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>How do I get started?</AccordionTrigger>
            <AccordionContent>
              You can start by creating a new project and selecting a template from the library.
              Configure your API keys in Settings, then create your first conversation.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Can I customize the UI?</AccordionTrigger>
            <AccordionContent>
              Yes! All components are fully customizable using Tailwind CSS and CSS variables.
              You can modify the theme, colors, and spacing to match your brand.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Section>

      <Section title="Accordion — Multiple Open">
        <Accordion type="multiple" defaultValue={["general"]} className="w-full max-w-lg">
          <AccordionItem value="general">
            <AccordionTrigger>
              <span className="flex items-center gap-2"><Settings className="h-4 w-4" /> General Settings</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Language, theme, startup behavior, and default model configuration.</p>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="appearance">
            <AccordionTrigger>
              <span className="flex items-center gap-2"><Palette className="h-4 w-4" /> Appearance</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Theme colors, font size, sidebar layout, and message bubble style.</p>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="security">
            <AccordionTrigger>
              <span className="flex items-center gap-2"><Shield className="h-4 w-4" /> Privacy & Security</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Data retention, API key management, and usage analytics preferences.</p>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="advanced">
            <AccordionTrigger>
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4" /> Advanced
                <Badge variant="secondary" className="text-[10px] ml-1">Beta</Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Experimental features, debug mode, custom API endpoints, and proxy settings.</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Section>

      <Section title="Collapsible">
        <Collapsible className="w-full max-w-lg space-y-2">
          <div className="flex items-center justify-between space-x-4 px-4">
            <h4 className="text-sm font-semibold">3 starred repositories</h4>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm"><ChevronsUpDown className="h-4 w-4" /></Button>
            </CollapsibleTrigger>
          </div>
          <div className="rounded-xl border px-4 py-2 text-sm font-mono">@cherry-studio/ui</div>
          <CollapsibleContent className="space-y-2">
            <div className="rounded-xl border px-4 py-2 text-sm font-mono">@cherry-studio/core</div>
            <div className="rounded-xl border px-4 py-2 text-sm font-mono">@cherry-studio/cli</div>
          </CollapsibleContent>
        </Collapsible>
      </Section>

      <Section title="Collapsible — Settings Panel">
        <div className="max-w-lg space-y-2">
          {[
            { title: "Model Configuration", count: 5, items: ["Default model", "Temperature", "Max tokens", "Top P", "Stream output"] },
            { title: "API Keys", count: 3, items: ["OpenAI", "Anthropic", "Google AI"] },
          ].map((group) => (
            <Collapsible key={group.title} defaultOpen className="rounded-xl border">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex w-full items-center justify-between p-3 text-sm font-medium hover:bg-accent rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                  <span>{group.title}</span>
                  <Badge variant="outline" className="text-xs">{group.count}</Badge>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border-t px-3 py-2 space-y-1">
                  {group.items.map((item) => (
                    <div key={item} className="text-sm text-muted-foreground py-1 px-2 rounded hover:bg-muted/50 cursor-pointer">
                      {item}
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </Section>
    </>
  )
}
