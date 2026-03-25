import {
  Eye, Brain, Hammer, Globe,
} from 'lucide-react';

// ===========================
// Agent Capability Types & Config
// ===========================

export type AgentCapTab = 'tools' | 'mcp' | 'skills';

export type AgentBuiltinTool = {
  id: string;
  name: string;
  desc: string;
  category: string;
  enabled: boolean;
};

export type AgentMcpService = {
  id: string;
  name: string;
  desc: string;
  author: string;
  status: 'connected' | 'disconnected';
};

export type AgentSkillItem = {
  id: string;
  name: string;
  desc: string;
  enabled: boolean;
};

import type { ModelCapability } from '@/types/chat';

// Backward-compatible alias
export type AgentModelCapability = ModelCapability;

// ===========================
// Provider Colors
// ===========================

export const AGENT_PROVIDER_COLORS: Record<string, string> = {
  Anthropic: 'bg-orange-500',
  Google: 'bg-blue-500',
  OpenAI: 'bg-emerald-600',
  Alibaba: 'bg-violet-500',
  DeepSeek: 'bg-cyan-500',
};

export const AGENT_CAP_ICONS: Record<AgentModelCapability, { icon: typeof Eye; color: string }> = {
  vision: { icon: Eye, color: 'text-sky-500' },
  tools: { icon: Hammer, color: 'text-amber-500' },
  reasoning: { icon: Brain, color: 'text-violet-500' },
  web: { icon: Globe, color: 'text-blue-500' },
};

export const AGENT_CAP_TAG_ICONS: Record<AgentModelCapability, typeof Eye> = {
  vision: Eye,
  reasoning: Brain,
  tools: Hammer,
  web: Globe,
};

export const ALL_AGENT_CAPABILITIES: AgentModelCapability[] = ['vision', 'reasoning', 'tools', 'web'];

// ===========================
// Run Mode Labels
// ===========================

export const RUN_MODE_LABELS: Record<string, { label: string; color: string }> = {
  plan: { label: '规划模式', color: 'text-violet-500' },
  auto: { label: '自动模式', color: 'text-sky-500' },
  manual: { label: '手动模式', color: 'text-amber-500' },
};

// ===========================
// Capability Tab Config
// ===========================

export const CAP_TAB_CONFIG: { key: AgentCapTab; label: string }[] = [
  { key: 'tools', label: '内置工具' },
  { key: 'mcp', label: 'MCP' },
  { key: 'skills', label: 'Skills' },
];

// ===========================
// Builtin Tool Catalogs
// ===========================

export const BUILTIN_TOOLS_CATALOG: AgentBuiltinTool[] = [
  { id: 'bt-1', name: 'Shell 终端', desc: '执行 Bash/Zsh 命令', category: '执行环境', enabled: true },
  { id: 'bt-2', name: '代码执行', desc: 'Python/Node.js 沙箱', category: '执行环境', enabled: true },
  { id: 'bt-3', name: '隔离沙箱', desc: '安全隔离执行环境', category: '计算资源', enabled: false },
  { id: 'bt-4', name: '文件编辑', desc: '读写文件内容', category: '文件操作', enabled: true },
  { id: 'bt-5', name: '文件检索', desc: '全局搜索文件', category: '文件操作', enabled: true },
  { id: 'bt-6', name: '目录管理', desc: '创建/移动/删除目录', category: '文件操作', enabled: false },
  { id: 'bt-7', name: 'JSON 处理', desc: '解析和转换 JSON', category: '文件操作', enabled: false },
  { id: 'bt-8', name: '文件下载', desc: '下载远程文件', category: '文件操作', enabled: false },
  { id: 'bt-9', name: '浏览器', desc: '网页浏览和截图', category: '网络与数据', enabled: true },
  { id: 'bt-10', name: 'HTTP 请求', desc: 'REST API 调用', category: '网络与数据', enabled: true },
  { id: 'bt-11', name: '数据库', desc: 'SQL/NoSQL 查询', category: '网络与数据', enabled: false },
  { id: 'bt-12', name: '联网搜索', desc: '实时搜索引擎', category: '网络与数据', enabled: true },
  { id: 'bt-13', name: '邮件发送', desc: 'SMTP 邮件投递', category: '网络与数据', enabled: false },
  { id: 'bt-14', name: 'Git 操作', desc: '版本控制管理', category: '开发工具', enabled: true },
  { id: 'bt-15', name: 'Docker 管理', desc: '容器生命周期', category: '开发工具', enabled: false },
  { id: 'bt-16', name: '单元测试', desc: '运行测试套件', category: '开发工具', enabled: false },
  { id: 'bt-17', name: 'API 调试', desc: '接口测试工具', category: '开发工具', enabled: false },
  { id: 'bt-18', name: '浏览器预览', desc: '实时预览网页', category: '开发工具', enabled: true },
];

