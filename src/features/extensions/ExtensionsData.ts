// ===========================
// Extensions Page — Data & Types
// ===========================

export type ExtensionCategory = 'all' | 'official' | 'community';
export type ExtensionStatus = 'installed' | 'not-installed' | 'update-available';
export type ExtensionTab = 'installed' | 'marketplace' | 'dependencies';
export type DepStatus = 'ready' | 'missing' | 'outdated' | 'installing';

export interface Extension {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  icon: string;
  category: 'official' | 'community';
  enabled: boolean;
  status: ExtensionStatus;
  size: string;
  downloads?: number;
  rating?: number;
  tags: string[];
  mcpTools?: string[];
  permissions?: string[];
  homepage?: string;
  updatedAt: string;
}

export interface RuntimeDependency {
  id: string;
  name: string;
  type: 'binary' | 'npm' | 'model';
  version: string;
  requiredBy: string[];
  status: DepStatus;
  size?: string;
  path?: string;
}

// ===========================
// Mock: Installed Extensions
// ===========================

export const installedExtensions: Extension[] = [
  {
    id: 'cherrystudio.knowledge',
    name: '知识库',
    description: 'RAG 知识库，支持文档导入、向量检索和语义搜索',
    version: '1.0.0',
    author: 'CherryHQ',
    icon: '📚',
    category: 'official',
    enabled: true,
    status: 'installed',
    size: '2.4 MB',
    tags: ['知识管理', '搜索'],
    mcpTools: ['knowledge_search', 'knowledge_add', 'knowledge_list'],
    permissions: ['file:read', 'network'],
    updatedAt: '2026-03-20',
  },
  {
    id: 'cherrystudio.painting',
    name: '绘画',
    description: 'AI 图像生成，支持 DALL-E、Midjourney、Stable Diffusion 等',
    version: '1.2.0',
    author: 'CherryHQ',
    icon: '🎨',
    category: 'official',
    enabled: true,
    status: 'installed',
    size: '1.8 MB',
    tags: ['创作', '图像'],
    mcpTools: ['image_generate', 'image_edit'],
    permissions: ['file:write:temp', 'network'],
    updatedAt: '2026-03-18',
  },
  {
    id: 'cherrystudio.translate',
    name: '翻译',
    description: '多语言翻译，支持 DeepL、Google、百度等翻译引擎',
    version: '1.1.0',
    author: 'CherryHQ',
    icon: '🌐',
    category: 'official',
    enabled: true,
    status: 'installed',
    size: '0.8 MB',
    tags: ['翻译', '效率'],
    mcpTools: ['translate_text', 'translate_detect'],
    permissions: ['network'],
    updatedAt: '2026-03-15',
  },
  {
    id: 'cherrystudio.ocr',
    name: '文字识别',
    description: '图片文字识别（OCR），支持多种引擎和语言',
    version: '1.0.2',
    author: 'CherryHQ',
    icon: '👁',
    category: 'official',
    enabled: false,
    status: 'installed',
    size: '3.2 MB',
    tags: ['识别', '工具'],
    mcpTools: ['ocr_recognize'],
    permissions: ['file:read'],
    updatedAt: '2026-03-10',
  },
  {
    id: 'cherrystudio.websearch',
    name: '联网搜索',
    description: '实时联网搜索，支持 Bing、Google、SearXNG',
    version: '2.0.0',
    author: 'CherryHQ',
    icon: '🔍',
    category: 'official',
    enabled: true,
    status: 'update-available',
    size: '0.6 MB',
    tags: ['搜索', '网络'],
    mcpTools: ['web_search', 'web_fetch'],
    permissions: ['network'],
    updatedAt: '2026-03-22',
  },
  {
    id: 'cherrystudio.notes',
    name: '笔记',
    description: 'Markdown 笔记系统，支持标签、搜索和导出',
    version: '1.0.0',
    author: 'CherryHQ',
    icon: '📝',
    category: 'official',
    enabled: true,
    status: 'installed',
    size: '1.1 MB',
    tags: ['笔记', '效率'],
    mcpTools: ['note_create', 'note_search'],
    permissions: ['file:read', 'file:write'],
    updatedAt: '2026-03-12',
  },
  {
    id: 'cherrystudio.backup',
    name: '备份还原',
    description: '数据备份与还原，支持 WebDAV、S3、坚果云',
    version: '1.0.1',
    author: 'CherryHQ',
    icon: '💾',
    category: 'official',
    enabled: true,
    status: 'installed',
    size: '0.9 MB',
    tags: ['数据', '安全'],
    permissions: ['file:read', 'file:write', 'network'],
    updatedAt: '2026-03-08',
  },
  {
    id: 'cherrystudio.code-tools',
    name: '代码工具',
    description: '代码执行、格式化、Lint 检查，支持 Python/JS/TS',
    version: '1.3.0',
    author: 'CherryHQ',
    icon: '💻',
    category: 'official',
    enabled: true,
    status: 'installed',
    size: '1.5 MB',
    tags: ['编程', '工具'],
    mcpTools: ['code_run', 'code_format'],
    permissions: ['file:read', 'file:write:temp'],
    updatedAt: '2026-03-19',
  },
  {
    id: 'cherrystudio.memory',
    name: '语义记忆',
    description: '长期记忆系统，自动提取和关联对话中的重要信息',
    version: '1.0.0',
    author: 'CherryHQ',
    icon: '🧠',
    category: 'official',
    enabled: true,
    status: 'installed',
    size: '1.2 MB',
    tags: ['记忆', '智能'],
    mcpTools: ['memory_add', 'memory_search', 'memory_list'],
    permissions: ['file:write'],
    updatedAt: '2026-03-14',
  },
];

