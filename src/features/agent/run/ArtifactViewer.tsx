import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  Monitor, Code2, RotateCw, Smartphone, Tablet,
  Copy, Check, ChevronRight, ChevronDown, Eye,
  FolderOpen, X,
  Maximize2, Minimize2,
  Share2, Pin, Users2,
  FileText, Globe, MousePointer2, TerminalSquare, ExternalLink,
  MessageSquarePlus, Send,
} from 'lucide-react';
import {
  Button, EmptyState,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,
  Popover, PopoverTrigger, PopoverContent,
} from '@cherry-studio/ui';
import { MOCK_GROUPS } from '@/features/collaboration/data';
import { pinArtifact, shareArtifactToGroup } from '@/app/stores/sharedArtifactsStore';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { copyToClipboard } from '@/app/utils/clipboard';
import { Tooltip } from '@/app/components/Tooltip';
import type { Annotation, AnnotationAnchor, ArtifactVersion } from '@/app/types/agent';
import { MarkdownArtifact } from './annotations/MarkdownArtifact';
import { HtmlArtifactWithProbe } from './annotations/HtmlArtifactWithProbe';
import { AnnotationCommentPopover } from './annotations/AnnotationCommentPopover';
import { AnnotationPinPopover } from './annotations/AnnotationPinPopover';

// Mimics the macOS Finder dock icon — a two-tone rounded square with a face
function FinderIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="finderBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9CC9F2" />
          <stop offset="100%" stopColor="#3F8DD9" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="15" height="15" rx="3.5" fill="url(#finderBg)" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
      <line x1="8" y1="2" x2="8" y2="14" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
      <rect x="4.5" y="5" width="1" height="2.5" rx="0.4" fill="#0a2f5c" />
      <rect x="10.5" y="5" width="1" height="2.5" rx="0.4" fill="#0a2f5c" />
      <path d="M4.5 10.5 Q 8 12.5 11.5 10.5" stroke="#0a2f5c" strokeWidth="0.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ===========================
// Types
// ===========================

interface Props {
  fileContent: string | null;
  fileName: string | null;
  previewUrl: string | null;
  hasArtifact: boolean;
  previewHtml?: string;
  /** Optional Markdown source — when set, the viewer renders this as
   *  styled MD instead of the HTML iframe preview. */
  markdownContent?: string;
  /** Display name shown in annotation flows (e.g. "Q3 周报"). */
  artifactName?: string;
  showExplorer?: boolean;
  onToggleExplorer?: () => void;
  showPreview?: boolean;
  onTogglePreview?: () => void;
  maximized?: boolean;
  onToggleMaximize?: () => void;
  // ----- Annotation hooks (optional). When provided, the side panel and
  // the comment popover affordances are shown for HTML / Markdown artifacts.
  annotations?: Annotation[];
  annotationsEnabled?: boolean;
  annotationsReadOnly?: boolean;
  /** When false, the annotation toolbar button is hidden — used when the
   *  currently-shown artifact is non-annotatable (e.g. a PDF-styled HTML
   *  preview). Defaults to true. */
  annotationsAvailable?: boolean;
  onToggleAnnotations?: () => void;
  onAddAnnotation?: (anchor: AnnotationAnchor, comment: string) => void;
  onSendOneAnnotation?: (id: string) => void;
  onDeleteAnnotation?: (id: string) => void;
  onEditAnnotation?: (id: string, comment: string) => void;
  onSendAllAnnotations?: () => void;
  /** Add + immediately send as a single-annotation batch (the "直接发送"
   *  action inside the new-annotation popover). */
  onAddAndSendAnnotation?: (anchor: AnnotationAnchor, comment: string) => void;
  /** Optional annotation-driven version history. When provided and has > 1
   *  entries, a small "v{N} ▾" dropdown appears in the toolbar so the user
   *  can scroll back through prior revisions. */
  versionHistory?: ArtifactVersion[];
  /** Currently active version id; defaults to the latest entry. */
  activeVersionId?: string;
  onSelectVersion?: (versionId: string) => void;
}

