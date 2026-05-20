import React, { useMemo, useState } from 'react';
import {
  Plus, Search, Filter, ArrowUpDown, ChevronRight, ChevronLeft,
  Check, Download, X, MoreHorizontal, Terminal, FileText,
  Wrench, Sparkles, MousePointerClick, BookOpen, Network, Plug,
  CheckCircle2, Zap, Compass, Star, ExternalLink, Shield,
  Upload, Link2,
} from 'lucide-react';
import {
  Button, Input, Textarea, SearchInput, Typography, Badge,
  Popover, PopoverTrigger, PopoverContent,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@cherry-studio/ui';

// ===========================
// Market Place
// ===========================
// Cherry Studio's public catalog of Skills / CLI / Assistant / MCP /
// Prompt / 知识库. Layout takes cues from ElevenLabs' voice-library
// (elevenlabs.io/app/agents/voice-library):
//   - Big page title + "Explore / My Library" tabs
//   - Long search bar + Filters / Sort icon buttons on the right
//   - Pill row of filter selectors (some dropdown-able)
//   - Dismissable announcement banner
//   - "Trending" section — 3-column grid of thin horizontal cards
//   - "Handpicked" carousel — 4 wide abstract-bg tiles
//   - Long detail list — table-like rows with avatar / name / lang /
//     usage / tag / action icons

// ─── Types ─────────────────────────────────────────────────────────────

type ResourceKind = 'skill' | 'cli' | 'assistant' | 'mcp' | 'prompt' | 'kb' | 'integration';

interface MarketItem {
  id: string;
  kind: ResourceKind;
  name: string;
  tagline: string;
  author: string;
  /** Single-letter / emoji avatar */
  avatar: string;
  /** Tailwind bg class for the avatar tile */
  avatarBg: string;
  language?: string;
  region?: string;
  category: string;     // 主类别（对话 / 写作 / 编程 / 研究 …）
  ageLabel: string;     // 上架时间（2y / 6mo）
  installs: number;
  trending?: boolean;
}

const KIND_LABEL: Record<ResourceKind, string> = {
  skill: 'Skill', cli: 'CLI', assistant: 'Assistant',
  mcp: 'MCP', prompt: 'Prompt', kb: '知识库', integration: '集成',
};

const KIND_ICON: Record<ResourceKind, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  skill: Sparkles, cli: Terminal, assistant: MousePointerClick,
  mcp: Network, prompt: FileText, kb: BookOpen, integration: Plug,
};

const KIND_COLOR: Record<ResourceKind, string> = {
  skill:       'bg-accent-violet/70',
  cli:         'bg-foreground/80',
  assistant:   'bg-accent-cyan/70',
  mcp:         'bg-info/70',
  prompt:      'bg-accent-amber/70',
  kb:          'bg-success/70',
  integration: 'bg-accent-orange/70',
};

// ─── Catalog ──────────────────────────────────────────────────────────

