import React, { useState, useMemo } from 'react';
import {
  Trash2, ArchiveRestore, MessageSquare, Bot, Layers,
  Settings2, AlertTriangle, FileText, Play, ChevronDown, Clock,
  Sparkles, Terminal, MousePointerClick, Network, BookOpen, Plug,
} from 'lucide-react';
import {
  Button, SearchInput, EmptyState, Typography, Checkbox,
  Popover, PopoverTrigger, PopoverContent,
  Dialog, DialogContent,
} from '@cherry-studio/ui';
import { Tooltip } from '@/app/components/Tooltip';
import { useRecycleBin, type RecycleBinItem, type RecycleBinItemType } from '@/app/context/RecycleBinContext';

// ===========================
// Type config
// ===========================
// Icons aligned with MarketPage's KIND_ICON so users see a consistent
// visual language across 市场 / 资源库 / 回收站.
const TYPE_ICON: Record<RecycleBinItemType, React.ComponentType<{ size?: number; className?: string }>> = {
  topic: MessageSquare,
  session: Play,
  skill: Sparkles,
  cli: Terminal,
  assistant: MousePointerClick,
  agent: Bot,
  mcp: Network,
  prompt: FileText,
  kb: BookOpen,
  integration: Plug,
};

const TYPE_LABEL: Record<RecycleBinItemType, string> = {
  topic: '聊天话题',
  session: 'Agent 会话',
  skill: 'Skill',
  cli: 'CLI',
  assistant: '助手',
  agent: 'Agent',
  mcp: 'MCP',
  prompt: 'Prompt',
  kb: '知识库',
  integration: '集成',
};

// Type filter groups, rendered as two sections with sub-headers in the
// sidebar. Keeps the long list readable.
const TYPE_FILTER_GROUPS: { title: string | null; items: { id: 'all' | RecycleBinItemType; label: string }[] }[] = [
  {
    title: null,
    items: [{ id: 'all', label: '全部' }],
  },
  {
    title: '对话记录',
    items: [
      { id: 'topic',   label: '聊天话题' },
      { id: 'session', label: 'Agent 会话' },
    ],
  },
  {
    title: '自定义资源',
    items: [
      { id: 'skill',       label: 'Skill' },
      { id: 'cli',         label: 'CLI' },
      { id: 'assistant',   label: '助手' },
      { id: 'agent',       label: 'Agent' },
      { id: 'mcp',         label: 'MCP' },
      { id: 'prompt',      label: 'Prompt' },
      { id: 'kb',          label: '知识库' },
      { id: 'integration', label: '集成' },
    ],
  },
];

const TIME_FILTERS = [
  { id: 'all', label: '全部时间' },
  { id: 'today', label: '今天' },
  { id: '7d', label: '7 天内' },
  { id: '30d', label: '30 天内' },
] as const;

const RETENTION_OPTIONS = [
  { value: 7, label: '7 天' },
  { value: 30, label: '30 天' },
  { value: 60, label: '60 天' },
  { value: 90, label: '90 天' },
  { value: 36500, label: '永不' },
] as const;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function formatRelativeDelete(ts: number): string {
  const days = Math.floor((Date.now() - ts) / MS_PER_DAY);
  if (days === 0) return '今天';
  if (days === 1) return '1 天前';
  if (days < 30) return `${days} 天前`;
  return `${Math.floor(days / 30)} 个月前`;
}

function remainingDays(expiresAt: number): number {
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / MS_PER_DAY));
}

