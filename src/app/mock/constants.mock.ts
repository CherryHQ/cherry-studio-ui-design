// ===========================
// Mock Data — extracted from config/constants.ts
// ===========================
// These data sets should be replaced by real API calls during backend integration.
// Kept here for UI development and testing purposes.

import type {
  ResourceItem,
  FolderNode,
  KnowledgeBase,
  BuiltinTool, CustomScript, MCPServer, InstalledPlugin,
} from '../types';
import {
  Terminal, FileEdit, Globe, Code2,
} from 'lucide-react';

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
  { id: rid(), name: 'DALL-E 绘图',     type: 'plugin',    description: '调用 DALL-E 3 模型生成高质量图片',                   avatar: '🎭', version: '1.3.0', tags: ['创意'],    createdAt: '2026-02-09T10:00:00Z', updatedAt: '2026-02-19T10:00:00Z', enabled: false, fileName: 'dalle-draw.zip', fileSize: '89 KB', fileType: 'zip', author: 'community' },
  { id: rid(), name: '知识库检索',       type: 'plugin',    description: '连接本地知识库进行语义检索',                         avatar: '📚', version: '2.0.0', tags: ['分析', '生产力'], createdAt: '2026-02-07T10:00:00Z', updatedAt: '2026-02-17T10:00:00Z', enabled: true, hasUpdate: true, fileName: 'kb-retrieval.zip', fileSize: '210 KB', fileType: 'zip', author: 'CherryStudio', homepage: 'https://github.com/example/kb-retrieval' },
];

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
  { id: 'p-3', name: 'DALL-E 绘图',     version: '1.3.0', icon: '🎭', enabled: false, description: 'AI 图像生成' },
  { id: 'p-4', name: '知识库检索',       version: '2.0.0', icon: '📚', enabled: true,  description: '语义文档检索' },
  { id: 'p-5', name: 'Wolfram Alpha',    version: '1.0.1', icon: '🔢', enabled: false, description: '数学和科学计算' },
];

// ===========================
// Config — Model Providers (Mock)
// ===========================

export const MODEL_PROVIDERS = ['OpenAI', 'Anthropic', 'Google', 'Deepseek', 'Qwen'] as const;

export const PROVIDER_MODELS: Record<string, string[]> = {
  OpenAI:    ['GPT-4o', 'GPT-4o-mini', 'GPT-4-turbo', 'o1-preview', 'o1-mini'],
  Anthropic: ['Claude 3.5 Sonnet', 'Claude 3.5 Haiku', 'Claude 3 Opus'],
  Google:    ['Gemini 2.0 Flash', 'Gemini 1.5 Pro'],
  Deepseek:  ['Deepseek V3', 'Deepseek R1'],
  Qwen:      ['Qwen 2.5 Max', 'Qwen 2.5 Plus'],
};