const CATALOG: MarketItem[] = [
  { id: 'm-1',  kind: 'skill',     name: '网页摘要',         tagline: '抓取网页主要内容并生成结构化摘要',          author: '@cherry-team',  avatar: '页',  avatarBg: 'bg-accent-pink/30',   language: '中文', region: '通用',     category: '内容创作', ageLabel: '6mo', installs: 18432, trending: true  },
  { id: 'm-2',  kind: 'mcp',       name: 'Filesystem MCP',    tagline: '安全地读取与写入本地文件系统，含 glob 搜索',  author: '@modelcontext', avatar: '📁',  avatarBg: 'bg-accent-blue/25',   language: 'EN',  region: '通用',     category: '开发',     ageLabel: '8mo', installs: 32018, trending: true  },
  { id: 'm-3',  kind: 'prompt',    name: 'Code Review Pro',   tagline: '结构化代码审查模板，输出四个维度的建议',       author: '@octocat',      avatar: '🔍',  avatarBg: 'bg-accent-violet/25', language: 'EN',  region: '通用',     category: '编程',     ageLabel: '1y',  installs: 9301,                 },
  { id: 'm-4',  kind: 'skill',     name: '配色方案生成器',     tagline: '根据品牌关键词生成 5 套配色 + 对比度评分',    author: '@design-lab',   avatar: '🎨',  avatarBg: 'bg-accent-pink/25',   language: '中文', region: '通用',     category: '设计',     ageLabel: '4mo', installs: 6420,  trending: true  },
  { id: 'm-5',  kind: 'mcp',       name: 'GitHub MCP',        tagline: '自然语言管理仓库、PR、Issue、Release',         author: '@github-ext',   avatar: '🐙',  avatarBg: 'bg-foreground/15',     language: 'EN',  region: '通用',     category: '开发',     ageLabel: '1y',  installs: 27015                 },
  { id: 'm-6',  kind: 'prompt',    name: '会议纪要',           tagline: '提炼议题 / 决议 / 行动项，自动指派负责人',     author: '@productivity', avatar: '📝',  avatarBg: 'bg-accent-amber/30',  language: '中文', region: '通用',     category: '办公',     ageLabel: '5mo', installs: 14502, trending: true  },
  { id: 'm-7',  kind: 'assistant', name: '调研分析师',         tagline: '多步调研：搜索 → 抓取 → 整理 → 报告与对比表',  author: '@research-co',  avatar: '🔬',  avatarBg: 'bg-accent-cyan/25',   language: '中文', region: '通用',     category: '研究',     ageLabel: '3mo', installs: 5210,  trending: true  },
  { id: 'm-8',  kind: 'kb',        name: 'React 文档库',       tagline: '官方 React 文档全文索引，覆盖 18+ 与最新 RFC', author: '@meta',         avatar: '⚛️', avatarBg: 'bg-info/20',          language: 'EN',  region: '通用',     category: '编程',     ageLabel: '11mo', installs: 8703                  },
  { id: 'm-9',  kind: 'cli',       name: 'cherry-cli',         tagline: '在终端中直接调用助手、跑 prompt、管理 KB',     author: '@cherry-team',  avatar: '⌘',   avatarBg: 'bg-foreground/15',    language: 'EN',  region: '通用',     category: '开发',     ageLabel: '7mo', installs: 11240, trending: true  },
  { id: 'm-10', kind: 'skill',     name: 'Markdown 转 PPT',    tagline: '一键把 Markdown 大纲转成 16:9 / 9:16 幻灯片',  author: '@slides-io',    avatar: '🪄',  avatarBg: 'bg-accent-orange/25', language: '中文', region: '通用',     category: '办公',     ageLabel: '6mo', installs: 13580,                },
  { id: 'm-11', kind: 'mcp',       name: 'Notion MCP',         tagline: '页面读写、数据库查询、批量更新',               author: '@notion-labs',  avatar: '📒',  avatarBg: 'bg-muted',            language: 'EN',  region: '通用',     category: '办公',     ageLabel: '1y',  installs: 19402, trending: true  },
  { id: 'm-12', kind: 'prompt',    name: '邮件润色',           tagline: '把草稿邮件改写成更得体 / 简洁 / 友善的版本',   author: '@writers-club', avatar: '✉️',  avatarBg: 'bg-accent-amber/25',  language: '中文', region: '通用',     category: '写作',     ageLabel: '3mo', installs: 7681,                 },
  { id: 'm-13', kind: 'assistant', name: '前端骨架生成',       tagline: '自动生成 Next.js + Tailwind 项目与首屏页面',  author: '@uiverse',      avatar: '🧱',  avatarBg: 'bg-accent-emerald/25', language: '中文', region: '通用',     category: '开发',     ageLabel: '4mo', installs: 4128,                 },
  { id: 'm-14', kind: 'cli',       name: 'mcp-runner',         tagline: '本地一行命令启动任意 MCP server，含进程托管',  author: '@modelcontext', avatar: '⚡',  avatarBg: 'bg-accent-yellow/25', language: 'EN',  region: '通用',     category: '开发',     ageLabel: '5mo', installs: 6024,                 },
  { id: 'm-15', kind: 'kb',        name: '产品分析手册',       tagline: '增长黑客经典案例 + 北极星指标拆解',           author: '@growth-os',    avatar: '📊',  avatarBg: 'bg-success/20',       language: '中文', region: '通用',     category: '数据',     ageLabel: '8mo', installs: 3209                  },
  { id: 'm-16', kind: 'skill',     name: '语言翻译 Pro',       tagline: '上下文感知翻译，保留专有名词 / 注释 / 代码',  author: '@polyglot',     avatar: '🌍',  avatarBg: 'bg-accent-blue/20',   language: '多语', region: '通用',     category: '翻译',     ageLabel: '1y',  installs: 22148, trending: true  },
  { id: 'm-17', kind: 'assistant', name: 'SQL 报表助手',       tagline: '自然语言转 SQL，跑数 + 图表 + 解读',           author: '@dataops',      avatar: '🧮',  avatarBg: 'bg-accent-indigo/25', language: '中文', region: '通用',     category: '数据',     ageLabel: '4mo', installs: 5832,                 },
  { id: 'm-18', kind: 'mcp',       name: 'Browser MCP',        tagline: '受控浏览器：截图 / 提取 / 表单 / 批量爬取',    author: '@modelcontext', avatar: '🌐',  avatarBg: 'bg-info/25',          language: 'EN',  region: '通用',     category: '开发',     ageLabel: '6mo', installs: 16208,                },
  // ─── Integrations ───────────────────────────────────────────────
  { id: 'm-19', kind: 'integration', name: 'Notion',           tagline: '页面读写、数据库查询、批量更新与权限同步',     author: '@notion-labs',  avatar: '📝',  avatarBg: 'bg-muted',            language: 'EN',  region: '通用',     category: '办公',     ageLabel: '1y',  installs: 41203, trending: true  },
  { id: 'm-20', kind: 'integration', name: '语雀',              tagline: '语雀知识库 / 文档 / 团队空间读写',             author: '@yuque',        avatar: '📘',  avatarBg: 'bg-success/20',       language: '中文', region: '中国',     category: '办公',     ageLabel: '8mo', installs: 18420, trending: true  },
  { id: 'm-21', kind: 'integration', name: 'Google Calendar',  tagline: '查询、创建日程，自动找时间，跨账号同步',       author: '@google',       avatar: '📅',  avatarBg: 'bg-info/20',          language: '多语', region: '全球',     category: '办公',     ageLabel: '11mo', installs: 38501, trending: true  },
  { id: 'm-22', kind: 'integration', name: '飞书',              tagline: '消息、文档、多维表格、日历、视频会议一体化',   author: '@feishu',       avatar: '🪶',  avatarBg: 'bg-accent-blue/25',   language: '中文', region: '中国',     category: '办公',     ageLabel: '7mo', installs: 22340, trending: true  },
  { id: 'm-23', kind: 'integration', name: 'Slack',             tagline: '频道消息 / DM / 工作流，含 Bot 双向通信',       author: '@slack',        avatar: '💬',  avatarBg: 'bg-accent-violet/25', language: '多语', region: '全球',     category: '办公',     ageLabel: '1y',  installs: 33215                  },
  { id: 'm-24', kind: 'integration', name: 'Linear',            tagline: '任务、项目、冲刺管理，自动开 issue 与转 PR',    author: '@linear',       avatar: '◰',   avatarBg: 'bg-accent-indigo/25', language: 'EN',  region: '全球',     category: '研究',     ageLabel: '6mo', installs: 12087                  },
  { id: 'm-25', kind: 'integration', name: 'Gmail',             tagline: '收发邮件、自动分类、生成回复草稿与摘要',       author: '@google',       avatar: '✉️',  avatarBg: 'bg-destructive/15',   language: '多语', region: '全球',     category: '办公',     ageLabel: '9mo', installs: 28910                  },
  { id: 'm-26', kind: 'integration', name: 'GitHub',            tagline: '仓库 / Issue / PR / Release 自然语言自动化',     author: '@github',       avatar: '🐙',  avatarBg: 'bg-foreground/15',    language: 'EN',  region: '全球',     category: '开发',     ageLabel: '1y',  installs: 51208, trending: true  },
  { id: 'm-27', kind: 'integration', name: 'Confluence',        tagline: '企业 Wiki 读写、模板插入、跨空间检索',         author: '@atlassian',    avatar: '🧭',  avatarBg: 'bg-info/15',          language: '多语', region: '全球',     category: '办公',     ageLabel: '5mo', installs: 7402                   },
  { id: 'm-28', kind: 'integration', name: 'Outlook',           tagline: '收发邮件 + 会议邀请 + 联系人同步',             author: '@microsoft',    avatar: '📧',  avatarBg: 'bg-info/20',          language: '多语', region: '全球',     category: '办公',     ageLabel: '6mo', installs: 14620                  },
];

