// ===========================
// Agent Mock Data (physical location)
// ===========================
// Migrated from components/agent/run/mockData.ts
// Types are imported from the central type system.

import type { AgentSession, AgentChatMessage, AgentSessionData, FileNode, OutputFile } from '@/app/types/agent';
import type { WorkflowStep } from '@/app/types/chat';
import { AGENT_MODELS, MODEL_CAPABILITY_LABELS } from '@/app/config/models';

// Backward-compatible aliases

// Re-export model data for backward compatibility
export const AGENT_MODEL_CAPABILITY_LABELS = MODEL_CAPABILITY_LABELS;
export const MODELS = AGENT_MODELS;

// ===========================
// All Sessions
// ===========================

export const MOCK_SESSIONS: AgentSession[] = [
  {
    id: 'session-pdf',
    title: 'Q4 用户行为分析报告',
    agentName: '数据分析师',
    agentIcon: '📊',
    lastMessage: 'Q4 用户行为分析报告已生成，含 18 页 PDF。',
    timestamp: '15:14',
    messageCount: 7,
    status: 'completed',
    unread: true,
    pinned: true,
    tags: ['数据', 'PDF'],
    group: '成果展示',
  },
  {
    id: 'session-md',
    title: 'Cherry SDK API 文档',
    agentName: '技术文档专家',
    agentIcon: '📝',
    lastMessage: 'API 文档已生成，共 28 页 Markdown。',
    timestamp: '13:10',
    messageCount: 6,
    status: 'completed',
    pinned: true,
    tags: ['文档', 'Markdown'],
    group: '成果展示',
  },
  {
    id: 'session-slides',
    title: '2026 AI 产品趋势演示稿',
    agentName: '内容创作者',
    agentIcon: '🎯',
    lastMessage: '6 页演示稿已生成，深色现代风。',
    timestamp: '16:47',
    messageCount: 5,
    status: 'completed',
    tags: ['演示', 'HTML'],
    group: '成果展示',
  },
  {
    id: 'session-1',
    title: 'React + Vite + Tailwind 项目',
    agentName: '全栈工程师',
    agentIcon: '🛠',
    lastMessage: '已完成。Header、Footer、Card 组件已创建。',
    timestamp: '14:27',
    messageCount: 15,
    status: 'active',
    unread: true,
    pinned: true,
    tags: ['前端', 'React'],
    group: '项目开发',
  },
  {
    id: 'session-2',
    title: 'AI 应用技术选型调研报告',
    agentName: '调研分析师',
    agentIcon: '🔍',
    lastMessage: '调研报告已生成，包含 6 个框架的对比分析。',
    timestamp: '11:42',
    messageCount: 22,
    status: 'completed',
    pinned: true,
    tags: ['调研', 'AI'],
    group: '调研分析',
  },
  {
    id: 'session-3',
    title: 'Dashboard 数据看板',
    agentName: '全栈工程师',
    lastMessage: 'Recharts 图表组件和实时数据流已就绪。',
    timestamp: '昨天',
    messageCount: 38,
    status: 'completed',
    unread: true,
    pinned: false,
    tags: ['前端', '可视化'],
    group: '项目开发',
  },
  {
    id: 'session-4',
    title: '用户认证系统 (JWT + OAuth)',
    agentName: '后端工程师',
    lastMessage: '已完成 Google OAuth 和 JWT refresh token 逻辑。',
    timestamp: '昨天',
    messageCount: 28,
    status: 'completed',
    tags: ['后端', '安全'],
    group: '项目开发',
  },
  {
    id: 'session-5',
    title: 'E-commerce 产品详情页',
    agentName: '全栈工程师',
    lastMessage: '购物车、价格计算器和库存检查已完成。',
    timestamp: '2天前',
    messageCount: 19,
    status: 'completed',
    tags: ['前端', 'React'],
    group: '项目开发',
  },
  {
    id: 'session-6',
    title: 'API 性能优化方案',
    agentName: '调研分析师',
    lastMessage: '性能分析报告已输出，含 Redis 缓存和数据库索引建议。',
    timestamp: '3天前',
    messageCount: 16,
    status: 'completed',
    tags: ['调研', '性能'],
    group: '调研分析',
  },
  {
    id: 'session-7',
    title: 'CI/CD Pipeline 配置',
    agentName: '运维工程师',
    lastMessage: 'GitHub Actions + Docker 部署流程已配置完成。',
    timestamp: '上周',
    messageCount: 14,
    status: 'completed',
    tags: ['DevOps', '部署'],
    group: '运维部署',
  },
  {
    id: 'session-8',
    title: '移动端响应式适配',
    agentName: '全栈工程师',
    lastMessage: '所有断点适配和触控交互优化完成。',
    timestamp: '上周',
    messageCount: 31,
    status: 'completed',
    tags: ['前端', '移动端'],
    group: '项目开发',
  },
  {
    id: 'session-9',
    title: 'WebSocket 实时通知系统',
    agentName: '后端工程师',
    lastMessage: '连接超时，Socket.IO 服务端部署失败。',
    timestamp: '上周',
    messageCount: 25,
    status: 'error',
    unread: true,
    tags: ['后端', '实时'],
    group: '项目开发',
  },
  {
    id: 'session-10',
    title: '竞品分析：Notion vs Obsidian',
    agentName: '调研分析师',
    lastMessage: '功能对比矩阵和用户画像分析完成。',
    timestamp: '2周前',
    messageCount: 20,
    status: 'completed',
    tags: ['调研', '竞品'],
    group: '调研分析',
  },
  {
    id: 'session-11',
    title: '桌面端 Agent 产品调研',
    agentName: '调研分析师',
    lastMessage: '已扫描 12 个竞品，正在汇总功能矩阵。',
    timestamp: '10:38',
    messageCount: 34,
    status: 'active',
    kind: 'task',
    progress: 38,
    pinned: false,
    tags: ['任务', '调研'],
  },
  {
    id: 'session-12',
    title: 'React Native 跨端方案评估',
    agentName: '调研分析师',
    lastMessage: 'React Native vs Flutter 对比报告已输出，推荐 RN + Expo。',
    timestamp: '09:15',
    messageCount: 18,
    status: 'completed',
    tags: ['调研', '移动端', 'React'],
  },
  {
    id: 'session-13',
    title: '实时协作白板应用',
    agentName: '全栈工程师',
    lastMessage: 'CRDT 协作引擎和画布组件开发中。',
    timestamp: '16:52',
    messageCount: 42,
    status: 'active',
    kind: 'task',
    progress: 72,
    unread: true,
    pinned: true,
    tags: ['任务', '前端', '实时'],
  },
  {
    id: 'session-14',
    title: 'Kubernetes 集群监控面板',
    agentName: '运维工程师',
    lastMessage: 'Prometheus + Grafana 仪表盘配置完成。',
    timestamp: '昨天',
    messageCount: 27,
    status: 'completed',
    tags: ['DevOps', '可视化'],
  },
  {
    id: 'session-15',
    title: '多租户 SaaS 权限系统',
    agentName: '后端工程师',
    lastMessage: 'RBAC + ABAC 混合权限模型实现完毕。',
    timestamp: '昨天',
    messageCount: 36,
    status: 'completed',
    tags: ['后端', '安全'],
  },
  {
    id: 'session-16',
    title: '前端组件库 Storybook 搭建',
    agentName: '全栈工程师',
    lastMessage: '已完成 Button、Input、Modal、Toast 等 15 个基础组件。',
    timestamp: '3天前',
    messageCount: 48,
    status: 'completed',
    tags: ['前端', 'React'],
  },
  {
    id: 'session-17',
    title: 'LLM 推理服务部署',
    agentName: '运维工程师',
    lastMessage: 'vLLM + Triton 推理服务器部署完成，支持动态批处理。',
    timestamp: '3天前',
    messageCount: 22,
    status: 'completed',
    tags: ['AI', '部署'],
  },
  {
    id: 'session-18',
    title: '电商搜索引擎优化',
    agentName: '后端工程师',
    lastMessage: 'Elasticsearch 8.x 索引优化和向量搜索集成完成。',
    timestamp: '4天前',
    messageCount: 29,
    status: 'completed',
    tags: ['后端', '性能'],
  },
  {
    id: 'session-19',
    title: '数据可视化大屏项目',
    agentName: '全栈工程师',
    lastMessage: 'ECharts 地图热力图和实时数据流对接完成。',
    timestamp: '5天前',
    messageCount: 33,
    status: 'completed',
    tags: ['前端', '可视化'],
  },
  {
    id: 'session-20',
    title: 'AI Agent 工作流编排引擎',
    agentName: '全栈工程师',
    lastMessage: 'DAG 编排器和节点可视化编辑器已就绪。',
    timestamp: '13:20',
    messageCount: 55,
    status: 'active',
    pinned: false,
    tags: ['AI', '前端'],
  },
  {
    id: 'session-21',
    title: '生产环境灰度发布方案',
    agentName: '运维工程师',
    lastMessage: 'Argo Rollouts 金丝雀发布流程配置完成。',
    timestamp: '上周',
    messageCount: 16,
    status: 'completed',
    tags: ['DevOps', '部署'],
  },
  {
    id: 'session-22',
    title: 'GraphQL API 网关整合',
    agentName: '后端工程师',
    lastMessage: 'Apollo Federation v2 子图拼接和权限中间件完成。',
    timestamp: '上周',
    messageCount: 24,
    status: 'completed',
    tags: ['后端'],
  },
  {
    id: 'session-23',
    title: '低代码平台表单引擎',
    agentName: '全栈工程师',
    lastMessage: 'JSON Schema 驱动的动态表单渲染器和校验器完成。',
    timestamp: '上周',
    messageCount: 40,
    status: 'completed',
    tags: ['前端', 'React'],
  },
  {
    id: 'session-24',
    title: '竞品分析：Cursor vs Windsurf',
    agentName: '调研分析师',
    lastMessage: 'AI 编程助手功能矩阵和用户体验评测完成。',
    timestamp: '2周前',
    messageCount: 26,
    status: 'completed',
    tags: ['调研', '竞品', 'AI'],
  },
  {
    id: 'session-25',
    title: 'WebRTC 视频会议模块',
    agentName: '全栈工程师',
    lastMessage: 'SFU 架构和屏幕共享功能开发完成。',
    timestamp: '2周前',
    messageCount: 37,
    status: 'completed',
    tags: ['前端', '实时'],
  },
  {
    id: 'session-26',
    title: '用户行为漏斗分析',
    agentName: '数据分析师',
    agentIcon: '📈',
    lastMessage: '注册→激活→付费转化漏斗和留存曲线已输出。',
    timestamp: '09:45',
    messageCount: 18,
    status: 'active',
    unread: true,
    tags: ['数据', '分析'],
    group: '数据分析',
  },
  {
    id: 'session-27',
    title: 'A/B 测试数据解读',
    agentName: '数据分析师',
    agentIcon: '📈',
    lastMessage: '新版定价页 CTR 提升 23%，统计显著性 p<0.01。',
    timestamp: '昨天',
    messageCount: 12,
    status: 'completed',
    tags: ['数据', '分析'],
    group: '数据分析',
  },
  {
    id: 'session-28',
    title: 'Next.js App Router 迁移',
    agentName: '全栈工程师',
    lastMessage: 'Pages Router → App Router 迁移完成，SSR 性能提升 40%。',
    timestamp: '10:15',
    messageCount: 44,
    status: 'active',
    tags: ['前端', 'React'],
    group: '项目开发',
  },
  {
    id: 'session-29',
    title: 'PostgreSQL 分库分表方案',
    agentName: '后端工程师',
    lastMessage: 'Citus 分布式扩展方案和数据迁移脚本已就绪。',
    timestamp: '昨天',
    messageCount: 21,
    status: 'completed',
    tags: ['后端', '数据库'],
    group: '项目开发',
  },
  {
    id: 'session-30',
    title: 'Terraform 基础设施即代码',
    agentName: '运维工程师',
    lastMessage: 'AWS VPC + EKS + RDS 全套 IaC 模板完成。',
    timestamp: '3天前',
    messageCount: 19,
    status: 'completed',
    tags: ['DevOps', '部署'],
    group: '运维部署',
  },
  {
    id: 'session-31',
    title: '用户画像标签体系设计',
    agentName: '数据分析师',
    agentIcon: '📈',
    lastMessage: '多维标签体系和 RFM 模型已输出，含可视化看板。',
    timestamp: '2天前',
    messageCount: 24,
    status: 'completed',
    tags: ['数据', '分析'],
    group: '数据分析',
  },
  {
    id: 'session-32',
    title: '国际化 i18n 方案',
    agentName: '全栈工程师',
    lastMessage: 'react-intl + ICU MessageFormat 多语言框架搭建完成。',
    timestamp: '4天前',
    messageCount: 16,
    status: 'completed',
    tags: ['前端', 'React'],
    group: '项目开发',
  },
  {
    id: 'session-33',
    title: '日志采集与链路追踪',
    agentName: '运维工程师',
    lastMessage: 'OpenTelemetry + Jaeger 分布式追踪方案已部署。',
    timestamp: '上周',
    messageCount: 20,
    status: 'completed',
    tags: ['DevOps', '可观测'],
    group: '运维部署',
  },
  {
    id: 'session-34',
    title: 'RAG 知识库问答系统',
    agentName: '全栈工程师',
    lastMessage: 'LangChain + Pinecone 检索增强生成管线已就绪。',
    timestamp: '11:30',
    messageCount: 52,
    status: 'active',
    unread: true,
    tags: ['AI', '前端'],
    group: '项目开发',
  },
  {
    id: 'session-35',
    title: '开源协议合规性调研',
    agentName: '调研分析师',
    agentIcon: '🔍',
    lastMessage: 'MIT/Apache/GPL 使用场景对比和企业合规建议已输出。',
    timestamp: '上周',
    messageCount: 14,
    status: 'completed',
    tags: ['调研'],
    group: '调研分析',
  },
  {
    id: 'session-36',
    title: '支付系统接入 (Stripe)',
    agentName: '后端工程师',
    lastMessage: 'Stripe Checkout + Webhook 订阅计费完成。',
    timestamp: '5天前',
    messageCount: 32,
    status: 'completed',
    tags: ['后端', '支付'],
    group: '项目开发',
  },
  {
    id: 'session-37',
    title: '销售数据周报自动化',
    agentName: '数据分析师',
    agentIcon: '📈',
    lastMessage: 'Python + Pandas 自动化周报管线已配置，定时推送飞书。',
    timestamp: '3天前',
    messageCount: 15,
    status: 'completed',
    tags: ['数据', '自动化'],
    group: '数据分析',
  },
  {
    id: 'session-38',
    title: 'Monorepo 工程化改造',
    agentName: '全栈工程师',
    lastMessage: 'Turborepo + pnpm workspace 改造完成，构建提速 3x。',
    timestamp: '上周',
    messageCount: 28,
    status: 'completed',
    tags: ['前端', '工程化'],
    group: '项目开发',
  },
  {
    id: 'session-39',
    title: '安全审计与渗透测试',
    agentName: '运维工程师',
    lastMessage: 'OWASP Top 10 扫描完成，3 个高危漏洞已修复。',
    timestamp: '2周前',
    messageCount: 18,
    status: 'completed',
    tags: ['DevOps', '安全'],
    group: '运维部署',
  },
  {
    id: 'session-40',
    title: 'MCP 协议服务器开发',
    agentName: '后端工程师',
    lastMessage: 'stdio + SSE 双模式传输层和工具注册框架完成。',
    timestamp: '12:05',
    messageCount: 39,
    status: 'active',
    tags: ['后端', 'AI'],
    group: '项目开发',
  },
];

// ===========================
// Session 1: React + Vite project
// ===========================

const SESSION_1_FILES: FileNode[] = [
  {
    name: 'src', type: 'folder', children: [
      {
        name: 'components', type: 'folder', children: [
          { name: 'Header.tsx', type: 'file' },
          { name: 'Footer.tsx', type: 'file' },
          { name: 'Card.tsx', type: 'file' },
          { name: 'Button.tsx', type: 'file' },
          { name: 'Layout.tsx', type: 'file' },
        ]
      },
      {
        name: 'pages', type: 'folder', children: [
          { name: 'Home.tsx', type: 'file' },
          { name: 'About.tsx', type: 'file' },
        ]
      },
      {
        name: 'hooks', type: 'folder', children: [
          { name: 'useTheme.ts', type: 'file' },
        ]
      },
      {
        name: 'styles', type: 'folder', children: [
          { name: 'globals.css', type: 'file' },
        ]
      },
      { name: 'App.tsx', type: 'file' },
      { name: 'main.tsx', type: 'file' },
      { name: 'vite-env.d.ts', type: 'file' },
    ]
  },
  {
    name: 'public', type: 'folder', children: [
      { name: 'vite.svg', type: 'file' },
      { name: 'favicon.ico', type: 'file' },
    ]
  },
  { name: 'package.json', type: 'file' },
  { name: 'tsconfig.json', type: 'file' },
  { name: 'vite.config.ts', type: 'file' },
  { name: 'tailwind.config.js', type: 'file' },
  { name: 'postcss.config.js', type: 'file' },
  { name: '.gitignore', type: 'file' },
  { name: 'index.html', type: 'file' },
  { name: 'README.md', type: 'file' },
];

const SESSION_1_OUTPUT: OutputFile[] = [
  { id: 'o1-1', name: 'project-summary.md', format: 'md', size: '2.3 KB', status: 'completed', timestamp: '14:27' },
  { id: 'o1-2', name: 'component-docs.docx', format: 'docx', size: '18 KB', status: 'generating', timestamp: '' },
];

