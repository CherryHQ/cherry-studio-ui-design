import { useEffect, useState } from 'react';
import { AlertTriangle, Check, ChevronDown, ChevronLeft, ChevronRight, CreditCard, Loader2, LogOut, RotateCcw } from 'lucide-react';
import { Button, Popover, PopoverTrigger, PopoverContent, Progress } from '@cherry-studio/ui';
import cherryLogoImg from '@/assets/cherry-icon.png';
import {
  AUTH_STORAGE_KEY, buildGoCheckoutUrl, buildGoDocsUrl, buildGoPageUrl, buildGoSubscriptionUrl,
  buildLoginUrl, completeGoStateChange, completeWebLogout, parseAuth, readAuth,
  type AuthSnapshot,
} from '@/app/lib/authStorage';
import { CHERRY_GO_MODELS } from '@/app/config/models';
import {
  GO_PLAN, GO_RESETS, GO_USAGE_PAGE_SIZE, GO_USAGE_RECORDS, getGoUsage, usagePercent,
} from '@/app/config/goPlan';

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

/** 共享的账号态 hook —— 两个页面都要跨标签页同步 */
function useAuthSnapshot() {
  const [snapshot, setSnapshot] = useState<AuthSnapshot>(() => readAuth());
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== AUTH_STORAGE_KEY) return;
      setSnapshot(parseAuth(e.newValue));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  return { snapshot, setSnapshot };
}

// --- 1. Go 产品介绍页（?go=1）—— 公开营销页，与登录 / 订阅状态无关 ---

export function GoWorkspacePage() {
  const { snapshot, setSnapshot } = useAuthSnapshot();
  const [pendingSubscribe, setPendingSubscribe] = useState(false);

  const user = snapshot.user;
  const go = snapshot.go;

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
    <div className="min-h-screen w-full bg-app-bg">
      <SiteHeader user={user} goTabActive onLogout={() => setSnapshot(completeWebLogout())} />
      <main className="mx-auto w-full max-w-[680px] px-6 py-10" id="go">
        <MarketingView onSubscribe={handleSubscribe} loginPending={pendingSubscribe && !user} />
      </main>
    </div>
  );
}

// --- 2. 我的订阅页（?subscription=1）—— 账号菜单进入，按订阅状态分三态 ---
//   未订阅：workspace 里内嵌一份精简介绍 + 订阅按钮（参考 opencode 的 workspace/go）
//   订阅中：管理页（订阅信息 + 用量 + 限额重置 + 明细）
//   已过期：续费卡置顶（Go 模型已停用，续费走 Stripe），历史用量明细保留可查

export function GoSubscriptionPage() {
  const { snapshot, setSnapshot } = useAuthSnapshot();
  const user = snapshot.user;
  const go = snapshot.go;

  return (
    <div className="min-h-screen w-full bg-app-bg">
      <SiteHeader user={user} onLogout={() => setSnapshot(completeWebLogout())} />
      <main className="mx-auto w-full max-w-[680px] px-6 py-10">
        {!user ? (
          <Card>
            <p className="text-sm text-foreground">登录后查看我的订阅</p>
            <Button
              size="lg"
              className="mt-5 w-full text-sm"
              onClick={() => window.open(buildLoginUrl(), '_blank')?.focus()}
            >
              登录 Cherry Studio
            </Button>
          </Card>
        ) : go === 'none' ? (
          <SubscriptionIntroView />
        ) : go === 'expired' ? (
          <ExpiredView />
        ) : (
          <ManageView snapshot={snapshot} setSnapshot={setSnapshot} />
        )}
      </main>
    </div>
  );
}

// --- 我的订阅 · 未订阅态 —— workspace 内的精简介绍（参考 opencode workspace/go） ---

