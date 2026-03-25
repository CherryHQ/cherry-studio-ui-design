import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  Terminal, Loader2, Check, X,
  Bot,
  Search, Globe, Package, Code2,
  Settings, Rocket,
  Brain, Pencil, Eye, Play, Trash2, FolderOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { shakeAnimation } from '@/app/config/animations';
import type { AgentChatMessage } from '@/app/types/agent';
import { GenUIButtons, GenUISelection, GenUIConfirmation } from './GenerativeUI';

// Re-export for backward compatibility
export type ChatMessage = AgentChatMessage;

// ===========================
// Collapsible Message Row (task-style)
// ===========================

function CollapsibleRow({ icon, label, statusIndicator, children, defaultOpen = false }: {
  icon: React.ReactNode;
  label: string;
  statusIndicator?: React.ReactNode;
  children?: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const hasChildren = !!children;

  return (
    <div>
      <button
        onClick={() => hasChildren && setOpen(!open)}
        className={`flex items-center gap-2 w-full text-left py-[5px] px-1 rounded-md text-[10.5px] transition-colors ${
          hasChildren ? 'hover:bg-accent/20 cursor-pointer' : 'cursor-default'
        }`}
      >
        {icon}
        <span className="text-foreground/75 flex-1 truncate">{label}</span>
        {statusIndicator}
        {hasChildren && (
          <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.1 }}>
            <ChevronRight size={9} className="text-muted-foreground/50" />
          </motion.div>
        )}
      </button>
      {hasChildren && (
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="overflow-hidden"
            >
              <div className="ml-6 pl-2.5 border-l border-border/25 pb-1 pt-0.5">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

// ===========================
// Semantic Icon resolver for messages
// ===========================

function resolveToolIcon(name: string, size = 11): React.ReactNode {
  const n = name.toLowerCase();
  if (n.includes('search') || n.includes('find') || n.includes('analyz'))
    return <Search size={size} className="text-muted-foreground flex-shrink-0" />;
  if (n.includes('web') || n.includes('browse') || n.includes('http') || n.includes('fetch'))
    return <Globe size={size} className="text-muted-foreground flex-shrink-0" />;
  if (n.includes('write') || n.includes('edit') || n.includes('update') || n.includes('create') || n.includes('modify'))
    return <Pencil size={size} className="text-muted-foreground flex-shrink-0" />;
  if (n.includes('install') || n.includes('npm') || n.includes('pnpm') || n.includes('yarn') || n.includes('package'))
    return <Package size={size} className="text-muted-foreground flex-shrink-0" />;
  if (n.includes('config') || n.includes('init') || n.includes('setup') || n.includes('setting'))
    return <Settings size={size} className="text-muted-foreground flex-shrink-0" />;
  if (n.includes('run') || n.includes('exec') || n.includes('start') || n.includes('dev') || n.includes('vite') || n.includes('npx'))
    return <Play size={size} className="text-muted-foreground flex-shrink-0" />;
  if (n.includes('delete') || n.includes('remove') || n.includes('clean'))
    return <Trash2 size={size} className="text-muted-foreground flex-shrink-0" />;
  if (n.includes('read') || n.includes('view') || n.includes('inspect') || n.includes('check') || n.includes('review'))
    return <Eye size={size} className="text-muted-foreground flex-shrink-0" />;
  if (n.includes('build') || n.includes('compile') || n.includes('deploy'))
    return <Rocket size={size} className="text-muted-foreground flex-shrink-0" />;
  if (n.includes('folder') || n.includes('dir') || n.includes('mkdir'))
    return <FolderOpen size={size} className="text-muted-foreground flex-shrink-0" />;
  if (n.includes('code') || n.includes('component') || n.includes('function'))
    return <Code2 size={size} className="text-muted-foreground flex-shrink-0" />;
  return <Terminal size={size} className="text-muted-foreground flex-shrink-0" />;
}

// ===========================
// User Message
// ===========================

export function UserMessage({ msg }: { msg: ChatMessage }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="flex justify-end"
    >
      <div className="max-w-[85%] px-3.5 py-2.5 rounded-[14px] rounded-br-[4px] bg-foreground text-background text-[11px] leading-[1.65]">
        {msg.content}
      </div>
    </motion.div>
  );
}

// ===========================
// Agent Message Group
// ===========================

export function AgentMessageGroup({ msgs, onResolve, onAvatarClick }: {
  msgs: ChatMessage[];
  onResolve: (msgId: string, value: string) => void;
  onAvatarClick?: () => void;
}) {
  return (
    <div className="flex gap-2 max-w-[95%]">
      <button
        onClick={onAvatarClick}
        className="w-5 h-5 rounded-[5px] bg-accent/40 flex items-center justify-center flex-shrink-0 mt-[1px] hover:bg-accent/70 transition-colors cursor-pointer active:scale-[0.92]"
      >
        <Bot size={10} className="text-muted-foreground" />
      </button>
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        {msgs.map((msg) => (
          <div key={msg.id}>
            {msg.thinking && (
              <CollapsibleRow
                icon={
                  <motion.div {...shakeAnimation} className="flex items-center justify-center flex-shrink-0">
                    <Brain size={11} className="text-purple-500" />
                  </motion.div>
                }
                label="思考中..."
              >
                <p className="text-[10px] text-muted-foreground/70 leading-[1.7]">{msg.thinking}</p>
              </CollapsibleRow>
            )}

            {msg.toolCall && (
              <CollapsibleRow
                icon={
                  msg.toolCall.status === 'running' ? (
                    <motion.div {...shakeAnimation} className="flex items-center justify-center flex-shrink-0">
                      {resolveToolIcon(msg.toolCall.name)}
                    </motion.div>
                  ) : resolveToolIcon(msg.toolCall.name)
                }
                label={msg.toolCall.name}
                statusIndicator={
                  msg.toolCall.status === 'running' ? (
                    <Loader2 size={9} className="text-cherry-primary animate-spin flex-shrink-0" />
                  ) : msg.toolCall.status === 'done' ? (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {msg.toolCall.duration && <span className="text-[9px] text-muted-foreground/55 tabular-nums">{msg.toolCall.duration}</span>}
                      <Check size={9} className="text-cherry-primary-dark" />
                    </div>
                  ) : msg.toolCall.status === 'error' ? (
                    <X size={9} className="text-red-500 flex-shrink-0" />
                  ) : undefined
                }
              />
            )}

            {msg.content && (
              <motion.div
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="text-[11px] text-foreground/90 leading-[1.7] py-1 px-1"
              >
                {msg.content}
              </motion.div>
            )}

            {msg.generativeUI && (
              <div className="py-0.5">
                {msg.generativeUI.type === 'buttons' && <GenUIButtons data={msg.generativeUI} msgId={msg.id} onResolve={onResolve} />}
                {msg.generativeUI.type === 'selection' && <GenUISelection data={msg.generativeUI} msgId={msg.id} onResolve={onResolve} />}
                {msg.generativeUI.type === 'confirmation' && <GenUIConfirmation data={msg.generativeUI} msgId={msg.id} onResolve={onResolve} />}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===========================
// Message grouping utility
// ===========================

export function useGroupedMessages(messages: ChatMessage[]) {
  return useMemo(() => {
    const groups: Array<{ type: 'user'; msg: ChatMessage } | { type: 'agent'; msgs: ChatMessage[] }> = [];
    for (const msg of messages) {
      if (msg.role === 'user') {
        groups.push({ type: 'user', msg });
      } else {
        const last = groups[groups.length - 1];
        if (last && last.type === 'agent') {
          last.msgs.push(msg);
        } else {
          groups.push({ type: 'agent', msgs: [msg] });
        }
      }
    }
    return groups;
  }, [messages]);
}
