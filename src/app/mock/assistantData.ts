// ===========================
// Assistant Mock Data (physical location)
// ===========================
// Migrated from components/assistant/mockData.ts
// Types are imported from the central type system.

import type { AssistantInfo, AssistantTopic } from '@/app/types/assistant';
import type { Message } from '@/app/types/chat';

// Backward-compatible alias used throughout this file
type AssistantMessage = Message;

// ===========================
// Mock Assistants
// ===========================

export const MOCK_ASSISTANTS: AssistantInfo[] = [
  {
    id: 'ast-1',
    name: '默认助手',
    model: 'google/gemini-3-pro-preview',
    modelProvider: 'Google',
    updatedAt: '2025-10-03 18:05',
    tags: ['通用'],
    systemPrompt: `# Role: Cherry Studio Senior Support Communicator\n\n## Profile\nYou are the professional communication specialist f...\n\n## Responsibilities\n- 提供专业、准确的技术支持\n- 帮助用户解决编程和开发问题\n- 生成高质量的代码、文档和技术方案`,
    knowledgeBases: [
      { id: 'kb-1', name: 'Cherry Studio 产品使用手册' },
      { id: 'kb-2', name: 'Cherry Studio User Guide' },
    ],
    tools: [
      { id: 'tool-1', name: '工具', icon: '🔧' },
    ],
  },
  {
    id: 'ast-2',
    name: '写作助手',
    model: 'anthropic/claude-4-sonnet',
    modelProvider: 'Anthropic',
    updatedAt: '2025-09-28 14:30',
    tags: ['写作', '创作'],
    systemPrompt: '你是一位专业的写作助手，擅长撰写各类文章、报告和创意内容。',
    knowledgeBases: [],
    tools: [],
  },
  {
    id: 'ast-3',
    name: '代码专家',
    model: 'openai/gpt-4.1',
    modelProvider: 'OpenAI',
    updatedAt: '2025-10-01 09:15',
    tags: ['编程', '代码审查'],
    systemPrompt: '你是一位资深软件工程师，精通多种编程语言和框架。',
    knowledgeBases: [
      { id: 'kb-3', name: 'API Reference Docs' },
    ],
    tools: [
      { id: 'tool-2', name: '代码执行', icon: '💻' },
      { id: 'tool-3', name: '文件操作', icon: '📁' },
    ],
  },
  {
    id: 'ast-4',
    name: '翻译官',
    model: 'google/gemini-3-flash',
    modelProvider: 'Google',
    updatedAt: '2025-09-25 11:20',
    tags: ['翻译', '语言'],
    systemPrompt: '你是一位精通中英日韩法德等多国语言的专业翻译，擅长保持原文风格和语境。',
    knowledgeBases: [],
    tools: [],
  },
  {
    id: 'ast-5',
    name: '数据分析师',
    model: 'openai/gpt-4.1',
    modelProvider: 'OpenAI',
    updatedAt: '2025-10-02 16:40',
    tags: ['数据', '分析'],
    systemPrompt: '你是一位资深数据分析师，擅长数据清洗、统计分析和数据可视化。',
    knowledgeBases: [
      { id: 'kb-4', name: '数据分析方法论' },
    ],
    tools: [
      { id: 'tool-4', name: 'Python 执行', icon: '🐍' },
    ],
  },
  {
    id: 'ast-6',
    name: '学术论文助手',
    model: 'anthropic/claude-4-opus',
    modelProvider: 'Anthropic',
    updatedAt: '2025-09-30 08:55',
    tags: ['学术', '写作'],
    systemPrompt: '你是一位学术写作专家，精通论文结构、文献综述和学术规范。',
    knowledgeBases: [
      { id: 'kb-5', name: '学术写作规范' },
    ],
    tools: [],
  },
  {
    id: 'ast-7',
    name: '产品经理',
    model: 'deepseek/deepseek-r1',
    modelProvider: 'DeepSeek',
    updatedAt: '2025-09-27 13:10',
    tags: ['产品', '策划'],
    systemPrompt: '你是一位经验丰富的产品经理，擅长需求分析、PRD 撰写和用户体验设计。',
    knowledgeBases: [],
    tools: [
      { id: 'tool-5', name: '流程图', icon: '📊' },
    ],
  },
  {
    id: 'ast-8',
    name: '法律顾问',
    model: 'qwen/qwen3-235b',
    modelProvider: 'Alibaba',
    updatedAt: '2025-09-22 10:30',
    tags: ['法律', '合规'],
    systemPrompt: '你是一位专业法律顾问精通公司法、合同法和知识产权法。',
    knowledgeBases: [
      { id: 'kb-6', name: '法律法规库' },
    ],
    tools: [],
  },
  {
    id: 'ast-9',
    name: 'UI 设计师',
    model: 'anthropic/claude-4-sonnet',
    modelProvider: 'Anthropic',
    updatedAt: '2025-10-01 17:25',
    tags: ['设计', '创作'],
    systemPrompt: '你是一位资深 UI/UX 设计师，擅长界面设计、交互原型和设计系统。',
    knowledgeBases: [],
    tools: [
      { id: 'tool-6', name: '图片生成', icon: '🎨' },
    ],
  },
  {
    id: 'ast-10',
    name: '英语教师',
    model: 'openai/gpt-4.1-mini',
    modelProvider: 'OpenAI',
    updatedAt: '2025-09-20 09:00',
    tags: ['教育', '语言'],
    systemPrompt: '你是一位专业的英语教师，擅长语法讲解、口语练习和写作批改。',
    knowledgeBases: [],
    tools: [],
  },
];

// ===========================
// Assistant Emoji Map
// ===========================

export const ASSISTANT_EMOJI_MAP: Record<string, string> = {
  '默认助手': '🤖',
  '写作助手': '✍️',
  '代码专家': '💻',
  '翻译官': '🌐',
  '数据分析师': '📊',
  '学术论文助手': '🎓',
  '产品经理': '📋',
  '法律顾问': '⚖️',
  'UI 设计师': '🎨',
  '英语教师': '📚',
};

// ===========================
// Mock Topics
// ===========================