const SESSION_1_CONTENTS: Record<string, string> = {
  'src/App.tsx': "import React from 'react'\nimport { Header } from './components/Header'\nimport { Footer } from './components/Footer'\nimport { Card } from './components/Card'\n\nfunction App() {\n  return (\n    <div className=\"min-h-screen bg-white\">\n      <Header />\n      <main className=\"max-w-4xl mx-auto px-4 py-12\">\n        <section className=\"text-center py-20\">\n          <h1 className=\"text-4xl font-bold tracking-tight mb-3\">\n            Build something amazing\n          </h1>\n          <p className=\"text-gray-500 text-base max-w-md mx-auto mb-8\">\n            A modern web application built with React,\n            TypeScript, and Tailwind CSS.\n          </p>\n          <div className=\"flex gap-3 justify-center\">\n            <button className=\"px-5 py-2.5 bg-black text-white rounded-lg text-sm\">\n              Get Started\n            </button>\n            <button className=\"px-5 py-2.5 bg-gray-50 border rounded-lg text-sm\">\n              Documentation\n            </button>\n          </div>\n        </section>\n        <div className=\"grid grid-cols-3 gap-4\">\n          <Card title=\"Components\" value=\"12\" />\n          <Card title=\"Pages\" value=\"3\" />\n          <Card title=\"Lighthouse\" value=\"98\" />\n        </div>\n      </main>\n      <Footer />\n    </div>\n  )\n}\n\nexport default App",

  'src/components/Header.tsx': "import React from 'react'\n\nexport function Header() {\n  return (\n    <header className=\"border-b border-gray-100\">\n      <nav className=\"max-w-4xl mx-auto px-4 h-14\n        flex items-center justify-between\">\n        <span className=\"text-base font-semibold tracking-tight\">MyApp</span>\n        <div className=\"flex items-center gap-6\">\n          <a href=\"/\" className=\"text-sm text-gray-500 hover:text-gray-900\">Home</a>\n          <a href=\"/about\" className=\"text-sm text-gray-500 hover:text-gray-900\">About</a>\n          <button className=\"px-3.5 py-1.5 text-xs bg-gray-900 text-white rounded-lg\">\n            Sign In\n          </button>\n        </div>\n      </nav>\n    </header>\n  )\n}",

  'src/components/Card.tsx': "import React from 'react'\n\ninterface CardProps {\n  title: string\n  value: string\n}\n\nexport function Card({ title, value }: CardProps) {\n  return (\n    <div className=\"border border-gray-100 rounded-2xl p-7 text-center hover:shadow-sm transition-shadow\">\n      <div className=\"text-3xl font-bold tracking-tight mb-1\">{value}</div>\n      <div className=\"text-[11px] text-gray-400 uppercase tracking-wide\">{title}</div>\n    </div>\n  )\n}",

  'src/components/Footer.tsx': "import React from 'react'\n\nexport function Footer() {\n  return (\n    <footer className=\"border-t border-gray-50 mt-20 py-8\">\n      <div className=\"max-w-4xl mx-auto px-4 text-center text-xs text-gray-300\">\n        &copy; 2026 MyApp. All rights reserved.\n      </div>\n    </footer>\n  )\n}",

  'package.json': '{\n  "name": "my-react-app",\n  "private": true,\n  "version": "0.1.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "tsc && vite build",\n    "preview": "vite preview"\n  },\n  "dependencies": {\n    "react": "^18.3.1",\n    "react-dom": "^18.3.1",\n    "react-router-dom": "^6.23.1"\n  },\n  "devDependencies": {\n    "@vitejs/plugin-react": "^4.3.0",\n    "autoprefixer": "^10.4.19",\n    "postcss": "^8.4.38",\n    "tailwindcss": "^3.4.4",\n    "typescript": "^5.4.5",\n    "vite": "^5.3.0"\n  }\n}',
};

const SESSION_1_STEPS: WorkflowStep[] = [
  {
    id: 's1', icon: 'search', label: '搜索网络资料', status: 'done',
    description: '收集了 React + Vite 项目脚手架和最佳实践的最新资料。',
    details: [{ icon: '🔍', label: 'React Vite TypeScript starter 2025 best practices', meta: '' }],
  },
  {
    id: 's2', icon: 'review', label: '审阅参考资料', status: 'done',
    detailLabel: '审阅参考资料',
    details: [
      { icon: '📘', label: 'Vite — Next Generation Frontend Tooling', meta: 'vitejs.dev' },
      { icon: '⚛️', label: 'React Documentation — Quick Start', meta: 'react.dev' },
      { icon: '🎨', label: 'Tailwind CSS — Installation Guide', meta: 'tailwindcss.com' },
      { icon: '📦', label: 'npm create vite — Official Scaffolding', meta: 'npmjs.com' },
    ],
  },
  {
    id: 's3', icon: 'install', label: '安装依赖', status: 'done',
    description: '安装了 react, react-dom, tailwindcss, postcss, autoprefixer 和 TypeScript。',
    details: [
      { icon: '📦', label: 'react@18.3.1, react-dom@18.3.1', meta: 'dependencies' },
      { icon: '📦', label: 'tailwindcss@3.4.4, postcss@8.4.38', meta: 'devDependencies' },
      { icon: '📦', label: 'typescript@5.4.5, vite@5.3.0', meta: 'devDependencies' },
    ],
  },
  {
    id: 's4', icon: 'config', label: '配置项目', status: 'done',
    details: [
      { icon: '⚙', label: 'tailwind.config.js', meta: 'created' },
      { icon: '⚙', label: 'postcss.config.js', meta: 'created' },
      { icon: '⚙', label: 'vite.config.ts — port 3001', meta: 'updated' },
    ],
  },
  {
    id: 's5', icon: 'code', label: '编写组件', status: 'done',
    detailLabel: '创建的文件',
    details: [
      { icon: '📄', label: 'src/components/Header.tsx', meta: 'new' },
      { icon: '📄', label: 'src/components/Footer.tsx', meta: 'new' },
      { icon: '📄', label: 'src/components/Card.tsx', meta: 'new' },
      { icon: '📄', label: 'src/components/Button.tsx', meta: 'modified' },
      { icon: '📄', label: 'src/components/Layout.tsx', meta: 'new' },
      { icon: '📄', label: 'src/App.tsx', meta: 'updated' },
    ],
  },
  { id: 's6', icon: 'paint', label: '编写页面', status: 'done',
    details: [
      { icon: '📄', label: 'src/pages/Home.tsx', meta: 'new' },
      { icon: '📄', label: 'src/pages/About.tsx', meta: 'new' },
    ],
  },
  { id: 's7', icon: 'build', label: '添加 React Router', status: 'running',
    description: '正在使用 react-router-dom v6 配置客户端路由...',
  },
  { id: 's8', icon: 'config', label: '添加 ESLint + Prettier', status: 'pending' },
  { id: 's9', icon: 'build', label: '构建与部署', status: 'pending' },
  { id: 's10', icon: 'finish', label: '完成', status: 'pending' },
];

const SESSION_1_MESSAGES: AgentChatMessage[] = [
  { id: 'm1', role: 'user', content: '帮我初始化一个 React 项目，使用 Vite + TypeScript + Tailwind CSS。', timestamp: '14:23' },
  { id: 'm2', role: 'agent', thinking: '用户需要一个使用 Vite + TypeScript + Tailwind CSS 的 React 项目。我将使用 Vite 的 React-TS 模板搭建脚手架，然后添加 Tailwind CSS。', toolCall: { name: 'npm create vite@latest -- --template react-ts', status: 'done', duration: '3.2s' }, content: '✓ Project created at ./my-react-app\n  - Template: react-ts\n  - Package manager: npm\n\nDone. Now run:\n  cd my-react-app\n  npm install\n  npm run dev', timestamp: '14:23' },
  { id: 'm3', role: 'agent', generativeUI: { type: 'selection', prompt: '请选择要使用的 CSS 框架：', items: [{ label: 'Tailwind CSS', description: '原子化 CSS 框架' }, { label: 'UnoCSS', description: '原子化 CSS 引擎' }, { label: 'Vanilla CSS', description: '无框架' }], resolved: true, resolvedValue: 'Tailwind CSS' }, timestamp: '14:23' },
  { id: 'm4', role: 'agent', content: '已选择 Tailwind CSS。正在安装依赖...', toolCall: { name: 'npm install -D tailwindcss postcss autoprefixer', status: 'done', duration: '5.8s' }, timestamp: '14:24' },
  { id: 'm5', role: 'agent', toolCall: { name: 'npx tailwindcss init -p', status: 'done', duration: '0.4s' }, content: 'Created Tailwind CSS config file: tailwind.config.js\nCreated PostCSS config file: postcss.config.js', timestamp: '14:24' },
  { id: 'm6', role: 'agent', generativeUI: { type: 'confirmation', prompt: '检测到端口 3000 已被占用，是否切换到 3001？', confirmLabel: 'Yes, switch to 3001', cancelLabel: 'Kill process on 3000', confirmVariant: 'primary', resolved: true, resolvedValue: 'confirm' }, timestamp: '14:24' },
  { id: 'm6a', role: 'agent', permissionRequest: { id: 'perm-m6a', toolName: 'shell.execute', toolDescription: '需要在工作目录中执行命令以启动开发服务器。', params: [{ label: '命令', value: 'vite dev --port 3001' }, { label: '工作目录', value: '~/projects/my-react-app' }], risk: 'medium', status: 'pending', allowAutoApprove: true }, timestamp: '14:24' },
  { id: 'm7', role: 'agent', content: '项目已初始化，开发服务器启动中。', toolCall: { name: 'vite dev --port 3001', status: 'running' }, timestamp: '14:25' },
  { id: 'm8', role: 'user', content: '加一个 Header 和 Footer 组件，首页用卡片展示统计数据。', timestamp: '14:26' },
  { id: 'm9', role: 'agent', thinking: 'Creating Header, Footer, and Card components. Header with nav bar, Footer with copyright, Card for stat display.', content: '正在创建组件...', timestamp: '14:26' },
  { id: 'm10', role: 'agent', toolCall: { name: 'write src/components/Header.tsx', status: 'done', duration: '0.8s' }, content: 'import { Link } from \'react-router-dom\';\n\nexport function Header() {\n  return (\n    <nav className="flex items-center justify-between px-6 py-3 border-b">\n      <span className="text-lg font-semibold">MyApp</span>\n      <div className="flex gap-4">\n        <Link to="/">Home</Link>\n        <Link to="/about">About</Link>\n      </div>\n    </nav>\n  );\n}', timestamp: '14:26' },
  { id: 'm11', role: 'agent', toolCall: { name: 'write src/components/Footer.tsx', status: 'done', duration: '0.5s' }, content: 'export function Footer() {\n  return (\n    <footer className="text-center py-6 text-sm text-gray-400">\n      © 2026 MyApp. All rights reserved.\n    </footer>\n  );\n}', timestamp: '14:26' },
  { id: 'm12', role: 'agent', toolCall: { name: 'write src/components/Card.tsx', status: 'done', duration: '0.6s' }, content: 'interface CardProps {\n  title: string;\n  value: string;\n  change: number;\n}\n\nexport function Card({ title, value, change }: CardProps) {\n  return (\n    <div className="rounded-xl border p-4">\n      <p className="text-sm text-gray-500">{title}</p>\n      <p className="text-2xl font-bold mt-1">{value}</p>\n      <span className={change > 0 ? \'text-green-500\' : \'text-red-500\'}>\n        {change > 0 ? \'+\' : \'\'}{change}%\n      </span>\n    </div>\n  );\n}', timestamp: '14:27' },
  { id: 'm13', role: 'agent', toolCall: { name: 'update src/App.tsx', status: 'done', duration: '0.4s' }, content: ' import \'./App.css\';\n+import { Header } from \'./components/Header\';\n+import { Footer } from \'./components/Footer\';\n+import { Card } from \'./components/Card\';\n \n function App() {\n   return (\n-    <div className="App">\n-      <h1>Vite + React</h1>\n+    <div>\n+      <Header />\n+      <main className="grid grid-cols-3 gap-4 p-6">\n+        <Card title="Users" value="12,345" change={8.2} />\n+        <Card title="Revenue" value="$45.2k" change={12.5} />\n+        <Card title="Orders" value="1,234" change={-2.1} />\n+      </main>\n+      <Footer />\n     </div>\n   );\n }', timestamp: '14:27' },
  { id: 'm14', role: 'agent', content: '已完成。Header、Footer、Card 组件已创建，App.tsx 已更新。', timestamp: '14:27' },
  { id: 'm15', role: 'agent', generativeUI: { type: 'buttons', prompt: '接下来想做什么？', options: [{ label: '添加暗色模式' }, { label: '创建 About 页面' }, { label: '添加动画效果' }], resolved: false }, timestamp: '14:27' },
];

const SESSION_1_PREVIEW = '<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n<style>\n* { margin: 0; padding: 0; box-sizing: border-box; }\nbody { font-family: \'Inter\', system-ui, sans-serif; background: #fff; color: #0f172a; }\n.nav { display: flex; align-items: center; justify-content: space-between; padding: 14px 28px; border-bottom: 1px solid #f1f5f9; }\n.nav-brand { font-size: 15px; font-weight: 600; letter-spacing: -0.02em; }\n.nav-links { display: flex; gap: 20px; align-items: center; }\n.nav-links a { font-size: 12px; color: #94a3b8; text-decoration: none; }\n.nav-btn { padding: 6px 12px; background: #0f172a; color: #fff; border: none; border-radius: 6px; font-size: 11px; font-weight: 500; cursor: pointer; }\n.hero { padding: 64px 28px 40px; max-width: 540px; margin: 0 auto; text-align: center; }\n.hero h1 { font-size: 28px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.15; margin-bottom: 10px; }\n.hero p { font-size: 13px; color: #94a3b8; line-height: 1.7; margin-bottom: 24px; }\n.hero-btns { display: flex; gap: 8px; justify-content: center; }\n.btn-dark { padding: 8px 16px; background: #0f172a; color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 500; cursor: pointer; }\n.btn-light { padding: 8px 16px; background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12px; cursor: pointer; }\n.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; max-width: 440px; margin: 0 auto; padding: 0 28px; }\n.stat-card { border: 1px solid #f1f5f9; border-radius: 12px; padding: 24px 16px; text-align: center; }\n.stat-num { font-size: 24px; font-weight: 700; }\n.stat-label { font-size: 10px; color: #94a3b8; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.06em; }\n.footer { text-align: center; padding: 24px; font-size: 10px; color: #e2e8f0; margin-top: 40px; }\n</style></head><body>\n<nav class="nav"><div class="nav-brand">MyApp</div><div class="nav-links"><a href="#">Home</a><a href="#">About</a><a href="#">Docs</a><button class="nav-btn">Sign In</button></div></nav>\n<section class="hero"><h1>Build something amazing</h1><p>A modern web application built with React, TypeScript, and Tailwind CSS.</p><div class="hero-btns"><button class="btn-dark">Get Started</button><button class="btn-light">Documentation</button></div></section>\n<div class="stats"><div class="stat-card"><div class="stat-num">12</div><div class="stat-label">Components</div></div><div class="stat-card"><div class="stat-num">3</div><div class="stat-label">Pages</div></div><div class="stat-card"><div class="stat-num">98</div><div class="stat-label">Score</div></div></div>\n<footer class="footer">&copy; 2026 MyApp</footer>\n</body></html>';

// ===========================
// Session 2: AI Tech Research Report
// ===========================

const SESSION_2_FILES: FileNode[] = [
  {
    name: 'reports', type: 'folder', children: [
      { name: 'ai-frameworks-comparison.md', type: 'file' },
      { name: 'executive-summary.md', type: 'file' },
      { name: 'methodology.md', type: 'file' },
    ]
  },
  {
    name: 'data', type: 'folder', children: [
      { name: 'benchmark-results.json', type: 'file' },
      { name: 'pricing-matrix.json', type: 'file' },
      { name: 'feature-comparison.csv', type: 'file' },
    ]
  },
  {
    name: 'charts', type: 'folder', children: [
      { name: 'performance-chart.svg', type: 'file' },
      { name: 'cost-analysis.svg', type: 'file' },
    ]
  },
  { name: 'README.md', type: 'file' },
];

const SESSION_2_OUTPUT: OutputFile[] = [
  { id: 'o2-1', name: 'AI 框架技术选型报告.docx', format: 'docx', size: '45 KB', status: 'completed', timestamp: '11:40' },
  { id: 'o2-2', name: '执行摘要.pdf', format: 'pdf', size: '12 KB', status: 'completed', timestamp: '11:41' },
  { id: 'o2-3', name: '框架对比矩阵.xlsx', format: 'xlsx', size: '8.5 KB', status: 'completed', timestamp: '11:42' },
  { id: 'o2-4', name: '性能基准数据.csv', format: 'csv', size: '3.2 KB', status: 'completed', timestamp: '11:42' },
];

