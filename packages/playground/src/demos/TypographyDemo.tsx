import { Section, type PropDef } from "../components/Section"
import { Typography } from "@cherry-studio/ui"

const props: PropDef[] = [
  { name: "variant", type: '"display" | "page-title" | "section-title" | "subtitle" | "body" | "body-sm" | "label" | "caption"', default: '"body"', description: "Visual style of the text" },
  { name: "as", type: "React.ElementType", default: "auto (based on variant)", description: "Override the rendered HTML element" },
  { name: "asChild", type: "boolean", default: "false", description: "Use Radix Slot for composition" },
]

export function TypographyDemo() {
  return (
    <>
      <Section
        title="All Variants"
        props={props}
        code={`<Typography variant="display">Display Heading</Typography>
<Typography variant="page-title">Page Title</Typography>
<Typography variant="section-title">Section Title</Typography>
<Typography variant="subtitle">Subtitle / Subsection</Typography>
<Typography variant="body">Body text for paragraphs</Typography>
<Typography variant="body-sm">Small body text</Typography>
<Typography variant="label">Label text</Typography>
<Typography variant="caption">Caption text</Typography>`}
      >
        <div className="space-y-4">
          <Typography variant="display">Display Heading</Typography>
          <Typography variant="page-title">Page Title</Typography>
          <Typography variant="section-title">Section Title</Typography>
          <Typography variant="subtitle">Subtitle / Subsection</Typography>
          <Typography variant="body">Body text — default paragraph style used for content.</Typography>
          <Typography variant="body-sm">Small body text — descriptions, secondary info.</Typography>
          <Typography variant="label">Label text</Typography>
          <Typography variant="caption">Caption text — timestamps, metadata</Typography>
        </div>
      </Section>

      <Section
        title="Semantic HTML Mapping"
        code={`// Each variant maps to a default HTML element:
// display     → <h1>
// page-title  → <h1>
// section-title → <h2>
// subtitle    → <h3>
// body        → <p>
// body-sm     → <p>
// label       → <span>
// caption     → <span>

// Override with 'as' prop:
<Typography variant="subtitle" as="h4">
  Renders as h4 instead of h3
</Typography>`}
      >
        <div className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="text-xs text-muted-foreground/40 w-24 flex-shrink-0 font-mono">h1 (display)</span>
            <Typography variant="display">Display</Typography>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-xs text-muted-foreground/40 w-24 flex-shrink-0 font-mono">h1 (page)</span>
            <Typography variant="page-title">Page Title</Typography>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-xs text-muted-foreground/40 w-24 flex-shrink-0 font-mono">h2</span>
            <Typography variant="section-title">Section Title</Typography>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-xs text-muted-foreground/40 w-24 flex-shrink-0 font-mono">h3</span>
            <Typography variant="subtitle">Subtitle</Typography>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-xs text-muted-foreground/40 w-24 flex-shrink-0 font-mono">h4 (override)</span>
            <Typography variant="subtitle" as="h4">Subtitle as h4</Typography>
          </div>
        </div>
      </Section>

      <Section
        title="Settings Page Pattern"
        code={`<Typography variant="page-title">模型服务</Typography>
<Typography variant="caption">管理 API 接口和模型配置</Typography>
<div className="mt-4 space-y-3">
  <Typography variant="subtitle">基本设置</Typography>
  <Typography variant="subtitle">高级选项</Typography>
</div>`}
      >
        <div>
          <Typography variant="page-title">模型服务</Typography>
          <Typography variant="caption" className="mt-1">管理 API 接口和模型配置</Typography>
          <div className="mt-4 space-y-3 pl-1 border-l-2 border-border/30">
            <Typography variant="subtitle" className="pl-3">基本设置</Typography>
            <Typography variant="subtitle" className="pl-3">高级选项</Typography>
          </div>
        </div>
      </Section>
    </>
  )
}