export const MOCK_TOPICS: AssistantTopic[] = [
  { id: 'topic-1', title: 'React Hooks 完全指南', assistantName: '默认助手', lastMessage: '文章已生成，涵盖核心 Hooks 和最佳实践', timestamp: '14:27', messageCount: 6, status: 'active', pinned: true, tags: ['React', '前端'], group: '技术学习' },
  { id: 'topic-2', title: 'Next.js App Router 迁移方案', assistantName: '代码专家', lastMessage: '迁移步骤已梳理，包含 Server Components 适配', timestamp: '11:42', messageCount: 12, status: 'completed', pinned: true, tags: ['React', 'Next.js'], group: '技术学习' },
  { id: 'topic-3', title: '年终总结报告撰写', assistantName: '写作助手', lastMessage: '报告框架已完成，包含数据可视化建议', timestamp: '昨天', messageCount: 18, status: 'completed', tags: ['写作', '报告'], group: '内容创作' },
  { id: 'topic-4', title: 'TypeScript 高级类型体操', assistantName: '代码专家', lastMessage: '完成 Conditional Types 和 Mapped Types 讲解', timestamp: '昨天', messageCount: 15, status: 'completed', tags: ['TypeScript', '前端'], group: '技术学习' },
  { id: 'topic-5', title: '产品 PRD 文档生成', assistantName: '写作助手', lastMessage: '用户故事和功能需求已完成', timestamp: '昨天', messageCount: 8, status: 'active', tags: ['写作', '产品'], group: '内容创作' },
  { id: 'topic-6', title: 'Tailwind CSS v4 新特性', assistantName: '默认助手', lastMessage: '新的 CSS-first 配置方式和 @theme 指令', timestamp: '2天前', messageCount: 10, status: 'completed', tags: ['CSS', '前端'], group: '技术学习' },
  { id: 'topic-7', title: 'PostgreSQL 性能优化', assistantName: '代码专家', lastMessage: '索引策略和查询优化方案已输出', timestamp: '2天前', messageCount: 22, status: 'completed', tags: ['数据库', '后端'], group: '项目开发' },
  { id: 'topic-8', title: '周报自动化模板', assistantName: '写作助手', lastMessage: '模板已生成，支持 Markdown 和 PDF 导出', timestamp: '3天前', messageCount: 5, status: 'completed', tags: ['写作', '效率'], group: '内容创作' },
  { id: 'topic-9', title: 'Docker Compose 微服务编排', assistantName: '代码专家', lastMessage: 'docker-compose.yml 配置已完成', timestamp: '上周', messageCount: 14, status: 'completed', tags: ['DevOps', '后端'], group: '项目开发' },
  { id: 'topic-10', title: 'AI Agent 架构设计', assistantName: '默认助手', lastMessage: 'ReAct 框架和 Tool Use 模式分析', timestamp: '上周', messageCount: 28, status: 'completed', pinned: false, tags: ['AI', '架构'], group: '技术学习' },
  { id: 'topic-11', title: 'AI 聊天应用技术选型（多模型并行）', assistantName: '默认助手', lastMessage: '多模型并行对比完成，推荐 SSE + React 方案', timestamp: '12:50', messageCount: 16, status: 'active', pinned: true, tags: ['架构', '对比'], group: '技术学习' },
  { id: 'topic-39', title: '产品需求评审（多助手协作）', assistantName: '产品经理', lastMessage: '多角色协同评审完成，含技术可行性和设计建议', timestamp: '15:20', messageCount: 12, status: 'active', pinned: true, tags: ['产品', '协作'], group: '产品策划' },
  { id: 'topic-12', title: '英文技术文档翻译', assistantName: '翻译官', lastMessage: 'Kubernetes 官方文档中文翻译已完成第三章', timestamp: '10:15', messageCount: 24, status: 'active', tags: ['DevOps'], group: '翻译工作' },
  { id: 'topic-13', title: '日语商务邮件模板', assistantName: '翻译官', lastMessage: '5 套正式商务邮件模板已整理', timestamp: '昨天', messageCount: 9, status: 'completed', tags: ['写作', '效率'], group: '翻译工作' },
  { id: 'topic-14', title: '用户行为数据分析报告', assistantName: '数据分析师', lastMessage: '留存率漏斗和用户分群分析已完成', timestamp: '09:30', messageCount: 32, status: 'active', pinned: true, tags: ['报告', '产品'], group: '数据分析' },
  { id: 'topic-15', title: 'A/B 测试结果解读', assistantName: '数据分析师', lastMessage: '统计显著性检验和效果量分析', timestamp: '昨天', messageCount: 11, status: 'completed', tags: ['AI'], group: '数据分析' },
  { id: 'topic-16', title: 'SCI 论文润色与修改', assistantName: '学术论文助手', lastMessage: 'Introduction 和 Methodology 已润色完成', timestamp: '15:03', messageCount: 20, status: 'active', tags: ['写作'], group: '学术研究' },
  { id: 'topic-17', title: '文献综述框架梳理', assistantName: '学术论文助手', lastMessage: '已整理 50 篇核心文献的主题分类', timestamp: '2天前', messageCount: 16, status: 'completed', tags: ['写作', 'AI'], group: '学术研究' },
  { id: 'topic-18', title: '竞品分析报告', assistantName: '产品经理', lastMessage: '完成 5 款竞品的功能矩阵和 SWOT 分析', timestamp: '13:45', messageCount: 14, status: 'active', tags: ['产品', '报告'], group: '产品策划' },
  { id: 'topic-19', title: '用户故事地图绘制', assistantName: '产品经理', lastMessage: '核心用户旅程和痛点已标注', timestamp: '3天前', messageCount: 19, status: 'completed', tags: ['产品'], group: '产品策划' },
  { id: 'topic-20', title: '合同条款审查', assistantName: '法律顾问', lastMessage: '已标注 12 处风险条款并提供修改建议', timestamp: '16:20', messageCount: 7, status: 'completed', tags: ['效率'], group: '法律合规' },
  { id: 'topic-21', title: '隐私政策合规检查', assistantName: '法律顾问', lastMessage: 'GDPR 和个人信息保护法对照检查完成', timestamp: '上周', messageCount: 13, status: 'completed', tags: ['AI'], group: '法律合规' },
  { id: 'topic-22', title: '设计系统组件规范', assistantName: 'UI 设计师', lastMessage: 'Button/Input/Card 等核心组件 Token 已定义', timestamp: '11:00', messageCount: 26, status: 'active', tags: ['CSS', '前端'], group: '设计工作' },
  { id: 'topic-23', title: '深色模式配色方案', assistantName: 'UI 设计师', lastMessage: '基于 WCAG 2.1 AA 对比度标准的色板已输出', timestamp: '昨天', messageCount: 10, status: 'completed', tags: ['CSS'], group: '设计工作' },
  { id: 'topic-24', title: '雅思写作 Task 2 练习', assistantName: '英语教师', lastMessage: '环境类话题范文已批改，建议加强论证逻辑', timestamp: '08:45', messageCount: 15, status: 'active', tags: ['写作'], group: '语言学习' },
  { id: 'topic-25', title: '商务英语口语场景', assistantName: '英语教师', lastMessage: '会议发言和电话沟通场景对话已生成', timestamp: '2天前', messageCount: 20, status: 'completed', tags: ['效率'], group: '语言学习' },
  { id: 'topic-26', title: 'GraphQL vs REST API 对比', assistantName: '代码专家', lastMessage: '场景化对比分析完成，附决策树', timestamp: '4天前', messageCount: 18, status: 'completed', tags: ['后端', '架构', '对比'], group: '技术学习' },
  { id: 'topic-27', title: 'React Native 跨平台方案', assistantName: '默认助手', lastMessage: 'Expo 工作流和原生模块桥接方案', timestamp: '上周', messageCount: 21, status: 'completed', tags: ['React', '前端'], group: '技术学习' },
  { id: 'topic-28', title: '季度 OKR 制定', assistantName: '产品经理', lastMessage: 'Q2 关键结果和行动项已拆解', timestamp: '上周', messageCount: 12, status: 'completed', tags: ['产品', '效率'], group: '产品策划' },
  { id: 'topic-29', title: 'Python 数据清洗脚本', assistantName: '数据分析师', lastMessage: 'Pandas 清洗管道已生成，含缺失值和异常值处理', timestamp: '3天前', messageCount: 9, status: 'completed', tags: ['后端'], group: '数据分析' },
  { id: 'topic-30', title: 'MCP 协议集成指南', assistantName: '代码专家', lastMessage: 'MCP Server 搭建和 Tool Registration 完成', timestamp: '昨天', messageCount: 17, status: 'active', tags: ['MCP', 'AI'], group: '项目开发' },
  { id: 'topic-31', title: '法语基础语法整理', assistantName: '翻译官', lastMessage: '动词变位和时态总结已完成', timestamp: '4天前', messageCount: 11, status: 'completed', group: '翻译工作' },
  { id: 'topic-32', title: 'Figma 变量与组件映射', assistantName: 'UI 设计师', lastMessage: 'Design Token 到 CSS 变量的映射规则已定义', timestamp: '3天前', messageCount: 8, status: 'completed', tags: ['CSS', '前端', '效率'], group: '设计工作' },
  { id: 'topic-33', title: '数据可视化最佳实践', assistantName: '数据分析师', lastMessage: '图表选型指南和 Recharts 示例代码', timestamp: '上周', messageCount: 14, status: 'completed', tags: ['前端', '报告'], group: '数据分析' },
  { id: 'topic-34', title: '知识产权申请流程', assistantName: '法律顾问', lastMessage: '软件著作权和发明专利申请步骤已梳理', timestamp: '2天前', messageCount: 6, status: 'completed', group: '法律合规' },
  { id: 'topic-35', title: '英语语法易错点汇总', assistantName: '英语教师', lastMessage: '定冠词、时态一致性等 20 个高频错误已整理', timestamp: '上周', messageCount: 18, status: 'completed', tags: ['写作'], group: '语言学习' },
  { id: 'topic-36', title: 'WebSocket 实时通信方案', assistantName: '代码专家', lastMessage: 'Socket.io 和原生 WebSocket 对比及心跳机制', timestamp: '5天前', messageCount: 13, status: 'completed', tags: ['后端', '架构'], group: '项目开发' },
  { id: 'topic-37', title: '营销文案创意生成', assistantName: '写作助手', lastMessage: '618 大促系列文案 10 条已生成', timestamp: '4天前', messageCount: 7, status: 'completed', tags: ['写作'], group: '内容创作' },
  { id: 'topic-38', title: 'Rust 入门学习路线', assistantName: '默认助手', lastMessage: '所有权、生命周期和 trait 系统要点整理', timestamp: '上周', messageCount: 25, status: 'completed', tags: ['后端'], group: '技术学习' },
];

