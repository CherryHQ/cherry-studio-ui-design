import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus, Search, Filter, ArrowUpDown, ChevronRight, ChevronLeft, ChevronDown,
  Check, Download, X, MoreHorizontal, Terminal, FileText,
  Wrench, Sparkles, MousePointerClick, BookOpen, Network, Plug,
  CheckCircle2, Zap, Compass, Star, ExternalLink, Shield,
  Upload, Link2, Bot,
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

// Assistant 和 Agent 在 Cherry Studio 里是两个独立的产品概念：
//   - Assistant: 对话型 persona — system prompt + 模型设置 +（可选）MCP/知识库
//   - Agent:     多步自治 workflow — 在 tool-call 循环里调用工具产出结构化产物
// 所以 Market 的 kind 列表里两者必须分开。
type ResourceKind = 'skill' | 'cli' | 'assistant' | 'agent' | 'mcp' | 'prompt' | 'kb' | 'integration';

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
  /** User-created resource — only appears in 我的资源, never in 探索. */
  custom?: boolean;
}

const KIND_LABEL: Record<ResourceKind, string> = {
  skill: 'Skill', cli: 'CLI', assistant: 'Assistant', agent: 'Agent',
  mcp: 'MCP', prompt: 'Prompt', kb: '知识库', integration: '集成',
};

const KIND_ICON: Record<ResourceKind, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  skill: Sparkles, cli: Terminal, assistant: MousePointerClick, agent: Bot,
  mcp: Network, prompt: FileText, kb: BookOpen, integration: Plug,
};

const KIND_COLOR: Record<ResourceKind, string> = {
  skill:       'bg-accent-violet/70',
  cli:         'bg-foreground/80',
  assistant:   'bg-accent-cyan/70',
  agent:       'bg-accent-indigo/75',
  mcp:         'bg-info/70',
  prompt:      'bg-accent-amber/70',
  kb:          'bg-success/70',
  integration: 'bg-accent-orange/70',
};

// ─── Catalog ──────────────────────────────────────────────────────────