export const MCP_CATALOG: AgentMcpService[] = [
  { id: 'mc-1', name: 'GitHub', desc: '代码仓库与 PR 管理', author: 'github', status: 'connected' },
  { id: 'mc-2', name: 'Filesystem', desc: '本地文件系统访问', author: 'modelcontextprotocol', status: 'connected' },
  { id: 'mc-3', name: 'Docker', desc: '容器管理与部署', author: 'docker', status: 'disconnected' },
  { id: 'mc-4', name: 'PostgreSQL', desc: '关系型数据库操作', author: 'postgresql', status: 'connected' },
  { id: 'mc-5', name: 'Redis', desc: '缓存与消息队列', author: 'redis', status: 'disconnected' },
  { id: 'mc-6', name: 'Tavily Search', desc: 'AI 搜索引擎', author: 'tavily', status: 'connected' },
  { id: 'mc-7', name: 'Notion', desc: '知识库与文档协作', author: 'notion', status: 'disconnected' },
  { id: 'mc-8', name: 'Slack', desc: '团队消息通知', author: 'slack', status: 'disconnected' },
  { id: 'mc-9', name: 'Linear', desc: '项目管理工具', author: 'linear', status: 'disconnected' },
  { id: 'mc-10', name: 'Jupyter', desc: 'Notebook 执行环境', author: 'jupyter', status: 'connected' },
  { id: 'mc-11', name: 'Kubernetes', desc: 'K8s 集群管理', author: 'kubernetes', status: 'disconnected' },
  { id: 'mc-12', name: 'Supabase', desc: 'BaaS 数据库服务', author: 'supabase', status: 'disconnected' },
];

export const SKILLS_CATALOG: AgentSkillItem[] = [
  { id: 'sk-1', name: '代码生成', desc: '根据需求生成高质量代码', enabled: true },
  { id: 'sk-2', name: '代码审查', desc: '自动审查代码质量与安全', enabled: false },
  { id: 'sk-3', name: '文档生成', desc: '自动生成项目文档', enabled: true },
  { id: 'sk-4', name: '数据分析', desc: '统计分析与数据洞察', enabled: false },
  { id: 'sk-5', name: '网页搜索', desc: '实时搜索互联网信息', enabled: true },
  { id: 'sk-6', name: '图表生成', desc: '可视化数据图表', enabled: true },
  { id: 'sk-7', name: '数据清洗', desc: '数据预处理与转换', enabled: false },
  { id: 'sk-8', name: 'API 测试', desc: '接口自动化测试', enabled: false },
  { id: 'sk-9', name: 'SQL 查询', desc: '数据库查询与优化', enabled: true },
  { id: 'sk-10', name: '翻译', desc: '多语言文本翻译', enabled: false },
  { id: 'sk-11', name: '摘要提取', desc: '长文本智能摘要', enabled: false },
  { id: 'sk-12', name: '图片识别', desc: '图像内容分析', enabled: false },
];

export const BUILTIN_TOOL_CATEGORIES = ['执行环境', '计算资源', '文件操作', '网络与数据', '开发工具'];

// ===========================
// Available Agents
// ===========================

export const AGENT_TAGS = ['编程', '分析', '全栈', '后端', '运维', '部署', '调研', '数据'];

export interface AvailableAgent {
  id: string;
  name: string;
  avatar: string;
  desc: string;
  tags: string[];
  model: string;
  systemPrompt: string;
  runMode: 'plan' | 'auto' | 'manual';
  maxRounds: number;
  builtinTools: AgentBuiltinTool[];
  mcpServices: AgentMcpService[];
  skills: AgentSkillItem[];
  workDir: string;
  autoApprove: boolean;
  updatedAt: string;
  createdAt: string;
}

