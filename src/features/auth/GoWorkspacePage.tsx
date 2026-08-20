import { useEffect, useState } from 'react';
import {
  AlertTriangle, Check, ChevronDown, ChevronLeft, ChevronRight,
  Loader2, RotateCcw,
} from 'lucide-react';
import { Button, Progress } from '@cherry-studio/ui';
import {
  buildGoCheckoutUrl, buildGoDocsUrl, buildGoPageUrl, buildGoSubscriptionUrl, buildLoginUrl,
} from '@/app/lib/authStorage';
import { CHERRY_GO_MODELS } from '@/app/config/models';
import {
  GO_MODEL_RATES, GO_PLAN, GO_RESETS, GO_USAGE_PAGE_SIZE, GO_USAGE_RECORDS, getGoUsage, usagePercent,
} from '@/app/config/goPlan';
import { GoSiteHeader, SiteButton } from './goSiteWeb';
import { useAuth } from '@/app/context/AuthContext';
import { AccountDemoSwitcher } from '@/app/components/shared/AccountDemoSwitcher';

// ===========================
// 官网 Go 相关的两个页面
// ===========================
// 1. Go 产品介绍页（?go=1，本文件的 GoWorkspacePage）：
//    挂在 Cherry 官网右上角的「Go」tab 上，**公开对外展示，与是否登录 / 是否
//    订阅无关**——任何人打开都是同一份营销内容（hero + 模型与请求量表 +
//    三点特性 + 三步上手 + FAQ）。客户端的订阅引导也落到这里。
//    点「订阅 Go」：未登录先登录（登录后自动继续）→ 已订阅的账号带去
//    「我的订阅」页；未订阅跳 Stripe 支付页（?checkout=go）。
// 2. 我的订阅页（?subscription=1，本文件的 GoSubscriptionPage）：
//    从右上角账号菜单「我的订阅」进入，查看我的订阅情况——订阅信息 +
//    三档用量 + 使用限额重置 + 用量明细（分页）。支付成功后也回到这里。
//    页面账号态来自 AuthContext（与客户端同一份 localStorage），左下角挂着
//    演示状态切换器，评审时可直接切各订阅形态。

// --- 1. Go 产品介绍页（?go=1）—— 公开营销页，与登录 / 订阅状态无关 ---

export function GoWorkspacePage() {
  const { user, goState: go, logout } = useAuth();
  const [pendingSubscribe, setPendingSubscribe] = useState(false);

  // 点订阅：未登录先登录（登录后自动继续）；订阅生效中带去「我的订阅」；
  // 未订阅 / 已过期进支付（过期续费也走 Stripe）
  const needPay = go === 'none' || go === 'expired';
  const handleSubscribe = () => {
    if (!user) {
      setPendingSubscribe(true);
      window.open(buildLoginUrl(), '_blank')?.focus();
      return;
    }
    window.location.href = needPay ? buildGoCheckoutUrl() : buildGoSubscriptionUrl();
  };
  useEffect(() => {
    if (!pendingSubscribe || !user) return;
    setPendingSubscribe(false);
    window.location.href = needPay ? buildGoCheckoutUrl() : buildGoSubscriptionUrl();
  }, [pendingSubscribe, user, needPay]);

  return (
    <div className="go-site min-h-screen w-full">
      <GoSiteHeader user={user} onLogout={logout} active="go" />
      <main id="go" className="mx-auto w-full max-w-[680px] px-6 py-10">
        <MarketingView onSubscribe={handleSubscribe} loginPending={pendingSubscribe && !user} />
      </main>
      {/* 左下角演示状态切换器 —— 网页端评审用，切账号 / 订阅形态即时生效 */}
      <AccountDemoSwitcher triggerClassName="left-4" hideOnboardingRow />
    </div>
  );
}

// --- 2. 我的订阅页（?subscription=1）—— 账号菜单进入，按订阅状态分三态 ---
//   未订阅：workspace 里内嵌一份精简介绍 + 订阅按钮（参考 opencode 的 workspace/go）
//   订阅中：管理页（订阅信息 + 用量 + 限额重置 + 明细）
//   已过期：续费卡置顶（Go 模型已停用，续费走 Stripe），历史用量明细保留可查

