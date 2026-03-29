import React, { useState } from 'react';
import {
  Plus, Search, Bot, MoreHorizontal, Trash2, Pin,
  Copy, Archive, ChevronDown, MessageCircle, Clock,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { AgentSession } from '@/app/types/agent';

// Re-export for backward compatibility
export type { AgentSession };

// ===========================
// Types
// ===========================

interface Props {
  sessions: AgentSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession?: (id: string) => void;
}

// ===========================
// Context Menu
// ===========================

function SessionContextMenu({ x, y, onClose, onDelete, onPin, isPinned }: {
  x: number; y: number; onClose: () => void; onDelete: () => void; onPin: () => void; isPinned?: boolean;
}) {
  const menuItems = [
    { icon: isPinned ? Pin : Pin, label: isPinned ? '取消置顶' : '置顶', action: onPin },
    { icon: Copy, label: '复制', action: onClose },
    { icon: Archive, label: '归档', action: onClose },
    { divider: true },
    { icon: Trash2, label: '删除', action: onDelete, danger: true },
  ] as const;

  // Clamp to viewport
  const clampedX = Math.min(x, window.innerWidth - 160);
  const clampedY = Math.min(y, window.innerHeight - 200);

  return (
    <div className="contents">
      <div className="fixed inset-0 z-50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.08 }}
        className="fixed z-50 bg-popover border border-border/15 rounded-lg shadow-xl shadow-black/8 p-1 min-w-[140px]"
        style={{ left: clampedX, top: clampedY }}
      >
        {menuItems.map((item, i) => (
          'divider' in item ? (
            <div key={i} className="h-px bg-border/10 my-1" />
          ) : (
            <button
              key={i}
              onClick={item.action}
              className={`flex items-center gap-2 w-full px-2.5 py-[5px] rounded-md text-[10.5px] transition-colors ${
                'danger' in item && item.danger
                  ? 'text-red-500/70 hover:bg-red-500/8'
                  : 'text-foreground/65 hover:bg-accent/15'
              }`}
            >
              <item.icon size={11} />
              <span>{item.label}</span>
            </button>
          )
        ))}
      </motion.div>
    </div>
  );
}

// ===========================
// Session Item
// ===========================

function SessionItem({ session, isActive, onClick, onContextMenu }: {
  session: AgentSession;
  isActive: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`flex flex-col gap-[3px] w-full text-left px-2.5 py-2 rounded-lg transition-all duration-100 group ${
        isActive
          ? 'bg-cherry-active-bg border border-cherry-ring'
          : 'border border-transparent hover:bg-accent/12'
      }`}
    >
      {/* Top row: agent + time */}
      <div className="flex items-center gap-1.5 w-full">
        <div className={`w-4 h-4 rounded-[4px] flex items-center justify-center flex-shrink-0 ${
          isActive ? 'bg-cherry-active-bg' : 'bg-accent/15'
        }`}>
          <Bot size={9} className={isActive ? 'text-cherry-primary/70' : 'text-muted-foreground/45'} />
        </div>
        <span className={`text-[10px] flex-1 truncate ${
          isActive ? 'text-cherry-primary-dark/80' : 'text-muted-foreground/45'
        }`}>
          {session.agentName}
        </span>
        {session.pinned && (
          <Pin size={8} className="text-muted-foreground/30 flex-shrink-0 -rotate-45" />
        )}
        <span className="text-[9px] text-muted-foreground/30 flex-shrink-0 tabular-nums">
          {session.timestamp}
        </span>
      </div>

      {/* Title */}
      <span className={`text-[11px] truncate w-full pl-[22px] ${
        isActive ? 'text-foreground/85' : 'text-foreground/65'
      }`}>
        {session.title}
      </span>

      {/* Last message preview */}
      <div className="flex items-center gap-1.5 pl-[22px] w-full">
        <span className="text-[10px] text-muted-foreground/35 truncate flex-1">
          {session.lastMessage}
        </span>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <MessageCircle size={8} className="text-muted-foreground/20" />
          <span className="text-[9px] text-muted-foreground/25 tabular-nums">{session.messageCount}</span>
        </div>
      </div>

      {/* Status indicator */}
      {session.status !== 'completed' && (() => {
        const map = {
          active:  { dot: 'bg-emerald-500 animate-pulse',      text: 'text-emerald-600/60 dark:text-emerald-400/50', label: '运行中' },
          waiting: { dot: 'bg-amber-400 animate-pulse-slow',   text: 'text-amber-600/60 dark:text-amber-400/50',    label: '审批中' },
          error:   { dot: 'bg-red-500',                        text: 'text-red-500/60',                             label: '运行报错' },
          paused:  { dot: 'bg-muted-foreground/30',            text: 'text-muted-foreground/40',                    label: '已暂停' },
        } as const;
        const s = map[session.status as keyof typeof map];
        if (!s) return null;
        return (
          <div className="flex items-center gap-1 pl-[22px]">
            <span className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${s.dot}`} />
            <span className={`text-[9px] ${s.text}`}>{s.label}</span>
          </div>
        );
      })()}
    </button>
  );
}

// ===========================
// Session Sidebar
// ===========================

export function SessionSidebar({ sessions, activeSessionId, onSelectSession, onNewSession, onDeleteSession }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; sessionId: string } | null>(null);

  const pinnedSessions = sessions.filter(s => s.pinned);
  const recentSessions = sessions.filter(s => !s.pinned);

  const filteredPinned = pinnedSessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredRecent = recentSessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContextMenu = (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, sessionId });
  };

  return (
    <div className="flex flex-col h-full select-none">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border/10 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Clock size={11} className="text-muted-foreground/40" />
            <span className="text-[10px] text-muted-foreground/45 uppercase tracking-[0.06em]">{"会话"}</span>
          </div>
          <span className="text-[9px] text-muted-foreground/30 tabular-nums">{sessions.length}</span>
        </div>

        {/* New Session Button */}
        <button
          onClick={onNewSession}
          className="flex items-center justify-center gap-1.5 w-full py-[6px] rounded-md border border-dashed border-border/20 text-[10.5px] text-muted-foreground/50 hover:text-foreground/70 hover:border-cherry-ring hover:bg-cherry-active-bg transition-all duration-150 group"
        >
          <Plus size={11} className="group-hover:text-cherry-primary/70 transition-colors" />
          {"新建会话"}
        </button>
      </div>

      {/* Search */}
      <div className="px-2.5 py-1.5 flex-shrink-0">
        <div className="flex items-center gap-1.5 px-2 py-[4px] rounded-md bg-accent/8 border border-border/8">
          <Search size={10} className="text-muted-foreground/30 flex-shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索会话..."
            className="flex-1 bg-transparent text-[10.5px] text-foreground/70 placeholder:text-muted-foreground/25 outline-none"
          />
        </div>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto px-1.5 py-1 space-y-0.5 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/12 [&::-webkit-scrollbar-thumb]:rounded-full">
        {/* Pinned */}
        {filteredPinned.length > 0 && (
          <div className="mb-1.5">
            <div className="flex items-center gap-1 px-2 py-1">
              <Pin size={8} className="text-muted-foreground/25 -rotate-45" />
              <span className="text-[9px] text-muted-foreground/30 uppercase tracking-[0.06em]">{"已置顶"}</span>
            </div>
            {filteredPinned.map(session => (
              <SessionItem
                key={session.id}
                session={session}
                isActive={activeSessionId === session.id}
                onClick={() => onSelectSession(session.id)}
                onContextMenu={(e) => handleContextMenu(e, session.id)}
              />
            ))}
          </div>
        )}

        {/* Recent */}
        {filteredPinned.length > 0 && filteredRecent.length > 0 && (
          <div className="flex items-center gap-1 px-2 py-1">
            <Clock size={8} className="text-muted-foreground/25" />
            <span className="text-[9px] text-muted-foreground/30 uppercase tracking-[0.06em]">{"最近"}</span>
          </div>
        )}
        {filteredRecent.map(session => (
          <SessionItem
            key={session.id}
            session={session}
            isActive={activeSessionId === session.id}
            onClick={() => onSelectSession(session.id)}
            onContextMenu={(e) => handleContextMenu(e, session.id)}
          />
        ))}

        {filteredPinned.length === 0 && filteredRecent.length === 0 && searchQuery && (
          <div className="flex flex-col items-center justify-center py-8">
            <Search size={16} className="text-muted-foreground/15 mb-2" />
            <p className="text-[10px] text-muted-foreground/30">{"未找到会话"}</p>
          </div>
        )}
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <SessionContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            isPinned={sessions.find(s => s.id === contextMenu.sessionId)?.pinned}
            onPin={() => { setContextMenu(null); }}
            onDelete={() => {
              onDeleteSession?.(contextMenu.sessionId);
              setContextMenu(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