const SESSION_2_CONTENTS: Record<string, string> = {
  'reports/ai-frameworks-comparison.md': '# AI 应用开发框架对比分析报告\n\n## 1. 概述\n\n本报告对当前主流 AI 应用开发框架进行深度调研对比，\n涵盖 LangChain、LlamaIndex、Semantic Kernel、\nHaystack、AutoGen 和 CrewAI 六个框架。\n\n## 2. 评估维度\n\n| 维度 | 权重 | 说明 |\n|------|------|------|\n| 功能完备性 | 25% | API 覆盖、模型支持、工具链 |\n| 开发体验 | 20% | 文档质量、类型支持、调试工具 |\n| 性能表现 | 20% | 推理延迟、吞吐量、内存占用 |\n| 社区生态 | 15% | GitHub Stars、贡献者、第三方插件 |\n| 生产就绪度 | 20% | 可观测性、错误处理、扩展性 |\n\n## 3. 框架对比\n\n### 3.1 LangChain (Python/JS)\n- 综合评分：8.2/10\n- 最成熟的 AI 应用框架，生态丰富\n- LCEL 链式语法直观，支持流式输出\n- 缺点：抽象层过重，调试困难\n\n### 3.2 LlamaIndex\n- 综合评分：7.8/10\n- RAG (检索增强生成) 最佳选择\n- 内置 20+ 数据连接器\n- 缺点：Agent 能力相对较弱\n\n### 3.3 Semantic Kernel (Microsoft)\n- 综合评分：7.5/10\n- 企业级首选，Azure 集成深度好\n- 原生支持 C# / Python / Java\n- 缺点：社区相对较小\n\n### 3.4 Haystack (deepset)\n- 综合评分：7.3/10\n- Pipeline 设计模式优秀\n- 可视化编排工具 Hayhooks\n- 缺点：学习曲线陡\n\n### 3.5 AutoGen (Microsoft)\n- 综合评分：7.6/10\n- 多 Agent 协作最强框架\n- 支持人机协同工作流\n- 缺点：配置复杂度高\n\n### 3.6 CrewAI\n- 综合评分：7.1/10\n- 角色扮演式 Agent 编排\n- 上手最简单\n- 缺点：功能相对有限\n\n## 4. 性能基准测试\n\n基于 1000 次标准 RAG 查询的平均结果：\n\n| 框架 | 平均延迟 | P99 延迟 | 内存占用 |\n|------|---------|---------|---------|\n| LangChain | 1.2s | 3.4s | 512MB |\n| LlamaIndex | 0.9s | 2.8s | 380MB |\n| Semantic Kernel | 1.1s | 3.1s | 420MB |\n| Haystack | 1.0s | 2.9s | 390MB |\n| AutoGen | 1.8s | 5.2s | 680MB |\n| CrewAI | 1.5s | 4.1s | 520MB |\n\n## 5. 推荐方案\n\n根据项目需求，推荐以下技术选型：\n\n**首选：LangChain + LlamaIndex 组合**\n- 使用 LangChain 作为 Agent 编排层\n- 使用 LlamaIndex 作为 RAG 引擎\n- 通过 LangSmith 实现可观测性\n\n**备选：Semantic Kernel (如需 Azure 集成)**',

  'reports/executive-summary.md': '# 执行摘要\n\n## 项目背景\n公司计划在 Q3 推出 AI 驱动的客户服务平台，\n需要选择合适的 AI 应用开发框架。\n\n## 核心发现\n1. LangChain 生态最完善，适合复杂场景\n2. LlamaIndex 在 RAG 场景性能最优\n3. 多 Agent 场景推荐 AutoGen\n4. 企业级场景可考虑 Semantic Kernel\n\n## 建议\n采用 LangChain + LlamaIndex 组合方案，\n预估开发周期 8-10 周。\n\n## 风险提示\n- AI 框架迭代速度快，需关注 breaking changes\n- LangChain v0.3 重大变更需提前评估\n- 生产环境需额外投入可观测性基础设施',

  'reports/methodology.md': '# 调研方法论\n\n## 数据来源\n1. 官方文档 & GitHub Repository\n2. 社区讨论（Reddit, Discord, HN）\n3. 生产用户访谈（5 家企业）\n4. 自建性能基准测试套件\n\n## 评估流程\n1. 功能清单对比（基于 50+ 维度）\n2. 快速原型开发（每个框架 2 天）\n3. 性能压测（1000 次标准查询）\n4. 代码质量评估（可维护性、可读性）\n5. 团队试用反馈收集',

  'data/benchmark-results.json': '{\n  "testConfig": {\n    "queries": 1000,\n    "concurrency": 10,\n    "model": "gpt-4o-mini",\n    "embeddingModel": "text-embedding-3-small",\n    "vectorDB": "Qdrant",\n    "documentCount": 5000\n  },\n  "results": {\n    "langchain": {\n      "avgLatency": 1.2,\n      "p99Latency": 3.4,\n      "throughput": 8.3,\n      "memoryMB": 512,\n      "accuracy": 0.87\n    },\n    "llamaindex": {\n      "avgLatency": 0.9,\n      "p99Latency": 2.8,\n      "throughput": 11.1,\n      "memoryMB": 380,\n      "accuracy": 0.91\n    },\n    "semantic_kernel": {\n      "avgLatency": 1.1,\n      "p99Latency": 3.1,\n      "throughput": 9.1,\n      "memoryMB": 420,\n      "accuracy": 0.85\n    }\n  }\n}',

  'data/pricing-matrix.json': '{\n  "frameworks": [\n    {\n      "name": "LangChain",\n      "license": "MIT",\n      "cloudService": "LangSmith",\n      "cloudPricing": "$39/seat/month",\n      "selfHosted": true\n    },\n    {\n      "name": "LlamaIndex",\n      "license": "MIT",\n      "cloudService": "LlamaCloud",\n      "cloudPricing": "$0.002/page parsed",\n      "selfHosted": true\n    },\n    {\n      "name": "Semantic Kernel",\n      "license": "MIT",\n      "cloudService": "Azure AI",\n      "cloudPricing": "Pay-as-you-go",\n      "selfHosted": true\n    }\n  ]\n}',

  'README.md': '# AI 应用技术选型调研\n\n## 目录结构\n\n- reports/    调研报告文档\n- data/       数据和基准测试结果\n- charts/     可视化图表\n\n## 阅读顺序\n\n1. reports/executive-summary.md\n2. reports/ai-frameworks-comparison.md\n3. reports/methodology.md\n4. data/benchmark-results.json',
};

const SESSION_2_STEPS: WorkflowStep[] = [
  { id: 'r1', icon: 'search', label: '搜索 AI 框架', status: 'done',
    description: '搜索了 LangChain, LlamaIndex, Semantic Kernel, Haystack, AutoGen, CrewAI 的最新信息。',
    details: [
      { icon: '🔍', label: 'AI application framework comparison 2025', meta: '' },
      { icon: '🔍', label: 'LangChain vs LlamaIndex performance benchmark', meta: '' },
      { icon: '🔍', label: 'Multi-agent framework comparison AutoGen CrewAI', meta: '' },
    ],
  },
  { id: 'r2', icon: 'review', label: '审阅 18 个来源', status: 'done',
    detailLabel: '已分析的来源',
    details: [
      { icon: '📘', label: 'LangChain Documentation v0.3', meta: 'langchain.com' },
      { icon: '📘', label: 'LlamaIndex — Build RAG Apps', meta: 'llamaindex.ai' },
      { icon: '📘', label: 'Semantic Kernel Overview', meta: 'learn.microsoft.com' },
      { icon: '📘', label: 'Haystack by deepset', meta: 'haystack.deepset.ai' },
      { icon: '📘', label: 'AutoGen — Multi-Agent Framework', meta: 'microsoft.github.io' },
      { icon: '📘', label: 'CrewAI Documentation', meta: 'docs.crewai.com' },
      { icon: '📰', label: 'Reddit: Production experiences with LangChain', meta: 'reddit.com' },
      { icon: '📰', label: 'HN: Why I switched from LangChain to LlamaIndex', meta: 'news.ycombinator.com' },
    ],
  },
  { id: 'r3', icon: 'code', label: '执行基准测试', status: 'done',
    description: '对每个框架执行了 1000 次标准 RAG 查询性能测试。',
    details: [
      { icon: '⚡', label: 'LangChain: 1.2s avg, 87% accuracy', meta: 'done' },
      { icon: '⚡', label: 'LlamaIndex: 0.9s avg, 91% accuracy', meta: 'done' },
      { icon: '⚡', label: 'Semantic Kernel: 1.1s avg, 85% accuracy', meta: 'done' },
      { icon: '⚡', label: 'AutoGen: 1.8s avg (multi-agent overhead)', meta: 'done' },
    ],
  },
  { id: 'r4', icon: 'write', label: '编写对比报告', status: 'done',
    details: [
      { icon: '📄', label: 'reports/ai-frameworks-comparison.md', meta: 'new' },
      { icon: '📄', label: 'reports/executive-summary.md', meta: 'new' },
      { icon: '📄', label: 'reports/methodology.md', meta: 'new' },
    ],
  },
  { id: 'r5', icon: 'code', label: '生成数据文件', status: 'done',
    details: [
      { icon: '📊', label: 'data/benchmark-results.json', meta: 'new' },
      { icon: '📊', label: 'data/pricing-matrix.json', meta: 'new' },
      { icon: '📊', label: 'data/feature-comparison.csv', meta: 'new' },
    ],
  },
  { id: 'r6', icon: 'finish', label: '报告完成', status: 'done' },
];

const SESSION_2_MESSAGES: AgentChatMessage[] = [
  { id: 'r-m1', role: 'user', content: '帮我做一个 AI 应用开发框架的技术选型调研，需要对比主流框架，输出详细报告。', timestamp: '10:15' },
  { id: 'r-m2', role: 'agent', thinking: '用户需要一份全面的 AI 框架技术选型报告。我需要调研 LangChain, LlamaIndex, Semantic Kernel, Haystack, AutoGen, CrewAI 这些主流框架，从功能、性能、生态、成本等维度进行对比分析。', content: '明白！我将对当前主流的 AI 应用开发框架进行系统调研。调研范围包括 LangChain、LlamaIndex、Semantic Kernel、Haystack、AutoGen 和 CrewAI。', timestamp: '10:15' },
  { id: 'r-m3', role: 'agent', generativeUI: { type: 'buttons', prompt: '调研报告需要包含哪些内容？（可多选后告知）', options: [{ label: '功能对比矩阵' }, { label: '性能基准测试' }, { label: '成本分析' }, { label: '团队适配建议' }], resolved: true, resolvedValue: '功能对比矩阵' }, timestamp: '10:16' },
  { id: 'r-m4', role: 'agent', toolCall: { name: 'search web: AI framework comparison 2025', status: 'done', duration: '4.1s' }, content: '已分析的来源  8\n\n📄 LangChain Documentation v0.3          langchain.com\n📄 LlamaIndex — Build RAG Apps            llamaindex.ai\n📄 Semantic Kernel Overview                learn.microsoft.com\n📄 Haystack by deepset                    haystack.deepset.ai\n📄 AutoGen — Multi-Agent Framework         microsoft.github.io\n📄 CrewAI Documentation                    docs.crewai.com\n💬 Reddit: Production experiences          reddit.com\n💬 HN: Why I switched from LangChain       news.ycombinator.com', timestamp: '10:16' },
  // Errored tool call — clickable card opens detail modal w/ AI diagnosis.
  { id: 'r-m4a', role: 'agent', toolCall: {
      name: 'search web: LangChain vs LlamaIndex benchmark',
      status: 'error',
      duration: '0.9s',
      errorCode: '429',
      errorMessage: '搜索服务暂时限流，请稍后重试',
      error: {
        message: '搜索服务暂时限流，请稍后重试',
        code: 'rate_limit_exceeded',
        statusCode: 429,
        requestUrl: 'https://api.search.dev/v1/query',
        responseBody: '{\n  "error": {\n    "code": "rate_limit_exceeded",\n    "message": "Quota exceeded: 60 requests per minute.",\n    "type": "rate_limit_error",\n    "retry_after_seconds": 12\n  }\n}',
        responseHeaders: '{\n  "content-type": "application/json",\n  "x-request-id": "7e9a-21f0-4c8b",\n  "retry-after": "12",\n  "x-ratelimit-limit": "60",\n  "x-ratelimit-remaining": "0"\n}',
        providerId: 'search.dev',
        modelId: 'search-default-v2',
      },
    }, content: 'POST https://api.search.dev/v1/query 429 Too Many Requests\n\nRequest-ID: 7e9a-21f0-4c8b\nRetry-After: 12s\nQuota: 60/min · Used: 60', timestamp: '10:17' },
  { id: 'r-m5', role: 'agent', toolCall: { name: 'search web: LangChain vs LlamaIndex benchmark', status: 'done', duration: '3.8s' }, content: '已分析的来源  6\n\n📄 RAG Framework Benchmark 2025            blog.llamaindex.ai\n📄 LangChain Performance Guide             python.langchain.com\n📄 Choosing Between LangChain & LlamaIndex medium.com\n📄 AI Framework Latency Comparison         benchmarks.ai\n💬 Best RAG framework for production?      reddit.com/r/LocalLLaMA\n💬 LlamaIndex vs LangChain in 2025         dev.to', timestamp: '10:17' },
  { id: 'r-m6', role: 'agent', toolCall: { name: 'analyze 18 sources and extract key data', status: 'done', duration: '12.3s' }, content: '提取关键数据点：\n• LangChain GitHub Stars: 92.4k, Contributors: 2,800+\n• LlamaIndex GitHub Stars: 35.8k, RAG 专项优化\n• AutoGen: Microsoft 出品，多 Agent 协作支持\n• Semantic Kernel: .NET/Python 双语言支持\n• 6 个框架均采用 MIT/Apache 开源协议\n• 生产环境用户反馈样本: 47 条', timestamp: '10:18' },
  { id: 'r-m7', role: 'agent', content: '已收集到 18 个高质量来源的数据，包括官方文档、社区讨论和生产用户反馈。正在运行基准测试...', timestamp: '10:19' },
  { id: 'r-m8', role: 'agent', toolCall: { name: 'run benchmark: 1000 RAG queries x 6 frameworks', status: 'done', duration: '45.2s' }, content: '⚡ LangChain:       1.2s avg, 87% accuracy        done\n⚡ LlamaIndex:      0.9s avg, 91% accuracy        done\n⚡ Semantic Kernel:  1.1s avg, 85% accuracy        done\n⚡ Haystack:        1.0s avg, 88% accuracy        done\n⚡ AutoGen:         1.8s avg, 84% accuracy        done\n⚡ CrewAI:          1.5s avg, 82% accuracy        done\n\n最佳: LlamaIndex (0.9s, 91%)', timestamp: '10:20' },
  { id: 'r-m9', role: 'agent', generativeUI: { type: 'confirmation', prompt: '基准测试完成。LlamaIndex 在 RAG 场景表现最优（0.9s 延迟, 91% 准确率）。是否将完整测试数据也包含在报告中？', confirmLabel: '包含完整数据', cancelLabel: '仅摘要', confirmVariant: 'primary', resolved: true, resolvedValue: 'confirm' }, timestamp: '10:21' },
  { id: 'r-m10', role: 'agent', toolCall: { name: 'write reports/executive-summary.md', status: 'done', duration: '2.1s' }, content: '# AI 应用开发框架技术选型报告\n## 摘要\n本报告对 6 个主流 AI 框架进行了系统对比...\n\n## 核心结论\n- LangChain 综合评分最高 (8.2/10)\n- LlamaIndex RAG 性能最优 (0.9s, 91%)\n- 推荐方案: LangChain + LlamaIndex 组合', timestamp: '10:22' },
  { id: 'r-m11', role: 'agent', toolCall: { name: 'write reports/ai-frameworks-comparison.md', status: 'done', duration: '5.6s' }, content: '# 框架详细对比\n\n## 1. LangChain\n- Stars: 92.4k | Contributors: 2,800+\n- 优势: 生态成熟、社区活跃、文档完善\n- 劣势: 抽象层较多、性能开销较大\n\n## 2. LlamaIndex\n- Stars: 35.8k | RAG 专项优化\n- 优势: RAG 场景性能优异、API 简洁\n...（共 2,400 字）', timestamp: '10:23' },
  { id: 'r-m12', role: 'agent', toolCall: { name: 'write reports/methodology.md', status: 'done', duration: '1.8s' }, content: '# 调研方法论\n\n## 数据来源\n- 官方文档: 6 个\n- 技术博客: 8 篇\n- 社区讨论: 4 个\n\n## 基准测试环境\n- 硬件: M3 Max, 64GB RAM\n- 数据集: 1000 条标准 RAG 查询', timestamp: '10:24' },
  { id: 'r-m13', role: 'agent', toolCall: { name: 'write data/benchmark-results.json', status: 'done', duration: '0.5s' }, content: '{\n  "test_config": { "queries": 1000, "dataset": "standard-rag" },\n  "results": [\n    { "framework": "LlamaIndex", "avg_latency": "0.9s", "accuracy": 0.91 },\n    { "framework": "LangChain", "avg_latency": "1.2s", "accuracy": 0.87 }\n  ]\n}', timestamp: '10:24' },
  { id: 'r-m14', role: 'agent', toolCall: { name: 'write data/pricing-matrix.json', status: 'done', duration: '0.4s' }, content: '{\n  "langsmith": { "price": "$39/seat/mo", "free_tier": true },\n  "llamacloud": { "price": "$0.002/page", "free_tier": true },\n  "azure_ai": { "price": "pay-as-you-go", "free_tier": false }\n}', timestamp: '10:24' },
  { id: 'r-m15', role: 'agent', content: '调研报告已完成！核心发现：\n\n• LangChain 生态最成熟，综合评分 8.2/10\n• LlamaIndex 在 RAG 场景性能最优（0.9s 延迟, 91% 准确率）\n• AutoGen 最适合多 Agent 协作场景\n• 推荐方案：LangChain + LlamaIndex 组合\n\n报告文件已保存在 reports/ 目录下。', timestamp: '11:42' },
  { id: 'r-m16', role: 'user', content: '能不能再加一个各框架的成本对比？包括云服务定价。', timestamp: '11:43' },
  { id: 'r-m17', role: 'agent', thinking: '用户想要成本对比信息。我已经收集了部分定价数据在 pricing-matrix.json 中，需要整理成更直观的格式并补充到报告中。', content: '当然！正在补充成本分析部分...', timestamp: '11:43' },
  { id: 'r-m18', role: 'agent', toolCall: { name: 'search web: LangSmith LlamaCloud Azure AI pricing 2025', status: 'done', duration: '3.2s' }, content: '已分析的来源  4\n\n📄 LangSmith Pricing                       smith.langchain.com\n📄 LlamaCloud Plans                        cloud.llamaindex.ai\n📄 Azure AI Services Pricing               azure.microsoft.com\n📄 Haystack Cloud Beta                     haystack.deepset.ai', timestamp: '11:44' },
  { id: 'r-m19', role: 'agent', toolCall: { name: 'update reports/ai-frameworks-comparison.md', status: 'done', duration: '1.9s' }, content: ' ## 性能基准测试\n ...\n \n+## 成本对比\n+\n+| 平台 | 定价模式 | 月费用估算 |\n+|------|---------|----------|\n+| LangSmith | $39/seat/mo | ~$200/团队 |\n+| LlamaCloud | $0.002/page | ~$50-150 |\n+| Azure AI | Pay-as-you-go | ~$100-500 |\n+\n+> 所有框架均为 MIT/Apache 开源，可免费商用。\n+> 云服务为可选增值服务。\n \n ## 推荐方案', timestamp: '11:45' },
  { id: 'r-m20', role: 'agent', content: '已添加成本对比章节。所有框架均为 MIT 开源协议可免费商用，云服务定价方面 LangSmith $39/seat/mo，LlamaCloud 按用量计费 $0.002/page。', timestamp: '11:45' },
  { id: 'r-m21', role: 'agent', generativeUI: { type: 'buttons', prompt: '还需要什么补充？', options: [{ label: '生成 PPT 演示稿' }, { label: '添加技术路线图' }, { label: '导出 PDF 报告' }], resolved: false }, timestamp: '11:45' },
  // High-risk permission with long shell script
  { id: 'r-m22', role: 'agent', permissionRequest: {
    id: 'perm-r-m22',
    toolName: 'shell.execute',
    toolDescription: '要在桌面创建分类文件夹并移动现有文件夹（不删除、不覆盖），是否允许？',
    params: [
      { label: '工作目录', value: '/Users/siin/Desktop' },
      { label: '命令', value: `set -euo pipefail

desktop="/Users/siin/Desktop"
log="/Users/siin/Desktop/desktop-folder-organize-$(date +%Y%m%d-%H%M%S).log"
: > "$log"

mkdir -p "$desktop/项目" "$desktop/公司资料" "$desktop/临时归档"
print "CREATED/EXISTS: 项目"      >> "$log"
print "CREATED/EXISTS: 公司资料"  >> "$log"
print "CREATED/EXISTS: 临时归档"  >> "$log"
print "USING EXISTING CATEGORY: 书籍" >> "$log"

move_dir() {
  local name="$1"
  local category="$2"
  local src="$desktop/$name"
  local dst="$desktop/$category/$name"
  if [[ -d "$src" ]]; then
    if [[ -e "$dst" ]]; then
      print "SKIP (already exists at destination): $src -> $dst" >> "$log"
    else
      mv -n "$src" "$dst"
      print "MOVED: $src -> $dst" >> "$log"
    fi
  fi
}

# Project folders
move_dir "code"        "项目"
move_dir "manado"      "项目"
move_dir "playground"  "项目"

# Company materials
move_dir "招聘资料"     "公司资料"
move_dir "合同模板"     "公司资料"

print "DONE. See log at $log" >> "$log"` },
    ],
    risk: 'high',
    status: 'pending',
    allowAutoApprove: true,
  }, timestamp: '11:46' },
];

