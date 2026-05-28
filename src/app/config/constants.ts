import {
  MessageCircle, Bot, Palette, Languages, Compass,
  Library, BookOpen, FileText, Code2, Puzzle, NotebookPen, Layers,
  Sparkles, MousePointerClick, Blocks, ShoppingBag,
  Zap, Cloud, MessageSquareText,
  Shield, ShieldCheck, ShieldAlert,
  Users2,
} from 'lucide-react';
import type {
  MenuItem, SidebarLayout,
  ResourceType, ResourceTypeUIConfig,
  PermissionMode, PermissionModeInfo,
} from '../types';

// ===========================
// Sidebar Menu Items (static UI config)
// ===========================

export const menuItems: MenuItem[] = [
  { id: 'chat', label: '聊天', icon: MessageCircle },
  { id: 'agent', label: 'Agent', icon: MousePointerClick },
  { id: 'collaboration', label: '协作', icon: Users2 },
  { id: 'painting', label: '创作', icon: Palette },
  { id: 'translate', label: '翻译', icon: Languages },
  { id: 'explore', label: '探索', icon: Compass },
  { id: 'market', label: '市场', icon: ShoppingBag },
  { id: 'library', label: '资源', icon: Library },
  { id: 'knowledge', label: '知识库', icon: BookOpen },
  { id: 'file', label: '文件', icon: FileText },
  { id: 'code', label: '编码', icon: Code2 },
  { id: 'miniapp', label: '小程序', icon: Puzzle },
  { id: 'note', label: '笔记', icon: NotebookPen },
  { id: 'extensions', label: '扩展', icon: Blocks },
  { id: 'empty-preview', label: 'Empty State', icon: Layers },
];

// Multi-instance types: clicking sidebar always creates a new tab
export const MULTI_INSTANCE_ITEMS = ['chat', 'agent'];

// Sidebar layout breakpoints
export const BP_ICON = 50;
export const BP_VERTICAL_CARD = 65;
export const BP_FULL = 170;

export function getLayout(width: number): SidebarLayout {
  if (width < 20) return 'hidden';
  if (width < 58) return 'icon';
  if (width < 120) return 'vertical-card';
  return 'full';
}

