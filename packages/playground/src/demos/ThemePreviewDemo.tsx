import React, { useState } from "react"
import { Button, Badge, Card, CardContent, Input, Progress } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

const semanticColors = [
  { name: "background", var: "--background", label: "Background" },
  { name: "foreground", var: "--foreground", label: "Foreground" },
  { name: "card", var: "--card", label: "Card" },
  { name: "card-foreground", var: "--card-foreground", label: "Card Foreground" },
  { name: "popover", var: "--popover", label: "Popover" },
  { name: "popover-foreground", var: "--popover-foreground", label: "Popover Foreground" },
  { name: "primary", var: "--primary", label: "Primary" },
  { name: "primary-foreground", var: "--primary-foreground", label: "Primary Foreground" },
  { name: "secondary", var: "--secondary", label: "Secondary" },
  { name: "secondary-foreground", var: "--secondary-foreground", label: "Secondary Foreground" },
  { name: "muted", var: "--muted", label: "Muted" },
  { name: "muted-foreground", var: "--muted-foreground", label: "Muted Foreground" },
  { name: "accent", var: "--accent", label: "Accent" },
  { name: "accent-foreground", var: "--accent-foreground", label: "Accent Foreground" },
  { name: "destructive", var: "--destructive", label: "Destructive" },
  { name: "destructive-foreground", var: "--destructive-foreground", label: "Destructive Foreground" },
  { name: "border", var: "--border", label: "Border" },
  { name: "input", var: "--input", label: "Input" },
  { name: "ring", var: "--ring", label: "Ring" },
]

const chartColors = [
  { name: "chart-1", var: "--chart-1", label: "Chart 1" },
  { name: "chart-2", var: "--chart-2", label: "Chart 2" },
  { name: "chart-3", var: "--chart-3", label: "Chart 3" },
  { name: "chart-4", var: "--chart-4", label: "Chart 4" },
  { name: "chart-5", var: "--chart-5", label: "Chart 5" },
]

const sidebarColors = [
  { name: "sidebar-background", var: "--sidebar-background", label: "Sidebar BG" },
  { name: "sidebar-foreground", var: "--sidebar-foreground", label: "Sidebar FG" },
  { name: "sidebar-primary", var: "--sidebar-primary", label: "Sidebar Primary" },
  { name: "sidebar-primary-foreground", var: "--sidebar-primary-foreground", label: "Sidebar Primary FG" },
  { name: "sidebar-accent", var: "--sidebar-accent", label: "Sidebar Accent" },
  { name: "sidebar-accent-foreground", var: "--sidebar-accent-foreground", label: "Sidebar Accent FG" },
  { name: "sidebar-border", var: "--sidebar-border", label: "Sidebar Border" },
  { name: "sidebar-ring", var: "--sidebar-ring", label: "Sidebar Ring" },
]

function ColorSwatch({ name, cssVar, label }: { name: string; cssVar: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-8 w-8 rounded-[12px] border border-border shadow-sm flex-shrink-0"
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <div className="min-w-0">
        <p className="text-xs font-medium truncate">{label}</p>
        <p className="text-[10px] text-muted-foreground font-mono">{cssVar}</p>
      </div>
    </div>
  )
}

const roleColors = [
  { name: "cherry-user", var: "--cherry-user", label: "User (Branch Tree)" },
  { name: "cherry-assistant", var: "--cherry-assistant", label: "Assistant (Branch Tree)" },
  { name: "cherry-parallel", var: "--cherry-parallel", label: "Parallel (Branch Tree)" },
]

const themePreviewProps: PropDef[] = [
  { name: "className", type: "string", default: "undefined", description: "Additional CSS" },
]

