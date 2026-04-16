import React from "react"
import { SimpleTooltip, Button, Badge } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { Info, HelpCircle, Settings, Star, Copy, Download } from "lucide-react"

export function SimpleTooltipDemo() {
  return (
    <>
      <Section title="Basic Usage" install="custom component" props={[
        { name: "content", type: "string", description: "Tooltip text content" },
        { name: "side", type: '"top" | "right" | "bottom" | "left"', default: '"right"', description: "Placement side" },
        { name: "sideOffset", type: "number", default: "8", description: "Offset from trigger in px" },
        { name: "delayDuration", type: "number", default: "400", description: "Delay before showing (ms)" },
      ]} code={`import { SimpleTooltip } from "@cherry-studio/ui"

<SimpleTooltip content="Help text" side="top">
  <button>Hover me</button>
</SimpleTooltip>`}>
        <div className="flex flex-wrap gap-4">
          <SimpleTooltip content="This is a tooltip" side="top">
            <Button variant="outline" size="icon"><Info className="h-4 w-4" /></Button>
          </SimpleTooltip>
          <SimpleTooltip content="Get help" side="bottom">
            <Button variant="outline" size="icon"><HelpCircle className="h-4 w-4" /></Button>
          </SimpleTooltip>
          <SimpleTooltip content="Settings" side="left">
            <Button variant="outline" size="icon"><Settings className="h-4 w-4" /></Button>
          </SimpleTooltip>
          <SimpleTooltip content="Favorite" side="right">
            <Button variant="outline" size="icon"><Star className="h-4 w-4" /></Button>
          </SimpleTooltip>
        </div>
      </Section>

      <Section title="With Text Buttons">
        <div className="flex flex-wrap gap-3">
          <SimpleTooltip content="Copy to clipboard" side="bottom">
            <Button variant="outline"><Copy className="mr-2 h-4 w-4" /> Copy</Button>
          </SimpleTooltip>
          <SimpleTooltip content="Download as PDF" side="bottom">
            <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>
          </SimpleTooltip>
        </div>
      </Section>

      <Section title="Inline Elements">
        <p className="text-sm text-muted-foreground">
          Hover over the{" "}
          <SimpleTooltip content="This is the primary color used throughout the application" side="top">
            <Badge variant="outline" className="cursor-help">primary color</Badge>
          </SimpleTooltip>{" "}
          badge to see the tooltip. It also works on{" "}
          <SimpleTooltip content="SimpleTooltip wraps Shadcn Tooltip with a simplified API" side="top">
            <span className="underline decoration-dashed cursor-help font-medium text-foreground">inline text</span>
          </SimpleTooltip>.
        </p>
      </Section>

      <Section title="Long Content">
        <SimpleTooltip content="This is a longer tooltip that explains a complex feature. SimpleTooltip automatically handles max-width and text wrapping for content up to 240px wide." side="bottom">
          <Button variant="outline">Hover for long tooltip</Button>
        </SimpleTooltip>
      </Section>

      <Section title="Empty Content (no tooltip)">
        <div className="flex gap-3">
          <SimpleTooltip content="This has a tooltip" side="top">
            <Button variant="outline">With tooltip</Button>
          </SimpleTooltip>
          <SimpleTooltip content="" side="top">
            <Button variant="outline">No tooltip (empty content)</Button>
          </SimpleTooltip>
        </div>
      </Section>

      <Section title="Practical: Toolbar with Tooltips">
        <div className="inline-flex items-center gap-0.5 rounded-xl border p-1">
          {[
            { icon: Copy, label: "Copy" },
            { icon: Download, label: "Download" },
            { icon: Star, label: "Favorite" },
            { icon: Settings, label: "Settings" },
          ].map(({ icon: Icon, label }) => (
            <SimpleTooltip key={label} content={label} side="bottom" delayDuration={200}>
              <Button variant="ghost" className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                <Icon className="h-4 w-4" />
              </Button>
            </SimpleTooltip>
          ))}
        </div>
      </Section>
    </>
  )
}
