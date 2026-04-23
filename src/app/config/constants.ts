import {
  MessageCircle, Bot, Palette, Languages, Compass,
  Library, BookOpen, FileText, Code2, Puzzle, NotebookPen,
  Sparkles, MousePointerClick, Blocks,
  Zap, Cloud,
  Shield, ShieldCheck, ShieldAlert,
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
  { id: 'painting', label: '创作', icon: Palette },
  { id: 'translate', label: '翻译', icon: Languages },
  { id: 'explore', label: '探索', icon: Compass },
  { id: 'library', label: '资源', icon: Library },
  { id: 'knowledge', label: '知识库', icon: BookOpen },
  { id: 'file', label: '文件', icon: FileText },
  { id: 'code', label: '编码', icon: Code2 },
  { id: 'miniapp', label: '小程序', icon: Puzzle },
  { id: 'note', label: '笔记', icon: NotebookPen },
  { id: 'extensions', label: '扩展', icon: Blocks },
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
  agent:     { label: '智能体', icon: Bot,            color: 'text-violet-500 bg-violet-500/10' },
  assistant: { label: '助手',   icon: MessageCircle,   color: 'text-sky-500 bg-sky-500/10' },
  skill:     { label: '技能',   icon: Zap,             color: 'text-warning bg-warning-muted' },
  plugin:    { label: '插件',   icon: Puzzle,          color: 'text-info bg-info-muted' },
};

export const RESOURCE_TYPES_LIST: { id: ResourceType; label: string; icon: typeof Bot }[] = [
  { id: 'agent',     label: '智能体', icon: Bot },
  { id: 'assistant', label: '助手',   icon: MessageCircle },
  { id: 'skill',     label: '技能',   icon: Zap },
];

export const SORT_LABELS: Record<string, string> = {
  updatedAt: '最近修改',
  createdAt: '创建时间',
  name:      '名称排序',
};

// ===========================
// Library — Tag Color Palette (static)
// ===========================

export const TAG_COLORS: Record<string, { dot: string; badge: string }> = {
  '生产力': { dot: 'bg-accent-violet',   badge: 'bg-accent-violet-muted text-accent-violet border-accent-violet/20' },
  '写作':   { dot: 'bg-accent-emerald',  badge: 'bg-accent-emerald-muted text-accent-emerald border-accent-emerald/20' },
  '编程':   { dot: 'bg-accent-blue',     badge: 'bg-accent-blue-muted text-accent-blue border-accent-blue/20' },
  '翻译':   { dot: 'bg-accent-amber',    badge: 'bg-accent-amber-muted text-accent-amber border-accent-amber/20' },
  '分析':   { dot: 'bg-destructive',     badge: 'bg-destructive/12 text-destructive border-destructive/20' },
  '创意':   { dot: 'bg-accent-pink',     badge: 'bg-accent-pink-muted text-accent-pink border-accent-pink/20' },
  '对话':   { dot: 'bg-accent-cyan',     badge: 'bg-accent-cyan-muted text-accent-cyan border-accent-cyan/20' },
  '通用':   { dot: 'bg-muted-foreground/40', badge: 'bg-muted text-muted-foreground border-border/50' },
};
export const DEFAULT_TAG_COLOR = { dot: 'bg-muted-foreground/40', badge: 'bg-muted text-muted-foreground border-border/50' };

// ===========================
// Config — Avatar Options (static)
// ===========================

export const AVATAR_OPTIONS = ['🤖', '💬', '✍️', '🎓', '💻', '🎨', '📝', '', '🔮', '⚡', '🎭', '📊'];

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