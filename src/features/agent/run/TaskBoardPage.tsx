import React, { useMemo } from 'react';
import {
  Loader2, Hand, CheckCircle2, AlertCircle, ListChecks, Clock,
} from 'lucide-react';
import { ScrollArea, EmptyState } from '@cherry-studio/ui';
import { motion } from 'motion/react';
import type { AgentSession } from '@/app/types/agent';
import { AVAILABLE_AGENTS } from '@/app/config/agentTools';

// ===========================
// Task Board (Conductor-style dashboard)
// ===========================
// A global, read-only kanban of *all* agent sessions, bucketed by run status.
// Reached from the "任务管理" entry pinned under "添加智能体" on the agent rail.
// A session's column is derived from its status — there is no manual drag.
// Clicking a card drops straight into that session's chat (host handles the
// agent switch + activeSession + closing the board).

type BoardStatus = 'active' | 'awaiting' | 'completed' | 'error';

interface ColumnConfig {
  status: BoardStatus;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  /** Icon tint + count-badge accent for the column header. */
  accent: string;
  spin?: boolean;
}

const COLUMNS: ColumnConfig[] = [
  { status: 'active',    label: '进行中', icon: Loader2,       accent: 'text-info',        spin: true },
  { status: 'awaiting',  label: '待确认', icon: Hand,          accent: 'text-warning' },
  { status: 'error',     label: '失败',   icon: AlertCircle,   accent: 'text-destructive' },
  { status: 'completed', label: '已完成', icon: CheckCircle2,  accent: 'text-success' },
];

// Resolve a display emoji for a session's owning agent: session.agentIcon
// wins, else the avatar registered for that agent, else a generic bot.
function useAgentAvatar() {
  return useMemo(() => {
    const map = new Map<string, string>();
    AVAILABLE_AGENTS.forEach(a => map.set(a.name, a.avatar));
    return (session: AgentSession) => session.agentIcon ?? map.get(session.agentName) ?? '🤖';
  }, []);
}

function TaskCard({ session, avatar, onClick }: {
  session: AgentSession;
  avatar: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left rounded-lg border border-border/20 bg-background hover:border-border/40 hover:shadow-sm shadow-black/[0.03] transition-all px-3 py-2.5"
    >
      {/* Title */}
      <div className="text-sm font-medium text-foreground leading-snug line-clamp-2">
        {session.title}
      </div>

      {/* Latest message snippet */}
      <p className="mt-1 text-xs text-muted-foreground/60 leading-relaxed line-clamp-2">
        {session.lastMessage}
      </p>

      {/* Footer — agent source + time */}
      <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground/45">
        <span className="text-sm leading-none">{avatar}</span>
        <span className="truncate">{session.agentName}</span>
        <span className="ml-auto flex items-center gap-1 flex-shrink-0 tabular-nums">
          <Clock size={9} className="text-muted-foreground/35" />
          {session.timestamp}
        </span>
      </div>
    </button>
  );
}

function BoardColumn({ column, sessions, getAvatar, onOpenSession }: {
  column: ColumnConfig;
  sessions: AgentSession[];
  getAvatar: (s: AgentSession) => string;
  onOpenSession: (s: AgentSession) => void;
}) {
  const Icon = column.icon;
  return (
    <div className="flex flex-col w-[280px] flex-shrink-0 rounded-xl bg-muted/25 border border-border/15 max-h-full">
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-2.5 flex-shrink-0">
        <Icon size={13} className={`${column.accent} ${column.spin ? 'animate-spin' : ''}`} />
        <span className="text-xs font-medium text-foreground/80">{column.label}</span>
        <span className="ml-auto text-xs text-muted-foreground/40 tabular-nums">{sessions.length}</span>
      </div>

      {/* Cards */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-2 pb-2.5 space-y-2">
          {sessions.length === 0 ? (
            <div className="px-2 py-6 text-center text-xs text-muted-foreground/35">暂无任务</div>
          ) : (
            sessions.map(s => (
              <TaskCard key={s.id} session={s} avatar={getAvatar(s)} onClick={() => onOpenSession(s)} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export function TaskBoardPage({ sessions, onOpenSession }: {
  /** All sessions across every agent — the board is global. */
  sessions: AgentSession[];
  /** Open the session's chat (host switches agent + active session + closes board). */
  onOpenSession: (session: AgentSession) => void;
}) {
  const getAvatar = useAgentAvatar();

  const byStatus = useMemo(() => {
    const map: Record<BoardStatus, AgentSession[]> = {
      active: [], awaiting: [], completed: [], error: [],
    };
    for (const s of sessions) {
      // 'paused' (or any future status) is not a board column — skip it.
      if (s.status in map) map[s.status as BoardStatus].push(s);
    }
    return map;
  }, [sessions]);

  const total = sessions.length;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top bar — matches ScheduledTasksPage */}
      <div className="flex items-center gap-1.5 px-5 h-[38px] flex-shrink-0 text-muted-foreground/50">
        <ListChecks size={12} />
        <span className="text-xs">任务管理</span>
        <span className="text-xs text-muted-foreground/30 tabular-nums">{total}</span>
      </div>

      {total === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            preset="no-session"
            title="还没有任务"
            description="向智能体发起对话后，任务会按状态出现在这里"
          />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="flex-1 min-h-0 overflow-x-auto"
        >
          <div className="flex gap-3 h-full px-5 py-4 min-w-min">
            {COLUMNS.map(col => (
              <BoardColumn
                key={col.status}
                column={col}
                sessions={byStatus[col.status]}
                getAvatar={getAvatar}
                onOpenSession={onOpenSession}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