// ─── Filter pills ─────────────────────────────────────────────────────

type FilterValue = 'all' | string;
const KIND_FILTERS: { id: ResourceKind | 'all'; label: string }[] = [
  { id: 'all',         label: '全部' },
  { id: 'skill',       label: 'Skill' },
  { id: 'cli',         label: 'CLI' },
  { id: 'assistant',   label: 'Assistant' },
  { id: 'mcp',         label: 'MCP' },
  { id: 'prompt',      label: 'Prompt' },
  { id: 'kb',          label: '知识库' },
  { id: 'integration', label: '集成' },
];

const LANGS: { id: FilterValue; label: string }[] = [
  { id: 'all',  label: '全部语言' },
  { id: '中文', label: '中文' },
  { id: 'EN',   label: 'English' },
  { id: '多语', label: '多语' },
];

const CATEGORIES: { id: FilterValue; label: string }[] = [
  { id: 'all',     label: '全部分类' },
  { id: '开发',    label: '开发' },
  { id: '编程',    label: '编程' },
  { id: '办公',    label: '办公' },
  { id: '研究',    label: '研究' },
  { id: '设计',    label: '设计' },
  { id: '内容创作', label: '内容创作' },
  { id: '翻译',    label: '翻译' },
  { id: '数据',    label: '数据' },
  { id: '写作',    label: '写作' },
];

// Use-case tiles for the "Handpicked" carousel
const HANDPICKED = [
  { id: 'uc-1', label: '开发工作流', bg: 'bg-[#1a1a1a] text-white',                  art: 'circles' },
  { id: 'uc-2', label: '内容创作',   bg: 'bg-[#f5efe6] text-foreground',              art: 'waves' },
  { id: 'uc-3', label: '研究分析',   bg: 'bg-[#efe7e0] text-foreground',              art: 'orbits' },
  { id: 'uc-4', label: '学习辅导',   bg: 'bg-[#0f1019] text-white',                   art: 'lattice' },
] as const;


// ─── Page component ───────────────────────────────────────────────────

