import React, { useState } from 'react';
import {
  Plus, Bot, MoreHorizontal, Trash2, Pin,
  Copy, Archive, ChevronDown, MessageCircle, Clock,
  Sparkles,
} from 'lucide-react';
import { Button, SearchInput, EmptyState } from '@cherry-studio/ui';
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
      <div className="fixed inset-0 z-[var(--z-overlay)]" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.08 }}
        className="fixed z-[var(--z-overlay)] bg-popover border border-border/15 rounded-lg shadow-xl shadow-black/8 p-1 min-w-[140px]"
        style={{ left: clampedX, top: clampedY }}
      >
        {menuItems.map((item, i) => (
          'divider' in item ? (
            <div key={i} className="h-px bg-border/30 my-1" />
          ) : (
            <Button
              variant="ghost"
              size="xs"
              key={i}
              onClick={item.action}
              className={`w-full justify-start gap-2 ${
                'danger' in item && item.danger
                  ? 'text-destructive/70 hover:bg-destructive/8'
                  : 'text-muted-foreground hover:bg-accent/15'
              }`}
            >
              <item.icon size={11} />
              <span>{item.label}</span>
            </Button>
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
    <Button size="inline"
      variant="ghost"
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`flex-col items-start gap-[3px] w-full px-2.5 py-2 font-normal rounded-lg group ${
        isActive
          ? 'bg-cherry-active-bg border border-cherry-ring'
          : 'border border-transparent hover:bg-accent/15'
      }`}
    >
      {/* Top row: agent + time */}
      <div className="flex items-center gap-1.5 w-full">
        <div className={`w-4 h-4 rounded-[var(--radius-dot)] flex items-center justify-center flex-shrink-0 ${
          isActive ? 'bg-cherry-active-bg' : 'bg-accent/15'
        }`}>
          <Bot size={9} className={isActive ? 'text-cherry-primary/70' : 'text-muted-foreground/40'} />
        </div>
        <span className={`text-xs flex-1 truncate ${
          isActive ? 'text-cherry-primary-dark/80' : 'text-muted-foreground/40'
        }`}>
          {session.agentName}
        </span>
        {session.pinned && (
          <Pin size={8} className="text-muted-foreground/40 flex-shrink-0 -rotate-45" />
        )}
        <span className="text-xs text-muted-foreground/50 flex-shrink-0 tabular-nums">
          {session.timestamp}
        </span>
      </div>

      {/* Title */}
      <div className="flex items-center gap-1.5 w-full pl-[22px]">
        {session.unread && !isActive && (
          <span className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${
            session.status === 'active' ? 'bg-warning' :
            session.status === 'error' ? 'bg-destructive' :
            'bg-success'
          }`} />
        )}
        <span className={`text-sm truncate ${
          isActive ? 'text-foreground' : 'text-muted-foreground'
        }`}>
          {session.title}
        </span>
      </div>

      {/* Last message preview */}
      <div className="flex items-center gap-1.5 pl-[22px] w-full">
        <span className="text-xs text-muted-foreground/50 truncate flex-1">
          {session.lastMessage}
        </span>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <MessageCircle size={8} className="text-muted-foreground/40" />
          <span className="text-xs text-muted-foreground/50 tabular-nums">{session.messageCount}</span>
        </div>
      </div>

      {/* Status indicator */}
      {session.status !== 'completed' && (
        <div className="flex items-center gap-1 pl-[22px]">
          <span className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${
            session.status === 'active' ? 'bg-warning animate-pulse' :
            session.status === 'error' ? 'bg-destructive' :
            'bg-muted-foreground/40'
          }`} />
          <span className={`text-xs ${
            session.status === 'active' ? 'text-warning' :
            session.status === 'error' ? 'text-destructive' :
            'text-muted-foreground/40'
          }`}>
            {session.status === 'active' ? '运行中' : session.status === 'error' ? '失败' : '已暂停'}
          </span>
        </div>
      )}
    </Button>
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
      <div className="px-3 py-2.5 border-b border-border/15 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Clock size={11} className="text-muted-foreground/40" />
            <span className="text-xs text-muted-foreground/40 uppercase tracking-[0.06em]">{"会话"}</span>
          </div>
          <span className="text-xs text-muted-foreground/50 tabular-nums">{sessions.length}</span>
        </div>

        {/* New Session Button */}
        <Button size="inline"
          variant="outline"
          onClick={onNewSession}
          className="w-full py-[6px] border-dashed border-border/20 text-muted-foreground/50 hover:text-foreground hover:border-cherry-ring hover:bg-cherry-active-bg group"
        >
          <Plus size={11} className="group-hover:text-cherry-primary/70 transition-colors" />
          {"新建会话"}
        </Button>
      </div>

      {/* Search */}
      <div className="px-2.5 py-1.5 flex-shrink-0">
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="搜索会话..." wrapperClassName="flex items-center gap-1.5 px-2 py-[4px] rounded-md bg-accent/5 border border-border/8" />
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto px-1.5 py-1 space-y-0.5 scrollbar-thin-xs">
        {/* Pinned */}
        {filteredPinned.length > 0 && (
          <div className="mb-1.5">
            <div className="flex items-center gap-1 px-2 py-1">
              <Pin size={8} className="text-muted-foreground/40 -rotate-45" />
              <span className="text-xs text-muted-foreground/50 uppercase tracking-[0.06em]">{"已置顶"}</span>
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
            <Clock size={8} className="text-muted-foreground/40" />
            <span className="text-xs text-muted-foreground/50 uppercase tracking-[0.06em]">{"最近"}</span>
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
          <EmptyState preset="no-result" compact />
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