const SESSION_2_PREVIEW = '<!DOCTYPE html>\n<html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n<style>\n* { margin: 0; padding: 0; box-sizing: border-box; }\nbody { font-family: \'Inter\', system-ui, sans-serif; background: #fff; color: #1e293b; padding: 32px 40px; line-height: 1.7; }\nh1 { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 6px; color: #0f172a; }\nh2 { font-size: 16px; font-weight: 600; margin-top: 28px; margin-bottom: 10px; color: #0f172a; padding-bottom: 6px; border-bottom: 1px solid #f1f5f9; }\nh3 { font-size: 13px; font-weight: 600; margin-top: 18px; margin-bottom: 6px; color: #334155; }\np { font-size: 13px; color: #475569; margin-bottom: 10px; }\n.badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }\n.badge-green { background: #ecfdf5; color: #059669; }\n.badge-blue { background: #eff6ff; color: #2563eb; }\n.badge-yellow { background: #fefce8; color: #ca8a04; }\ntable { width: 100%; border-collapse: collapse; margin: 12px 0 20px; font-size: 12px; }\nth { text-align: left; padding: 8px 12px; background: #f8fafc; color: #64748b; font-weight: 500; border-bottom: 1px solid #e2e8f0; }\ntd { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; }\ntr:hover td { background: #f8fafc; }\n.score { font-weight: 600; }\n.recommend { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0; }\n.recommend h3 { color: #166534; margin-top: 0; }\n.recommend p { color: #15803d; margin-bottom: 0; }\n.meta { font-size: 11px; color: #94a3b8; margin-bottom: 24px; }\n</style></head><body>\n<h1>AI 应用开发框架对比分析报告</h1>\n<p class="meta">调研分析师 · 2026-02-25 · 分析了 18 个数据源</p>\n\n<h2>框架综合评分</h2>\n<table>\n<tr><th>框架</th><th>综合评分</th><th>最佳场景</th><th>License</th></tr>\n<tr><td>LangChain</td><td class="score">8.2/10</td><td><span class="badge badge-green">通用 AI 应用</span></td><td>MIT</td></tr>\n<tr><td>LlamaIndex</td><td class="score">7.8/10</td><td><span class="badge badge-blue">RAG 场景</span></td><td>MIT</td></tr>\n<tr><td>AutoGen</td><td class="score">7.6/10</td><td><span class="badge badge-yellow">多 Agent</span></td><td>MIT</td></tr>\n<tr><td>Semantic Kernel</td><td class="score">7.5/10</td><td><span class="badge badge-blue">企业级</span></td><td>MIT</td></tr>\n<tr><td>Haystack</td><td class="score">7.3/10</td><td><span class="badge badge-green">Pipeline</span></td><td>Apache 2.0</td></tr>\n<tr><td>CrewAI</td><td class="score">7.1/10</td><td><span class="badge badge-yellow">快速原型</span></td><td>MIT</td></tr>\n</table>\n\n<h2>性能基准测试</h2>\n<p>基于 1000 次标准 RAG 查询的平均结果：</p>\n<table>\n<tr><th>框架</th><th>平均延迟</th><th>P99 延迟</th><th>准确率</th><th>内存占用</th></tr>\n<tr><td>LlamaIndex</td><td style="color:#059669;font-weight:600">0.9s</td><td>2.8s</td><td style="color:#059669;font-weight:600">91%</td><td>380MB</td></tr>\n<tr><td>Haystack</td><td>1.0s</td><td>2.9s</td><td>88%</td><td>390MB</td></tr>\n<tr><td>Semantic Kernel</td><td>1.1s</td><td>3.1s</td><td>85%</td><td>420MB</td></tr>\n<tr><td>LangChain</td><td>1.2s</td><td>3.4s</td><td>87%</td><td>512MB</td></tr>\n<tr><td>CrewAI</td><td>1.5s</td><td>4.1s</td><td>82%</td><td>520MB</td></tr>\n<tr><td>AutoGen</td><td>1.8s</td><td>5.2s</td><td>84%</td><td>680MB</td></tr>\n</table>\n\n<div class="recommend">\n<h3>推荐方案</h3>\n<p>LangChain (Agent 编排) + LlamaIndex (RAG 引擎) + LangSmith (可观测性)</p>\n</div>\n</body></html>';

// ===========================
// Session 3: Dashboard
// ===========================

const SESSION_3_FILES: FileNode[] = [
  {
    name: 'src', type: 'folder', children: [
      {
        name: 'components', type: 'folder', children: [
          {
            name: 'charts', type: 'folder', children: [
              { name: 'AreaChart.tsx', type: 'file' },
              { name: 'BarChart.tsx', type: 'file' },
              { name: 'PieChart.tsx', type: 'file' },
              { name: 'LineChart.tsx', type: 'file' },
            ]
          },
          { name: 'StatCard.tsx', type: 'file' },
          { name: 'DataTable.tsx', type: 'file' },
          { name: 'Sidebar.tsx', type: 'file' },
          { name: 'TopNav.tsx', type: 'file' },
          { name: 'ActivityFeed.tsx', type: 'file' },
        ]
      },
      {
        name: 'hooks', type: 'folder', children: [
          { name: 'useRealtimeData.ts', type: 'file' },
          { name: 'useDashboard.ts', type: 'file' },
        ]
      },
      { name: 'Dashboard.tsx', type: 'file' },
      { name: 'App.tsx', type: 'file' },
    ]
  },
  { name: 'package.json', type: 'file' },
];

const SESSION_3_CONTENTS: Record<string, string> = {
  'src/Dashboard.tsx': "import React from 'react'\nimport { StatCard } from './components/StatCard'\nimport { AreaChart } from './components/charts/AreaChart'\nimport { BarChart } from './components/charts/BarChart'\nimport { DataTable } from './components/DataTable'\nimport { ActivityFeed } from './components/ActivityFeed'\n\nexport function Dashboard() {\n  return (\n    <div className=\"flex h-screen bg-gray-50\">\n      <Sidebar />\n      <div className=\"flex-1 overflow-auto\">\n        <TopNav />\n        <main className=\"p-6\">\n          {/* Stat Cards */}\n          <div className=\"grid grid-cols-4 gap-4 mb-6\">\n            <StatCard title=\"Total Revenue\" value=\"$45,231\" change=\"+20.1%\" trend=\"up\" />\n            <StatCard title=\"Active Users\" value=\"2,350\" change=\"+18.2%\" trend=\"up\" />\n            <StatCard title=\"Conversion\" value=\"3.24%\" change=\"-2.1%\" trend=\"down\" />\n            <StatCard title=\"Avg. Session\" value=\"4m 32s\" change=\"+12.5%\" trend=\"up\" />\n          </div>\n          {/* Charts Row */}\n          <div className=\"grid grid-cols-3 gap-4 mb-6\">\n            <div className=\"col-span-2 bg-white rounded-xl p-5 border\">\n              <h3 className=\"text-sm font-medium mb-4\">Revenue Overview</h3>\n              <AreaChart />\n            </div>\n            <div className=\"bg-white rounded-xl p-5 border\">\n              <h3 className=\"text-sm font-medium mb-4\">Traffic Sources</h3>\n              <BarChart />\n            </div>\n          </div>\n          {/* Bottom Row */}\n          <div className=\"grid grid-cols-3 gap-4\">\n            <div className=\"col-span-2 bg-white rounded-xl p-5 border\">\n              <h3 className=\"text-sm font-medium mb-4\">Recent Orders</h3>\n              <DataTable />\n            </div>\n            <div className=\"bg-white rounded-xl p-5 border\">\n              <h3 className=\"text-sm font-medium mb-4\">Activity</h3>\n              <ActivityFeed />\n            </div>\n          </div>\n        </main>\n      </div>\n    </div>\n  )\n}",

  'src/components/StatCard.tsx': "import React from 'react'\nimport { TrendingUp, TrendingDown } from 'lucide-react'\n\ninterface Props {\n  title: string\n  value: string\n  change: string\n  trend: 'up' | 'down'\n}\n\nexport function StatCard({ title, value, change, trend }: Props) {\n  return (\n    <div className=\"bg-white rounded-xl p-5 border border-gray-100\">\n      <p className=\"text-xs text-gray-500 mb-1\">{title}</p>\n      <div className=\"flex items-end justify-between\">\n        <span className=\"text-2xl font-bold tracking-tight\">{value}</span>\n        <span className={`flex items-center gap-1 text-xs ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>\n          {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}\n          {change}\n        </span>\n      </div>\n    </div>\n  )\n}",
};

const SESSION_3_STEPS: WorkflowStep[] = [
  { id: 'd1', icon: 'search', label: '分析仪表盘需求', status: 'done',
    description: '分析了仪表盘需求：4 个统计卡片、面积图、柱状图、数据表格、活动流。' },
  { id: 'd2', icon: 'install', label: '安装 Recharts 及依赖', status: 'done',
    details: [
      { icon: '📦', label: 'recharts@2.12.7', meta: 'dependency' },
      { icon: '📦', label: 'date-fns@3.6.0', meta: 'dependency' },
    ],
  },
  { id: 'd3', icon: 'code', label: '创建图表组件', status: 'done',
    detailLabel: 'Charts created',
    details: [
      { icon: '📊', label: 'AreaChart.tsx — Revenue trend', meta: 'new' },
      { icon: '📊', label: 'BarChart.tsx — Traffic sources', meta: 'new' },
      { icon: '📊', label: 'PieChart.tsx — Device breakdown', meta: 'new' },
      { icon: '📊', label: 'LineChart.tsx — User growth', meta: 'new' },
    ],
  },
  { id: 'd4', icon: 'code', label: '构建布局组件', status: 'done',
    details: [
      { icon: '📄', label: 'Sidebar.tsx', meta: 'new' },
      { icon: '📄', label: 'TopNav.tsx', meta: 'new' },
      { icon: '📄', label: 'StatCard.tsx', meta: 'new' },
      { icon: '📄', label: 'DataTable.tsx', meta: 'new' },
      { icon: '📄', label: 'ActivityFeed.tsx', meta: 'new' },
    ],
  },
  { id: 'd5', icon: 'code', label: '添加实时数据 Hook', status: 'done',
    description: '使用 WebSocket mock 实现了 useRealtimeData hook，支持自动刷新。' },
  { id: 'd6', icon: 'paint', label: '样式与优化', status: 'done' },
  { id: 'd7', icon: 'finish', label: '看板完成', status: 'done' },
];

const SESSION_3_MESSAGES: AgentChatMessage[] = [
  { id: 'd-m1', role: 'user', content: '构建一个数据看板 Dashboard，需要有统计卡片、图表和数据表格。风格参考 Vercel/Linear 那种简洁设计。', timestamp: '09:30' },
  { id: 'd-m2', role: 'agent', thinking: 'User wants a clean dashboard. I will use Recharts for charts, create a sidebar layout similar to Vercel. Need StatCard, AreaChart, BarChart, DataTable, and ActivityFeed components.', content: '收到！我会按照 Vercel/Linear 风格构建数据看板，包含：\n\n• 4 个统计卡片（收入、用户、转化率、会话时长）\n• 面积图展示收入趋势\n• 柱状图展示流量来源\n• 数据表格展示最近订单\n• 侧边栏导航', timestamp: '09:30' },
  { id: 'd-m3', role: 'agent', generativeUI: { type: 'selection', prompt: '请选择图表库：', items: [{ label: 'Recharts', description: 'React 原生，轻量' }, { label: 'Chart.js', description: '功能全面' }, { label: 'D3.js', description: '最灵活，学习曲线高' }, { label: 'Nivo', description: '基于 D3，开箱即用' }], resolved: true, resolvedValue: 'Recharts' }, timestamp: '09:31' },
  { id: 'd-m4', role: 'agent', toolCall: { name: 'npm install recharts date-fns', status: 'done', duration: '4.2s' }, timestamp: '09:31' },
  { id: 'd-m5', role: 'agent', toolCall: { name: 'write src/components/charts/AreaChart.tsx', status: 'done', duration: '1.2s' }, timestamp: '09:32' },
  { id: 'd-m6', role: 'agent', toolCall: { name: 'write src/components/charts/BarChart.tsx', status: 'done', duration: '0.9s' }, timestamp: '09:32' },
  { id: 'd-m7', role: 'agent', toolCall: { name: 'write src/components/StatCard.tsx', status: 'done', duration: '0.6s' }, timestamp: '09:33' },
  { id: 'd-m8', role: 'agent', toolCall: { name: 'write src/components/DataTable.tsx', status: 'done', duration: '1.1s' }, timestamp: '09:33' },
  { id: 'd-m9', role: 'agent', toolCall: { name: 'write src/components/Sidebar.tsx', status: 'done', duration: '0.8s' }, timestamp: '09:34' },
  { id: 'd-m10', role: 'agent', toolCall: { name: 'write src/Dashboard.tsx', status: 'done', duration: '1.5s' }, timestamp: '09:34' },
  { id: 'd-m11', role: 'agent', content: 'Dashboard 基础框架完成！包含 4 个统计卡片、收入面积图、流量柱状图和订单表格。', timestamp: '09:35' },
  { id: 'd-m12', role: 'user', content: '加一个实时数据更新功能，每 5 秒刷新一次图表数据。', timestamp: '09:36' },
  { id: 'd-m13', role: 'agent', toolCall: { name: 'write src/hooks/useRealtimeData.ts', status: 'done', duration: '0.7s' }, timestamp: '09:36' },
  { id: 'd-m14', role: 'agent', toolCall: { name: 'update src/Dashboard.tsx', status: 'done', duration: '0.5s' }, timestamp: '09:37' },
  { id: 'd-m15', role: 'agent', content: '已添加实时数据更新功能，使用 useRealtimeData hook 每 5 秒自动刷新图表数据，带平滑过渡动画。', timestamp: '09:37' },
  { id: 'd-m16', role: 'agent', generativeUI: { type: 'buttons', prompt: '需要哪些额外功能？', options: [{ label: '添加日期范围筛选' }, { label: '添加导出 CSV' }, { label: '添加暗色主题' }, { label: '暂时够了' }], resolved: true, resolvedValue: '添加日期范围筛选' }, timestamp: '09:37' },
  { id: 'd-m17', role: 'agent', toolCall: { name: 'write src/components/DateRangePicker.tsx', status: 'done', duration: '1.3s' }, timestamp: '09:38' },
  { id: 'd-m18', role: 'agent', content: '日期范围筛选器已添加到顶部导航栏，支持预设（今天/7天/30天/自定义）。', timestamp: '09:38' },
  // Pending low-risk file write permission
  { id: 'd-m19', role: 'agent', permissionRequest: {
    id: 'perm-d-m19',
    toolName: 'file.write',
    toolDescription: '要将下面的代码写入 src/utils/exportCsv.ts（新建文件），是否允许？',
    params: [
      { label: '路径', value: 'src/utils/exportCsv.ts' },
      { label: '内容预览', value: `import { format } from 'date-fns';

export interface CsvColumn<T> {
  header: string;
  accessor: (row: T) => string | number | null | undefined;
}

export function exportCsv<T>(rows: T[], columns: CsvColumn<T>[], filename = 'export.csv') {
  const lines: string[] = [];
  lines.push(columns.map(c => escapeField(c.header)).join(','));
  for (const row of rows) {
    lines.push(columns.map(c => {
      const v = c.accessor(row);
      return escapeField(v == null ? '' : String(v));
    }).join(','));
  }
  const blob = new Blob(['\\ufeff' + lines.join('\\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || \`export-\${format(new Date(), 'yyyyMMdd-HHmmss')}.csv\`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeField(s: string) {
  if (/[",\\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}` },
    ],
    risk: 'low',
    status: 'pending',
    allowAutoApprove: true,
  }, timestamp: '09:39' },
];