// ===========================
// Content Artifacts
// ===========================

const REACT_HOOKS_ARTICLE = `# React Hooks 完全指南

## 1. 什么是 Hooks？

React Hooks 是 React 16.8 引入的特性，允许你在函数组件中使用 state 和其他 React 特性。

## 2. 常用 Hooks

### useState
\`useState\` 是最基本的 Hook，用于在函数组件中添加 state：

\`\`\`tsx
const [count, setCount] = useState(0);
\`\`\`

### useEffect
\`useEffect\` 用于处理副作用，如数据获取、订阅、DOM 操作等：

\`\`\`tsx
useEffect(() => {
  document.title = \`Count: \${count}\`;
  return () => {
    // cleanup
  };
}, [count]);
\`\`\`

### useContext
\`useContext\` 让你无需嵌套即可读取和订阅 context：

\`\`\`tsx
const theme = useContext(ThemeContext);
\`\`\`

## 3. 自定义 Hooks

自定义 Hook 是一种复用状态逻辑的机制。以 \`use\` 开头命名：

\`\`\`tsx
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handler = () => setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return size;
}
\`\`\`

## 4. 性能优化 Hooks

- **useMemo**: 缓存计算结果
- **useCallback**: 缓存回调函数
- **useTransition**: 标记非紧急更新

## 5. 最佳实践

1. 只在顶层调用 Hooks
2. 只在 React 函数中调用 Hooks
3. 使用 ESLint 插件确保 Hooks 规则
4. 将复杂逻辑抽取为自定义 Hooks`;

const CODE_ARTIFACT = `import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

// Custom Hook: useTodos
function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const addTodo = useCallback((text: string) => {
    setTodos(prev => [...prev, {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: new Date(),
    }]);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev => prev.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }, []);

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active': return todos.filter(t => !t.completed);
      case 'completed': return todos.filter(t => t.completed);
      default: return todos;
    }
  }, [todos, filter]);

  const stats = useMemo(() => ({
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
  }), [todos]);

  return { todos: filteredTodos, stats, filter, setFilter, addTodo, toggleTodo, deleteTodo };
}

export default function TodoApp() {
  const { todos, stats, filter, setFilter, addTodo, toggleTodo, deleteTodo } = useTodos();
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      addTodo(input.trim());
      setInput('');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Todo App</h1>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add a todo..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 rounded">
          Add
        </button>
      </form>
    </div>
  );
}`;

