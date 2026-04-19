import React from "react"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts"

const data = [
  { month: "Jan", tokens: 4000, cost: 24 },
  { month: "Feb", tokens: 3000, cost: 18 },
  { month: "Mar", tokens: 5000, cost: 30 },
  { month: "Apr", tokens: 4500, cost: 27 },
  { month: "May", tokens: 6000, cost: 36 },
  { month: "Jun", tokens: 5500, cost: 33 },
]

const chartConfig = {
  tokens: { label: "Tokens", color: "var(--chart-1)" },
  cost: { label: "Cost ($)", color: "var(--chart-2)" },
}

// recharts components have JSX compatibility issues with newer React types
const XAxisAny = XAxis as any
const BarAny = Bar as any
const AreaAny = Area as any

export function ChartDemo() {
  return (
    <>
      <Section title="Bar Chart" install="npx shadcn@latest add chart" props={[
          { name: "config", type: "ChartConfig", description: "Chart configuration object" },
          { name: "className", type: "string", default: "undefined", description: "Container className" },
        ]} code={`import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@cherry-studio/ui"
import { BarChart, Bar, XAxis } from "recharts"

const config = { tokens: { label: "Tokens", color: "var(--chart-1)" } }

<ChartContainer config={config} className="h-[250px] w-full">
  <BarChart data={data}>
    <XAxis dataKey="month" />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Bar dataKey="tokens" fill="var(--color-tokens)" radius={4} />
  </BarChart>
</ChartContainer>`}>
        <div className="max-w-2xl">
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxisAny dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <BarAny dataKey="tokens" fill="var(--color-tokens)" radius={4} />
              <BarAny dataKey="cost" fill="var(--color-cost)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
      </Section>

      <Section title="Area Chart">
        <div className="max-w-2xl">
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxisAny dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <AreaAny dataKey="tokens" type="natural" fill="var(--color-tokens)" fillOpacity={0.2} stroke="var(--color-tokens)" />
            </AreaChart>
          </ChartContainer>
        </div>
      </Section>
    </>
  )
}