export function MarketPage() {
  const [tab, setTab] = useState<'explore' | 'mine'>('explore');
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState<ResourceKind | 'all'>('all');
  const [language, setLanguage] = useState<FilterValue>('all');
  const [category, setCategory] = useState<FilterValue>('all');
  const [bannerOpen, setBannerOpen] = useState(true);
  const [installed, setInstalled] = useState<Set<string>>(new Set(['m-2', 'm-8']));
  // First-visit onboarding modal — opens on initial render. In a real
  // app this would gate on a localStorage flag; for the design mock we
  // just open it every mount so the entrance is always visible.
  const [onboardOpen, setOnboardOpen] = useState(true);
  // Detail dialog (二级页面) — opens when a row is clicked
  const [detailItem, setDetailItem] = useState<MarketItem | null>(null);
  // Submit-resource dialog — opens from the header CTA
  const [submitOpen, setSubmitOpen] = useState(false);

  const toggleInstall = (id: string) => {
    setInstalled(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let list = CATALOG;
    if (tab === 'mine') list = list.filter(it => installed.has(it.id));
    if (kind !== 'all') list = list.filter(it => it.kind === kind);
    if (language !== 'all') list = list.filter(it => it.language === language);
    if (category !== 'all') list = list.filter(it => it.category === category);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(it =>
      it.name.toLowerCase().includes(q) ||
      it.tagline.toLowerCase().includes(q) ||
      it.author.toLowerCase().includes(q),
    );
    return list;
  }, [tab, kind, language, category, search, installed]);

  const trending = CATALOG.filter(it => it.trending).slice(0, 6);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header: title + tabs + primary CTA */}
      <div className="flex-shrink-0 px-8 pt-8 pb-3">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-start justify-between gap-4 mb-3">
            <Typography variant="title" className="text-2xl">市场</Typography>
            <Button
              variant="default"
              size="sm"
              onClick={() => setSubmitOpen(true)}
              className="gap-1.5 h-8 bg-foreground text-background hover:bg-foreground/90"
            >
              <Plus size={13} />
              提交资源
            </Button>
          </div>
          <div className="flex items-center gap-1 border-b border-border/30">
            {([
              { id: 'explore', label: '探索' },
              { id: 'mine',    label: '我的资源' },
            ] as const).map(t => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`relative px-3 py-2 text-sm transition-colors ${
                    active ? 'text-foreground' : 'text-muted-foreground/60 hover:text-foreground'
                  }`}
                >
                  {t.label}
                  {active && <span className="absolute left-2 right-2 -bottom-px h-[2px] rounded-full bg-foreground" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content scroll */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-[1200px] mx-auto px-8 pb-10 space-y-8">

          {/* Toolbar: search + filters + sort */}
          <div className="pt-4">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="搜索资源…"
                  clearable
                  wrapperClassName="flex items-center gap-2 px-3 h-10 rounded-full border border-border/40 bg-background hover:border-border/60 focus-within:border-foreground/70 transition-colors"
                />
              </div>
              <Button variant="outline" size="sm" className="h-10 px-3 gap-1.5 rounded-md">
                <Filter size={13} />
                Filters
              </Button>
              <Button variant="outline" size="icon-sm" className="h-10 w-10 rounded-md">
                <ArrowUpDown size={13} />
              </Button>
            </div>

            {/* Pill row */}
            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
              <FilterPill
                label={LANGS.find(l => l.id === language)?.label ?? '语言'}
                active={language !== 'all'}
                dropdown
                options={LANGS}
                onSelect={(v) => setLanguage(v)}
              />
              <FilterPill
                label={CATEGORIES.find(c => c.id === category)?.label ?? '分类'}
                active={category !== 'all'}
                dropdown
                options={CATEGORIES}
                onSelect={(v) => setCategory(v)}
              />
              <span className="w-px h-4 bg-border/40 mx-1" />
              {KIND_FILTERS.filter(k => k.id !== 'all').map(k => {
                const active = kind === k.id;
                return (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => setKind(active ? 'all' : k.id as ResourceKind)}
                    className={`h-7 px-2.5 rounded-md text-xs border transition-colors ${
                      active
                        ? 'border-foreground/80 bg-foreground text-background'
                        : 'border-border/30 text-muted-foreground/80 hover:text-foreground hover:bg-muted/40'
                    }`}
                  >
                    {k.label}
                  </button>
                );
              })}
              <button
                type="button"
                className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-border/30 text-muted-foreground/60 hover:text-foreground hover:bg-muted/40"
                title="更多"
              >
                <ChevronRight size={12} />
              </button>
            </div>
          </div>

          {/* Campaign / promo banner — fresh light-pastel "integration hub" look */}
          {bannerOpen && (
            <div className="relative rounded-2xl overflow-hidden border border-border/30 bg-gradient-to-br from-[#eef9f1] via-[#eef4ff] to-[#f6ecff] text-foreground shadow-sm">
              {/* Soft blurred color blobs */}
              <div aria-hidden="true" className="absolute -top-10 -right-10 w-[260px] h-[260px] rounded-full bg-[#a8d8b9]/35 blur-3xl pointer-events-none" />
              <div aria-hidden="true" className="absolute -bottom-16 right-[140px] w-[200px] h-[200px] rounded-full bg-[#c7c0ff]/40 blur-3xl pointer-events-none" />

              {/* Floating service tiles — illustration of an integration hub */}
              <div aria-hidden="true" className="hidden md:block pointer-events-none">
                {/* Center "Cherry" hub */}
                <div className="absolute right-[150px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-base font-semibold text-foreground/85 border border-border/25">
                  🍒
                </div>
                {/* Orbiting service tiles */}
                {[
                  { emoji: '📝', label: 'Notion',    cls: 'right-[230px] top-3'       },
                  { emoji: '📘', label: '语雀',      cls: 'right-[58px] top-3'         },
                  { emoji: '📅', label: 'Calendar',  cls: 'right-[18px] top-[70px]'    },
                  { emoji: '🪶', label: '飞书',      cls: 'right-[230px] bottom-3'     },
                  { emoji: '💬', label: 'Slack',     cls: 'right-[58px] bottom-3'      },
                  { emoji: '🐙', label: 'GitHub',    cls: 'right-[280px] top-[70px]'   },
                ].map(tile => (
                  <div
                    key={tile.label}
                    className={`absolute ${tile.cls} w-9 h-9 rounded-xl bg-white shadow-sm border border-border/20 flex items-center justify-center text-base`}
                    title={tile.label}
                  >
                    {tile.emoji}
                  </div>
                ))}
                {/* Connector dots */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 180" preserveAspectRatio="none">
                  <g stroke="rgba(124,108,189,0.35)" strokeWidth="0.8" strokeDasharray="2 4" fill="none">
                    <path d="M 470 90 L 380 30" />
                    <path d="M 470 90 L 550 30" />
                    <path d="M 470 90 L 590 90" />
                    <path d="M 470 90 L 380 160" />
                    <path d="M 470 90 L 550 160" />
                    <path d="M 470 90 L 320 90" />
                  </g>
                </svg>
              </div>

              <div className="relative flex items-center gap-5 px-6 py-5">
                <div className="flex-1 min-w-0 max-w-[58%]">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/75 backdrop-blur text-[10px] uppercase tracking-wide font-medium mb-2 border border-border/20 text-foreground/75">
                    <Sparkles size={10} className="text-cherry-primary" />
                    本月上新
                  </div>
                  <h3 className="text-base font-semibold leading-tight text-foreground">
                    30+ 集成正式上架 · 一键对接你的工作流
                  </h3>
                  <p className="text-xs text-muted-foreground/75 mt-1 leading-relaxed">
                    Notion / 语雀 / Google Calendar / 飞书 / Slack / GitHub 等主流服务即开即用，
                    授权后可在对话中直接读写、查询、同步。
                  </p>
                  <div className="mt-3">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setKind('integration')}
                      className="h-8 px-3.5 gap-1.5 bg-foreground text-background hover:bg-foreground/90"
                    >
                      查看集成
                      <ChevronRight size={12} />
                    </Button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBannerOpen(false)}
                className="absolute top-2.5 right-2.5 w-6 h-6 inline-flex items-center justify-center rounded-md text-muted-foreground/45 hover:text-foreground hover:bg-muted/40 transition-colors"
                aria-label="关闭活动横幅"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Trending — only on Explore / no filter */}
          {tab === 'explore' && kind === 'all' && category === 'all' && !search.trim() && (
            <section>
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-sm font-medium text-foreground">热门资源</span>
                <ChevronRight size={13} className="text-muted-foreground/50" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {trending.map(it => {
                  const KIcon = KIND_ICON[it.kind];
                  return (
                    <button
                      key={it.id}
                      type="button"
                      className="text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/25 hover:border-border/55 hover:bg-muted/15 transition-all"
                    >
                      <Avatar item={it} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-foreground truncate">{it.name}</div>
                        <div className="text-[11px] text-muted-foreground/60 flex items-center gap-1 mt-px">
                          <KIcon size={10} />
                          <span>{it.category}</span>
                        </div>
                      </div>
                      <span className="px-1.5 py-px rounded border border-border/30 bg-muted/30 text-[10px] text-muted-foreground/70 flex-shrink-0">
                        {it.language}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Handpicked carousel */}
          {tab === 'explore' && kind === 'all' && category === 'all' && !search.trim() && (
            <section>
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-sm font-medium text-foreground">为你精选</span>
                <div className="flex items-center gap-1">
                  <button className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-border/30 text-muted-foreground/60 hover:text-foreground hover:bg-muted/40">
                    <ChevronLeft size={13} />
                  </button>
                  <button className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-border/30 text-muted-foreground/60 hover:text-foreground hover:bg-muted/40">
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {HANDPICKED.map(uc => (
                  <button
                    key={uc.id}
                    type="button"
                    className={`relative aspect-[16/10] rounded-xl overflow-hidden ${uc.bg} group`}
                  >
                    <HandpickedArt kind={uc.art} />
                    <div className="absolute inset-0 p-4 flex flex-col justify-end">
                      <span className="text-lg font-semibold tracking-tight">{uc.label}</span>
                    </div>
                    <div className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-foreground/85 text-background flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ChevronRight size={13} />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Detail list */}
          <section>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <div className="text-sm font-medium text-foreground">
                  {tab === 'mine' ? '我的资源' : (kind === 'all' ? '全部资源' : KIND_LABEL[kind])}
                  {category !== 'all' && <span className="text-muted-foreground/60"> · {category}</span>}
                </div>
                <div className="text-[11px] text-muted-foreground/55 tabular-nums mt-0.5">
                  共 {filtered.length} 条
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="border border-dashed border-border/30 rounded-xl py-12 flex flex-col items-center text-muted-foreground/55">
                <Sparkles size={20} strokeWidth={1.3} className="mb-2 text-muted-foreground/30" />
                <p className="text-xs">没有匹配的资源</p>
              </div>
            ) : (
              <div className="rounded-xl border border-border/25 bg-card/50 overflow-hidden">
                {filtered.map((it, i) => {
                  const KIcon = KIND_ICON[it.kind];
                  const isInstalled = installed.has(it.id);
                  return (
                    <div
                      key={it.id}
                      onClick={() => setDetailItem(it)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDetailItem(it); } }}
                      className={`group flex items-center gap-3 px-4 py-2.5 hover:bg-muted/25 transition-colors cursor-pointer ${
                        i > 0 ? 'border-t border-border/15' : ''
                      }`}
                    >
                      <Avatar item={it} size={36} />
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="text-sm text-foreground truncate">{it.name}</div>
                        <div className="text-[11px] text-muted-foreground/55 truncate">{it.tagline}</div>
                      </div>
                      <div className="hidden md:flex items-center gap-1.5 text-[11px] flex-shrink-0 w-[110px]">
                        <KIcon size={11} className="text-muted-foreground/55" />
                        <span className="text-muted-foreground/75">{it.category}</span>
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleInstall(it.id); }}
                          title={isInstalled ? '已安装 — 点击卸载' : '安装'}
                          aria-label={isInstalled ? '已安装' : '安装'}
                          className={`h-7 w-7 inline-flex items-center justify-center rounded-md transition-colors mr-1 ${
                            isInstalled
                              ? 'text-success hover:text-destructive hover:bg-destructive/10'
                              : 'text-muted-foreground/65 hover:text-foreground hover:bg-muted/50'
                          }`}
                        >
                          {isInstalled ? <Check size={13} /> : <Download size={12} />}
                        </button>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted/40 opacity-0 group-hover:opacity-100 transition-all"
                          title="更多"
                        >
                          <MoreHorizontal size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

        </div>
      </div>

      {/* Onboarding modal — first-visit feature introduction */}
      <MarketOnboardingModal open={onboardOpen} onOpenChange={setOnboardOpen} />

      {/* Detail dialog — opens when a row is clicked (二级页面) */}
      <MarketDetailDialog
        item={detailItem}
        onOpenChange={(open) => { if (!open) setDetailItem(null); }}
        installed={detailItem ? installed.has(detailItem.id) : false}
        onToggleInstall={(id) => toggleInstall(id)}
      />

      {/* Submit-resource dialog — opens from header CTA */}
      <SubmitResourceDialog open={submitOpen} onOpenChange={setSubmitOpen} />
    </div>
  );
}

// ─── Market detail dialog (二级页面) ────────────────────────────────────

function MarketDetailDialog({
  item, onOpenChange, installed, onToggleInstall,
}: {
  item: MarketItem | null;
  onOpenChange: (open: boolean) => void;
  installed: boolean;
  onToggleInstall: (id: string) => void;
}) {
  if (!item) return (
    <Dialog open={false} onOpenChange={onOpenChange}>
      <DialogContent />
    </Dialog>
  );
  const KIcon = KIND_ICON[item.kind];
  // Mocked extended fields — production data would carry these natively.
  const featureBullets = [
    '即开即用，无需手动配置',
    '与其它已安装资源自动协同',
    '由社区维护，每月发布新版',
  ];
  const permissions = item.kind === 'integration'
    ? ['读取你的账号基础信息', '读取与写入指定空间内容', '通过 OAuth 授权，可随时撤销']
    : item.kind === 'mcp'
      ? ['启动本地 / 远端 MCP 进程', '读取上下文中的会话历史', '调用注册的 MCP 工具集']
      : ['仅在被显式调用时执行', '不主动读取剪贴板或外部文件'];
  const installsLabel = item.installs >= 10000 ? `${(item.installs / 1000).toFixed(1)}K` : item.installs.toLocaleString();
  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[680px] p-0 overflow-hidden">
        {/* Hero — gradient bar with avatar + name */}
        <div className={`relative h-[120px] ${item.avatarBg} overflow-hidden`}>
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-black/10" />
          <div className="absolute inset-0 flex items-end gap-3 px-5 pb-4">
            <div className="w-14 h-14 rounded-xl bg-white shadow-md border border-border/30 flex items-center justify-center text-2xl flex-shrink-0">
              {item.avatar}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-base font-semibold text-foreground truncate">{item.name}</span>
                <span className="text-[10px] uppercase px-1.5 py-px rounded border border-border/30 bg-white/70 text-muted-foreground/85">
                  {KIND_LABEL[item.kind]}
                </span>
              </div>
              <div className="text-xs text-muted-foreground/75 truncate">
                {item.author} · 上架于 {item.ageLabel} 前
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin">
          <div className="px-5 py-4 space-y-5">
            {/* Stats strip */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground/75">
              <span className="inline-flex items-center gap-1"><Download size={11} />{installsLabel} 次安装</span>
              <span className="inline-flex items-center gap-1"><Star size={11} />社区评分 4.6</span>
              <span className="inline-flex items-center gap-1"><KIcon size={11} />{item.category}</span>
              {item.language && <span className="text-muted-foreground/55">· {item.language}</span>}
              {item.region && <span className="text-muted-foreground/55">· {item.region}</span>}
            </div>

            <div>
              <h4 className="text-xs text-foreground font-medium mb-1.5">描述</h4>
              <p className="text-sm text-foreground/85 leading-relaxed">
                {item.tagline}
              </p>
            </div>

            <div>
              <h4 className="text-xs text-foreground font-medium mb-2">功能亮点</h4>
              <ul className="space-y-1.5">
                {featureBullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                    <CheckCircle2 size={12} className="text-success mt-0.5 flex-shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs text-foreground font-medium mb-2 flex items-center gap-1.5">
                <Shield size={11} className="text-muted-foreground/60" />
                需要的权限
              </h4>
              <ul className="space-y-1.5">
                {permissions.map((p, i) => (
                  <li key={i} className="text-xs text-muted-foreground/80 pl-4 relative">
                    <span className="absolute left-0 top-2 w-1 h-1 rounded-full bg-muted-foreground/40" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-5 py-3 border-t border-border/20 bg-muted/15">
          <div className="flex items-center justify-between w-full gap-2">
            <Button variant="ghost" size="xs" className="gap-1.5 text-muted-foreground/70">
              <ExternalLink size={11} />
              查看源仓库
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8"
              >
                关闭
              </Button>
              <Button
                variant={installed ? 'outline' : 'default'}
                size="sm"
                onClick={() => onToggleInstall(item.id)}
                className="h-8 gap-1.5"
              >
                {installed ? <><Check size={12} />已安装</> : <><Download size={12} />立即安装</>}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Submit-resource dialog ────────────────────────────────────────────

function SubmitResourceDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [kind, setKind] = useState<ResourceKind>('skill');
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || tags.includes(t)) return;
    setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const canSubmit = name.trim().length > 0 && tagline.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/20">
          <DialogTitle className="text-base">提交资源到市场</DialogTitle>
          <DialogDescription className="text-xs">
            提交的资源会在 24 小时内由社区审核员审阅。审核通过后才会出现在公开目录中。
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin px-5 py-4 space-y-4">
          {/* Type selector */}
          <div>
            <label className="text-xs text-muted-foreground/70 mb-1.5 block">资源类型</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['skill','cli','assistant','mcp','prompt','kb','integration'] as ResourceKind[]).map(k => {
                const Icon = KIND_ICON[k];
                const active = kind === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKind(k)}
                    className={`flex items-center justify-center gap-1.5 h-9 rounded-md border text-xs transition-colors ${
                      active
                        ? 'border-foreground/80 bg-foreground text-background'
                        : 'border-border/30 text-muted-foreground/75 hover:text-foreground hover:bg-muted/40'
                    }`}
                  >
                    <Icon size={12} />
                    {KIND_LABEL[k]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name + Tagline */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs text-muted-foreground/70 mb-1.5 block">名称</label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="例如：网页摘要"
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground/70 mb-1.5 block">一句话简介</label>
              <Input
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                placeholder="120 字以内，描述这条资源的核心能力"
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground/70 mb-1.5 block">详细描述</label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="支持 Markdown：用法说明、示例输入输出、依赖等"
                rows={5}
                className="text-xs leading-relaxed resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground/70 mb-1.5 block">源仓库 / 安装地址</label>
              <div className="relative">
                <Link2 size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/45" />
                <Input
                  value={sourceUrl}
                  onChange={e => setSourceUrl(e.target.value)}
                  placeholder="https://github.com/your-org/your-skill"
                  className="h-9 pl-8 text-sm font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground/70 mb-1.5 block">标签</label>
              {tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                  {tags.map(t => (
                    <Badge key={t} variant="outline" className="gap-1 px-1.5 py-[2px] rounded-md text-[11px] border-border/40 bg-muted/40 text-foreground/80">
                      {t}
                      <button onClick={() => setTags(prev => prev.filter(x => x !== t))} className="opacity-50 hover:opacity-100">×</button>
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  placeholder="输入标签后回车"
                  className="h-8 text-xs flex-1"
                />
                <Button variant="outline" size="xs" onClick={addTag} className="h-8">添加</Button>
              </div>
            </div>
          </div>

          {/* Upload hint */}
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg border border-dashed border-border/30 bg-muted/15">
            <Upload size={13} className="text-muted-foreground/55 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
              如果你的资源需要附带文件，请将仓库根目录的 <span className="font-mono text-foreground/80">cherry.json</span>
              + 资源主体一起打包推送到上述地址，审核员会自动拉取。
            </p>
          </div>
        </div>

        <DialogFooter className="px-5 py-3 border-t border-border/20 bg-muted/15">
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8">取消</Button>
            <Button
              variant="default"
              size="sm"
              disabled={!canSubmit}
              onClick={() => { /* mock */ onOpenChange(false); }}
              className="h-8 gap-1.5 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40"
            >
              <Plus size={12} />
              提交审核
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Onboarding modal ────────────────────────────────────────────────

function MarketOnboardingModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const bullets: { Icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>; text: string }[] = [
    { Icon: Zap,           text: '一键安装社区精心打磨的 Skill / MCP / Prompt 模板' },
    { Icon: Plug,          text: '直接对接 Notion / 语雀 / Google Calendar 等集成' },
    { Icon: CheckCircle2,  text: '在「我的资源」中统一管理已安装项，启停 / 更新 / 卸载一目了然' },
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[360px] p-0 overflow-hidden rounded-2xl border border-border/30"
      >
        {/* Top hero — gradient illustration */}
        <div className="relative h-[160px] bg-gradient-to-br from-[#f0c5a6] via-[#c89cb0] to-[#9b6db0] overflow-hidden">
          <svg
            aria-hidden="true"
            viewBox="0 0 360 160"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
          >
            {/* Decorative tilted tiles representing "templates / resources" */}
            <g transform="translate(120 32) rotate(-8)">
              <rect width="80" height="80" rx="12" fill="rgba(255,255,255,0.85)" stroke="rgba(0,0,0,0.05)" />
              <rect x="10" y="10" width="60" height="22" rx="4" fill="#b5856f" />
              <rect x="10" y="40" width="36" height="6"  rx="3" fill="#d6b8a8" />
              <rect x="10" y="50" width="48" height="6"  rx="3" fill="#e6d4c8" />
            </g>
            <g transform="translate(200 56) rotate(12)">
              <rect width="80" height="58" rx="10" fill="rgba(255,255,255,0.92)" stroke="rgba(0,0,0,0.05)" />
              <rect x="10" y="10" width="60" height="22" rx="4" fill="#cda0bf" />
              <rect x="10" y="38" width="40" height="6"  rx="3" fill="#e5cbdc" />
            </g>
            <g transform="translate(58 78) rotate(-3)">
              <rect width="60" height="36" rx="8" fill="rgba(255,255,255,0.88)" stroke="rgba(0,0,0,0.05)" />
              <rect x="8" y="8"  width="44" height="6" rx="3" fill="#c98b6a" />
              <rect x="8" y="18" width="36" height="6" rx="3" fill="#e8c8b3" />
              <rect x="8" y="28" width="28" height="6" rx="3" fill="#f1d9c6" />
            </g>
            {/* Connection arrow between the two main tiles */}
            <g transform="translate(192 80)">
              <circle r="11" fill="white" stroke="rgba(0,0,0,0.06)" />
              <path d="M -4 -4 L 4 0 L -4 4 Z" fill="#7d4a8e" />
            </g>
          </svg>
        </div>

        {/* Body */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <h2 className="text-base font-semibold text-foreground">认识市场</h2>
            <span className="px-1.5 py-px rounded text-[10px] uppercase tracking-wide font-medium bg-muted/60 text-muted-foreground/80 border border-border/30">
              Beta
            </span>
          </div>
          <ul className="space-y-2.5">
            {bullets.map((b, i) => {
              const Icon = b.Icon;
              return (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-foreground/8 text-foreground/75 flex-shrink-0 mt-px">
                    <Icon size={11} />
                  </span>
                  <span className="text-xs text-foreground/85 leading-relaxed">{b.text}</span>
                </li>
              );
            })}
          </ul>
          <Button
            variant="default"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="w-full h-9 mt-4 bg-foreground text-background hover:bg-foreground/90 text-sm rounded-lg"
          >
            开始浏览
          </Button>
          <p className="text-[10px] text-muted-foreground/55 text-center mt-2.5">
            市场目前处于 Beta，使用即视为同意
            <span className="underline cursor-pointer ml-0.5">Beta 服务条款</span>
            。
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────

function Avatar({ item, size = 36 }: { item: MarketItem; size?: number }) {
  return (
    <div
      className={`rounded-md ${item.avatarBg} flex items-center justify-center flex-shrink-0 text-base`}
      style={{ width: size, height: size }}
    >
      <span className={`${size >= 40 ? 'text-lg' : 'text-base'}`}>{item.avatar}</span>
    </div>
  );
}

function FilterPill({
  label, active, dropdown, options, onSelect,
}: {
  label: string;
  active?: boolean;
  dropdown?: boolean;
  options?: { id: string; label: string }[];
  onSelect?: (v: string) => void;
}) {
  const trigger = (
    <button
      type="button"
      className={`inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-xs border transition-colors ${
        active
          ? 'border-foreground/80 bg-foreground text-background'
          : 'border-border/30 text-muted-foreground/80 hover:text-foreground hover:bg-muted/40'
      }`}
    >
      <span>{label}</span>
      {dropdown && <ChevronRight size={10} className="rotate-90 opacity-70" />}
    </button>
  );
  if (!dropdown || !options) return trigger;
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="start" className="w-[180px] p-1">
        {options.map(opt => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect?.(opt.id)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-left hover:bg-accent/40 transition-colors"
          >
            <span className="flex-1">{opt.label}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

// Abstract background art for handpicked tiles
function HandpickedArt({ kind }: { kind: 'circles' | 'waves' | 'orbits' | 'lattice' }) {
  if (kind === 'circles') {
    return (
      <svg className="absolute inset-0 w-full h-full opacity-90" viewBox="0 0 200 120" preserveAspectRatio="none">
        <defs>
          <radialGradient id="rg1" cx="35%" cy="55%" r="40%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="44" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.6" />
        <circle cx="60" cy="60" r="32" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
        <circle cx="60" cy="60" r="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
        <circle cx="60" cy="60" r="8"  fill="rgba(255,255,255,0.4)" />
        <rect width="200" height="120" fill="url(#rg1)" />
      </svg>
    );
  }
  if (kind === 'waves') {
    return (
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 120" preserveAspectRatio="none">
        <path d="M 0 70 Q 50 30 100 70 T 200 70" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="0.8" />
        <path d="M 0 80 Q 50 40 100 80 T 200 80" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="0.6" />
        <path d="M 0 90 Q 50 50 100 90 T 200 90" fill="none" stroke="rgba(0,0,0,0.2)"  strokeWidth="0.5" />
      </svg>
    );
  }
  if (kind === 'orbits') {
    return (
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 120" preserveAspectRatio="none">
        <ellipse cx="100" cy="60" rx="80" ry="22" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="0.7" />
        <ellipse cx="100" cy="60" rx="50" ry="40" fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="0.6" />
        <ellipse cx="100" cy="60" rx="25" ry="50" fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="0.5" />
        <circle cx="100" cy="60" r="4" fill="rgba(0,0,0,0.6)" />
      </svg>
    );
  }
  // lattice
  return (
    <svg className="absolute inset-0 w-full h-full opacity-80" viewBox="0 0 200 120" preserveAspectRatio="none">
      <g stroke="rgba(255,255,255,0.32)" strokeWidth="0.4" fill="none">
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`v${i}`} x1={20 + i * 22} y1="20" x2={20 + i * 22} y2="100" />
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <line key={`h${i}`} x1="20" y1={20 + i * 20} x2="180" y2={20 + i * 20} />
        ))}
        <path d="M 20 20 L 180 100 M 180 20 L 20 100" />
      </g>
    </svg>
  );
}