// ===========================
// Page
// ===========================
export function RecycleBinPage() {
  const {
    items, retentionDays, setRetentionDays,
    restore, permanentDelete, restoreMany, permanentDeleteMany, empty,
  } = useRecycleBin();

  const [typeFilter, setTypeFilter] = useState<'all' | RecycleBinItemType>('all');
  const [timeFilter, setTimeFilter] = useState<typeof TIME_FILTERS[number]['id']>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [emptyConfirmOpen, setEmptyConfirmOpen] = useState(false);
  const [permanentDeletePending, setPermanentDeletePending] = useState<RecycleBinItem | null>(null);
  const [batchDeleteConfirmOpen, setBatchDeleteConfirmOpen] = useState(false);
  const [retentionWarnPending, setRetentionWarnPending] = useState<{ next: number; affectedCount: number } | null>(null);

  // When the user shortens retention, count items that would expire within
  // 7 days under the new policy. If any, prompt before applying.
  const handleRetentionChange = (next: number) => {
    if (next < retentionDays) {
      const sevenDaysMs = 7 * MS_PER_DAY;
      const affected = items.filter(it => {
        const expiresUnderNew = it.deletedAt + next * MS_PER_DAY;
        return expiresUnderNew - Date.now() <= sevenDaysMs;
      }).length;
      if (affected > 0) {
        setRetentionWarnPending({ next, affectedCount: affected });
        return;
      }
    }
    setRetentionDays(next);
  };

  const confirmRetentionChange = () => {
    if (retentionWarnPending) {
      setRetentionDays(retentionWarnPending.next);
      setRetentionWarnPending(null);
    }
  };

  // Counts per type
  const typeCounts = useMemo(() => {
    const acc: Record<string, number> = { all: items.length };
    items.forEach(it => { acc[it.type] = (acc[it.type] ?? 0) + 1; });
    return acc;
  }, [items]);

  // Cascade helpers: find direct children of a parent and look up a
  // child's parent (for the locked-child tooltip — uses the parent's
  // actual type label like "助手" / "Agent" so users get a natural
  // sentence instead of a technical "父级" word).
  const getChildren = (parentId: string) => items.filter(it => it.parentId === parentId);
  const getParentLabel = (childItem: RecycleBinItem): string | undefined => {
    if (!childItem.parentId) return undefined;
    const parent = items.find(it => it.id === childItem.parentId);
    if (!parent) return undefined;
    return `${TYPE_LABEL[parent.type]} 「${parent.name}」`;
  };

  const isFiltering = typeFilter !== 'all' || timeFilter !== 'all' || !!search;

  // Filtered list. In the no-filter "All" view, we re-order so children
  // appear immediately after their parent (group rendering). In any
  // filtered view, items render flat by deletedAt — children may show
  // without their parent context, but their lock state is preserved.
  const filtered = useMemo(() => {
    const matched = items.filter(it => {
      if (typeFilter !== 'all' && it.type !== typeFilter) return false;
      if (timeFilter !== 'all') {
        const ageMs = Date.now() - it.deletedAt;
        if (timeFilter === 'today' && ageMs > MS_PER_DAY) return false;
        if (timeFilter === '7d' && ageMs > 7 * MS_PER_DAY) return false;
        if (timeFilter === '30d' && ageMs > 30 * MS_PER_DAY) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        if (!it.name.toLowerCase().includes(q) && !(it.meta?.toLowerCase().includes(q))) return false;
      }
      return true;
    });
    const byDeletedAt = (a: RecycleBinItem, b: RecycleBinItem) => b.deletedAt - a.deletedAt;

    if (isFiltering) {
      return matched.sort(byDeletedAt);
    }

    // Group ordering: parents (no parentId) sorted by deletedAt, with
    // their matched children inlined immediately after each parent.
    const matchedSet = new Set(matched.map(it => it.id));
    const parents = matched.filter(it => !it.parentId).sort(byDeletedAt);
    const childrenInMatched = matched.filter(it => it.parentId && matchedSet.has(it.parentId));
    const orphansInView = matched.filter(it => it.parentId && !matchedSet.has(it.parentId)).sort(byDeletedAt);

    const ordered: RecycleBinItem[] = [];
    parents.forEach(p => {
      ordered.push(p);
      childrenInMatched.filter(c => c.parentId === p.id).forEach(c => ordered.push(c));
    });
    // Children whose parent didn't pass the filter (shouldn't happen with
    // current logic since unfiltered view includes all items, but safety):
    ordered.push(...orphansInView);
    return ordered;
  }, [items, typeFilter, timeFilter, search, isFiltering]);

  const allFilteredSelected = filtered.length > 0 && filtered.every(it => selected.has(it.id));
  const someSelected = selected.size > 0;

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(it => it.id)));
    }
  };

  const handleBatchRestore = () => {
    restoreMany(Array.from(selected));
    setSelected(new Set());
  };

  const handleBatchDelete = () => {
    setBatchDeleteConfirmOpen(true);
  };

  const confirmBatchDelete = () => {
    permanentDeleteMany(Array.from(selected));
    setSelected(new Set());
    setBatchDeleteConfirmOpen(false);
  };

  const confirmPermanentDelete = () => {
    if (permanentDeletePending) {
      permanentDelete(permanentDeletePending.id);
      setPermanentDeletePending(null);
    }
  };

  const handleEmptyConfirm = () => {
    empty();
    setSelected(new Set());
    setEmptyConfirmOpen(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 flex-shrink-0 border-b border-border/15">
        <div className="flex items-center gap-2 mb-1">
          <Trash2 size={16} className="text-muted-foreground" />
          <Typography variant="subtitle">回收站</Typography>
          <span className="text-xs text-muted-foreground tabular-nums">{items.length}</span>

          <div className="ml-auto flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs h-7 px-2 gap-1 text-muted-foreground hover:text-foreground">
                  <Settings2 size={12} />
                  清理设置
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[240px] p-3">
                <p className="text-xs text-foreground mb-2">回收站保留期</p>
                <div className="space-y-px">
                  {RETENTION_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleRetentionChange(opt.value)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                        retentionDays === opt.value
                          ? 'bg-accent text-foreground'
                          : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {retentionDays === opt.value && <span className="text-foreground/80">✓</span>}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground/70 mt-2 leading-relaxed">
                  到期后将自动永久删除回收站中的项目。
                </p>
              </PopoverContent>
            </Popover>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEmptyConfirmOpen(true)}
                className="text-xs h-7 px-2 gap-1 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={12} />
                清空回收站
              </Button>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          已删除的资源 <span className="text-foreground/70">{retentionDays >= 36500 ? '永久' : `${retentionDays} 天内`}</span> 可恢复，到期自动清理。
        </p>
      </div>

      {/* Two-column body */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left filters */}
        <div className="w-[180px] flex-shrink-0 border-r border-border/15 overflow-y-auto py-3 px-3 scrollbar-thin bg-background/40">
          <p className="px-2 pb-1 text-[11px] uppercase tracking-wider text-muted-foreground/40">类型</p>
          <div>
            {TYPE_FILTER_GROUPS.map((group, gi) => (
              <div key={gi} className={gi > 0 ? 'mt-3' : ''}>
                {group.title && (
                  <p className="px-2 pb-1 pt-1 text-[10px] text-muted-foreground/45">{group.title}</p>
                )}
                <div className="space-y-px">
                  {group.items.map(f => {
                    const Icon = f.id === 'all' ? Layers : TYPE_ICON[f.id];
                    const active = typeFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setTypeFilter(f.id)}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                          active ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                        }`}
                      >
                        <Icon size={12} strokeWidth={1.6} />
                        <span className="flex-1 text-left">{f.label}</span>
                        <span className="text-xs text-muted-foreground/60 tabular-nums">{typeCounts[f.id] ?? 0}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right: search + list */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Cleanup banner — appears when bin holds many items. Demo
              threshold is intentionally low (8) so the UI is visible
              with seed data; real product uses 100+ per PRD. */}
          {items.length > 8 && (
            <div className="mx-6 mt-3 px-3 py-2 rounded-lg bg-accent-amber/8 border border-accent-amber/25 flex items-center gap-2 flex-shrink-0">
              <AlertTriangle size={12} className="text-accent-amber flex-shrink-0" />
              <p className="text-xs text-foreground/80 flex-1">
                回收站已有 <span className="tabular-nums font-medium">{items.length}</span> 项，建议清理或缩短保留期。
              </p>
              <Button
                variant="ghost"
                size="inline"
                onClick={() => setEmptyConfirmOpen(true)}
                className="text-xs h-6 px-2 text-foreground/80 hover:text-foreground hover:bg-accent/40"
              >
                清空回收站
              </Button>
            </div>
          )}

          {/* Top bar — switches between "discover" mode (search + time filter)
              and "selection" mode (batch actions) once items are checked.
              Inspired by Gmail / 飞书邮箱: prevents cramming 6 controls on
              one row, and matches the user's mental model — they don't
              search while batch-operating. */}
          <div className="flex items-center gap-2 px-6 pt-3 pb-2 flex-shrink-0 min-h-[44px]">
            {someSelected ? (
              <>
                <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer select-none">
                  <Checkbox
                    checked={allFilteredSelected}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="tabular-nums">已选 {selected.size} 项</span>
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelected(new Set())}
                  className="text-xs h-7 px-2 gap-1 text-muted-foreground hover:text-foreground"
                >
                  取消选择
                </Button>

                <div className="ml-auto flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBatchRestore}
                    className="text-xs h-7 px-2 gap-1 hover:bg-accent/30"
                  >
                    <ArchiveRestore size={11} />
                    恢复
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBatchDelete}
                    className="text-xs h-7 px-2 gap-1 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 size={11} />
                    永久删除
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 max-w-[320px]">
                  <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="搜索回收站..."
                    clearable
                  />
                </div>

                {/* 删除时间 dropdown — moved out of the left sidebar to avoid
                    a second scrollbar when the type filter list is long. */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`text-xs h-7 px-2 gap-1 ${
                        timeFilter !== 'all'
                          ? 'text-foreground bg-accent/30'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Clock size={11} />
                      <span>{TIME_FILTERS.find(f => f.id === timeFilter)?.label}</span>
                      <ChevronDown size={11} className="opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-[160px] p-1">
                    <div className="space-y-px">
                      {TIME_FILTERS.map(f => (
                        <button
                          key={f.id}
                          onClick={() => setTimeFilter(f.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                            timeFilter === f.id
                              ? 'bg-accent text-foreground'
                              : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                          }`}
                        >
                          <span>{f.label}</span>
                          {timeFilter === f.id && <span className="text-foreground/80">✓</span>}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                {filtered.length > 0 && (
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                    <Checkbox
                      checked={allFilteredSelected}
                      onCheckedChange={toggleSelectAll}
                    />
                    全选
                  </label>
                )}
              </>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-6 pb-4 scrollbar-thin">
            {filtered.length === 0 ? (
              <EmptyState
                preset="no-result"
                title={search || typeFilter !== 'all' || timeFilter !== 'all' ? '未找到匹配的项目' : '回收站是空的'}
                description={search || typeFilter !== 'all' || timeFilter !== 'all' ? undefined : '删除的话题、助手、Agent、Skill 会暂存在这里。'}
                compact
              />
            ) : (
              <div className="space-y-px">
                {filtered.map(item => {
                  const childCount = item.parentId ? 0 : getChildren(item.id).length;
                  const parentLabel = getParentLabel(item);
                  return (
                    <RecycleBinRow
                      key={item.id}
                      item={item}
                      selected={selected.has(item.id)}
                      isChild={!!item.parentId}
                      childCount={childCount}
                      parentLabel={parentLabel}
                      flattenChildVisual={isFiltering}
                      onToggleSelect={() => toggleSelect(item.id)}
                      onRestore={() => restore(item.id)}
                      onDelete={() => setPermanentDeletePending(item)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Per-row permanent delete confirmation */}
      <Dialog open={!!permanentDeletePending} onOpenChange={(open) => { if (!open) setPermanentDeletePending(null); }}>
        <DialogContent className="w-[380px] p-5" showCloseButton={false}>
          {permanentDeletePending && (() => {
            const pendingChildCount = getChildren(permanentDeletePending.id).length;
            return (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-destructive/15 flex items-center justify-center flex-shrink-0">
                    <Trash2 size={18} className="text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-sm text-foreground">
                      {pendingChildCount > 0
                        ? `永久删除「${permanentDeletePending.name}」及其 ${pendingChildCount} 个子项？`
                        : '永久删除？'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">此操作无法撤销，不会再进入回收站。</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/40 mb-4">
                  {permanentDeletePending.icon && <span className="text-sm flex-shrink-0">{permanentDeletePending.icon}</span>}
                  <span className="text-xs text-foreground truncate">{permanentDeletePending.name}</span>
                  <span className="ml-auto text-[10px] px-1.5 py-px rounded border border-border/40 text-muted-foreground/70 flex-shrink-0">
                    {TYPE_LABEL[permanentDeletePending.type]}
                  </span>
                </div>
                {pendingChildCount > 0 && (
                  <p className="text-[11px] text-muted-foreground/75 mb-4 -mt-2 px-1">
                    级联删除：归属其下的 <span className="text-foreground/80 tabular-nums">{pendingChildCount}</span> 个子项会一并永久消失。
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setPermanentDeletePending(null)} className="px-3 rounded-lg text-xs text-muted-foreground hover:bg-accent">
                    取消
                  </Button>
                  <Button variant="destructive" size="sm" onClick={confirmPermanentDelete} className="px-3 rounded-lg text-xs">
                    永久删除
                  </Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Batch permanent delete confirmation */}
      <Dialog open={batchDeleteConfirmOpen} onOpenChange={setBatchDeleteConfirmOpen}>
        <DialogContent className="w-[380px] p-5" showCloseButton={false}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-destructive/15 flex items-center justify-center flex-shrink-0">
              <Trash2 size={18} className="text-destructive" />
            </div>
            <div>
              <h3 className="text-sm text-foreground">永久删除 {selected.size} 项？</h3>
              <p className="text-xs text-muted-foreground mt-0.5">此操作无法撤销。</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setBatchDeleteConfirmOpen(false)} className="px-3 rounded-lg text-xs text-muted-foreground hover:bg-accent">
              取消
            </Button>
            <Button variant="destructive" size="sm" onClick={confirmBatchDelete} className="px-3 rounded-lg text-xs">
              永久删除
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Retention-shortening warning */}
      <Dialog open={!!retentionWarnPending} onOpenChange={(open) => { if (!open) setRetentionWarnPending(null); }}>
        <DialogContent className="w-[380px] p-5" showCloseButton={false}>
          {retentionWarnPending && (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-accent-amber/15 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={18} className="text-accent-amber" />
                </div>
                <div>
                  <h3 className="text-sm text-foreground">缩短保留期？</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    将有 <span className="text-foreground/80 tabular-nums font-medium">{retentionWarnPending.affectedCount}</span> 项在 7 天内到期被自动清理。
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground/75 mb-4 px-1">
                现有项的剩余天数会按新保留期重新计算（删除时间 + 新保留期）。如有需要保留的项，请先恢复或导出。
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setRetentionWarnPending(null)} className="px-3 rounded-lg text-xs text-muted-foreground hover:bg-accent">
                  取消
                </Button>
                <Button variant="destructive" size="sm" onClick={confirmRetentionChange} className="px-3 rounded-lg text-xs">
                  仍然缩短
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Empty-recycle-bin confirmation */}
      <Dialog open={emptyConfirmOpen} onOpenChange={setEmptyConfirmOpen}>
        <DialogContent className="w-[360px] p-5" showCloseButton={false}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-destructive/15 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-destructive" />
            </div>
            <div>
              <h3 className="text-sm text-foreground">清空回收站？</h3>
              <p className="text-xs text-muted-foreground mt-0.5">将永久删除回收站中的所有 {items.length} 项，操作不可撤销。</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEmptyConfirmOpen(false)} className="px-3 rounded-lg text-xs text-muted-foreground hover:bg-accent">
              取消
            </Button>
            <Button variant="destructive" size="sm" onClick={handleEmptyConfirm} className="px-3 rounded-lg text-xs">
              清空
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===========================
// Row
// ===========================
function RecycleBinRow({
  item, selected, isChild, childCount, parentLabel, flattenChildVisual,
  onToggleSelect, onRestore, onDelete,
}: {
  item: RecycleBinItem;
  selected: boolean;
  isChild: boolean;
  childCount: number;
  /** Localized parent label like "助手 「Translator」" / "Agent 「周报生成 Agent」"
      — used in the locked-child tooltip. */
  parentLabel?: string;
  /** When true (filter active), drop the indent/border styling on
      children since their parent isn't visible. Lock semantics stay. */
  flattenChildVisual?: boolean;
  onToggleSelect: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) {
  const remaining = remainingDays(item.expiresAt);
  const badgeCls =
    remaining <= 3 ? 'text-destructive bg-destructive/10' :
    remaining <= 7 ? 'text-accent-amber bg-accent-amber/12' :
    'text-muted-foreground bg-muted/40';
  const lockedTooltip = isChild && parentLabel ? `请先恢复${parentLabel}` : undefined;
  const renderIndented = isChild && !flattenChildVisual;

  return (
    <div
      className={`group flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors ${
        selected ? 'bg-accent/40' : 'hover:bg-accent/20'
      } ${renderIndented ? 'pl-9 border-l-2 border-border/20 ml-3 rounded-l-none' : ''}`}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={isChild ? undefined : onToggleSelect}
        disabled={isChild}
        title={lockedTooltip}
        className="flex-shrink-0"
      />

      {/* Icon */}
      <div className="w-7 h-7 rounded-md bg-muted/40 flex items-center justify-center flex-shrink-0 text-sm">
        {item.icon ?? '📄'}
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground truncate">{item.name}</span>
          <span className="text-[10px] px-1.5 py-px rounded border border-border/40 text-muted-foreground/70 flex-shrink-0">
            {TYPE_LABEL[item.type]}
          </span>
          {item.fromArchived && (
            <span className="text-[10px] px-1.5 py-px rounded bg-muted/50 text-muted-foreground/75 flex-shrink-0">
              曾归档
            </span>
          )}
          {isChild && (
            <span className="text-[10px] px-1.5 py-px rounded bg-muted/40 text-muted-foreground/65 flex-shrink-0">
              子项
            </span>
          )}
          {childCount > 0 && (
            <span className="text-[10px] px-1.5 py-px rounded bg-accent/40 text-foreground/75 flex-shrink-0">
              含 {childCount} 个子项
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground/70 mt-0.5">
          {item.meta && <span className="truncate">{item.meta}</span>}
          {item.meta && <span className="text-muted-foreground/40">·</span>}
          <span>删除于 {formatRelativeDelete(item.deletedAt)}</span>
        </div>
      </div>

      {/* Remaining badge */}
      <span className={`text-[10px] px-1.5 py-0.5 rounded tabular-nums flex-shrink-0 group-hover:hidden ${badgeCls}`}>
        {remaining === 0 ? '即将清理' : `剩 ${remaining} 天`}
      </span>

      {/* Hover actions */}
      <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0">
        <Tooltip content={lockedTooltip ?? ''} side="top">
          <Button
            variant="ghost"
            size="inline"
            onClick={isChild ? () => {} : onRestore}
            aria-disabled={isChild}
            className={`px-2 py-[2px] text-xs gap-1 ${
              isChild
                ? 'text-muted-foreground/40 cursor-not-allowed hover:bg-transparent'
                : 'text-foreground hover:bg-accent/30'
            }`}
          >
            <ArchiveRestore size={11} />
            <span>恢复</span>
          </Button>
        </Tooltip>
        <Tooltip content={isChild ? '永久删除此子项（不影响父级和其他子项）' : ''} side="top">
          <Button
            variant="ghost"
            size="inline"
            onClick={onDelete}
            className="px-2 py-[2px] text-xs gap-1 text-destructive/70 hover:bg-destructive/10"
          >
            <Trash2 size={11} />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