const SESSION_3_PREVIEW = '<!DOCTYPE html>\n<html><head><meta charset="utf-8"><style>\n* { margin: 0; padding: 0; box-sizing: border-box; }\nbody { font-family: \'Inter\', system-ui, sans-serif; background: #f8fafc; color: #0f172a; display: flex; height: 100vh; }\n.sidebar { width: 200px; background: #fff; border-right: 1px solid #f1f5f9; padding: 16px; flex-shrink: 0; }\n.sidebar h2 { font-size: 13px; font-weight: 600; margin-bottom: 20px; }\n.nav-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 6px; font-size: 12px; color: #64748b; margin-bottom: 2px; cursor: pointer; }\n.nav-item.active { background: #f1f5f9; color: #0f172a; font-weight: 500; }\n.main { flex: 1; padding: 20px 24px; overflow: auto; }\n.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }\n.stat { background: #fff; border: 1px solid #f1f5f9; border-radius: 10px; padding: 16px; }\n.stat-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }\n.stat-value { font-size: 22px; font-weight: 700; margin-top: 4px; }\n.stat-change { font-size: 10px; margin-top: 2px; }\n.up { color: #059669; }\n.down { color: #ef4444; }\n.charts { display: grid; grid-template-columns: 2fr 1fr; gap: 12px; margin-bottom: 16px; }\n.chart-box { background: #fff; border: 1px solid #f1f5f9; border-radius: 10px; padding: 16px; }\n.chart-box h3 { font-size: 12px; font-weight: 500; margin-bottom: 12px; }\n.chart-placeholder { height: 160px; background: linear-gradient(180deg, #ecfdf5 0%, #fff 100%); border-radius: 8px; display: flex; align-items: flex-end; padding: 0 4px; gap: 3px; }\n.bar { background: #10b981; border-radius: 3px 3px 0 0; flex: 1; }\n</style></head><body>\n<div class="sidebar">\n<h2>Dashboard</h2>\n<div class="nav-item active">Overview</div>\n<div class="nav-item">Analytics</div>\n<div class="nav-item">Customers</div>\n<div class="nav-item">Orders</div>\n<div class="nav-item">Settings</div>\n</div>\n<div class="main">\n<div class="stats">\n<div class="stat"><div class="stat-label">Total Revenue</div><div class="stat-value">$45,231</div><div class="stat-change up">+20.1%</div></div>\n<div class="stat"><div class="stat-label">Active Users</div><div class="stat-value">2,350</div><div class="stat-change up">+18.2%</div></div>\n<div class="stat"><div class="stat-label">Conversion</div><div class="stat-value">3.24%</div><div class="stat-change down">-2.1%</div></div>\n<div class="stat"><div class="stat-label">Avg Session</div><div class="stat-value">4m 32s</div><div class="stat-change up">+12.5%</div></div>\n</div>\n<div class="charts">\n<div class="chart-box"><h3>Revenue Overview</h3><div class="chart-placeholder"><div class="bar" style="height:40%"></div><div class="bar" style="height:55%"></div><div class="bar" style="height:45%"></div><div class="bar" style="height:70%"></div><div class="bar" style="height:60%"></div><div class="bar" style="height:80%"></div><div class="bar" style="height:65%"></div><div class="bar" style="height:90%"></div><div class="bar" style="height:75%"></div><div class="bar" style="height:85%"></div><div class="bar" style="height:95%"></div><div class="bar" style="height:88%"></div></div></div>\n<div class="chart-box"><h3>Traffic Sources</h3><div class="chart-placeholder" style="flex-direction:column;align-items:stretch;padding:8px;gap:6px"><div style="background:#10b981;height:24px;border-radius:4px;width:85%"></div><div style="background:#60a5fa;height:24px;border-radius:4px;width:62%"></div><div style="background:#f59e0b;height:24px;border-radius:4px;width:48%"></div><div style="background:#a78bfa;height:24px;border-radius:4px;width:30%"></div></div></div>\n</div>\n</div>\n</body></html>';

// ===========================
// Session 4: Auth System
// ===========================

const SESSION_4_FILES: FileNode[] = [
  {
    name: 'src', type: 'folder', children: [
      {
        name: 'auth', type: 'folder', children: [
          { name: 'middleware.ts', type: 'file' },
          { name: 'jwt.ts', type: 'file' },
          { name: 'oauth.ts', type: 'file' },
          { name: 'session.ts', type: 'file' },
          { name: 'types.ts', type: 'file' },
        ]
      },
      {
        name: 'routes', type: 'folder', children: [
          { name: 'auth.routes.ts', type: 'file' },
          { name: 'user.routes.ts', type: 'file' },
        ]
      },
      {
        name: 'models', type: 'folder', children: [
          { name: 'User.ts', type: 'file' },
          { name: 'RefreshToken.ts', type: 'file' },
        ]
      },
      { name: 'app.ts', type: 'file' },
    ]
  },
  { name: 'prisma', type: 'folder', children: [
    { name: 'schema.prisma', type: 'file' },
  ]},
  { name: '.env.example', type: 'file' },
  { name: 'package.json', type: 'file' },
];

const SESSION_4_CONTENTS: Record<string, string> = {
  'src/auth/jwt.ts': "import jwt from 'jsonwebtoken'\nimport { User, TokenPayload } from './types'\n\nconst ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET!\nconst REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!\n\nexport function generateAccessToken(user: User): string {\n  const payload: TokenPayload = {\n    userId: user.id,\n    email: user.email,\n    role: user.role,\n  }\n  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {\n    expiresIn: '15m',\n  })\n}\n\nexport function generateRefreshToken(user: User): string {\n  return jwt.sign(\n    { userId: user.id },\n    REFRESH_TOKEN_SECRET,\n    { expiresIn: '7d' }\n  )\n}\n\nexport function verifyAccessToken(token: string): TokenPayload {\n  return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload\n}\n\nexport function verifyRefreshToken(token: string): { userId: string } {\n  return jwt.verify(token, REFRESH_TOKEN_SECRET) as { userId: string }\n}",

  'src/auth/middleware.ts': "import { Request, Response, NextFunction } from 'express'\nimport { verifyAccessToken } from './jwt'\n\nexport function authMiddleware(\n  req: Request,\n  res: Response,\n  next: NextFunction\n) {\n  const authHeader = req.headers.authorization\n  if (!authHeader?.startsWith('Bearer ')) {\n    return res.status(401).json({\n      error: 'Missing authorization header',\n    })\n  }\n\n  try {\n    const token = authHeader.split(' ')[1]\n    const payload = verifyAccessToken(token)\n    req.user = payload\n    next()\n  } catch (error) {\n    return res.status(401).json({\n      error: 'Invalid or expired token',\n    })\n  }\n}\n\nexport function requireRole(...roles: string[]) {\n  return (req: Request, res: Response, next: NextFunction) => {\n    if (!req.user || !roles.includes(req.user.role)) {\n      return res.status(403).json({\n        error: 'Insufficient permissions',\n      })\n    }\n    next()\n  }\n}",

  'prisma/schema.prisma': 'generator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\nmodel User {\n  id           String         @id @default(cuid())\n  email        String         @unique\n  name         String?\n  passwordHash String?\n  role         String         @default("user")\n  avatar       String?\n  provider     String         @default("local")\n  providerId   String?\n  createdAt    DateTime       @default(now())\n  updatedAt    DateTime       @updatedAt\n  tokens       RefreshToken[]\n}\n\nmodel RefreshToken {\n  id        String   @id @default(cuid())\n  token     String   @unique\n  userId    String\n  user      User     @relation(fields: [userId], references: [id])\n  expiresAt DateTime\n  createdAt DateTime @default(now())\n}',
};

const SESSION_4_STEPS: WorkflowStep[] = [
  { id: 'a1', icon: 'search', label: '调研认证模式', status: 'done' },
  { id: 'a2', icon: 'install', label: '安装认证依赖', status: 'done',
    details: [
      { icon: '📦', label: 'jsonwebtoken, bcryptjs, passport', meta: 'deps' },
      { icon: '📦', label: 'passport-google-oauth20', meta: 'deps' },
      { icon: '📦', label: '@prisma/client, prisma', meta: 'deps' },
    ],
  },
  { id: 'a3', icon: 'config', label: '配置 Prisma 数据模型', status: 'done' },
  { id: 'a4', icon: 'code', label: '实现 JWT 工具', status: 'done' },
  { id: 'a5', icon: 'code', label: '创建认证中间件', status: 'done' },
  { id: 'a6', icon: 'code', label: '添加 Google OAuth', status: 'done' },
  { id: 'a7', icon: 'code', label: '构建认证路由', status: 'done' },
  { id: 'a8', icon: 'finish', label: '认证系统完成', status: 'done' },
];

const SESSION_4_MESSAGES: AgentChatMessage[] = [
  { id: 'a-m1', role: 'user', content: '帮我实现一套完整的用户认证系统，需要支持 JWT 和 Google OAuth 登录。后端用 Express + Prisma + PostgreSQL。', timestamp: '16:00' },
  { id: 'a-m2', role: 'agent', thinking: 'Full auth system with JWT (access + refresh tokens), Google OAuth via Passport.js, Prisma ORM with PostgreSQL. Need to set up middleware, routes, token management.', content: '好的，我将构建一套完整的认证系统，包含：\n\n• JWT access token (15min) + refresh token (7d) 双令牌机制\n• Google OAuth 2.0 社交登录\n• Prisma ORM + PostgreSQL 数据层\n• 角色权限中间件 (RBAC)', timestamp: '16:00' },
  { id: 'a-m3', role: 'agent', toolCall: { name: 'npm install jsonwebtoken bcryptjs passport passport-google-oauth20', status: 'done', duration: '6.1s' }, timestamp: '16:01' },
  { id: 'a-m4', role: 'agent', toolCall: { name: 'npx prisma init', status: 'done', duration: '2.3s' }, timestamp: '16:01' },
  { id: 'a-m5', role: 'agent', toolCall: { name: 'write prisma/schema.prisma', status: 'done', duration: '0.8s' }, timestamp: '16:02' },
  { id: 'a-m6', role: 'agent', generativeUI: { type: 'confirmation', prompt: 'Prisma schema 已创建（User + RefreshToken 模型）。是否立即运行 prisma migrate 生成数据库表？', confirmLabel: 'Run migration', cancelLabel: 'Later', confirmVariant: 'primary', resolved: true, resolvedValue: 'confirm' }, timestamp: '16:02' },
  { id: 'a-m7', role: 'agent', toolCall: { name: 'npx prisma migrate dev --name init', status: 'done', duration: '4.5s' }, timestamp: '16:03' },
  { id: 'a-m8', role: 'agent', toolCall: { name: 'write src/auth/jwt.ts', status: 'done', duration: '0.9s' }, timestamp: '16:03' },
  { id: 'a-m9', role: 'agent', toolCall: { name: 'write src/auth/middleware.ts', status: 'done', duration: '0.7s' }, timestamp: '16:04' },
  { id: 'a-m10', role: 'agent', toolCall: { name: 'write src/auth/oauth.ts', status: 'done', duration: '1.1s' }, timestamp: '16:04' },
  { id: 'a-m11', role: 'agent', toolCall: { name: 'write src/routes/auth.routes.ts', status: 'done', duration: '1.3s' }, timestamp: '16:05' },
  { id: 'a-m12', role: 'agent', content: '认证系统核心已完成！API endpoints：\n\n• POST /auth/register\n• POST /auth/login\n• POST /auth/refresh\n• GET /auth/google\n• POST /auth/logout', timestamp: '16:05' },
  { id: 'a-m13', role: 'user', content: '再加一个邮箱验证功能和密码重置。', timestamp: '16:06' },
  { id: 'a-m14', role: 'agent', generativeUI: { type: 'selection', prompt: '邮件发送服务选择：', items: [{ label: 'Resend', description: '开发者友好，免费额度 100/天' }, { label: 'SendGrid', description: '企业级，免费额度 100/天' }, { label: 'Nodemailer + SMTP', description: '自托管，无限制' }], resolved: true, resolvedValue: 'Resend' }, timestamp: '16:06' },
  { id: 'a-m15', role: 'agent', toolCall: { name: 'npm install resend', status: 'done', duration: '2.1s' }, timestamp: '16:07' },
  { id: 'a-m16', role: 'agent', toolCall: { name: 'write src/auth/email.ts', status: 'done', duration: '0.9s' }, timestamp: '16:07' },
  { id: 'a-m17', role: 'agent', content: '邮箱验证和密码重置功能已添加。新增 endpoints：\n\n• POST /auth/verify-email\n• POST /auth/forgot-password\n• POST /auth/reset-password', timestamp: '16:08' },
  { id: 'a-m18', role: 'agent', generativeUI: { type: 'selection', prompt: '选择日志记录方案：', items: [{ label: 'Winston', description: '功能全面，生态成熟' }, { label: 'Pino', description: '高性能，JSON 原生' }, { label: 'Bunyan', description: '结构化日志' }], resolved: false }, timestamp: '16:08' },
  { id: 'a-m19', role: 'agent', generativeUI: { type: 'buttons', prompt: '还需要什么？', options: [{ label: '添加 Rate Limiting' }, { label: '添加 2FA 双因子' }, { label: '编写单元测试' }, { label: '这样就够了' }], resolved: false }, timestamp: '16:09' },
  { id: 'a-m20', role: 'agent', generativeUI: { type: 'confirmation', prompt: '是否立即部署到 staging 环境进行集成测试？', confirmLabel: '部署', cancelLabel: '稍后', confirmVariant: 'primary', resolved: false }, timestamp: '16:09' },
];

// ===========================
// Session 6: API Performance Report
// ===========================

const SESSION_6_FILES: FileNode[] = [
  {
    name: 'reports', type: 'folder', children: [
      { name: 'performance-analysis.md', type: 'file' },
      { name: 'optimization-plan.md', type: 'file' },
      { name: 'redis-caching-strategy.md', type: 'file' },
    ]
  },
  {
    name: 'benchmarks', type: 'folder', children: [
      { name: 'load-test-results.json', type: 'file' },
      { name: 'slow-queries.sql', type: 'file' },
      { name: 'index-recommendations.sql', type: 'file' },
    ]
  },
  { name: 'README.md', type: 'file' },
];

