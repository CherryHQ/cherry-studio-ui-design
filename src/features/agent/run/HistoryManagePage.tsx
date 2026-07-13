import { useMemo, useState } from 'react';
import { ChevronLeft, Pin, Trash2 } from 'lucide-react';
import { Button, SearchInput, Checkbox, EmptyState } from '@cherry-studio/ui';
import { History } from 'lucide-react';
import { Tooltip } from '@/app/components/Tooltip';
import { AVAILABLE_AGENTS } from '@/app/config/agentTools';
import type { AgentSession } from '@/app/types/agent';

// ===========================
// HistoryManagePage — 历史记录
// ===========================
// 独立的全量会话管理页，从左栏筛选菜单的「历史记录」进入，接管内容区。
// 左侧按状态/智能体过滤，右侧任务表格支持搜索、置顶、删除与批量删除。

interface Props {
  sessions: AgentSession[];
  onBack: () => void;
  onOpenSession: (session: AgentSession) => void;
  onUpdateSession: (id: string, updates: Partial<AgentSession>) => void;
  onDeleteSession: (id: string) => void;
}

type StatusKey = 'all' | 'running' | 'completed' | 'error';

// paused/awaiting 归入「运行中」——它们仍是未完结的任务。
const statusOf = (s: AgentSession): Exclude<StatusKey, 'all'> =>
  s.status === 'completed' ? 'completed' : s.status === 'error' ? 'error' : 'running';

const STATUS_FILTERS: { key: Exclude<StatusKey, 'all'>; label: string; dot: string }[] = [
  { key: 'running', label: '运行中', dot: 'bg-amber-400' },
  { key: 'completed', label: '已完成', dot: 'bg-emerald-500' },
  { key: 'error', label: '失败', dot: 'bg-red-500' },
];

