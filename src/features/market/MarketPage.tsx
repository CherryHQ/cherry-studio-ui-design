import React, { useMemo, useState } from 'react';
import {
  Download, TrendingUp, Sparkles, Clock, Check, ChevronDown,
  ShoppingBag, Sparkle, Star,
} from 'lucide-react';
import {
  Button, SearchInput, Typography, Badge,
  Popover, PopoverTrigger, PopoverContent,
  EmptyState,
} from '@cherry-studio/ui';

// ===========================
// Market Place
// ===========================
// Browse + install community-contributed Skills / MCPs / Prompts /
// Knowledge bases / Agents. Layout takes its cues from lobehub.com/skills
// (the public Lobe skills marketplace):
//   - Hero header with title + tagline + central SearchInput
//   - Pill row of category tabs across the top
//   - Right-aligned sort selector
//   - 3-column responsive card grid; each card carries a large emoji
//     avatar, title, author handle, 2-line description, tag chips,
//     installs/star stats, and an "安装/已安装" CTA

type CategoryId =
  | 'all' | 'skill' | 'mcp' | 'prompt' | 'agent' | 'kb' | 'plugin';

interface MarketItem {
  id: string;
  type: Exclude<CategoryId, 'all'>;
  name: string;
  author: string;
  emoji: string;
  description: string;
  tags: string[];
  installs: number;   // # of installs
  stars: number;      // GitHub stars / community stars
  featured?: boolean;
}

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'all',    label: '全部' },
  { id: 'skill',  label: 'Skill' },
  { id: 'mcp',    label: 'MCP Server' },
  { id: 'prompt', label: 'Prompt' },
  { id: 'agent',  label: 'Agent' },
  { id: 'kb',     label: '知识库' },
  { id: 'plugin', label: 'Plugin' },
];

type SortKey = 'trending' | 'latest' | 'popular';

const SORT_OPTIONS: { id: SortKey; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'trending', label: '热门', icon: TrendingUp },
  { id: 'latest',   label: '最新', icon: Clock },
  { id: 'popular',  label: '安装最多', icon: Download },
];

const TAG_COLOR: Record<string, string> = {
  生产力: 'bg-accent-emerald-muted text-accent-emerald border-accent-emerald/20',
  编程:   'bg-accent-cyan-muted    text-accent-cyan    border-accent-cyan/20',
  写作:   'bg-accent-amber-muted   text-accent-amber   border-accent-amber/20',
  翻译:   'bg-accent-violet-muted  text-accent-violet  border-accent-violet/20',
  设计:   'bg-accent-pink-muted    text-accent-pink    border-accent-pink/20',
  数据:   'bg-accent-blue-muted    text-accent-blue    border-accent-blue/20',
  研究:   'bg-accent-indigo-muted  text-accent-indigo  border-accent-indigo/20',
  办公:   'bg-success/10           text-success        border-success/20',
  开发:   'bg-accent-orange-muted  text-accent-orange  border-accent-orange/20',
};
function tagClass(t: string) { return TAG_COLOR[t] || 'bg-muted text-muted-foreground border-border/40'; }

const TYPE_LABEL: Record<MarketItem['type'], string> = {
  skill: 'Skill', mcp: 'MCP', prompt: 'Prompt', agent: 'Agent', kb: '知识库', plugin: 'Plugin',
};

const TYPE_COLOR: Record<MarketItem['type'], string> = {
  skill:  'text-accent-violet',
  mcp:    'text-info',
  prompt: 'text-accent-amber',
  agent:  'text-foreground/85',
  kb:     'text-success',
  plugin: 'text-accent-orange',
};