const HTML_PREVIEW = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui; margin: 0; padding: 20px; background: #f8fafc; }
    .card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); max-width: 400px; margin: 20px auto; }
    .card h2 { margin: 0 0 8px; color: #1e293b; }
    .card p { color: #64748b; margin: 0 0 16px; font-size: 14px; line-height: 1.6; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 12px; background: #dbeafe; color: #2563eb; }
    .stats { display: flex; gap: 16px; margin-top: 16px; }
    .stat { text-align: center; }
    .stat-value { font-size: 24px; font-weight: 600; color: #1e293b; }
    .stat-label { font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <h2>React Hooks Usage</h2>
    <p>A comprehensive overview of React Hooks adoption and usage patterns in modern applications.</p>
    <span class="badge">React 19</span>
    <div class="stats">
      <div class="stat"><div class="stat-value">15</div><div class="stat-label">Built-in</div></div>
      <div class="stat"><div class="stat-value">89%</div><div class="stat-label">Adoption</div></div>
      <div class="stat"><div class="stat-value">3.2x</div><div class="stat-label">Faster</div></div>
    </div>
  </div>
</body>
</html>`;

const MOCK_REQUEST_JSON = `{
  "model": "google/gemini-3-pro-preview",
  "messages": [
    {
      "role": "system",
      "content": "# Role: Cherry Studio Senior Support..."
    },
    {
      "role": "user",
      "content": "帮我写一篇关于 React Hooks 的文章"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 4096,
  "stream": true
}`;

const MOCK_RESPONSE_JSON = `{
  "id": "chatcmpl-e4b2aba1460f5276",
  "object": "chat.completion",
  "created": 1727974800,
  "model": "google/gemini-3-pro-preview",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "# React Hooks 完全指南\\n\\n## 1. 什么是 Hooks..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 192,
    "completion_tokens": 124,
    "total_tokens": 316
  }
}`;

const MOCK_PROCESS_JSON = `{
  "steps": [
    {
      "step": 1,
      "action": "parse_input",
      "timestamp": "2025-10-03T14:24:01.123Z",
      "duration_ms": 12,
      "detail": "解析用户输入，提取意图: 技术文章撰写",
      "status": "success"
    },
    {
      "step": 2,
      "action": "knowledge_retrieval",
      "timestamp": "2025-10-03T14:24:01.135Z",
      "duration_ms": 1842,
      "detail": "向量检索命中 12 个切片，Rerank 后保留 top-6",
      "status": "success"
    },
    {
      "step": 3,
      "action": "llm_inference",
      "timestamp": "2025-10-03T14:24:05.281Z",
      "duration_ms": 9319,
      "detail": "模型推理完成，生成 124 tokens",
      "status": "success"
    }
  ],
  "total_duration_ms": 14600,
  "status": "completed"
}`;

// ===========================
// Mock Messages (rich types)
// ===========================

export const MOCK_MESSAGES: AssistantMessage[] = [
  // 1. User message with file attachments
  {
    id: 'msg-1',
    role: 'user',
    content: '帮我分析一下这份数据报告，并生成可视化图表',
    timestamp: '14:20',
    attachments: [
      { id: 'att-1', name: 'Q4-2025-Sales-Report.pdf', type: 'pdf', size: '2.4 MB' },
      { id: 'att-2', name: 'revenue-data.xlsx', type: 'xlsx', size: '856 KB' },
      { id: 'att-3', name: 'analysis-script.py', type: 'py', size: '12 KB' },
    ],
  },

  // 2. Assistant response with thinking/reasoning + knowledge base
  {
    id: 'msg-2',
    role: 'assistant',
    content: '我已经分析了你上传的 Q4 销售报告和收入数据。以下是关键发现：\n\n1. **总收入增长** - Q4 同比增长 23.5%，环比增长 8.2%[1]\n2. **产品线表现** - 企业版收入占比从 35% 提升至 42%[2]\n3. **区域分布** - 亚太区增速最快（+31%），北美市场保持稳定[3]\n4. **客户留存率** - 从 87% 提升至 91%，流失率降低[2]\n\n下面是收入趋势的可视化图表[1]，已在左侧 Artifacts 面板生成。建议关注企业版产品线的增长潜力。',
    timestamp: '14:22',
    thinking: '让我分析用户上传的文件...\n\n首先查看 Q4-2025-Sales-Report.pdf：\n- 这是一份季度销售报告\n- 包含多个产品线的收入数据\n- 有区域分布信息\n\n然后分析 revenue-data.xlsx：\n- 月度收入数据\n- 按产品线分类\n- 包含同比/环比指标\n\n关键洞察：\n1. 总收入同比增长显著，主要由企业版驱动\n2. 亚太区增速最快，可能与本地化策略有关\n3. 客户留存改善，说明产品粘性增强\n\n需要生成可视化图表来展示趋势...\n选择使用 HTML 卡片形式展示关键指标。',
    ragInfo: {
      knowledgeBaseName: 'Cherry Studio 产品使用手册',
      topK: 6,
      scoreThreshold: 0.3,
      rerankModel: 'qwen/qwen3-reranker-8b',
      rewriteModel: 'google/gemini-3-flash',
      retrievalMethod: '强制检索',
      chunks: [
        { score: 0.92, content: '数据可视化最佳实践指南：使用柱状图展示趋势对比，饼图展示占比分布...', source: 'data-viz-guide.md' },
        { score: 0.85, content: '销售报告分析模板：关注同比增长率、客户留存率、产品线贡献度...', source: 'report-template.md' },
        { score: 0.78, content: '季度对比分析方法：环比增长计算公式和异常值处理...', source: 'analysis-methods.md' },
      ],
      processLog: [
        '[14:21:01] 收到检索请求，query: "销售报告分析"',
        '[14:21:01] 查询重写 → "Q4 季度销售报告 数据分析 可视化"',
        '[14:21:02] 向量检索完成，命中 8 个切片',
        '[14:21:03] 返回最终结果 3 个切片',
      ],
    },
    metadata: {
      sessionId: 'a1b2c3d4e5f60001',
      model: 'google/gemini-3-pro-preview',
      status: 'success',
      startTime: '2025-10-03 14:21',
      duration: '18.3s',
      tokens: { input: 4280, output: 856, thinking: 312, cache: 128 },
      requestJson: MOCK_REQUEST_JSON,
      responseJson: MOCK_RESPONSE_JSON,
      processJson: MOCK_PROCESS_JSON,
    },
  },

  // 3. User message with image attachments
  {
    id: 'msg-3',
    role: 'user',
    content: '请帮我分析这张设计稿，并用 Mermaid 画出它的组件结构图',
    timestamp: '14:25',
    attachments: [
      { id: 'att-4', name: 'dashboard-design.png', type: 'png', size: '1.8 MB', previewUrl: 'https://images.unsplash.com/photo-1766934587214-86e21b3ae093?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwcHJvZHVjdCUyMGRlc2lnbnxlbnwxfHx8fDE3NzIwMzIwMDF8MA&ixlib=rb-4.1.0&q=80&w=1080' },
      { id: 'att-5', name: 'design-specs.md', type: 'md', size: '4.2 KB' },
    ],
  },

  // 4. Assistant with Mermaid diagram
  {
    id: 'msg-4',
    role: 'assistant',
    content: '我分析了你的 Dashboard 设计稿，以下是组件结构的 Mermaid 图。整体采用经典的三栏布局，左侧导航、顶部标题栏、中间内容区。',
    timestamp: '14:26',
    thinking: '分析设计稿的视觉层级...\n\n顶部：导航栏 + 用户信息\n左侧：侧边栏导航菜单\n中间：\n  - 统计卡片行\n  - 图表区域（折线图 + 柱状图）\n  - 数据表格\n右侧：通知面板\n\n使用 Mermaid graph TD 来表示组件层级关系。',
    mermaidCode: `graph TD
    A[App Shell] --> B[TopBar]
    A --> C[Sidebar]
    A --> D[MainContent]
    A --> E[NotificationPanel]
    
    B --> B1[Logo]
    B --> B2[SearchBar]
    B --> B3[UserAvatar]
    
    C --> C1[NavMenu]
    C --> C2[QuickActions]
    C1 --> C3[MenuItem x 6]
    
    D --> D1[StatsRow]
    D --> D2[ChartSection]
    D --> D3[DataTable]
    
    D1 --> D1a[StatCard x 4]
    D2 --> D2a[LineChart]
    D2 --> D2b[BarChart]
    D3 --> D3a[TableHeader]
    D3 --> D3b[TableBody]
    
    E --> E1[NotificationList]
    E --> E2[ActivityFeed]
    
    style A fill:#f0fdf4,stroke:#22c55e
    style D fill:#eff6ff,stroke:#3b82f6
    style C fill:#faf5ff,stroke:#a855f7`,
    metadata: {
      sessionId: 'a1b2c3d4e5f60002',
      model: 'google/gemini-3-pro-preview',
      status: 'success',
      startTime: '2025-10-03 14:26',
      duration: '6.4s',
      tokens: { input: 2156, output: 420, thinking: 180 },
      requestJson: MOCK_REQUEST_JSON,
      responseJson: MOCK_RESPONSE_JSON,
    },
  },

  // 5. User asks for code
  {
    id: 'msg-5',
    role: 'user',
    content: '根据这个结构，帮我实现 StatsRow 组件的代码',
    timestamp: '14:28',
  },

  // 6. Assistant with inline code block
  {
    id: 'msg-6',
    role: 'assistant',
    content: '好的，这是 StatsRow 组件的实现。使用了响应式网格布局，每个卡片展示指标名称、数值、趋势和迷你图表：',
    timestamp: '14:29',
    codeBlock: {
      language: 'tsx',
      code: `interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}

function StatCard({ title, value, change, icon }: StatCardProps) {
  const isPositive = change > 0;
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{title}</span>
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
      <div className={\`text-xs mt-1 \${isPositive ? 'text-green-600' : 'text-red-500'}\`}>
        {isPositive ? '+' : ''}{change}% vs last month
      </div>
    </div>
  );
}

function StatsRow() {
  const stats = [
    { title: 'Total Revenue', value: '$45,231', change: 20.1, icon: <DollarSign size={16} /> },
    { title: 'Subscriptions', value: '+2,350', change: 10.5, icon: <Users size={16} /> },
    { title: 'Active Users', value: '12,543', change: -2.4, icon: <Activity size={16} /> },
    { title: 'Conversion', value: '3.2%', change: 8.1, icon: <TrendingUp size={16} /> },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map(s => <StatCard key={s.title} {...s} />)}
    </div>
  );
}`,
    },
    artifact: {
      type: 'code',
      title: 'StatsRow.tsx',
      content: CODE_ARTIFACT,
      language: 'typescript',
    },
    metadata: {
      sessionId: 'a1b2c3d4e5f60003',
      model: 'google/gemini-3-pro-preview',
      status: 'success',
      startTime: '2025-10-03 14:29',
      duration: '7.8s',
      tokens: { input: 3500, output: 680 },
      requestJson: MOCK_REQUEST_JSON,
      responseJson: MOCK_RESPONSE_JSON,
    },
  },

  // 7. User asks for image generation
  {
    id: 'msg-7',
    role: 'user',
    content: '帮我生成几张 Dashboard 的背景图，要科技感的抽象几何风格',
    timestamp: '14:32',
  },

  // 8. Assistant with generated images
  {
    id: 'msg-8',
    role: 'assistant',
    content: '已为你生成了 4 张科技感抽象几何风格的背景图，适用于 Dashboard 的不同区域。你可以点击图片查看大图或下载。',
    timestamp: '14:34',
    images: [
      'https://images.unsplash.com/photo-1658052408504-2ce6a8b11d2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGdlb21ldHJpYyUyMGRpZ2l0YWwlMjBhcnR8ZW58MXx8fHwxNzcyMDY1MjUxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1716789629629-4150c1ecab69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwY2l0eSUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NzIwMjIzNTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1685013642193-c66a498195c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlcmNvbG9yJTIwbmF0dXJlJTIwcGFpbnRpbmd8ZW58MXx8fHwxNzcyMDY1MjUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1766934587214-86e21b3ae093?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwcHJvZHVjdCUyMGRlc2lnbnxlbnwxfHx8fDE3NzIwMzIwMDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    metadata: {
      sessionId: 'a1b2c3d4e5f60004',
      model: 'dall-e-3',
      status: 'success',
      startTime: '2025-10-03 14:32',
      duration: '22.1s',
      tokens: { input: 86, output: 0 },
      requestJson: '{ "prompt": "科技感抽象几何背景图", "n": 4, "size": "1024x1024" }',
      responseJson: '{ "data": [{ "url": "..." }, ...] }',
    },
  },

  // 9. User asks for web page
  {
    id: 'msg-9',
    role: 'user',
    content: '帮我制作一个产品介绍的着陆页，要现代简约风格',
    timestamp: '14:36',
  },

  // 10. Assistant with HTML web page artifact + web search
  {
    id: 'msg-10',
    role: 'assistant',
    content: '已为你制作了一个现代简约风格的产品着陆页。你可以在左侧 Artifacts 面板中点击 Preview 标签查看实时效果。\n\n页面包含以下区块：\n- **Hero 区域** - 产品标语 + CTA 按钮[1]\n- **特性展示** - 三列卡片布局[2]\n- **数据统计** - 关键指标展示[3]\n- **页脚** - 导航链接和版权信息',
    timestamp: '14:38',
    artifact: {
      type: 'html',
      title: 'Product Landing Page',
      content: HTML_PREVIEW,
    },
    searchResults: [
      { title: '2025 Landing Page Design Trends', url: 'https://designtrends.io/landing-2025', snippet: '最新着陆页设计趋势分析，包含极简主义、渐变色和微交互...', source: 'designtrends.io' },
      { title: 'Modern Web Design Principles', url: 'https://webdesign.dev/modern', snippet: '现代网页设计原则：留白、排版层次、色彩对比...', source: 'webdesign.dev' },
      { title: 'Conversion-Optimized Landing Pages', url: 'https://uxcraft.com/conversion', snippet: '高转化率着陆页的 12 个关键元素和最佳实践...', source: 'uxcraft.com' },
    ],
    metadata: {
      sessionId: 'a1b2c3d4e5f60005',
      model: 'google/gemini-3-pro-preview',
      status: 'success',
      startTime: '2025-10-03 14:36',
      duration: '12.5s',
      tokens: { input: 1240, output: 2180 },
      requestJson: MOCK_REQUEST_JSON,
      responseJson: MOCK_RESPONSE_JSON,
    },
  },

  // 11. User asks for parallel comparison
  {
    id: 'msg-11',
    role: 'user',
    content: '用多个模型并行回答：如何实现一个高性能的虚拟滚动列表？',
    timestamp: '14:40',
  },

  // 12. Parallel responses from multiple models
  {
    id: 'msg-12',
    role: 'assistant',
    content: '',
    timestamp: '14:42',
    parallelResponses: [
      {
        id: 'pr-1',
        modelName: 'Gemini 3 Pro',
        modelProvider: 'Google',
        content: '虚拟滚动的核心思想是**只渲染可视区域内的元素**，而不是渲染整个列表。\n\n关键实现步骤：\n1. 计算可视区域能容纳的元素数量\n2. 监听滚动事件，计算当前偏移量\n3. 根据偏移量动态渲染对应范围的元素\n4. 使用 `transform: translateY()` 模拟滚动位置\n\n推荐使用 `react-window` 或 `@tanstack/react-virtual` 库。',
        thinking: '用户需要实现虚拟滚动列表...\n\n常见方案：\n1. react-window / react-virtualized\n2. @tanstack/react-virtual\n3. 自己实现\n\n核心原理：\n- 只渲染 viewport 内的 DOM 节点\n- 用 padding/transform 撑开容器\n- 动态计算 startIndex/endIndex\n\n性能关键点：\n- 避免频繁 re-render\n- 使用 RAF throttle\n- 缓存测量结果',
        timestamp: '14:41',
        duration: '4.2s',
        tokens: { input: 256, output: 380, thinking: 210 },
      },
      {
        id: 'pr-2',
        modelName: 'GPT-4.1',
        modelProvider: 'OpenAI',
        content: '高性能虚拟滚动列表的实现需要关注以下几个方面：\n\n**核心算法：**\n- 使用 `IntersectionObserver` 检测元素进入/离开视口\n- 维护一个"窗口"，只保留可见元素 + 上下缓冲区\n- 对于动态高度项，需要预估高度并在渲染后修正\n\n**性能优化：**\n- `requestAnimationFrame` 节流滚动事件\n- `will-change: transform` 开启 GPU 加速\n- 使用 `ResizeObserver` 动态感知容器变化\n\n**推荐库：** `@tanstack/react-virtual` 是当前最佳选择，支持固定和动态高度。',
        timestamp: '14:41',
        duration: '5.1s',
        tokens: { input: 256, output: 420 },
      },
      {
        id: 'pr-3',
        modelName: 'Claude 4 Sonnet',
        modelProvider: 'Anthropic',
        content: '我来从架构层面分析虚拟滚动的实现方案：\n\n**方案对比：**\n\n| 方案 | 固定高度 | 动态高度 | 水平滚动 | Bundle Size |\n|------|---------|---------|---------|------------|\n| react-window | ✅ | ⚠️ | ✅ | 6KB |\n| react-virtual | ✅ | ✅ | ✅ | 3KB |\n| 手写实现 | ✅ | ❌ | ❌ | 0KB |\n\n**我的建议：**\n使用 `@tanstack/react-virtual`，它提供了最灵活的 API，且框架无关。搭配 `overscan` 参数可以减少滚动时的闪烁。\n\n对于超大数据集（100k+），建议结合分页加载和虚拟滚动，使用 `onScroll` 触发下一页数据加载。',
        thinking: '分析虚拟滚动方案...\n\n让我对比主流方案：\n1. react-window: 轻量但 API 较老\n2. @tanstack/react-virtual: 新一代方案，headless\n3. react-virtualized: 功能全但体积大\n\n考虑到用户问的是"高性能"，我应该从架构角度给出建议。\n\n动态高度是最大挑战，需要：\n- 预估 → 测量 → 修正 循环\n- 缓存已测量的高度\n- 处理resize导致的高度变化',
        timestamp: '14:42',
        duration: '6.3s',
        tokens: { input: 256, output: 512, thinking: 185 },
      },
    ],
  },

  // 13. User with mixed attachments (image + doc)
  {
    id: 'msg-13',
    role: 'user',
    content: '这是我们的 logo 和品牌指南，帮我基于此生成社交媒体配图',
    timestamp: '14:45',
    attachments: [
      { id: 'att-6', name: 'brand-logo.png', type: 'png', size: '245 KB', previewUrl: 'https://images.unsplash.com/photo-1658052408504-2ce6a8b11d2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200' },
      { id: 'att-7', name: 'brand-guidelines.pdf', type: 'pdf', size: '5.6 MB' },
      { id: 'att-8', name: 'color-palette.csv', type: 'csv', size: '1.2 KB' },
    ],
  },

  // 14. Assistant with images + reasoning
  {
    id: 'msg-14',
    role: 'assistant',
    content: '基于你的品牌指南和 logo，我生成了 4 张社交媒体配图，分别适用于不同平台和场景。所有配图都遵循品牌色规范（主色 #2563EB，辅色 #F59E0B）。',
    timestamp: '14:48',
    thinking: '分析品牌指南...\n\n品牌色：\n- 主色：蓝色系 #2563EB\n- 辅色：琥珀色 #F59E0B\n- 中性色：灰色系\n\nLogo 特点：\n- 几何图形，现代感\n- 适合深色和浅色背景\n\n需要生成的社交媒体尺寸：\n1. Instagram Post: 1080x1080\n2. Twitter Header: 1500x500\n3. Facebook Cover: 1200x628\n4. LinkedIn Post: 1200x627\n\n风格：延续品牌指南的极简风格，使用渐变和几何元素。',
    images: [
      'https://images.unsplash.com/photo-1658052408504-2ce6a8b11d2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGdlb21ldHJpYyUyMGRpZ2l0YWwlMjBhcnR8ZW58MXx8fHwxNzcyMDY1MjUxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1685013642193-c66a498195c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlcmNvbG9yJTIwbmF0dXJlJTIwcGFpbnRpbmd8ZW58MXx8fHwxNzcyMDY1MjUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    metadata: {
      sessionId: 'a1b2c3d4e5f60006',
      model: 'dall-e-3',
      status: 'success',
      startTime: '2025-10-03 14:46',
      duration: '28.4s',
      tokens: { input: 1024, output: 0, thinking: 245 },
      requestJson: '{ "prompt": "品牌配图生成", "n": 4 }',
      responseJson: '{ "data": [{ "url": "..." }] }',
    },
  },
];

// ===========================
// Multi-Model / Multi-Assistant Parallel Mock Messages
// ===========================

export const MOCK_PARALLEL_MESSAGES: AssistantMessage[] = [
  {
    id: 'pm-1',
    role: 'user',
    content: '我想做一个 AI 聊天应用，需要支持多模型接入、流式输出和对话分支管理。请帮我做技术选型分析。',
    timestamp: '12:30',
  },
  {
    id: 'pm-2',
    role: 'assistant',
    content: '好的，这是一个很全面的需求。我来从前端框架、状态管理、AI 模型接入层和流式通信四个维度进行分析。\n\n**前端框架**：推荐 React 18+ 配合 TypeScript，生态成熟且社区活跃。\n**状态管理**：zustand + immer，轻量且支持复杂嵌套状态。\n**AI 接入层**：统一的 Provider 抽象层，支持 OpenAI / Anthropic / Google 等多家模型。\n**流式通信**：Server-Sent Events (SSE) 配合 ReadableStream。\n\n需要我详细展开某个方面吗？',
    timestamp: '12:32',
    thinking: '分析用户需求：\n1. 多模型接入 - 需要统一的 API 抽象层\n2. 流式输出 - SSE / WebSocket / fetch stream\n3. 对话分支 - 树状数据结构\n\n先给出整体架构概览，然后等用户选择深入的方向。',
    assistantLabel: '默认助手',
  },
  {
    id: 'pm-3',
    role: 'user',
    content: '流式输出这块，请用多个模型同时分析，对比不同方案的优劣',
    timestamp: '12:34',
  },
  {
    id: 'pm-4',
    role: 'assistant',
    content: '',
    timestamp: '12:36',
    parallelResponses: [
      {
        id: 'pm-4-r1',
        modelName: 'Gemini 3 Pro',
        modelProvider: 'Google',
        content: '**SSE (Server-Sent Events) 方案**\n\n推荐使用 SSE 作为主要的流式通信方案：\n\n1. **原生浏览器支持** - 无需额外依赖\n2. **自动重连** - 浏览器内置断线重连\n3. **HTTP/2 兼容** - 可复用连接\n\n**优势**：实现简单、兼容性好\n**劣势**：单向通信，中断需 AbortController',
        thinking: 'SSE 是最主流的流式方案，分析优劣。',
        timestamp: '12:35',
        duration: '4.8s',
        tokens: { input: 380, output: 520, thinking: 120 },
      },
      {
        id: 'pm-4-r2',
        modelName: 'GPT-4.1',
        modelProvider: 'OpenAI',
        content: '**WebSocket 方案**\n\n如果需要双向实时通信，WebSocket 更优：\n\n1. **双向通信** - 客户端可随时发送中断信号\n2. **低延迟** - 适合高频交互\n3. **连接复用** - 一次握手多次通信\n\n**优势**：双向通信、低延迟\n**劣势**：实现复杂、需处理重连',
        timestamp: '12:36',
        duration: '5.3s',
        tokens: { input: 380, output: 490 },
      },
      {
        id: 'pm-4-r3',
        modelName: 'Claude 4 Sonnet',
        modelProvider: 'Anthropic',
        content: '**fetch + ReadableStream（推荐）**\n\n最现代化的方案：\n\n| 特性 | SSE | WebSocket | fetch stream |\n|------|-----|-----------|-------------|\n| 复杂度 | 低 | 高 | 低 |\n| 双向 | 否 | 是 | 否 |\n| 可取消 | hack | 原生 | AbortController |\n\n**综合推荐**：普通场景用 fetch stream。',
        thinking: '对比三种方案，给出表格和推荐。',
        timestamp: '12:36',
        duration: '6.1s',
        tokens: { input: 380, output: 580, thinking: 150 },
      },
    ],
  },
  {
    id: 'pm-5',
    role: 'user',
    content: '对话分支管理怎么实现？请多个助手从不同角度分析',
    timestamp: '12:38',
  },
  {
    id: 'pm-6',
    role: 'assistant',
    content: '',
    timestamp: '12:41',
    parallelResponses: [
      {
        id: 'pm-6-r1',
        assistantName: '默认助手',
        modelName: 'Gemini 3 Pro',
        modelProvider: 'Google',
        content: '**对话分支的数据结构设计**\n\n核心是一棵树：\n\n```typescript\ninterface MessageNode {\n  id: string;\n  parentId: string | null;\n  branchId: string;\n  children: string[];\n}\n```\n\n**分支创建时机**：重新生成、编辑历史消息、多模型并行回复。',
        timestamp: '12:40',
        duration: '5.6s',
        tokens: { input: 420, output: 600, thinking: 180 },
      },
      {
        id: 'pm-6-r2',
        assistantName: '代码专家',
        modelName: 'DeepSeek R1',
        modelProvider: 'DeepSeek',
        content: '**分支管理的状态管理**\n\n使用 zustand + immer：Map 存储节点 O(1) 查找，activePath 记录根到叶的路径，切换分支只需更新路径。',
        timestamp: '12:41',
        duration: '7.2s',
        tokens: { input: 420, output: 680, thinking: 160 },
      },
      {
        id: 'pm-6-r3',
        assistantName: '写作助手',
        modelName: 'Claude 4 Sonnet',
        modelProvider: 'Anthropic',
        content: '**分支可视化 UX 设计**\n\n1. 消息旁分支导航器（1/3 切换）\n2. 可缩放画布分支树视图\n3. 活跃路径绿色高亮\n4. hover 预览折叠节点内容\n5. 分支标签命名',
        timestamp: '12:41',
        duration: '5.8s',
        tokens: { input: 420, output: 540, thinking: 130 },
      },
    ],
  },
  {
    id: 'pm-7',
    role: 'user',
    content: '总结一下，给我一个最终的技术栈推荐清单',
    timestamp: '12:43',
  },
  {
    id: 'pm-8',
    role: 'assistant',
    content: '综合以上分析，最终推荐技术栈：\n\n**前端**：React 18 + TypeScript + zustand + Tailwind CSS\n**通信**：fetch + ReadableStream + AbortController\n**AI 接入**：统一 Provider 抽象层\n**分支管理**：树状数据结构 + 可视化画布\n**工具链**：Vite 6 + Vitest + ESLint',
    timestamp: '12:45',
    thinking: '综合讨论，给出结构化的最终推荐清单。',
    assistantLabel: '默认助手',
  },
];

// ===========================
// Multi-Assistant Parallel Messages
// ===========================

export const MOCK_MULTI_ASSISTANT_MESSAGES: AssistantMessage[] = [
  {
    id: 'ma-1',
    role: 'user',
    content: '我们要做一个 AI 知识库产品，支持文档上传、语义检索和多轮对话。请从产品、技术和设计三个角度同时评审这个需求。',
    timestamp: '15:00',
  },
  {
    id: 'ma-2',
    role: 'assistant',
    content: '',
    timestamp: '15:05',
    parallelResponses: [
      {
        id: 'ma-2-r1',
        assistantName: '产品经理',
        modelName: 'GPT-4.1',
        modelProvider: 'OpenAI',
        content: '**产品视角评审**\n\n从产品角度分析这个 AI 知识库需求：\n\n1. **核心价值主张**：让企业知识资产可检索、可对话、可复用\n2. **目标用户**：中小企业知识管理负责人、技术团队\n3. **MVP 功能优先级**：\n   - P0：文档上传 + 语义检索\n   - P1：多轮对话 + 引用溯源\n   - P2：权限管理 + 团队协作\n\n**风险点**：检索准确率是核心体验指标，建议早期引入 A/B 测试框架。',
        thinking: '从产品视角分析核心价值、用户画像和优先级...',
        timestamp: '15:03',
        duration: '3.5s',
        tokens: { input: 420, output: 580, thinking: 140 },
      },
      {
        id: 'ma-2-r2',
        assistantName: '代码专家',
        modelName: 'Claude 4 Sonnet',
        modelProvider: 'Anthropic',
        content: '**技术可行性评审**\n\n技术架构建议：\n\n1. **文档处理**：Unstructured + LangChain 文档加载器，支持 PDF/DOCX/MD\n2. **向量存储**：Qdrant 或 Milvus，支持混合检索（向量 + BM25）\n3. **Embedding 模型**：text-embedding-3-large 或 BGE-M3\n4. **对话引擎**：RAG + ReRank 二级检索架构\n\n**技术风险**：\n- 大文档分块策略影响检索质量\n- 多轮对话需要上下文压缩避免 token 膨胀\n- 建议 chunk size 512-1024，overlap 20%',
        thinking: '技术架构：文档处理 → 向量化 → 检索 → 对话生成，分析每一环的技术选型。',
        timestamp: '15:04',
        duration: '6.1s',
        tokens: { input: 420, output: 720, thinking: 180 },
      },
      {
        id: 'ma-2-r3',
        assistantName: 'UI 设计师',
        modelName: 'Gemini 3 Pro',
        modelProvider: 'Google',
        content: '**设计体验评审**\n\n界面设计建议：\n\n1. **上传体验**：拖拽上传 + 批量导入 + 处理进度可视化\n2. **检索界面**：搜索框 + 筛选面板 + 结果卡片（高亮匹配片段）\n3. **对话界面**：左侧知识源面板 + 右侧对话区 + 引用气泡\n4. **信息架构**：知识库列表 → 文档管理 → 检索/对话\n\n**设计原则**：\n- 检索结果需展示来源文档和相关度分数\n- 对话回答中的引用需可点击跳转到原文\n- 空状态引导用户上传第一份文档',
        thinking: '从用户体验角度设计上传、检索、对话三个核心场景的交互...',
        timestamp: '15:05',
        duration: '4.8s',
        tokens: { input: 420, output: 640, thinking: 150 },
      },
    ],
  },
  {
    id: 'ma-3',
    role: 'user',
    content: '技术方案里的分块策略，请各位助手再深入讨论一下',
    timestamp: '15:08',
  },
  {
    id: 'ma-4',
    role: 'assistant',
    content: '',
    timestamp: '15:12',
    parallelResponses: [
      {
        id: 'ma-4-r1',
        assistantName: '代码专家',
        modelName: 'Claude 4 Sonnet',
        modelProvider: 'Anthropic',
        content: '**分块策略技术实现**\n\n推荐 **语义分块 + 滑动窗口** 混合方案：\n\n```python\nfrom langchain.text_splitter import RecursiveCharacterTextSplitter\n\nsplitter = RecursiveCharacterTextSplitter(\n    chunk_size=800,\n    chunk_overlap=150,\n    separators=["\\n\\n", "\\n", "。", "；"]\n)\n```\n\n**关键参数**：\n- 中文文档用句号/分号作为分隔符\n- chunk_overlap 建议 15-20%\n- 添加父文档索引以支持上下文扩展检索',
        timestamp: '15:10',
        duration: '5.2s',
        tokens: { input: 560, output: 620, thinking: 130 },
      },
      {
        id: 'ma-4-r2',
        assistantName: '产品经理',
        modelName: 'GPT-4.1',
        modelProvider: 'OpenAI',
        content: '**分块对产品体验的影响**\n\n从用户体验角度：\n\n1. **检索精度** — 分块太大导致噪音多，太小导致上下文丢失\n2. **引用展示** — 用户期望看到完整段落而非碎片\n3. **建议**：向用户暴露「精确/宽泛」检索模式切换\n\n可以让用户在设置中选择「精确匹配」（小 chunk）和「语境理解」（大 chunk）两种模式。',
        timestamp: '15:11',
        duration: '3.8s',
        tokens: { input: 560, output: 480, thinking: 100 },
      },
      {
        id: 'ma-4-r3',
        assistantName: 'UI 设计师',
        modelName: 'Gemini 3 Pro',
        modelProvider: 'Google',
        content: '**分块结果的可视化设计**\n\n建议在管理后台提供分块预览功能：\n\n1. 文档原文左侧展示，右侧展示分块结果\n2. 不同颜色标注各个 chunk 边界\n3. 重叠区域用半透明色带标识\n4. 支持手动调整分块点（拖拽分割线）\n\n这样运营人员可以直观评估分块质量，无需技术背景。',
        timestamp: '15:12',
        duration: '4.2s',
        tokens: { input: 560, output: 520, thinking: 120 },
      },
    ],
  },
  {
    id: 'ma-5',
    role: 'user',
    content: '好的，请总结一下最终的方案要点',
    timestamp: '15:15',
  },
  {
    id: 'ma-6',
    role: 'assistant',
    content: '综合三位助手的评审意见，最终方案要点如下：\n\n**产品层面**：MVP 聚焦文档上传 + 语义检索 + 多轮对话三大核心，引入 A/B 测试验证检索效果。\n\n**技术架构**：RAG + ReRank 二级检索，语义分块混合方案（chunk 800 / overlap 150），Qdrant 向量数据库 + BM25 混合检索。\n\n**设计体验**：三栏布局（知识源 + 检索 + 对话），引用可溯源，分块结果可视化预览，空状态引导流程。\n\n**下一步行动**：各角色按分工推进，两周后进行第一轮原型评审。',
    timestamp: '15:18',
    thinking: '综合三个角度的意见，给出结构化的最终方案。',
    assistantLabel: '产品经理',
  },
];
