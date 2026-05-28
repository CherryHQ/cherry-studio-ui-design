import React, { createContext, useContext, useMemo, useState } from 'react';

// ===========================
// Types
// ===========================

export interface ArchivedSession {
  id: string;
  title: string;
  agentName: string;
  agentIcon?: string;
  timestamp: string;
  group?: string;
  type: 'chat' | 'agent';
}

interface ArchiveContextValue {
  sessions: ArchivedSession[];
  setSessions: React.Dispatch<React.SetStateAction<ArchivedSession[]>>;
}

// ===========================
// Mock seed
// ===========================
const MOCK_ARCHIVED: ArchivedSession[] = [
  { id: 'arc-1',  title: '旧版认证系统重构',           agentName: '后端工程师',     agentIcon: '⚙️',  timestamp: '2026-03-15', group: '项目开发', type: 'agent' },
  { id: 'arc-2',  title: 'Vue 2 → Vue 3 迁移评估',     agentName: '调研分析师',     agentIcon: '🔍',  timestamp: '2026-03-10', group: '调研分析', type: 'agent' },
  { id: 'arc-c1', title: '如何优化 React 渲染性能',    agentName: 'Claude 4 Sonnet', agentIcon: '💬', timestamp: '2026-03-12', type: 'chat' },
  { id: 'arc-3',  title: 'Redis 集群部署',             agentName: '运维工程师',     agentIcon: '🚀',  timestamp: '2026-03-08', group: '运维部署', type: 'agent' },
  { id: 'arc-c2', title: 'TypeScript 泛型最佳实践',    agentName: 'GPT-4o',         agentIcon: '💬', timestamp: '2026-03-05', type: 'chat' },
  { id: 'arc-4',  title: '用户反馈分析报告 Q1',         agentName: '数据分析师',     agentIcon: '📈',  timestamp: '2026-02-28', group: '数据分析', type: 'agent' },
  { id: 'arc-c3', title: 'Tailwind CSS 响应式布局技巧', agentName: 'Claude 4 Sonnet', agentIcon: '💬', timestamp: '2026-02-25', type: 'chat' },
  { id: 'arc-5',  title: 'Landing Page A/B 测试',       agentName: '全栈工程师',     agentIcon: '🤖',  timestamp: '2026-02-20', group: '项目开发', type: 'agent' },
  { id: 'arc-c4', title: 'Docker Compose 多服务编排',  agentName: 'Gemini 2.5 Pro', agentIcon: '💬', timestamp: '2026-02-18', type: 'chat' },
  { id: 'arc-6',  title: 'Nginx 反向代理优化',          agentName: '运维工程师',     agentIcon: '🚀',  timestamp: '2026-02-15', group: '运维部署', type: 'agent' },
  { id: 'arc-7',  title: 'React 18 性能基准测试',       agentName: '调研分析师',     agentIcon: '🔍',  timestamp: '2026-02-10', group: '调研分析', type: 'agent' },
  { id: 'arc-c5', title: 'Git rebase 与 merge 的区别', agentName: 'GPT-4o',         agentIcon: '💬', timestamp: '2026-02-05', type: 'chat' },
  { id: 'arc-8',  title: '旧版 REST API 文档整理',      agentName: '后端工程师',     agentIcon: '⚙️',  timestamp: '2026-01-25', group: '项目开发', type: 'agent' },
];

// ===========================
// Context
// ===========================
const ArchiveContext = createContext<ArchiveContextValue | null>(null);

export function ArchiveProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<ArchivedSession[]>(MOCK_ARCHIVED);
  const value = useMemo<ArchiveContextValue>(() => ({ sessions, setSessions }), [sessions]);
  return <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>;
}

export function useArchive() {
  const ctx = useContext(ArchiveContext);
  if (!ctx) throw new Error('useArchive must be used inside <ArchiveProvider>');
  return ctx;
}