// ===========================
// New Tab Dialog data (static UI config)
// ===========================
export const dialogAppIcons: { id: string; label: string; icon: typeof MessageCircle; color: string; bg: string }[] = [
  { id: 'chat', label: '聊天', icon: MessageCircle, color: 'text-foreground/50', bg: 'bg-foreground/[0.1]' },
  { id: 'agent', label: 'Agent', icon: MousePointerClick, color: 'text-info', bg: 'bg-info/20' },
  { id: 'collaboration', label: '协作', icon: Users2, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  { id: 'painting', label: '绘画', icon: Palette, color: 'text-rose-400', bg: 'bg-rose-500/20' },
  { id: 'translate', label: '翻译', icon: Languages, color: 'text-violet-400', bg: 'bg-violet-500/20' },
  { id: 'knowledge', label: '知识库', icon: BookOpen, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  { id: 'library', label: '资源', icon: Library, color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
  { id: 'note', label: '笔记', icon: NotebookPen, color: 'text-teal-400', bg: 'bg-teal-500/20' },
  { id: 'code', label: 'Code', icon: Code2, color: 'text-slate-400', bg: 'bg-slate-500/20' },
  { id: 'explore', label: '探索', icon: Compass, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  { id: 'file', label: '文件', icon: FileText, color: 'text-warning', bg: 'bg-warning/20' },
  { id: 'miniapp', label: '小程序', icon: Puzzle, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  { id: 'extensions', label: '扩展', icon: Blocks, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/20' },
];

export const dialogFilterTabs = ['对话', '助手', '页面', '文件', '文档', '消息'];

export const newTabHistoryItems = [
  { id: 'chat', label: '查询新加坡美食', desc: '默认助手 · davis@example.com', icon: MessageCircle, count: 1, category: '对话' },
  { id: 'chat', label: '咨询理财建议', desc: '理财顾问 · gmartinez', icon: MessageCircle, count: 3, category: '对话' },
  { id: 'agent', label: 'AI 写作助手体验', desc: '智能体 · 运营助手', icon: MousePointerClick, count: 6, category: '助手' },
  { id: 'chat', label: '代码审查最佳实践', desc: '编程助手 · anderson', icon: Code2, count: 8, category: '对话' },
  { id: 'chat', label: '制定每周新媒体运营计划', desc: '运营助手 · 消息', icon: MessageCircle, count: 2, category: '消息' },
  { id: 'note', label: '项目周报 - Week 12', desc: '笔记 · 页面', icon: NotebookPen, count: 0, category: '页面' },
];

export const newTabFileItems = [
  { id: 'file', label: 'API 文档 v2.1', desc: '技术规范', meta: '2.4 MB · 2 小时前修改', icon: FileText, category: '文件' },
  { id: 'knowledge', label: '机器学习模型指南', desc: '教程', meta: '1.8 MB · 1 天前修改', icon: BookOpen, category: '文档' },
  { id: 'file', label: '用户调研结果', desc: '研究', meta: '1.8 MB · 2 小时前修改', icon: FileText, category: '文件' },
  { id: 'file', label: '产品路线图 Q4 2025', desc: '规划', meta: '5.2 MB · 1 周前修改', icon: FileText, category: '文档' },
];

// Mock HTML artifacts produced by Agents — shown as shortcut tiles in the
// Launchpad (top avatar row). Each entry surfaces both:
//   - a tile in the launchpad with id `html:<key>` (built via
//     `dialogAppIconsWithAgents` in CherryStudio.tsx), and
//   - the inline iframe preview opened when that tile is clicked.
export interface HtmlArtifactPreview {
  /** Short label shown under the tile. */
  label: string;
  /** Emoji used as the tile avatar. */
  emoji: string;
  /** Full title shown in the preview dialog header. */
  title: string;
  /** Inline HTML rendered into the preview iframe via srcDoc. */
  html: string;
}

export const newTabHtmlPreviews: Record<string, HtmlArtifactPreview> = {
  'weekly-report': {
    label: '周报 Week 12',
    emoji: '📊',
    title: '周报 · Week 12',
    html: `<!doctype html><html lang="zh"><head><meta charset="utf-8"><title>周报 · Week 12</title><style>
:root{font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Segoe UI',sans-serif;color:#1a1a1a}
body{margin:0;padding:32px 40px;background:#fafafa}
header{display:flex;align-items:baseline;justify-content:space-between;border-bottom:1px solid #e5e5e5;padding-bottom:12px;margin-bottom:24px}
h1{margin:0;font-size:22px;font-weight:600;letter-spacing:-.01em}
.meta{color:#8a8a8a;font-size:12px}
h2{font-size:14px;font-weight:600;margin:24px 0 8px;color:#3a3a3a}
ul{margin:0;padding-left:18px;line-height:1.7;font-size:13px;color:#2a2a2a}
.kpi{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:16px 0 24px}
.kpi div{padding:12px 16px;border:1px solid #eee;border-radius:10px;background:#fff}
.kpi b{display:block;font-size:20px;font-weight:600;letter-spacing:-.02em}
.kpi span{color:#8a8a8a;font-size:11px}
footer{margin-top:32px;font-size:11px;color:#a0a0a0;border-top:1px solid #eee;padding-top:12px}
</style></head><body>
<header><h1>周报 · Week 12</h1><span class="meta">数据分析师 · 自动生成</span></header>
<div class="kpi">
  <div><b>1,284</b><span>本周新增对话</span></div>
  <div><b>+18.2%</b><span>对比上周</span></div>
  <div><b>96.4%</b><span>用户满意度</span></div>
</div>
<h2>本周亮点</h2>
<ul><li>智能体调度策略上线，平均响应时间下降 24%</li><li>新增多模态输入支持（截图、PDF）</li><li>知识库索引重构，相关召回率提升至 92%</li></ul>
<h2>下周计划</h2>
<ul><li>完成 Loupe 标注工具与 AGENTS.md 联动</li><li>市场详情页换装 — 来源与作者信息</li><li>客户成功团队接入 Cherry Enterprise</li></ul>
<footer>这是 Launchpad 内联预览示例 · 在产品中由真实数据生成</footer>
</body></html>`,
  },
  'user-research': {
    label: '用户访谈摘要',
    emoji: '📝',
    title: '用户访谈摘要 · 2026 Q2',
    html: `<!doctype html><html lang="zh"><head><meta charset="utf-8"><title>用户访谈摘要</title><style>
body{font-family:-apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif;margin:0;padding:32px 40px;background:#fafafa;color:#1a1a1a}
h1{margin:0 0 4px;font-size:22px;font-weight:600;letter-spacing:-.01em}
.sub{color:#8a8a8a;font-size:12px;margin-bottom:24px}
.q{border-left:3px solid #c8a2c8;padding:8px 0 8px 14px;margin:18px 0;background:#fff;border-radius:0 8px 8px 0}
.q b{display:block;font-size:13px;color:#3a3a3a;margin-bottom:4px}
.q p{margin:0;font-size:13px;line-height:1.65;color:#2a2a2a}
.tag{display:inline-block;font-size:11px;color:#6a6a6a;background:#eee;border-radius:6px;padding:1px 6px;margin-right:4px;margin-top:4px}
</style></head><body>
<h1>用户访谈摘要 · 2026 Q2</h1>
<div class="sub">12 位深度用户 · 调研分析师 · 90 分钟综合摘要</div>
<div class="q"><b>1. 你最常用 Cherry Studio 做什么？</b><p>11 / 12 提到"快速验证想法的草稿"；8 / 12 把它当成"和团队同步思考的画布"。</p><span class="tag">高频</span><span class="tag">共识</span></div>
<div class="q"><b>2. 哪一步骤让你想关掉？</b><p>切换助手 → 等待响应是首要痛点（6 人提及）。其次是"找不到上次会话"（4 人）。</p><span class="tag">流失风险</span></div>
<div class="q"><b>3. 期待新功能</b><p>所有受访者均提到希望"导出干净的 HTML / PDF 报告"。其次是"会话搜索（5 人）"和"协作评论（4 人）"。</p><span class="tag">高期望</span></div>
</body></html>`,
  },
  'market-recap': {
    label: '市场季报',
    emoji: '📈',
    title: '市场季报 · 2026 Q2',
    html: `<!doctype html><html lang="zh"><head><meta charset="utf-8"><title>市场季报</title><style>
body{font-family:-apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif;margin:0;padding:28px 36px;background:#0d1117;color:#e6edf3}
h1{margin:0;font-size:22px;letter-spacing:-.01em}
.sub{color:#7d8590;font-size:12px;margin:4px 0 24px}
.row{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:14px;align-items:end;margin:14px 0 8px}
.bar{background:linear-gradient(180deg,#388bfd 0%,#1f6feb 100%);border-radius:6px 6px 0 0;display:flex;align-items:flex-end;justify-content:center;padding-bottom:6px;font-size:11px;color:#fff;font-weight:600}
.b1{height:80px}.b2{height:130px}.b3{height:170px}
.lbl{font-size:11px;color:#7d8590;text-align:center;margin-top:6px}
.hl{background:#161b22;border:1px solid #21262d;border-radius:10px;padding:14px 16px;margin-top:18px;font-size:13px;line-height:1.65;color:#c9d1d9}
.hl b{color:#e6edf3}
</style></head><body>
<h1>市场季报 · 2026 Q2</h1>
<div class="sub">数据分析师 · 公开数据汇总</div>
<div class="row">
  <div><div class="bar b1">Q1</div><div class="lbl">Q1 2026</div></div>
  <div><div class="bar b2">+62%</div><div class="lbl">Q2 2026</div></div>
  <div><div class="bar b3">+112%</div><div class="lbl">预计 Q3</div></div>
</div>
<div class="hl"><b>关键判断 ·</b> 国产桌面 Agent 工具进入"渗透加速期"，头部产品季度装机增速达 110%+，跨场景集成是主要拉动力。建议在 Q3 加强与第三方知识库 / 协作工具的双向打通。</div>
</body></html>`,
  },
  'design-spec': {
    label: '设计规范',
    emoji: '🎨',
    title: '设计规范 · Cherry Studio v3',
    html: `<!doctype html><html lang="zh"><head><meta charset="utf-8"><title>设计规范</title><style>
body{font-family:-apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif;margin:0;padding:32px 40px;background:#fafafa;color:#1a1a1a}
h1{margin:0;font-size:22px;font-weight:600;letter-spacing:-.01em}
.sub{color:#8a8a8a;font-size:12px;margin:4px 0 28px}
section{margin:20px 0}
section h2{font-size:13px;font-weight:600;color:#3a3a3a;margin:0 0 12px;letter-spacing:.04em;text-transform:uppercase}
.palette{display:flex;gap:8px}
.swatch{flex:1;height:64px;border-radius:10px;display:flex;align-items:flex-end;justify-content:center;color:#fff;font-size:11px;padding-bottom:6px;font-family:monospace}
.s1{background:#0d0d0d}.s2{background:#2a2a2a}.s3{background:#7a7a7a;color:#fff}.s4{background:#eaeaea;color:#3a3a3a}
.type{display:grid;grid-template-columns:80px 1fr;gap:8px 16px;font-size:12px;color:#2a2a2a;line-height:1.6}
.type b{color:#7a7a7a;font-weight:500}
.spacing{display:flex;gap:4px;align-items:flex-end}
.spacing div{background:#388bfd;border-radius:4px;color:#fff;font-size:10px;text-align:center;padding:2px}
</style></head><body>
<h1>设计规范 · Cherry Studio v3</h1>
<div class="sub">由 Agent 自动整理 · 来源：当前生效的 design tokens</div>
<section><h2>主色板</h2><div class="palette"><div class="swatch s1">#0D0D0D</div><div class="swatch s2">#2A2A2A</div><div class="swatch s3">#7A7A7A</div><div class="swatch s4">#EAEAEA</div></div></section>
<section><h2>字号阶梯</h2><div class="type"><b>Display</b><span>22 / 26 · -0.01em</span><b>Title</b><span>16 / 22 · -0.005em</span><b>Body</b><span>13 / 18</span><b>Caption</b><span>11 / 14 · #7A7A7A</span></div></section>
<section><h2>间距阶梯 (px)</h2><div class="spacing"><div style="width:4px;height:20px">4</div><div style="width:8px;height:32px">8</div><div style="width:12px;height:44px">12</div><div style="width:16px;height:56px">16</div><div style="width:24px;height:80px">24</div><div style="width:32px;height:104px">32</div></div></section>
</body></html>`,
  },
};

export const dialogQuickActions = [
  { id: 'chat', label: '创建新对话', icon: MessageCircle, shortcut: '⌘T' },
  { id: 'note', label: '创建笔记', icon: NotebookPen, shortcut: '⌘N' },
  { id: 'knowledge', label: '添加知识库', icon: BookOpen, shortcut: '⌘M' },
];

// ===========================
// Search Dialog data (static UI config)
// ===========================
export const searchFilterTabs = ['对话', '助手', '页面', '文件', '文档', '消息'];

export const searchRecentItems = [
  { label: '查询新加坡美食', desc: '与默认助手的对话', icon: MessageCircle, time: '2 小时前', count: 1 },
  { label: '咨询理财建议', desc: '与理财顾问的对话', icon: MessageCircle, time: '3 小时前', count: 3 },
  { label: '制定每周新媒体运营计划', desc: '与运营助手的对话', icon: Sparkles, time: '5 小时前', count: 6 },
  { label: '代码审查最佳实践', desc: '与编程助手的对话', icon: Code2, time: '昨天', count: 8 },
];

export const searchFileItems = [
  { label: 'API 文档 v2.1', desc: '技术规范', meta: '2.4 MB · 2 小时前修改', icon: FileText },
  { label: '机器学习模型指南', desc: '教程', meta: '1.8 MB · 1 天前修改', icon: BookOpen },
  { label: '用户调研结果', desc: '研究', meta: '1.8 MB · 2 小时前修改', icon: FileText },
  { label: '产品路线图 Q4 2025', desc: '规划', meta: '5.2 MB · 1 周前修改', icon: FileText },
];

export const searchQuickActions = [
  { label: '创建新对话', shortcut: '⌘T', icon: MessageCircle },
  { label: '创建笔记', shortcut: '⌘N', icon: NotebookPen },
  { label: '添加知识库', shortcut: '⌘M', icon: BookOpen },
];

// ===========================
// Library — Resource Type UI Config (static)
// ===========================

export const RESOURCE_TYPE_CONFIG: Record<ResourceType, ResourceTypeUIConfig> = {
  agent:     { label: '智能体', icon: Bot,              color: 'text-violet-500 bg-violet-500/10' },
  assistant: { label: '助手',   icon: MessageCircle,     color: 'text-sky-500 bg-sky-500/10' },
  skill:     { label: '技能',   icon: Zap,               color: 'text-warning bg-warning-muted' },
  plugin:    { label: '插件',   icon: Puzzle,            color: 'text-info bg-info-muted' },
  prompt:    { label: 'Prompt', icon: MessageSquareText, color: 'text-accent-orange bg-accent-orange/10' },
};

export const RESOURCE_TYPES_LIST: { id: ResourceType; label: string; icon: typeof Bot }[] = [
  { id: 'skill',     label: 'Skill',  icon: Zap },
  { id: 'prompt',    label: 'Prompt', icon: MessageSquareText },
  { id: 'assistant', label: '助手',   icon: MessageCircle },
  { id: 'agent',     label: 'Agent',  icon: Bot },
];

export const SORT_LABELS: Record<string, string> = {
  updatedAt: '最近修改',
  createdAt: '创建时间',
  name:      '名称排序',
};

// ===========================
// Library — Tag Color Palette (static)
// ===========================

// Selected-tag chip palette — kept intentionally pale: a colored dot
// carries the identity, the chip body uses muted text on a faint tint
// so multi-tag combinations don't visually shout. Dot colors stay
// saturated for filter pills (list-view) where one-color-per-row is
// the only signal users have.
export const TAG_COLORS: Record<string, { dot: string; badge: string }> = {
  '生产力': { dot: 'bg-accent-violet',   badge: 'bg-accent-violet-muted text-muted-foreground border-accent-violet/15' },
  '写作':   { dot: 'bg-accent-emerald',  badge: 'bg-accent-emerald-muted text-muted-foreground border-accent-emerald/15' },
  '编程':   { dot: 'bg-accent-blue',     badge: 'bg-accent-blue-muted text-muted-foreground border-accent-blue/15' },
  '翻译':   { dot: 'bg-accent-amber',    badge: 'bg-accent-amber-muted text-muted-foreground border-accent-amber/15' },
  '分析':   { dot: 'bg-destructive',     badge: 'bg-destructive/10 text-muted-foreground border-destructive/15' },
  '创意':   { dot: 'bg-accent-pink',     badge: 'bg-accent-pink-muted text-muted-foreground border-accent-pink/15' },
  '对话':   { dot: 'bg-accent-cyan',     badge: 'bg-accent-cyan-muted text-muted-foreground border-accent-cyan/15' },
  '通用':   { dot: 'bg-muted-foreground/40', badge: 'bg-muted text-muted-foreground border-border/30' },
};
export const DEFAULT_TAG_COLOR = { dot: 'bg-muted-foreground/40', badge: 'bg-muted text-muted-foreground border-border/30' };

// ===========================
// Config — Avatar Options (static)
// ===========================

export const AVATAR_OPTIONS = [
  // Smileys & people
  '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😋','😛','😜',
  '🤪','😎','🤓','🧐','🤔','🤨','😐','😶','😏','😬','🙄','😴','🤤','😪','🥱','😷','🤒','🤕','🤧','😵',
  '🥳','🥺','🤡','🥸','🤖','👻','👽','😺','🧠','🧑‍💻','🧑‍🎨','🧑‍🏫','🧑‍🔬','🧑‍🚀','👶','🧒','👨','👩','🧓','👴',
  // Animals & nature
  '🦊','🐱','🐶','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🦉','🐺','🐗','🦄','🐝','🐛','🦋',
  '🐢','🐍','🦖','🐳','🐬','🐠','🐙','🪸','🌸','🌹','🌻','🌼','🌷','🌱','🌲','🌳','🌵','🍀','🍁','🍂',
  // Food & drink
  '🍎','🍊','🍋','🍓','🍒','🍑','🥭','🍍','🥥','🥝','🍇','🍉','🌽','🥕','🍞','🧀','🍔','🍟','🍕','🌮',
  '🍣','🍩','🍪','🍫','🍰','🎂','🍮','🍯','☕','🍵','🍺','🍷','🥂','🥃','🧋','🍿','🍱','🍙','🥡','🍳',
  // Activities & travel
  '⚽','🏀','🏈','⚾','🎾','🏐','🏉','🎱','🏓','🏸','🥊','🥋','🎯','🎮','🎲','🎳','🎼','🎵','🎤','🎧',
  '🎷','🎸','🎹','🎺','🎻','🚀','🛸','✈️','🚁','🚂','🚗','🚕','🚌','🚓','🚒','⛵','🚢','🛺','🛴','🚲',
  // Symbols & objects
  '✨','⭐','🌟','💫','🌈','🔥','💧','🌊','❄️','☀️','🌙','⚡','💎','🎁','🎈','🎉','🎊','🏆','🥇','💡',
  '🔮','📚','📖','📝','✏️','📌','📍','📎','🔍','🔬','🧪','💼','📅','📊','📈','📉','💰','💳','📦','🧭',
  // Tech & tools
  '💻','🖥️','⌨️','📱','📲','🔋','🔌','💾','📷','📹','🎥','📺','🎙️','🧰','🛠️','🔧','🔨','⚙️','🧲','🔩',
];

// ===========================
// Config — Tool Risk Colors/Labels (static)
// ===========================

export const TOOL_RISK_COLORS: Record<string, string> = {
  low:    'text-foreground/50 bg-foreground/[0.06]',
  medium: 'text-warning bg-warning-muted',
  high:   'text-destructive bg-destructive/10',
};

export const TOOL_RISK_LABELS: Record<string, string> = {
  low:    '低风险',
  medium: '中风险',
  high:   '高风险',
};

// ===========================
// Config — Agent Permission Modes (static)
// ===========================

export const PERMISSION_MODES: Record<PermissionMode, PermissionModeInfo> = {
  standard: {
    label: '标准模式',
    desc:  '每次工具调用都需要用户确认，最安全的执行方式',
    icon:  Shield,
    level: '低风险',
    color: 'text-foreground/50 bg-foreground/[0.06] border-foreground/[0.1]',
  },
  planning: {
    label: '规划模式',
    desc:  '自动生成执行计划并展示，用户确认后批量执行',
    icon:  ShieldCheck,
    level: '中低风险',
    color: 'text-info bg-info-muted border-info/20',
  },
  'auto-edit': {
    label: '自动编辑',
    desc:  '文件编辑类操作自动执行，其他操作仍需确认',
    icon:  ShieldAlert,
    level: '中风险',
    color: 'text-warning bg-warning-muted border-warning/20',
  },
  autonomous: {
    label: '完全自主',
    desc:  '所有工具调用自动执行，无需任何确认。仅建议在受控环境使用',
    icon:  Zap,
    level: '高风险',
    color: 'text-destructive bg-destructive/10 border-destructive/20',
  },
};

// ===========================
// Backward-compatible re-exports from mock data
// ===========================
// These re-exports ensure existing component imports continue to work.
// During backend integration, replace these with real API calls.

export {
  MOCK_FOLDERS,
  MOCK_RESOURCES,
  MOCK_KNOWLEDGE_BASES,
  MOCK_BUILTIN_TOOLS,
  MOCK_CUSTOM_SCRIPTS,
  MOCK_MCP_SERVERS,
  MOCK_INSTALLED_PLUGINS,
  MODEL_PROVIDERS,
  PROVIDER_MODELS,
} from '../mock/constants.mock';