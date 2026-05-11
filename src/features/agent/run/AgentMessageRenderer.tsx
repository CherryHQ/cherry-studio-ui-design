import React, { useState, useMemo } from 'react';
import {
  ChevronRight, ChevronDown,
  Terminal, Loader2, Check, X,
  Bot, FileText,
  Search, Globe, Package, Code2,
  Settings, Rocket,
  Brain, Pencil, Eye, Play, Trash2, FolderOpen,
  ShieldCheck, ShieldAlert, ShieldQuestion,
  ArrowRight, AlertTriangle,
} from 'lucide-react';
import { Button } from '@cherry-studio/ui';
import { motion, AnimatePresence } from 'motion/react';
import { shakeAnimation } from '@/app/config/animations';
import type { AgentChatMessage } from '@/app/types/agent';
import { GenUIButtons, GenUISelection, GenUIConfirmation } from './GenerativeUI';

// Re-export for backward compatibility
export type ChatMessage = AgentChatMessage;

// ===========================
// Collapsible Tool Call Row
// ===========================

function ToolCallRow({ msg }: { msg: ChatMessage }) {
  const [expanded, setExpanded] = useState(false);
  const tc = msg.toolCall!;
  const isRunning = tc.status === 'running';

  // Extract file path from tool name (e.g. "write src/components/Card.tsx" -> "src/components/Card.tsx")
  const filePath = extractFilePath(tc.name);
  const toolLabel = filePath ? tc.name.split(filePath)[0].trim() : tc.name;

  // All completed/errored tool calls are expandable
  const isExpandable = tc.status === 'done' || tc.status === 'error' || !!msg.content;

  return (
    <div>
      <button
        onClick={() => isExpandable && setExpanded(v => !v)}
        className={`flex items-center gap-2 py-[3px] px-1 text-xs w-fit max-w-full ${
          isExpandable ? 'hover:bg-accent/40 rounded-md cursor-pointer' : 'cursor-default'
        }`}
      >
        {isRunning ? (
          <motion.div {...shakeAnimation} className="flex items-center justify-center flex-shrink-0">
            {resolveToolIcon(tc.name)}
          </motion.div>
        ) : resolveToolIcon(tc.name)}
        <span className="text-foreground truncate">{toolLabel}</span>
        {filePath && (
          <span className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded bg-accent/60 text-muted-foreground text-xs font-mono truncate max-w-[200px]">
            <Code2 size={9} className="flex-shrink-0 opacity-70" />
            {filePath.split('/').pop()}
          </span>
        )}
        {tc.status === 'running' && (
          <Loader2 size={9} className="text-cherry-primary animate-spin flex-shrink-0" />
        )}
        {tc.status === 'done' && (
          <>
            {tc.duration && <span className="text-text-tertiary tabular-nums flex-shrink-0">{tc.duration}</span>}
            <Check size={9} className="text-primary flex-shrink-0" />
          </>
        )}
        {tc.status === 'error' && (
          <X size={9} className="text-destructive flex-shrink-0" />
        )}
        {isExpandable && (
          <ChevronRight size={9} className={`text-muted-foreground flex-shrink-0 transition-transform duration-100 ${expanded ? 'rotate-90' : ''}`} />
        )}
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="overflow-hidden"
          >
            <div className="ml-[18px] py-1">
              <ToolCallDetail content={msg.content} filePath={filePath} toolName={tc.name} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Extract file path from tool call name like "write src/components/Card.tsx"
function extractFilePath(name: string): string | null {
  const match = name.match(/(?:write|edit|read|create|modify|update|delete|remove)\s+(.+)/i);
  return match ? match[1].trim() : null;
}

// ===========================
// Tool Call Detail (code block / diff / plain text)
// ===========================

function ToolCallDetail({ content, filePath, toolName }: {
  content?: string;
  filePath: string | null;
  toolName: string;
}) {
  if (!content && !filePath) {
    return <p className="text-xs text-text-tertiary italic pl-2.5 border-l border-border/40">执行完成</p>;
  }
  if (!content && filePath) {
    return <p className="text-xs text-muted-foreground font-mono pl-2.5 border-l border-border/40">{filePath}</p>;
  }

  const n = toolName.toLowerCase();
  const isWrite = n.startsWith('write ');
  const isUpdate = n.startsWith('update ') || n.startsWith('edit ');
  const isCode = isWrite || isUpdate;
  const fileName = filePath?.split('/').pop() || '';

  // Update/edit → diff view
  if (isUpdate && content) {
    return (
      <div className="rounded-lg border border-border/40 overflow-hidden text-xs">
        {filePath && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/40 border-b border-border/30 text-muted-foreground font-mono">
            <Code2 size={10} className="opacity-60" />
            <span>{fileName}</span>
            <span className="ml-auto text-text-tertiary">diff</span>
          </div>
        )}
        <div className="bg-accent/10 overflow-x-auto">
          {content!.split('\n').map((line, i) => {
            const isDel = line.startsWith('-') && !line.startsWith('--');
            const isAdd = line.startsWith('+') && !line.startsWith('++');
            const isHeader = line.startsWith('##') || line.startsWith('|');
            return (
              <div
                key={i}
                className={`flex font-mono leading-[1.7] ${
                  isAdd ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                  : isDel ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                  : 'text-muted-foreground'
                }`}
              >
                <span className="w-8 text-right pr-2 select-none text-text-tertiary flex-shrink-0">{i + 1}</span>
                <span className="px-2 whitespace-pre-wrap break-all">{line}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Write → code block
  if (isCode && content) {
    return (
      <div className="rounded-lg border border-border/40 overflow-hidden text-xs">
        {filePath && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/40 border-b border-border/30 text-muted-foreground font-mono">
            <Code2 size={10} className="opacity-60" />
            <span>{fileName}</span>
          </div>
        )}
        <div className="bg-accent/10 overflow-x-auto">
          {content!.split('\n').map((line, i) => (
            <div key={i} className="flex font-mono text-muted-foreground leading-[1.7]">
              <span className="w-8 text-right pr-2 select-none text-text-tertiary flex-shrink-0">{i + 1}</span>
              <span className="px-2 whitespace-pre-wrap break-all">{line}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: plain text (search results, logs, etc.)
  return (
    <div className="pl-2.5 border-l border-border/40">
      <pre className="text-xs text-muted-foreground leading-[1.7] whitespace-pre-wrap break-all">{content}</pre>
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

// Collect unique tool type icons for the collapsed summary
function collectTypeIcons(msgs: ChatMessage[]): React.ReactNode[] {
  const seen = new Set<string>();
  const icons: React.ReactNode[] = [];
  for (const m of msgs) {
    if (m.toolCall) {
      const n = m.toolCall.name.toLowerCase();
      let key = 'terminal';
      if (n.includes('read') || n.includes('view')) key = 'file';
      else if (n.includes('write') || n.includes('edit') || n.includes('create')) key = 'edit';
      else if (n.includes('run') || n.includes('exec') || n.includes('npm') || n.includes('npx')) key = 'terminal';
      else if (n.includes('search') || n.includes('find')) key = 'search';
      if (!seen.has(key)) {
        seen.add(key);
        if (key === 'file') icons.push(<FileText key={key} size={10} />);
        else if (key === 'edit') icons.push(<Pencil key={key} size={10} />);
        else if (key === 'terminal') icons.push(<Terminal key={key} size={10} />);
        else if (key === 'search') icons.push(<Search key={key} size={10} />);
      }
    }
    if (m.thinking && !seen.has('thinking')) {
      seen.add('thinking');
      icons.push(<Brain key="thinking" size={10} />);
    }
  }
  return icons;
}

// ===========================
// Permission Approval Card — shown when agent needs user consent for a tool
// ===========================

const RISK_CONFIG: Record<NonNullable<import('@/app/types/agent').PermissionRequest['risk']>, {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  ringClass: string;
  iconClass: string;
  badgeClass: string;
}> = {
  low: {
    icon: ShieldCheck,
    label: '低风险',
    ringClass: 'border-border/40',
    iconClass: 'text-success',
    badgeClass: 'bg-success/10 text-success border-success/20',
  },
  medium: {
    icon: ShieldQuestion,
    label: '需注意',
    ringClass: 'border-warning/30',
    iconClass: 'text-warning',
    badgeClass: 'bg-warning/10 text-warning border-warning/20',
  },
  high: {
    icon: ShieldAlert,
    label: '高风险',
    ringClass: 'border-destructive/30',
    iconClass: 'text-destructive',
    badgeClass: 'bg-destructive/10 text-destructive border-destructive/20',
  },
};

export function PermissionApprovalCard({
  request,
  onResolve,
  variant = 'inline',
}: {
  request: NonNullable<ChatMessage['permissionRequest']>;
  onResolve: (action: 'allow' | 'allow-always' | 'deny') => void;
  /** "inline" = compact card in chat; "composer" = wider card replacing the input box */
  variant?: 'inline' | 'composer';
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = RISK_CONFIG[request.risk || 'low'];
  const Icon = cfg.icon;
  const isPending = request.status === 'pending';

  const hasParams = request.params && request.params.length > 0;
  const composer = variant === 'composer';

  // Resolved state in inline (history) view — render as a quiet single-line entry
  if (!composer && !isPending) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="my-1 flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground"
      >
        {request.status === 'approved' ? (
          <Check size={11} className="text-success/80 flex-shrink-0" />
        ) : (
          <X size={11} className="text-destructive/80 flex-shrink-0" />
        )}
        <span className="text-muted-foreground/60">权限请求</span>
        <span className="text-muted-foreground/30">·</span>
        <span className="font-mono text-foreground/60 truncate">{request.toolName}</span>
        <span className="text-muted-foreground/30">·</span>
        <span className="text-muted-foreground/60">
          {request.status === 'approved' ? '已允许' : '已拒绝'}
        </span>
      </motion.div>
    );
  }

  // Composer variant — CodeX-style question card with numbered options
  if (composer) {
    const question = request.toolDescription
      ? request.toolDescription
      : `要执行 ${request.toolName}，是否允许？`;

    type Opt = { id: 'allow' | 'allow-always' | 'deny'; label: string; desc?: string; danger?: boolean };
    const opts: Opt[] = [
      { id: 'allow', label: '允许' },
      ...(request.allowAutoApprove
        ? [{ id: 'allow-always' as const, label: '始终允许', desc: `不再询问 ${request.toolName} 相关命令` }]
        : []),
      { id: 'deny', label: '拒绝', desc: '让我告诉智能体应该怎么做', danger: true },
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="border border-border/50 rounded-2xl bg-background shadow-lg overflow-hidden"
      >
        {/* Header: question + risk badge */}
        <div className="flex items-start gap-2 px-4 pt-3.5 pb-2">
          <AlertTriangle size={14} className={`flex-shrink-0 mt-[2px] ${cfg.iconClass}`} />
          <p className="text-sm text-foreground flex-1 min-w-0 leading-[1.55]">{question}</p>
          <span className={`text-[11px] leading-[16px] px-1.5 py-[1px] rounded border ${cfg.badgeClass} flex-shrink-0 mt-[1px]`}>
            {cfg.label}
          </span>
        </div>

        {/* Command/params preview — collapsible when content is long */}
        {hasParams && (
          <div className="px-4 pb-2.5">
            <div className="rounded-lg bg-muted/40 overflow-hidden">
              <div
                className="px-3 py-2 space-y-0.5 overflow-hidden transition-all duration-200 relative"
                style={{ maxHeight: expanded ? 480 : 140 }}
              >
                {request.params!.map(p => (
                  <div key={p.label} className="flex gap-2 text-xs">
                    <span className="text-muted-foreground/60 flex-shrink-0">{p.label}</span>
                    <span className="text-foreground font-mono break-all whitespace-pre-wrap">{p.value}</span>
                  </div>
                ))}
                {/* Fade overlay when collapsed */}
                {!expanded && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-muted/80 to-transparent" />
                )}
              </div>
              {/* Expand / collapse toggle — only shown when content might overflow */}
              {request.params!.some(p => p.value.length > 60 || p.value.includes('\n')) && (
                <button
                  type="button"
                  onClick={() => setExpanded(v => !v)}
                  className="w-full flex items-center justify-center gap-1 py-1 text-[11px] text-muted-foreground/70 hover:text-foreground hover:bg-accent/30 border-t border-border/30 transition-colors"
                >
                  <ChevronDown size={10} className={`transition-transform duration-100 ${expanded ? 'rotate-180' : ''}`} />
                  <span>{expanded ? '折叠' : '展开'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Numbered options */}
        <div className="px-3 pb-3">
          {opts.map((opt, i) => (
            <button
              key={opt.id}
              onClick={() => onResolve(opt.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-accent/60 active:scale-[0.99] group border-b border-border/10 last:border-b-0 ${
                opt.danger ? 'hover:bg-destructive/8' : ''
              }`}
            >
              <span className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground font-medium flex-shrink-0 group-hover:bg-foreground group-hover:text-background transition-colors">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <span className={`text-sm ${opt.danger ? 'text-destructive' : 'text-foreground'}`}>{opt.label}</span>
                {opt.desc && <span className="text-xs text-muted-foreground/60 ml-2">{opt.desc}</span>}
              </div>
              <ArrowRight size={12} className="text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </button>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={
        composer
          ? `relative rounded-2xl border ${cfg.ringClass} bg-muted/30 shadow-sm overflow-hidden`
          : `my-1.5 max-w-[520px] rounded-lg border ${cfg.ringClass} bg-card/40 overflow-hidden`
      }
    >
      {/* Header row */}
      <div className={composer ? 'flex items-center gap-2 px-3.5 pt-3 pb-1.5' : 'flex items-center gap-2 px-3 py-2'}>
        <Icon size={composer ? 14 : 12} className={`flex-shrink-0 ${cfg.iconClass}`} />
        {composer && <span className="text-xs text-foreground">权限请求</span>}
        {composer && <span className="text-muted-foreground/40">·</span>}
        <span className={`${composer ? 'text-sm' : 'text-xs'} text-foreground/80 font-mono truncate flex-1 min-w-0`}>{request.toolName}</span>
        <span className={`${composer ? 'text-[11px] leading-[16px] px-1.5 py-[1px]' : 'text-[10px] leading-[14px] px-1.5'} rounded border ${cfg.badgeClass} flex-shrink-0`}>
          {cfg.label}
        </span>
        {hasParams && !composer && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="p-0.5 rounded text-muted-foreground/60 hover:text-foreground hover:bg-accent/15 transition-colors flex-shrink-0"
            title={expanded ? '收起' : '展开'}
          >
            <ChevronRight size={11} className={`transition-transform duration-100 ${expanded ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>

      {/* Expandable details (description + params) */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="overflow-hidden"
          >
            <div className={composer ? 'px-3.5 pb-2.5 pt-0 space-y-1.5' : 'px-3 pb-2 pt-2 space-y-1.5 border-t border-border/30'}>
              {request.toolDescription && (
                <div className={`${composer ? 'text-xs leading-[1.6]' : 'text-[11px] leading-[1.6]'} text-muted-foreground`}>
                  {request.toolDescription}
                </div>
              )}
              {hasParams && (
                <div className="space-y-1">
                  {request.params!.map(p => (
                    <div key={p.label} className={`flex gap-2 ${composer ? 'text-xs' : 'text-[11px]'}`}>
                      <span className="text-muted-foreground/60 flex-shrink-0">{p.label}</span>
                      <span className="text-foreground font-mono break-all">{p.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions row */}
      <div className={composer ? 'flex items-center gap-1 px-2.5 pb-2 pt-1' : 'flex items-center gap-1 px-2 pb-1.5 pt-0.5'}>
        {isPending ? (
          <>
            <Button
              variant="ghost"
              size={composer ? 'xs' : 'inline'}
              onClick={() => onResolve('deny')}
              className={
                composer
                  ? 'px-3 py-1 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/8 rounded-md'
                  : 'px-2.5 py-[3px] text-[11px] text-muted-foreground hover:text-destructive hover:bg-destructive/8 rounded-md'
              }
            >
              拒绝
            </Button>
            <span className="flex-1" />
            {request.allowAutoApprove && (
              <Button
                variant="ghost"
                size={composer ? 'xs' : 'inline'}
                onClick={() => onResolve('allow-always')}
                className={
                  composer
                    ? 'px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/15 rounded-md'
                    : 'px-2.5 py-[3px] text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent/15 rounded-md'
                }
              >
                始终允许
              </Button>
            )}
            <Button
              variant="default"
              size={composer ? 'xs' : 'inline'}
              onClick={() => onResolve('allow')}
              className={composer ? 'px-4 py-1 text-xs rounded-md' : 'px-3 py-[3px] text-[11px] rounded-md'}
            >
              允许
            </Button>
          </>
        ) : (
          <div className={`flex items-center gap-1.5 px-2 ${composer ? 'py-1 text-xs' : 'py-[3px] text-[11px]'}`}>
            {request.status === 'approved' ? (
              <>
                <Check size={composer ? 12 : 10} className="text-success" />
                <span className="text-muted-foreground">已允许</span>
              </>
            ) : (
              <>
                <X size={composer ? 12 : 10} className="text-destructive" />
                <span className="text-muted-foreground">已拒绝</span>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
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
      <div className="max-w-[85%] px-3.5 py-2.5 rounded-[var(--radius-button)] rounded-br-[var(--radius-dot)] bg-[#F8F8F9] dark:bg-foreground/15 text-foreground text-xs leading-[1.65]">
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

  // Split messages into: process steps (everything up to the last tool/thinking/genUI)
  // and trailing final content (content-only messages after all process steps).
  // Permission requests are always-visible regardless of status.
  const { processMessages, finalMessages, permissionMsgs } = useMemo(() => {
    const permissions = msgs.filter(m => m.permissionRequest);
    // Find the last index that is a process message (excluding permission-only msgs)
    let lastProcessIdx = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].toolCall || msgs[i].thinking || msgs[i].generativeUI) {
        lastProcessIdx = i;
        break;
      }
    }
    const process = lastProcessIdx >= 0 ? msgs.slice(0, lastProcessIdx + 1).filter(m => !m.permissionRequest) : [];
    const final_ = lastProcessIdx >= 0 ? msgs.slice(lastProcessIdx + 1) : msgs;
    return {
      processMessages: process,
      finalMessages: final_.filter(m => m.content && !m.permissionRequest),
      permissionMsgs: permissions,
    };
  }, [msgs]);

  return (
    <div className="flex gap-2 max-w-[95%]">
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onAvatarClick}
        className="w-5 h-5 rounded-full bg-gradient-to-br from-accent-violet/60 to-accent-blue/60 flex-shrink-0 mt-[1px] active:scale-[0.97] overflow-hidden"
      >
        <span className="text-[8px] leading-none">🤖</span>
      </Button>
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        {/* Process steps — collapsible when run completes */}
        {processMessages.length > 0 && (
          <ProcessBlock
            msgs={processMessages}
            isRunning={isRunning}
            onResolve={onResolve}
          />
        )}

        {/* Permission requests — always visible (require user action) */}
        {permissionMsgs.map((msg) => (
          <PermissionApprovalCard
            key={msg.id}
            request={msg.permissionRequest!}
            onResolve={(action) => onResolve(msg.id, action)}
          />
        ))}

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
      </div>
    </div>
  );
}

// ===========================
// Collapsible Process Block
// ===========================

function ProcessBlock({ msgs, isRunning, onResolve }: {
  msgs: ChatMessage[];
  isRunning: boolean;
  onResolve: (msgId: string, value: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const showSteps = isRunning || expanded;

  const toolCallCount = msgs.filter(m => m.toolCall).length;
  const contentCount = msgs.filter(m => m.content && !m.toolCall && !m.thinking && !m.generativeUI).length;
  const thinkingCount = msgs.filter(m => m.thinking).length;
  const totalCount = toolCallCount + contentCount + thinkingCount;
  const typeIcons = useMemo(() => collectTypeIcons(msgs), [msgs]);

  return (
    <div>
      {/* Collapsed summary (only when not running) */}
      {!isRunning && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1.5 py-[3px] px-1 text-xs text-muted-foreground hover:text-foreground w-fit rounded-md hover:bg-accent/30 transition-colors"
        >
          {expanded
            ? <ChevronDown size={10} className="flex-shrink-0" />
            : <ChevronRight size={10} className="flex-shrink-0" />
          }
          <span>
            {toolCallCount > 0 && `${toolCallCount} tool call${toolCallCount > 1 ? 's' : ''}`}
            {toolCallCount > 0 && (contentCount + thinkingCount) > 0 && ', '}
            {(contentCount + thinkingCount) > 0 && `${contentCount + thinkingCount} message${(contentCount + thinkingCount) > 1 ? 's' : ''}`}
          </span>
          {typeIcons.length > 0 && (
            <span className="flex items-center gap-1 ml-0.5 text-text-tertiary">
              {typeIcons}
            </span>
          )}
        </button>
      )}

      {/* Expandable steps */}
      <AnimatePresence initial={false}>
        {showSteps && (
          <motion.div
            initial={isRunning ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden flex flex-col"
          >
            {msgs.map((msg) => (
              <div key={msg.id}>
                {msg.thinking && <ThinkingRow content={msg.thinking} />}
                {msg.toolCall && <ToolCallRow msg={msg} />}
                {msg.generativeUI && (
                  <div className="py-0.5">
                    {msg.generativeUI.type === 'buttons' && <GenUIButtons data={msg.generativeUI} msgId={msg.id} onResolve={onResolve} />}
                    {msg.generativeUI.type === 'selection' && <GenUISelection data={msg.generativeUI} msgId={msg.id} onResolve={onResolve} />}
                    {msg.generativeUI.type === 'confirmation' && <GenUIConfirmation data={msg.generativeUI} msgId={msg.id} onResolve={onResolve} />}
                  </div>
                )}
                {/* Mid-process content text */}
                {msg.content && !msg.toolCall && !msg.thinking && !msg.generativeUI && (
                  <div className="text-xs text-foreground leading-[1.7] py-1 px-1">
                    {msg.content}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===========================
// Inline Thinking Row (single-line, expandable)
// ===========================

function ThinkingRow({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <button
        onClick={() => setExpanded(v => !v)}
        className="flex items-center gap-2 py-[3px] px-1 text-xs w-fit max-w-full hover:bg-accent/40 rounded-md cursor-pointer"
      >
        <Brain size={11} className="text-foreground flex-shrink-0" />
        <span className="text-foreground flex-shrink-0">思考中...</span>
        <span className="text-muted-foreground truncate max-w-[300px]">{content.slice(0, 80)}</span>
        <ChevronRight size={9} className={`text-muted-foreground flex-shrink-0 transition-transform duration-100 ${expanded ? 'rotate-90' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="overflow-hidden"
          >
            <div className="ml-[18px] pl-2.5 border-l border-border/40 py-1.5">
              <p className="text-xs text-muted-foreground leading-[1.65] whitespace-pre-wrap">{content}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