export function HistoryManagePage({ sessions, onBack, onOpenSession, onUpdateSession, onDeleteSession }: Props) {
  const [statusFilter, setStatusFilter] = useState<StatusKey>('all');
  const [agentFilter, setAgentFilter] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const agents = useMemo(() => {
    const counts = new Map<string, number>();
    sessions.forEach(s => counts.set(s.agentName, (counts.get(s.agentName) ?? 0) + 1));
    return Array.from(counts.entries()).map(([name, count]) => ({
      name, count,
      avatar: sessions.find(s => s.agentName === name)?.agentIcon
        ?? AVAILABLE_AGENTS.find(a => a.name === name)?.avatar ?? '🤖',
    }));
  }, [sessions]);

  const statusCounts = useMemo(() => {
    const counts: Record<Exclude<StatusKey, 'all'>, number> = { running: 0, completed: 0, error: 0 };
    sessions.forEach(s => { counts[statusOf(s)] += 1; });
    return counts;
  }, [sessions]);

  const filtered = useMemo(() => {
    let list = sessions;
    if (statusFilter !== 'all') list = list.filter(s => statusOf(s) === statusFilter);
    if (agentFilter) list = list.filter(s => s.agentName === agentFilter);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter(s => s.title.toLowerCase().includes(q) || s.lastMessage.toLowerCase().includes(q));
    // 置顶优先，其余保持原序（mock 已按最近排列）
    return [...list.filter(s => s.pinned), ...list.filter(s => !s.pinned)];
  }, [sessions, statusFilter, agentFilter, query]);

  const allChecked = filtered.length > 0 && filtered.every(s => selected.has(s.id));
  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(filtered.map(s => s.id)));
  const toggleOne = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const deleteSelected = () => {
    selected.forEach(id => onDeleteSession(id));
    setSelected(new Set());
  };

  const filterRow = (active: boolean, onClick: () => void, content: React.ReactNode, count: number) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-[7px] rounded-lg text-left text-sm transition-colors ${
        active ? 'bg-accent/50 text-foreground' : 'text-foreground/75 hover:bg-accent/30'
      }`}
    >
      <span className="flex-1 min-w-0 flex items-center gap-2 truncate">{content}</span>
      <span className="text-xs text-muted-foreground/50 tabular-nums">{count}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-full min-w-0 min-h-0">
      {/* ===== Header：返回 + 标题 + 任务数 ===== */}
      <div className="flex items-center gap-2 px-4 h-[52px] flex-shrink-0 border-b border-border/30">
        <Button variant="ghost" size="icon-xs" onClick={onBack}
          className="p-1 w-auto h-auto text-muted-foreground hover:text-foreground hover:bg-accent/40">
          <ChevronLeft size={16} />
        </Button>
        <span className="text-base font-semibold">历史记录</span>
        <span className="text-sm text-muted-foreground/50">{sessions.length} 个任务</span>
      </div>

      <div className="flex flex-1 min-h-0 min-w-0">
        {/* ===== 左侧过滤栏 ===== */}
        <div className="w-[210px] flex-shrink-0 border-r border-border/25 overflow-y-auto px-3 py-4 space-y-5">
          <div>
            <div className="px-3 pb-1.5 text-xs text-muted-foreground/60">状态</div>
            <div className="space-y-px">
              {filterRow(statusFilter === 'all', () => setStatusFilter('all'), <span>全部</span>, sessions.length)}
              {STATUS_FILTERS.map(f =>
                filterRow(statusFilter === f.key, () => setStatusFilter(f.key), (
                  <>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${f.dot}`} />
                    <span>{f.label}</span>
                  </>
                ), statusCounts[f.key]),
              )}
            </div>
          </div>
          <div>
            <div className="px-3 pb-1.5 text-xs text-muted-foreground/60">智能体</div>
            <div className="space-y-px">
              {filterRow(agentFilter === null, () => setAgentFilter(null), <span>全部</span>, sessions.length)}
              {agents.map(a =>
                filterRow(agentFilter === a.name, () => setAgentFilter(a.name), (
                  <>
                    <span className="text-sm leading-none flex-shrink-0">{a.avatar}</span>
                    <span className="truncate">{a.name}</span>
                  </>
                ), a.count),
              )}
            </div>
          </div>
        </div>

        {/* ===== 右侧：工具栏 + 表格 ===== */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0">
            <span className="text-sm font-medium">{filtered.length} 条结果</span>
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              disabled={selected.size === 0}
              onClick={deleteSelected}
              className={`gap-1.5 ${selected.size === 0 ? 'text-muted-foreground/40' : 'text-destructive/80 hover:text-destructive hover:bg-destructive/8'}`}
            >
              <Trash2 size={13} />
              批量删除{selected.size > 0 ? ` (${selected.size})` : ''}
            </Button>
            <div className="w-[200px]">
              <SearchInput value={query} onChange={setQuery} placeholder="搜索任务..." />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-5">
            {/* 表头 */}
            <div className="flex items-center gap-3 px-2 py-2 border-b border-border/40 text-xs text-muted-foreground/60">
              <Checkbox checked={allChecked} onCheckedChange={toggleAll} className="flex-shrink-0" />
              <span className="flex-1 min-w-0">任务</span>
              <span className="w-36 flex-shrink-0">智能体</span>
              <span className="w-16 flex-shrink-0">时间</span>
              <span className="w-16 flex-shrink-0 text-right">操作</span>
            </div>
            {filtered.length === 0 ? (
              <div className="pt-16">
                <EmptyState icon={History} title="没有匹配的任务" description="调整筛选条件或搜索词后再试。" compact />
              </div>
            ) : (
              filtered.map(s => {
                const agent = agents.find(a => a.name === s.agentName);
                return (
                  <div
                    key={s.id}
                    className="group flex items-center gap-3 px-2 py-3 border-b border-border/20 hover:bg-accent/25 transition-colors cursor-pointer rounded-sm"
                    onClick={() => onOpenSession(s)}
                  >
                    <span onClick={(e) => e.stopPropagation()} className="flex items-center flex-shrink-0">
                      <Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggleOne(s.id)} />
                    </span>
                    <span className="flex-1 min-w-0 flex items-center gap-1.5">
                      {s.pinned && <Pin size={10} className="-rotate-45 text-muted-foreground/50 flex-shrink-0" />}
                      <span className="text-sm truncate">{s.title || '未命名'}</span>
                    </span>
                    <span className="w-36 flex-shrink-0 flex items-center gap-1.5 text-sm text-foreground/75">
                      <span className="text-sm leading-none">{agent?.avatar ?? '🤖'}</span>
                      <span className="truncate">{s.agentName}</span>
                    </span>
                    <span className="w-16 flex-shrink-0 text-xs text-muted-foreground/60 tabular-nums">{s.timestamp}</span>
                    <span className="w-16 flex-shrink-0 flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <Tooltip content={s.pinned ? '取消置顶' : '置顶'} side="top">
                        <Button variant="ghost" size="icon-xs" onClick={() => onUpdateSession(s.id, { pinned: !s.pinned })}
                          className={`p-1 w-auto h-auto hover:bg-accent/60 ${s.pinned ? 'text-foreground' : 'text-muted-foreground/60 hover:text-foreground'}`}>
                          <Pin size={13} className={s.pinned ? '' : '-rotate-45'} />
                        </Button>
                      </Tooltip>
                      <Tooltip content="删除" side="top">
                        <Button variant="ghost" size="icon-xs" onClick={() => onDeleteSession(s.id)}
                          className="p-1 w-auto h-auto text-muted-foreground/60 hover:text-destructive hover:bg-destructive/8">
                          <Trash2 size={13} />
                        </Button>
                      </Tooltip>
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
