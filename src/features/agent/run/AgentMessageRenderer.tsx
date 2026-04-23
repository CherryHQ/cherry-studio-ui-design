import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  Terminal, Loader2, Check, X,
  Bot,
  Search, Globe, Package, Code2,
  Settings, Rocket,
  Brain, Pencil, Eye, Play, Trash2, FolderOpen,
} from 'lucide-react';
import { Button, ThinkingBlock } from '@cherry-studio/ui';
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
      <Button size="inline"
        variant="ghost"
        onClick={() => hasChildren && setOpen(!open)}
        className={`w-full !justify-start gap-2 py-[5px] px-1 font-normal text-left ${
          hasChildren ? 'hover:bg-accent/50 cursor-pointer' : 'hover:bg-transparent cursor-default'
        }`}
      >
        {icon}
        <span className="text-foreground truncate">{label}</span>
        <span className="flex-1" />
        {statusIndicator}
        {hasChildren && (
          <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.1 }}>
            <ChevronRight size={9} className="text-muted-foreground/50" />
          </motion.div>
        )}
      </Button>
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
              <div className="ml-6 pl-2.5 border-l border-border/30 pb-1 pt-0.5">
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
      <div className="max-w-[85%] px-3.5 py-2.5 rounded-[var(--radius-button)] rounded-br-[var(--radius-dot)] bg-foreground text-background text-xs leading-[1.65]">
        {msg.content}
      </div>
    </motion.div>
  );
}

// ===========================
// Agent Message Group
// ===========================

export function AgentMessageGroup({ msgs, onResolve, onAvatarClick, isRunning = true }: {
  msgs: ChatMessage[];
  onResolve: (msgId: string, value: string) => void;
  onAvatarClick?: () => void;
  isRunning?: boolean;
}) {
  const [processExpanded, setProcessExpanded] = useState(false);

  // Separate process messages (tool calls, thinking, generativeUI) from final content
  const hasProcessInfo = msgs.some(m => m.toolCall || m.thinking || m.generativeUI);
  const finalMessages = msgs.filter(m => m.content && !m.toolCall && !m.thinking);
  const processMessages = msgs.filter(m => m.toolCall || m.thinking || m.generativeUI);

  // Show process info when running, or when manually expanded
  const showProcess = isRunning || processExpanded;

  return (
    <div className="flex gap-2 max-w-[95%]">
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onAvatarClick}
        className="w-5 h-5 rounded-[var(--radius-kbd)] bg-accent/50 flex-shrink-0 mt-[1px] active:scale-[0.97]"
      >
        <Bot size={10} className="text-muted-foreground" />
      </Button>
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        {/* Collapsed process toggle (only when not running and has process info) */}
        {!isRunning && hasProcessInfo && (
          <Button
            variant="ghost"
            size="inline"
            onClick={() => setProcessExpanded(v => !v)}
            className="!justify-start gap-1.5 px-1 py-[3px] text-xs text-muted-foreground/50 hover:text-muted-foreground w-fit"
          >
            <motion.div animate={{ rotate: processExpanded ? 90 : 0 }} transition={{ duration: 0.1 }}>
              <ChevronRight size={9} />
            </motion.div>
            <span>{processMessages.length} 个执行步骤</span>
          </Button>
        )}

        {/* Process info (tool calls, thinking, generativeUI) */}
        <AnimatePresence initial={false}>
          {showProcess && (
            <motion.div
              initial={isRunning ? false : { height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden flex flex-col gap-0.5"
            >
              {processMessages.map((msg) => (
                <div key={msg.id}>
                  {msg.thinking && (
                    <ThinkingBlock content={msg.thinking} isStreaming />
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
                            {msg.toolCall.duration && <span className="text-xs text-muted-foreground/60 tabular-nums">{msg.toolCall.duration}</span>}
                            <Check size={9} className="text-cherry-primary-dark" />
                          </div>
                        ) : msg.toolCall.status === 'error' ? (
                          <X size={9} className="text-destructive flex-shrink-0" />
                        ) : undefined
                      }
                    />
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Final content — always visible */}
        {finalMessages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-foreground leading-[1.7] py-1 px-1"
          >
            {msg.content}
          </motion.div>
        ))}

        {/* Inline content from process messages (e.g. tool call results with text) */}
        {isRunning && msgs.filter(m => m.content && (m.toolCall || m.thinking)).map((msg) => (
          <motion.div
            key={`content-${msg.id}`}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-foreground leading-[1.7] py-1 px-1"
          >
            {msg.content}
          </motion.div>
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
