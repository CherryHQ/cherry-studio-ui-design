import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Trash2, ArchiveRestore, MessageSquare, Bot, Layers,
  Settings2, AlertTriangle, FileText, Play, ChevronDown,
  Sparkles, MousePointerClick, Network, BookOpen, Palette,
} from 'lucide-react';
import {
  Button, EmptyState, Typography, Checkbox,
  Popover, PopoverTrigger, PopoverContent,
  Dialog, DialogContent,
} from '@cherry-studio/ui';
import {
  useRecycleBin,
  FALLBACK_PARENTS_BY_TYPE,
  type RecycleBinItem,
  type RecycleBinItemType,
} from '@/app/context/RecycleBinContext';

// ===========================
// Type config
// ===========================
const TYPE_ICON: Record<RecycleBinItemType, React.ComponentType<{ size?: number; className?: string }>> = {
  topic: MessageSquare,
  session: Play,
  painting: Palette,
  skill: Sparkles,
  assistant: MousePointerClick,
  agent: Bot,
  mcp: Network,
  prompt: FileText,
  kb: BookOpen,
};

const TYPE_LABEL: Record<RecycleBinItemType, string> = {
  topic: '聊天话题',
  session: 'Agent 会话',
  painting: '绘图',
  skill: 'Skill',
  assistant: '助手',
  agent: 'Agent',
  mcp: 'MCP',
  prompt: 'Prompt',
  kb: '知识库',
};

const TYPE_FILTER_GROUPS: { title: string | null; items: { id: 'all' | RecycleBinItemType; label: string }[] }[] = [
  {
    title: null,
    items: [{ id: 'all', label: '全部' }],
  },
  {
    title: '历史记录',
    items: [
      { id: 'topic',    label: '聊天话题' },
      { id: 'session',  label: 'Agent 会话' },
      { id: 'painting', label: '绘图' },
    ],
  },
  {
    title: '自定义资源',
    items: [
      { id: 'skill',     label: 'Skill' },
      { id: 'assistant', label: '助手' },
      { id: 'agent',     label: 'Agent' },
      { id: 'mcp',       label: 'MCP' },
      { id: 'prompt',    label: 'Prompt' },
      { id: 'kb',        label: '知识库' },
    ],
  },
];

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

