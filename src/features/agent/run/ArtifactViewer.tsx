import React, { useState, useMemo } from 'react';
import {
  Monitor, Code2, RotateCw, ExternalLink, Smartphone, Tablet,
  Copy, Check, ChevronDown, ChevronRight, Eye,
  PanelLeftClose, PanelLeftOpen, X,
  Maximize2, Minimize2,
} from 'lucide-react';
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
      tokens.push(<span key={key++} className="text-[#6a737d]">{seg}</span>);
    } else if (RE_STRING_START.test(seg)) {
      tokens.push(<span key={key++} className="text-[#b07d48]">{seg}</span>);
    } else if (RE_DIGIT_START.test(seg)) {
      tokens.push(<span key={key++} className="text-[#0e7490]">{seg}</span>);
    } else if (KEYWORDS.has(seg)) {
      tokens.push(<span key={key++} className="text-[#8250df]">{seg}</span>);
    } else if (LITERALS.has(seg)) {
      tokens.push(<span key={key++} className="text-[#0e7490]">{seg}</span>);
    } else if (RE_UPPER_START.test(seg) && seg.length > 1) {
      tokens.push(<span key={key++} className="text-[#1a7f37]">{seg}</span>);
    } else if (RE_PUNCTUATION.test(seg)) {
      tokens.push(<span key={key++} className="text-foreground/55">{seg}</span>);
    } else {
      tokens.push(<span key={key++} className="text-foreground/85">{seg}</span>);
    }
  }

  return tokens;
}

function CodeBlock({ code }: { code: string }) {
  const lines = useMemo(() => code.split('\n'), [code]);
  const gutterWidth = String(lines.length).length * 8 + 24;

  return (
    <div className="font-mono text-[11px] leading-[20px]">
      {lines.map((line, i) => (
        <div key={i} className="flex hover:bg-accent/12">
          <span
            className="text-right pr-5 text-muted-foreground/40 select-none flex-shrink-0 tabular-nums"
            style={{ width: gutterWidth, minWidth: gutterWidth }}
          >
            {i + 1}
          </span>
          <span className="flex-1 pr-4 text-foreground/85">{tokenizeLine(line)}</span>
        </div>
      ))}
    </div>
  );
}

// ===========================
// Empty State
// ===========================

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center h-full px-8"
    >
      <div className="w-16 h-16 rounded-2xl bg-accent/25 flex items-center justify-center mb-4">
        <Monitor size={24} strokeWidth={1.2} className="text-muted-foreground/30" />
      </div>
      <p className="text-[12px] text-muted-foreground mb-1">{"准备就绪"}</p>
      <p className="text-[10px] text-muted-foreground/55 max-w-[260px] text-center leading-[1.6]">
        {"开始与智能体对话，生成的代码和实时预览将在此处显示。"}
      </p>
    </motion.div>
  );
}

// ===========================
// Artifact Viewer
// ===========================