const SESSION_6_CONTENTS: Record<string, string> = {
  'reports/performance-analysis.md': '# API 性能分析报告\n\n## 概述\n\n对当前生产环境 API 进行了全面的性能分析，\n基于过去 30 天的监控数据和专项压力测试。\n\n## 关键指标\n\n| 指标 | 当前值 | 目标值 | 差距 |\n|------|--------|--------|------|\n| P50 延迟 | 180ms | <100ms | 80ms |\n| P99 延迟 | 2.4s | <500ms | 1.9s |\n| 吞吐量 | 850 RPS | 2000 RPS | 1150 |\n| 错误率 | 0.8% | <0.1% | 0.7% |\n\n## 瓶颈分析\n\n### 1. 数据库层 (60% 影响)\n- 缺少复合索引导致全表扫描\n- N+1 查询问题严重\n- 连接池配置不当 (max=5, 需要 20)\n\n### 2. 缓存层 (25% 影响)\n- 未使用 Redis 缓存热点数据\n- 重复计算排行榜数据\n- Session 存储在数据库而非 Redis\n\n### 3. 应用层 (15% 影响)\n- 同步文件 I/O 阻塞事件循环\n- JSON 序列化大对象效率低\n- 未启用响应压缩\n\n## 优化路线图\n\nPhase 1 (本周): 数据库索引 + 连接池优化\nPhase 2 (下周): Redis 缓存引入\nPhase 3 (第3周): 应用层代码优化\nPhase 4 (第4周): CDN + 压缩 + 监控完善\n\n预期效果: P50 < 80ms, P99 < 300ms, 3000+ RPS',

  'benchmarks/slow-queries.sql': '-- Top 10 Slowest Queries (Last 30 days)\n\n-- 1. User search (avg 1.2s)\nSELECT * FROM users\nWHERE name ILIKE \'%search_term%\'\nOR email ILIKE \'%search_term%\'\nORDER BY created_at DESC\nLIMIT 20;\n-- FIX: Add GIN index on name, email\n\n-- 2. Order statistics (avg 800ms)\nSELECT\n  DATE_TRUNC(\'day\', created_at) as day,\n  COUNT(*) as order_count,\n  SUM(total) as revenue\nFROM orders\nWHERE created_at > NOW() - INTERVAL \'30 days\'\nGROUP BY day\nORDER BY day;\n-- FIX: Add index on (created_at) + materialized view\n\n-- 3. Product listing with relations (avg 650ms)\nSELECT p.*, c.name as category_name,\n  (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) as review_count,\n  (SELECT AVG(rating) FROM reviews r WHERE r.product_id = p.id) as avg_rating\nFROM products p\nJOIN categories c ON c.id = p.category_id\nWHERE p.active = true\nORDER BY p.created_at DESC\nLIMIT 50;\n-- FIX: Eliminate N+1, use JOIN + GROUP BY',

  'benchmarks/index-recommendations.sql': '-- Recommended Database Indexes\n\n-- Users table\nCREATE INDEX CONCURRENTLY idx_users_search\n  ON users USING gin (\n    to_tsvector(\'english\', name || \' \' || email)\n  );\n\n-- Orders table\nCREATE INDEX CONCURRENTLY idx_orders_created_at\n  ON orders (created_at DESC)\n  WHERE created_at > NOW() - INTERVAL \'90 days\';\n\nCREATE INDEX CONCURRENTLY idx_orders_user_status\n  ON orders (user_id, status)\n  INCLUDE (total, created_at);\n\n-- Products table\nCREATE INDEX CONCURRENTLY idx_products_active_created\n  ON products (created_at DESC)\n  WHERE active = true;\n\n-- Reviews table\nCREATE INDEX CONCURRENTLY idx_reviews_product_rating\n  ON reviews (product_id)\n  INCLUDE (rating);',
};

const SESSION_6_STEPS: WorkflowStep[] = [
  { id: 'p1', icon: 'search', label: '分析监控数据', status: 'done',
    description: '分析了过去 30 天的 APM 监控数据、慢查询日志和错误报告。' },
  { id: 'p2', icon: 'review', label: '执行压力测试', status: 'done',
    details: [
      { icon: '⚡', label: '100 concurrent users, 10min duration', meta: 'k6' },
      { icon: '⚡', label: '500 concurrent users, 5min stress test', meta: 'k6' },
    ],
  },
  { id: 'p3', icon: 'code', label: '定位慢查询', status: 'done',
    details: [
      { icon: '🐌', label: 'User search: 1.2s avg (full table scan)', meta: 'critical' },
      { icon: '🐌', label: 'Order statistics: 800ms avg', meta: 'high' },
      { icon: '🐌', label: 'Product listing: 650ms (N+1)', meta: 'high' },
    ],
  },
  { id: 'p4', icon: 'write', label: '编写分析报告', status: 'done' },
  { id: 'p5', icon: 'write', label: '制定优化方案', status: 'done' },
  { id: 'p6', icon: 'finish', label: '报告已交付', status: 'done' },
];

const SESSION_6_MESSAGES: AgentChatMessage[] = [
  { id: 'p-m1', role: 'user', content: '我们的 API 最近响应很慢，P99 延迟到了 2.4 秒。帮我分析一下瓶颈在哪里，给出优化方案。', timestamp: '15:00' },
  { id: 'p-m2', role: 'agent', thinking: 'API performance issue. Need to analyze: 1) Database queries 2) Caching strategy 3) Application code 4) Network/infrastructure. Will check monitoring data and run targeted load tests.', content: '了解，我来对 API 进行全面的性能诊断。我会从数据库、缓存、应用层三个维度分析。', timestamp: '15:00' },
  { id: 'p-m3', role: 'agent', toolCall: { name: 'fetch APM monitoring data (last 30 days)', status: 'done', duration: '8.2s' }, timestamp: '15:01' },
  { id: 'p-m4', role: 'agent', toolCall: { name: 'analyze slow query logs', status: 'done', duration: '5.6s' }, timestamp: '15:02' },
  { id: 'p-m5', role: 'agent', toolCall: { name: 'run k6 load test (100 concurrent, 10min)', status: 'done', duration: '32.4s' }, timestamp: '15:03' },
  { id: 'p-m6', role: 'agent', content: '初步分析完成，发现了 3 个主要瓶颈：\n\n1. **数据库层 (60%)** — 缺少索引导致全表扫描，最慢查询 1.2s\n2. **缓存层 (25%)** — 未使用 Redis，热点数据重复查询\n3. **应用层 (15%)** — N+1 查询、同步 I/O 阻塞', timestamp: '15:04' },
  { id: 'p-m7', role: 'agent', generativeUI: { type: 'confirmation', prompt: '是否运行 500 并发的压力测试来确认瓶颈？这可能会短暂影响生产环境性能。', confirmLabel: '在低峰期运行', cancelLabel: '跳过', confirmVariant: 'danger', resolved: true, resolvedValue: 'confirm' }, timestamp: '15:04' },
  { id: 'p-m8', role: 'agent', toolCall: { name: 'run k6 stress test (500 concurrent, 5min)', status: 'done', duration: '28.1s' }, timestamp: '15:05' },
  { id: 'p-m9', role: 'agent', toolCall: { name: 'write reports/performance-analysis.md', status: 'done', duration: '3.4s' }, timestamp: '15:06' },
  { id: 'p-m10', role: 'agent', toolCall: { name: 'write benchmarks/slow-queries.sql', status: 'done', duration: '1.2s' }, timestamp: '15:06' },
  { id: 'p-m11', role: 'agent', toolCall: { name: 'write benchmarks/index-recommendations.sql', status: 'done', duration: '0.8s' }, timestamp: '15:07' },
  { id: 'p-m12', role: 'agent', toolCall: { name: 'write reports/optimization-plan.md', status: 'done', duration: '2.1s' }, timestamp: '15:07' },
  { id: 'p-m13', role: 'agent', content: '完整分析报告已输出。4 周优化路线图：\n\n• Week 1: 添加 5 个数据库索引\n• Week 2: 引入 Redis 缓存\n• Week 3: 修复 N+1 查询 + 连接池\n• Week 4: CDN + 压缩 + 完善监控\n\n预期最终效果：P50 < 80ms, P99 < 300ms, 3000+ RPS。', timestamp: '15:08' },
  { id: 'p-m14', role: 'agent', generativeUI: { type: 'buttons', prompt: '需要我进一步做什么？', options: [{ label: '立即执行 Phase 1 索引优化' }, { label: '编写 Redis 缓存方案详细设计' }, { label: '生成 Grafana 监控面板配置' }], resolved: false }, timestamp: '15:08' },
];

const SESSION_6_PREVIEW = '<!DOCTYPE html>\n<html><head><meta charset="utf-8"><style>\n* { margin: 0; padding: 0; box-sizing: border-box; }\nbody { font-family: \'Inter\', system-ui, sans-serif; background: #fff; color: #1e293b; padding: 32px 40px; }\nh1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }\n.meta { font-size: 11px; color: #94a3b8; margin-bottom: 24px; }\nh2 { font-size: 14px; font-weight: 600; margin-top: 24px; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; }\n.metrics { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin: 12px 0 20px; }\n.metric { border: 1px solid #f1f5f9; border-radius: 8px; padding: 14px; }\n.metric-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; }\n.metric-value { font-size: 20px; font-weight: 700; margin: 4px 0 2px; }\n.metric-target { font-size: 10px; color: #94a3b8; }\n.bad { color: #ef4444; }\n.bottleneck { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid #f1f5f9; border-radius: 8px; margin-bottom: 8px; }\n.bn-pct { font-size: 18px; font-weight: 700; width: 56px; text-align: center; }\n.bn-name { font-size: 12px; font-weight: 500; }\n.bn-desc { font-size: 11px; color: #64748b; }\n.timeline { padding-left: 20px; border-left: 2px solid #e2e8f0; margin-top: 16px; }\n.phase { position: relative; padding: 0 0 20px 20px; }\n.phase::before { content: \'\'; position: absolute; left: -7px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: #10b981; }\n.phase-title { font-size: 12px; font-weight: 500; }\n.phase-desc { font-size: 11px; color: #64748b; }\n</style></head><body>\n<h1>API 性能分析报告</h1>\n<p class="meta">调研分析师 · 2026-02-25 · 基于 30 天监控数据</p>\n<div class="metrics">\n<div class="metric"><div class="metric-label">P50 延迟</div><div class="metric-value bad">180ms</div><div class="metric-target">目标 &lt;100ms</div></div>\n<div class="metric"><div class="metric-label">P99 延迟</div><div class="metric-value bad">2.4s</div><div class="metric-target">目标 &lt;500ms</div></div>\n<div class="metric"><div class="metric-label">吞吐量</div><div class="metric-value">850 RPS</div><div class="metric-target">目标 2000 RPS</div></div>\n<div class="metric"><div class="metric-label">错误率</div><div class="metric-value bad">0.8%</div><div class="metric-target">目标 &lt;0.1%</div></div>\n</div>\n<h2>瓶颈分析</h2>\n<div class="bottleneck"><div class="bn-pct" style="color:#ef4444">60%</div><div><div class="bn-name">数据库层</div><div class="bn-desc">缺少索引 N+1 查询 连接池不足</div></div></div>\n<div class="bottleneck"><div class="bn-pct" style="color:#f59e0b">25%</div><div><div class="bn-name">缓存层</div><div class="bn-desc">无 Redis 重复计算 Session 存 DB</div></div></div>\n<div class="bottleneck"><div class="bn-pct" style="color:#3b82f6">15%</div><div><div class="bn-name">应用层</div><div class="bn-desc">同步 I/O 大 JSON 序列化 无压缩</div></div></div>\n<h2>优化路线图</h2>\n<div class="timeline">\n<div class="phase"><div class="phase-title">Phase 1: 数据库索引 + 连接池</div><div class="phase-desc">本周 预计 P50 降至 80ms</div></div>\n<div class="phase"><div class="phase-title">Phase 2: Redis 缓存引入</div><div class="phase-desc">下周 预计 P99 降至 500ms</div></div>\n<div class="phase"><div class="phase-title">Phase 3: 应用层优化</div><div class="phase-desc">第3周 预计吞吐量翻倍</div></div>\n<div class="phase"><div class="phase-title">Phase 4: CDN + 监控完善</div><div class="phase-desc">第4周 最终目标 3000+ RPS</div></div>\n</div>\n</body></html>';

// ===========================
// Session Data Map
// ===========================

// ===========================
// Showcase Sessions — rich artifact types (PDF / Markdown / Slides)
// ===========================

const SESSION_PDF_MESSAGES: AgentChatMessage[] = [
  { id: 'pdf-m1', role: 'user', content: '帮我整理 Q4 用户行为分析报告，要 PDF 格式，包含数据图表和关键洞察。', timestamp: '15:10' },
  { id: 'pdf-m2', role: 'agent', thinking: '需要从分析数据中提炼关键指标，按照标准报告格式生成 PDF：执行摘要、数据图表、关键发现、建议方案。', content: '我会生成一份结构化的 Q4 用户行为分析报告（PDF 格式），包含执行摘要、数据图表、关键发现和行动建议四个部分。', timestamp: '15:10' },
  { id: 'pdf-m3', role: 'agent', toolCall: { name: 'query analytics: Q4 user behavior data', status: 'done', duration: '3.4s' }, content: '数据已提取：\n• 月活跃用户 (MAU): 124,800\n• 用户留存率：D1 68%, D7 42%, D30 28%\n• 平均会话时长：4分32秒\n• 转化漏斗：访问 → 注册 → 付费 = 100% → 18% → 3.2%\n• 内容偏好 TOP3: 教程类(42%), 案例分析(28%), 行业动态(18%)', timestamp: '15:11' },
  { id: 'pdf-m4', role: 'agent', toolCall: { name: 'analyze trends: cohort retention', status: 'done', duration: '2.8s' }, content: 'Cohort 分析显示：\n• 新用户首日跳出率从 Q3 的 38% 降至 32% (改善 6pp)\n• D30 留存提升 4pp，主要来自付费用户群\n• 流失高峰在第 8-14 天，建议设计 D7 唤醒机制', timestamp: '15:12' },
  { id: 'pdf-m5', role: 'agent', toolCall: { name: 'generate charts: 8 figures', status: 'done', duration: '4.5s' }, content: '已生成 8 个数据可视化图表：MAU 趋势、留存漏斗、Cohort 热力图、用户路径桑基图、行为偏好雷达图、转化率对比、流失曲线、收入构成。', timestamp: '15:13' },
  { id: 'pdf-m6', role: 'agent', toolCall: { name: 'write reports/Q4-user-behavior-report.pdf', status: 'done', duration: '6.2s' }, content: 'PDF 报告已生成：18 页，包含 8 张图表、3 个数据表格、24 个关键指标。文件大小 2.4 MB。', timestamp: '15:14' },
  { id: 'pdf-m7', role: 'agent', content: 'Q4 用户行为分析报告已完成。核心结论：\n\n**1. 用户规模稳健增长** — MAU 同比 +24%，环比 +8%\n**2. 留存改善显著** — D30 留存达 28%，超过行业均值 6pp\n**3. 付费转化是机会点** — 当前 3.2% 远低于头部水平 8%\n\n关键建议已在报告"行动方案"章节展开，包含 7 项可执行优化。', timestamp: '15:14' },
];

const SESSION_PDF_STEPS: WorkflowStep[] = [
  { id: 'pdf-s1', label: '提取 Q4 用户行为数据', status: 'done' },
  { id: 'pdf-s2', label: 'Cohort 留存分析', status: 'done' },
  { id: 'pdf-s3', label: '生成数据可视化图表', status: 'done' },
  { id: 'pdf-s4', label: '撰写报告正文与建议', status: 'done' },
  { id: 'pdf-s5', label: '导出 PDF', status: 'done' },
];

