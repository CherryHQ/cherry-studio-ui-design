import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Loader2, Lock } from 'lucide-react';
import {
  buildGoPageUrl, buildGoSubscriptionUrl,
} from '@/app/lib/authStorage';
import { GO_PLAN } from '@/app/config/goPlan';
import { GoSiteHeader, SiteButton } from './goSiteWeb';
import { useAuth } from '@/app/context/AuthContext';
import { AccountDemoSwitcher } from '@/app/components/shared/AccountDemoSwitcher';

// ===========================
// 模拟 Stripe Checkout（?checkout=go）
// ===========================
// 真实产品里「订阅 Go」跳转到 Stripe 托管的 Checkout 页（对标 opencode）。
// 原型不接真支付，这一页模拟那个形态：左侧订单摘要、右侧支付表单（演示用
// 预填卡号），点「订阅」直接成功并跳回 Go 工作台。全页明确标注演示。

type Stage = 'form' | 'paying' | 'done';

export function GoCheckoutPage() {
  const [stage, setStage] = useState<Stage>('form');
  const { user, logout, applyGoDemoState } = useAuth();

  const pay = () => {
    setStage('paying');
    window.setTimeout(() => {
      applyGoDemoState('active');
      setStage('done');
    }, 1200);
  };

  // 支付成功后自动进「我的订阅」页（同标签页，对应 Stripe 的 success_url 回跳）
  useEffect(() => {
    if (stage !== 'done') return;
    const t = window.setTimeout(() => {
      window.location.href = buildGoSubscriptionUrl();
    }, 1400);
    return () => window.clearTimeout(t);
  }, [stage]);

  return (
    <div className="go-site min-h-screen w-full flex flex-col">
      {/* 官网页头（含账号菜单）；支付页的账号态只读，退出即回介绍页 */}
      <GoSiteHeader
        user={user}
        onLogout={() => { logout(); window.location.href = buildGoPageUrl(); }}
      />
      {/* 返回 + 演示标注 */}
      <div className="mx-auto w-full max-w-[880px] px-6 h-12 flex items-center justify-between">
        <button
          onClick={() => { window.location.href = buildGoPageUrl(); }}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={13} />
          返回
        </button>
        <span className="text-[11px] text-muted-foreground/50">原型演示 · 模拟 Stripe Checkout，不产生真实扣款</span>
      </div>

      <div className="flex-1 flex items-start justify-center px-6 py-8">
        <div className="w-full max-w-[880px] grid md:grid-cols-2 gap-8">
          {/* 左：订单摘要 */}
          <div className="pt-2">
            <p className="text-xs text-muted-foreground">订阅 Cherry Go</p>
            <p className="mt-1 text-3xl font-semibold text-foreground tracking-tight">
              $10.00
              <span className="ml-1.5 text-sm font-normal text-muted-foreground">/ 月</span>
            </p>
            <div className="mt-6 rounded-[var(--radius-card)] border border-section-border bg-card px-4 py-3">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-foreground">Cherry Go</span>
                <span className="text-foreground tabular-nums">$10.00</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground/60">{GO_PLAN.tagline} · 按月订阅，可随时取消</p>
              <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-[13px]">
                <span className="text-muted-foreground">今日应付</span>
                <span className="text-foreground font-medium tabular-nums">$10.00</span>
              </div>
            </div>
          </div>

          {/* 右：支付表单 */}
          <div className="rounded-[var(--radius-card)] border border-section-border bg-card px-6 py-6">
            {stage === 'done' ? (
              <div className="py-10 flex flex-col items-center gap-3 text-center">
                <span className="w-11 h-11 rounded-full bg-success/10 flex items-center justify-center">
                  <Check size={22} className="text-success" strokeWidth={2.4} />
                </span>
                <p className="text-base font-medium text-foreground">订阅成功</p>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Loader2 size={12} className="animate-spin" />
                  正在进入我的订阅…
                </p>
              </div>
            ) : (
              <>
                <Field label="电子邮件">
                  <ReadonlyInput value={user?.email ?? `${user?.phone?.replace(/\s/g, '') ?? 'user'}@demo.cherry-ai.com`} />
                </Field>
                <Field label="卡信息" className="mt-4">
                  <ReadonlyInput value="4242 4242 4242 4242" mono />
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <ReadonlyInput value="12 / 28" mono />
                    <ReadonlyInput value="CVC 424" mono />
                  </div>
                </Field>
                <Field label="持卡人姓名" className="mt-4">
                  <ReadonlyInput value={user?.name ?? '用户'} />
                </Field>

                <SiteButton size="md" className="mt-6 w-full" disabled={stage === 'paying'} onClick={pay}>
                  {stage === 'paying' ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      正在处理…
                    </span>
                  ) : (
                    '订阅 · 支付 $10.00'
                  )}
                </SiteButton>
                <p className="mt-3 flex items-center justify-center gap-1 text-[11px] text-muted-foreground/50">
                  <Lock size={10} />
                  演示表单已预填测试卡号，点击即完成订阅
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      {/* 左下角演示状态切换器 —— 网页端评审用，切账号 / 订阅形态即时生效 */}
      <AccountDemoSwitcher triggerClassName="left-4" hideOnboardingRow />
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="mb-1.5 text-xs text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function ReadonlyInput({ value, mono }: { value: string; mono?: boolean }) {
  return (
    <div
      className={`h-10 flex items-center px-3 rounded-[var(--radius-button)] border-[1.5px] border-input bg-muted/50 text-sm text-foreground/80 ${mono ? 'font-mono tracking-wide' : ''}`}
    >
      {value}
    </div>
  );
}