export function ThemePreviewDemo() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  return (
    <>
      <Section title="Semantic Colors" install="npm install @cherry-studio/ui" props={themePreviewProps} code={`/* Use CSS variables for theming */
<div style={{ color: "var(--foreground)", background: "var(--background)" }}>
  <Button className="bg-primary text-primary-foreground">Themed</Button>
</div>`}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {semanticColors.map((c) => (
            <ColorSwatch key={c.name} name={c.name} cssVar={c.var} label={c.label} />
          ))}
        </div>
      </Section>

      <Section title="Chart Colors">
        <div className="flex gap-4 flex-wrap">
          {chartColors.map((c) => (
            <ColorSwatch key={c.name} name={c.name} cssVar={c.var} label={c.label} />
          ))}
        </div>
      </Section>

      <Section title="Sidebar Colors">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sidebarColors.map((c) => (
            <ColorSwatch key={c.name} name={c.name} cssVar={c.var} label={c.label} />
          ))}
        </div>
      </Section>

      <Section title="Role Colors (Branch Tree)">
        <div className="flex gap-4 flex-wrap">
          {roleColors.map((c) => (
            <ColorSwatch key={c.name} name={c.name} cssVar={c.var} label={c.label} />
          ))}
        </div>
      </Section>

      <Section title="Animation Tokens">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Fast", var: "--duration-fast", value: "75ms" },
            { label: "Normal", var: "--duration-normal", value: "150ms" },
            { label: "Slow", var: "--duration-slow", value: "200ms" },
            { label: "Slower", var: "--duration-slower", value: "300ms" },
          ].map((t) => (
            <div key={t.var} className="space-y-1.5">
              <div
                className="h-8 w-full rounded-[12px] bg-primary hover:scale-105"
                style={{ transitionDuration: `var(${t.var})`, transitionProperty: "transform" }}
              />
              <p className="text-xs font-medium">{t.label}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{t.value}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Border Radius">
        <div className="flex gap-6 items-end flex-wrap">
          {[
            { label: "radius-sm", class: "rounded-sm", size: "0.25rem" },
            { label: "radius", class: "rounded-md", size: "calc(var(--radius))" },
            { label: "radius-md", class: "rounded-[12px]", size: "calc(var(--radius) + 2px)" },
            { label: "radius-lg", class: "rounded-xl", size: "calc(var(--radius) + 4px)" },
            { label: "radius-full", class: "rounded-full", size: "9999px" },
          ].map((r) => (
            <div key={r.label} className="text-center space-y-2">
              <div className={`h-16 w-16 bg-primary/20 border-2 border-primary ${r.class}`} />
              <div>
                <p className="text-xs font-medium">{r.label}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{r.size}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="space-y-3 max-w-lg">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">Heading 1</h1>
          <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight">Heading 2</h2>
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Heading 3</h3>
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">Heading 4</h4>
          <p className="text-base leading-7">Body text — The quick brown fox jumps over the lazy dog.</p>
          <p className="text-sm text-muted-foreground">Muted text — Secondary information or descriptions.</p>
          <p className="text-xs text-muted-foreground">Small text — Metadata, timestamps, and captions.</p>
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
            inline code
          </code>
        </div>
      </Section>

      <Section title="Spacing Scale">
        <div className="space-y-2">
          {[1, 2, 3, 4, 6, 8, 12, 16].map((n) => (
            <div key={n} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-8 text-right font-mono">{n}</span>
              <div
                className="h-3 bg-primary/30 rounded-sm"
                style={{ width: `${n * 4}px` }}
              />
              <span className="text-[10px] text-muted-foreground font-mono">{n * 4}px / {n * 0.25}rem</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Component Preview">
        <div className="mb-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? "Switch to Dark" : "Switch to Light"}
          </Button>
        </div>
        <Card className={`max-w-sm ${theme === "dark" ? "dark bg-background text-foreground" : ""}`}>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Theme Test Card ({theme})</h4>
              <p className="text-xs text-muted-foreground">Verify all theme tokens render correctly.</p>
            </div>
            <Input placeholder="Input field" />
            <Progress value={65} />
            <div className="flex gap-2 flex-wrap">
              <Button size="sm">Primary</Button>
              <Button size="sm" variant="secondary">Secondary</Button>
              <Button size="sm" variant="destructive">Destructive</Button>
              <Button size="sm" variant="outline">Outline</Button>
              <Button size="sm" variant="ghost">Ghost</Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </CardContent>
        </Card>
      </Section>
    </>
  )
}