const SESSION_PDF_PREVIEW = `<!DOCTYPE html>
<html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, 'PingFang SC', system-ui, sans-serif; background: #e5e7eb; padding: 28px 0; color: #111827; }
  .toolbar { position: sticky; top: 0; z-index: 10; max-width: 800px; margin: 0 auto 18px; background: rgba(255,255,255,0.85); backdrop-filter: blur(8px); border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px 16px; display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #6b7280; }
  .toolbar-title { display: flex; align-items: center; gap: 8px; color: #111827; font-weight: 500; }
  .doc-pill { background: #fee2e2; color: #dc2626; font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: 600; }
  .page-num { font-variant-numeric: tabular-nums; }
  .page { background: white; max-width: 800px; margin: 0 auto 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); padding: 64px 72px; min-height: 1040px; position: relative; }
  .doc-header { border-bottom: 3px solid #0f172a; padding-bottom: 20px; margin-bottom: 32px; }
  .doc-meta { font-size: 11px; color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px; }
  .doc-title { font-size: 28px; font-weight: 700; letter-spacing: -0.02em; color: #0f172a; line-height: 1.2; }
  .doc-sub { font-size: 13px; color: #475569; margin-top: 8px; }
  h2 { font-size: 18px; font-weight: 600; color: #0f172a; margin: 28px 0 14px; padding-left: 12px; border-left: 4px solid #2563eb; }
  h3 { font-size: 14px; font-weight: 600; color: #1e293b; margin: 18px 0 8px; }
  p { font-size: 13px; line-height: 1.85; color: #334155; margin-bottom: 12px; }
  .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0 20px; }
  .summary-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
  .summary-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; }
  .summary-value { font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 4px; }
  .summary-delta { font-size: 11px; margin-top: 2px; }
  .up { color: #059669; } .down { color: #dc2626; }
  .chart-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 12px 0 20px; }
  .chart-title { font-size: 12px; color: #475569; margin-bottom: 12px; font-weight: 500; }
  .funnel { display: flex; align-items: flex-end; gap: 6px; height: 160px; }
  .funnel-bar { flex: 1; background: linear-gradient(180deg, #2563eb, #60a5fa); border-radius: 4px 4px 0 0; position: relative; }
  .funnel-bar span { position: absolute; top: -18px; left: 0; right: 0; text-align: center; font-size: 10px; color: #475569; }
  .funnel-bar small { position: absolute; bottom: -22px; left: 0; right: 0; text-align: center; font-size: 10px; color: #94a3b8; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin: 8px 0 16px; }
  th { text-align: left; padding: 8px 10px; background: #f8fafc; color: #475569; font-weight: 500; border-bottom: 1px solid #e2e8f0; }
  td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; color: #334155; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  .insight { background: #eff6ff; border-left: 3px solid #2563eb; padding: 12px 16px; border-radius: 0 6px 6px 0; margin: 14px 0; }
  .insight-title { font-size: 12px; font-weight: 600; color: #1e40af; margin-bottom: 4px; }
  .insight-body { font-size: 12px; color: #1e3a8a; line-height: 1.7; }
  .page-footer { position: absolute; bottom: 32px; left: 72px; right: 72px; padding-top: 14px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
  ul.kpi-list { margin: 8px 0 16px; padding-left: 0; list-style: none; }
  ul.kpi-list li { font-size: 13px; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; color: #334155; display: flex; justify-content: space-between; }
  ul.kpi-list strong { color: #0f172a; font-weight: 600; }
</style></head><body>

<div class="toolbar">
  <div class="toolbar-title"><span class="doc-pill">PDF</span><span>Q4-user-behavior-report.pdf</span></div>
  <div class="page-num">第 1 页 / 共 18 页</div>
</div>

<div class="page">
  <div class="doc-header">
    <div class="doc-meta">CHERRY · 数据分析报告 · 2026-Q4</div>
    <div class="doc-title">Q4 用户行为分析报告</div>
    <div class="doc-sub">报告周期：2025-10-01 至 2025-12-31 · 数据源：18 个埋点事件 · 样本量 124,800</div>
  </div>

  <h2>执行摘要</h2>
  <p>本季度月活跃用户达 <strong>124,800</strong>，同比增长 24%，环比增长 8%。整体留存改善显著，D30 留存达 28%（高于行业均值 6pp）。付费转化是当前最大机会点，3.2% 的转化率与头部产品 8% 仍有较大差距。</p>

  <div class="summary-grid">
    <div class="summary-card"><div class="summary-label">MAU</div><div class="summary-value">124.8k</div><div class="summary-delta up">+24.0% YoY</div></div>
    <div class="summary-card"><div class="summary-label">D30 留存</div><div class="summary-value">28%</div><div class="summary-delta up">+4pp QoQ</div></div>
    <div class="summary-card"><div class="summary-label">付费转化</div><div class="summary-value">3.2%</div><div class="summary-delta down">−0.4pp QoQ</div></div>
    <div class="summary-card"><div class="summary-label">平均会话</div><div class="summary-value">4m32s</div><div class="summary-delta up">+18s QoQ</div></div>
  </div>

  <h2>关键指标变化</h2>
  <ul class="kpi-list">
    <li><span>新用户首日跳出率</span><strong>32% (↓ 6pp)</strong></li>
    <li><span>核心功能采用率</span><strong>71% (↑ 9pp)</strong></li>
    <li><span>付费用户 ARPU</span><strong>¥248 (↑ ¥12)</strong></li>
    <li><span>NPS 净推荐值</span><strong>+42 (↑ 7)</strong></li>
  </ul>

  <h2>用户转化漏斗</h2>
  <div class="chart-box">
    <div class="chart-title">访问 → 注册 → 激活 → 付费 (Q4 全季度)</div>
    <div class="funnel">
      <div class="funnel-bar" style="height:100%"><span>100%</span><small>访问</small></div>
      <div class="funnel-bar" style="height:62%"><span>62%</span><small>注册</small></div>
      <div class="funnel-bar" style="height:18%"><span>18%</span><small>激活</small></div>
      <div class="funnel-bar" style="height:3.2%"><span>3.2%</span><small>付费</small></div>
    </div>
  </div>

  <div class="insight">
    <div class="insight-title">💡 关键洞察</div>
    <div class="insight-body">注册→激活段落漏出率高达 71%。建议优化"首次使用引导"，将 7 步精简至 3 步，并加入即时反馈，预计可将激活率提升至 28%（+10pp）。</div>
  </div>

  <div class="page-footer"><span>Q4 用户行为分析报告</span><span>Cherry Analytics · 1 / 18</span></div>
</div>

<div class="page">
  <h2>Cohort 留存分析</h2>
  <p>按用户首次访问月份切分，观察各 Cohort 在 D1/D7/D14/D30 的留存表现。Q4 的三个月用户群整体表现优于 Q3，10 月 Cohort 的 D30 留存达 30%，为年内最高水平。</p>

  <div class="chart-box">
    <div class="chart-title">月度 Cohort 留存矩阵（数字越大颜色越深）</div>
    <table>
      <tr><th>Cohort</th><th class="num">D1</th><th class="num">D7</th><th class="num">D14</th><th class="num">D30</th></tr>
      <tr><td>10月</td><td class="num">71%</td><td class="num">46%</td><td class="num">37%</td><td class="num">30%</td></tr>
      <tr><td>11月</td><td class="num">68%</td><td class="num">42%</td><td class="num">34%</td><td class="num">28%</td></tr>
      <tr><td>12月</td><td class="num">66%</td><td class="num">40%</td><td class="num">32%</td><td class="num">26%</td></tr>
      <tr><td>Q3 平均</td><td class="num">63%</td><td class="num">35%</td><td class="num">28%</td><td class="num">24%</td></tr>
    </table>
  </div>

  <h3>流失高峰区间</h3>
  <p>D8-D14 是用户流失的高峰，平均流失率达 14%。这段时间用户已完成初次体验，但还未形成使用习惯。建议在此区间通过推送、邮件等手段触达。</p>

  <div class="insight">
    <div class="insight-title">📌 行动建议</div>
    <div class="insight-body">在 D7、D10、D13 三个时间点设置阶梯式 push（功能介绍 → 案例分享 → 优惠激活）。基于 A/B 测试预估可降低流失率 4-6pp。</div>
  </div>

  <h2>内容偏好分析</h2>
  <table>
    <tr><th>内容类型</th><th class="num">阅读占比</th><th class="num">平均时长</th><th class="num">分享率</th><th class="num">转化贡献</th></tr>
    <tr><td>教程指南</td><td class="num">42%</td><td class="num">5m12s</td><td class="num">8.2%</td><td class="num">38%</td></tr>
    <tr><td>案例分析</td><td class="num">28%</td><td class="num">6m44s</td><td class="num">12.4%</td><td class="num">31%</td></tr>
    <tr><td>行业动态</td><td class="num">18%</td><td class="num">2m18s</td><td class="num">15.6%</td><td class="num">12%</td></tr>
    <tr><td>视频内容</td><td class="num">8%</td><td class="num">3m08s</td><td class="num">22.1%</td><td class="num">14%</td></tr>
    <tr><td>其他</td><td class="num">4%</td><td class="num">1m45s</td><td class="num">3.2%</td><td class="num">5%</td></tr>
  </table>

  <div class="page-footer"><span>Q4 用户行为分析报告</span><span>Cherry Analytics · 2 / 18</span></div>
</div>

</body></html>`;

const SESSION_MD_MESSAGES: AgentChatMessage[] = [
  { id: 'md-m1', role: 'user', content: '为我们的内部 SDK 生成一份完整的 API 文档，要支持自动目录、代码示例。', timestamp: '13:08' },
  { id: 'md-m2', role: 'agent', thinking: '需要扫描 SDK 源码、提取注释、生成结构化的 Markdown 文档。', content: '我会先扫描 SDK 的导出 API，然后基于 JSDoc / 类型注释生成包含目录、代码示例和参数表的 Markdown 文档。', timestamp: '13:09' },
  { id: 'md-m3', role: 'agent', toolCall: { name: 'scan src/**/*.ts for exports', status: 'done', duration: '1.2s' }, content: '已发现 42 个导出 API（28 个函数、9 个类、5 个枚举）', timestamp: '13:09' },
  { id: 'md-m4', role: 'agent', toolCall: { name: 'extract JSDoc annotations', status: 'done', duration: '0.8s' }, content: '95% 的 API 有完整的注释。3 个函数缺少 @returns，2 个缺少 @example。已标记待补充。', timestamp: '13:09' },
  { id: 'md-m5', role: 'agent', toolCall: { name: 'write docs/api-reference.md', status: 'done', duration: '2.4s' }, content: '已生成 API 参考文档，共 28 页，包含：\n• 自动目录（TOC）\n• 安装与初始化\n• 核心 API 详细说明\n• 类型定义参考\n• 5 个完整代码示例\n• 错误处理指南', timestamp: '13:10' },
  { id: 'md-m6', role: 'agent', content: 'API 文档已生成。预览面板可查看 Markdown 渲染效果。如需调整格式或补充示例，告诉我具体要求即可。', timestamp: '13:10' },
];

const SESSION_MD_STEPS: WorkflowStep[] = [
  { id: 'md-s1', label: '扫描 SDK 导出 API', status: 'done' },
  { id: 'md-s2', label: '提取 JSDoc 注释', status: 'done' },
  { id: 'md-s3', label: '生成 Markdown 文档', status: 'done' },
];

const SESSION_MD_PREVIEW = `<!DOCTYPE html>
<html lang="zh"><head><meta charset="utf-8">
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: -apple-system, 'PingFang SC', BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; background: #fafafa; color: #1f2937; -webkit-font-smoothing: antialiased; }
  .toolbar { position: sticky; top: 0; z-index: 10; background: rgba(255,255,255,0.92); backdrop-filter: blur(10px); border-bottom: 1px solid #e5e7eb; padding: 10px 24px; display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #6b7280; }
  .toolbar-title { display: flex; align-items: center; gap: 8px; color: #111827; font-weight: 500; }
  .md-pill { background: #dbeafe; color: #1d4ed8; font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: 600; }
  .layout { display: grid; grid-template-columns: 240px 1fr; max-width: 1100px; margin: 0 auto; gap: 32px; padding: 20px 24px 40px; }
  aside { position: sticky; top: 60px; align-self: start; max-height: calc(100vh - 80px); overflow-y: auto; padding-right: 8px; }
  aside h4 { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em; margin: 8px 0 8px; }
  aside a { display: block; padding: 4px 8px; color: #4b5563; font-size: 13px; text-decoration: none; border-radius: 4px; border-left: 2px solid transparent; }
  aside a:hover { color: #111827; background: #f3f4f6; }
  aside a.active { color: #2563eb; border-left-color: #2563eb; background: #eff6ff; }
  aside .sub { padding-left: 18px; font-size: 12px; color: #6b7280; }
  main { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 48px 56px; min-height: 70vh; }
  main h1 { font-size: 30px; letter-spacing: -0.02em; margin: 0 0 6px; color: #0f172a; }
  main .sub { color: #6b7280; font-size: 14px; margin-bottom: 32px; }
  main h2 { font-size: 22px; margin: 36px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6; color: #111827; }
  main h3 { font-size: 16px; margin: 24px 0 8px; color: #1f2937; }
  main p { font-size: 14px; line-height: 1.85; color: #374151; margin: 8px 0 12px; }
  main p code, main li code { background: #f3f4f6; color: #be185d; padding: 1px 6px; border-radius: 4px; font-size: 13px; font-family: 'JetBrains Mono', Menlo, monospace; }
  main pre { background: #0f172a; color: #e2e8f0; padding: 18px 20px; border-radius: 10px; font-size: 13px; line-height: 1.7; overflow-x: auto; margin: 12px 0; font-family: 'JetBrains Mono', Menlo, monospace; }
  main pre .kw { color: #c4b5fd; }
  main pre .str { color: #86efac; }
  main pre .com { color: #64748b; font-style: italic; }
  main pre .fn { color: #fcd34d; }
  main ul, main ol { padding-left: 24px; margin: 8px 0 14px; }
  main li { font-size: 14px; line-height: 1.85; color: #374151; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0 20px; font-size: 13px; }
  th { text-align: left; padding: 10px 14px; background: #f9fafb; color: #4b5563; font-weight: 500; border-bottom: 1px solid #e5e7eb; }
  td { padding: 10px 14px; border-bottom: 1px solid #f3f4f6; color: #374151; }
  td code { background: #f3f4f6; color: #be185d; padding: 1px 6px; border-radius: 4px; font-size: 12px; font-family: 'JetBrains Mono', Menlo, monospace; }
  blockquote { border-left: 4px solid #2563eb; background: #eff6ff; padding: 12px 16px; margin: 14px 0; border-radius: 0 8px 8px 0; color: #1e3a8a; font-size: 14px; }
  .badge { display: inline-block; font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 500; margin-left: 6px; vertical-align: middle; }
  .badge-stable { background: #d1fae5; color: #047857; }
  .badge-beta { background: #fef3c7; color: #b45309; }
  .badge-required { background: #fee2e2; color: #b91c1c; }
</style></head><body>

<div class="toolbar">
  <div class="toolbar-title"><span class="md-pill">MD</span><span>docs/api-reference.md</span></div>
  <span>实时预览 · 28 页 · 42 个 API</span>
</div>

<div class="layout">
  <aside>
    <h4>开始</h4>
    <a href="#install">安装</a>
    <a href="#quickstart" class="active">快速开始</a>
    <h4>核心 API</h4>
    <a href="#client">CherryClient</a>
    <a href="#client" class="sub">.connect()</a>
    <a href="#client" class="sub">.send()</a>
    <a href="#client" class="sub">.subscribe()</a>
    <a href="#types">类型定义</a>
    <h4>高级</h4>
    <a href="#errors">错误处理</a>
    <a href="#middleware">中间件</a>
    <a href="#testing">测试</a>
  </aside>

  <main>
    <h1>Cherry SDK</h1>
    <p class="sub">v2.4.0 · TypeScript · MIT · 2026-04-26</p>

    <p>Cherry SDK 是一个轻量级的客户端 SDK，用于与 Cherry 平台进行实时双向通信。支持自动重连、消息队列、订阅多路复用。</p>

    <h2 id="install">安装</h2>
    <pre><span class="com"># npm</span>
npm install @cherry/sdk

<span class="com"># pnpm</span>
pnpm add @cherry/sdk</pre>

    <h2 id="quickstart">快速开始 <span class="badge badge-stable">稳定</span></h2>
    <p>初始化客户端并发送第一条消息：</p>
    <pre><span class="kw">import</span> { <span class="fn">CherryClient</span> } <span class="kw">from</span> <span class="str">'@cherry/sdk'</span>;

<span class="kw">const</span> client = <span class="kw">new</span> <span class="fn">CherryClient</span>({
  endpoint: <span class="str">'wss://api.cherry.ai/v2'</span>,
  apiKey: process.env.CHERRY_KEY,
});

<span class="kw">await</span> client.<span class="fn">connect</span>();
<span class="kw">await</span> client.<span class="fn">send</span>({ type: <span class="str">'chat'</span>, content: <span class="str">'Hello'</span> });</pre>

    <blockquote>
      💡 推荐使用环境变量保存 API Key，不要硬编码到代码中。
    </blockquote>

    <h2 id="client">CherryClient</h2>
    <p>核心客户端类，封装了与服务器的所有通信。</p>

    <h3>构造参数</h3>
    <table>
      <tr><th>参数</th><th>类型</th><th>必填</th><th>说明</th></tr>
      <tr><td><code>endpoint</code></td><td><code>string</code></td><td><span class="badge badge-required">必填</span></td><td>WebSocket 服务地址</td></tr>
      <tr><td><code>apiKey</code></td><td><code>string</code></td><td><span class="badge badge-required">必填</span></td><td>认证 Key</td></tr>
      <tr><td><code>autoReconnect</code></td><td><code>boolean</code></td><td>否</td><td>断线自动重连，默认 <code>true</code></td></tr>
      <tr><td><code>maxRetries</code></td><td><code>number</code></td><td>否</td><td>最大重试次数，默认 <code>5</code></td></tr>
      <tr><td><code>timeout</code></td><td><code>number</code></td><td>否</td><td>请求超时（毫秒），默认 <code>30000</code></td></tr>
    </table>

    <h3><code>.subscribe(channel, handler)</code> <span class="badge badge-beta">Beta</span></h3>
    <p>订阅指定频道的实时消息。</p>
    <pre>client.<span class="fn">subscribe</span>(<span class="str">'user:123'</span>, (msg) =&gt; {
  console.<span class="fn">log</span>(<span class="str">'received:'</span>, msg);
});</pre>
  </main>
</div>

</body></html>`;

const SESSION_SLIDES_MESSAGES: AgentChatMessage[] = [
  { id: 'sl-m1', role: 'user', content: '帮我做一份"2026 年 AI 产品趋势"演示稿，6 页左右，要简洁现代风格。', timestamp: '16:45' },
  { id: 'sl-m2', role: 'agent', thinking: '需要规划核心叙事：现状 → 趋势 → 机会 → 行动。配色用深色背景 + 高对比强调色。', content: '我会按"现状洞察 → 三大趋势 → 落地机会 → 行动建议"四个章节组织，约 6 页幻灯片。', timestamp: '16:45' },
  { id: 'sl-m3', role: 'agent', toolCall: { name: 'research: 2026 AI product trends', status: 'done', duration: '4.8s' }, content: '已综合 28 个数据源，提炼出三大核心趋势：Agent 化、个性化模型、端侧推理。', timestamp: '16:46' },
  { id: 'sl-m4', role: 'agent', toolCall: { name: 'write slides/ai-trends-2026.html', status: 'done', duration: '3.2s' }, content: '已生成 6 页演示稿。深色主题、强调色为 Cherry 红，关键数据用大字号呈现。', timestamp: '16:47' },
  { id: 'sl-m5', role: 'agent', content: '演示稿已完成，预览面板可查看效果。如需调整配色或重排顺序，告诉我即可。', timestamp: '16:47' },
];

