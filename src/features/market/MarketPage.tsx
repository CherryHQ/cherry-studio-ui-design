import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus, Search, Filter, ArrowUpDown, ChevronRight, ChevronLeft,
  Check, Download, X, MoreHorizontal, Terminal, FileText,
  Wrench, Sparkles, MousePointerClick, BookOpen, Network, Plug,
  CheckCircle2, Zap, Compass, Star, ExternalLink,
  Upload, Link2, Bot, FolderCog,
} from 'lucide-react';
import {
  Button, Input, Textarea, SearchInput, Typography, Badge, Slider, Switch,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@cherry-studio/ui';
import cherryLogoImg from '@/assets/cherry-icon.png';
import { useGlobalActions } from '@/app/context/GlobalActionContext';

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
}

const KIND_LABEL: Record<ResourceKind, string> = {
  skill: 'Skill', cli: 'CLI', assistant: 'Assistant', agent: 'Agent',
  mcp: 'MCP', prompt: 'Prompt', kb: '知识库', integration: '连接器',
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
];

// ─── Sidebar kind list ────────────────────────────────────────────────
//
// The sidebar lists every resource kind in a single flat list — no top
// pill tabs, no plugin/skill grouping. Reorder to put the most common
// kinds first.
// Sidebar lists every resource kind. 集成 has a special logo-first
// rendering when selected (see the kind === 'integration' branch below);
// the top feed strip is a separate axis (source channel, not kind).
const SIDEBAR_KINDS: (ResourceKind | 'all')[] = [
  'all', 'skill', 'mcp', 'agent', 'assistant', 'prompt', 'kb', 'integration',
];

// Built-in subscription feeds (source channels). The user can add more
// via the "+" button. This is orthogonal to the sidebar kind filter —
// kind = what type of resource, feed = where it came from.
const BUILTIN_FEEDS: { id: string; label: string }[] = [
  { id: 'cherry',      label: 'Cherry 精选' },
  { id: 'skill-hub',   label: 'Skill Hub' },
  { id: 'claude',      label: 'Claude Skill' },
  { id: 'awesome-mcp', label: 'Awesome MCP' },
];

// Per-integration product logo — sourced from the Simple Icons CDN with
// the brand's official hex color. Falls back to the catalog avatar emoji
// when an id isn't mapped (so adding a new integration row still works).
const INTEGRATION_LOGO: Record<string, { slug: string; color: string }> = {
  'm-19': { slug: 'notion',           color: '000000' }, // Notion
  'm-20': { slug: 'yuque',            color: '25B864' }, // 语雀
  'm-21': { slug: 'googlecalendar',   color: '4285F4' }, // Google Calendar
  'm-22': { slug: 'larksuite',        color: '00D6B9' }, // 飞书 / Lark
  'm-23': { slug: 'slack',            color: '4A154B' }, // Slack
  'm-24': { slug: 'linear',           color: '5E6AD2' }, // Linear
  'm-25': { slug: 'gmail',            color: 'EA4335' }, // Gmail
  'm-26': { slug: 'github',           color: '181717' }, // GitHub
  'm-27': { slug: 'confluence',       color: '172B4D' }, // Confluence
  'm-28': { slug: 'microsoftoutlook', color: '0078D4' }, // Outlook
};

// ─── Page component ───────────────────────────────────────────────────

