import { ArrowUpRight } from 'lucide-react';
import { Button } from '@cherry-studio/ui';
import cherryLogoImg from '@/assets/cherry-icon.png';
import { buildGoPageUrl } from '@/app/lib/authStorage';
import { GO_PLAN, GO_RESETS } from '@/app/config/goPlan';

// ===========================
// 官方文档 · Go 订阅模式介绍（?docs=go）
// ===========================
// 「查看详情」的落地页，结构对照 opencode 的 /docs/go：
// 页首一句话定位 → 背景 → 工作原理 → 使用限制（表格）→ 限额重置 →
// 超出限制之后 → 隐私 → 目标 → 底部订阅入口。
// 模型只写系列名不写具体型号 —— 模型迭代太快，写死型号文档立刻过期。

const openGoPage = () => window.open(buildGoPageUrl(), '_blank')?.focus();

const LIMIT_ROWS = [
  { window: '5 小时', quota: '600 积分', reset: '滚动窗口，每 5 小时恢复' },
  { window: '每周', quota: '2,400 积分', reset: '每周一 08:00 恢复' },
  { window: '每月', quota: '8,000 积分', reset: '每月 1 日恢复' },
];

const PRIVACY_ROWS = [
  { series: 'Kimi 系列', training: '不用于训练', retention: '0 天' },
  { series: 'DeepSeek 系列', training: '不用于训练', retention: '30 天' },
  { series: 'Qwen 系列', training: '不用于训练', retention: '0 天' },
  { series: 'GLM 系列', training: '不用于训练', retention: '0 天' },
  { series: 'MiniMax 系列', training: '不用于训练', retention: '30 天' },
];

const GOALS = [
  { title: '无门槛访问', desc: '不用申请 API Key、不用绑卡充值多个平台，一次订阅用上整个旗舰开源模型阵容。' },
  { title: '可靠性', desc: '我们与模型提供商直接合作并做冗余部署，保证稳定的全球访问，而不是转发一个随时可能失效的第三方接口。' },
  { title: '精选与持续测试', desc: '进入 Go 的每个模型都经过团队的基准测试与真实任务验证，表现退步的模型会被移出。' },
  { title: '不锁定', desc: 'Go 是可选项。你的服务商配置、本地模型都还在原地，随时可以并用或切走。' },
];

