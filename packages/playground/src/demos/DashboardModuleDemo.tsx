import React, { useState } from "react"
import {
  BarChart3, TrendingUp, Clock, MessageSquare, Coins,
  Cpu, Activity, ArrowUpRight, ArrowDownRight,
} from "lucide-react"
import {
  Card, CardContent, CardHeader, CardTitle,
  Badge, Button, Separator,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

/* ═══════════════════════════════════════════
   Mock data
   ═══════════════════════════════════════════ */

const DAILY_USAGE = [
  { day: "周一", conversations: 18, tokens: 0.8 },
  { day: "周二", conversations: 24, tokens: 1.1 },
  { day: "周三", conversations: 31, tokens: 1.4 },
  { day: "周四", conversations: 22, tokens: 1.0 },
  { day: "周五", conversations: 35, tokens: 1.6 },
  { day: "周六", conversations: 12, tokens: 0.5 },
  { day: "周日", conversations: 8, tokens: 0.3 },
]

const MODEL_USAGE = [
  { name: "Claude 4 Sonnet", provider: "Anthropic", tokens: 520000, cost: 2.56, conversations: 48, color: "var(--chart-2)" },
  { name: "GPT-4o", provider: "OpenAI", tokens: 380000, cost: 1.23, conversations: 31, color: "var(--chart-4)" },
  { name: "Gemini 2.5 Pro", provider: "Google", tokens: 180000, cost: 0.49, conversations: 18, color: "var(--chart-1)" },
  { name: "DeepSeek V3", provider: "DeepSeek", tokens: 95000, cost: 0.12, conversations: 12, color: "var(--chart-3)" },
  { name: "Llama 3.3 70B", provider: "Ollama", tokens: 62000, cost: 0, conversations: 7, color: "var(--chart-5)" },
  { name: "GLM-4 Plus", provider: "智谱 AI", tokens: 35000, cost: 0.08, conversations: 5, color: "var(--accent-violet)" },
]

const HOURLY_DISTRIBUTION = [0, 0, 0, 0, 0, 1, 2, 5, 8, 12, 15, 11, 9, 14, 16, 13, 10, 8, 6, 4, 3, 2, 1, 0]

const MONTHLY_TREND = [
  { month: "9月", cost: 2.1 },
  { month: "10月", cost: 2.8 },
  { month: "11月", cost: 3.2 },
  { month: "12月", cost: 3.6 },
  { month: "1月", cost: 3.9 },
  { month: "2月", cost: 4.3 },
]

const RECENT_CONVERSATIONS = [
  { title: "重构 React 组件架构方案", model: "Claude 4 Sonnet", time: "12 分钟前", tokens: 12400 },
  { title: "数据库索引优化分析", model: "GPT-4o", time: "1 小时前", tokens: 8200 },
  { title: "产品需求文档评审", model: "Gemini 2.5 Pro", time: "2 小时前", tokens: 15600 },
  { title: "Python 异步编程最佳实践", model: "DeepSeek V3", time: "3 小时前", tokens: 6800 },
  { title: "UI 设计系统规范讨论", model: "Claude 4 Sonnet", time: "5 小时前", tokens: 9300 },
]

const PROVIDERS = [
  { name: "Anthropic", cost: 2.56, color: "var(--chart-2)" },
  { name: "OpenAI", cost: 1.23, color: "var(--chart-4)" },
  { name: "Google", cost: 0.49, color: "var(--chart-1)" },
  { name: "DeepSeek", cost: 0.12, color: "var(--chart-3)" },
  { name: "智谱 AI", cost: 0.08, color: "var(--accent-violet)" },
]

/* ═══════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════ */

function MiniBarChart({ data, maxVal, color, height = 40 }: { data: number[]; maxVal: number; color: string; height?: number }) {
  return (
    <div className="flex gap-[2px] items-end" style={{ height }}>
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-[2px] transition-all hover:opacity-80"
          style={{
            height: `${Math.max((v / maxVal) * 100, 4)}%`,
            backgroundColor: color,
            opacity: v === Math.max(...data) ? 0.8 : 0.35,
          }}
        />
      ))}
    </div>
  )
}