function SubscriptionIntroView() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Go</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        低成本旗舰开源模型，人人可用。
        <button
          onClick={() => window.open(buildGoDocsUrl(), '_blank')?.focus()}
          className="ml-1.5 text-[13px] font-normal text-foreground/70 underline underline-offset-4 hover:text-foreground transition-colors"
        >
          了解更多
        </button>
      </p>

      <div className="my-6 h-px bg-border/50" />

      <p className="text-sm text-muted-foreground leading-relaxed">
        Cherry Go 定价 <strong className="text-foreground font-medium">{GO_PLAN.price}</strong>，
        提供对旗舰开源模型的可靠访问，同时享有充裕的使用限额。
      </p>

      <h2 className="mt-6 text-sm font-medium text-foreground">包含模型</h2>
      <ul className="mt-3 flex flex-col gap-1.5 list-disc pl-5 text-sm text-foreground/85">
        {CHERRY_GO_MODELS.map(m => (
          <li key={m.id}>{m.name}</li>
        ))}
      </ul>

      <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
        该计划主要面向国际用户，提供稳定的全球访问体验。随着我们持续了解早期使用情况并收集反馈，
        定价和使用限额可能会有所调整。
      </p>

      <div className="mt-8">
        <Button size="sm" onClick={() => { window.location.href = buildGoCheckoutUrl(); }}>
          订阅 Go
        </Button>
        <p className="mt-2.5 text-[11px] text-muted-foreground/50">通过 Stripe 安全支付 · 可随时取消</p>
      </div>
    </div>
  );
}

// --- 我的订阅 · 已过期态 —— 续费卡置顶，历史明细保留 ---

function ExpiredView() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground mb-1">Go</h1>
        <p className="text-[13px] text-muted-foreground mb-4">{GO_PLAN.tagline}</p>
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
            <Button size="sm" className="flex-shrink-0" onClick={() => { window.location.href = buildGoCheckoutUrl(); }}>
              立即续费
            </Button>
          </div>
        </Card>
      </div>

      {/* 历史用量明细保留可查 */}
      <UsageRecordsTable />
    </div>
  );
}

// ===========================
// 官网页头 —— 右上角导航带「Go」tab（锚定本页）
// ===========================

