import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Pin, X, GitBranch, Pencil } from 'lucide-react';
import { useAgentSession } from '@/app/context/AgentSessionContext';
import type { AgentSession } from '@/app/types/agent';
import { Tooltip } from '@/app/components/Tooltip';

// ===========================
// Helpers
// ===========================

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ===========================
// Status dot
// ===========================

const STATUS_META: Record<AgentSession['status'], { label: string; dot: string | null }> = {
  active:    { label: '运行中',   dot: 'bg-emerald-500 animate-pulse' },
  waiting:   { label: '审批中',   dot: 'bg-amber-400 animate-pulse-slow' },
  error:     { label: '运行报错', dot: 'bg-red-500' },
  paused:    { label: '已暂停',   dot: 'bg-muted-foreground/30' },
  completed: { label: '已完成',   dot: null },
};

function StatusDot({ status }: { status: AgentSession['status'] }) {
  const dot = STATUS_META[status]?.dot;
  if (!dot) return null;
  return <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />;
}

// ===========================
// Task context menu
// ===========================

interface ContextMenuState {
  x: number;
  y: number;
  session: AgentSession;
}

function TaskContextMenu({
  state,
  onRename,
  onTogglePin,
  onClose,
  onBranch,
  onDismiss,
}: {
  state: ContextMenuState;
  onRename: () => void;
  onTogglePin: () => void;
  onClose: () => void;
  onBranch: () => void;
  onDismiss: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onDismiss();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss(); };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [onDismiss]);

  const x = Math.min(state.x, window.innerWidth - 188);
  const y = Math.min(state.y + 4, window.innerHeight - 160);

  const items = [
    { icon: Pencil,    label: '重命名',                              action: onRename },
    { icon: Pin,       label: state.session.pinned ? '取消固定' : '固定任务', action: onTogglePin },
    { icon: GitBranch, label: '从当前任务创建分支',                   action: onBranch },
    { divider: true   },
    { icon: X,         label: '关闭任务', action: onClose, danger: true },
  ] as const;

  return (
    <div
      ref={ref}
      className="fixed z-[300] bg-popover border border-border/60 rounded-lg shadow-xl shadow-black/20 p-0.5 min-w-[152px]"
      style={{ left: x, top: y }}
    >
      {items.map((item, i) => {
        if ('divider' in item) {
          return <div key={i} className="h-px bg-border/30 my-0.5 mx-1.5" />;
        }
        const Icon = item.icon;
        const danger = 'danger' in item && item.danger;
        return (
          <button
            key={i}
            onClick={() => { item.action(); onDismiss(); }}
            className={`w-full flex items-center gap-2 px-2.5 py-[5px] text-[11px] rounded-md transition-colors text-left ${
              danger
                ? 'text-destructive hover:bg-destructive/10'
                : 'text-popover-foreground hover:bg-accent'
            }`}
          >
            <Icon size={11} className="flex-shrink-0 opacity-70" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

// ===========================
// TaskBar
// ===========================

interface TaskBarProps {
  sidebarWidth: number;
}

export function TaskBar({ sidebarWidth }: TaskBarProps) {
  const [view, setView] = useState<'recent' | 'pinned'>('recent');
  const {
    sessions, activeSessionId,
    selectSession, deleteSession, updateSession, addSession, reorderSessions,
  } = useAgentSession();

  // Context menu
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // Inline rename
  const [renamingId, setRenamingId]   = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  // Prevents onBlur from saving when Escape key is used
  const escapeRef = useRef(false);

  // Drag-to-reorder
  const [draggingId, setDraggingId]       = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ targetId: string; position: 'before' | 'after' } | null>(null);
  // Ref avoids stale-closure reads of draggingId inside onDrop
  const draggingIdRef = useRef<string | null>(null);

  const tasks = view === 'pinned'
    ? sessions.filter(s => s.pinned)
    : sessions;

  // ── Context menu ──────────────────────────────

  const handleContextMenu = useCallback((e: React.MouseEvent, session: AgentSession) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, session });
  }, []);

  // ── Rename ────────────────────────────────────

  const startRename = useCallback((session: AgentSession) => {
    escapeRef.current = false;
    setRenameValue(session.title);
    setRenamingId(session.id);
  }, []);

  const commitRename = useCallback((id: string) => {
    const trimmed = renameValue.trim();
    // Do not save empty title — silently revert to original
    if (trimmed) {
      updateSession(id, { title: trimmed });
    }
    setRenamingId(null);
  }, [renameValue, updateSession]);

  const cancelRename = useCallback(() => {
    escapeRef.current = true;
    setRenamingId(null);
  }, []);

  // ── Close with adjacent navigation ───────────

  const handleClose = useCallback((sessionId: string) => {
    if (sessionId === activeSessionId) {
      const idx = tasks.findIndex(s => s.id === sessionId);
      const adjacent = tasks[idx + 1] ?? tasks[idx - 1] ?? null;
      if (adjacent) selectSession(adjacent.id);
      // else: deleteSession will set activeSessionId → null automatically
    }
    deleteSession(sessionId);
  }, [activeSessionId, tasks, selectSession, deleteSession]);

  // ── Branch ────────────────────────────────────

  const handleBranch = useCallback((session: AgentSession) => {
    // Strip any existing branch suffix to get the canonical base name
    const base = session.title.replace(/ - 分支( \d+)?$/, '');
    const pattern = new RegExp(`^${escapeRegex(base)} - 分支( \\d+)?$`);
    const branchCount = sessions.filter(s => pattern.test(s.title)).length;
    const newTitle = branchCount === 0
      ? `${base} - 分支`
      : `${base} - 分支 ${branchCount + 1}`;

    addSession(
      {
        ...session,
        id: `branch-${Date.now()}`,
        title: newTitle,
        pinned: false,
        status: 'active',
      },
      session.id, // insert immediately after the source task
    );
  }, [sessions, addSession]);

  // ── Drag to reorder ───────────────────────────

  const resetDragState = useCallback(() => {
    draggingIdRef.current = null;
    setDraggingId(null);
    setDropIndicator(null);
  }, []);

  const handleDragStart = useCallback((id: string) => {
    draggingIdRef.current = id;
    setDraggingId(id);
    setContextMenu(null); // dismiss any open context menu
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault(); // required to allow onDrop to fire
    if (!draggingIdRef.current || draggingIdRef.current === targetId) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const position: 'before' | 'after' = e.clientX < rect.left + rect.width / 2 ? 'before' : 'after';
    setDropIndicator(prev =>
      prev?.targetId === targetId && prev.position === position ? prev : { targetId, position }
    );
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const fromId = draggingIdRef.current;
    if (fromId && fromId !== targetId) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const position: 'before' | 'after' = e.clientX < rect.left + rect.width / 2 ? 'before' : 'after';
      reorderSessions(fromId, targetId, position);
    }
    resetDragState();
  }, [reorderSessions, resetDragState]);

  // ─────────────────────────────────────────────

  return (
    <div className="h-9 bg-sidebar flex items-center flex-shrink-0">

      {/* Left control area */}
      <div
        className="flex items-center gap-1 px-3 flex-shrink-0 h-full"
        style={{ width: sidebarWidth }}
      >
        {(['recent', 'pinned'] as const).map((v, i) => (
          <React.Fragment key={v}>
            {i > 0 && (
              <span className="text-[10px] text-muted-foreground/25 select-none">·</span>
            )}
            <button
              onClick={() => setView(v)}
              className={`relative h-full px-1 text-[11px] transition-colors ${
                view === v
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground/45 hover:text-muted-foreground'
              }`}
            >
              {v === 'recent' ? '最近任务' : '固定任务'}
              {view === v && (
                <span className="absolute bottom-0 left-1 right-1 h-[1.5px] bg-foreground/20 rounded-full" />
              )}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Right task area */}
      <div className="relative flex-1 min-w-0 h-full flex items-center">
        <div
          className="flex items-center gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden pr-8 h-full"
          onDragOver={e => e.preventDefault()}
        >
          {tasks.length === 0 && (
            <span className="text-[11px] text-muted-foreground/40">暂无固定任务</span>
          )}

          {tasks.map(task => {
            const isActive     = task.id === activeSessionId;
            const isRenaming   = task.id === renamingId;
            const isMenuTarget = contextMenu?.session.id === task.id;
            const isDragging   = task.id === draggingId;
            const indicator    = dropIndicator?.targetId === task.id ? dropIndicator.position : null;

            return (
              <div key={task.id} className="relative flex-shrink-0 flex items-center">

                {/* Before-insertion line */}
                {indicator === 'before' && (
                  <span className="absolute -left-px top-[4px] bottom-[4px] w-0.5 bg-primary rounded-full z-10 pointer-events-none" />
                )}

                {/* Rename mode */}
                {isRenaming ? (
                  <div className="flex items-center gap-1 h-[22px] px-2 rounded-full text-[11px] bg-sidebar-accent ring-1 ring-border">
                    <StatusDot status={task.status} />
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onFocus={e => e.target.select()}
                      onBlur={() => {
                        if (escapeRef.current) { escapeRef.current = false; return; }
                        commitRename(task.id);
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter')  { e.currentTarget.blur(); }
                        if (e.key === 'Escape') { cancelRename(); }
                      }}
                      className="bg-transparent outline-none text-sidebar-foreground w-[110px] min-w-[40px] text-[11px]"
                    />
                  </div>
                ) : (
                  /* Normal mode */
                  <Tooltip content={`${task.title} · ${STATUS_META[task.status].label}`} side="bottom">
                  <button
                    draggable
                    onClick={() => selectSession(task.id)}
                    onContextMenu={e => handleContextMenu(e, task)}
                    onDragStart={() => handleDragStart(task.id)}
                    onDragOver={e => handleDragOver(e, task.id)}
                    onDrop={e => handleDrop(e, task.id)}
                    onDragEnd={resetDragState}
                    className={`flex items-center gap-1 h-[22px] px-2 rounded-full text-[11px] whitespace-nowrap transition-colors duration-100 cursor-grab active:cursor-grabbing flex-shrink-0 ${
                      isDragging
                        ? 'opacity-40 ring-1 ring-border'
                        : isActive
                          ? 'bg-sidebar-accent text-sidebar-foreground ring-1 ring-border'
                          : indicator
                            ? 'bg-sidebar-accent/20 text-muted-foreground'
                            : isMenuTarget
                              ? 'bg-sidebar-accent/30 text-muted-foreground'
                              : 'text-muted-foreground/60 hover:text-muted-foreground hover:bg-sidebar-accent/30'
                    }`}
                  >
                    <StatusDot status={task.status} />
                    <span className="max-w-[110px] truncate">{task.title}</span>
                    {task.pinned && (
                      <Pin size={8} className="flex-shrink-0 opacity-40 -rotate-45" />
                    )}
                  </button>
                  </Tooltip>
                )}

                {/* After-insertion line */}
                {indicator === 'after' && (
                  <span className="absolute -right-px top-[4px] bottom-[4px] w-0.5 bg-primary rounded-full z-10 pointer-events-none" />
                )}

              </div>
            );
          })}
        </div>

        {/* Right fade */}
        <div className="absolute right-0 inset-y-0 w-8 bg-gradient-to-l from-sidebar to-transparent pointer-events-none" />
      </div>

      {/* Context menu */}
      {contextMenu && (
        <TaskContextMenu
          state={contextMenu}
          onRename={() => startRename(contextMenu.session)}
          onTogglePin={() => updateSession(contextMenu.session.id, { pinned: !contextMenu.session.pinned })}
          onClose={() => handleClose(contextMenu.session.id)}
          onBranch={() => handleBranch(contextMenu.session)}
          onDismiss={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
