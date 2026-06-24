import React, { useState, useMemo } from 'react';
import {
  Monitor, Code2, RotateCw, Smartphone, Tablet,
  Copy, Check, ChevronRight, Eye,
  FolderOpen, X,
  Maximize2, Minimize2,
} from 'lucide-react';
import {
  Button, EmptyState,
} from '@cherry-studio/ui';
import { MOCK_GROUPS } from '@/features/collaboration/data';
import { pinArtifact, shareArtifactToGroup, updateArtifact, usePinnedArtifacts } from '@/app/stores/sharedArtifactsStore';
import { DEFAULT_ARTIFACT_ICON_NAME } from '@/app/utils/artifactIcons';
import { NewTopicDialog, type AttachedArtifact } from '@/features/collaboration/components/NewTopicDialog';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { copyToClipboard } from '@/app/utils/clipboard';
import { Tooltip } from '@/app/components/Tooltip';

// ===========================
// Types
// ===========================

interface Props {
  fileContent: string | null;
  fileName: string | null;
  previewUrl: string | null;
  hasArtifact: boolean;
  previewHtml?: string;
  showExplorer?: boolean;
  onToggleExplorer?: () => void;
  showPreview?: boolean;
  onTogglePreview?: () => void;
  maximized?: boolean;
  onToggleMaximize?: () => void;
  /** Injected 会话/产物 tab switcher, shown at the far left of the header
   * when the artifact lives in the shared right dock. */
  tabSlot?: React.ReactNode;
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

// ===========================
// Artifact Viewer
// ===========================

export function ArtifactViewer({ fileContent, fileName, previewUrl, hasArtifact, previewHtml, showExplorer, onToggleExplorer, showPreview, onTogglePreview, maximized, onToggleMaximize, tabSlot }: Props) {
  const [activeTab, setActiveTab] = useState<ViewTab>('preview');
  const [device, setDevice] = useState<DeviceFrame>('desktop');
  const [copied, setCopied] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  // When set, the NewTopicDialog opens with the artifact pre-attached so
  // the user can type a comment before posting it as a new group topic.
  const [shareTarget, setShareTarget] = useState<{ groupId: string; groupName: string } | null>(null);
  // Share dropdown needs to be controlled so that clicking "添加至工作台"
  // can preventDefault (skip auto-close), manually close, and then open
  // the popover after the dismiss cycle settles. An uncontrolled
  // dropdown caused the popover to "flash and disappear" — Radix's
  // outside-click logic on the just-opened popover saw the still-
  // unwinding dropdown click as a dismiss interaction.
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  // "添加至工作台" popover: opens anchored to the share button, with a
  // draft name + icon prefilled from the current artifact. Both are
  // editable before the user confirms. When the file is already pinned,
  // the popover swaps into edit mode — same form, but it patches the
  // existing entry via `updateArtifact` instead of creating a new one.
  const pinnedArtifacts = usePinnedArtifacts();
  const [pinPopoverOpen, setPinPopoverOpen] = useState(false);
  const [pinDraftName, setPinDraftName] = useState('');
  const [pinDraftIcon, setPinDraftIcon] = useState<string>(DEFAULT_ARTIFACT_ICON_NAME);
  const [editingExistingPinId, setEditingExistingPinId] = useState<string | null>(null);
  const existingPinned = useMemo(
    () => fileName ? pinnedArtifacts.find(p => p.fileName === fileName) ?? null : null,
    [pinnedArtifacts, fileName],
  );

  const buildSharePayload = (overrides?: { label?: string; iconName?: string }) => {
    const name = fileName ?? '未命名.html';
    // Strip extension for a friendlier label; cap at 14 chars for tile UX.
    const stem = name.replace(/\.[a-zA-Z0-9]+$/, '');
    const defaultLabel = stem.length > 14 ? `${stem.slice(0, 13)}…` : stem;
    return {
      fileName: name,
      label: overrides?.label ?? defaultLabel,
      emoji: '📄',
      iconName: overrides?.iconName ?? DEFAULT_ARTIFACT_ICON_NAME,
      html: previewHtml ?? fileContent ?? '',
    };
  };

  const handlePinToWorkbench = () => {
    if (!previewHtml && !fileContent) {
      toast.error('当前没有可固定的内容');
      return;
    }
    // If this file is already pinned, prefill from the existing entry
    // and switch the form into edit mode. Otherwise prefill from the
    // current artifact for a fresh pin.
    if (existingPinned) {
      setPinDraftName(existingPinned.label);
      setPinDraftIcon(existingPinned.iconName ?? DEFAULT_ARTIFACT_ICON_NAME);
      setEditingExistingPinId(existingPinned.id);
    } else {
      const payload = buildSharePayload();
      setPinDraftName(payload.label);
      setPinDraftIcon(payload.iconName);
      setEditingExistingPinId(null);
    }
    // Close the share dropdown manually (preventDefault on the item
    // suppressed the auto-close), then wait long enough for Radix's
    // dismiss + focus-restoration cycle before opening the popover.
    setShareMenuOpen(false);
    setTimeout(() => setPinPopoverOpen(true), 80);
  };

  const handlePinConfirm = () => {
    const trimmed = pinDraftName.trim();
    if (!trimmed) {
      toast.error('请输入应用名称');
      return;
    }
    if (editingExistingPinId) {
      updateArtifact(editingExistingPinId, { label: trimmed, iconName: pinDraftIcon });
      toast.success('已更新工作台条目');
    } else {
      pinArtifact(buildSharePayload({ label: trimmed, iconName: pinDraftIcon }));
      toast.success('已添加至工作台');
    }
    setPinPopoverOpen(false);
  };

  const handleShareToGroup = (groupId: string, groupName: string) => {
    if (!previewHtml && !fileContent) {
      toast.error('当前没有可分享的内容');
      return;
    }
    setShareTarget({ groupId, groupName });
  };

  const handleShareSubmit = (text: string, artifact: AttachedArtifact | null) => {
    if (!shareTarget) return;
    if (!artifact && !text.trim()) {
      // Nothing to send. Shouldn't happen — the dialog disables Send in this state.
      return;
    }
    if (artifact) {
      shareArtifactToGroup(shareTarget.groupId, { ...artifact, comment: text.trim() || undefined });
    }
    toast.success(`已分享到 ${shareTarget.groupName}`);
    setShareTarget(null);
  };

  const handleCopy = () => {
    if (fileContent) {
      copyToClipboard(fileContent);
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
          {tabSlot}
          {tabSlot && <div className="w-px h-3.5 bg-border/30 mx-0.5" />}

          {/* Mode toggle — single button showing current mode, click to flip */}
          <Tooltip content={activeTab === 'preview' ? '切换到代码' : '切换到预览'} side="bottom">
            <Button variant="ghost" size="xs"
              onClick={() => setActiveTab(activeTab === 'preview' ? 'code' : 'preview')}
              className="gap-1.5 px-2 text-foreground hover:bg-accent/40">
              {activeTab === 'preview'
                ? <><Eye className="h-3.5 w-3.5" />预览</>
                : <><Code2 className="h-3.5 w-3.5" />代码</>}
            </Button>
          </Tooltip>
          {activeTab === 'code' && fileName && (
            <span className="text-xs text-muted-foreground/50 ml-1 max-w-[100px] truncate">
              {fileName.split('/').pop()}
            </span>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-0.5">
          {activeTab === 'preview' && (
            <Tooltip content="刷新" side="bottom"><Button variant="ghost" size="icon-xs" onClick={() => setPreviewKey(k => k + 1)}
              className="text-muted-foreground hover:text-foreground">
              <RotateCw size={10} />
            </Button></Tooltip>
          )}

          {activeTab === 'code' && fileContent && (
            <Button variant="ghost" size="xs" onClick={handleCopy}
              className="gap-1 text-muted-foreground hover:text-foreground hover:bg-accent/40">
              {copied ? <Check size={9} className="text-cherry-primary-dark" /> : <Copy size={9} />}
              {copied ? '已复制' : '复制'}
            </Button>
          )}

          {/* Open in folder (Finder) */}
          <div className="flex items-center">
            <div className="w-px h-3 bg-border/30 mx-1" />
            <Tooltip content="在文件夹里打开" side="bottom"><Button variant="ghost" size="icon-xs"
              className="text-muted-foreground hover:text-foreground">
              <FolderOpen size={11} />
            </Button></Tooltip>
          </div>

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

      {/* Content Area */}
      <div className="flex-1 min-h-0 relative">
        {!hasArtifact ? (
          <EmptyState icon={Monitor} title="准备就绪" description="开始与智能体对话，生成的代码和实时预览将在此处显示。" />
        ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'preview' ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="h-full flex items-start justify-center bg-accent/5 overflow-auto p-0"
            >
              {previewHtml ? (
                <div className="h-full w-full flex justify-center" style={device !== 'desktop' ? { padding: '16px' } : undefined}>
                  <div
                    className={`bg-background h-full overflow-hidden ${device !== 'desktop' ? 'rounded-lg shadow-lg border border-border/20' : 'w-full'}`}
                    style={device !== 'desktop' ? { width: deviceWidth, maxWidth: '100%' } : undefined}
                  >
                    <iframe
                      key={previewKey}
                      srcDoc={previewHtml}
                      className="w-full h-full border-0"
                      title="预览"
                      sandbox="allow-scripts"
                    />
                  </div>
                </div>
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
                {fileContent ? (
                  <CodeBlock code={fileContent} />
                ) : (
                  <EmptyState icon={Code2} title="选择文件以查看代码" compact />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        )}
      </div>

      <NewTopicDialog
        open={!!shareTarget}
        group={shareTarget ? MOCK_GROUPS.find(g => g.id === shareTarget.groupId) ?? null : null}
        attachedArtifact={shareTarget ? buildSharePayload() : undefined}
        onSubmit={handleShareSubmit}
        onClose={() => setShareTarget(null)}
      />
    </div>
  );
}