type ViewTab = 'preview' | 'code';
type DeviceFrame = 'desktop' | 'tablet' | 'mobile';

// ===========================
// Syntax Highlighter (Light theme)
// ===========================

const KEYWORDS = new Set([
  'import', 'from', 'export', 'default', 'const', 'let', 'var',
  'function', 'return', 'if', 'else', 'for', 'while', 'class',
  'extends', 'new', 'this', 'typeof', 'interface', 'type', 'as',
  'async', 'await', 'try', 'catch', 'throw', 'switch', 'case',
  'break', 'continue', 'do', 'in', 'of', 'yield', 'void',
]);

const LITERALS = new Set(['true', 'false', 'null', 'undefined', 'NaN', 'Infinity']);

// Build regex patterns using new RegExp() to avoid regex literal compliance issues
const BT = String.fromCharCode(96); // backtick
const TOKEN_PATTERN = new RegExp(
  '(' +
  '\\/\\/.*' +                              // line comments
  '|' + String.fromCharCode(39) + '[^' + String.fromCharCode(39) + ']*' + String.fromCharCode(39) +  // single-quoted strings
  '|"[^"]*"' +                              // double-quoted strings
  '|' + BT + '[^' + BT + ']*' + BT +        // template strings
  '|\\b\\d+(?:\\.\\d+)?\\b' +               // numbers
  '|[a-zA-Z_$][a-zA-Z0-9_$]*' +             // identifiers
  '|[{}()\\[\\];,.:=<>+\\-*/!&|?@#~^%]+' +  // punctuation
  '|\\s+' +                                  // whitespace
  ')',
  'g'
);

const RE_LINE_COMMENT = new RegExp('^\\/' + String.fromCharCode(47));
const RE_STRING_START = new RegExp('^[' + String.fromCharCode(39) + '"' + BT + ']');
const RE_DIGIT_START = new RegExp('^\\d');
const RE_UPPER_START = new RegExp('^[A-Z]');
const RE_PUNCTUATION = new RegExp('^[{}()\\[\\];,.:=<>+\\-*/!&|?@#~^%]+$');

function tokenizeLine(line: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  let match;
  let key = 0;

  // Reset lastIndex for global regex
  TOKEN_PATTERN.lastIndex = 0;

  while ((match = TOKEN_PATTERN.exec(line)) !== null) {
    const seg = match[0];
    if (RE_LINE_COMMENT.test(seg)) {
      tokens.push(<span key={key++} className="text-muted-foreground">{seg}</span>);
    } else if (RE_STRING_START.test(seg)) {
      tokens.push(<span key={key++} className="text-accent-amber">{seg}</span>);
    } else if (RE_DIGIT_START.test(seg)) {
      tokens.push(<span key={key++} className="text-accent-cyan">{seg}</span>);
    } else if (KEYWORDS.has(seg)) {
      tokens.push(<span key={key++} className="text-accent-purple">{seg}</span>);
    } else if (LITERALS.has(seg)) {
      tokens.push(<span key={key++} className="text-accent-cyan">{seg}</span>);
    } else if (RE_UPPER_START.test(seg) && seg.length > 1) {
      tokens.push(<span key={key++} className="text-accent-emerald">{seg}</span>);
    } else if (RE_PUNCTUATION.test(seg)) {
      tokens.push(<span key={key++} className="text-muted-foreground">{seg}</span>);
    } else {
      tokens.push(<span key={key++} className="text-foreground">{seg}</span>);
    }
  }

  return tokens;
}