const SESSION_SLIDES_STEPS: WorkflowStep[] = [
  { id: 'sl-s1', label: '研究 AI 趋势数据', status: 'done' },
  { id: 'sl-s2', label: '提炼核心叙事', status: 'done' },
  { id: 'sl-s3', label: '设计幻灯片样式', status: 'done' },
  { id: 'sl-s4', label: '生成 6 页内容', status: 'done' },
];

const SESSION_SLIDES_PREVIEW = `<!DOCTYPE html>
<html lang="zh"><head><meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, 'PingFang SC', system-ui, sans-serif; background: #1a1a1a; padding: 24px 0; color: #fafafa; }
  .toolbar { position: sticky; top: 0; z-index: 10; max-width: 880px; margin: 0 auto 18px; background: rgba(255,255,255,0.08); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 8px 16px; display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: rgba(255,255,255,0.7); }
  .toolbar-title { display: flex; align-items: center; gap: 8px; color: white; font-weight: 500; }
  .slide-pill { background: rgba(244,63,94,0.18); color: #fda4af; font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: 600; }
  .slide { max-width: 880px; margin: 0 auto 24px; aspect-ratio: 16 / 9; border-radius: 12px; overflow: hidden; position: relative; display: flex; flex-direction: column; padding: 56px 64px; box-shadow: 0 12px 48px rgba(0,0,0,0.4); }
  .slide-num { position: absolute; bottom: 20px; right: 28px; font-size: 11px; opacity: 0.4; letter-spacing: 0.1em; }
  .slide-cover { background: radial-gradient(circle at 80% 20%, #ef4444 0%, transparent 50%), linear-gradient(135deg, #0a0a0a 0%, #1f1f1f 100%); justify-content: center; }
  .cover-eyebrow { font-size: 12px; color: #ef4444; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 14px; }
  .cover-title { font-size: 56px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.05; }
  .cover-sub { font-size: 16px; opacity: 0.6; margin-top: 14px; }
  .slide-section { background: linear-gradient(135deg, #1f1f1f 0%, #161616 100%); }
  .section-label { font-size: 11px; color: #ef4444; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 14px; }
  .section-title { font-size: 36px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.15; max-width: 600px; }
  .section-sub { font-size: 14px; opacity: 0.55; margin-top: 12px; line-height: 1.7; max-width: 560px; }
  .slide-stats { background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%); }
  .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; margin-top: 28px; }
  .stat-item .stat-num { font-size: 64px; font-weight: 800; letter-spacing: -0.04em; line-height: 1; color: #ef4444; }
  .stat-item .stat-label { font-size: 13px; opacity: 0.7; margin-top: 10px; line-height: 1.5; }
  .slide-trends { background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%); }
  .trends-list { display: grid; gap: 16px; margin-top: 24px; }
  .trend-item { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 18px 22px; display: flex; gap: 16px; align-items: center; }
  .trend-num { font-size: 14px; font-weight: 600; color: #ef4444; width: 28px; height: 28px; border-radius: 999px; background: rgba(239,68,68,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .trend-text { flex: 1; }
  .trend-text strong { display: block; font-size: 18px; margin-bottom: 4px; }
  .trend-text span { font-size: 13px; opacity: 0.55; line-height: 1.55; }
  .slide-action { background: radial-gradient(circle at 20% 80%, rgba(239,68,68,0.3) 0%, transparent 50%), linear-gradient(135deg, #161616 0%, #1f1f1f 100%); justify-content: center; }
  .action-list { margin-top: 32px; max-width: 580px; }
  .action-item { display: flex; align-items: flex-start; gap: 14px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .action-arrow { color: #ef4444; font-size: 18px; }
  .action-item strong { font-size: 16px; display: block; }
  .action-item span { font-size: 13px; opacity: 0.55; }
</style></head><body>

<div class="toolbar">
  <div class="toolbar-title"><span class="slide-pill">SLIDES</span><span>ai-trends-2026.html</span></div>
  <span>6 张幻灯片 · 16:9</span>
</div>

<div class="slide slide-cover">
  <div class="cover-eyebrow">Cherry Insight Report</div>
  <div class="cover-title">2026 年<br/>AI 产品趋势</div>
  <div class="cover-sub">三大变局 · 七个机会 · 一份行动清单</div>
  <div class="slide-num">01 / 06</div>
</div>

<div class="slide slide-stats">
  <div class="section-label">现状速览</div>
  <div class="section-title">AI 已是新基建</div>
  <div class="stats-grid">
    <div class="stat-item"><div class="stat-num">86%</div><div class="stat-label">企业部署了至少一个生产级 AI 应用</div></div>
    <div class="stat-item"><div class="stat-num">3.2x</div><div class="stat-label">头部产品在 AI 加持下的留存提升</div></div>
    <div class="stat-item"><div class="stat-num">$340B</div><div class="stat-label">2026 全球 AI 应用市场规模预测</div></div>
  </div>
  <div class="slide-num">02 / 06</div>
</div>

<div class="slide slide-trends">
  <div class="section-label">趋势</div>
  <div class="section-title">三大不可逆变局</div>
  <div class="section-sub">从"接入 AI"到"重新设计"，产品形态正在经历底层变革</div>
  <div class="trends-list">
    <div class="trend-item"><div class="trend-num">1</div><div class="trend-text"><strong>Agent 化</strong><span>从 Copilot 转向 Autonomy — 产品自己决定下一步做什么</span></div></div>
    <div class="trend-item"><div class="trend-num">2</div><div class="trend-text"><strong>个性化模型</strong><span>SLM + RAG 取代通用 LLM，每个用户都有自己的"小模型"</span></div></div>
    <div class="trend-item"><div class="trend-num">3</div><div class="trend-text"><strong>端侧推理</strong><span>MLX / WebGPU 普及，隐私敏感场景全部下沉到设备</span></div></div>
  </div>
  <div class="slide-num">03 / 06</div>
</div>

<div class="slide slide-section">
  <div class="section-label">机会</div>
  <div class="section-title">"看不见的 AI"<br/>是下一个金矿</div>
  <div class="section-sub">用户不再为"AI 功能"付费 — 他们为"问题被解决"付费。差异化将来自工作流、上下文和私有数据。</div>
  <div class="slide-num">04 / 06</div>
</div>

<div class="slide slide-action">
  <div class="section-label">行动清单</div>
  <div class="section-title">90 天落地路径</div>
  <div class="action-list">
    <div class="action-item"><div class="action-arrow">→</div><div><strong>Week 1-2</strong><span>梳理 3 个用户高频痛点，评估 AI 介入的 ROI</span></div></div>
    <div class="action-item"><div class="action-arrow">→</div><div><strong>Week 3-6</strong><span>选 1 个场景做 Agent 化 PoC，用真实数据验证</span></div></div>
    <div class="action-item"><div class="action-arrow">→</div><div><strong>Week 7-12</strong><span>灰度发布 + 数据反馈循环 + 私有模型蒸馏</span></div></div>
  </div>
  <div class="slide-num">05 / 06</div>
</div>

<div class="slide slide-cover">
  <div class="cover-eyebrow">Thank you</div>
  <div class="cover-title">下一个十年<br/>由智能体定义</div>
  <div class="cover-sub">Cherry Studio · cherry.ai · 2026</div>
  <div class="slide-num">06 / 06</div>
</div>

</body></html>`;

const SHOWCASE_FILES: FileNode[] = [
  { name: 'reports', type: 'folder', children: [
    { name: 'Q4-user-behavior-report.pdf', type: 'file' },
    { name: 'cohort-analysis.csv', type: 'file' },
  ]},
  { name: 'docs', type: 'folder', children: [
    { name: 'api-reference.md', type: 'file' },
    { name: 'changelog.md', type: 'file' },
  ]},
  { name: 'slides', type: 'folder', children: [
    { name: 'ai-trends-2026.html', type: 'file' },
  ]},
];

// Default initial file tree for new sessions — declared before
// SESSION_DATA_MAP because some entries below reference it.
export const DEFAULT_INITIAL_FILES: FileNode[] = [
  {
    name: 'src', type: 'folder', children: [
      { name: 'components', type: 'folder', children: [] },
      { name: 'hooks', type: 'folder', children: [] },
      { name: 'utils', type: 'folder', children: [] },
      { name: 'App.tsx', type: 'file' },
      { name: 'main.tsx', type: 'file' },
    ],
  },
  {
    name: 'public', type: 'folder', children: [
      { name: 'favicon.ico', type: 'file' },
    ],
  },
  { name: 'package.json', type: 'file' },
  { name: 'tsconfig.json', type: 'file' },
  { name: 'vite.config.ts', type: 'file' },
  { name: '.gitignore', type: 'file' },
  { name: 'index.html', type: 'file' },
];

export const SESSION_DATA_MAP: Record<string, AgentSessionData> = {
  'session-pdf': {
    messages: SESSION_PDF_MESSAGES,
    steps: SESSION_PDF_STEPS,
    files: SHOWCASE_FILES,
    outputFiles: [
      { id: 'op-1', name: 'Q4-user-behavior-report.pdf', format: 'pdf', size: '2.4 MB', status: 'completed', timestamp: '15:14' },
      { id: 'op-2', name: 'cohort-analysis.csv', format: 'csv', size: '48 KB', status: 'completed', timestamp: '15:12' },
      { id: 'op-3', name: '执行摘要.docx', format: 'docx', size: '156 KB', status: 'completed', timestamp: '15:14' },
      { id: 'op-4', name: '图表素材.zip', format: 'zip', size: '4.8 MB', status: 'generating', timestamp: '' },
    ],
    fileContents: {},
    previewHtml: SESSION_PDF_PREVIEW,
    workDir: '~/reports/2026-q4',
  },
  'session-md': {
    messages: SESSION_MD_MESSAGES,
    steps: SESSION_MD_STEPS,
    files: SHOWCASE_FILES,
    outputFiles: [
      { id: 'om-1', name: 'api-reference.md', format: 'md', size: '38 KB', status: 'completed', timestamp: '13:10' },
      { id: 'om-2', name: 'examples.zip', format: 'zip', size: '128 KB', status: 'completed', timestamp: '13:10' },
    ],
    fileContents: {},
    previewHtml: SESSION_MD_PREVIEW,
    workDir: '~/projects/cherry-sdk',
  },
  'session-slides': {
    messages: SESSION_SLIDES_MESSAGES,
    steps: SESSION_SLIDES_STEPS,
    files: SHOWCASE_FILES,
    outputFiles: [
      { id: 'os-1', name: 'ai-trends-2026.html', format: 'html', size: '24 KB', status: 'completed', timestamp: '16:47' },
      { id: 'os-2', name: 'ai-trends-2026.pdf', format: 'pdf', size: '1.8 MB', status: 'completed', timestamp: '16:48' },
      { id: 'os-3', name: 'speaker-notes.md', format: 'md', size: '5.2 KB', status: 'completed', timestamp: '16:47' },
    ],
    fileContents: {},
    previewHtml: SESSION_SLIDES_PREVIEW,
    workDir: '~/presentations/2026-trends',
  },
  'session-1': {
    messages: SESSION_1_MESSAGES,
    steps: SESSION_1_STEPS,
    files: SESSION_1_FILES,
    outputFiles: SESSION_1_OUTPUT,
    fileContents: SESSION_1_CONTENTS,
    previewHtml: SESSION_1_PREVIEW,
    workDir: '~/projects/my-react-app',
  },
  'session-2': {
    messages: SESSION_2_MESSAGES,
    steps: SESSION_2_STEPS,
    files: SESSION_2_FILES,
    outputFiles: SESSION_2_OUTPUT,
    fileContents: SESSION_2_CONTENTS,
    previewHtml: SESSION_2_PREVIEW,
    workDir: '~/research/ai-frameworks',
  },
  'session-3': {
    messages: SESSION_3_MESSAGES,
    steps: SESSION_3_STEPS,
    files: SESSION_3_FILES,
    outputFiles: [],
    fileContents: SESSION_3_CONTENTS,
    previewHtml: SESSION_3_PREVIEW,
    workDir: '~/projects/dashboard',
  },
  'session-4': {
    messages: SESSION_4_MESSAGES,
    steps: SESSION_4_STEPS,
    files: SESSION_4_FILES,
    outputFiles: [
      { id: 'o4-1', name: 'auth-api-docs.md', format: 'md', size: '6.8 KB', status: 'completed', timestamp: '15:30' },
      { id: 'o4-2', name: 'JWT 认证流程图.pptx', format: 'pptx', size: '320 KB', status: 'completed', timestamp: '15:32' },
    ],
    fileContents: SESSION_4_CONTENTS,
    workDir: '~/projects/auth-service',
  },
  'session-6': {
    messages: SESSION_6_MESSAGES,
    steps: SESSION_6_STEPS,
    files: SESSION_6_FILES,
    outputFiles: [
      { id: 'o6-1', name: 'API 性能优化方案.docx', format: 'docx', size: '52 KB', status: 'completed', timestamp: '16:15' },
      { id: 'o6-2', name: '压测报告.pdf', format: 'pdf', size: '1.2 MB', status: 'completed', timestamp: '16:18' },
      { id: 'o6-3', name: '优化建议清单.xlsx', format: 'xlsx', size: '15 KB', status: 'generating', timestamp: '' },
    ],
    fileContents: SESSION_6_CONTENTS,
    previewHtml: SESSION_6_PREVIEW,
    workDir: '~/projects/api-optimization',
  },
  // ─── Task-kind sessions — running, surface a progress ring in the
  //     sidebar (kind: 'task' + progress on AgentSession).
  'session-11': {
    messages: [
      { id: 's11-m1', role: 'user', content: '帮我调研一下桌面端 Agent 产品，重点是定位、形态和盈利模型，最后给一个 12 个竞品的对比表。', timestamp: '10:14' },
      { id: 's11-m2', role: 'agent', thinking: '先列出要调研的竞品清单，把它们按"通用 / 编程 / 办公 / 创作"四类分桶。每类拿 3 个代表跑功能矩阵，最后汇总成表。', timestamp: '10:15' },
      { id: 's11-m3', role: 'agent', content: '已完成竞品清单（12 个）。正在并行抓取每家产品的官网定价页和文档导航，整理功能矩阵。', toolCall: { name: 'web.scrape · batch=12', status: 'running', duration: '6.2s' }, timestamp: '10:22' },
      { id: 's11-m4', role: 'agent', content: '已抓取 7/12，剩余 5 个还在排队（部分站点 rate-limited，等待中）。', toolCall: { name: 'fs.write · matrix.draft.md', status: 'done', duration: '0.3s' }, timestamp: '10:31' },
    ],
    steps: [
      { id: 's11-s1', icon: 'search',  label: '列出 12 个竞品清单',           status: 'done' },
      { id: 's11-s2', icon: 'search',  label: '抓取官网定价与文档导航',         status: 'running', description: '7/12 已完成' },
      { id: 's11-s3', icon: 'review',  label: '生成功能矩阵 (草稿)',            status: 'pending' },
      { id: 's11-s4', icon: 'write',   label: '撰写定位与盈利模型分析',         status: 'pending' },
      { id: 's11-s5', icon: 'finish',  label: '导出对比表 + 总结报告',          status: 'pending' },
    ],
    files: DEFAULT_INITIAL_FILES,
    outputFiles: [
      { id: 'o11-1', name: 'competitor-matrix.draft.md', format: 'md', size: '6 KB', status: 'generating', timestamp: '' },
    ],
    fileContents: {},
    workDir: '~/research/desktop-agents',
  },
  'session-13': {
    messages: [
      { id: 's13-m1', role: 'user', content: '帮我搭一个实时协作白板，CRDT 引擎 + 自由画布 + 多光标，需要能在 4 个人同时编辑下不打架。', timestamp: '16:02' },
      { id: 's13-m2', role: 'agent', thinking: 'Yjs 作为 CRDT 引擎成熟稳定，配合 y-websocket 起一个本地 dev server，前端用 Canvas 画板 + 自定义 Awareness 协议传光标。', timestamp: '16:02' },
      { id: 's13-m3', role: 'agent', content: '基座搭好了：Yjs + y-websocket + React 画布。光标 / 选区 / 形状的 awareness 协议跑通，正在做笔触延迟优化。', toolCall: { name: 'vite dev --port 3010', status: 'running' }, timestamp: '16:18' },
      { id: 's13-m4', role: 'agent', content: '本地多人测试：4 个浏览器同时画线，无冲突，但延迟在 80-120ms 之间，目标 < 60ms。在加节流 + 批量同步。', timestamp: '16:38' },
    ],
    steps: [
      { id: 's13-s1', icon: 'install', label: '安装 Yjs / y-websocket',         status: 'done' },
      { id: 's13-s2', icon: 'code',    label: '画布组件 + 工具栏',              status: 'done' },
      { id: 's13-s3', icon: 'code',    label: 'Awareness 协议（光标 / 选区）',  status: 'done' },
      { id: 's13-s4', icon: 'build',   label: '笔触延迟优化',                   status: 'running', description: '当前 92ms · 目标 < 60ms' },
      { id: 's13-s5', icon: 'finish',  label: '部署到 staging',                 status: 'pending' },
    ],
    files: DEFAULT_INITIAL_FILES,
    outputFiles: [],
    fileContents: {},
    workDir: '~/projects/collab-whiteboard',
  },
};

// Empty session data
export const EMPTY_SESSION_DATA: AgentSessionData = {
  messages: [],
  steps: [],
  files: [],
  outputFiles: [],
  fileContents: {},
};
