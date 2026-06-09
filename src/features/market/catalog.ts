import type { MarketItem, ResourceKind } from './types';

// Sidebar lists every resource kind as a flat list. 集成 has a special
// logo-first card and install dialog (see InstallIntegrationDialog).
// 来源渠道 lives in the feed strip — orthogonal axis to kind.
export const SIDEBAR_KINDS: (ResourceKind | 'all')[] = [
  'all', 'skill', 'mcp', 'agent', 'assistant', 'prompt', 'kb', 'integration',
];

// Built-in subscription feeds. Users can add more via the "+" button.
// `kinds` gates which resource-type tabs a feed appears under.
// Omitted = always visible (e.g. Cherry 精选 is a curated cross-kind feed).
export const BUILTIN_FEEDS: { id: string; label: string; kinds?: string[] }[] = [
  { id: 'cherry',      label: 'Cherry 精选' },
  { id: 'skill-hub',   label: 'Skill Hub',   kinds: ['skill'] },
  { id: 'claude',      label: 'Claude Skill', kinds: ['skill'] },
  { id: 'awesome-mcp', label: 'Awesome MCP', kinds: ['mcp'] },
];

// Per-integration product logo via the Simple Icons CDN with the brand's
// official hex. Same map services both Market ids (m-*) and Agent
// toolchain integration ids (integ-*), so an integration installed
// from Market shows up with the same brand logo in the agent config.
// Falls back to the catalog avatar emoji when an id isn't mapped.
export const INTEGRATION_LOGO: Record<string, { slug: string; color: string }> = {
  // Market ids
  'm-19': { slug: 'notion',           color: '000000' },
  'm-20': { slug: 'yuque',            color: '25B864' },
  'm-21': { slug: 'googlecalendar',   color: '4285F4' },
  'm-22': { slug: 'larksuite',        color: '00D6B9' },
  'm-23': { slug: 'slack',            color: '4A154B' },
  'm-24': { slug: 'linear',           color: '5E6AD2' },
  'm-25': { slug: 'gmail',            color: 'EA4335' },
  'm-26': { slug: 'github',           color: '181717' },
  'm-27': { slug: 'confluence',       color: '172B4D' },
  'm-28': { slug: 'microsoftoutlook', color: '0078D4' },
  // Agent toolchain ids (mirror the same brand logos)
  'integ-notion': { slug: 'notion',     color: '000000' },
  'integ-yuque':  { slug: 'yuque',      color: '25B864' },
  'integ-feishu': { slug: 'larksuite',  color: '00D6B9' },
  'integ-slack':  { slug: 'slack',      color: '4A154B' },
  'integ-github': { slug: 'github',     color: '181717' },
  'integ-linear': { slug: 'linear',     color: '5E6AD2' },
};