function CodeBlock({ code }: { code: string }) {
  const lines = useMemo(() => code.split('\n'), [code]);
  const gutterWidth = String(lines.length).length * 8 + 24;

  return (
    <div className="font-mono text-xs leading-[20px]">
      {lines.map((line, i) => (
        <div key={i} className="flex hover:bg-accent/40">
          <span
            className="text-right pr-5 text-muted-foreground/40 select-none flex-shrink-0 tabular-nums"
            style={{ width: gutterWidth, minWidth: gutterWidth }}
          >
            {i + 1}
          </span>
          <span className="flex-1 pr-4 text-foreground">{tokenizeLine(line)}</span>
        </div>
      ))}
    </div>
  );
}

// (EmptyState imported from @cherry-studio/ui)

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 0) return '刚刚';
  if (diff < 60_000) return '刚刚';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)} 小时前`;
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ===========================
// Artifact Viewer
// ===========================

export function ArtifactViewer({
  fileContent, fileName, previewUrl, hasArtifact, previewHtml,
  markdownContent, artifactName,
  showExplorer, onToggleExplorer, showPreview, onTogglePreview, maximized, onToggleMaximize,
  annotations, annotationsEnabled, annotationsReadOnly, annotationsAvailable = true, onToggleAnnotations,
  onAddAnnotation, onSendOneAnnotation, onDeleteAnnotation, onEditAnnotation, onSendAllAnnotations,
  onAddAndSendAnnotation,
  versionHistory, activeVersionId, onSelectVersion,
}: Props) {
  const [versionMenuOpen, setVersionMenuOpen] = useState(false);
  const activeVersion = versionHistory?.find(v => v.id === activeVersionId) ?? versionHistory?.[versionHistory.length - 1];
  const [activeTab, setActiveTab] = useState<ViewTab>('preview');
  const [device, setDevice] = useState<DeviceFrame>('desktop');
  const [copied, setCopied] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [previewCollapsed, setPreviewCollapsed] = useState(false);

  // ----- Annotation state -----
  // Pending "new annotation" popover (anchored to a fresh selection / element).
  const [pendingAnchor, setPendingAnchor] = useState<{ anchor: AnnotationAnchor; position: { x: number; y: number } } | null>(null);
  const [focusAnnotId, setFocusAnnotId] = useState<string | null>(null);
  // Pin hover popover state: which annotation is being hovered, and the pin's
  // viewport rect. The popover is debounced-close so the user can move the
  // cursor from the pin to the popover without losing it.
  const [hoveredAnnot, setHoveredAnnot] = useState<{ id: string; rect: { x: number; y: number; w: number; h: number } } | null>(null);
  const [popoverHovered, setPopoverHovered] = useState(false);
  const hoverCloseTimer = useRef<number | null>(null);

  const requestCloseHover = useCallback(() => {
    if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current);
    hoverCloseTimer.current = window.setTimeout(() => {
      // Only close if the user isn't currently on the popover.
      if (!popoverHovered) setHoveredAnnot(null);
      hoverCloseTimer.current = null;
    }, 180);
  }, [popoverHovered]);

  const handlePinHover = useCallback((info: { id: string; rect: { x: number; y: number; w: number; h: number } } | null) => {
    if (info) {
      if (hoverCloseTimer.current) { clearTimeout(hoverCloseTimer.current); hoverCloseTimer.current = null; }
      setHoveredAnnot(info);
    } else {
      requestCloseHover();
    }
  }, [requestCloseHover]);

  const supportsAnnotations = !!onToggleAnnotations && (markdownContent || previewHtml) && annotationsAvailable;
  const isMarkdown = !!markdownContent;
  const artifactKind: 'html' | 'markdown' = isMarkdown ? 'markdown' : 'html';

  const handleAnchorPicked = useCallback((anchor: AnnotationAnchor, position: { x: number; y: number }) => {
    setPendingAnchor({ anchor, position });
  }, []);

  const handleSaveComment = useCallback((comment: string) => {
    if (pendingAnchor && onAddAnnotation) {
      onAddAnnotation(pendingAnchor.anchor, comment);
    }
    setPendingAnchor(null);
    // Clear the user's text selection so the highlight wash isn't doubled.
    try { window.getSelection()?.removeAllRanges(); } catch { /* noop */ }
  }, [pendingAnchor, onAddAnnotation]);

  const buildSharePayload = () => {
    const name = artifactName ?? fileName ?? (markdownContent ? '未命名.md' : '未命名.html');
    // Strip extension for a friendlier label; cap at 14 chars for tile UX.
    const stem = name.replace(/\.[a-zA-Z0-9]+$/, '');
    const label = stem.length > 14 ? `${stem.slice(0, 13)}…` : stem;
    return {
      fileName: name,
      label,
      emoji: '📄',
      html: previewHtml ?? markdownContent ?? fileContent ?? '',
    };
  };

  const handlePinToWorkbench = () => {
    if (!previewHtml && !markdownContent && !fileContent) {
      toast.error('当前没有可 Pin 的内容');
      return;
    }
    pinArtifact(buildSharePayload());
    toast.success('已 Pin 到工作台');
  };

  const handleShareToGroup = (groupId: string, groupName: string) => {
    if (!previewHtml && !markdownContent && !fileContent) {
      toast.error('当前没有可分享的内容');
      return;
    }
    shareArtifactToGroup(groupId, buildSharePayload());
    toast.success(`已分享到 ${groupName}`);
  };

  const handleCopy = () => {
    const text = isMarkdown ? markdownContent : fileContent;
    if (text) {
      copyToClipboard(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const deviceWidth = device === 'mobile' ? 375 : device === 'tablet' ? 768 : '100%';

  return (
    <div className="flex flex-col h-full">
      {/* Tab Bar — always visible */}
      <div className="flex items-center justify-between px-2.5 flex-shrink-0 h-[36px]">
        <div className="flex items-center gap-1.5">
          {/* File tree toggle - left side */}
          {onToggleExplorer && (
            <Tooltip content="文件树" side="bottom"><Button variant="ghost" size="icon-xs" onClick={onToggleExplorer}
              className={showExplorer ? 'text-foreground bg-accent/25' : 'text-muted-foreground hover:text-foreground'}>
              <FolderOpen size={11} />
            </Button></Tooltip>
          )}

          {/* Mode toggle — single button showing current mode, click to flip */}
          <Tooltip content={activeTab === 'preview' ? '切换到代码' : '切换到预览'} side="bottom">
            <Button variant="ghost" size="xs"
              onClick={() => setActiveTab(activeTab === 'preview' ? 'code' : 'preview')}
              className="gap-1.5 px-2 text-foreground hover:bg-accent/40">
              {activeTab === 'preview'
                ? <><Eye className="h-3.5 w-3.5" />{isMarkdown ? '文档' : '预览'}</>
                : <><Code2 className="h-3.5 w-3.5" />{isMarkdown ? 'Markdown' : '代码'}</>}
            </Button>
          </Tooltip>

          {/* Annotation mode toggle — only when host hooks are wired and we're
              on the preview tab of an MD or HTML artifact. */}
          {supportsAnnotations && activeTab === 'preview' && (
            <Tooltip content={annotationsReadOnly ? '此版本已被替代，无法批注' : (annotationsEnabled ? '退出批注模式' : '进入批注模式')} side="bottom">
              <Button
                variant="ghost"
                size="xs"
                onClick={onToggleAnnotations}
                disabled={annotationsReadOnly}
                className={`gap-1.5 px-2 ${
                  annotationsEnabled
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
                }`}
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
                {annotationsEnabled ? '批注中' : '批注'}
                {(annotations?.length ?? 0) > 0 && (
                  <span className="ml-0.5 inline-flex items-center justify-center min-w-[14px] h-[14px] rounded-full bg-amber-500 text-white text-[10px] font-medium leading-none px-1 tabular-nums">
                    {annotations!.length}
                  </span>
                )}
              </Button>
            </Tooltip>
          )}
          {activeTab === 'code' && fileName && (
            <span className="text-xs text-muted-foreground/50 ml-1 max-w-[100px] truncate">
              {fileName.split('/').pop()}
            </span>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-0.5">
          {/* Version history dropdown — only when there's > 1 revision */}
          {versionHistory && versionHistory.length > 1 && activeVersion && (
            <Popover open={versionMenuOpen} onOpenChange={setVersionMenuOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="xs"
                  className="h-6 px-1.5 gap-0.5 text-[11px] text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 rounded-md"
                  title="版本历史"
                >
                  <span className="font-medium tabular-nums">{activeVersion.label}</span>
                  <ChevronDown size={9} className={`transition-transform ${versionMenuOpen ? 'rotate-180' : ''}`} />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" side="bottom" className="w-[260px] p-0 py-1 rounded-xl">
                <div className="px-3 py-1.5 text-[10px] text-muted-foreground/60 tracking-[0.05em] uppercase">版本历史</div>
                <div className="max-h-[260px] overflow-y-auto py-0.5">
                  {[...versionHistory].reverse().map((v) => {
                    const isActive = v.id === activeVersion.id;
                    const isLatest = v.id === versionHistory[versionHistory.length - 1].id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => { onSelectVersion?.(v.id); setVersionMenuOpen(false); }}
                        className={`w-full flex flex-col items-start gap-0.5 px-3 py-1.5 text-left hover:bg-accent/40 transition-colors ${isActive ? 'bg-amber-500/[0.06]' : ''}`}
                      >
                        <div className="flex items-center gap-1.5 w-full">
                          <span className={`text-[11.5px] font-medium tabular-nums ${isActive ? 'text-amber-700 dark:text-amber-300' : 'text-foreground'}`}>{v.label}</span>
                          {isLatest && (
                            <span className="text-[9px] px-1 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">最新</span>
                          )}
                          {isActive && !isLatest && (
                            <span className="text-[9px] px-1 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300">查看中</span>
                          )}
                          <span className="text-[10px] text-muted-foreground/60 ml-auto tabular-nums">{formatRelativeTime(v.createdAt)}</span>
                        </div>
                        {v.summary && (
                          <span className="text-[10.5px] text-muted-foreground/70 line-clamp-1">{v.summary}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          )}
          {activeTab === 'preview' && (
            <Tooltip content="刷新" side="bottom"><Button variant="ghost" size="icon-xs" onClick={() => setPreviewKey(k => k + 1)}
              className="text-muted-foreground hover:text-foreground">
              <RotateCw size={10} />
            </Button></Tooltip>
          )}

          {activeTab === 'code' && (fileContent || markdownContent) && (
            <Button variant="ghost" size="xs" onClick={handleCopy}
              className="gap-1 text-muted-foreground hover:text-foreground hover:bg-accent/40">
              {copied ? <Check size={9} className="text-cherry-primary-dark" /> : <Copy size={9} />}
              {copied ? '已复制' : '复制'}
            </Button>
          )}

          {/* Open with — split button: Finder primary action + dropdown of local apps */}
          <div className="flex items-center">
            <div className="w-px h-3 bg-border/30 mx-1" />
            <Tooltip content="在 Finder 中打开" side="bottom"><Button variant="ghost" size="icon-xs"
              className="text-muted-foreground hover:text-foreground">
              <FinderIcon size={12} />
            </Button></Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-xs"
                  className="text-muted-foreground hover:text-foreground -ml-0.5"
                  title="选择应用打开">
                  <ChevronDown size={9} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="bottom" className="w-[170px]">
                <div className="px-2 py-1 text-xs text-muted-foreground/60">使用应用打开</div>
                <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs">
                  <Eye size={12} className="text-muted-foreground/80 flex-shrink-0" />
                  <span className="flex-1">预览</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs">
                  <FileText size={12} className="text-info flex-shrink-0" />
                  <span className="flex-1">WPS Office</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs">
                  <FileText size={12} className="text-accent-orange flex-shrink-0" />
                  <span className="flex-1">Microsoft Word</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs">
                  <Globe size={12} className="text-accent-violet flex-shrink-0" />
                  <span className="flex-1">浏览器</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs">
                  <MousePointer2 size={12} className="text-foreground flex-shrink-0" />
                  <span className="flex-1">Cursor</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs">
                  <TerminalSquare size={12} className="text-muted-foreground/80 flex-shrink-0" />
                  <span className="flex-1">Terminal</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs">
                  <ExternalLink size={12} className="text-muted-foreground/80 flex-shrink-0" />
                  <span className="flex-1">其他应用…</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Share — dropdown with workspace + link share targets */}
          <div className="w-px h-3 bg-border/30 mx-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs"
                className="text-muted-foreground hover:text-foreground"
                title="分享">
                <Share2 size={11} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" className="w-[180px]">
              <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs" onSelect={handlePinToWorkbench}>
                <Pin size={12} className="text-muted-foreground/80 flex-shrink-0" />
                <span className="flex-1">Pin 到工作台</span>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2 px-2 py-[5px] text-xs">
                  <Users2 size={12} className="text-muted-foreground/80 flex-shrink-0" />
                  <span className="flex-1">分享到群组</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-[220px] max-h-[260px] overflow-y-auto">
                  {MOCK_GROUPS.length === 0 ? (
                    <div className="text-[11px] text-muted-foreground/50 px-2 py-2 text-center">暂无群组</div>
                  ) : (
                    MOCK_GROUPS.map(g => (
                      <DropdownMenuItem key={g.id} className="gap-2 px-2 py-[6px] text-xs"
                        onSelect={() => handleShareToGroup(g.id, g.name)}>
                        <div className="w-6 h-6 rounded-md bg-accent/50 flex items-center justify-center flex-shrink-0 text-[11px] text-muted-foreground/70">
                          {g.name.slice(0, 1)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-foreground">{g.name}</div>
                          <div className="text-[10px] text-muted-foreground/55 truncate">
                            {g.members.length} 成员 · {g.topics.length} 话题
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Maximize toggle */}
          {onToggleMaximize && (
            <div className="flex items-center">
              <div className="w-px h-3 bg-border/30 mx-1" />
              <Tooltip content={maximized ? '退出最大化' : '最大化'} side="bottom"><Button variant="ghost" size="icon-xs" onClick={onToggleMaximize}
                className={maximized ? 'text-foreground bg-accent/25' : 'text-muted-foreground hover:text-foreground'}>
                {maximized ? <Minimize2 size={10} /> : <Maximize2 size={10} />}
              </Button></Tooltip>
            </div>
          )}

          {/* Close button — closes the artifact panel */}
          {onTogglePreview && (
            <div className="flex items-center">
              <div className="w-px h-3 bg-border/30 mx-1" />
              <Tooltip content="关闭预览" side="bottom"><Button variant="ghost" size="icon-xs" onClick={onTogglePreview}
                className="text-muted-foreground hover:text-foreground hover:bg-accent/40">
                <X size={11} />
              </Button></Tooltip>
            </div>
          )}
        </div>
      </div>

      {/* Content Area — artifact body + optional annotation side panel */}
      <div className="flex-1 min-h-0 relative flex">
        {!hasArtifact ? (
          <div className="flex-1">
            <EmptyState icon={Monitor} title="准备就绪" description="开始与智能体对话，生成的代码和实时预览将在此处显示。" />
          </div>
        ) : (
          <>
            <div className="flex-1 min-w-0 relative">
              <AnimatePresence mode="wait">
                {activeTab === 'preview' ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="h-full flex items-start justify-center bg-accent/5 overflow-hidden p-0"
                  >
                    {isMarkdown ? (
                      <div className="h-full w-full">
                        <MarkdownArtifact
                          content={markdownContent || ''}
                          annotations={annotations ?? []}
                          enabled={!!annotationsEnabled && !annotationsReadOnly}
                          onSelectAnchor={handleAnchorPicked}
                          focusAnnotationId={focusAnnotId}
                          onPinHover={handlePinHover}
                        />
                      </div>
                    ) : previewHtml ? (
                      <HtmlArtifactWithProbe
                        html={previewHtml}
                        device={device}
                        refreshKey={previewKey}
                        annotations={annotations ?? []}
                        enabled={!!annotationsEnabled && !annotationsReadOnly}
                        onSelectAnchor={handleAnchorPicked}
                        focusAnnotationId={focusAnnotId}
                        onPinHover={handlePinHover}
                      />
                    ) : (
                      <EmptyState icon={Monitor} title="暂无预览" compact />
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="code"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="h-full"
                  >
                    <div className="h-full overflow-auto bg-background py-3 pl-2 scrollbar-thin">
                      {isMarkdown ? (
                        <CodeBlock code={markdownContent || ''} />
                      ) : fileContent ? (
                        <CodeBlock code={fileContent} />
                      ) : (
                        <EmptyState icon={Code2} title="选择文件以查看代码" compact />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Floating comment popover (anchored to viewport coords). */}
              <AnimatePresence>
                {pendingAnchor && (
                  <AnnotationCommentPopover
                    anchor={pendingAnchor.anchor}
                    position={pendingAnchor.position}
                    onSave={handleSaveComment}
                    onSendNow={onAddAndSendAnnotation ? (comment) => {
                      onAddAndSendAnnotation(pendingAnchor.anchor, comment);
                      setPendingAnchor(null);
                      try { window.getSelection()?.removeAllRanges(); } catch { /* noop */ }
                    } : undefined}
                    onCancel={() => setPendingAnchor(null)}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Pin hover popover — rendered at the hovered pin's position
                (viewport coords). Shows the comment with inline edit and
                per-annotation send / delete actions. Cursor can move from
                pin to popover without losing it. */}
            <AnimatePresence>
              {supportsAnnotations && activeTab === 'preview' && hoveredAnnot && (() => {
                const idx = (annotations ?? []).findIndex(a => a.id === hoveredAnnot.id);
                const a = idx >= 0 ? annotations![idx] : null;
                if (!a) return null;
                return (
                  <AnnotationPinPopover
                    key={`pin-${a.id}`}
                    annotation={a}
                    index={idx}
                    pinRect={hoveredAnnot.rect}
                    onEdit={(id, comment) => onEditAnnotation?.(id, comment)}
                    onDelete={(id) => { onDeleteAnnotation?.(id); setHoveredAnnot(null); }}
                    onSendNow={(id) => { onSendOneAnnotation?.(id); setHoveredAnnot(null); }}
                    onClose={() => setHoveredAnnot(null)}
                    onMouseEnter={() => {
                      setPopoverHovered(true);
                      if (hoverCloseTimer.current) { clearTimeout(hoverCloseTimer.current); hoverCloseTimer.current = null; }
                    }}
                    onMouseLeave={() => {
                      setPopoverHovered(false);
                      requestCloseHover();
                    }}
                  />
                );
              })()}
            </AnimatePresence>

            {/* Bottom-right floating "send all" button — only when there are
                pending annotations. Single compact pill, doesn't take layout
                space; artifact stays full-width. */}
            {supportsAnnotations && activeTab === 'preview' && (annotations?.length ?? 0) > 0 && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                type="button"
                onClick={() => onSendAllAnnotations?.()}
                className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 px-3 h-8 rounded-full bg-amber-500 text-white text-xs font-medium shadow-[0_2px_8px_-2px_rgba(245,158,11,0.45)] hover:bg-amber-600 transition-colors"
                title="发送所有批注给智能体"
              >
                <Send size={12} strokeWidth={2} />
                <span>发送 <span className="tabular-nums">{annotations!.length}</span> 条批注</span>
              </motion.button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