export function ArtifactViewer({ fileContent, fileName, previewUrl, hasArtifact, previewHtml, showExplorer, onToggleExplorer, showPreview, onTogglePreview, maximized, onToggleMaximize }: Props) {
  const [activeTab, setActiveTab] = useState<ViewTab>('preview');
  const [device, setDevice] = useState<DeviceFrame>('desktop');
  const [copied, setCopied] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [previewCollapsed, setPreviewCollapsed] = useState(false);

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
          {/* File tree toggle - left side */}
          {onToggleExplorer && (
            <Tooltip content="文件树" side="bottom"><button onClick={onToggleExplorer}
              className={`p-1 rounded transition-colors ${showExplorer ? 'text-foreground/80 bg-accent/25' : 'text-muted-foreground hover:text-foreground/70'}`}>
              {showExplorer ? <PanelLeftClose size={11} /> : <PanelLeftOpen size={11} />}
            </button></Tooltip>
          )}

          <div className="inline-flex items-center bg-accent/20 rounded-lg p-[3px]">
            {/* Preview Tab */}
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-2.5 py-[4px] rounded-md text-[10px] transition-all duration-150 ${
                activeTab === 'preview'
                  ? 'bg-background text-foreground shadow-sm shadow-black/5'
                  : 'text-muted-foreground/60 hover:text-muted-foreground'
              }`}
            >
              <Eye size={10} />
              {"预览"}
            </button>

            {/* Code Tab */}
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-2.5 py-[4px] rounded-md text-[10px] transition-all duration-150 ${
                activeTab === 'code'
                  ? 'bg-background text-foreground shadow-sm shadow-black/5'
                  : 'text-muted-foreground/60 hover:text-muted-foreground'
              }`}
            >
              <Code2 size={10} />
              {"代码"}
              {fileName && (
                <span className="text-[9px] text-muted-foreground/50 ml-0.5 max-w-[100px] truncate">
                  {fileName.split('/').pop()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-0.5">
          {activeTab === 'preview' && (
            <div className="contents">
              {/* Device selectors */}
              <Tooltip content="桌面" side="bottom"><button onClick={() => setDevice('desktop')}
                className={`p-1 rounded transition-colors ${device === 'desktop' ? 'text-foreground/80 bg-accent/25' : 'text-muted-foreground hover:text-foreground/70'}`}>
                <Monitor size={10} />
              </button></Tooltip>
              <Tooltip content="平板" side="bottom"><button onClick={() => setDevice('tablet')}
                className={`p-1 rounded transition-colors ${device === 'tablet' ? 'text-foreground/80 bg-accent/25' : 'text-muted-foreground hover:text-foreground/70'}`}>
                <Tablet size={10} />
              </button></Tooltip>
              <Tooltip content="手机" side="bottom"><button onClick={() => setDevice('mobile')}
                className={`p-1 rounded transition-colors ${device === 'mobile' ? 'text-foreground/80 bg-accent/25' : 'text-muted-foreground hover:text-foreground/70'}`}>
                <Smartphone size={10} />
              </button></Tooltip>

              <div className="w-px h-3 bg-border/25 mx-1" />

              <Tooltip content="刷新" side="bottom"><button onClick={() => setPreviewKey(k => k + 1)}
                className="p-1 rounded text-muted-foreground hover:text-foreground/70 transition-colors">
                <RotateCw size={10} />
              </button></Tooltip>
              <Tooltip content="新窗口打开" side="bottom"><button className="p-1 rounded text-muted-foreground hover:text-foreground/70 transition-colors">
                <ExternalLink size={10} />
              </button></Tooltip>
            </div>
          )}

          {activeTab === 'code' && fileContent && (
            <button onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 rounded text-[9px] text-muted-foreground hover:text-foreground/80 hover:bg-accent/15 transition-colors">
              {copied ? <Check size={9} className="text-cherry-primary-dark" /> : <Copy size={9} />}
              {copied ? '已复制' : '复制'}
            </button>
          )}

          {/* Maximize toggle */}
          {onToggleMaximize && (
            <div>
              <div className="w-px h-3 bg-border/25 mx-1 inline-block align-middle" />
              <Tooltip content={maximized ? '退出最大化' : '最大化'} side="bottom"><button onClick={onToggleMaximize}
                className={`p-1 rounded transition-colors ${maximized ? 'text-foreground/80 bg-accent/25' : 'text-muted-foreground hover:text-foreground/70'}`}>
                {maximized ? <Minimize2 size={10} /> : <Maximize2 size={10} />}
              </button></Tooltip>
            </div>
          )}

          {/* Close preview panel */}
          {onTogglePreview && (
            <div>
              <div className="w-px h-3 bg-border/25 mx-1 inline-block align-middle" />
              <Tooltip content="关闭预览" side="bottom"><button onClick={onTogglePreview}
                className="p-1 rounded text-muted-foreground hover:text-foreground/70 hover:bg-accent/15 transition-colors">
                <X size={11} />
              </button></Tooltip>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 relative">
        {!hasArtifact ? (
          <EmptyState />
        ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'preview' ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="h-full flex items-start justify-center bg-accent/8 overflow-auto p-0"
            >
              {previewHtml ? (
                <div className="h-full w-full flex justify-center" style={device !== 'desktop' ? { padding: '16px' } : undefined}>
                  <div
                    className={`bg-white h-full overflow-hidden ${device !== 'desktop' ? 'rounded-lg shadow-lg border border-border/25' : 'w-full'}`}
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
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <Monitor size={20} strokeWidth={1.2} className="text-muted-foreground/30" />
                  <p className="text-[10px] text-muted-foreground/50">{"暂无预览"}</p>
                </div>
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
              <div className="h-full overflow-auto bg-background py-3 pl-2 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/25 [&::-webkit-scrollbar-thumb]:rounded-full">
                {fileContent ? (
                  <CodeBlock code={fileContent} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <Code2 size={20} strokeWidth={1.2} className="text-muted-foreground/30" />
                    <p className="text-[10px] text-muted-foreground/50">{"选择文件以查看代码"}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        )}
      </div>
    </div>
  );
}
