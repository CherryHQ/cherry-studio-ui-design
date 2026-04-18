import React from "react"
import {
  OpenAILogo,
  AnthropicLogo,
  GoogleLogo,
  MicrosoftLogo,
  GitHubLogo,
  NotionLogo,
  ObsidianLogo,
  JoplinLogo,
  LetterBadge,
  Card,
  CardContent,
} from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

const logoProps: PropDef[] = [
  { name: "size", type: "number", default: "16", description: "Width & height in px" },
  { name: "className", type: "string", description: "Additional CSS classes" },
]

const letterBadgeProps: PropDef[] = [
  { name: "letter", type: "string", description: "Letter(s) displayed inside the badge" },
  { name: "bg", type: "string", description: "Background color (CSS value)" },
  { name: "size", type: "number", default: "16", description: "Width & height in px" },
  { name: "className", type: "string", description: "Additional CSS classes" },
]

const LOGOS = [
  { name: "OpenAI", component: OpenAILogo },
  { name: "Anthropic", component: AnthropicLogo },
  { name: "Google", component: GoogleLogo },
  { name: "Microsoft", component: MicrosoftLogo },
  { name: "GitHub", component: GitHubLogo },
  { name: "Notion", component: NotionLogo },
  { name: "Obsidian", component: ObsidianLogo },
  { name: "Joplin", component: JoplinLogo },
] as const

export function BrandLogosDemo() {
  return (
    <>
      <Section
        title="Brand Logos"
        install="@cherry-studio/ui"
        props={logoProps}
        code={`import { OpenAILogo, AnthropicLogo, GoogleLogo } from "@cherry-studio/ui"

<OpenAILogo size={24} />
<AnthropicLogo size={24} />
<GoogleLogo size={24} />`}
      >
        <div className="grid grid-cols-4 gap-4 sm:grid-cols-8">
          {LOGOS.map(({ name, component: Logo }) => (
            <div
              key={name}
              className="flex flex-col items-center gap-2 rounded-[12px] border p-3"
            >
              <Logo size={24} />
              <span className="text-xs text-muted-foreground">{name}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Larger sizes (32px, 48px):
        </p>
        <div className="mt-2 flex items-end gap-4">
          {LOGOS.slice(0, 4).map(({ name, component: Logo }) => (
            <div key={name} className="flex flex-col items-center gap-1">
              <Logo size={32} />
              <span className="text-[10px] text-muted-foreground">32</span>
            </div>
          ))}
          {LOGOS.slice(0, 4).map(({ name, component: Logo }) => (
            <div key={`lg-${name}`} className="flex flex-col items-center gap-1">
              <Logo size={48} />
              <span className="text-[10px] text-muted-foreground">48</span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="LetterBadge"
        install="@cherry-studio/ui"
        props={letterBadgeProps}
        code={`import { LetterBadge } from "@cherry-studio/ui"

<LetterBadge letter="DS" bg="#4f6ef7" size={24} />
<LetterBadge letter="Q" bg="#7C3AED" size={32} />`}
      >
        <div className="flex flex-wrap gap-3">
          <LetterBadge letter="DS" bg="#4f6ef7" size={24} />
          <LetterBadge letter="Q" bg="#7C3AED" size={24} />
          <LetterBadge letter="SF" bg="#3B82F6" size={24} />
          <LetterBadge letter="C" bg="#4F46E5" size={24} />
          <LetterBadge letter="G" bg="#4f46e5" size={24} />
          <LetterBadge letter="D" bg="#1677FF" size={24} />
          <LetterBadge letter="n8n" bg="#818cf8" size={24} />
          <LetterBadge letter="T" bg="#6366f1" size={24} />
        </div>

        <p className="mt-4 text-sm text-muted-foreground">Different sizes:</p>
        <div className="mt-2 flex items-end gap-3">
          <LetterBadge letter="A" bg="#06b6d4" size={16} />
          <LetterBadge letter="A" bg="#06b6d4" size={24} />
          <LetterBadge letter="A" bg="#06b6d4" size={32} />
          <LetterBadge letter="A" bg="#06b6d4" size={48} />
        </div>
      </Section>

      <Section
        title="Practical: Provider Cards"
        code={`<Card>
  <CardContent className="flex items-center gap-3 py-3">
    <OpenAILogo size={20} />
    <div>
      <p className="text-sm font-medium">OpenAI</p>
      <p className="text-xs text-muted-foreground">GPT-4o, o1, o3</p>
    </div>
  </CardContent>
</Card>`}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { Logo: OpenAILogo, name: "OpenAI", models: "GPT-4o, o1, o3" },
            { Logo: AnthropicLogo, name: "Anthropic", models: "Claude Opus, Sonnet" },
            { Logo: GoogleLogo, name: "Google", models: "Gemini 2.5 Pro, Flash" },
            { Logo: MicrosoftLogo, name: "Microsoft", models: "Azure OpenAI" },
            { Logo: GitHubLogo, name: "GitHub", models: "Copilot, Models" },
            { Logo: NotionLogo, name: "Notion", models: "Knowledge sync" },
          ].map(({ Logo, name, models }) => (
            <Card key={name}>
              <CardContent className="flex items-center gap-3 py-3">
                <Logo size={20} />
                <div>
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground">{models}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </>
  )
}