// ===========================
// Mock: Marketplace Extensions
// ===========================

export const marketplaceExtensions: Extension[] = [
  {
    id: 'cherrystudio.tts',
    name: '语音合成',
    description: '文本转语音，支持 Edge TTS、Azure、OpenAI 等多种引擎',
    version: '1.0.0',
    author: 'CherryHQ',
    icon: '🔊',
    category: 'official',
    enabled: false,
    status: 'not-installed',
    size: '1.2 MB',
    downloads: 12800,
    rating: 4.8,
    tags: ['语音', '多媒体'],
    mcpTools: ['tts_speak', 'tts_list_voices', 'tts_stop'],
    permissions: ['file:write:temp', 'network'],
    homepage: 'https://github.com/CherryHQ/cherry-plugin-tts',
    updatedAt: '2026-03-22',
  },
  {
    id: 'cherrystudio.asr',
    name: '语音识别',
    description: '语音转文字，支持 Whisper、Azure Speech 等引擎',
    version: '1.0.0',
    author: 'CherryHQ',
    icon: '🎤',
    category: 'official',
    enabled: false,
    status: 'not-installed',
    size: '2.1 MB',
    downloads: 8600,
    rating: 4.6,
    tags: ['语音', '多媒体'],
    mcpTools: ['asr_transcribe', 'asr_stream'],
    permissions: ['file:read', 'network'],
    updatedAt: '2026-03-20',
  },
  {
    id: 'cherrystudio.browser',
    name: '浏览器控制',
    description: '通过 Playwright 控制浏览器，支持网页操作和数据抓取',
    version: '0.9.0',
    author: 'CherryHQ',
    icon: '🌍',
    category: 'official',
    enabled: false,
    status: 'not-installed',
    size: '4.5 MB',
    downloads: 5200,
    rating: 4.3,
    tags: ['自动化', '浏览器'],
    mcpTools: ['browser_navigate', 'browser_click', 'browser_screenshot', 'browser_extract'],
    permissions: ['network', 'file:write:temp'],
    updatedAt: '2026-03-18',
  },
  {
    id: 'cherrystudio.export',
    name: '文档导出',
    description: '将对话和笔记导出为 PDF、Word、Markdown 等格式',
    version: '1.1.0',
    author: 'CherryHQ',
    icon: '📤',
    category: 'official',
    enabled: false,
    status: 'not-installed',
    size: '1.8 MB',
    downloads: 15400,
    rating: 4.7,
    tags: ['导出', '文档'],
    permissions: ['file:write'],
    updatedAt: '2026-03-16',
  },
  {
    id: 'community.clipboard-monitor',
    name: '剪贴板监听',
    description: '监听系统剪贴板变化，自动发送内容到当前对话',
    version: '0.8.0',
    author: 'user-zhang',
    icon: '📋',
    category: 'community',
    enabled: false,
    status: 'not-installed',
    size: '0.3 MB',
    downloads: 3100,
    rating: 4.1,
    tags: ['效率', '系统'],
    permissions: ['notification'],
    updatedAt: '2026-03-14',
  },
  {
    id: 'community.email-assistant',
    name: '邮件助手',
    description: '收发邮件，AI 辅助邮件撰写和分类',
    version: '1.0.0',
    author: 'dev-community',
    icon: '📧',
    category: 'community',
    enabled: false,
    status: 'not-installed',
    size: '1.0 MB',
    downloads: 2800,
    rating: 4.0,
    tags: ['邮件', '效率'],
    mcpTools: ['email_send', 'email_list', 'email_read'],
    permissions: ['network'],
    updatedAt: '2026-03-10',
  },
  {
    id: 'community.obsidian-sync',
    name: 'Obsidian 同步',
    description: '与 Obsidian 笔记库双向同步，支持标签和链接',
    version: '1.2.0',
    author: 'obsidian-fan',
    icon: '🔮',
    category: 'community',
    enabled: false,
    status: 'not-installed',
    size: '0.7 MB',
    downloads: 9200,
    rating: 4.5,
    tags: ['笔记', '同步'],
    permissions: ['file:read', 'file:write'],
    updatedAt: '2026-03-21',
  },
  {
    id: 'community.notion-import',
    name: 'Notion 导入',
    description: '从 Notion 导入页面和数据库到知识库',
    version: '0.5.0',
    author: 'notion-user',
    icon: '📓',
    category: 'community',
    enabled: false,
    status: 'not-installed',
    size: '0.5 MB',
    downloads: 4100,
    rating: 3.9,
    tags: ['导入', '知识管理'],
    permissions: ['network', 'file:write'],
    updatedAt: '2026-03-08',
  },
];