export function GoSubscriptionPage() {
  const { user, goState: go, logout } = useAuth();

  useEffect(() => {
    if (!user) window.location.replace(buildGoPageUrl());
  }, [user]);

  if (!user) return <div className="go-site min-h-screen w-full" />;

  return (
    <div className="go-site min-h-screen w-full">
      <GoSiteHeader user={user} onLogout={logout} />
      <main className="mx-auto w-full max-w-[880px] px-6 py-10">
        {go === 'none' ? (
          <SubscriptionIntroView />
        ) : go === 'expired' ? (
          <ExpiredView />
        ) : (
          <ManageView />
        )}
      </main>
      {/* 左下角演示状态切换器 —— 网页端评审用，切账号 / 订阅形态即时生效 */}
      <AccountDemoSwitcher triggerClassName="left-4" hideOnboardingRow />
    </div>
  );
}

// --- 我的订阅 · 未订阅态 —— workspace 内的精简介绍（参考 opencode workspace/go） ---

function SubscriptionIntroView() {
  const [tab, setTab] = useState<SubTabId>('overview');

  return (
    <div className="flex flex-col gap-8 md:flex-row md:items-start">
      <SubscriptionTabNav active={tab} onChange={setTab} />
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        {tab === 'overview' ? (
          <>
            <SubscriptionPlanHeader
              action={(
                <div className="flex-shrink-0 text-right">
                  <SiteButton size="sm" onClick={() => { window.location.href = buildGoCheckoutUrl(); }}>
                    订阅 Go
                  </SiteButton>
                  <p className="mt-2 text-[11px] text-muted-foreground/50">可随时取消</p>
                </div>
              )}
            />
            <Card>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Cherry Go 定价 <strong className="font-medium text-foreground">{GO_PLAN.price}</strong>，
                提供对旗舰开源模型的可靠访问，同时享有充裕的使用限额。
                <button
                  onClick={() => window.open(buildGoDocsUrl(), '_blank')?.focus()}
                  className="ml-1.5 text-[13px] font-normal text-foreground/70 underline underline-offset-4 transition-colors hover:text-foreground"
                >
                  了解更多
                </button>
              </p>

              <h2 className="mt-6 text-sm font-medium text-foreground">包含模型</h2>
              <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-sm text-foreground/85">
                {CHERRY_GO_MODELS.map(m => (
                  <li key={m.id}>{m.name}</li>
                ))}
              </ul>

              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                该计划主要面向国际用户，提供稳定的全球访问体验。随着我们持续了解早期使用情况并收集反馈，
                定价和使用限额可能会有所调整。
              </p>
            </Card>
          </>
        ) : (
          <Card>
            <p className="text-sm font-medium text-foreground">暂无用量明细</p>
            <p className="mt-1.5 text-xs text-muted-foreground">订阅 Cherry Go 后，这里会展示每次模型调用的 Tokens 与积分消耗。</p>
          </Card>
        )}
      </div>
    </div>
  );
}

// --- 我的订阅 · 左侧 tab 导航（参考 opencode 的 workspace 布局：左列上下两个 tab） ---
// 使用概览 = 订阅信息 + 用量 + 使用限额重置；用量明细 = 分页的记录表（第二个 tab）

const SUB_TABS = [
  { id: 'overview', label: '使用概览' },
  { id: 'usage', label: '用量明细' },
] as const;
type SubTabId = (typeof SUB_TABS)[number]['id'];