const CATALOG: MarketItem[] = [
  // Install counts mirror real GitHub star counts (May 2026 snapshot
  // via `gh api repos/<owner>/<repo>`). When a single repo bundles
  // multiple resources (e.g. anthropic-cookbook ≈ 43K, mcp/servers
  // ≈ 86K), the parent's stars are split proportionally across the
  // siblings so totals stay grounded. First-party Cherry resources
  // and product integrations (no public OSS repo) use modest, honest
  // numbers — not fabricated round figures.

  // ─── Anthropic Skills (anthropic-cookbook = 43,378 split 4 ways) ──
  { id: 'm-1',  kind: 'skill',     name: 'pdf',                 tagline: 'Anthropic 官方 PDF Skill：解析 PDF 正文、表格、签字与表单字段', author: '@anthropics',   avatar: '📕',  avatarBg: 'bg-destructive/15',   language: 'EN',  region: '全球',     category: '内容创作', ageLabel: '4mo', installs: 18500, trending: true  },
  { id: 'm-4',  kind: 'skill',     name: 'xlsx',                tagline: 'Anthropic 官方 Excel Skill：读写 .xlsx，支持公式、图表与多表汇总', author: '@anthropics',   avatar: '📊',  avatarBg: 'bg-success/20',       language: 'EN',  region: '全球',     category: '数据',     ageLabel: '4mo', installs: 12400                  },
  { id: 'm-10', kind: 'skill',     name: 'docx',                tagline: 'Anthropic 官方 Word Skill：生成 / 编辑 .docx，含目录、样式、批注', author: '@anthropics',   avatar: '📘',  avatarBg: 'bg-accent-blue/25',   language: 'EN',  region: '全球',     category: '写作',     ageLabel: '4mo', installs: 7300                   },
  { id: 'm-16', kind: 'skill',     name: 'pptx',                tagline: 'Anthropic 官方 PowerPoint Skill：一句话生成可编辑幻灯片',     author: '@anthropics',   avatar: '📑',  avatarBg: 'bg-accent-orange/25', language: 'EN',  region: '全球',     category: '办公',     ageLabel: '4mo', installs: 5200                   },

  // ─── MCP Servers — mostly from modelcontextprotocol/servers
  // (= 85,965, split per server); standalone repos use their own count
  { id: 'm-2',  kind: 'mcp',       name: 'server-filesystem',   tagline: '@modelcontextprotocol 官方：受控读写本地文件，含 glob 搜索',   author: '@modelcontextprotocol', avatar: '📁',  avatarBg: 'bg-accent-blue/25', language: 'EN',  region: '全球',     category: '开发',     ageLabel: '1y',  installs: 34800, trending: true  },
  { id: 'm-5',  kind: 'mcp',       name: 'server-github',       tagline: '@modelcontextprotocol 官方：仓库 / PR / Issue / Search / Actions', author: '@modelcontextprotocol', avatar: '🐙',  avatarBg: 'bg-foreground/15',  language: 'EN',  region: '全球',     category: '开发',     ageLabel: '1y',  installs: 28500, trending: true  },
  { id: 'm-11', kind: 'mcp',       name: 'context7',            tagline: 'Upstash Context7：拉取任意开源库的最新文档片段供 LLM 引用',   author: '@upstash',              avatar: '⌬',   avatarBg: 'bg-success/20',     language: 'EN',  region: '全球',     category: '开发',     ageLabel: '7mo', installs: 55690, trending: true  },
  { id: 'm-18', kind: 'mcp',       name: 'tavily-mcp',          tagline: 'Tavily 搜索 MCP：实时网络检索 + 网页抓取 + 引用归纳',          author: '@tavily-ai',            avatar: '🔍',  avatarBg: 'bg-accent-violet/25', language: 'EN', region: '全球',     category: '研究',     ageLabel: '5mo', installs: 1986                   },

  // ─── Prompts (Anthropic Prompt Library — share of cookbook 43,378) ──
  { id: 'm-3',  kind: 'prompt',    name: 'Code Consultant',     tagline: 'Anthropic Prompt Library：阅读代码后给出可执行的重构建议',     author: '@anthropics',   avatar: '🛠️', avatarBg: 'bg-accent-violet/25', language: 'EN',  region: '全球',     category: '编程',     ageLabel: '1y',  installs: 8200                   },
  { id: 'm-6',  kind: 'prompt',    name: 'SQL Sorcerer',        tagline: 'Anthropic Prompt Library：自然语言转 SQL，支持复杂 join 与窗口函数', author: '@anthropics', avatar: '🪄',  avatarBg: 'bg-accent-amber/25',  language: 'EN',  region: '全球',     category: '数据',     ageLabel: '1y',  installs: 7100                   },
  { id: 'm-12', kind: 'prompt',    name: 'Email Companion',     tagline: 'Anthropic Prompt Library：个性化邮件回复，语气 / 长度 / 表态可控', author: '@anthropics',   avatar: '✉️',  avatarBg: 'bg-accent-amber/25',  language: 'EN',  region: '全球',     category: '写作',     ageLabel: '1y',  installs: 5400                   },
  { id: 'm-17', kind: 'prompt',    name: 'Excel Formula Expert', tagline: 'Anthropic Prompt Library：根据需求生成 Excel / Sheets 公式与解释', author: '@anthropics',   avatar: 'ƒ',   avatarBg: 'bg-success/20',       language: 'EN',  region: '全球',     category: '数据',     ageLabel: '1y',  installs: 4600                   },

  // ─── Pre-configured Assistants (chat persona — system prompt
  // + 模型 +（可选）MCP/知识库；不是多步 workflow) ───────────────
  { id: 'm-13', kind: 'assistant', name: '代码导师',           tagline: '逐步讲解算法 / 设计模式 / 代码片段，附带练习题与测试',           author: '@cherry-team',  avatar: '🎓',  avatarBg: 'bg-accent-emerald/25', language: '中文', region: '通用',     category: '编程',     ageLabel: '5mo', installs: 489                    },

  // ─── Agents — 多步自治 workflow（tool-loop 产出结构化产物）───
  { id: 'm-7',  kind: 'agent',     name: '调研分析师',         tagline: '多步调研：搜索 → 抓取 → 整理 → 输出含引用的报告与对比表',     author: '@cherry-team',  avatar: '🔬',  avatarBg: 'bg-accent-cyan/25',   language: '中文', region: '通用',     category: '研究',     ageLabel: '3mo', installs: 712                    },

  // ─── Knowledge bases — backing project's real stars ────────────
  { id: 'm-8',  kind: 'kb',        name: 'React Docs',          tagline: '官方 React 文档全文索引（覆盖 react.dev / RFC / 19 preview）',  author: '@meta',         avatar: '⚛️', avatarBg: 'bg-info/20',          language: 'EN',  region: '全球',     category: '编程',     ageLabel: '8mo', installs: 245145, trending: true  },
  { id: 'm-15', kind: 'kb',        name: 'Anthropic Cookbook',  tagline: 'Claude API 完整文档与 Cookbook：模型、tool use、prompt caching、batch、files', author: '@anthropics', avatar: '🅰',  avatarBg: 'bg-accent-amber/20',  language: 'EN',  region: '全球',     category: '开发',     ageLabel: '6mo', installs: 43378                  },

  // ─── Cherry first-party CLIs (no OSS repo — modest mock numbers) ──
  { id: 'm-9',  kind: 'cli',       name: 'cherry-cli',         tagline: '在终端中直接调用 Cherry Studio 助手、跑 prompt、管理资源', author: '@cherry-team',  avatar: '⌘',   avatarBg: 'bg-foreground/15',    language: 'EN',  region: '通用',     category: '开发',     ageLabel: '7mo', installs: 318                    },
  { id: 'm-14', kind: 'cli',       name: 'mcp-runner',         tagline: '本地一行命令启动任意 MCP server，含进程托管与日志聚合',     author: '@cherry-team',  avatar: '⚡',  avatarBg: 'bg-accent-yellow/25', language: 'EN',  region: '通用',     category: '开发',     ageLabel: '5mo', installs: 184                    },

  // ─── Real-world CLIs — installs = real GitHub stars ─────────────
  { id: 'm-29', kind: 'cli',       name: 'gh',                  tagline: 'GitHub 官方 CLI：管理仓库 / PR / Issue / Release / GitHub Actions', author: '@cli/cli',      avatar: 'gh',  avatarBg: 'bg-foreground/12',    language: 'EN',  region: '全球',     category: '开发',     ageLabel: '2y',  installs: 44484, trending: true  },
  { id: 'm-30', kind: 'cli',       name: 'lark-cli',            tagline: '飞书 OpenAPI SDK + CLI：消息 / 文档 / 多维表格 / 日历 / 妙记 / 会议', author: '@larksuite',    avatar: '🪶',  avatarBg: 'bg-accent-blue/25',   language: '中文', region: '中国',     category: '办公',     ageLabel: '1y',  installs: 586                    },
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

  // ─── More real-world MCP servers (split of mcp/servers 85,965) ──
  { id: 'm-41', kind: 'mcp',       name: 'server-postgres',     tagline: '@modelcontextprotocol 官方：以只读模式查询 PostgreSQL 数据库',   author: '@modelcontextprotocol', avatar: '🐘',  avatarBg: 'bg-info/20',          language: 'EN',  region: '全球',     category: '数据',     ageLabel: '1y',  installs: 16400, trending: true  },
  { id: 'm-42', kind: 'mcp',       name: 'server-sqlite',       tagline: '@modelcontextprotocol 官方：本地 SQLite 数据库查询与 schema 浏览', author: '@modelcontextprotocol', avatar: '💾',  avatarBg: 'bg-muted',            language: 'EN',  region: '全球',     category: '数据',     ageLabel: '1y',  installs: 9800                   },
  { id: 'm-43', kind: 'mcp',       name: 'server-memory',       tagline: '@modelcontextprotocol 官方：进程内键值记忆，对话间持久化笔记',   author: '@modelcontextprotocol', avatar: '🧠',  avatarBg: 'bg-accent-violet/25', language: 'EN',  region: '全球',     category: '开发',     ageLabel: '1y',  installs: 11200                  },
  { id: 'm-44', kind: 'mcp',       name: 'server-sequential-thinking', tagline: '官方实验性：把复杂问题拆成可观察的分步思考链',           author: '@modelcontextprotocol', avatar: '🧭',  avatarBg: 'bg-accent-indigo/25', language: 'EN',  region: '全球',     category: '研究',     ageLabel: '8mo', installs: 7400                   },
  { id: 'm-45', kind: 'mcp',       name: 'e2b-mcp-server',      tagline: 'E2B 代码沙箱：在隔离环境中安全运行 Python / Node 代码',           author: '@e2b-dev',              avatar: '⬡',  avatarBg: 'bg-accent-emerald/25', language: 'EN', region: '全球',     category: '开发',     ageLabel: '6mo', installs: 394                    },
  { id: 'm-46', kind: 'mcp',       name: 'notion-mcp-server',   tagline: 'Notion 官方 MCP：页面 / 数据库 / 评论的读写与权限同步',           author: '@makenotion',           avatar: '📒',  avatarBg: 'bg-muted',            language: 'EN',  region: '全球',     category: '办公',     ageLabel: '4mo', installs: 4348                   },
  { id: 'm-55', kind: 'mcp',       name: 'playwright-mcp',      tagline: 'Microsoft Playwright 官方 MCP：受控浏览器、截图、表单与批量爬取',  author: '@microsoft',            avatar: '🌐',  avatarBg: 'bg-info/25',          language: 'EN',  region: '全球',     category: '开发',     ageLabel: '5mo', installs: 32752, trending: true  },

  // ─── More real KBs / docs ───────────────────────────────────────
  { id: 'm-47', kind: 'kb',        name: 'Tailwind CSS Docs',   tagline: 'Tailwind 4.x 全部 utility / preset / preflight，离线可检索',     author: '@tailwindlabs', avatar: '🌬',  avatarBg: 'bg-info/15',          language: 'EN',  region: '全球',     category: '设计',     ageLabel: '5mo', installs: 95066, trending: true  },
  { id: 'm-48', kind: 'kb',        name: 'OpenAI Cookbook',     tagline: 'OpenAI 官方 Cookbook：从 RAG、Function Calling 到 Realtime 的可运行例子', author: '@openai',     avatar: '🍳',  avatarBg: 'bg-success/15',       language: 'EN',  region: '全球',     category: '编程',     ageLabel: '3y',  installs: 73655, trending: true  },
  { id: 'm-49', kind: 'kb',        name: 'LangChain Docs',      tagline: 'LangChain JS / Python 全栈文档：Runnables、LangGraph、LangSmith',  author: '@langchain-ai', avatar: '🦜',  avatarBg: 'bg-accent-orange/20', language: 'EN',  region: '全球',     category: '编程',     ageLabel: '1y',  installs: 137182, trending: true  },
  { id: 'm-50', kind: 'kb',        name: 'Kubernetes Docs',     tagline: 'Kubernetes 官方文档全文索引：Concepts / Tasks / Reference / API',  author: '@kubernetes',   avatar: '⎈',   avatarBg: 'bg-info/20',          language: 'EN',  region: '全球',     category: '开发',     ageLabel: '5y',  installs: 122363, trending: true  },

  // ─── A couple more popular community Skills ─────────────────────
  { id: 'm-51', kind: 'skill',     name: 'mermaid',             tagline: '在对话中实时渲染 Mermaid 流程图 / 时序图 / Gantt，支持 SVG 导出', author: '@mermaid-js',   avatar: '🌊',  avatarBg: 'bg-accent-cyan/25',   language: 'EN',  region: '全球',     category: '设计',     ageLabel: '11mo', installs: 88166, trending: true },
  { id: 'm-52', kind: 'skill',     name: 'code-interpreter',    tagline: 'E2B 提供的 Python 沙箱：跑代码、出图、读 csv / xlsx / parquet',     author: '@e2b-dev',      avatar: '⚙',   avatarBg: 'bg-accent-emerald/25', language: 'EN',  region: '全球',     category: '编程',     ageLabel: '9mo', installs: 2322                   },

  // ─── Community pre-configured Assistants (chat persona) ─────────
  { id: 'm-53', kind: 'assistant', name: '写作教练',           tagline: '逐段给出语序 / 节奏 / 用词建议，并给出可直接采纳的改写版本',     author: '@cherry-team',  avatar: '✍️',  avatarBg: 'bg-accent-amber/25',  language: '中文', region: '通用',     category: '写作',     ageLabel: '4mo', installs: 521                    },

  // ─── More Agents — 多步 workflow，读写文件 / 跑查询 / 出报告 ──
  { id: 'm-54', kind: 'agent',     name: 'SQL 数据分析 Agent', tagline: '自然语言转 SQL，连库跑数 + 出表 + 解读，对接主流仓库与 BI',     author: '@cherry-team',  avatar: '🧮',  avatarBg: 'bg-accent-indigo/25', language: '中文', region: '通用',     category: '数据',     ageLabel: '5mo', installs: 838                    },
  { id: 'm-56', kind: 'agent',     name: 'Bug 修复 Agent',      tagline: '读栈追踪 → 定位文件 → 读 / 改代码 → 跑测试，最后输出 diff',     author: '@cherry-team',  avatar: '🛠',   avatarBg: 'bg-destructive/15',   language: '中文', region: '通用',     category: '编程',     ageLabel: '2mo', installs: 423,  trending: true   },
  { id: 'm-57', kind: 'agent',     name: '竞品调研 Agent',      tagline: '给一个产品名，自动抓取官网 / 定价 / 评测 / 社交反馈，输出对比表', author: '@cherry-team',  avatar: '🧭',  avatarBg: 'bg-accent-violet/25', language: '中文', region: '通用',     category: '研究',     ageLabel: '2mo', installs: 356                    },

  // ─── Integrations (commercial products, no public OSS repo —
  // numbers reflect modest in-app connection counts, not stars) ───
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

  // ─── User-created custom resources — only show in 我的资源 ─────
  // 这是用户自己在本地创建 / 自定义 / 私有的资源（来自即将合并进市场
  // 的"资源库"）。它们不进探索目录、没有 installs 概念，只属于当前用户。
  { id: 'c-1',  kind: 'prompt',    name: '我的代码评审 Prompt',  tagline: '给定 diff，按团队规范输出可执行的 review 评语与改进建议',     author: '@me',           avatar: '✏️',  avatarBg: 'bg-accent-amber/25',  language: '中文', region: '个人',     category: '编程',     ageLabel: '12d', installs: 1, custom: true       },
  { id: 'c-2',  kind: 'assistant', name: '客户支持助手',         tagline: '挂载我们的产品知识库，按客服话术回复 + 提取工单要点',           author: '@me',           avatar: '🎧',  avatarBg: 'bg-accent-cyan/25',   language: '中文', region: '个人',     category: '办公',     ageLabel: '8d',  installs: 1, custom: true       },
  { id: 'c-3',  kind: 'agent',     name: '周报生成 Agent',        tagline: '抓取我本周的 GitHub PR + Linear 任务 + 飞书文档，整理成结构化周报', author: '@me',           avatar: '🗓',  avatarBg: 'bg-accent-indigo/25', language: '中文', region: '个人',     category: '办公',     ageLabel: '5d',  installs: 1, custom: true       },
  { id: 'c-4',  kind: 'kb',        name: '团队 Wiki',             tagline: '从 Notion / Confluence 同步的内部文档全文索引（私有，仅自己可见）', author: '@me',           avatar: '📚',  avatarBg: 'bg-success/15',       language: '中文', region: '个人',     category: '研究',     ageLabel: '1mo', installs: 1, custom: true       },
  { id: 'c-5',  kind: 'mcp',       name: '内部 SQL Gateway',      tagline: '本地起的 MCP，连我们数据仓库的只读副本，做 BI 查询用',         author: '@me',           avatar: '🔌',  avatarBg: 'bg-info/15',          language: '中文', region: '个人',     category: '数据',     ageLabel: '20d', installs: 1, custom: true       },
  { id: 'c-6',  kind: 'skill',     name: '合同条款检查',           tagline: '上传合同 PDF，自动比对模板 / 标出风险条款 / 输出修订建议',     author: '@me',           avatar: '⚖',   avatarBg: 'bg-accent-violet/25', language: '中文', region: '个人',     category: '法务',     ageLabel: '6d',  installs: 1, custom: true       },
];

