import React from "react"
import {
  Card, Badge, Progress,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  ChartContainer, ChartTooltip, ChartTooltipContent
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { BarChart, Bar, XAxis, CartesianGrid } from "recharts"
import { MessageSquare, Zap, DollarSign, Clock, TrendingUp, TrendingDown } from "lucide-react"

const stats = [
  { label: "Total Chats", value: "1,247", change: "+12%", up: true, icon: MessageSquare },
  { label: "Tokens Used", value: "4.2M", change: "+8%", up: true, icon: Zap },
  { label: "Total Cost", value: "$127.50", change: "-3%", up: false, icon: DollarSign },
  { label: "Avg Response", value: "1.8s", change: "-15%", up: false, icon: Clock },
]

const usageData = [
  { day: "Mon", tokens: 520000 },
  { day: "Tue", tokens: 680000 },
  { day: "Wed", tokens: 450000 },
  { day: "Thu", tokens: 720000 },
  { day: "Fri", tokens: 890000 },
  { day: "Sat", tokens: 340000 },
  { day: "Sun", tokens: 280000 },
]

const chartConfig = { tokens: { label: "Tokens", color: "var(--chart-1)" } }

const modelStats = [
  { model: "GPT-4o", provider: "OpenAI", tokens: "1.8M", cost: "$54.00", usage: 43 },
  { model: "Claude Sonnet 4", provider: "Anthropic", tokens: "1.2M", cost: "$36.00", usage: 29 },
  { model: "Gemini 2.5 Pro", provider: "Google", tokens: "680K", cost: "$20.40", usage: 16 },
  { model: "DeepSeek V3", provider: "DeepSeek", tokens: "520K", cost: "$15.60", usage: 12 },
]

export function DashboardModuleDemo() {
  return (
    <Section title="Dashboard Module" code={`// Compose with: Card, Badge, Chart, Table, Progress`}>
      <div className="max-w-3xl space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s) => (
            <Card key={s.label} className="p-3">
              <div className="flex items-center justify-between mb-2">
                <s.icon className="size-4 text-muted-foreground" />
                <Badge
                  variant="outline"
                  className={`text-[9px] ${s.up ? "text-green-600 border-green-500/20 dark:text-green-400" : "text-blue-600 border-blue-500/20 dark:text-blue-400"}`}
                >
                  {s.up ? <TrendingUp className="size-2.5 mr-0.5" /> : <TrendingDown className="size-2.5 mr-0.5" />}
                  {s.change}
                </Badge>
              </div>
              <p className="text-lg font-semibold tabular-nums">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Chart */}
        <Card className="p-4">
          <p className="text-xs font-medium mb-3">Daily Token Usage</p>
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <BarChart data={usageData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="day" tickLine={false} tickMargin={8} axisLine={false} className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="tokens" fill="var(--color-tokens)" radius={4} />
            </BarChart>
          </ChartContainer>
        </Card>

        {/* Model usage table */}
        <Card className="overflow-hidden">
          <div className="px-4 py-2.5 border-b">
            <p className="text-xs font-medium">Model Usage Breakdown</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead className="w-32">Usage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modelStats.map((m) => (
                <TableRow key={m.model}>
                  <TableCell className="font-medium text-xs">{m.model}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{m.provider}</TableCell>
                  <TableCell className="text-xs tabular-nums">{m.tokens}</TableCell>
                  <TableCell className="text-xs tabular-nums">{m.cost}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={m.usage} className="h-1.5 flex-1" />
                      <span className="text-[10px] text-muted-foreground tabular-nums w-8 text-right">{m.usage}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </Section>
  )
}