const CATALOG: MarketItem[] = [
  { id: 'm-1',  type: 'skill',  name: '网页摘要',        author: '@cherry-team',     emoji: '📄', description: '自动抓取网页主要内容并生成结构化摘要，附带原文引用。', tags: ['生产力', '研究'], installs: 18432, stars: 412, featured: true },
  { id: 'm-2',  type: 'mcp',    name: 'Filesystem MCP',  author: '@modelcontext',    emoji: '📁', description: '安全地读取与写入本地文件系统，支持 glob 搜索与跨目录批处理。', tags: ['开发'], installs: 32018, stars: 980, featured: true },
  { id: 'm-3',  type: 'prompt', name: 'Code Review Pro', author: '@octocat',         emoji: '🔍', description: '结构化代码审查模板，输出潜在 bug / 性能 / 安全 / 可读性四个维度的建议。', tags: ['编程', '开发'], installs: 9301, stars: 274 },
  { id: 'm-4',  type: 'skill',  name: '配色方案生成器',  author: '@design-lab',      emoji: '🎨', description: '根据品牌关键词生成 5 套配色方案，含主色 / 辅色 / 强调色与对比度评分。', tags: ['设计', '创意'], installs: 6420, stars: 188, featured: true },
  { id: 'm-5',  type: 'mcp',    name: 'GitHub MCP',      author: '@github-ext',      emoji: '🐙', description: '通过自然语言管理仓库：列 PR、创建 Issue、查看 commit、合并审查。', tags: ['开发'], installs: 27015, stars: 845 },
  { id: 'm-6',  type: 'prompt', name: '会议纪要',        author: '@productivity',    emoji: '📝', description: '基于对话记录提炼议题 / 决议 / 行动项，自动指派负责人与 deadline。', tags: ['办公', '生产力'], installs: 14502, stars: 360 },
  { id: 'm-7',  type: 'agent',  name: '调研分析师',      author: '@research-co',     emoji: '🔬', description: '多步调研 Agent：搜索 → 抓取 → 整理 → 输出图文报告与对比表。', tags: ['研究'], installs: 5210, stars: 156, featured: true },
  { id: 'm-8',  type: 'kb',     name: 'React 文档库',    author: '@meta',            emoji: '⚛️', description: '官方 React 文档全文索引，覆盖 18+ 版本与最新 RFC。', tags: ['编程'], installs: 8703, stars: 220 },
  { id: 'm-9',  type: 'plugin', name: 'Mermaid 渲染',    author: '@diagrams',        emoji: '📈', description: '在聊天中实时渲染 Mermaid 流程图 / 时序图 / 类图，可一键导出 SVG。', tags: ['数据', '设计'], installs: 11240, stars: 318 },
  { id: 'm-10', type: 'skill',  name: 'Markdown 转 PPT', author: '@slides-io',       emoji: '🪄', description: '把 Markdown 大纲一键转成幻灯片，支持 16:9 / 9:16 与品牌主题。', tags: ['办公', '设计'], installs: 13580, stars: 287 },
  { id: 'm-11', type: 'mcp',    name: 'Notion MCP',      author: '@notion-labs',     emoji: '📒', description: '页面读写、数据库查询、批量更新。所需 token 在 Notion 集成中心配置。', tags: ['办公'], installs: 19402, stars: 522 },
  { id: 'm-12', type: 'prompt', name: '邮件润色',        author: '@writers-club',    emoji: '✉️', description: '将草稿邮件改写成更得体、更简洁、或更友善的版本，可选语气。', tags: ['写作', '办公'], installs: 7681, stars: 198 },
  { id: 'm-13', type: 'agent',  name: '前端骨架生成',    author: '@uiverse',         emoji: '🧱', description: '根据需求自动生成 Next.js + Tailwind 项目脚手架与首屏页面。', tags: ['编程', '设计'], installs: 4128, stars: 142 },
  { id: 'm-14', type: 'plugin', name: 'LaTeX 渲染',      author: '@mathlab',         emoji: '𝑓',  description: '聊天中正确渲染数学公式与化学方程式，支持 KaTeX 全部宏。', tags: ['研究', '编程'], installs: 6024, stars: 161 },
  { id: 'm-15', type: 'kb',     name: '产品分析手册',    author: '@growth-os',       emoji: '📊', description: '增长黑客经典案例 + 北极星指标拆解，含每月更新的实战素材。', tags: ['数据', '办公'], installs: 3209, stars: 88 },
  { id: 'm-16', type: 'skill',  name: '语言翻译 Pro',    author: '@polyglot',        emoji: '🌍', description: '上下文感知翻译，自动保留专有名词、注释与代码块格式。', tags: ['翻译', '写作'], installs: 22148, stars: 615 },
  { id: 'm-17', type: 'agent',  name: 'SQL 报表助手',    author: '@dataops',         emoji: '🧮', description: '自然语言转 SQL，自动跑数 + 生成图表与解读，对接主流数仓。', tags: ['数据', '编程'], installs: 5832, stars: 165 },
  { id: 'm-18', type: 'mcp',    name: 'Browser MCP',     author: '@modelcontext',    emoji: '🌐', description: '受控浏览器自动化：打开网页、截图、提取内容、表单提交、批量爬取。', tags: ['开发', '研究'], installs: 16208, stars: 477 },
];