export const AVAILABLE_AGENTS: AvailableAgent[] = [
  {
    id: 'a-1', name: '全栈工程师', avatar: '🤖', desc: '全栈开发助理，擅长前后端一体化项目搭建与交付', tags: ['编程', '全栈'],
    model: 'Claude 4 Sonnet',
    systemPrompt: '你是一名经验丰富的全栈工程师。你的核心能力包括：\\n1. 使用 React/Vue/Next.js 等现代框架构建前端应用\\n2. 使用 Node.js/Python/Go 构建高性能后端服务\\n3. 数据库设计、API 设计、系统架构规划\\n4. CI/CD 流水线搭建与容器化部署\\n\\n在工作中，你应该先分析需求、制定方案，再逐步实现。每一步都需要清晰地说明你的决策理由。',
    runMode: 'plan',
    maxRounds: 25,
    builtinTools: BUILTIN_TOOLS_CATALOG.map(t => ({ ...t })),
    mcpServices: MCP_CATALOG.filter(m => ['mc-1','mc-2','mc-3'].includes(m.id)).map(m => ({ ...m })),
    skills: SKILLS_CATALOG.filter(s => ['sk-1','sk-3','sk-5','sk-6','sk-9'].includes(s.id)).map(s => ({ ...s, enabled: true })),
    workDir: '~/projects/my-app',
    autoApprove: true,
    updatedAt: '2 小时前', createdAt: '2025-12-15',
  },
  {
    id: 'a-2', name: '调研分析师', avatar: '📊', desc: '调研分析专家，擅长多维对比与报告输出', tags: ['分析', '调研'],
    model: 'GPT-4o',
    systemPrompt: '你是一名专业的调研分析师。你擅长：\\n1. 搜集和整理行业信息与技术资料\\n2. 进行多维度对比分析\\n3. 生成结构化的调研报告\\n4. 提供基于数据的决策建议',
    runMode: 'auto',
    maxRounds: 15,
    builtinTools: BUILTIN_TOOLS_CATALOG.filter(t => ['bt-9','bt-10','bt-12'].includes(t.id)).map(t => ({ ...t, enabled: true })),
    mcpServices: MCP_CATALOG.filter(m => ['mc-6'].includes(m.id)).map(m => ({ ...m })),
    skills: SKILLS_CATALOG.filter(s => ['sk-5','sk-3','sk-4'].includes(s.id)).map(s => ({ ...s, enabled: true })),
    workDir: '~/research',
    autoApprove: false,
    updatedAt: '昨天', createdAt: '2025-11-20',
  },
  {
    id: 'a-3', name: '后端工程师', avatar: '⚙️', desc: '后端工程师，专注高性能服务与数据库优化', tags: ['编程', '后端'],
    model: 'Claude 4 Sonnet',
    systemPrompt: '你是一名后端工程师，精通服务端架构与数据库设计。',
    runMode: 'plan',
    maxRounds: 30,
    builtinTools: BUILTIN_TOOLS_CATALOG.filter(t => ['bt-1','bt-2','bt-4','bt-5','bt-10','bt-11','bt-14'].includes(t.id)).map(t => ({ ...t, enabled: true })),
    mcpServices: MCP_CATALOG.filter(m => ['mc-4','mc-5'].includes(m.id)).map(m => ({ ...m })),
    skills: SKILLS_CATALOG.filter(s => ['sk-1','sk-8','sk-9'].includes(s.id)).map(s => ({ ...s, enabled: true })),
    workDir: '~/backend-service',
    autoApprove: true,
    updatedAt: '3 天前', createdAt: '2025-10-08',
  },
  {
    id: 'a-4', name: '运维工程师', avatar: '🚀', desc: '运维部署专家，擅长 Docker/K8s 与 CI/CD', tags: ['运维', '部署'],
    model: 'Gemini 2.5 Pro',
    systemPrompt: '你是一名运维工程师，精通容器化部署与自动化运维。',
    runMode: 'manual',
    maxRounds: 20,
    builtinTools: BUILTIN_TOOLS_CATALOG.filter(t => ['bt-1','bt-4','bt-5','bt-15','bt-14'].includes(t.id)).map(t => ({ ...t, enabled: true })),
    mcpServices: MCP_CATALOG.filter(m => ['mc-3','mc-11'].includes(m.id)).map(m => ({ ...m })),
    skills: SKILLS_CATALOG.filter(s => ['sk-1'].includes(s.id)).map(s => ({ ...s, enabled: true })),
    workDir: '~/infra',
    autoApprove: false,
    updatedAt: '1 周前', createdAt: '2025-09-12',
  },
  {
    id: 'a-5', name: '数据分析师', avatar: '📈', desc: '数据分析师，擅长数据清洗、可视化与洞察', tags: ['分析', '数据'],
    model: 'GPT-4o',
    systemPrompt: '你是一名数据分析师，擅长从数据中发现价值洞察。',
    runMode: 'auto',
    maxRounds: 20,
    builtinTools: BUILTIN_TOOLS_CATALOG.filter(t => ['bt-2','bt-4','bt-5','bt-9','bt-11'].includes(t.id)).map(t => ({ ...t, enabled: true })),
    mcpServices: MCP_CATALOG.filter(m => ['mc-10'].includes(m.id)).map(m => ({ ...m })),
    skills: SKILLS_CATALOG.filter(s => ['sk-4','sk-6','sk-7'].includes(s.id)).map(s => ({ ...s, enabled: true })),
    workDir: '~/data-analysis',
    autoApprove: true,
    updatedAt: '4 天前', createdAt: '2025-11-01',
  },
];
