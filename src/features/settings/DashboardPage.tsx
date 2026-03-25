import React, { useState } from 'react';
import {
  BarChart3, TrendingUp, Clock, MessageSquare, Coins,
  Cpu, Activity,
} from 'lucide-react';
import { InlineSelect } from './shared';

// ===========================
// Mock data
// ===========================
const DAILY_USAGE = [
  { day: '周一', conversations: 18, tokens: 0.8 },
  { day: '周二', conversations: 24, tokens: 1.1 },
  { day: '周三', conversations: 31, tokens: 1.4 },
  { day: '周四', conversations: 22, tokens: 1.0 },
  { day: '周五', conversations: 35, tokens: 1.6 },
  { day: '周六', conversations: 12, tokens: 0.5 },
  { day: '周日', conversations: 8, tokens: 0.3 },
];

const MODEL_USAGE = [
  { name: 'Claude 4 Sonnet', provider: 'Anthropic', tokens: 520000, cost: 2.56, conversations: 48, color: '#d97706' },
  { name: 'GPT-4o', provider: 'OpenAI', tokens: 380000, cost: 1.23, conversations: 31, color: '#10a37f' },
  { name: 'Gemini 2.5 Pro', provider: 'Google', tokens: 180000, cost: 0.49, conversations: 18, color: '#4285f4' },
  { name: 'DeepSeek V3', provider: 'DeepSeek', tokens: 95000, cost: 0.12, conversations: 12, color: '#4f6ef7' },
  { name: 'Llama 3.3 70B', provider: 'Ollama', tokens: 62000, cost: 0, conversations: 7, color: '#888' },
  { name: 'GLM-4 Plus', provider: '智谱 AI', tokens: 35000, cost: 0.08, conversations: 5, color: '#2563eb' },
];

const HOURLY_DISTRIBUTION = [
  0, 0, 0, 0, 0, 1, 2, 5, 8, 12, 15, 11, 9, 14, 16, 13, 10, 8, 6, 4, 3, 2, 1, 0,
];

const MONTHLY_TREND = [
  { month: '9月', cost: 2.1, tokens: 0.6 },
  { month: '10月', cost: 2.8, tokens: 0.8 },
  { month: '11月', cost: 3.2, tokens: 0.9 },
  { month: '12月', cost: 3.6, tokens: 1.0 },
  { month: '1月', cost: 3.9, tokens: 1.1 },
  { month: '2月', cost: 4.3, tokens: 1.2 },
];

const RECENT_CONVERSATIONS = [
  { title: '重构 React 组件架构方案', model: 'Claude 4 Sonnet', time: '12 分钟前', tokens: 12400 },
  { title: '数据库索引优化分析', model: 'GPT-4o', time: '1 小时前', tokens: 8200 },
  { title: '产品需求文档评审', model: 'Gemini 2.5 Pro', time: '2 小时前', tokens: 15600 },
  { title: 'Python 异步编程最佳实践', model: 'DeepSeek V3', time: '3 小时前', tokens: 6800 },
  { title: 'UI 设计系统规范讨论', model: 'Claude 4 Sonnet', time: '5 小时前', tokens: 9300 },
];

// ===========================
// Sub-components
// ===========================
const card = "bg-foreground/[0.03] border border-foreground/[0.06] rounded-2xl p-3.5 hover:border-foreground/[0.12] transition-all duration-200";
const cardLabel = "text-[9px] text-foreground/30 tracking-wide";

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
  );
}

function StatCard({ label, value, unit, sub, icon: Icon, iconColor, onClick }: {
  label: string; value: string | number; unit?: string; sub?: React.ReactNode;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconColor?: string; onClick?: () => void;
}) {
  return (
    <div className={`${card} ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <div className="flex items-center justify-between mb-2">
        <p className={cardLabel}>{label}</p>
        <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${iconColor || 'bg-foreground/[0.06]'}`}>
          <Icon size={10} className="text-current" />
        </div>
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-[20px] text-foreground/70" style={{ fontWeight: 700 }}>{value}</span>
        {unit && <span className="text-[10px] text-foreground/25">{unit}</span>}
      </div>
      {sub && <div className="mt-1.5">{sub}</div>}
    </div>
  );
}