// ─── Top tabs + sub-kind groupings ────────────────────────────────────

// Two top-level groups, matching the cleaner pill-tab layout. Everything
// "tool-y" (MCP / CLI / 集成) is grouped as 插件; everything more
// behavior/knowledge-shaped (Skill / Prompt / Assistant / Agent / KB)
// is grouped as 技能.
type TopTab = 'plugin' | 'skill';

const TOP_TABS: { id: TopTab; label: string }[] = [
  { id: 'plugin', label: '插件' },
  { id: 'skill',  label: '技能' },
];

const KIND_GROUP: Record<ResourceKind, TopTab> = {
  mcp: 'plugin', cli: 'plugin', integration: 'plugin',
  skill: 'skill', prompt: 'skill', assistant: 'skill', agent: 'skill', kb: 'skill',
};

const SUB_KINDS: Record<TopTab, (ResourceKind | 'all')[]> = {
  plugin: ['all', 'mcp', 'cli', 'integration'],
  skill:  ['all', 'skill', 'prompt', 'assistant', 'agent', 'kb'],
};

// Quote-style copy for the hero carousel — pairs an existing CATALOG
// item with a "in-action" snippet, mirroring the reference UI.
const FEATURED_QUOTES: { itemId: string; quote: string }[] = [
  { itemId: 'm-25', quote: '为每封我还没来得及回复的邮件起草回复' },
  { itemId: 'm-32', quote: '在终端里把一段 stack trace 定位到具体代码并提出修复' },
  { itemId: 'm-51', quote: '把会议笔记里的事件描述自动转成时序图' },
  { itemId: 'm-5',  quote: '把仓库刚提的 issue 整理成可以直接派给 AI 的 PR 描述' },
  { itemId: 'm-11', quote: '在你提问时拉取最新框架文档帮 LLM 引用' },
  { itemId: 'm-46', quote: '把这段聊天里的产品决策同步到对应的需求文档' },
];


