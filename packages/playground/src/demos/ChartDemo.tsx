import React from "react"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@cherry-studio/ui"
import { Section } from "../components/Section"
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

export function ChartDemo() {
  return (
    <>
      <Section title="Bar Chart">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="tokens" fill="var(--color-tokens)" radius={4} />
            <Bar dataKey="cost" fill="var(--color-cost)" radius={4} />
          </BarChart>
        </ChartContainer>
      </Section>

      <Section title="Area Chart">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area dataKey="tokens" type="natural" fill="var(--color-tokens)" fillOpacity={0.2} stroke="var(--color-tokens)" />
          </AreaChart>
        </ChartContainer>
      </Section>
    </>
  )
}