// ===========================
// DashboardPage
// ===========================
export function DashboardPage() {
  const [timeRange, setTimeRange] = useState('this-month');

  const totalTokens = MODEL_USAGE.reduce((s, m) => s + m.tokens, 0);
  const totalCost = MODEL_USAGE.reduce((s, m) => s + m.cost, 0);
  const totalConversations = MODEL_USAGE.reduce((s, m) => s + m.conversations, 0);
  const maxDailyConv = Math.max(...DAILY_USAGE.map(d => d.conversations));
  const maxHourly = Math.max(...HOURLY_DISTRIBUTION);
  const maxModelTokens = Math.max(...MODEL_USAGE.map(m => m.tokens));
  const avgTokensPerConv = Math.round(totalTokens / totalConversations);

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 size={14} className="text-foreground/50" />
          <h2 className="text-[13px] text-foreground/90" style={{ fontWeight: 500 }}>数据统计</h2>
        </div>
        <InlineSelect
          value={timeRange}
          onChange={setTimeRange}
          options={[
            { value: 'today', label: '今日' },
            { value: 'this-week', label: '本周' },
            { value: 'this-month', label: '本月' },
            { value: 'all', label: '全部' },
          ]}
        />
      </div>

      {/* Row 1: 4 stat cards */}
      <div className="grid grid-cols-4 gap-2 mb-2">
        <StatCard
          label="总对话数" value={totalConversations} icon={MessageSquare}
          iconColor="bg-blue-500/10 text-blue-400"
          sub={
            <div className="flex items-center gap-1">
              <TrendingUp size={9} className="text-primary" />
              <span className="text-[9px] text-primary">↑ 18% 较上月</span>
            </div>
          }
        />
        <StatCard
          label="Token 总量" value={(totalTokens / 1000000).toFixed(1)} unit="M" icon={Cpu}
          iconColor="bg-violet-500/10 text-violet-400"
          sub={
            <span className="text-[9px] text-foreground/25">平均 {(avgTokensPerConv / 1000).toFixed(1)}K / 对话</span>
          }
        />
        <StatCard
          label="总花费" value={`$${totalCost.toFixed(2)}`} icon={Coins}
          iconColor="bg-amber-500/10 text-amber-400"
          sub={
            <span className="text-[9px] text-foreground/25">日均 ${(totalCost / 28).toFixed(2)}</span>
          }
        />
        <StatCard
          label="活跃天数" value={24} unit="天" icon={Activity}
          iconColor="bg-foreground/[0.06] text-foreground/50"
          sub={
            <div className="h-[3px] rounded-full bg-foreground/[0.06] overflow-hidden">
              <div className="h-full rounded-full bg-primary/40" style={{ width: '86%' }} />
            </div>
          }
        />
      </div>

      {/* Row 2: 每日对话趋势 + 时段分布 */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className={card}>
          <div className="flex items-center justify-between mb-3">
            <p className={cardLabel}>每日对话趋势</p>
            <span className="text-[9px] text-foreground/20">最近 7 天</span>
          </div>
          <MiniBarChart
            data={DAILY_USAGE.map(d => d.conversations)}
            maxVal={maxDailyConv}
            color="rgb(52,211,153)"
            height={60}
          />
          <div className="flex justify-between mt-1.5 px-[1px]">
            {DAILY_USAGE.map(d => (
              <span key={d.day} className="text-[8px] text-foreground/20 flex-1 text-center">{d.day}</span>
            ))}
          </div>
        </div>

        <div className={card}>
          <div className="flex items-center justify-between mb-3">
            <p className={cardLabel}>活跃时段分布</p>
            <span className="text-[9px] text-foreground/20">24 小时</span>
          </div>
          <MiniBarChart
            data={HOURLY_DISTRIBUTION}
            maxVal={maxHourly}
            color="rgb(139,92,246)"
            height={60}
          />
          <div className="flex justify-between mt-1.5 px-[1px]">
            {[0, 6, 12, 18, 23].map(h => (
              <span key={h} className="text-[8px] text-foreground/20">{h}:00</span>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: 模型使用明细 + 月度趋势 */}
      <div className="grid grid-cols-5 gap-2 mb-2">
        <div className={`${card} col-span-3`}>
          <p className={`${cardLabel} mb-2.5`}>模型使用明细</p>
          <div className="space-y-[5px]">
            {MODEL_USAGE.map((m, i) => (
              <div key={m.name} className="flex items-center gap-2">
                <span className="text-[9px] text-foreground/20 w-3 text-right flex-shrink-0">{i + 1}</span>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-[2px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] text-foreground/60 truncate">{m.name}</span>
                      <span className="text-[8px] text-foreground/20 flex-shrink-0">{m.provider}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                      <span className="text-[9px] text-foreground/30">{(m.tokens / 1000).toFixed(0)}K</span>
                      <span className="text-[9px] text-foreground/30 w-9 text-right">{m.conversations} 次</span>
                      <span className="text-[9px] text-foreground/40 w-10 text-right" style={{ fontWeight: 500 }}>
                        {m.cost > 0 ? `$${m.cost.toFixed(2)}` : '免费'}
                      </span>
                    </div>
                  </div>
                  <div className="h-[2px] rounded-full bg-foreground/[0.04] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(m.tokens / maxModelTokens) * 100}%`, backgroundColor: m.color, opacity: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${card} col-span-2`}>
          <p className={`${cardLabel} mb-2.5`}>月度花费趋势</p>
          <div className="flex items-end gap-[6px]" style={{ height: 80 }}>
            {MONTHLY_TREND.map((m, i) => {
              const maxCost = Math.max(...MONTHLY_TREND.map(t => t.cost));
              const isLast = i === MONTHLY_TREND.length - 1;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className={`text-[8px] ${isLast ? 'text-foreground/45' : 'text-foreground/20'}`}>
                    ${m.cost.toFixed(1)}
                  </span>
                  <div
                    className={`w-full rounded-[3px] ${isLast ? 'bg-foreground/40' : 'bg-foreground/[0.08]'}`}
                    style={{ height: `${(m.cost / maxCost) * 50}px` }}
                  />
                  <span className="text-[8px] text-foreground/20">{m.month}</span>
                </div>
              );
            })}
          </div>
          {/* Summary */}
          <div className="mt-3 pt-2.5 border-t border-foreground/[0.04]">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-foreground/30">6 个月总计</span>
              <span className="text-[11px] text-foreground/60" style={{ fontWeight: 600 }}>
                ${MONTHLY_TREND.reduce((s, m) => s + m.cost, 0).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[9px] text-foreground/30">月均花费</span>
              <span className="text-[10px] text-foreground/45">
                ${(MONTHLY_TREND.reduce((s, m) => s + m.cost, 0) / MONTHLY_TREND.length).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: 最近对话 + 服务商分布 */}
      <div className="grid grid-cols-2 gap-2">
        <div className={card}>
          <div className="flex items-center justify-between mb-2.5">
            <p className={cardLabel}>最近对话</p>
            <Clock size={10} className="text-foreground/20" />
          </div>
          <div className="space-y-[1px]">
            {RECENT_CONVERSATIONS.map((conv, i) => (
              <div key={i} className="flex items-center gap-2 py-[4px] group">
                <div className="w-[3px] h-[3px] rounded-full bg-foreground/15 flex-shrink-0 group-hover:bg-foreground/45 transition-colors" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-foreground/55 truncate group-hover:text-foreground/75 transition-colors">{conv.title}</p>
                  <div className="flex items-center gap-2 mt-[1px]">
                    <span className="text-[8px] text-foreground/25">{conv.model}</span>
                    <span className="text-[8px] text-foreground/15">{conv.time}</span>
                  </div>
                </div>
                <span className="text-[8px] text-foreground/20 flex-shrink-0">{(conv.tokens / 1000).toFixed(1)}K</span>
              </div>
            ))}
          </div>
        </div>

        <div className={card}>
          <p className={`${cardLabel} mb-2.5`}>服务商费用占比</p>
          {/* Donut-like visualization using stacked bar */}
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {(() => {
                  const providers = [
                    { name: 'Anthropic', cost: 2.56, color: '#d97706' },
                    { name: 'OpenAI', cost: 1.23, color: '#10a37f' },
                    { name: 'Google', cost: 0.49, color: '#4285f4' },
                    { name: 'DeepSeek', cost: 0.12, color: '#4f6ef7' },
                    { name: '智谱 AI', cost: 0.08, color: '#2563eb' },
                  ];
                  const total = providers.reduce((s, p) => s + p.cost, 0);
                  let offset = 0;
                  return providers.map(p => {
                    const pct = (p.cost / total) * 100;
                    const el = (
                      <circle
                        key={p.name}
                        r="15.915"
                        cx="18"
                        cy="18"
                        fill="none"
                        stroke={p.color}
                        strokeWidth="3.5"
                        strokeDasharray={`${pct} ${100 - pct}`}
                        strokeDashoffset={`-${offset}`}
                        strokeLinecap="round"
                        opacity="0.7"
                      />
                    );
                    offset += pct;
                    return el;
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[11px] text-foreground/70" style={{ fontWeight: 700 }}>${totalCost.toFixed(0)}</span>
                <span className="text-[7px] text-foreground/25">总计</span>
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              {[
                { name: 'Anthropic', cost: 2.56, color: '#d97706' },
                { name: 'OpenAI', cost: 1.23, color: '#10a37f' },
                { name: 'Google', cost: 0.49, color: '#4285f4' },
                { name: 'DeepSeek', cost: 0.12, color: '#4f6ef7' },
                { name: '智谱 AI', cost: 0.08, color: '#2563eb' },
              ].map(p => (
                <div key={p.name} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-[10px] text-foreground/50 flex-1">{p.name}</span>
                  <span className="text-[9px] text-foreground/35">${p.cost.toFixed(2)}</span>
                  <span className="text-[8px] text-foreground/20 w-7 text-right">
                    {Math.round((p.cost / totalCost) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance metrics */}
          <div className="mt-3 pt-2.5 border-t border-foreground/[0.04] grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-[8px] text-foreground/25 mb-0.5">平均延迟</p>
              <p className="text-[11px] text-foreground/55" style={{ fontWeight: 600 }}>118ms</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] text-foreground/25 mb-0.5">成功率</p>
              <p className="text-[11px] text-primary" style={{ fontWeight: 600 }}>99.7%</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] text-foreground/25 mb-0.5">连接数</p>
              <p className="text-[11px] text-foreground/55" style={{ fontWeight: 600 }}>5/8</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