// ===========================
// Page
// ===========================
export function RecycleBinPage() {
  const {
    items, retentionDays, setRetentionDays,
    restore, permanentDelete, restoreMany, permanentDeleteMany, empty,
  } = useRecycleBin();

  const [typeFilter, setTypeFilter] = useState<'all' | RecycleBinItemType>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // Pending state for the 4 iOS-style confirm dialogs (per-row delete,
  // batch delete, empty bin, retention shortening). Toast-based versions
  // felt out of place; we revert to small modal alerts for consistency
  // with the move-to-bin confirm dialog.
  const [permanentDeletePending, setPermanentDeletePending] = useState<RecycleBinItem | null>(null);
  const [batchDeleteConfirmOpen, setBatchDeleteConfirmOpen] = useState(false);
  const [emptyConfirmOpen, setEmptyConfirmOpen] = useState(false);
  const [retentionWarnPending, setRetentionWarnPending] = useState<{ next: number; immediateCount: number; soonCount: number } | null>(null);

  // Counts per type
  const typeCounts = useMemo(() => {
    const acc: Record<string, number> = { all: items.length };
    items.forEach(it => { acc[it.type] = (acc[it.type] ?? 0) + 1; });
    return acc;
  }, [items]);

  const filtered = useMemo(() => {
    return items
      .filter(it => typeFilter === 'all' || it.type === typeFilter)
      .sort((a, b) => b.deletedAt - a.deletedAt);
  }, [items, typeFilter]);

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
    if (allFilteredSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map(it => it.id)));
  };

  // Restore. For orphan items the row passes a fallback parent name —
  // we show a context-rich toast and call restore in silent mode (the
  // context's generic "已恢复" is suppressed to avoid double toasts).
  const handleSingleRestore = (item: RecycleBinItem, fallbackName?: string) => {
    if (fallbackName) {
      toast.success(`「${item.name}」已恢复`, {
        description: `归属到 ${fallbackName}`,
      });
      restore(item.id, { silent: true });
    } else {
      restore(item.id);
    }
  };

  const handleBatchRestore = () => {
    const ids = Array.from(selected);
    restoreMany(ids);
    setSelected(new Set());
  };

  const handleSinglePermanentDelete = (item: RecycleBinItem) => setPermanentDeletePending(item);
  const handleBatchDelete = () => setBatchDeleteConfirmOpen(true);
  const handleEmptyBin = () => setEmptyConfirmOpen(true);

  const handleRetentionChange = (next: number) => {
    if (next < retentionDays) {
      const now = Date.now();
      const sevenDaysMs = 7 * MS_PER_DAY;
      // Split affected items into two buckets so the warning can clearly
      // tell the user how many will be purged immediately (already past
      // the new expiry) vs. how many will expire within the next 7 days.
      let immediateCount = 0;
      let soonCount = 0;
      items.forEach(it => {
        const expiresUnderNew = it.deletedAt + next * MS_PER_DAY;
        if (expiresUnderNew <= now) immediateCount++;
        else if (expiresUnderNew - now <= sevenDaysMs) soonCount++;
      });
      if (immediateCount + soonCount > 0) {
        setRetentionWarnPending({ next, immediateCount, soonCount });
        return;
      }
    }
    setRetentionDays(next);
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
                onClick={handleEmptyBin}
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

        {/* Right: list */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Selection-mode bar (only shows when items are checked). The
              non-selected default shows nothing — keeps the page light. */}
          {someSelected && (
            <div className="flex items-center gap-2 px-6 pt-3 pb-2 flex-shrink-0 min-h-[40px]">
              <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer select-none">
                <Checkbox checked={allFilteredSelected} onCheckedChange={toggleSelectAll} />
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
                <Button variant="ghost" size="sm" onClick={handleBatchRestore} className="text-xs h-7 px-2 gap-1 hover:bg-accent/30">
                  <ArchiveRestore size={11} />
                  恢复
                </Button>
                <Button variant="ghost" size="sm" onClick={handleBatchDelete} className="text-xs h-7 px-2 gap-1 text-destructive/80 hover:text-destructive hover:bg-destructive/10">
                  <Trash2 size={11} />
                  永久删除
                </Button>
              </div>
            </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto px-6 pt-3 pb-4 scrollbar-thin">
            {filtered.length === 0 ? (
              <EmptyState
                preset="no-result"
                title={typeFilter !== 'all' ? '该类型暂无已删除项' : '回收站是空的'}
                description={typeFilter !== 'all' ? undefined : '删除的话题、助手、Agent、Skill 会暂存在这里。'}
                compact
              />
            ) : (
              <div className="space-y-px">
                {filtered.map(item => (
                  <RecycleBinRow
                    key={item.id}
                    item={item}
                    selected={selected.has(item.id)}
                    onToggleSelect={() => toggleSelect(item.id)}
                    onRestore={(fallbackName?: string) => handleSingleRestore(item, fallbackName)}
                    onDelete={() => handleSinglePermanentDelete(item)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* iOS-style confirm alerts for destructive actions. Same visual
          pattern as the move-to-bin RecycleBinConfirmDialog. */}
      <ConfirmAlert
        open={!!permanentDeletePending}
        onOpenChange={(o) => { if (!o) setPermanentDeletePending(null); }}
        title="确认永久删除？"
        actionLabel="永久删除"
        onConfirm={() => permanentDeletePending && permanentDelete(permanentDeletePending.id)}
      />
      <ConfirmAlert
        open={batchDeleteConfirmOpen}
        onOpenChange={setBatchDeleteConfirmOpen}
        title={`确认永久删除 ${selected.size} 项？`}
        actionLabel="永久删除"
        onConfirm={() => {
          permanentDeleteMany(Array.from(selected));
          setSelected(new Set());
        }}
      />
      <ConfirmAlert
        open={emptyConfirmOpen}
        onOpenChange={setEmptyConfirmOpen}
        title="清空回收站？"
        description={`全部 ${items.length} 项将被永久删除`}
        actionLabel="清空"
        onConfirm={() => {
          empty();
          setSelected(new Set());
        }}
      />
      <ConfirmAlert
        open={!!retentionWarnPending}
        onOpenChange={(o) => { if (!o) setRetentionWarnPending(null); }}
        icon="warning"
        title="缩短保留期？"
        description={(() => {
          if (!retentionWarnPending) return undefined;
          const { immediateCount: imm, soonCount: soon } = retentionWarnPending;
          if (imm > 0 && soon > 0) return `${imm} 项立即清理，${soon} 项 7 天内到期`;
          if (imm > 0) return `${imm} 项将被立即清理`;
          return `${soon} 项将在 7 天内到期`;
        })()}
        actionLabel="仍然缩短"
        onConfirm={() => retentionWarnPending && setRetentionDays(retentionWarnPending.next)}
      />
    </div>
  );
}

// ===========================
// Local iOS-style confirm alert — used by all 4 destructive confirms.
// Matches the visual style of RecycleBinConfirmDialog (icon + title +
// optional subtext + 2 side-by-side buttons).
// ===========================
function ConfirmAlert({
  open, onOpenChange, icon = 'delete', title, description, actionLabel, onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon?: 'delete' | 'warning';
  title: string;
  description?: string;
  actionLabel: string;
  onConfirm: () => void;
}) {
  const Icon = icon === 'warning' ? AlertTriangle : Trash2;
  const tintBg = icon === 'warning' ? 'bg-accent-amber/15' : 'bg-destructive/12';
  const tintFg = icon === 'warning' ? 'text-accent-amber' : 'text-destructive';
  const actionCls = icon === 'warning' ? 'text-accent-amber hover:bg-accent-amber/12' : 'text-destructive hover:bg-destructive/8';
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[260px] p-0 overflow-hidden" showCloseButton={false}>
        <div className="px-5 pt-5 pb-4 flex flex-col items-center text-center">
          <div className={`rounded-[14px] ${tintBg} flex items-center justify-center mb-2.5`} style={{ width: 44, height: 44 }}>
            <Icon size={20} className={tintFg} />
          </div>
          <h3 className="text-[15px] font-medium text-foreground">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
          )}
        </div>
        <div className="grid grid-cols-2 border-t border-border/30">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-11 rounded-none text-sm text-muted-foreground hover:bg-accent/40 hover:text-foreground border-r border-border/30"
          >
            取消
          </Button>
          <Button
            variant="ghost"
            onClick={handleConfirm}
            className={`h-11 rounded-none text-sm ${actionCls}`}
          >
            {actionLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ===========================
// Row — flat list, with an inline orphan-restore popover for items
// whose original parent assistant/agent has been deleted.
// ===========================
function RecycleBinRow({
  item, selected, onToggleSelect, onRestore, onDelete,
}: {
  item: RecycleBinItem;
  selected: boolean;
  onToggleSelect: () => void;
  /** For non-orphan items, called with no arg → direct restore.
      For orphan items, called with the picked fallback parent name
      so the page can surface it in the success toast. */
  onRestore: (fallbackName?: string) => void;
  onDelete: () => void;
}) {
  const isOrphan = !!item.originalParentMissing;
  const fallbackOptions = FALLBACK_PARENTS_BY_TYPE[item.type] ?? [];

  // When the popover is open, we force-keep the actions container visible
  // even if the cursor has left the row's hover area. Without this, the
  // action div collapses (display:none), which detaches the popover
  // trigger and Radix dismisses the popover the moment the user tries
  // to click an option.
  const [popoverOpen, setPopoverOpen] = useState(false);
  return (
    <div
      className={`group flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors ${
        selected ? 'bg-accent/40' : 'hover:bg-accent/20'
      }`}
    >
      <Checkbox checked={selected} onCheckedChange={onToggleSelect} className="flex-shrink-0" />

      {/* Title + chips — single line, truncates name on overflow */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="text-sm text-foreground truncate">{item.name}</span>
        <span className="text-[10px] px-1.5 py-px rounded border border-border/40 text-muted-foreground/70 flex-shrink-0">
          {TYPE_LABEL[item.type]}
        </span>
        {item.fromArchived && (
          <span className="text-[10px] px-1.5 py-px rounded bg-muted/50 text-muted-foreground/75 flex-shrink-0">
            曾归档
          </span>
        )}
      </div>

      {/* Right side: relative time (hidden on hover, replaced by actions) */}
      <span className="text-xs text-muted-foreground/55 tabular-nums flex-shrink-0 group-hover:hidden">
        {formatRelativeDelete(item.deletedAt)}
      </span>
      <div className={`items-center gap-1 flex-shrink-0 ${popoverOpen ? 'flex' : 'hidden group-hover:flex'}`}>
        {isOrphan ? (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="inline"
                className="px-2 py-[2px] text-xs gap-1 text-foreground hover:bg-accent/30"
                title={item.originalParentName ? `原${item.type === 'topic' ? '助手' : 'Agent'} 「${item.originalParentName}」 已删除` : undefined}
              >
                <ArchiveRestore size={11} />
                <span>恢复</span>
                <ChevronDown size={10} className="opacity-60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[200px] p-1">
              <p className="text-[11px] text-muted-foreground/70 px-2 pt-1.5 pb-1">
                原{item.type === 'topic' ? '助手' : 'Agent'}已删除，选新归属：
              </p>
              <div className="space-y-px">
                {fallbackOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setPopoverOpen(false);
                      onRestore(opt.name);
                    }}
                    className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-xs text-foreground hover:bg-accent/40 transition-colors"
                  >
                    <span className="truncate">{opt.name}</span>
                    {opt.isDefault && (
                      <span className="text-[10px] px-1 py-px rounded bg-muted/50 text-muted-foreground/75 flex-shrink-0">
                        默认
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <Button
            variant="ghost"
            size="inline"
            onClick={() => onRestore()}
            className="px-2 py-[2px] text-xs gap-1 text-foreground hover:bg-accent/30"
          >
            <ArchiveRestore size={11} />
            <span>恢复</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="inline"
          onClick={onDelete}
          className="px-2 py-[2px] text-xs gap-1 text-destructive/70 hover:bg-destructive/10"
        >
          <Trash2 size={11} />
        </Button>
      </div>
    </div>
  );
}
