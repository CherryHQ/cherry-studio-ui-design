import React, { useState } from 'react';
import { Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { Button, SearchInput, EmptyState, Typography } from '@cherry-studio/ui';

// ===========================
// Mock archived sessions
// ===========================

interface ArchivedSession {
  id: string;
  title: string;
  agentName: string;
  agentIcon?: string;
  timestamp: string;
  group?: string;
  type: 'chat' | 'agent';
}

const MOCK_ARCHIVED: ArchivedSession[] = [
  { id: 'arc-1', title: '旧版认证系统重构', agentName: '后端工程师', agentIcon: '⚙️', timestamp: '2026-03-15', group: '项目开发', type: 'agent' },
  { id: 'arc-2', title: 'Vue 2 → Vue 3 迁移评估', agentName: '调研分析师', agentIcon: '🔍', timestamp: '2026-03-10', group: '调研分析', type: 'agent' },
  { id: 'arc-c1', title: '如何优化 React 渲染性能', agentName: 'Claude 4 Sonnet', agentIcon: '💬', timestamp: '2026-03-12', type: 'chat' },
  { id: 'arc-3', title: 'Redis 集群部署', agentName: '运维工程师', agentIcon: '🚀', timestamp: '2026-03-08', group: '运维部署', type: 'agent' },
  { id: 'arc-c2', title: 'TypeScript 泛型最佳实践', agentName: 'GPT-4o', agentIcon: '💬', timestamp: '2026-03-05', type: 'chat' },
  { id: 'arc-4', title: '用户反馈分析报告 Q1', agentName: '数据分析师', agentIcon: '📈', timestamp: '2026-02-28', group: '数据分析', type: 'agent' },
  { id: 'arc-c3', title: 'Tailwind CSS 响应式布局技巧', agentName: 'Claude 4 Sonnet', agentIcon: '💬', timestamp: '2026-02-25', type: 'chat' },
  { id: 'arc-5', title: 'Landing Page A/B 测试', agentName: '全栈工程师', agentIcon: '🤖', timestamp: '2026-02-20', group: '项目开发', type: 'agent' },
  { id: 'arc-c4', title: 'Docker Compose 多服务编排', agentName: 'Gemini 2.5 Pro', agentIcon: '💬', timestamp: '2026-02-18', type: 'chat' },
  { id: 'arc-6', title: 'Nginx 反向代理优化', agentName: '运维工程师', agentIcon: '🚀', timestamp: '2026-02-15', group: '运维部署', type: 'agent' },
  { id: 'arc-7', title: 'React 18 性能基准测试', agentName: '调研分析师', agentIcon: '🔍', timestamp: '2026-02-10', group: '调研分析', type: 'agent' },
  { id: 'arc-c5', title: 'Git rebase 与 merge 的区别', agentName: 'GPT-4o', agentIcon: '💬', timestamp: '2026-02-05', type: 'chat' },
  { id: 'arc-8', title: '旧版 REST API 文档整理', agentName: '后端工程师', agentIcon: '⚙️', timestamp: '2026-01-25', group: '项目开发', type: 'agent' },
];

// ===========================
// Archive Manage Page
// ===========================

export function ArchiveManagePage() {
  const [sessions, setSessions] = useState(MOCK_ARCHIVED);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = sessions.filter(s => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return s.title.toLowerCase().includes(q) || s.agentName.toLowerCase().includes(q);
    }
    return true;
  });

  const handleUnarchive = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const handleDelete = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <Archive size={16} className="text-muted-foreground" />
          <Typography variant="subtitle">归档管理</Typography>
          <span className="text-xs text-muted-foreground tabular-nums">{sessions.length}</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">已归档的会话记录，可随时恢复或永久删除。</p>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="搜索归档会话..."
              clearable
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 scrollbar-thin">
        {filtered.length === 0 ? (
          <EmptyState
            preset="no-result"
            title={searchQuery ? '未找到匹配的归档' : '暂无归档会话'}
            compact
          />
        ) : (
          <div className="space-y-px">
            {filtered.map(session => (
              <div
                key={session.id}
                className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/15 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground truncate">{session.title}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs flex-shrink-0">{session.agentIcon}</span>
                    <span className="text-xs text-muted-foreground">{session.agentName}</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0 group-hover:hidden">{session.timestamp}</span>
                <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="inline"
                    onClick={() => handleUnarchive(session.id)}
                    className="px-2 py-[2px] text-xs text-foreground hover:bg-accent/30"
                  >
                    <ArchiveRestore size={11} />
                    <span>恢复</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="inline"
                    onClick={() => handleDelete(session.id)}
                    className="px-2 py-[2px] text-xs text-destructive/70 hover:bg-destructive/8"
                  >
                    <Trash2 size={11} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