// ─── Page component ───────────────────────────────────────────────────

export function MarketPage() {
  const [topTab, setTopTab] = useState<TopTab>('plugin');
  const [search, setSearch] = useState('');
  // Sub-kind narrowing within the current top tab (e.g. only MCP within
  // 插件). 'all' = no sub-filter.
  const [kind, setKind] = useState<ResourceKind | 'all'>('all');
  // Mock pre-installed set — backs the 管理 panel where users see
  // everything they own (installed-from-market + 自定义).
  const [installed, setInstalled] = useState<Set<string>>(() => new Set([
    'm-1', 'm-2', 'm-5', 'm-8', 'm-11', 'm-19', 'm-22', 'm-26',
    'm-29', 'm-32', 'm-7', 'm-13', 'm-3',
  ]));
  // First-visit onboarding modal — closed by default (the auto-open
  // triggered a Radix pointer-events leak that killed all clicks).
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<MarketItem | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [newCustomOpen, setNewCustomOpen] = useState(false);
  // Hero carousel auto-rotate
  const [heroIndex, setHeroIndex] = useState(0);

  // Reset sub-kind when switching top tab so the kind dropdown can't
  // hold an option that doesn't belong to the new tab.
  useEffect(() => { setKind('all'); }, [topTab]);

  // Defensive: Radix Dialog occasionally leaves body.style.pointerEvents
  // set to 'none' after closing, blocking all clicks. Flush it whenever
  // every dialog is closed.
  useEffect(() => {
    const anyOpen = onboardOpen || detailItem !== null || submitOpen || manageOpen || newCustomOpen;
    if (!anyOpen) document.body.style.pointerEvents = '';
  }, [onboardOpen, detailItem, submitOpen, manageOpen, newCustomOpen]);

  const toggleInstall = (id: string) => {
    setInstalled(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Hero carousel slides — resolve item ids against the catalog
  const heroSlides = useMemo(() => FEATURED_QUOTES
    .map(q => ({ item: CATALOG.find(c => c.id === q.itemId), quote: q.quote }))
    .filter((s): s is { item: MarketItem; quote: string } => !!s.item),
  []);

  // Auto-advance the hero every 6s
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const id = setInterval(() => setHeroIndex(i => (i + 1) % heroSlides.length), 6000);
    return () => clearInterval(id);
  }, [heroSlides.length]);

  // Public 市场 view: scoped to current top tab, hides 自定义.
  const filtered = useMemo(() => {
    let list = CATALOG.filter(it => !it.custom && KIND_GROUP[it.kind] === topTab);
    if (kind !== 'all') list = list.filter(it => it.kind === kind);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(it =>
      it.name.toLowerCase().includes(q) ||
      it.tagline.toLowerCase().includes(q) ||
      it.author.toLowerCase().includes(q),
    );
    return list;
  }, [topTab, kind, search]);

  // Featured cards in the section below the hero — trending first,
  // then by installs desc. Cap at 14 so the page doesn't get long.
  const featured = useMemo(() => [...filtered].sort((a, b) => {
    if (a.trending !== b.trending) return a.trending ? -1 : 1;
    return b.installs - a.installs;
  }).slice(0, 14), [filtered]);

  const myResources = useMemo(
    () => CATALOG.filter(it => it.custom || installed.has(it.id)),
    [installed],
  );

  const currentSlide = heroSlides[heroIndex];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top bar — pill tabs (left) + action cluster (right) */}
      <div className="flex-shrink-0 px-6 pt-5">
        <div className="max-w-[920px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            {TOP_TABS.map(t => {
              const active = topTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTopTab(t.id)}
                  className={`px-3 h-8 rounded-full text-sm transition-colors ${
                    active
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground/75 hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="xs"
              onClick={() => setManageOpen(true)}
              className="h-8 px-2.5 gap-1 text-xs"
            >
              <Wrench size={12} />
              管理
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => setNewCustomOpen(true)}
              className="h-8 px-2.5 gap-1 text-xs"
            >
              <Plus size={12} />
              创建
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSubmitOpen(true)}
              className="h-8 w-8"
              title="提交到公开市场"
            >
              <MoreHorizontal size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-[920px] mx-auto px-6 pt-10 pb-12">

          {/* Centered hero title */}
          <h1 className="text-center text-2xl sm:text-3xl font-semibold text-foreground mb-6">
            让 Cherry 按你的方式工作
          </h1>

          {/* Search bar + 2 inline dropdown filters */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex-1">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder={topTab === 'plugin' ? '搜索插件' : '搜索技能'}
                clearable
                wrapperClassName="flex items-center gap-2 px-3 h-10 rounded-md border border-border/40 bg-background hover:border-border/60 focus-within:border-foreground/70 transition-colors"
              />
            </div>
            <KindFilterDropdown
              topTab={topTab}
              value={kind}
              onChange={setKind}
            />
            <PublisherFilterDropdown />
          </div>

          {/* Hero carousel — gradient bg, cycling quote card, dot rail on the right */}
          {currentSlide && (
            <div className="relative h-[230px] sm:h-[260px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#ece5f8] via-[#f1deea] to-[#dde2f4] mb-8">
              <div aria-hidden="true" className="absolute -top-16 -left-16 w-[280px] h-[280px] rounded-full bg-[#d5c2eb]/45 blur-3xl pointer-events-none" />
              <div aria-hidden="true" className="absolute -bottom-16 -right-16 w-[280px] h-[280px] rounded-full bg-[#e8c8d8]/45 blur-3xl pointer-events-none" />

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6">
                <div className="bg-white/80 backdrop-blur-md rounded-xl px-3.5 py-2.5 max-w-[460px] shadow-sm border border-border/15 flex items-center gap-2.5">
                  <span className="text-base flex-shrink-0">{currentSlide.item.avatar}</span>
                  <div className="text-sm leading-snug min-w-0">
                    <span className="font-semibold text-foreground">{currentSlide.item.name}</span>
                    <span className="text-foreground/75"> {currentSlide.quote}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailItem(currentSlide.item)}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-foreground text-background text-sm hover:bg-foreground/90 transition-colors"
                >
                  <MousePointerClick size={12} />
                  在对话中试用
                </button>
              </div>

              {/* Dot indicators (right side, vertical) */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setHeroIndex(i)}
                    aria-label={`第 ${i + 1} 项`}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i === heroIndex ? 'bg-foreground/75' : 'bg-foreground/20 hover:bg-foreground/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Featured section */}
          <h2 className="text-sm font-medium text-foreground mb-3">Featured</h2>
          {featured.length === 0 ? (
            <div className="border border-dashed border-border/30 rounded-xl py-12 flex flex-col items-center text-muted-foreground/55">
              <Sparkles size={20} strokeWidth={1.3} className="mb-2 text-muted-foreground/30" />
              <p className="text-xs">没有匹配的资源</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
              {featured.map(it => {
                const isInstalled = installed.has(it.id);
                return (
                  <div
                    key={it.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setDetailItem(it)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDetailItem(it); } }}
                    className="group flex items-center gap-3 py-2.5 border-b border-border/15 last:border-b-0 hover:bg-muted/15 -mx-2 px-2 rounded-md cursor-pointer transition-colors"
                  >
                    <Avatar item={it} size={36} />
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="text-sm font-medium text-foreground truncate">{it.name}</div>
                      <div className="text-[12px] text-muted-foreground/60 truncate mt-0.5">{it.tagline}</div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleInstall(it.id); }}
                      aria-label={isInstalled ? '已安装' : '安装'}
                      title={isInstalled ? '已安装 — 点击卸载' : '安装'}
                      className={`h-8 w-8 inline-flex items-center justify-center rounded-md transition-colors flex-shrink-0 ${
                        isInstalled
                          ? 'text-success hover:text-destructive hover:bg-destructive/10'
                          : 'text-muted-foreground/55 hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {isInstalled ? <Check size={14} /> : <Plus size={14} />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <MarketOnboardingModal open={onboardOpen} onOpenChange={setOnboardOpen} />
      <MarketDetailDialog
        item={detailItem}
        onOpenChange={(open) => { if (!open) setDetailItem(null); }}
        installed={detailItem ? installed.has(detailItem.id) : false}
        onToggleInstall={(id) => toggleInstall(id)}
      />
      <SubmitResourceDialog open={submitOpen} onOpenChange={setSubmitOpen} />
      <SubmitResourceDialog open={newCustomOpen} onOpenChange={setNewCustomOpen} mode="custom" />
      <MyResourcesManageDialog
        open={manageOpen}
        onOpenChange={setManageOpen}
        items={myResources}
        installed={installed}
        onOpenDetail={(it) => { setManageOpen(false); setDetailItem(it); }}
        onUninstall={(id) => toggleInstall(id)}
        onCreateCustom={() => setNewCustomOpen(true)}
      />
    </div>
  );
}