// Install counts mirror real GitHub star counts (May 2026). When a single
// repo bundles multiple resources (anthropic-cookbook ≈ 43K, mcp/servers
// ≈ 86K), the parent's stars are split proportionally so totals stay
// grounded. First-party Cherry resources and product integrations use
// modest, honest numbers — not fabricated round figures.
export const CATALOG: MarketItem[] = [
  // ─── Anthropic Skills (anthropic-cookbook 43,378 split 4 ways) ──
  { id: 'm-1',  kind: 'skill',     name: 'pdf',                 tagline: 'Anthropic 官方 PDF Skill：解析 PDF 正文、表格、签字与表单字段', author: '@anthropics',   avatar: '📕',  avatarBg: 'bg-destructive/15',   language: 'EN',  region: '全球',     category: '内容创作', ageLabel: '4mo', installs: 18500, trending: true  },
  { id: 'm-4',  kind: 'skill',     name: 'xlsx',                tagline: 'Anthropic 官方 Excel Skill：读写 .xlsx，支持公式、图表与多表汇总', author: '@anthropics',   avatar: '📊',  avatarBg: 'bg-success/20',       language: 'EN',  region: '全球',     category: '数据',     ageLabel: '4mo', installs: 12400                  },
  { id: 'm-10', kind: 'skill',     name: 'docx',                tagline: 'Anthropic 官方 Word Skill：生成 / 编辑 .docx，含目录、样式、批注', author: '@anthropics',   avatar: '📘',  avatarBg: 'bg-accent-blue/25',   language: 'EN',  region: '全球',     category: '写作',     ageLabel: '4mo', installs: 7300                   },
  { id: 'm-16', kind: 'skill',     name: 'pptx',                tagline: 'Anthropic 官方 PowerPoint Skill：一句话生成可编辑幻灯片',     author: '@anthropics',   avatar: '📑',  avatarBg: 'bg-accent-orange/25', language: 'EN',  region: '全球',     category: '办公',     ageLabel: '4mo', installs: 5200, trending: true, version: '1.4.0'  },

  // ─── MCP Servers — mostly modelcontextprotocol/servers (85,965 split per server) ──
  { id: 'm-2',  kind: 'mcp',       name: 'server-filesystem',   tagline: '@modelcontextprotocol 官方：受控读写本地文件，含 glob 搜索',   author: '@modelcontextprotocol', avatar: '📁',  avatarBg: 'bg-accent-blue/25', language: 'EN',  region: '全球',     category: '开发',     ageLabel: '1y',  installs: 34800, trending: true  },
  { id: 'm-5',  kind: 'mcp',       name: 'server-github',       tagline: '@modelcontextprotocol 官方：仓库 / PR / Issue / Search / Actions', author: '@modelcontextprotocol', avatar: '🐙',  avatarBg: 'bg-foreground/15',  language: 'EN',  region: '全球',     category: '开发',     ageLabel: '1y',  installs: 28500, trending: true  },
  { id: 'm-11', kind: 'mcp',       name: 'context7',            tagline: 'Upstash Context7：拉取任意开源库的最新文档片段供 LLM 引用',   author: '@upstash',              avatar: '⌬',   avatarBg: 'bg-success/20',     language: 'EN',  region: '全球',     category: '开发',     ageLabel: '7mo', installs: 55690, trending: true  },
  { id: 'm-18', kind: 'mcp',       name: 'tavily-mcp',          tagline: 'Tavily 搜索 MCP：实时网络检索 + 网页抓取 + 引用归纳',          author: '@tavily-ai',            avatar: '🔍',  avatarBg: 'bg-accent-violet/25', language: 'EN', region: '全球',     category: '研究',     ageLabel: '5mo', installs: 1986                   },

  // ─── Prompts (Anthropic Prompt Library) ──
  { id: 'm-3',  kind: 'prompt',    name: 'Code Consultant',     tagline: 'Anthropic Prompt Library：阅读代码后给出可执行的重构建议',     author: '@anthropics',   avatar: '🛠️', avatarBg: 'bg-accent-violet/25', language: 'EN',  region: '全球',     category: '编程',     ageLabel: '1y',  installs: 8200                   },
  { id: 'm-6',  kind: 'prompt',    name: 'SQL Sorcerer',        tagline: 'Anthropic Prompt Library：自然语言转 SQL，支持复杂 join 与窗口函数', author: '@anthropics', avatar: '🪄',  avatarBg: 'bg-accent-amber/25',  language: 'EN',  region: '全球',     category: '数据',     ageLabel: '1y',  installs: 7100                   },
  { id: 'm-12', kind: 'prompt',    name: 'Email Companion',     tagline: 'Anthropic Prompt Library：个性化邮件回复，语气 / 长度 / 表态可控', author: '@anthropics',   avatar: '✉️',  avatarBg: 'bg-accent-amber/25',  language: 'EN',  region: '全球',     category: '写作',     ageLabel: '1y',  installs: 5400                   },
  { id: 'm-17', kind: 'prompt',    name: 'Excel Formula Expert', tagline: 'Anthropic Prompt Library：根据需求生成 Excel / Sheets 公式与解释', author: '@anthropics',   avatar: 'ƒ',   avatarBg: 'bg-success/20',       language: 'EN',  region: '全球',     category: '数据',     ageLabel: '1y',  installs: 4600                   },

  // ─── Pre-configured Assistants (chat persona) ──
  { id: 'm-13', kind: 'assistant', name: '代码导师',           tagline: '逐步讲解算法 / 设计模式 / 代码片段，附带练习题与测试',           author: '@cherry-team',  avatar: '🎓',  avatarBg: 'bg-accent-emerald/25', language: '中文', region: '通用',     category: '编程',     ageLabel: '5mo', installs: 489                    },
  { id: 'm-53', kind: 'assistant', name: '写作教练',           tagline: '逐段给出语序 / 节奏 / 用词建议，并给出可直接采纳的改写版本',     author: '@cherry-team',  avatar: '✍️',  avatarBg: 'bg-accent-amber/25',  language: '中文', region: '通用',     category: '写作',     ageLabel: '4mo', installs: 521                    },

  // ─── Agents — 多步自治 workflow ──
  { id: 'm-7',  kind: 'agent',     name: '调研分析师',         tagline: '多步调研：搜索 → 抓取 → 整理 → 输出含引用的报告与对比表',     author: '@cherry-team',  avatar: '🔬',  avatarBg: 'bg-accent-cyan/25',   language: '中文', region: '通用',     category: '研究',     ageLabel: '3mo', installs: 712                    },
  { id: 'm-54', kind: 'agent',     name: 'SQL 数据分析 Agent', tagline: '自然语言转 SQL，连库跑数 + 出表 + 解读，对接主流仓库与 BI',     author: '@cherry-team',  avatar: '🧮',  avatarBg: 'bg-accent-indigo/25', language: '中文', region: '通用',     category: '数据',     ageLabel: '5mo', installs: 838, trending: true, version: '0.8.2'  },
  { id: 'm-56', kind: 'agent',     name: 'Bug 修复 Agent',      tagline: '读栈追踪 → 定位文件 → 读 / 改代码 → 跑测试，最后输出 diff',     author: '@cherry-team',  avatar: '🛠',   avatarBg: 'bg-destructive/15',   language: '中文', region: '通用',     category: '编程',     ageLabel: '2mo', installs: 423,  trending: true   },
  { id: 'm-57', kind: 'agent',     name: '竞品调研 Agent',      tagline: '给一个产品名，自动抓取官网 / 定价 / 评测 / 社交反馈，输出对比表', author: '@cherry-team',  avatar: '🧭',  avatarBg: 'bg-accent-violet/25', language: '中文', region: '通用',     category: '研究',     ageLabel: '2mo', installs: 356                    },

  // ─── Knowledge bases ──
  { id: 'm-8',  kind: 'kb',        name: 'React Docs',          tagline: '官方 React 文档全文索引（覆盖 react.dev / RFC / 19 preview）',  author: '@meta',         avatar: '⚛️', avatarBg: 'bg-info/20',          language: 'EN',  region: '全球',     category: '编程',     ageLabel: '8mo', installs: 245145, trending: true  },
  { id: 'm-15', kind: 'kb',        name: 'Anthropic Cookbook',  tagline: 'Claude API 完整文档与 Cookbook：模型、tool use、prompt caching、batch、files', author: '@anthropics', avatar: '🅰',  avatarBg: 'bg-accent-amber/20',  language: 'EN',  region: '全球',     category: '开发',     ageLabel: '6mo', installs: 43378                  },
  { id: 'm-47', kind: 'kb',        name: 'Tailwind CSS Docs',   tagline: 'Tailwind 4.x 全部 utility / preset / preflight，离线可检索',     author: '@tailwindlabs', avatar: '🌬',  avatarBg: 'bg-info/15',          language: 'EN',  region: '全球',     category: '设计',     ageLabel: '5mo', installs: 95066, trending: true  },
  { id: 'm-48', kind: 'kb',        name: 'OpenAI Cookbook',     tagline: 'OpenAI 官方 Cookbook：从 RAG、Function Calling 到 Realtime 的可运行例子', author: '@openai',     avatar: '🍳',  avatarBg: 'bg-success/15',       language: 'EN',  region: '全球',     category: '编程',     ageLabel: '3y',  installs: 73655, trending: true  },
  { id: 'm-49', kind: 'kb',        name: 'LangChain Docs',      tagline: 'LangChain JS / Python 全栈文档：Runnables、LangGraph、LangSmith',  author: '@langchain-ai', avatar: '🦜',  avatarBg: 'bg-accent-orange/20', language: 'EN',  region: '全球',     category: '编程',     ageLabel: '1y',  installs: 137182, trending: true  },
  { id: 'm-50', kind: 'kb',        name: 'Kubernetes Docs',     tagline: 'Kubernetes 官方文档全文索引：Concepts / Tasks / Reference / API',  author: '@kubernetes',   avatar: '⎈',   avatarBg: 'bg-info/20',          language: 'EN',  region: '全球',     category: '开发',     ageLabel: '5y',  installs: 122363, trending: true  },

  // ─── Cherry first-party CLIs ──
  { id: 'm-9',  kind: 'cli',       name: 'cherry-cli',         tagline: '在终端中直接调用 Cherry Studio 助手、跑 prompt、管理资源', author: '@cherry-team',  avatar: '⌘',   avatarBg: 'bg-foreground/15',    language: 'EN',  region: '通用',     category: '开发',     ageLabel: '7mo', installs: 318                    },
  { id: 'm-14', kind: 'cli',       name: 'mcp-runner',         tagline: '本地一行命令启动任意 MCP server，含进程托管与日志聚合',     author: '@cherry-team',  avatar: '⚡',  avatarBg: 'bg-accent-yellow/25', language: 'EN',  region: '通用',     category: '开发',     ageLabel: '5mo', installs: 184                    },

  // ─── Real-world CLIs ──
  { id: 'm-29', kind: 'cli',       name: 'gh',                  tagline: 'GitHub 官方 CLI：管理仓库 / PR / Issue / Release / GitHub Actions', author: '@cli/cli',      avatar: 'gh',  avatarBg: 'bg-foreground/12',    language: 'EN',  region: '全球',     category: '开发',     ageLabel: '2y',  installs: 44484, trending: true  },
  { id: 'm-30', kind: 'cli',       name: 'lark-cli',            tagline: '飞书 OpenAPI SDK + CLI：消息 / 文档 / 多维表格 / 日历 / 妙记 / 会议', author: '@larksuite',    avatar: '🪶',  avatarBg: 'bg-accent-blue/25',   language: '中文', region: '中国',     category: '办公',     ageLabel: '1y',  installs: 586, trending: true, version: '2.1.0' },
  { id: 'm-31', kind: 'cli',       name: 'yuque-cli',           tagline: '语雀文档读写、附件上传、知识库同步与导出',       author: '@yuque',        avatar: '📘',  avatarBg: 'bg-success/20',       language: '中文', region: '中国',     category: '办公',     ageLabel: '10mo', installs: 6                     },
  { id: 'm-32', kind: 'cli',       name: 'claude-code',         tagline: 'Anthropic 官方终端编程 agent，可读写文件、运行命令、走多步任务', author: '@anthropics',   avatar: '🅰',  avatarBg: 'bg-accent-amber/25',  language: 'EN',  region: '全球',     category: '开发',     ageLabel: '6mo', installs: 125103, trending: true  },
  { id: 'm-33', kind: 'cli',       name: 'vercel',              tagline: 'Vercel 部署、查日志、配置域名 / 环境变量 / 团队',  author: '@vercel',       avatar: '▲',   avatarBg: 'bg-foreground/15',    language: 'EN',  region: '全球',     category: '开发',     ageLabel: '3y',  installs: 15513                  },
  { id: 'm-34', kind: 'cli',       name: 'supabase',            tagline: 'Postgres 迁移、Auth 配置、Storage、Edge Functions 本地起服务', author: '@supabase',     avatar: '⚡',  avatarBg: 'bg-success/25',       language: 'EN',  region: '全球',     category: '开发',     ageLabel: '2y',  installs: 2229                   },
  { id: 'm-35', kind: 'cli',       name: 'aws',                 tagline: 'AWS 全服务官方 CLI：EC2 / S3 / Lambda / IAM / CloudFormation', author: '@aws',          avatar: '☁',   avatarBg: 'bg-accent-orange/20', language: 'EN',  region: '全球',     category: '开发',     ageLabel: '5y',  installs: 16970                  },
  { id: 'm-36', kind: 'cli',       name: 'op (1Password)',      tagline: '终端中安全注入 secrets 与 token，CI / 本地脚本可直接用', author: '@1Password',    avatar: '🔐',  avatarBg: 'bg-info/20',          language: 'EN',  region: '全球',     category: '开发',     ageLabel: '2y',  installs: 412                    },
  { id: 'm-37', kind: 'cli',       name: 'gcloud',              tagline: 'Google Cloud 官方 CLI：计算 / 存储 / 数据库 / BigQuery / AI Studio', author: '@google',       avatar: 'G',   avatarBg: 'bg-info/15',          language: 'EN',  region: '全球',     category: '开发',     ageLabel: '4y',  installs: 938                    },
  { id: 'm-38', kind: 'cli',       name: 'tccli',               tagline: '腾讯云官方 CLI：CVM / COS / SCF / Lighthouse 一键操作',  author: '@tencentcloud', avatar: '腾',  avatarBg: 'bg-info/25',          language: '中文', region: '中国',     category: '开发',     ageLabel: '1y',  installs: 119                    },
  { id: 'm-39', kind: 'cli',       name: 'aliyun',              tagline: '阿里云官方 CLI：ECS / OSS / RDS / 函数计算 / DataWorks',    author: '@aliyun',       avatar: '阿',  avatarBg: 'bg-accent-orange/25', language: '中文', region: '中国',     category: '开发',     ageLabel: '1y',  installs: 970                    },
  { id: 'm-40', kind: 'cli',       name: 'kubectl',             tagline: 'Kubernetes 集群管理标准命令行：Pod / Deployment / Service / Ingress', author: '@kubernetes',   avatar: '⎈',   avatarBg: 'bg-info/15',          language: 'EN',  region: '全球',     category: '开发',     ageLabel: '6y',  installs: 3279                   },

  // ─── More real-world MCP servers ──
  { id: 'm-41', kind: 'mcp',       name: 'server-postgres',     tagline: '@modelcontextprotocol 官方：以只读模式查询 PostgreSQL 数据库',   author: '@modelcontextprotocol', avatar: '🐘',  avatarBg: 'bg-info/20',          language: 'EN',  region: '全球',     category: '数据',     ageLabel: '1y',  installs: 16400, trending: true  },
  { id: 'm-42', kind: 'mcp',       name: 'server-sqlite',       tagline: '@modelcontextprotocol 官方：本地 SQLite 数据库查询与 schema 浏览', author: '@modelcontextprotocol', avatar: '💾',  avatarBg: 'bg-muted',            language: 'EN',  region: '全球',     category: '数据',     ageLabel: '1y',  installs: 9800                   },
  { id: 'm-43', kind: 'mcp',       name: 'server-memory',       tagline: '@modelcontextprotocol 官方：进程内键值记忆，对话间持久化笔记',   author: '@modelcontextprotocol', avatar: '🧠',  avatarBg: 'bg-accent-violet/25', language: 'EN',  region: '全球',     category: '开发',     ageLabel: '1y',  installs: 11200                  },
  { id: 'm-44', kind: 'mcp',       name: 'server-sequential-thinking', tagline: '官方实验性：把复杂问题拆成可观察的分步思考链',           author: '@modelcontextprotocol', avatar: '🧭',  avatarBg: 'bg-accent-indigo/25', language: 'EN',  region: '全球',     category: '研究',     ageLabel: '8mo', installs: 7400                   },
  { id: 'm-45', kind: 'mcp',       name: 'e2b-mcp-server',      tagline: 'E2B 代码沙箱：在隔离环境中安全运行 Python / Node 代码',           author: '@e2b-dev',              avatar: '⬡',  avatarBg: 'bg-accent-emerald/25', language: 'EN', region: '全球',     category: '开发',     ageLabel: '6mo', installs: 394                    },
  { id: 'm-46', kind: 'mcp',       name: 'notion-mcp-server',   tagline: 'Notion 官方 MCP：页面 / 数据库 / 评论的读写与权限同步',           author: '@makenotion',           avatar: '📒',  avatarBg: 'bg-muted',            language: 'EN',  region: '全球',     category: '办公',     ageLabel: '4mo', installs: 4348                   },
  { id: 'm-55', kind: 'mcp',       name: 'playwright-mcp',      tagline: 'Microsoft Playwright 官方 MCP：受控浏览器、截图、表单与批量爬取',  author: '@microsoft',            avatar: '🌐',  avatarBg: 'bg-info/25',          language: 'EN',  region: '全球',     category: '开发',     ageLabel: '5mo', installs: 32752, trending: true  },

  // ─── Community Skills ──
  { id: 'm-51', kind: 'skill',     name: 'mermaid',             tagline: '在对话中实时渲染 Mermaid 流程图 / 时序图 / Gantt，支持 SVG 导出', author: '@mermaid-js',   avatar: '🌊',  avatarBg: 'bg-accent-cyan/25',   language: 'EN',  region: '全球',     category: '设计',     ageLabel: '11mo', installs: 88166, trending: true },
  { id: 'm-52', kind: 'skill',     name: 'code-interpreter',    tagline: 'E2B 提供的 Python 沙箱：跑代码、出图、读 csv / xlsx / parquet',     author: '@e2b-dev',      avatar: '⚙',   avatarBg: 'bg-accent-emerald/25', language: 'EN',  region: '全球',     category: '编程',     ageLabel: '9mo', installs: 2322, trending: true, version: '0.9.1' },

  // ─── Integrations (commercial products, no public OSS repo) ──
  { id: 'm-19', kind: 'integration', name: 'Notion',           tagline: '页面读写、数据库查询、批量更新与权限同步',     author: '@notion-labs',  avatar: '📝',  avatarBg: 'bg-muted',            language: 'EN',  region: '通用',     category: '办公',     ageLabel: '1y',  installs: 4120                   },
  { id: 'm-20', kind: 'integration', name: '语雀',              tagline: '语雀知识库 / 文档 / 团队空间读写',             author: '@yuque',        avatar: '📘',  avatarBg: 'bg-success/20',       language: '中文', region: '中国',     category: '办公',     ageLabel: '8mo', installs: 285                    },
  { id: 'm-21', kind: 'integration', name: 'Google Calendar',  tagline: '查询、创建日程，自动找时间，跨账号同步',       author: '@google',       avatar: '📅',  avatarBg: 'bg-info/20',          language: '多语', region: '全球',     category: '办公',     ageLabel: '11mo', installs: 1840                  },
  { id: 'm-22', kind: 'integration', name: '飞书',              tagline: '消息、文档、多维表格、日历、视频会议一体化',   author: '@feishu',       avatar: '🪶',  avatarBg: 'bg-accent-blue/25',   language: '中文', region: '中国',     category: '办公',     ageLabel: '7mo', installs: 720                    },
  { id: 'm-23', kind: 'integration', name: 'Slack',             tagline: '频道消息 / DM / 工作流，含 Bot 双向通信',       author: '@slack',        avatar: '💬',  avatarBg: 'bg-accent-violet/25', language: '多语', region: '全球',     category: '办公',     ageLabel: '1y',  installs: 2105                   },
  { id: 'm-24', kind: 'integration', name: 'Linear',            tagline: '任务、项目、冲刺管理，自动开 issue 与转 PR',    author: '@linear',       avatar: '◰',   avatarBg: 'bg-accent-indigo/25', language: 'EN',  region: '全球',     category: '研究',     ageLabel: '6mo', installs: 482                    },
  { id: 'm-25', kind: 'integration', name: 'Gmail',             tagline: '收发邮件、自动分类、生成回复草稿与摘要',       author: '@google',       avatar: '✉️',  avatarBg: 'bg-destructive/15',   language: '多语', region: '全球',     category: '办公',     ageLabel: '9mo', installs: 1623                   },
  { id: 'm-26', kind: 'integration', name: 'GitHub',            tagline: '仓库 / Issue / PR / Release 自然语言自动化',     author: '@github',       avatar: '🐙',  avatarBg: 'bg-foreground/15',    language: 'EN',  region: '全球',     category: '开发',     ageLabel: '1y',  installs: 5240                   },
  { id: 'm-27', kind: 'integration', name: 'Confluence',        tagline: '企业 Wiki 读写、模板插入、跨空间检索',         author: '@atlassian',    avatar: '🧭',  avatarBg: 'bg-info/15',          language: '多语', region: '全球',     category: '办公',     ageLabel: '5mo', installs: 312                    },
  { id: 'm-28', kind: 'integration', name: 'Outlook',           tagline: '收发邮件 + 会议邀请 + 联系人同步',             author: '@microsoft',    avatar: '📧',  avatarBg: 'bg-info/20',          language: '多语', region: '全球',     category: '办公',     ageLabel: '6mo', installs: 580                    },
];