function SubscriptionTabNav({ active, onChange }: { active: SubTabId; onChange: (t: SubTabId) => void }) {
  return (
    <nav className="flex flex-col gap-1 w-full md:w-[168px] flex-shrink-0">
      {SUB_TABS.map(tab => {
        const on = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`w-full flex items-center justify-between rounded-lg px-3.5 py-2 text-[13px] transition-colors ${
              on
                ? 'bg-section-border/60 text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

function SubscriptionPlanHeader({ action }: { action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-foreground">Go</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">{GO_PLAN.tagline}</p>
      </div>
      {action}
    </div>
  );
}

// --- 我的订阅 · 已过期态 —— 续费卡置顶，历史明细保留 ---

function ExpiredView() {
  const [tab, setTab] = useState<SubTabId>('overview');

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-8 md:items-start">
        <SubscriptionTabNav active={tab} onChange={setTab} />
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {tab === 'overview' ? (
            <>
              <SubscriptionPlanHeader />
              <Card>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertTriangle size={10} className="text-destructive" strokeWidth={2.4} />
                      </span>
                      <span className="text-sm font-medium text-foreground">订阅已过期 · Cherry Go</span>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      已于 {GO_PLAN.expiredDate} 到期，Go 模型已停用
                      <span className="mx-1.5 text-muted-foreground/40">·</span>
                      续费后立即恢复模型与额度
                    </p>
                  </div>
                  <SiteButton size="sm" className="flex-shrink-0" onClick={() => { window.location.href = buildGoCheckoutUrl(); }}>
                    立即续费
                  </SiteButton>
                </div>
              </Card>
            </>
          ) : (
            /* 历史用量明细保留可查 */
            <UsageRecordsTable />
          )}
        </div>
      </div>
    </div>
  );
}

// ===========================
// 公开营销内容（结构参考 opencode 的 /go，按 Cherry 改写）
// ===========================

// 「包含模型」表数据统一在 goPlan.ts 的 GO_MODEL_RATES（积分计价，锚定 opencode 美元定价）

const GO_HIGHLIGHTS = [
  { title: '一个订阅，整个阵容', desc: `${GO_PLAN.price}，用上 Kimi、DeepSeek、Qwen、GLM、MiniMax 等系列的旗舰开源模型，不用再逐家申请 API Key、逐家充值。` },
  { title: '充裕限额，稳定访问', desc: '5 小时 / 每周 / 每月三档额度按积分透明计量，配合每月 3 次限额重置；我们与提供商直接合作并做冗余部署，保证全球稳定访问。' },
  { title: '精选并持续更新', desc: '进入 Go 的模型都经过基准测试与真实任务验证；新模型发布后自动加入，表现退步的会被移出，无需额外付费。' },
];

const GO_STEPS = [
  '注册或登录 Cherry Studio 账号',
  '订阅 Go，通过 Stripe 完成支付',
  '回到客户端，在模型选择器的 CherryAI Go 分组直接选用',
];

const GO_FAQS = [
  { q: 'Cherry Go 是什么？', a: `按月订阅（${GO_PLAN.price}）：在 Cherry Studio 客户端直接使用精选的旗舰开源模型，无需申请和配置任何 API Key。` },
  { q: '包含哪些模型？', a: '当前覆盖 Kimi、DeepSeek、Qwen、GLM、MiniMax 等系列的旗舰开源模型，列表随开源生态持续更新，新模型自动加入。' },
  { q: '额度怎么计算？', a: '按积分计费：每次请求根据所用模型与 token 用量折算成积分。额度分 5 小时 / 每周 / 每月三个窗口，各自独立、到点自动恢复。' },
  { q: '额度用完了怎么办？', a: '套餐每月附带 3 次使用限额重置，可立即恢复 5 小时与每周额度；也可以等窗口自动恢复。期间你自己配置的服务商模型不受任何影响。' },
  { q: '我的数据会被用于训练吗？', a: '不会。所有请求均不用于模型训练，数据留存仅用于滥用检测，到期自动删除。' },
  { q: '如何取消？', a: '随时可以在网页端「管理订阅」中取消，本期额度保留至周期结束。' },
];

function MarketingView({ onSubscribe, loginPending }: { onSubscribe: () => void; loginPending: boolean }) {
  return (
    <div>
      {/* Hero —— 价值主张 + 顶部 CTA */}
      <h1 className="text-4xl font-bold tracking-tight text-foreground leading-tight">
        人人用得起的
        <br />
        <span className="gradient-text">旗舰开源模型</span>
      </h1>
      <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
        Cherry Go 以 {GO_PLAN.price} 提供充裕的使用额度与稳定的全球访问，
        在 Cherry Studio 里直接选用旗舰开源模型——不用配置 API Key，也不用担心成本和可用性。
        <button
          onClick={() => window.open(buildGoDocsUrl(), '_blank')?.focus()}
          className="ml-1.5 text-[13px] font-normal text-foreground/70 underline underline-offset-4 hover:text-foreground transition-colors"
        >
          了解更多
        </button>
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <SiteButton onClick={onSubscribe}>订阅 Go — {GO_PLAN.price}</SiteButton>
        {loginPending && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 size={12} className="animate-spin" />
            请在登录页完成登录，完成后自动继续…
          </span>
        )}
      </div>
      <p className="mt-2.5 text-[11px] text-muted-foreground/50">通过 Stripe 安全支付 · 可随时取消</p>

      <div className="my-10 h-px bg-border/50" />

      {/* 包含模型 —— 每百万 Token 消耗积分（积分制，区别于 opencode 的请求次数） */}
      <h2 className="text-base font-medium text-foreground">包含模型</h2>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        额度按积分透明计量——同样的积分，轻量模型能处理更多 Token：
      </p>
      <div className="mt-4 rounded-[var(--radius-button)] border border-section-border overflow-hidden">
        <div className="grid grid-cols-3 gap-2 px-4 py-2 bg-muted/40 text-xs font-medium text-foreground/70">
          <span>模型</span>
          <span className="text-right">输入 · 积分 / 百万 Token</span>
          <span className="text-right">输出 · 积分 / 百万 Token</span>
        </div>
        {GO_MODEL_RATES.map(r => (
          <div key={r.name} className="grid grid-cols-3 gap-2 px-4 py-2.5 text-[13px] border-t border-section-border/50">
            <span className="text-foreground">{r.name}</span>
            <span className="text-right text-muted-foreground tabular-nums">{r.input.toLocaleString('en-US')}</span>
            <span className="text-right text-muted-foreground tabular-nums">{r.output.toLocaleString('en-US')}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[13px] text-muted-foreground/70">
        积分按 $10 = 10,000 积分、以 opencode 定价换算（每百万 Token）；
        上下文超限（Qwen3.7/3.6 Plus）与高峰时段（DeepSeek）价格更高。
        模型列表随开源生态持续更新，新模型发布后自动加入，无需额外付费。
      </p>

      <div className="my-10 h-px bg-border/50" />

      {/* 三点特性 */}
      <h2 className="text-base font-medium text-foreground">为什么选 Go</h2>
      <div className="mt-4 flex flex-col gap-5">
        {GO_HIGHLIGHTS.map(h => (
          <div key={h.title}>
            <p className="text-sm font-medium text-foreground">{h.title}</p>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{h.desc}</p>
          </div>
        ))}
      </div>

      <div className="my-10 h-px bg-border/50" />

      {/* 三步上手 */}
      <h2 className="text-base font-medium text-foreground">如何开始</h2>
      <ol className="mt-4 flex flex-col gap-3">
        {GO_STEPS.map((s, i) => (
          <li key={s} className="flex items-start gap-3 text-sm text-foreground/85 leading-relaxed">
            <span className="mt-px w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-medium flex-shrink-0">
              {i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>

      <div className="my-10 h-px bg-border/50" />

      {/* FAQ */}
      <h2 className="text-base font-medium text-foreground">常见问题</h2>
      <Faq />
    </div>
  );
}

function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <div className="mt-4 rounded-[var(--radius-button)] border border-section-border overflow-hidden">
      {GO_FAQS.map((f, i) => {
        const open = openIdx === i;
        return (
          <div key={f.q} className={i > 0 ? 'border-t border-section-border/50' : ''}>
            <button
              onClick={() => setOpenIdx(open ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left hover:bg-accent/20 transition-colors"
            >
              <span className="text-[13px] font-normal text-foreground">{f.q}</span>
              <ChevronDown size={14} className={`text-muted-foreground/60 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
              <p className="px-4 pb-3.5 text-[13px] text-muted-foreground leading-relaxed">{f.a}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ===========================
// 已订阅：套餐管理页
// ===========================

function ManageView() {
  const { goState: go, applyGoDemoState } = useAuth();
  const [tab, setTab] = useState<SubTabId>('overview');
  const [resetsUsed, setResetsUsed] = useState<number>(GO_RESETS.used);
  const [justReset, setJustReset] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);

  // 退订 / 演示切换器把额度切回打满后，别再挂着"已重置"的成功提示
  useEffect(() => {
    if (go === 'none' || go === 'limit-5h') setJustReset(false);
  }, [go]);

  const unsubscribe = () => {
    applyGoDemoState('none');
    setManageOpen(false);
  };
  // 有剩余次数就可点（与客户端订阅额度页同一条规则）；重置恢复 5 小时 + 每周窗口
  const resetsLeft = GO_RESETS.total - resetsUsed;
  const canReset = resetsLeft > 0;
  const resetQuota = () => {
    if (!canReset) return;
    setResetsUsed(n => n + 1);
    if (go === 'limit-5h') applyGoDemoState('active');
    setJustReset(true);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-8 md:items-start">
        <SubscriptionTabNav active={tab} onChange={setTab} />
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {tab === 'overview' ? (
            <>
              <SubscriptionPlanHeader />
              {/* 1. 订阅信息 */}
              <Card>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-success/15 flex items-center justify-center">
                        <Check size={10} className="text-success" strokeWidth={2.6} />
                      </span>
                      <span className="text-sm font-medium text-foreground">已订阅 · Cherry Go</span>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {GO_PLAN.price}
                      <span className="mx-1.5 text-muted-foreground/40">·</span>
                      下次扣款 {GO_PLAN.renewDate}
                    </p>
                  </div>
                  <Button variant="outline" size="xs" className="flex-shrink-0 shadow-none border-border" onClick={() => setManageOpen(v => !v)}>
                    管理订阅
                  </Button>
                </div>
                {manageOpen && (
                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-4">
                    <p className="text-[11px] text-muted-foreground/60">
                      真实产品中本期额度保留至 {GO_PLAN.renewDate}；演示环境取消立即生效
                    </p>
                    <button
                      onClick={unsubscribe}
                      className="text-[11px] text-destructive/70 hover:text-destructive hover:underline underline-offset-2 flex-shrink-0"
                    >
                      取消订阅（演示）
                    </button>
                  </div>
                )}
              </Card>

              {/* 2. 用量 */}
              <section>
                <SectionTitle>用量</SectionTitle>
                <Card>
                  {getGoUsage(go).map((w, i) => {
                    const pct = usagePercent(w);
                    const full = pct >= 100;
                    return (
                      <div key={w.key} className={`py-3 ${i > 0 ? 'border-t border-border/30' : ''} first:pt-1 last:pb-1`}>
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
                  })}
                </Card>
              </section>

              {/* 3. 使用限额重置 —— 用完时方框里只剩一句话 */}
              <section>
                <SectionTitle>使用限额重置</SectionTitle>
                <Card>
                  {canReset ? (
                    <>
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[13px] text-foreground flex items-center gap-1.5">
                            <RotateCcw size={13} className="text-muted-foreground" />
                            本月剩余 {resetsLeft} 次重置
                          </p>
                          <p className="mt-1 text-[11px] text-muted-foreground/60">{GO_RESETS.note}</p>
                        </div>
                        <Button variant="outline" size="xs" className="flex-shrink-0 shadow-none border-border" onClick={resetQuota}>
                          立即重置
                        </Button>
                      </div>
                      {justReset && (
                        <p className="mt-3 pt-3 border-t border-border/40 text-[11px] text-success flex items-center gap-1.5">
                          <Check size={11} strokeWidth={2.6} />
                          已重置，5 小时与每周额度已恢复
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-[13px] text-muted-foreground">无可用重置次数</p>
                  )}
                </Card>
              </section>
            </>
          ) : (
            /* 4. 用量明细 —— 积分口径，分页 */
            <UsageRecordsTable />
          )}
        </div>
      </div>
    </div>
  );
}

// --- 用量明细（分页） ---

function UsageRecordsTable() {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(GO_USAGE_RECORDS.length / GO_USAGE_PAGE_SIZE));
  const rows = GO_USAGE_RECORDS.slice(page * GO_USAGE_PAGE_SIZE, (page + 1) * GO_USAGE_PAGE_SIZE);

  return (
    <Card className="px-0 py-0">
      <div className="grid grid-cols-[110px_1fr_72px_64px] gap-2 px-5 py-2.5 border-b border-border/40 text-[11px] text-muted-foreground/60">
          <span>时间</span>
          <span>模型</span>
          <span className="text-right">Tokens</span>
          <span className="text-right">积分</span>
        </div>
        {rows.map((r, i) => (
          <div
            key={r.time}
            className={`grid grid-cols-[110px_1fr_72px_64px] gap-2 px-5 py-2.5 text-xs ${i > 0 ? 'border-t border-border/20' : ''}`}
          >
            <span className="text-muted-foreground tabular-nums">{r.time}</span>
            <span className="text-foreground truncate">{r.model}</span>
            <span className="text-right text-muted-foreground tabular-nums">{r.tokens}</span>
            <span className="text-right text-foreground tabular-nums font-medium">{r.credits}</span>
          </div>
        ))}
        {/* 分页脚 —— 左侧总数，右侧翻页 */}
        <div className="px-5 py-2 border-t border-border/40 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground/60">共 {GO_USAGE_RECORDS.length} 条</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              aria-label="上一页"
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft size={13} />
            </Button>
            <span className="text-[11px] tabular-nums text-muted-foreground min-w-[44px] text-center">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              aria-label="下一页"
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronRight size={13} />
            </Button>
          </div>
        </div>
    </Card>
  );
}

// --- 小件 ---

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[var(--radius-card)] border border-section-border bg-card px-5 py-4 ${className ?? ''}`}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-xs font-medium text-foreground/70">{children}</p>;
}