export function GoDocsPage() {
  return (
    <div className="min-h-screen w-full bg-app-bg">
      <header className="border-b border-border/40">
        <div className="mx-auto w-full max-w-[680px] px-6 h-14 flex items-center gap-2.5">
          <img src={cherryLogoImg} alt="Cherry Studio" className="w-6 h-6 rounded-md" />
          <span className="text-sm font-medium text-foreground">Cherry Studio</span>
          <span className="text-muted-foreground/30 text-sm">/</span>
          <span className="text-sm text-muted-foreground">文档</span>
          <span className="text-muted-foreground/30 text-sm">/</span>
          <span className="text-sm text-muted-foreground">Go</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[680px] px-6 py-10">
        <article className="flex flex-col gap-8">
          {/* 页首定位 */}
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Cherry Go</h1>
            <p className="mt-2 text-base text-muted-foreground">低成本的旗舰开源模型订阅服务。</p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Cherry Go 是按月订阅：{GO_PLAN.price}，在 Cherry Studio 客户端直接使用精选的旗舰开源模型，
              无需申请和配置任何 API Key，享受稳定的全球访问。
            </p>
          </div>

          <Section title="背景">
            <p>
              开源模型的能力已经追上了专有模型，但想可靠地用上它们并不容易：各家提供商的接入方式、
              限流策略、稳定性参差不齐，自己维护多个 API Key 和额度是一件持续消耗精力的事。
            </p>
            <p className="mt-2">
              我们替你做了这部分工作：持续测试各家开源模型、与提供商直接合作、做基准评测和冗余部署，
              把结果打包成一个订阅。
            </p>
          </Section>

          <Section title="工作原理">
            <ol className="flex flex-col gap-2 list-decimal pl-5">
              <li>登录 Cherry Studio 账号，在网页端订阅 Go；</li>
              <li>回到客户端，模型选择器中出现「CherryAI Go」分组；</li>
              <li>直接选用其中的模型开始工作，无需任何额外配置。</li>
            </ol>
            <p className="mt-3">
              Go 当前覆盖 Kimi、DeepSeek、Qwen、GLM、MiniMax 等系列的旗舰开源模型，
              列表随开源生态持续更新——新模型发布后自动加入，无需额外付费；
              表现不佳的模型会被移出。
            </p>
          </Section>

          <Section title="使用限制">
            <p>
              Go 的消耗以<strong className="text-foreground font-medium">积分</strong>计费：
              每次请求根据所用模型与 token 用量折算成积分，从额度中扣除。
              同样的积分，用轻量模型能发起更多请求，用旗舰模型则更少。
              额度分三个时间窗口，各自独立、到点自动恢复：
            </p>
            <Table
              head={['时间窗口', '额度', '恢复规则']}
              rows={LIMIT_ROWS.map(r => [r.window, r.quota, r.reset])}
            />
            <p className="mt-2 text-[13px] text-muted-foreground/80">
              三档同时生效，任意一档用尽即触达限制；5 小时档用于承接突发的密集使用，
              每周 / 每月档保证长期用量的公平分配。
            </p>
          </Section>

          <Section title="使用限额重置">
            <p>
              套餐每月附带 {GO_RESETS.total} 次「使用限额重置」：额度提前用完时，
              在客户端或网页端点一下即可立即恢复 5 小时与每周窗口。
              每月额度不受重置影响，只在每月 1 日自动恢复。
            </p>
          </Section>

          <Section title="超出限制之后">
            <p>
              三档额度全部用尽时，Go 模型会暂时不可用，等待对应窗口自动恢复即可；
              期间你自己配置的服务商模型不受任何影响。目前不支持额度加购，
              按量付费的补充方案在规划中。
            </p>
          </Section>

          <Section title="隐私">
            <p>通过 Go 发出的请求遵循以下数据政策：</p>
            <Table
              head={['模型系列', '训练政策', '数据留存']}
              rows={PRIVACY_ROWS.map(r => [r.series, r.training, r.retention])}
            />
            <p className="mt-2 text-[13px] text-muted-foreground/80">
              所有请求均不用于模型训练；数据留存仅用于滥用检测，到期自动删除。
            </p>
          </Section>

          <Section title="目标">
            <div className="flex flex-col gap-3">
              {GOALS.map(g => (
                <div key={g.title}>
                  <p className="text-sm font-medium text-foreground">{g.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">{g.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* 底部订阅入口 */}
          <div className="rounded-[var(--radius-card)] border border-section-border bg-card px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Cherry Go</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{GO_PLAN.tagline} · {GO_PLAN.price}</p>
            </div>
            <Button size="sm" onClick={openGoPage} className="gap-1 flex-shrink-0">
              订阅 Go
              <ArrowUpRight size={12} />
            </Button>
          </div>
        </article>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-medium text-foreground mb-2.5">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="mt-3 rounded-[var(--radius-button)] border border-section-border overflow-hidden">
      <div className="grid grid-cols-3 gap-2 px-4 py-2 bg-muted/40 text-xs font-medium text-foreground/70">
        {head.map(h => <span key={h}>{h}</span>)}
      </div>
      {rows.map((cells, i) => (
        <div key={i} className={`grid grid-cols-3 gap-2 px-4 py-2.5 text-[13px] ${i > 0 ? 'border-t border-section-border/50' : 'border-t border-section-border/50'}`}>
          <span className="text-foreground">{cells[0]}</span>
          <span className="text-muted-foreground">{cells[1]}</span>
          <span className="text-muted-foreground">{cells[2]}</span>
        </div>
      ))}
    </div>
  );
}
