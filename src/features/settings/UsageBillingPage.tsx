import { useState } from 'react';
import { ArrowUpRight, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Progress, Typography } from '@cherry-studio/ui';
import { useAuth } from '@/app/context/AuthContext';
import { buildGoDocsUrl, buildGoPageUrl, buildGoSubscriptionUrl } from '@/app/lib/authStorage';
import { GO_PLAN, GO_RESETS, getGoUsage, usagePercent } from '@/app/config/goPlan';
import { contentColumn, contentColumnInner, SectionCard } from './shared';

// ===========================
// 设置 · 订阅额度
// ===========================
// 位置在「模型服务」上方（左栏第一组）。结构参考 Codex 的用量页：
//   1. 当前套餐卡（未订阅 / 已订阅两态；订阅、查看套餐跳网页端）
//   2. 三个时间窗口的用量（5 小时 / 每周 / 每月），百分比 + 积分数 + 重置时间
//   3. 使用限额重置：客户端里直接点「立即重置」完成，不跳网页（先不做加购）
// Free 是黑盒：这页只讲 Go，未订阅时用量区是空态，不出现任何 free 数字。

const openGoPage = () => window.open(buildGoPageUrl(), '_blank')?.focus();
const openGoSubscription = () => window.open(buildGoSubscriptionUrl(), '_blank')?.focus();
const openGoDocs = () => window.open(buildGoDocsUrl(), '_blank')?.focus();

export function UsageBillingPage() {
  const { goSubscribed, goState, resetGoQuota } = useAuth();
  const [resetsUsed, setResetsUsed] = useState<number>(GO_RESETS.used);

  // 有剩余次数就可点 —— 按钮状态只看次数，不看额度状态
  const resetsLeft = GO_RESETS.total - resetsUsed;
  const canReset = resetsLeft > 0;
  const handleReset = () => {
    if (!canReset) return;
    setResetsUsed(n => n + 1);
    resetGoQuota();
    toast.success('已重置，5 小时与每周额度已恢复');
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-6 pt-4 pb-0 flex-shrink-0">
        <div className={contentColumnInner}>
          <Typography variant="subtitle">订阅额度</Typography>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto px-6 py-4 scrollbar-thin ${contentColumn}`}>
        {/* 当前套餐 */}
        <div className="mb-5">
          <PlanCard
            action={goSubscribed ? '查看套餐' : '订阅 Go'}
            onAction={goSubscribed ? openGoSubscription : openGoPage}
          />
        </div>

        {/* 用量 —— 「积分」是什么，就近给一个解释入口 */}
        <div className="flex items-center justify-between mb-2 px-0.5">
          <p className="text-xs font-medium text-foreground/70">用量</p>
          <button
            onClick={openGoDocs}
            className="inline-flex items-center gap-px text-[11px] text-muted-foreground/50 hover:text-foreground transition-colors"
          >
            积分与额度说明
            <ArrowUpRight size={10} />
          </button>
        </div>
        <SectionCard className="py-1 mb-5">
          {goSubscribed ? (
            getGoUsage(goState).map((w, i) => {
              const pct = usagePercent(w);
              const full = pct >= 100;
              return (
                <div key={w.key} className={`py-3 ${i > 0 ? 'border-t border-section-border/50' : ''}`}>
                  <div className="flex items-baseline justify-between gap-4 mb-2">
                    <span className="text-[13px] text-foreground">{w.label}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {w.used.toLocaleString('en-US')} / {w.total.toLocaleString('en-US')} 积分
                      <span className={`ml-2 font-medium ${full ? 'text-destructive' : 'text-foreground'}`}>{pct}%</span>
                    </span>
                  </div>
                  <Progress
                    value={pct}
                    className={`h-1.5 bg-muted ${full ? '[&>[data-slot=progress-indicator]]:bg-destructive' : ''}`}
                  />
                  <p className="mt-1.5 text-[11px] text-muted-foreground/60">{w.resetNote}</p>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center">
              <p className="text-xs text-muted-foreground/60">订阅 Go 后，这里展示 5 小时 / 每周 / 每月的额度用量</p>
            </div>
          )}
        </SectionCard>

        {/* 使用限额重置 —— 只在已订阅时出现，客户端内直接完成。
            有剩余次数：显示剩余几次，按钮可点；用完：文案「无可用重置次数」，按钮禁用 */}
        {goSubscribed && (
          <>
            <p className="text-xs font-medium text-foreground/70 mb-2 px-0.5">使用限额重置</p>
            <SectionCard className="py-1">
              {canReset ? (
                <div className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-[13px] text-foreground flex items-center gap-1.5">
                      <RotateCcw size={13} className="text-muted-foreground" />
                      本月剩余 {resetsLeft} 次重置
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground/60">{GO_RESETS.note}</p>
                  </div>
                  <Button variant="outline" size="xs" onClick={handleReset} className="flex-shrink-0 shadow-none border-border">
                    立即重置
                  </Button>
                </div>
              ) : (
                // 用完了就只剩一句话 —— 不给禁用按钮、不给图标，没有可做的动作就不摆动作
                <p className="py-3 text-[13px] text-muted-foreground">无可用重置次数</p>
              )}
            </SectionCard>
          </>
        )}
      </div>
    </div>
  );
}

// --- 套餐卡 ---
// 两态左侧完全一致（Go 套餐 $10/月 + 描述），只有右侧按钮不同：
// 未订阅「订阅 Go」（跳官网 Go 介绍页）/ 已订阅「查看套餐」（跳「我的订阅」页）。

function PlanCard({ action, onAction }: { action: string; onAction: () => void }) {
  return (
    <SectionCard className="py-1">
      <div className="flex items-center justify-between gap-4 py-3">
        <div className="min-w-0">
          <p className="text-sm text-foreground">
            <span className="font-medium">Go 套餐</span>
            <span className="ml-2">{GO_PLAN.price}</span>
          </p>
          {/* 「查看详情」→ 官网 Go tab（介绍页） */}
          <p className="mt-1 text-xs text-muted-foreground">
            {GO_PLAN.tagline}
            <span className="mx-1.5 text-muted-foreground/40">·</span>
            <button
              onClick={openGoPage}
              className="inline-flex items-center gap-px text-xs text-foreground/70 hover:text-foreground hover:underline underline-offset-2 transition-colors"
            >
              查看详情
              <ArrowUpRight size={10} />
            </button>
          </p>
        </div>
        <Button variant="outline" size="xs" onClick={onAction} className="flex-shrink-0 shadow-none border-border">
          {action}
        </Button>
      </div>
    </SectionCard>
  );
}