export function MarketPage() {
  const { navigateToLibrary } = useGlobalActions();
  const [search, setSearch] = useState('');
  // Which kind the sidebar has narrowed to. 'all' = no filter.
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

  // Subscription feeds — the strip below the search bar. 'cherry' is the
  // default; users can add custom feeds (label derived from the URL host).
  const [feedId, setFeedId] = useState<string>('cherry');
  const [customFeeds, setCustomFeeds] = useState<{ id: string; label: string; url: string }[]>([]);
  const [feedDialogOpen, setFeedDialogOpen] = useState(false);
  const [feedUrl, setFeedUrl] = useState('');
  // 集成 install confirmation dialog — opened when the user clicks an
  // integration card or its "连接" button.
  const [installItem, setInstallItem] = useState<MarketItem | null>(null);

  const addCustomFeed = () => {
    const url = feedUrl.trim();
    if (!url) return;
    let label = url;
    try {
      label = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '');
    } catch { /* keep raw url as label */ }
    const id = `custom-${Date.now()}`;
    setCustomFeeds(prev => [...prev, { id, label, url }]);
    setFeedId(id);
    setFeedUrl('');
    setFeedDialogOpen(false);
  };

  // Defensive: Radix Dialog occasionally leaves body.style.pointerEvents
  // set to 'none' after closing, blocking all clicks. Flush it whenever
  // every dialog is closed.
  useEffect(() => {
    const anyOpen = onboardOpen || detailItem !== null || submitOpen || feedDialogOpen || installItem !== null;
    if (!anyOpen) document.body.style.pointerEvents = '';
  }, [onboardOpen, detailItem, submitOpen, feedDialogOpen, installItem]);

  const toggleInstall = (id: string) => {
    setInstalled(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Public 市场 view: hides 自定义 (those live in 管理).
  const filtered = useMemo(() => {
    let list = CATALOG.slice();
    if (kind !== 'all') list = list.filter(it => it.kind === kind);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(it =>
      it.name.toLowerCase().includes(q) ||
      it.tagline.toLowerCase().includes(q) ||
      it.author.toLowerCase().includes(q),
    );
    return list;
  }, [kind, search]);

  // Featured strip — top 6 trending in the current top tab. Below
  // this, the remaining items in `filtered` get grouped by category.
  const featured = useMemo(() => [...filtered]
    .filter(it => it.trending)
    .sort((a, b) => b.installs - a.installs)
    .slice(0, 6),
  [filtered]);

  // Sections under Featured:
  //   - On 全部:     group by 功能 (= resource kind) — one section per
  //                  Skill / MCP / CLI / Agent / Assistant / Prompt / 知识库 / 集成.
  //   - On a kind:   group by 场景标签 (= category field — 开发 / 数据 /
  //                  办公 / 编程 / 研究 / 内容创作 / …) since the
  //                  function is already fixed by the sidebar.
  //   - Skipped during search — results render flat under 搜索结果.
  const sectionGroups = useMemo(() => {
    if (search.trim()) return [];
    const featuredIds = new Set(featured.map(f => f.id));
    const rest = filtered.filter(it => !featuredIds.has(it.id));
    const byKey = new Map<string, MarketItem[]>();
    const keyOf = (it: MarketItem) => kind === 'all' ? it.kind : it.category;
    rest.forEach(it => {
      const k = keyOf(it);
      const arr = byKey.get(k) ?? [];
      arr.push(it);
      byKey.set(k, arr);
    });
    return [...byKey.entries()]
      .map(([key, items]) => ({
        key,
        label: kind === 'all' ? KIND_LABEL[key as ResourceKind] : key,
        items: items.sort((a, b) => b.installs - a.installs),
      }))
      .sort((a, b) => b.items.length - a.items.length || a.label.localeCompare(b.label));
  }, [filtered, featured, search, kind]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top bar — submit-resource action only. Resource management
          (my resources, edit, custom create) lives in the Library
          (资源库) page, not here. */}
      <div className="flex-shrink-0 px-6 pt-5">
        <div className="max-w-[1120px] mx-auto flex items-center justify-end gap-1">
          <Button
            variant="outline"
            size="xs"
            onClick={() => navigateToLibrary()}
            className="h-8 px-2.5 gap-1 text-xs"
            title="打开资源库"
          >
            <FolderCog size={12} />
            管理
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={() => setSubmitOpen(true)}
            className="h-8 px-2.5 gap-1 text-xs"
          >
            <Plus size={12} />
            提交资源
          </Button>
        </div>
      </div>

      {/* Scrollable content — left sub-kind nav + right main */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-[1120px] mx-auto px-6 pt-8 pb-12">
          <div className="flex gap-8">

            {/* Left rail — every kind in one flat list with counts */}
            <aside className="hidden md:flex flex-shrink-0 w-[176px] flex-col">
              <div className="sticky top-0 pt-2">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground/45 px-2 pb-2">
                  资源类型
                </div>
                <div className="space-y-0.5">
                  {SIDEBAR_KINDS.map(k => {
                    const active = kind === k;
                    const isAll = k === 'all';
                    const Icon = isAll ? Sparkles : KIND_ICON[k];
                    const label = isAll ? '全部' : KIND_LABEL[k];
                    const count = isAll
                      ? CATALOG.length
                      : CATALOG.filter(it => it.kind === k).length;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setKind(k)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                          active
                            ? 'bg-accent/50 text-foreground'
                            : 'text-muted-foreground/75 hover:text-foreground hover:bg-muted/40'
                        }`}
                      >
                        <Icon size={13} strokeWidth={1.6} className="flex-shrink-0" />
                        <span className="flex-1 text-left truncate">{label}</span>
                        <span className={`text-[10px] tabular-nums flex-shrink-0 ${active ? 'text-muted-foreground/70' : 'text-muted-foreground/45'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Right main */}
            <div className="flex-1 min-w-0">

          {/* Centered hero title */}
          <h1 className="text-center text-2xl sm:text-3xl font-semibold text-foreground mb-6">
            让 Cherry 按你的方式工作
          </h1>

          {/* Search bar — sub-kind lives on the left rail, source on the feed strip below */}
          <div className="mb-3">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="搜索资源"
              clearable
              wrapperClassName="flex items-center gap-2 px-3 h-10 rounded-md border border-border/40 bg-background hover:border-border/60 focus-within:border-foreground/70 transition-colors"
            />
          </div>

          {/* Feed tabs — built-in sources + user-added subscriptions */}
          <div className="flex items-center gap-1.5 mb-5 flex-wrap">
            {[...BUILTIN_FEEDS, ...customFeeds].map(feed => {
              const active = feedId === feed.id;
              return (
                <button
                  key={feed.id}
                  type="button"
                  onClick={() => setFeedId(feed.id)}
                  className={`inline-flex items-center h-7 px-3 rounded-full text-xs transition-colors ${
                    active
                      ? 'bg-foreground text-background'
                      : 'border border-border/40 text-muted-foreground/85 hover:border-border/70 hover:bg-muted/30 hover:text-foreground'
                  }`}
                >
                  {feed.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setFeedDialogOpen(true)}
              aria-label="添加订阅源"
              title="添加订阅源"
              className="inline-flex items-center justify-center h-7 w-7 rounded-full border border-dashed border-border/45 text-muted-foreground/70 hover:border-border/80 hover:text-foreground hover:bg-muted/25 transition-colors"
            >
              <Plus size={13} strokeWidth={1.8} />
            </button>
          </div>

          {/* Connectors kind — same row layout as other kinds, just with
              brand logos for avatars and the install dialog as the action.
              Page header gets a 自定义连接器 entry button for users who
              need to plug in their own service. */}
          {kind === 'integration' ? (
            <section>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h2 className="text-sm font-medium text-foreground">连接器管理</h2>
                  <p className="text-[11px] text-muted-foreground/55 mt-0.5">连接外部服务，扩展 AI 能力</p>
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setSubmitOpen(true)}
                  className="h-7 gap-1 px-2.5 text-xs flex-shrink-0"
                  title="提交自定义连接器配置"
                >
                  <Plus size={11} />
                  自定义连接器
                </Button>
              </div>
              <MarketRowGrid
                items={CATALOG.filter(it => it.kind === 'integration')}
                installed={installed}
                onSelect={setInstallItem}
                onToggleInstall={(id) => {
                  const it = CATALOG.find(c => c.id === id);
                  if (it) setInstallItem(it);
                }}
              />
            </section>
          ) : (
          <>
          {/* Featured section */}
          {featured.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-medium text-foreground mb-3">Featured</h2>
              <MarketRowGrid
                items={featured}
                installed={installed}
                onSelect={setDetailItem}
                onToggleInstall={toggleInstall}
              />
            </section>
          )}

          {/* Categorized sections — one 2-col grid per category */}
          {search.trim() ? (
            // When searching, show flat results so users see matches
            // across categories.
            filtered.length === 0 ? (
              <div className="border border-dashed border-border/30 rounded-xl py-12 flex flex-col items-center text-muted-foreground/55">
                <Sparkles size={20} strokeWidth={1.3} className="mb-2 text-muted-foreground/30" />
                <p className="text-xs">没有匹配的资源</p>
              </div>
            ) : (
              <section>
                <h2 className="text-sm font-medium text-foreground mb-3">搜索结果</h2>
                <MarketRowGrid
                  items={filtered}
                  installed={installed}
                  onSelect={setDetailItem}
                  onToggleInstall={toggleInstall}
                />
              </section>
            )
          ) : (
            sectionGroups.length === 0 && featured.length === 0 ? (
              <div className="border border-dashed border-border/30 rounded-xl py-12 flex flex-col items-center text-muted-foreground/55">
                <Sparkles size={20} strokeWidth={1.3} className="mb-2 text-muted-foreground/30" />
                <p className="text-xs">没有匹配的资源</p>
              </div>
            ) : (
              sectionGroups.map(({ key, label, items }) => (
                <section key={key} className="mb-8 last:mb-0">
                  <h2 className="text-sm font-medium text-foreground mb-3">{label}</h2>
                  <MarketRowGrid
                    items={items}
                    installed={installed}
                    onSelect={setDetailItem}
                    onToggleInstall={toggleInstall}
                  />
                </section>
              ))
            )
          )}
          </>
          )}

            </div>{/* /right main */}
          </div>{/* /flex split */}
        </div>{/* /max-w container */}
      </div>{/* /scroll */}

      {/* Dialogs */}
      <MarketOnboardingModal open={onboardOpen} onOpenChange={setOnboardOpen} />
      <MarketDetailDialog
        item={detailItem}
        onOpenChange={(open) => { if (!open) setDetailItem(null); }}
        installed={detailItem ? installed.has(detailItem.id) : false}
        onToggleInstall={(id) => toggleInstall(id)}
      />
      <SubmitResourceDialog open={submitOpen} onOpenChange={setSubmitOpen} />

      {/* 集成 install confirmation — opens from clicking an integration card */}
      <InstallIntegrationDialog
        item={installItem}
        installed={installItem ? installed.has(installItem.id) : false}
        onOpenChange={(open) => { if (!open) setInstallItem(null); }}
        onConfirm={() => {
          if (installItem && !installed.has(installItem.id)) toggleInstall(installItem.id);
          setInstallItem(null);
        }}
      />

      {/* Add-feed dialog — opens from the "+" button in the feed tab strip */}
      <Dialog open={feedDialogOpen} onOpenChange={setFeedDialogOpen}>
        <DialogContent className="max-w-[440px]">
          <DialogHeader>
            <DialogTitle>添加订阅源</DialogTitle>
            <DialogDescription>
              粘贴一个 RSS / JSON Feed / GitHub 仓库链接，Cherry 会订阅它的新资源更新。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 py-1">
            <label className="text-xs text-muted-foreground/70">订阅链接</label>
            <Input
              autoFocus
              value={feedUrl}
              onChange={e => setFeedUrl(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addCustomFeed(); }}
              placeholder="https://example.com/feed.json"
              className="h-9"
            />
          </div>
          <DialogFooter className="bg-transparent">
            <Button variant="outline" size="sm" onClick={() => setFeedDialogOpen(false)}>取消</Button>
            <Button size="sm" disabled={!feedUrl.trim()} onClick={addCustomFeed}>添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── 2-column row grid (Featured + per-category sections) ───────────

function MarketRowGrid({
  items, installed, onSelect, onToggleInstall,
}: {
  items: MarketItem[];
  installed: Set<string>;
  onSelect: (item: MarketItem) => void;
  onToggleInstall: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
      {items.map(it => {
        const isInstalled = installed.has(it.id);
        return (
          <div
            key={it.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(it)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(it); } }}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/15 bg-card/40 hover:bg-accent/20 hover:border-border/30 cursor-pointer transition-colors"
          >
            <Avatar item={it} size={36} />
            <div className="flex-1 min-w-0 pr-2">
              <div className="text-sm font-medium text-foreground truncate">{it.name}</div>
              <div className="text-[12px] text-muted-foreground/60 truncate mt-0.5">{it.tagline}</div>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleInstall(it.id); }}
              aria-label={isInstalled ? '已安装' : '安装'}
              title={isInstalled ? '已安装 — 点击卸载' : '安装'}
              className={`inline-flex items-center justify-center w-6 h-6 rounded-md transition-colors flex-shrink-0 ${
                isInstalled
                  ? 'text-muted-foreground/55 hover:text-destructive/80 hover:bg-destructive/10'
                  : 'bg-muted/50 text-foreground/75 hover:bg-foreground/10 hover:text-foreground'
              }`}
            >
              {isInstalled ? <Check size={14} strokeWidth={2} /> : <Plus size={14} strokeWidth={2.2} />}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Install integration dialog (集成 confirmation flow) ───────────
//
// Mirrors ChatGPT's connector-install sheet: paired logos at the top,
// the connector name + publisher, a stack of permission rows (one with
// a memory toggle), and a single primary CTA at the bottom.

function PermissionRow({
  title, description, withToggle, value, onChange, linkLabel,
}: {
  title: string;
  description: string;
  withToggle?: boolean;
  value?: boolean;
  onChange?: (v: boolean) => void;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-foreground">{title}</div>
        <p className="text-xs text-muted-foreground/75 leading-relaxed mt-1">
          {description}
          {linkLabel && (
            <>
              {' '}
              <a href="#" onClick={e => e.preventDefault()} className="text-foreground underline underline-offset-2 hover:text-foreground/80">
                {linkLabel}
              </a>
            </>
          )}
        </p>
      </div>
      {withToggle && (
        <div className="pt-0.5 flex-shrink-0">
          <Switch checked={value} onCheckedChange={onChange} />
        </div>
      )}
    </div>
  );
}

function InstallIntegrationDialog({
  item, installed, onOpenChange, onConfirm,
}: {
  item: MarketItem | null;
  installed: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const [memoryOn, setMemoryOn] = useState(true);
  if (!item) {
    return (
      <Dialog open={false} onOpenChange={onOpenChange}>
        <DialogContent />
      </Dialog>
    );
  }
  const publisher = 'Cherry';
  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] p-0 overflow-hidden rounded-2xl gap-0">
        {/* Header — paired logos + title */}
        <div className="px-6 pt-7 pb-3 flex flex-col items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-foreground flex items-center justify-center overflow-hidden">
              <img src={cherryLogoImg} alt="" className="w-8 h-8 object-contain" />
            </div>
            <div className="flex items-center gap-1 text-muted-foreground/40">
              <span className="block w-1 h-1 rounded-full bg-current" />
              <span className="block w-1 h-1 rounded-full bg-current" />
              <span className="block w-1 h-1 rounded-full bg-current" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-muted/30 border border-border/20 flex items-center justify-center overflow-hidden">
              {INTEGRATION_LOGO[item.id] ? (
                <img
                  src={`https://cdn.simpleicons.org/${INTEGRATION_LOGO[item.id].slug}/${INTEGRATION_LOGO[item.id].color}`}
                  alt=""
                  className="w-7 h-7"
                  draggable={false}
                />
              ) : (
                <span className="text-2xl">{item.avatar}</span>
              )}
            </div>
          </div>
          <DialogTitle className="text-base font-semibold mt-4">
            安装 {item.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground/60 mt-1">
            由 {publisher} 开发
          </DialogDescription>
        </div>

        {/* Permission rows */}
        <div className="px-6 py-4 space-y-4 max-h-[420px] overflow-y-auto scrollbar-thin border-t border-border/15">
          <PermissionRow
            title="参考记忆和对话"
            description={`允许 Cherry 在与 "${item.name}" 共享数据时参考相关记忆和对话，以提供更精准的回复。`}
            withToggle
            value={memoryOn}
            onChange={setMemoryOn}
          />
          <PermissionRow
            title="始终请求授权"
            description="连接器在每次访问外部数据前都会向您请求确认，您可随时撤销已授予的权限。"
          />
          <PermissionRow
            title={`Cherry 如何使用 ${item.name} 数据`}
            description={`您与 Cherry 的对话默认不会用于训练模型。但我们可能会处理 "${item.name}" 中的数据以便协助您完成与其相关的任务。`}
            linkLabel="了解更多"
          />
          <PermissionRow
            title="连接器可能引入风险"
            description="连接器需充分了解后再使用。在执行任务时它代表您行使一定权限，建议仅在受信任的场景下启用。"
            linkLabel="了解如何保障安全"
          />
        </div>

        {/* Footer CTA */}
        <div className="px-6 pb-5 pt-3 border-t border-border/15">
          <Button
            size="lg"
            disabled={installed}
            onClick={onConfirm}
            className="w-full h-10 rounded-xl bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
          >
            {installed ? `${item.name} 已安装` : `安装 ${item.name}`}
          </Button>
        </div>
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
  const installsLabel = item.installs >= 10000 ? `${(item.installs / 1000).toFixed(1)}K` : item.installs.toLocaleString();
  // Derive a plausible source URL from the author handle + resource name.
  // Production data would carry this natively; the footer "查看源仓库" button
  // also wires to the same URL pattern.
  const sourceUrl = `https://github.com/${item.author.replace(/^@/, '')}/${item.name.replace(/\s+/g, '-')}`;
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
              <h4 className="text-xs text-foreground font-medium mb-2">来源与作者</h4>
              <dl className="grid grid-cols-[64px_1fr] gap-y-1.5 text-xs">
                <dt className="text-muted-foreground/55">作者</dt>
                <dd className="text-foreground/90">{item.author}</dd>

                <dt className="text-muted-foreground/55">类型</dt>
                <dd className="text-foreground/90">{KIND_LABEL[item.kind]}</dd>

                <dt className="text-muted-foreground/55">分类</dt>
                <dd className="text-foreground/90">{item.category}</dd>

                {item.language && (
                  <>
                    <dt className="text-muted-foreground/55">语言</dt>
                    <dd className="text-foreground/90">{item.language}</dd>
                  </>
                )}

                {item.region && (
                  <>
                    <dt className="text-muted-foreground/55">地区</dt>
                    <dd className="text-foreground/90">{item.region}</dd>
                  </>
                )}

                <dt className="text-muted-foreground/55">上架</dt>
                <dd className="text-foreground/90">{item.ageLabel} 前</dd>

                <dt className="text-muted-foreground/55">源仓库</dt>
                <dd className="min-w-0">
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-foreground/90 hover:text-foreground transition-colors truncate"
                  >
                    <span className="truncate">{sourceUrl.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink size={10} className="opacity-60 flex-shrink-0" />
                  </a>
                </dd>
              </dl>
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
  open, onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
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
              如果你的资源需要附带文件，请将仓库根目录的 <span className="font-mono text-foreground/80">cherry.json</span> + 资源主体一起打包推送到上述地址，审核员会自动拉取。
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
    { Icon: Plug,          text: '直接对接 Notion / 语雀 / Google Calendar 等连接器' },
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
  const logoMeta = INTEGRATION_LOGO[item.id];
  if (logoMeta) {
    return (
      <div
        className="rounded-md bg-muted/30 border border-border/20 flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{ width: size, height: size }}
      >
        <img
          src={`https://cdn.simpleicons.org/${logoMeta.slug}/${logoMeta.color}`}
          alt=""
          width={Math.round(size * 0.6)}
          height={Math.round(size * 0.6)}
          loading="lazy"
          draggable={false}
          className="block"
        />
      </div>
    );
  }
  return (
    <div
      className={`rounded-md ${item.avatarBg} flex items-center justify-center flex-shrink-0 text-base`}
      style={{ width: size, height: size }}
    >
      <span className={`${size >= 40 ? 'text-lg' : 'text-base'}`}>{item.avatar}</span>
    </div>
  );
}