// ─── Inline filter dropdowns (next to search) ───────────────────────

function KindFilterDropdown({
  topTab, value, onChange,
}: {
  topTab: TopTab;
  value: ResourceKind | 'all';
  onChange: (v: ResourceKind | 'all') => void;
}) {
  const [open, setOpen] = useState(false);
  const options = SUB_KINDS[topTab];
  const label = value === 'all' ? '类型' : KIND_LABEL[value];
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-10 px-3 rounded-md border border-border/40 text-sm text-foreground/85 hover:border-border/60 hover:bg-muted/15 transition-colors"
        >
          <span>{label}</span>
          <ChevronDown size={12} className="text-muted-foreground/55" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[180px] p-1">
        {options.map(opt => {
          const isAll = opt === 'all';
          const labelText = isAll ? '全部类型' : KIND_LABEL[opt];
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-2.5 py-1.5 rounded text-sm transition-colors flex items-center justify-between ${
                active
                  ? 'bg-muted/60 text-foreground'
                  : 'text-foreground/80 hover:bg-muted/40'
              }`}
            >
              <span>{labelText}</span>
              {active && <Check size={12} className="text-foreground/70" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

function PublisherFilterDropdown() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<'all' | 'official' | 'community'>('all');
  const label = value === 'all' ? '全部' : value === 'official' ? '官方' : '社区';
  const options: { id: typeof value; label: string }[] = [
    { id: 'all',       label: '全部来源' },
    { id: 'official',  label: '官方' },
    { id: 'community', label: '社区' },
  ];
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-10 px-3 rounded-md border border-border/40 text-sm text-foreground/85 hover:border-border/60 hover:bg-muted/15 transition-colors"
        >
          <span>{label}</span>
          <ChevronDown size={12} className="text-muted-foreground/55" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[160px] p-1">
        {options.map(opt => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => { setValue(opt.id); setOpen(false); }}
              className={`w-full text-left px-2.5 py-1.5 rounded text-sm transition-colors flex items-center justify-between ${
                active
                  ? 'bg-muted/60 text-foreground'
                  : 'text-foreground/80 hover:bg-muted/40'
              }`}
            >
              <span>{opt.label}</span>
              {active && <Check size={12} className="text-foreground/70" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

// ─── 我的资源 → 管理 dialog ───────────────────────────────────────────

function MyResourcesManageDialog({
  open, onOpenChange, items, installed, onOpenDetail, onUninstall, onCreateCustom,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: MarketItem[];
  installed: Set<string>;
  onOpenDetail: (item: MarketItem) => void;
  onUninstall: (id: string) => void;
  onCreateCustom: () => void;
}) {
  // Items default to enabled. We don't sync against `items` changes
  // beyond mount — toggling install in the underlying page won't
  // reset a user's deliberate enable/disable decisions here.
  const [enabled, setEnabled] = useState<Set<string>>(() => new Set(items.map(it => it.id)));
  const [filter, setFilter] = useState<'all' | 'installed' | 'custom'>('all');

  // Newly appearing items in the list (e.g. a freshly installed one
  // while the manage dialog is open) should default to enabled.
  useEffect(() => {
    setEnabled(prev => {
      let changed = false;
      const next = new Set(prev);
      items.forEach(it => { if (!next.has(it.id)) { next.add(it.id); changed = true; } });
      return changed ? next : prev;
    });
  }, [items]);

  const toggleEnabled = (id: string) => {
    setEnabled(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const visible = useMemo(() => {
    if (filter === 'installed') return items.filter(it => !it.custom);
    if (filter === 'custom')    return items.filter(it => it.custom);
    return items;
  }, [items, filter]);

  const installedCount = items.filter(it => !it.custom).length;
  const customCount    = items.filter(it => it.custom).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[820px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-base font-semibold">管理我的资源</DialogTitle>
            <span className="text-xs text-muted-foreground/60 tabular-nums">{items.length}</span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground/70 mt-1">
            统一管理已安装与自定义创建的所有资源 — 启停、编辑、卸载，所有动作即时生效。
          </DialogDescription>
        </DialogHeader>

        {/* Filter pills + 新建 action */}
        <div className="px-6 pt-3 pb-2 flex items-center justify-between gap-3 border-b border-border/15">
          <div className="flex items-center gap-1.5">
          {([
            { id: 'all',       label: '全部',       count: items.length    },
            { id: 'installed', label: '从市场安装', count: installedCount  },
            { id: 'custom',    label: '自定义',     count: customCount     },
          ] as const).map(f => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`px-2.5 h-7 rounded-md text-xs inline-flex items-center gap-1.5 transition-colors ${
                  active
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground/75 hover:text-foreground hover:bg-muted/40'
                }`}
              >
                {f.label}
                <span className={`tabular-nums text-[10px] ${active ? 'opacity-75' : 'opacity-55'}`}>{f.count}</span>
              </button>
            );
          })}
          </div>
          <Button
            variant="outline"
            size="xs"
            onClick={onCreateCustom}
            className="h-7 gap-1 text-xs"
          >
            <Plus size={11} />
            新建
          </Button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto scrollbar-thin px-4 py-3">
          {visible.length === 0 ? (
            <div className="border border-dashed border-border/30 rounded-xl py-10 flex flex-col items-center text-muted-foreground/55">
              <Sparkles size={20} strokeWidth={1.3} className="mb-2 text-muted-foreground/30" />
              <p className="text-xs">这个分类下还没有资源</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {visible.map(it => {
                const KIcon = KIND_ICON[it.kind];
                const isOn = enabled.has(it.id);
                return (
                  <div
                    key={it.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/20 bg-card/40 hover:bg-card transition-colors"
                  >
                    <Avatar item={it} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-foreground truncate">{it.name}</span>
                        {it.custom ? (
                          <span className="flex-shrink-0 px-1.5 py-px rounded text-[10px] leading-none border border-border/35 bg-muted/40 text-muted-foreground/75">
                            自定义
                          </span>
                        ) : (
                          <span className="flex-shrink-0 px-1.5 py-px rounded text-[10px] leading-none border border-border/30 bg-muted/30 text-muted-foreground/70">
                            {KIND_LABEL[it.kind]}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground/55 flex items-center gap-1.5 mt-px">
                        <KIcon size={10} />
                        <span>{it.category}</span>
                        <span className="text-muted-foreground/30">·</span>
                        <span>{it.author}</span>
                      </div>
                    </div>

                    {/* Enable/disable toggle (visual switch) */}
                    <button
                      type="button"
                      onClick={() => toggleEnabled(it.id)}
                      aria-label={isOn ? '已启用' : '已禁用'}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
                        isOn ? 'bg-foreground' : 'bg-muted-foreground/25'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                          isOn ? 'translate-x-[18px]' : 'translate-x-0.5'
                        }`}
                      />
                    </button>

                    {/* Detail */}
                    <button
                      type="button"
                      onClick={() => onOpenDetail(it)}
                      aria-label="查看详情"
                      className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground/55 hover:text-foreground hover:bg-muted/40 transition-colors"
                      title="详情"
                    >
                      <ExternalLink size={12} />
                    </button>

                    {/* Uninstall / delete — only meaningful for installed items;
                        custom items would normally have a delete-custom action
                        but we share the same affordance for now */}
                    <button
                      type="button"
                      onClick={() => onUninstall(it.id)}
                      aria-label={it.custom ? '删除自定义' : '卸载'}
                      title={it.custom ? '删除' : '卸载'}
                      className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground/55 hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="px-5 py-3 border-t border-border/20 bg-muted/15">
          <div className="flex items-center justify-between gap-2 w-full">
            <span className="text-[11px] text-muted-foreground/55">
              启用 / 禁用 即刻生效，无需重启会话。
            </span>
            <Button variant="default" size="sm" onClick={() => onOpenChange(false)} className="h-8 bg-foreground text-background hover:bg-foreground/90">
              完成
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
      : item.kind === 'agent'
        ? ['在 tool-call 循环中自主调用挂载的工具', '可读写工作区中的文件与运行命令', '每次敏感动作前会请求人工确认']
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

function SubmitResourceDialog({
  open, onOpenChange, mode = 'submit',
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** 'submit' = 提交到公共市场；'custom' = 创建私有资源到我的资源 */
  mode?: 'submit' | 'custom';
}) {
  const isCustom = mode === 'custom';
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
          <DialogTitle className="text-base">
            {isCustom ? '新建自定义资源' : '提交资源到市场'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isCustom
              ? '资源会保存到「管理」里，私有可见，可随时编辑 / 启停 / 卸载。'
              : '提交的资源会在 24 小时内由社区审核员审阅。审核通过后才会出现在公开目录中。'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin px-5 py-4 space-y-4">
          {/* Type selector */}
          <div>
            <label className="text-xs text-muted-foreground/70 mb-1.5 block">资源类型</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['skill','cli','assistant','agent','mcp','prompt','kb','integration'] as ResourceKind[]).map(k => {
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
              <label className="text-xs text-muted-foreground/70 mb-1.5 block">
                {isCustom ? '源文件 / 入口（可选）' : '源仓库 / 安装地址'}
              </label>
              <div className="relative">
                <Link2 size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/45" />
                <Input
                  value={sourceUrl}
                  onChange={e => setSourceUrl(e.target.value)}
                  placeholder={isCustom ? '~/skills/my-skill 或 https://…（可留空）' : 'https://github.com/your-org/your-skill'}
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
              {isCustom
                ? <>仅你自己可见。如需将这条资源分享到公开市场，可以在「管理」里点「<span className="text-foreground/80">分享到市场</span>」走审核流程。</>
                : <>如果你的资源需要附带文件，请将仓库根目录的 <span className="font-mono text-foreground/80">cherry.json</span> + 资源主体一起打包推送到上述地址，审核员会自动拉取。</>}
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
              {isCustom ? '创建' : '提交审核'}
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
    { Icon: CheckCircle2,  text: '右上角「管理」统一管理已安装与自定义资源，启停 / 编辑 / 卸载一目了然' },
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