function formatCount(n: number) {
  if (n >= 10000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function MarketPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryId>('all');
  const [sort, setSort] = useState<SortKey>('trending');
  const [installed, setInstalled] = useState<Set<string>>(new Set(['m-2', 'm-8']));

  const filtered = useMemo(() => {
    let list = CATALOG;
    if (category !== 'all') list = list.filter(it => it.type === category);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(it =>
        it.name.toLowerCase().includes(q) ||
        it.description.toLowerCase().includes(q) ||
        it.author.toLowerCase().includes(q) ||
        it.tags.some(t => t.toLowerCase().includes(q)),
      );
    }
    const sorted = [...list].sort((a, b) => {
      if (sort === 'latest')  return b.id.localeCompare(a.id); // newer ids last → reverse
      if (sort === 'popular') return b.installs - a.installs;
      // trending: featured first, then by installs
      const af = a.featured ? 1 : 0;
      const bf = b.featured ? 1 : 0;
      if (af !== bf) return bf - af;
      return b.installs - a.installs;
    });
    return sorted;
  }, [category, search, sort]);

  const featured = CATALOG.filter(it => it.featured).slice(0, 3);

  const toggleInstall = (id: string) => {
    setInstalled(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const activeSort = SORT_OPTIONS.find(s => s.id === sort) ?? SORT_OPTIONS[0];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Hero header */}
      <div className="flex-shrink-0 px-8 pt-8 pb-5 border-b border-border/15">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-center gap-2 mb-1.5">
            <ShoppingBag size={16} strokeWidth={1.6} className="text-cherry-primary" />
            <span className="text-xs text-muted-foreground/60 tracking-wide uppercase">Cherry Studio Market</span>
          </div>
          <Typography variant="title" className="text-2xl mb-1">市场</Typography>
          <p className="text-sm text-muted-foreground/60 max-w-[640px]">
            发现并安装社区贡献的 Skill / MCP / Prompt / Agent / 知识库。一键引入到当前工作区。
          </p>
          <div className="mt-5 max-w-[560px]">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="搜索 Skill、Prompt、MCP Server…"
              clearable
              wrapperClassName="flex items-center gap-2 px-3 h-10 rounded-lg border border-border/40 bg-background shadow-sm hover:border-border/60 focus-within:border-border/70 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Toolbar — categories + sort */}
      <div className="flex-shrink-0 px-8 py-3 border-b border-border/15 bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-[1100px] mx-auto flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 flex-wrap">
            {CATEGORIES.map(cat => {
              const active = category === cat.id;
              return (
                <Button
                  key={cat.id}
                  variant="ghost"
                  size="xs"
                  onClick={() => setCategory(cat.id)}
                  className={`h-8 px-3 rounded-full text-xs transition-colors border ${
                    active
                      ? 'border-foreground/80 bg-foreground text-background hover:bg-foreground hover:text-background'
                      : 'border-border/30 text-muted-foreground/75 hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  {cat.label}
                </Button>
              );
            })}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="xs" className="h-8 gap-1.5 text-xs">
                  <activeSort.icon size={11} />
                  <span>{activeSort.label}</span>
                  <ChevronDown size={11} className="text-muted-foreground/50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[160px] p-1">
                {SORT_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const sActive = sort === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSort(opt.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-left transition-colors ${
                        sActive ? 'bg-accent/40 text-foreground' : 'text-muted-foreground hover:bg-accent/25 hover:text-foreground'
                      }`}
                    >
                      <Icon size={12} className="text-muted-foreground/70" />
                      <span className="flex-1">{opt.label}</span>
                      {sActive && <Check size={10} className="text-primary" />}
                    </button>
                  );
                })}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Content scroll area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-[1100px] mx-auto px-8 py-6 space-y-8">

          {/* Featured strip — only shown on "All" + no search */}
          {category === 'all' && !search.trim() && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={13} className="text-cherry-primary" />
                <span className="text-sm font-medium text-foreground">本周精选</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {featured.map(it => {
                  const isInstalled = installed.has(it.id);
                  return (
                    <button
                      key={it.id}
                      type="button"
                      className="text-left p-4 rounded-xl border border-border/30 bg-card hover:border-border/60 hover:shadow-sm transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 px-2 py-0.5 bg-cherry-primary/10 text-cherry-primary text-[10px] rounded-bl-md">
                        Featured
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/40 flex items-center justify-center text-2xl flex-shrink-0">
                          {it.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-sm font-medium text-foreground truncate">{it.name}</span>
                            <span className={`text-[9px] uppercase tracking-wide ${TYPE_COLOR[it.type]} flex-shrink-0`}>
                              {TYPE_LABEL[it.type]}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground/55 mb-1.5">{it.author}</div>
                          <p className="text-xs text-muted-foreground/70 line-clamp-2 leading-relaxed">{it.description}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground/60">
                          <span className="inline-flex items-center gap-0.5"><Download size={10} />{formatCount(it.installs)}</span>
                          <span className="inline-flex items-center gap-0.5"><Star size={10} />{formatCount(it.stars)}</span>
                        </div>
                        <Button
                          variant={isInstalled ? 'outline' : 'default'}
                          size="xs"
                          onClick={(e) => { e.stopPropagation(); toggleInstall(it.id); }}
                          className="gap-1 h-7"
                        >
                          {isInstalled ? <><Check size={10} />已安装</> : <><Download size={10} />安装</>}
                        </Button>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Main grid */}
          <section>
            {category === 'all' && !search.trim() && (
              <div className="flex items-center gap-2 mb-3">
                <Sparkle size={13} className="text-muted-foreground/60" />
                <span className="text-sm font-medium text-foreground">全部</span>
                <span className="text-xs text-muted-foreground/50 tabular-nums">{filtered.length}</span>
              </div>
            )}
            {filtered.length === 0 ? (
              <EmptyState preset="no-result" title={search.trim() ? '未找到匹配的内容' : '该分类暂无内容'} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map(it => {
                  const isInstalled = installed.has(it.id);
                  return (
                    <div
                      key={it.id}
                      className="group p-4 rounded-xl border border-border/25 bg-card/60 hover:border-border/55 hover:bg-card hover:shadow-sm transition-all flex flex-col"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/40 flex items-center justify-center text-2xl flex-shrink-0">
                          {it.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-foreground truncate">{it.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/55 mt-0.5">
                            <span className="truncate">{it.author}</span>
                            <span className="opacity-50">·</span>
                            <span className={`uppercase tracking-wide ${TYPE_COLOR[it.type]} flex-shrink-0`}>
                              {TYPE_LABEL[it.type]}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-2 mt-2.5 flex-1">
                        {it.description}
                      </p>
                      <div className="flex items-center gap-1 mt-2.5 flex-wrap">
                        {it.tags.map(t => (
                          <span key={t} className={`text-[10px] px-1.5 py-px rounded border ${tagClass(t)}`}>{t}</span>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-border/15 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground/60">
                          <span className="inline-flex items-center gap-0.5"><Download size={10} />{formatCount(it.installs)}</span>
                          <span className="inline-flex items-center gap-0.5"><Star size={10} />{formatCount(it.stars)}</span>
                        </div>
                        <Button
                          variant={isInstalled ? 'outline' : 'default'}
                          size="xs"
                          onClick={() => toggleInstall(it.id)}
                          className="gap-1 h-7"
                        >
                          {isInstalled ? <><Check size={10} />已安装</> : <><Download size={10} />安装</>}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