// ===========================
// Mock: Runtime Dependencies
// ===========================

export const runtimeDependencies: RuntimeDependency[] = [
  { id: 'dep-node', name: 'Node.js', type: 'binary', version: '22.12.0', requiredBy: ['cherrystudio.code-tools'], status: 'ready', size: '45 MB', path: '/usr/local/bin/node' },
  { id: 'dep-python', name: 'Python (Pyodide)', type: 'binary', version: '3.11', requiredBy: ['cherrystudio.code-tools'], status: 'ready', size: '28 MB', path: 'WASM runtime' },
  { id: 'dep-git', name: 'Git', type: 'binary', version: '2.44.0', requiredBy: ['cherrystudio.backup'], status: 'ready', size: '12 MB', path: '/usr/bin/git' },
  { id: 'dep-edge-tts', name: 'edge-tts', type: 'npm', version: '1.5.0', requiredBy: ['cherrystudio.tts'], status: 'missing', size: '2.1 MB' },
  { id: 'dep-whisper', name: 'whisper.cpp', type: 'binary', version: '1.6.0', requiredBy: ['cherrystudio.asr'], status: 'missing', size: '150 MB' },
  { id: 'dep-playwright', name: 'Playwright', type: 'npm', version: '1.42.0', requiredBy: ['cherrystudio.browser'], status: 'missing', size: '85 MB' },
  { id: 'dep-tesseract', name: 'Tesseract.js', type: 'npm', version: '5.0.0', requiredBy: ['cherrystudio.ocr'], status: 'ready', size: '18 MB' },
  { id: 'dep-embedjs', name: '@cherrystudio/embedjs', type: 'npm', version: '2.0.0', requiredBy: ['cherrystudio.knowledge'], status: 'ready', size: '5.2 MB' },
];

// ===========================
// Helpers
// ===========================

export function formatDownloads(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