function DonutChart({ data, total }: { data: { name: string; cost: number; color: string }[]; total: number }) {
  let offset = 0
  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        {data.map(p => {
          const pct = (p.cost / total) * 100
          const el = (
            <circle
              key={p.name} r="15.915" cx="18" cy="18" fill="none"
              stroke={p.color} strokeWidth="3.5"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeDashoffset={`-${offset}`}
              strokeLinecap="round" opacity="0.7"
            />
          )
          offset += pct
          return el
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs text-foreground/70 font-bold">${total.toFixed(0)}</span>
        <span className="text-xs text-muted-foreground/60">总计</span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Stats Cards using Card component
   ═══════════════════════════════════════════ */

function StatCard({ label, value, unit, sub, icon: Icon, trend }: {
  label: string; value: string | number; unit?: string; sub?: React.ReactNode
  icon: React.ComponentType<{ size?: number; className?: string }>
  trend?: { value: string; positive: boolean }
}) {
  return (
    <Card className="shadow-none">
      <CardContent className="p-3.5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground">{label}</p>
          <div className="w-6 h-6 rounded-[10px] bg-accent/50 flex items-center justify-center">
            <Icon size={12} className="text-muted-foreground" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl text-foreground font-bold tracking-tight">{value}</span>
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        </div>
        {trend && (
          <div className="flex items-center gap-1 mt-1.5">
            {trend.positive ? <ArrowUpRight size={10} className="text-success" /> : <ArrowDownRight size={10} className="text-error" />}
            <span className={`text-[10px] ${trend.positive ? "text-success" : "text-error"}`}>{trend.value}</span>
          </div>
        )}
        {sub && <div className="mt-1.5">{sub}</div>}
      </CardContent>
    </Card>
  )
}

/* ═══════════════════════════════════════════
   Model Table using table primitives
   ═══════════════════════════════════════════ */

function ModelTable({ data }: { data: typeof MODEL_USAGE }) {
  const maxTokens = Math.max(...data.map(m => m.tokens))
  return (
    <div className="overflow-x-auto">
      <Table className="text-xs">
        <TableHeader>
          <TableRow>
            <TableHead className="w-8">#</TableHead>
            <TableHead>模型</TableHead>
            <TableHead>服务商</TableHead>
            <TableHead className="text-right">Token</TableHead>
            <TableHead className="text-right">对话数</TableHead>
            <TableHead className="text-right">费用</TableHead>
            <TableHead className="w-24">占比</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((m, i) => (
            <TableRow key={m.name}>
              <TableCell className="text-muted-foreground/40">{i + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                  <span className="text-foreground/70">{m.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground/50">{m.provider}</TableCell>
              <TableCell className="text-right text-foreground/60 tabular-nums">{(m.tokens / 1000).toFixed(0)}K</TableCell>
              <TableCell className="text-right text-foreground/60 tabular-nums">{m.conversations}</TableCell>
              <TableCell className="text-right text-foreground/70 font-medium tabular-nums">
                {m.cost > 0 ? `$${m.cost.toFixed(2)}` : "Free"}
              </TableCell>
              <TableCell>
                <div className="h-[4px] rounded-full bg-muted/30 overflow-hidden w-24">
                  <div className="h-full rounded-full" style={{ width: `${(m.tokens / maxTokens) * 100}%`, backgroundColor: m.color, opacity: 0.6 }} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Cost Analysis Tab
   ═══════════════════════════════════════════ */

function CostAnalysis() {
  const totalCost = MODEL_USAGE.reduce((s, m) => s + m.cost, 0)
  const maxCost = Math.max(...MONTHLY_TREND.map(t => t.cost))

  return (
    <div className="space-y-4">
      {/* Provider breakdown */}
      <Card className="shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">服务商费用占比</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <DonutChart data={PROVIDERS} total={totalCost} />
            <div className="flex-1 space-y-1.5">
              {PROVIDERS.map(p => (
                <div key={p.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-xs text-foreground/60 flex-1">{p.name}</span>
                  <span className="text-xs text-foreground/40 tabular-nums">${p.cost.toFixed(2)}</span>
                  <Badge variant="secondary" className="text-xs px-1.5">{Math.round((p.cost / totalCost) * 100)}%</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly trend */}
      <Card className="shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">月度费用趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-[6px]" style={{ height: 80 }}>
            {MONTHLY_TREND.map((m, i) => {
              const isLast = i === MONTHLY_TREND.length - 1
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className={`text-xs tabular-nums ${isLast ? "text-foreground/50 font-medium" : "text-muted-foreground/60"}`}>${m.cost.toFixed(1)}</span>
                  <div className={`w-full rounded-[3px] ${isLast ? "bg-primary/60" : "bg-muted/40"}`} style={{ height: `${(m.cost / maxCost) * 50}px` }} />
                  <span className="text-[10px] text-muted-foreground/60">{m.month}</span>
                </div>
              )
            })}
          </div>
          <Separator className="my-3" />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground/40 mb-0.5">6个月总计</p>
              <p className="text-sm text-foreground/70 font-bold tabular-nums">${MONTHLY_TREND.reduce((s, m) => s + m.cost, 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground/40 mb-0.5">月均</p>
              <p className="text-sm text-foreground/70 font-bold tabular-nums">${(MONTHLY_TREND.reduce((s, m) => s + m.cost, 0) / MONTHLY_TREND.length).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground/40 mb-0.5">环比</p>
              <p className="text-sm text-success font-bold">+10.2%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Props
   ═══════════════════════════════════════════ */

const dashboardProps: PropDef[] = [
  { name: "timeRange", type: '"today" | "this-week" | "this-month" | "all"', default: '"this-month"', description: "Date range filter" },
  { name: "modelUsage", type: "ModelUsage[]", default: "[]", description: "Model usage statistics" },
  { name: "dailyUsage", type: "DailyUsage[]", default: "[]", description: "Daily conversation data" },
]

/* ═══════════════════════════════════════════
   Main Demo
   ═══════════════════════════════════════════ */

export function DashboardModuleDemo() {
  const [timeRange, setTimeRange] = useState("this-month")
  const [selectedTab, setSelectedTab] = useState("overview")

  const totalTokens = MODEL_USAGE.reduce((s, m) => s + m.tokens, 0)
  const totalCost = MODEL_USAGE.reduce((s, m) => s + m.cost, 0)
  const totalConversations = MODEL_USAGE.reduce((s, m) => s + m.conversations, 0)
  const maxDailyConv = Math.max(...DAILY_USAGE.map(d => d.conversations))
  const maxHourly = Math.max(...HOURLY_DISTRIBUTION)
  const avgTokensPerConv = Math.round(totalTokens / totalConversations)

  return (
    <Section title="Dashboard Module" install="npm install @cherry-studio/ui" props={dashboardProps} code={`// Uses Card, Badge, Tabs, Select, and Separator components
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">概览</TabsTrigger>
    <TabsTrigger value="models">模型分析</TabsTrigger>
    <TabsTrigger value="cost">费用</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    <div className="grid grid-cols-4 gap-2">
      <Card>...</Card>
    </div>
  </TabsContent>
</Tabs>`}>
      <div className="rounded-[24px] border bg-background overflow-hidden">
        <div className="px-5 py-4 space-y-4">
          {/* Header with filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-foreground/50" />
              <h2 className="text-sm text-foreground/90 font-medium tracking-tight">数据统计</h2>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="h-7 w-auto px-2.5 rounded-[10px] text-xs gap-1" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">今日</SelectItem>
                  <SelectItem value="this-week">本周</SelectItem>
                  <SelectItem value="this-month">本月</SelectItem>
                  <SelectItem value="all">全部</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => alert("报告已导出")}>
                <Activity size={10} /> 导出
              </Button>
            </div>
          </div>

          {/* Stat Cards row */}
          <div className="grid grid-cols-4 gap-2">
            <StatCard
              label="总对话数" value={totalConversations} icon={MessageSquare}
              trend={{ value: "↑ 18% 较上月", positive: true }}
            />
            <StatCard
              label="Token 总量" value={(totalTokens / 1000000).toFixed(1)} unit="M" icon={Cpu}
              sub={<span className="text-[10px] text-muted-foreground">平均 {(avgTokensPerConv / 1000).toFixed(1)}K / 对话</span>}
            />
            <StatCard
              label="总花费" value={`$${totalCost.toFixed(2)}`} icon={Coins}
              trend={{ value: "↑ 10.2% 环比", positive: false }}
            />
            <StatCard
              label="活跃天数" value={24} unit="/ 28 天" icon={Activity}
              sub={
                <div className="h-[3px] rounded-full bg-muted/30 overflow-hidden">
                  <div className="h-full rounded-full bg-primary/40" style={{ width: "86%" }} />
                </div>
              }
            />
          </div>

          {/* Tabs: 概览 / 模型分析 / 费用 */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="overview">概览</TabsTrigger>
              <TabsTrigger value="models">模型分析</TabsTrigger>
              <TabsTrigger value="cost">费用</TabsTrigger>
            </TabsList>

            {/* ── Overview Tab ── */}
            <TabsContent value="overview" className="space-y-3 mt-3">
              {/* Charts row */}
              <div className="grid grid-cols-2 gap-2">
                <Card className="shadow-none">
                  <CardContent className="p-3.5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-muted-foreground">每日对话趋势</p>
                      <Badge variant="secondary" className="text-xs">最近 7 天</Badge>
                    </div>
                    <MiniBarChart data={DAILY_USAGE.map(d => d.conversations)} maxVal={maxDailyConv} color="var(--success, #49BA61)" height={60} />
                    <div className="flex justify-between mt-1.5 px-[1px]">
                      {DAILY_USAGE.map(d => <span key={d.day} className="text-[10px] text-muted-foreground/30 flex-1 text-center">{d.day}</span>)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-none">
                  <CardContent className="p-3.5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-muted-foreground">活跃时段分布</p>
                      <Badge variant="secondary" className="text-xs">24 小时</Badge>
                    </div>
                    <MiniBarChart data={HOURLY_DISTRIBUTION} maxVal={maxHourly} color="var(--accent-violet, #8755E9)" height={60} />
                    <div className="flex justify-between mt-1.5 px-[1px]">
                      {[0, 6, 12, 18, 23].map(h => <span key={h} className="text-[10px] text-muted-foreground/30">{h}:00</span>)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent conversations */}
              <Card className="shadow-none">
                <CardContent className="p-3.5">
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-xs text-muted-foreground">最近对话</p>
                    <Clock size={10} className="text-muted-foreground/30" />
                  </div>
                  <div className="space-y-[1px]">
                    {RECENT_CONVERSATIONS.map((conv, i) => (
                      <div key={i} className="flex items-center gap-2 py-[5px] group">
                        <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 flex-shrink-0 group-hover:bg-foreground/60 transition-colors" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground/55 truncate group-hover:text-foreground/75 transition-colors">{conv.title}</p>
                          <div className="flex items-center gap-2 mt-[1px]">
                            <Badge variant="outline" className="text-xs px-1 py-0 h-3.5">{conv.model}</Badge>
                            <span className="text-[10px] text-muted-foreground/50">{conv.time}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground/50 flex-shrink-0 tabular-nums">{(conv.tokens / 1000).toFixed(1)}K</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Model Analysis Tab ── */}
            <TabsContent value="models" className="space-y-3 mt-3">
              <Card className="shadow-none">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">模型使用明细</CardTitle>
                    <Badge variant="secondary" className="text-xs">{MODEL_USAGE.length} 个模型</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ModelTable data={MODEL_USAGE} />
                </CardContent>
              </Card>

              {/* Model pie + stats */}
              <div className="grid grid-cols-2 gap-2">
                <Card className="shadow-none">
                  <CardContent className="p-3.5">
                    <p className="text-xs text-muted-foreground mb-3">Token 使用分布</p>
                    <div className="flex items-center gap-3">
                      <DonutChart data={MODEL_USAGE.map(m => ({ name: m.name, cost: m.tokens / 1000, color: m.color }))} total={totalTokens / 1000} />
                      <div className="flex-1 space-y-1">
                        {MODEL_USAGE.slice(0, 4).map(m => (
                          <div key={m.name} className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.color }} />
                            <span className="text-[10px] text-foreground/50 flex-1 truncate">{m.name}</span>
                            <span className="text-[10px] text-foreground/30 tabular-nums">{Math.round((m.tokens / totalTokens) * 100)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-none">
                  <CardContent className="p-3.5">
                    <p className="text-xs text-muted-foreground mb-3">连接状态</p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-[10px] text-muted-foreground/40 mb-0.5">平均延迟</p>
                        <p className="text-sm text-foreground/60 font-semibold tabular-nums">118ms</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground/40 mb-0.5">成功率</p>
                        <p className="text-sm text-success font-semibold">99.7%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground/40 mb-0.5">连接数</p>
                        <p className="text-sm text-foreground/60 font-semibold">5/8</p>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="space-y-1.5">
                      {PROVIDERS.slice(0, 3).map(p => (
                        <div key={p.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-success" />
                            <span className="text-[10px] text-foreground/50">{p.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs px-1 py-0 h-3.5 text-success">connected</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ── Cost Tab ── */}
            <TabsContent value="cost" className="mt-3">
              <CostAnalysis />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Section>
  )
}