function SiteHeader({ user, goTabActive, onLogout }: {
  user: AuthSnapshot['user'];
  /** 「Go」tab 是否为当前页（介绍页高亮；我的订阅页点击则跳回介绍页） */
  goTabActive?: boolean;
  onLogout: () => void;
}) {
  return (
    <header className="border-b border-border/40 sticky top-0 bg-app-bg/90 backdrop-blur z-10">
      <div className="mx-auto w-full max-w-[680px] px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src={cherryLogoImg} alt="Cherry Studio" className="w-6 h-6 rounded-md" />
          <span className="text-sm font-medium text-foreground">Cherry Studio</span>
        </div>
        <nav className="flex items-center gap-5">
          <a
            href="https://www.cherryai.com.cn/"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            首页
          </a>
          <button
            onClick={() => window.open(buildGoDocsUrl(), '_blank')?.focus()}
            className="text-xs font-normal text-muted-foreground hover:text-foreground transition-colors"
          >
            文档
          </button>
          {goTabActive ? (
            <a href="#go" className="text-xs font-medium text-foreground">
              Go
            </a>
          ) : (
            <button
              onClick={() => { window.location.href = buildGoPageUrl(); }}
              className="text-xs font-normal text-muted-foreground hover:text-foreground transition-colors"
            >
              Go
            </button>
          )}
          <span className="w-px h-3.5 bg-border/60" />
          {user ? (
            <AccountMenu name={user.name} onLogout={onLogout} />
          ) : (
            <button
              onClick={() => window.open(buildLoginUrl(), '_blank')?.focus()}
              className="text-xs font-normal text-foreground/70 hover:text-foreground hover:underline underline-offset-2"
            >
              登录
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

function AccountMenu({ name, onLogout }: { name: string; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1 text-xs font-normal text-foreground/80 hover:text-foreground transition-colors">
          {name}
          <ChevronDown size={12} className="text-muted-foreground/60" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-[160px] p-1.5">
        {/* 我的订阅 —— 进「我的订阅」页查看订阅情况（?subscription=1） */}
        <button
          onClick={() => { setOpen(false); window.location.href = buildGoSubscriptionUrl(); }}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs text-foreground/85 hover:bg-accent/40 transition-colors"
        >
          <CreditCard size={13} className="text-muted-foreground/70" />
          我的订阅
        </button>
        <button
          onClick={() => { setOpen(false); onLogout(); }}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs text-foreground/85 hover:bg-accent/40 transition-colors"
        >
          <LogOut size={13} className="text-muted-foreground/70" />
          退出登录
        </button>
      </PopoverContent>
    </Popover>
  );
}

// ===========================
// 公开营销内容（结构参考 opencode 的 /go，按 Cherry 改写）
// ===========================

/** 营销页的「每 5 小时可用请求」估算 —— 同样的积分，轻量模型能发起更多请求 */
const MODEL_RATES: { name: string; per5h: string }[] = [
  { name: 'MiniMax M2.5', per5h: '约 65 次' },
  { name: 'GLM-5', per5h: '约 40 次' },
  { name: 'DeepSeek V4', per5h: '约 28 次' },
  { name: 'Kimi K2.5', per5h: '约 15 次' },
  { name: 'Qwen3 Coder Max', per5h: '约 8 次' },
];

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
        旗舰开源模型
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
      <div className="mt-6 flex items-center gap-4">
        <Button size="sm" onClick={onSubscribe}>
          订阅 Go — {GO_PLAN.price}
        </Button>
        {loginPending && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 size={12} className="animate-spin" />
            请在登录页完成登录，完成后自动继续…
          </span>
        )}
      </div>
      <p className="mt-2.5 text-[11px] text-muted-foreground/50">通过 Stripe 安全支付 · 可随时取消</p>

      <div className="my-10 h-px bg-border/50" />

      {/* 包含模型 + 请求量估算 */}
      <h2 className="text-base font-medium text-foreground">包含模型</h2>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        额度按积分透明计量——同样的积分，轻量模型能发起更多请求：
      </p>
      <div className="mt-4 rounded-[var(--radius-button)] border border-section-border overflow-hidden">
        <div className="grid grid-cols-2 gap-2 px-4 py-2 bg-muted/40 text-xs font-medium text-foreground/70">
          <span>模型</span>
          <span className="text-right">每 5 小时可用请求</span>
        </div>
        {MODEL_RATES.map(r => (
          <div key={r.name} className="grid grid-cols-2 gap-2 px-4 py-2.5 text-[13px] border-t border-section-border/50">
            <span className="text-foreground">{r.name}</span>
            <span className="text-right text-muted-foreground tabular-nums">{r.per5h}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[13px] text-muted-foreground/70">
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
            <span className="mt-px w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[11px] font-medium text-foreground/70 flex-shrink-0">
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

      {/* 底部再给一次入口 */}
      <div className="mt-10">
        <Button size="sm" onClick={onSubscribe}>
          订阅 Go — {GO_PLAN.price}
        </Button>
      </div>
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

function ManageView({ snapshot, setSnapshot }: {
  snapshot: AuthSnapshot;
  setSnapshot: (s: AuthSnapshot) => void;
}) {
  const go = snapshot.go;
  const [resetsUsed, setResetsUsed] = useState<number>(GO_RESETS.used);
  const [justReset, setJustReset] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);

  // 退订 / 演示切换器把额度切回打满后，别再挂着"已重置"的成功提示
  useEffect(() => {
    if (go === 'none' || go === 'limit-5h') setJustReset(false);
  }, [go]);

  const unsubscribe = () => {
    setSnapshot(completeGoStateChange('none'));
    setManageOpen(false);
  };
  // 有剩余次数就可点（与客户端订阅额度页同一条规则）；重置恢复 5 小时 + 每周窗口
  const resetsLeft = GO_RESETS.total - resetsUsed;
  const canReset = resetsLeft > 0;
  const resetQuota = () => {
    if (!canReset) return;
    setResetsUsed(n => n + 1);
    if (go === 'limit-5h') setSnapshot(completeGoStateChange('active'));
    setJustReset(true);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* 1. 订阅信息 */}
      <div>
        <h1 className="text-xl font-semibold text-foreground mb-1">Go</h1>
        <p className="text-[13px] text-muted-foreground mb-4">{GO_PLAN.tagline}</p>
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
      </div>

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

      {/* 4. 用量明细 —— 积分口径，分页 */}
      <UsageRecordsTable />
    </div>
  );
}

// --- 用量明细（分页） ---

function UsageRecordsTable() {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(GO_USAGE_RECORDS.length / GO_USAGE_PAGE_SIZE));
  const rows = GO_USAGE_RECORDS.slice(page * GO_USAGE_PAGE_SIZE, (page + 1) * GO_USAGE_PAGE_SIZE);

  return (
    <section>
      <SectionTitle>用量明细</SectionTitle>
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
    </section>
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
