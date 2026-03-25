import {
  MessageCircle, Bot, Palette, Languages, Compass,
  Library, BookOpen, FileText, Code2, Puzzle, NotebookPen,
  Sparkles, MousePointerClick,
  Zap,
  Terminal, FileEdit, Globe,
  Shield, ShieldCheck, ShieldAlert,
} from 'lucide-react';
import type {
  MenuItem, SidebarLayout,
  ResourceItem, ResourceType, ResourceTypeUIConfig,
  FolderNode,
  KnowledgeBase,
  BuiltinTool, CustomScript, MCPServer, InstalledPlugin,
  PermissionMode, PermissionModeInfo,
} from '../types';

export const menuItems: MenuItem[] = [
  { id: 'chat', label: '聊天', icon: MessageCircle },
  { id: 'agent', label: '工作', icon: MousePointerClick },
  { id: 'painting', label: '创作', icon: Palette },
  { id: 'translate', label: '翻译', icon: Languages },
  { id: 'explore', label: '探索', icon: Compass },
  { id: 'library', label: '资源', icon: Library },
  { id: 'knowledge', label: '知识库', icon: BookOpen },
  { id: 'file', label: '文件', icon: FileText },
  { id: 'code', label: '编码', icon: Code2 },
  { id: 'miniapp', label: '小程序', icon: Puzzle },
  { id: 'note', label: '笔记', icon: NotebookPen },
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
// New Tab Dialog data
// ===========================
export const dialogAppIcons: { id: string; label: string; icon: typeof MessageCircle; color: string; bg: string }[] = [
  { id: 'chat', label: '聊天', icon: MessageCircle, color: 'text-foreground/50', bg: 'bg-foreground/[0.1]' },
  { id: 'agent', label: '工作', icon: MousePointerClick, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  { id: 'painting', label: '绘画', icon: Palette, color: 'text-rose-400', bg: 'bg-rose-500/20' },
  { id: 'translate', label: '翻译', icon: Languages, color: 'text-violet-400', bg: 'bg-violet-500/20' },
  { id: 'knowledge', label: '知识库', icon: BookOpen, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  { id: 'library', label: '资源', icon: Library, color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
  { id: 'note', label: '笔记', icon: NotebookPen, color: 'text-teal-400', bg: 'bg-teal-500/20' },
  { id: 'code', label: 'Code', icon: Code2, color: 'text-slate-400', bg: 'bg-slate-500/20' },
  { id: 'explore', label: '探索', icon: Compass, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  { id: 'file', label: '文件', icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  { id: 'miniapp', label: '小程序', icon: Puzzle, color: 'text-purple-400', bg: 'bg-purple-500/20' },
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
// Search Dialog data
// ===========================
export const searchFilterTabs = ['全部', '对话', '任务', '页面', '文件', '文档', '消息'];

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
// Library — Resource Type UI Config
// ===========================

export const RESOURCE_TYPE_CONFIG: Record<ResourceType, ResourceTypeUIConfig> = {
  agent:     { label: '智能体', icon: Bot,            color: 'text-violet-500 bg-violet-500/10' },
  assistant: { label: '助手',   icon: MessageCircle,   color: 'text-sky-500 bg-sky-500/10' },
  skill:     { label: '技能',   icon: Zap,             color: 'text-amber-500 bg-amber-500/10' },
  plugin:    { label: '插件',   icon: Puzzle,          color: 'text-blue-500 bg-blue-500/10' },
};

export const RESOURCE_TYPES_LIST: { id: ResourceType; label: string; icon: typeof Bot }[] = [
  { id: 'agent',     label: '智能体', icon: Bot },
  { id: 'assistant', label: '助手',   icon: MessageCircle },
  { id: 'skill',     label: '技能',   icon: Zap },
  { id: 'plugin',    label: '插件',   icon: Puzzle },
];

export const SORT_LABELS: Record<string, string> = {
  updatedAt: '最近修改',
  createdAt: '创建时间',
  name:      '名称排序',
};

// ===========================
// Library — Tag Color Palette
// ===========================

export const TAG_COLORS: Record<string, string> = {
  '生产力': '#8b5cf6',
  '写作':   '#10b981',
  '编程':   '#3b82f6',
  '翻译':   '#f59e0b',
  '分析':   '#ef4444',
  '创意':   '#ec4899',
  '对话':   '#06b6d4',
  '通用':   '#6b7280',
};
export const DEFAULT_TAG_COLOR = '#6b7280';

// ===========================
// Library — Mock Folders
// ===========================

export const MOCK_FOLDERS: FolderNode[] = [
  {
    id: 'f-1', name: '工作助手', children: [
      { id: 'f-1-1', name: '数据分析', children: [] },
      { id: 'f-1-2', name: '报告生成', children: [] },
    ],
  },
  {
    id: 'f-2', name: '开发工具', children: [
      { id: 'f-2-1', name: '代审查', children: [] },
    ],
  },
  { id: 'f-3', name: '个人项目', children: [] },
];

// ===========================
// Library — Mock Resources
// ===========================

let _resId = 0;
const rid = () => `res-${++_resId}`;

export const MOCK_RESOURCES: ResourceItem[] = [
  // Agents
  { id: rid(), name: '全栈开发 Agent',   type: 'agent',     description: '具备代码审查、测试生成、部署能力的全栈开发助理',       avatar: '🤖', model: 'GPT-4o',      tags: ['编程', '生产力'], folderId: 'f-2',   createdAt: '2026-02-20T10:00:00Z', updatedAt: '2026-02-25T08:30:00Z', enabled: true },
  { id: rid(), name: '数据分析 Agent',   type: 'agent',     description: '自动化数据清洗、可视化分析和报告生成',               avatar: '📊', model: 'Claude 3.5',  tags: ['分析', '生产力'], folderId: 'f-1-1', createdAt: '2026-02-18T14:00:00Z', updatedAt: '2026-02-24T16:00:00Z', enabled: true },
  { id: rid(), name: '自动化测试 Agent', type: 'agent',     description: '自动编写单元测试和集成测试用例',                     avatar: '🧪', model: 'GPT-4o',      tags: ['编程'],           folderId: 'f-2-1', createdAt: '2026-02-15T09:00:00Z', updatedAt: '2026-02-23T11:00:00Z', enabled: true },
  // Assistants
  { id: rid(), name: '默认助手',         type: 'assistant', description: 'Cherry Studio 内置通用对话助手，支持多模型切换',       avatar: '💬', model: 'Gemini 3 Pro', tags: ['对话', '通用'], folderId: 'f-1',   createdAt: '2026-02-10T08:00:00Z', updatedAt: '2026-02-25T10:00:00Z', enabled: true },
  { id: rid(), name: '写作助手',         type: 'assistant', description: '擅长各类文档写作、润色和翻译的智能助手',             avatar: '✍️', model: 'GPT-4o',      tags: ['写作', '生产力'], folderId: 'f-1',   createdAt: '2026-02-22T08:00:00Z', updatedAt: '2026-02-25T09:00:00Z', enabled: true },
  { id: rid(), name: '英语教学助手',     type: 'assistant', description: '专业英语教学，支持口语练习和语法纠正',               avatar: '🎓', model: 'Claude 3.5',  tags: ['翻译'],                              createdAt: '2026-02-19T10:00:00Z', updatedAt: '2026-02-24T14:00:00Z', enabled: true },
  { id: rid(), name: '代码解读助手',     type: 'assistant', description: '阅读和解释复杂代码逻辑，生成文档注释',               avatar: '💻', model: 'Deepseek V3', tags: ['编程'],           folderId: 'f-2',   createdAt: '2026-02-17T11:00:00Z', updatedAt: '2026-02-23T15:00:00Z', enabled: true },
  { id: rid(), name: '创意写作助手',     type: 'assistant', description: '故事构思、角色设定、情节发展的创作伙伴',               avatar: '🎨', model: 'GPT-4o',      tags: ['写作', '创意'],                      createdAt: '2026-02-16T09:00:00Z', updatedAt: '2026-02-22T10:00:00Z', enabled: true },
  { id: rid(), name: '周报生成助手',     type: 'assistant', description: '根据日志自动生成结构化周报',                         avatar: '📝', model: 'Claude 3.5',  tags: ['写作', '生产力'], folderId: 'f-1-2', createdAt: '2026-02-14T08:00:00Z', updatedAt: '2026-02-21T09:00:00Z', enabled: true },
  // Skills
  { id: rid(), name: '网页摘要',         type: 'skill',     description: '自动提取网页核心内容并生成结构化摘要',               avatar: '📄', version: '1.2.0', tags: ['生产力'],  createdAt: '2026-02-10T10:00:00Z', updatedAt: '2026-02-20T10:00:00Z', enabled: true, fileName: 'web-summary.md', fileSize: '4.2 KB', fileType: 'md', author: 'CherryStudio' },
  { id: rid(), name: '图片描述',         type: 'skill',     description: '生成图片的详细文字描述和 Alt 文本',                  avatar: '🖼️', version: '2.0.1', tags: ['创意'],    createdAt: '2026-02-08T10:00:00Z', updatedAt: '2026-02-18T10:00:00Z', enabled: false, hasUpdate: true, fileName: 'image-describe.json', fileSize: '12.8 KB', fileType: 'json', author: 'community' },
  { id: rid(), name: 'JSON 格式化',     type: 'skill',     description: '格式化、校验和转换 JSON 数据',                       avatar: '🔧', version: '1.0.3', tags: ['编程'],    createdAt: '2026-02-05T10:00:00Z', updatedAt: '2026-02-15T10:00:00Z', enabled: true, fileName: 'json-formatter.md', fileSize: '2.1 KB', fileType: 'md', author: 'CherryStudio' },
  // Plugins
  { id: rid(), name: 'Web Search',       type: 'plugin',    description: '基于 Bing/Google 的实时联网搜索插件',                avatar: '🌐', version: '3.1.0', tags: ['生产力'],  createdAt: '2026-02-12T10:00:00Z', updatedAt: '2026-02-22T10:00:00Z', enabled: true, fileName: 'web-search.zip', fileSize: '156 KB', fileType: 'zip', author: 'CherryStudio', homepage: 'https://github.com/example/web-search' },
  { id: rid(), name: 'Code Interpreter', type: 'plugin',    description: '安全沙箱中执行 Python 代码并返回结果',               avatar: '⚡', version: '2.4.2', tags: ['编程'],    createdAt: '2026-02-11T10:00:00Z', updatedAt: '2026-02-21T10:00:00Z', enabled: true, fileName: 'code-interpreter.zip', fileSize: '2.3 MB', fileType: 'zip', author: 'CherryStudio', homepage: 'https://github.com/example/code-interpreter' },
  { id: rid(), name: 'DALL·E 绘图',     type: 'plugin',    description: '调用 DALL·E 3 模型生成高质量图片',                   avatar: '🎭', version: '1.3.0', tags: ['创意'],    createdAt: '2026-02-09T10:00:00Z', updatedAt: '2026-02-19T10:00:00Z', enabled: false, fileName: 'dalle-draw.zip', fileSize: '89 KB', fileType: 'zip', author: 'community' },
  { id: rid(), name: '知识库检索',       type: 'plugin',    description: '连接本地知识库进行语义检索',                         avatar: '📚', version: '2.0.0', tags: ['分析', '生产力'], createdAt: '2026-02-07T10:00:00Z', updatedAt: '2026-02-17T10:00:00Z', enabled: true, hasUpdate: true, fileName: 'kb-retrieval.zip', fileSize: '210 KB', fileType: 'zip', author: 'CherryStudio', homepage: 'https://github.com/example/kb-retrieval' },
];

// ===========================
// Config — Avatar Options
// ===========================

export const AVATAR_OPTIONS = ['🤖', '💬', '✍️', '🎓', '💻', '🎨', '📝', '🧠', '🔮', '⚡', '🎭', '📊'];

// ===========================
// Config — Model Providers
// ===========================

export const MODEL_PROVIDERS = ['OpenAI', 'Anthropic', 'Google', 'Deepseek', 'Qwen'] as const;

export const PROVIDER_MODELS: Record<string, string[]> = {
  OpenAI:    ['GPT-4o', 'GPT-4o-mini', 'GPT-4-turbo', 'o1-preview', 'o1-mini'],
  Anthropic: ['Claude 3.5 Sonnet', 'Claude 3.5 Haiku', 'Claude 3 Opus'],
  Google:    ['Gemini 2.0 Flash', 'Gemini 1.5 Pro'],
  Deepseek:  ['Deepseek V3', 'Deepseek R1'],
  Qwen:      ['Qwen 2.5 Max', 'Qwen 2.5 Plus'],
};

// ===========================
// Config — Knowledge Bases
// ===========================

export const MOCK_KNOWLEDGE_BASES: KnowledgeBase[] = [
  { id: 'kb-1', name: '产品文档库',   docCount: 128,  size: '45 MB',  icon: '📘' },
  { id: 'kb-2', name: 'API 参考文档', docCount: 256,  size: '120 MB', icon: '📗' },
  { id: 'kb-3', name: '用户反馈集',   docCount: 1024, size: '32 MB',  icon: '📙' },
  { id: 'kb-4', name: '内部Wiki',     docCount: 512,  size: '88 MB',  icon: '📕' },
  { id: 'kb-5', name: '技术博客合集', docCount: 89,   size: '15 MB',  icon: '📓' },
];

// ===========================
// Config — Agent Builtin Tools
// ===========================

export const MOCK_BUILTIN_TOOLS: BuiltinTool[] = [
  { id: 'bash',      name: 'Bash 执行', desc: '安全沙中执行 Shell 命令',             icon: Terminal, enabled: true,  risk: 'high' },
  { id: 'file-edit', name: '文件编辑',  desc: '读取、创建和修改文件内容',                 icon: FileEdit, enabled: true,  risk: 'medium' },
  { id: 'browser',   name: '浏览器',    desc: '访问网页、截图和提取内容',                 icon: Globe,    enabled: false, risk: 'medium' },
  { id: 'code-exec', name: '代码执行',  desc: '在隔离环境中运行 Python/Node.js 代码',    icon: Code2,    enabled: true,  risk: 'high' },
];

export const MOCK_CUSTOM_SCRIPTS: CustomScript[] = [
  { id: 'cs1', name: 'deploy.sh',  language: 'Bash',   size: '2.4 KB' },
  { id: 'cs2', name: 'analyze.py', language: 'Python', size: '8.1 KB' },
];

export const TOOL_RISK_COLORS: Record<string, string> = {
  low:    'text-foreground/50 bg-foreground/[0.06]',
  medium: 'text-amber-500 bg-amber-500/10',
  high:   'text-red-500 bg-red-500/10',
};

export const TOOL_RISK_LABELS: Record<string, string> = {
  low:    '低风险',
  medium: '中风险',
  high:   '高风险',
};

// ===========================
// Config — Agent MCP & Plugins
// ===========================

export const MOCK_MCP_SERVERS: MCPServer[] = [
  { id: 'mcp-1', name: 'Local Development', url: 'http://localhost:3100',   status: 'connected',    toolCount: 12 },
  { id: 'mcp-2', name: 'Production API',    url: 'https://mcp.example.com', status: 'disconnected', toolCount: 8 },
  { id: 'mcp-3', name: 'Database Tools',    url: 'http://localhost:3200',   status: 'error',        toolCount: 5 },
];

export const MOCK_INSTALLED_PLUGINS: InstalledPlugin[] = [
  { id: 'p-1', name: 'Web Search',       version: '3.1.0', icon: '🌐', enabled: true,  description: '联网搜索能力' },
  { id: 'p-2', name: 'Code Interpreter', version: '2.4.2', icon: '⚡', enabled: true,  description: '代码沙箱执行' },
  { id: 'p-3', name: 'DALL·E 绘图',     version: '1.3.0', icon: '🎭', enabled: false, description: 'AI 图像生成' },
  { id: 'p-4', name: '知识库检索',       version: '2.0.0', icon: '📚', enabled: true,  description: '语义文档检索' },
  { id: 'p-5', name: 'Wolfram Alpha',    version: '1.0.1', icon: '🔢', enabled: false, description: '数学和科学计算' },
];

// ===========================
// Config — Agent Permission Modes
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
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  },
  'auto-edit': {
    label: '自动编辑',
    desc:  '文件编辑类操作自动执行，其他操作仍需确认',
    icon:  ShieldAlert,
    level: '中风险',
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  },
  autonomous: {
    label: '完全自主',
    desc:  '所有工具调用自动执行，无需任何确认。仅建议在受控环境使用',
    icon:  Zap,
    level: '高风险',
    color: 'text-red-500 bg-red-500/10 border-red-500/20',
  },
};
