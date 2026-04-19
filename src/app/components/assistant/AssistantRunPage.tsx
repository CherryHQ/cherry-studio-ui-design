import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useGlobalActions } from '@/app/context/GlobalActionContext';
import {
  ChevronDown, ChevronRight, ChevronUp, X, Copy, Check, Maximize2, Minimize2,
  Bot, Plus, ArrowUp, FileText, Code2, Eye, BookOpen,
  Clock, Settings, History, MessageCirclePlus, AtSign,
  ExternalLink, File, Globe, Sparkles,
  Layers, Activity, Database, Link2, Info,
  Trash2, Bookmark, Share2, MoreHorizontal,
  GitBranch, GitFork, ListChecks, Edit3,
  Quote, Type, Brain, RotateCcw,
  LayoutGrid, Rows3, Columns3,
  Search, Paperclip, Hammer, Link, Zap,
  SlidersHorizontal,
  MessageCircle, Image as ImageIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { copyToClipboard } from '@/app/utils/clipboard';
import { highlightLine } from '@/app/utils/syntaxHighlight';
import { getFileIcon } from '@/app/utils/fileIcons';
import { ChatInterface } from '@/app/components/shared/Chat/ChatInterface';
import { ThinkingBlock, InlineCodeBlock, MermaidBlock, ImageGallery } from '@/app/components/shared/Chat/MessageComponents';
import { AttachmentList } from '@/app/components/shared/Chat/AttachmentList';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { Tooltip } from '@/app/components/Tooltip';
import { Button, Input } from '@cherry-studio/ui';
import type { AssistantInfo, AssistantTopic } from '@/app/types/assistant';
import type {
  Message, ArtifactData,
  MessageMetadata, SearchResultItem, RAGInfo, RAGChunk, FileAttachment, ParallelResponse,
  ModelCapability,
} from '@/app/types/chat';
import {
  MOCK_ASSISTANTS, MOCK_MESSAGES, MOCK_TOPICS, MOCK_PARALLEL_MESSAGES,
  MOCK_MULTI_ASSISTANT_MESSAGES, ASSISTANT_EMOJI_MAP,
} from '@/app/mock';

// Backward-compatible alias
type AssistantMessage = Message;
import { ASSISTANT_MODELS } from '@/app/config/models';
import { TopicHistoryPage } from './TopicHistoryPage';
import { BranchTreePanel } from './BranchTreePanel';
import { ChatSettingsPanel } from './ChatSettingsPanel';
import { AtMentionPicker } from '@/app/components/shared/AtMentionPicker';
import { ModelPickerPanel } from '@/app/components/shared/ModelPickerPanel';
import { AssistantPickerPanel } from '@/app/components/shared/AssistantPickerPanel';
import { HistorySidebar } from '@/app/components/shared/HistorySidebar';
import { useHistorySidebar } from '@/app/hooks/useHistorySidebar';

// Syntax highlighting, file icons, animations, and shared message components
// are imported from shared utilities above.

// ===========================
// RegExp constants (avoid regex literals for write-tool compatibility)
// ===========================
const BT = String.fromCharCode(96);
const RE_TABLE_SEP = new RegExp('^[-:]+$');
const RE_BOLD_MATCH = new RegExp('\\*\\*(.+?)\\*\\*(.*)');
const RE_DASH_BOLD = new RegExp('- \\*\\*(.+?)\\*\\*(.*)');
const RE_NUM_TEST = new RegExp('^\\d+\\.');
const RE_NUM_SPACE_TEST = new RegExp('^\\d+\\.\\s');
const RE_NUM_MATCH = new RegExp('^(\\d+)\\.\\s*(.*)');
const RE_NUM_EXTRACT = new RegExp('^(\\d+)');
const RE_NUM_PREFIX = new RegExp('^\\d+\\.\\s*');
const RE_CITATION_SPLIT_PAT = new RegExp('(\\[\\d+\\])', 'g');
const RE_CITATION_MATCH_PAT = new RegExp('^\\[(\\d+)\\]$');

function applyBoldReplace(text: string): string {
  return text.replace(new RegExp('\\*\\*(.+?)\\*\\*', 'g'), '<strong class="text-foreground">$1</strong>');
}
function applyCodeReplace(text: string): string {
  return text.replace(new RegExp(BT + '([^' + BT + ']+)' + BT, 'g'), '<code class="px-1 py-0.5 rounded bg-muted/50 text-[9px] font-mono">$1</code>');
}
function applyBoldAndCode(text: string): string {
  return applyCodeReplace(applyBoldReplace(text));
}
function applyCodeReplaceMd(text: string): string {
  return text.replace(new RegExp(BT + '([^' + BT + ']+)' + BT, 'g'), '<code class="px-1 py-0.5 rounded bg-muted/50 text-xs font-mono text-foreground/80">$1</code>');
}









// AttachmentList is now imported from '@/app/components/shared/Chat/AttachmentList'

// ===========================
// Parallel Responses Component
// ===========================

type ParallelLayout = 'vertical' | 'horizontal' | 'grid';

// ASSISTANT_EMOJI_MAP is imported from mockData

const MODEL_EMOJI_MAP: Record<string, string> = {
  'Google': '🔵',
  'OpenAI': '🟢',
  'Anthropic': '🟠',
  'DeepSeek': '🔮',
  'Alibaba': '🟡',
};

function getParallelAvatar(resp: ParallelResponse): string {
  if (resp.assistantName && ASSISTANT_EMOJI_MAP[resp.assistantName]) {
    return ASSISTANT_EMOJI_MAP[resp.assistantName];
  }
  return MODEL_EMOJI_MAP[resp.modelProvider] || '✨';
}

function ParallelResponsesBlock({ responses }: { responses: ParallelResponse[] }) {
  const [layout, setLayout] = useState<ParallelLayout>('horizontal');
  const [contextId, setContextId] = useState<string>(responses[0]?.id || '');
  const isMultiAssistant = responses.some(r => r.assistantName);

  const layoutOptions: { key: ParallelLayout; icon: React.ElementType; label: string }[] = [
    { key: 'horizontal', icon: Columns3, label: '横向' },
    { key: 'vertical', icon: Rows3, label: '纵向' },
    { key: 'grid', icon: LayoutGrid, label: '网格' },
  ];

  return (
    <div className="my-1">
      {/* Layout switcher */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-cherry-primary-dark bg-cherry-active-bg px-2 py-[2px] rounded-md">
            并行 {responses.length} {isMultiAssistant ? '助手' : '模型'}
          </span>
        </div>
        <div className="flex items-center gap-0.5 bg-accent/20 rounded-md p-0.5">
          {layoutOptions.map(opt => (
            <Button
              key={opt.key}
              variant="ghost"
              size="icon-xs"
              onClick={() => setLayout(opt.key)}
              className={`p-1 w-auto h-auto ${
                layout === opt.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground/50 hover:text-foreground'
              }`}
              title={opt.label}
            >
              <opt.icon size={11} />
            </Button>
          ))}
        </div>
      </div>

      {/* Responses */}
      <div className={
        layout === 'vertical' ? 'space-y-2' :
        layout === 'horizontal' ? 'flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:h-[2px] [&::-webkit-scrollbar-thumb]:bg-border/20 pb-1' :
        'grid grid-cols-2 gap-2'
      }>
        {responses.map(resp => {
          const isContext = contextId === resp.id;
          return (
            <div
              key={resp.id}
              className={`rounded-xl border overflow-hidden flex flex-col ${
                layout === 'horizontal' ? 'min-w-[280px] max-w-[340px] flex-shrink-0' : ''
              } ${isContext ? 'border-cherry-ring bg-cherry-active-bg/30' : 'border-border/25 bg-accent/8'}`}
            >
              {/* Response header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-border/15">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-md bg-accent/40 flex items-center justify-center text-xs leading-none flex-shrink-0">
                    {getParallelAvatar(resp)}
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    {resp.assistantName && (
                      <span className="text-xs text-foreground/85 flex-shrink-0">{resp.assistantName}</span>
                    )}
                    <span className={`text-xs truncate ${resp.assistantName ? 'text-muted-foreground/50' : 'text-foreground/80'}`}>{resp.modelName}</span>
                    <span className="text-[8px] text-muted-foreground/40 flex-shrink-0">{resp.modelProvider}</span>
                  </div>
                </div>
                {isContext && (
                  <Tooltip content="当前上下文" side="top"><span className="text-xs text-cherry-primary flex-shrink-0 ml-2">✦</span></Tooltip>
                )}
              </div>
              {/* Thinking */}
              {resp.thinking && <ThinkingBlock content={resp.thinking} />}
              {/* Content */}
              <div className="px-3 py-2.5 text-[10.5px] text-foreground/85 leading-[1.75] flex-1">
                {resp.content.split('\n').map((line, i) => {
                  if (line.startsWith('|') && line.includes('|')) {
                    const cells = line.split('|').filter(c => c.trim()).map(c => c.trim());
                    const isSep = cells.every(c => RE_TABLE_SEP.test(c));
                    if (isSep) return null;
                    return (
                      <div key={i} className="flex gap-0">
                        {cells.map((cell, j) => (
                          <span key={j} className={`flex-1 px-1.5 py-0.5 text-[9px] border-b border-border/15 ${
                            i === 0 ? 'text-foreground/70' : 'text-foreground/55'
                          }`}>
                            {cell}
                          </span>
                        ))}
                      </div>
                    );
                  }
                  if (line.startsWith('- **') || line.startsWith('**')) {
                    const match = line.match(RE_BOLD_MATCH);
                    if (match) return <div key={i} className="flex items-start gap-1.5 py-0.5"><span className="text-muted-foreground/40 mt-px">-</span><span><span className="text-foreground">{match[1]}</span>{match[2]}</span></div>;
                  }
                  if (RE_NUM_TEST.test(line)) {
                    const num = line.match(RE_NUM_MATCH);
                    if (num) return <div key={i} className="flex items-start gap-1.5 py-0.5"><span className="text-muted-foreground/40 w-3 text-right flex-shrink-0">{num[1]}.</span><span dangerouslySetInnerHTML={{ __html: applyBoldAndCode(num[2]) }} /></div>;
                  }
                  if (line.trim() === '') return <div key={i} className="h-1.5" />;
                  return <p key={i} dangerouslySetInnerHTML={{ __html: applyBoldAndCode(line) }} />;
                })}
              </div>
              {/* Images */}
              {resp.images && resp.images.length > 0 && (
                <div className="px-3 pb-2"><ImageGallery images={resp.images} /></div>
              )}
              {/* Card footer actions */}
              <div className="flex items-center justify-between px-3 py-1.5 border-t border-border/10">
                <div className="flex items-center gap-1 text-[8px] text-muted-foreground/40">
                  <span>{resp.duration}</span>
                  <span className="mx-0.5">·</span>
                  <span>{(resp.tokens.input + resp.tokens.output + (resp.tokens.thinking || 0)).toLocaleString()} tokens</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <Tooltip content="重新生成" side="bottom">
                  <Button variant="ghost" size="icon-xs"
                    onClick={() => {}}
                    className="p-1 w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/20"
                  >
                    <RotateCcw size={10} />
                  </Button>
                  </Tooltip>
                  <Tooltip content={isContext ? '已选为上下文' : '选为上下文'} side="bottom">
                  <Button variant="ghost" size="icon-xs"
                    onClick={() => setContextId(resp.id)}
                    className={`p-1 w-auto h-auto ${
                      isContext
                        ? 'text-cherry-primary bg-cherry-active-bg'
                        : 'text-muted-foreground/40 hover:text-cherry-primary hover:bg-cherry-active-bg'
                    }`}
                  >
                    <span className="text-xs leading-none">✦</span>
                  </Button>
                  </Tooltip>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===========================
// Artifacts Panel
// ===========================

type ArtifactTab = 'document' | 'code' | 'preview';

// ===========================
// History Files Mock Data
// ===========================

const HISTORY_FILES: { id: string; title: string; type: ArtifactData['type']; timestamp: string; content: string }[] = [
  { id: 'hf-1', title: 'StatsRow.tsx', type: 'code', timestamp: '14:35', content: 'import React from "react";\n\ninterface Props {\n  label: string;\n  value: number;\n}\n\nexport function StatsRow({ label, value }: Props) {\n  return (\n    <div className="flex items-center justify-between py-2">\n      <span className="text-sm text-gray-600">{label}</span>\n      <span className="text-lg font-semibold">{value.toLocaleString()}</span>\n    </div>\n  );\n}' },
  { id: 'hf-2', title: '产品落地页', type: 'html', timestamp: '14:38', content: '<!DOCTYPE html>\n<html>\n<head><title>Product</title></head>\n<body>\n  <header><h1>Amazing Product</h1></header>\n  <main><p>Build better experiences.</p></main>\n</body>\n</html>' },
  { id: 'hf-3', title: 'API 接口文档', type: 'document', timestamp: '昨天', content: '# API 接口文档\n\n## 用户模块\n\n### GET /api/users\n\n获取用户列表，支持分页和筛选。\n\n**参数：**\n- `page` - 页码\n- `limit` - 每���数量' },
  { id: 'hf-4', title: 'UserCard.vue', type: 'code', timestamp: '昨天', content: '<template>\n  <div class="user-card">\n    <img :src="user.avatar" :alt="user.name" />\n    <h3>{{ user.name }}</h3>\n    <p>{{ user.email }}</p>\n  </div>\n</template>\n\n<script setup>\ndefineProps({ user: Object });\n</script>' },
  { id: 'hf-5', title: '数据报表看板', type: 'html', timestamp: '2天前', content: '<!DOCTYPE html>\n<html>\n<body>\n  <div id="dashboard">\n    <h1>Dashboard</h1>\n    <div class="charts">Charts here</div>\n  </div>\n</body>\n</html>' },
  { id: 'hf-6', title: 'Mermaid 流程图', type: 'mermaid', timestamp: '3天前', content: 'graph TD\n  A --> B --> C' },
  { id: 'hf-7', title: 'SVG 图标组件', type: 'svg', timestamp: '上周', content: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>' },
  { id: 'hf-8', title: '部署脚本 deploy.sh', type: 'code', timestamp: '上周', content: '#!/bin/bash\nset -e\ndocker build -t myapp .\ndocker push myapp\nkubectl apply -f k8s/' },
  { id: 'hf-9', title: '需求分析文档', type: 'document', timestamp: '上周', content: '# 需求分析\n\n## 项目背景\n\n本项目旨在构建一个智能对话平台。\n\n## 核心需求\n\n1. 多模型接入\n2. 对话管理\n3. 知识库集成' },
];

function artifactTypeIcon(type: ArtifactData['type'], size = 11) {
  switch (type) {
    case 'code': return <Code2 size={size} className="text-violet-500" />;
    case 'html': return <Globe size={size} className="text-sky-500" />;
    case 'svg': return <Eye size={size} className="text-pink-500" />;
    case 'mermaid': return <Layers size={size} className="text-cyan-500" />;
    default: return <FileText size={size} className="text-warning" />;
  }
}

function artifactTypeLabel(type: ArtifactData['type']) {
  switch (type) {
    case 'code': return '代码';
    case 'html': return '网页';
    case 'svg': return 'SVG';
    case 'mermaid': return '图表';
    default: return '文档';
  }
}

// ===========================
// File History Dropdown
// ===========================

type FileCategory = 'all' | 'code' | 'document' | 'web';

const FILE_CATEGORIES: { key: FileCategory; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: '全部', icon: Layers },
  { key: 'document', label: '文档', icon: FileText },
  { key: 'code', label: '代码', icon: Code2 },
  { key: 'web', label: '网页', icon: Globe },
];

function fileCategoryMatch(type: ArtifactData['type'], cat: FileCategory): boolean {
  if (cat === 'all') return true;
  if (cat === 'code') return type === 'code';
  if (cat === 'document') return type === 'document';
  if (cat === 'web') return type === 'html' || type === 'svg' || type === 'mermaid';
  return true;
}

function FileHistoryDropdown({ onSelect, onClose, anchorRight, selectedTitle, hasTopic }: {
  onSelect: (artifact: ArtifactData) => void;
  onClose: () => void;
  anchorRight?: boolean;
  selectedTitle?: string;
  hasTopic?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FileCategory>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const files = HISTORY_FILES;

  const filtered = useMemo(() => {
    let list = files;
    if (category !== 'all') {
      list = list.filter(f => fileCategoryMatch(f.type, category));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(f =>
        f.title.toLowerCase().includes(q) || artifactTypeLabel(f.type).includes(q)
      );
    }
    return list;
  }, [query, category, files]);

  return (
    <div>
      <div className="fixed inset-0 z-[55]" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: -4, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.97 }}
        transition={{ duration: 0.12 }}
        className={`absolute top-full mt-1.5 z-[56] w-[270px] bg-popover border border-border/40 rounded-xl shadow-2xl shadow-black/12 overflow-hidden ${anchorRight ? 'right-0' : 'left-0'}`}
      >
        {/* Category tabs */}
        <div className="flex items-center gap-0.5 px-2.5 pt-2 pb-1">
          {FILE_CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <Button variant="ghost" size="xs" key={cat.key} onClick={() => setCategory(cat.key)}
                className={`gap-1 px-2 py-[4px] h-auto text-xs ${category === cat.key ? 'bg-foreground/8 text-foreground' : 'text-muted-foreground/60 hover:text-foreground hover:bg-accent/15'}`}>
                <Icon size={9} />
                <span>{cat.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Search */}
        <div className="px-2.5 pt-1 pb-1.5">
          <div className="flex items-center gap-2 px-2.5 py-[5px] rounded-lg bg-accent/15 border border-border/25">
            <Search size={10} className="text-muted-foreground/50 flex-shrink-0" />
            <Input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜索历史文件..."
              className="flex-1 h-auto border-0 bg-transparent shadow-none focus-visible:ring-0 text-xs text-foreground placeholder:text-muted-foreground/40 p-0 rounded-none"
            />
            {query && (
              <Button variant="ghost" size="icon-xs" onClick={() => setQuery('')} className="w-auto h-auto p-0 text-muted-foreground hover:text-foreground hover:bg-transparent">
                <X size={9} />
              </Button>
            )}
          </div>
        </div>

        {/* File list */}
        <div className="max-h-[260px] overflow-y-auto px-1.5 py-0.5 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/25 [&::-webkit-scrollbar-thumb]:rounded-full">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-6">
              <Search size={14} className="text-muted-foreground/25 mb-2" />
              <span className="text-xs text-muted-foreground/50">没有匹配的文件</span>
            </div>
          ) : (
            filtered.map(file => {
              const isSelected = selectedTitle === file.title;
              return (
                <Button variant="ghost" size="xs"
                  key={file.id}
                  onClick={() => { onSelect({ type: file.type, title: file.title, content: file.content }); onClose(); }}
                  className={`w-full justify-start gap-2.5 px-2.5 py-[7px] h-auto rounded-lg transition-colors group mb-0.5 ${isSelected ? 'bg-foreground/8' : 'hover:bg-accent/15'}`}
                >
                  <div className="flex-shrink-0">
                    {artifactTypeIcon(file.type, 13)}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className={`text-[10.5px] truncate ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>{file.title}</div>
                    <div className="text-[9px] text-muted-foreground/45">{artifactTypeLabel(file.type)} · {file.timestamp}</div>
                  </div>
                  <Eye size={9} className={`flex-shrink-0 transition-opacity ${isSelected ? 'text-muted-foreground/40 opacity-100' : 'text-muted-foreground/25 opacity-0 group-hover:opacity-100'}`} />
                </Button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-1.5 border-t border-border/20">
          <span className="text-[9px] text-muted-foreground/40">{files.length} 个历史文件</span>
        </div>
      </motion.div>
    </div>
  );
}

// ===========================
// Artifacts Panel
// ===========================

function ArtifactsPanel({ artifact, isFullscreen, onToggleFullscreen, onClose, onSelectArtifact, hasTopic }: {
  artifact: ArtifactData | null;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onClose: () => void;
  onSelectArtifact: (artifact: ArtifactData) => void;
  hasTopic: boolean;
}) {
  const [tab, setTab] = useState<ArtifactTab>('document');
  const [copied, setCopied] = useState(false);


  useEffect(() => {
    if (artifact) {
      if (artifact.type === 'code') setTab('code');
      else if (artifact.type === 'html' || artifact.type === 'svg') setTab('preview');
      else setTab('document');
    }
  }, [artifact]);

  const handleCopy = () => {
    if (artifact) {
      copyToClipboard(artifact.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Determine available tabs based on artifact type
  const getAvailableTabs = (): { key: ArtifactTab; label: string; icon: React.ElementType }[] => {
    if (!artifact) return [];
    switch (artifact.type) {
      case 'code':
        return [{ key: 'code', label: '代码', icon: Code2 }];
      case 'html':
      case 'svg':
      case 'mermaid':
        return [
          { key: 'code', label: '代码', icon: Code2 },
          { key: 'preview', label: '预览', icon: Eye },
        ];
      case 'document':
      default:
        return [{ key: 'document', label: '文档', icon: FileText }];
    }
  };

  const availableTabs = getAvailableTabs();

  // Empty state
  if (!artifact) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-3 h-[38px] border-b border-border/30 flex-shrink-0">
          <span className="text-xs text-muted-foreground/50">内容预览</span>
          <div className="flex items-center gap-0.5">
            <Tooltip content="关闭" side="bottom"><Button variant="ghost" size="icon-xs" onClick={onClose} className="p-1.5 w-auto h-auto text-muted-foreground hover:text-foreground hover:bg-accent/15">
              <X size={11} />
            </Button></Tooltip>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 px-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-accent/40 to-accent/20 border border-border/20 flex items-center justify-center mb-5">
            <Layers size={22} strokeWidth={1.3} className="text-muted-foreground/25" />
          </div>
          <p className="text-[11.5px] text-foreground/60 mb-2">暂无预览内容</p>
          <p className="text-xs text-muted-foreground/40 text-center leading-[1.6] mb-5">
            点击消息中的代码块、文档或网页卡片即可在此查看
          </p>
          <div className="w-full space-y-[6px]">
            <div className="flex items-center gap-2.5 px-3 py-[6px] rounded-lg bg-accent/10 border border-border/15">
              <div className="w-5 h-5 rounded bg-violet-500/10 flex items-center justify-center"><Code2 size={10} className="text-violet-500/60" /></div>
              <span className="text-xs text-muted-foreground/50">代码 — 语法高亮 + 复制</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-[6px] rounded-lg bg-accent/10 border border-border/15">
              <div className="w-5 h-5 rounded bg-warning/10 flex items-center justify-center"><FileText size={10} className="text-warning/60" /></div>
              <span className="text-xs text-muted-foreground/50">文档 — Markdown 渲染</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-[6px] rounded-lg bg-accent/10 border border-border/15">
              <div className="w-5 h-5 rounded bg-sky-500/10 flex items-center justify-center"><Globe size={10} className="text-sky-500/60" /></div>
              <span className="text-xs text-muted-foreground/50">网页 — 实时预览效果</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 h-[38px] border-b border-border/30 flex-shrink-0">
        <div className="flex items-center gap-1">
          {availableTabs.map(t => (
            <Button variant="ghost" size="xs" key={t.key} onClick={() => setTab(t.key)}
              className={`gap-1.5 px-2.5 py-[5px] h-auto text-xs transition-all duration-100 ${tab === t.key ? 'bg-foreground/8 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/15'}`}>
              <t.icon size={10} />{t.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-0.5">
          <span className="text-[9px] text-muted-foreground/50 mr-1.5 truncate max-w-[100px]">{artifact.title}</span>
          <Tooltip content="复制" side="bottom"><Button variant="ghost" size="icon-xs" onClick={handleCopy} className="p-1.5 w-auto h-auto text-muted-foreground hover:text-foreground hover:bg-accent/15">
            {copied ? <Check size={11} className="text-cherry-primary" /> : <Copy size={11} />}
          </Button></Tooltip>
          <Tooltip content={isFullscreen ? '还原' : '全屏'} side="bottom"><Button variant="ghost" size="icon-xs" onClick={onToggleFullscreen} className="p-1.5 w-auto h-auto text-muted-foreground hover:text-foreground hover:bg-accent/15">
            {isFullscreen ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
          </Button></Tooltip>
          <Tooltip content="关闭" side="bottom"><Button variant="ghost" size="icon-xs" onClick={onClose} className="p-1.5 w-auto h-auto text-muted-foreground hover:text-foreground hover:bg-accent/15">
            <X size={11} />
          </Button></Tooltip>
        </div>
      </div>
      <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/25 [&::-webkit-scrollbar-thumb]:rounded-full">
        {tab === 'document' && <div className="p-5"><MarkdownRenderer content={artifact.content} /></div>}
        {tab === 'code' && <CodeRenderer content={artifact.content} />}
        {tab === 'preview' && <PreviewRenderer content={artifact.content} type={artifact.type} />}
      </div>
    </div>
  );
}

// ===========================
// Markdown / Code / Preview Renderers
// ===========================

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLang = '';

  lines.forEach((line, i) => {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-${i}`} className="my-3 rounded-lg overflow-hidden border border-border/30">
            {codeLang && <div className="px-3 py-1.5 bg-muted/40 border-b border-border/20"><span className="text-[9px] text-muted-foreground">{codeLang}</span></div>}
            <pre className="px-3 py-2.5 overflow-x-auto text-[10.5px] leading-[1.7] font-mono bg-muted/20">
              {codeLines.map((cl, j) => <div key={j}>{highlightLine(cl)}</div>)}
            </pre>
          </div>
        );
        codeLines = []; codeLang = ''; inCodeBlock = false;
      } else { inCodeBlock = true; codeLang = line.slice(3).trim(); }
      return;
    }
    if (inCodeBlock) { codeLines.push(line); return; }

    if (line.startsWith('# ')) elements.push(<h1 key={i} className="text-base text-foreground mb-3 mt-1">{line.slice(2)}</h1>);
    else if (line.startsWith('## ')) elements.push(<h2 key={i} className="text-sm text-foreground mb-2 mt-4">{line.slice(3)}</h2>);
    else if (line.startsWith('### ')) elements.push(<h3 key={i} className="text-sm text-foreground mb-1.5 mt-3">{line.slice(4)}</h3>);
    else if (line.startsWith('- **')) {
      const bold = line.match(RE_DASH_BOLD);
      if (bold) elements.push(<div key={i} className="flex items-start gap-1.5 py-0.5 text-xs text-foreground/80 leading-[1.7]"><span className="text-muted-foreground/40 mt-px">-</span><span><span className="text-foreground">{bold[1]}</span>{bold[2]}</span></div>);
    } else if (RE_NUM_SPACE_TEST.test(line)) {
      elements.push(<div key={i} className="flex items-start gap-2 py-0.5 text-xs text-foreground/80 leading-[1.7]"><span className="text-muted-foreground/50 w-4 text-right flex-shrink-0">{line.match(RE_NUM_EXTRACT)?.[1]}.</span><span>{line.replace(RE_NUM_PREFIX, '')}</span></div>);
    } else if (line.trim() === '') elements.push(<div key={i} className="h-2" />);
    else {
      const formatted = applyBoldReplace(applyCodeReplaceMd(line));
      elements.push(<p key={i} className="text-xs text-foreground/75 leading-[1.8]" dangerouslySetInnerHTML={{ __html: formatted }} />);
    }
  });
  return <div>{elements}</div>;
}

function CodeRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <pre className="px-0 py-2 text-[10.5px] leading-[1.75] font-mono">
      {lines.map((line, i) => (
        <div key={i} className="flex hover:bg-accent/10 transition-colors">
          <span className="w-10 text-right pr-3 text-[9px] text-muted-foreground/30 select-none flex-shrink-0 tabular-nums">{i + 1}</span>
          <span className="flex-1 pr-4">{highlightLine(line)}</span>
        </div>
      ))}
    </pre>
  );
}

function PreviewRenderer({ content, type }: { content: string; type: string }) {
  if (type === 'html' || type === 'svg') {
    return (
      <div className="h-full flex items-start justify-center p-4 bg-white dark:bg-neutral-100">
        <iframe srcDoc={content} className="w-full h-full min-h-[300px] border-0 rounded-lg" sandbox="allow-scripts" title="Preview" />
      </div>
    );
  }
  return <div className="p-5"><MarkdownRenderer content={content} /></div>;
}

// ===========================
// Floating Panel Shell
// ===========================

function FloatingPanel({ title, icon, onClose, children, width = 340 }: {
  title: string;
  icon: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}) {
  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className="absolute top-2 right-2 bottom-2 z-40 bg-background rounded-xl border border-border/25 shadow-2xl shadow-black/12 flex flex-col overflow-hidden"
      style={{ width }}
    >
      <div className="flex items-center justify-between px-4 h-[38px] flex-shrink-0">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs text-foreground">{title}</span>
        </div>
        <Button variant="ghost" size="icon-xs" onClick={onClose} className="p-1.5 w-auto h-auto text-muted-foreground hover:text-foreground hover:bg-accent/15">
          <X size={12} />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/25 [&::-webkit-scrollbar-thumb]:rounded-full">
        {children}
      </div>
    </motion.div>
  );
}

// ===========================
// Assistant Info Panel
// ===========================

function AssistantInfoPanel({ assistant, topics, onSelectTopic, onClose, onEdit, onOpenHistory, onNavigateToKnowledge }: {
  assistant: AssistantInfo;
  topics: AssistantTopic[];
  onSelectTopic: (id: string) => void;
  onClose: () => void;
  onEdit: () => void;
  onOpenHistory: () => void;
  onNavigateToKnowledge?: (kbName: string) => void;
}) {
  const [promptExpanded, setPromptExpanded] = useState(false);

  return (
    <FloatingPanel title="助手信息" icon={<Bot size={12} className="text-muted-foreground" />} onClose={onClose}>
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm text-foreground mb-1">{assistant.name}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock size={9} />
              <span>最新使用 {assistant.updatedAt}</span>
            </div>
          </div>
          <Button variant="outline" size="xs" onClick={onEdit} className="px-2 py-[4px] h-auto border-border/30 text-muted-foreground hover:text-foreground hover:bg-accent/15 gap-1">
            <Edit3 size={9} />编辑
          </Button>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">默认模型</span>
          <div className="flex items-center gap-1.5 px-2 py-[3px] rounded-md bg-accent/25">
            <Sparkles size={9} className="text-muted-foreground" />
            <span className="text-foreground/80">{assistant.model}</span>
          </div>
        </div>
        {assistant.tags.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">标签</span>
            <div className="flex gap-1">
              {assistant.tags.map(t => (
                <span key={t} className="px-1.5 py-[2px] rounded text-[9px] bg-accent/30 text-foreground/70">{t}</span>
              ))}
            </div>
          </div>
        )}
        <div className="rounded-lg bg-muted/15 overflow-hidden">
          <Button variant="ghost" size="xs" onClick={() => setPromptExpanded(!promptExpanded)}
            className="w-full justify-start gap-2 px-3 py-2 h-auto text-[10.5px] text-foreground/80 hover:bg-accent/10 transition-colors">
            <FileText size={10} className="text-muted-foreground flex-shrink-0" />
            <span className="flex-1 text-left">系统提示词</span>
            <motion.div animate={{ rotate: promptExpanded ? 90 : 0 }} transition={{ duration: 0.1 }}>
              <ChevronRight size={10} className="text-muted-foreground/50" />
            </motion.div>
          </Button>
          <AnimatePresence initial={false}>
            {promptExpanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                <div className="px-3 pb-3">
                  <pre className="text-xs text-foreground/60 leading-[1.7] whitespace-pre-wrap mt-1 font-sans">{assistant.systemPrompt}</pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {assistant.knowledgeBases.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2"><BookOpen size={10} className="text-muted-foreground" /><span className="text-xs text-muted-foreground">知识库</span></div>
            <div className="space-y-1">
              {assistant.knowledgeBases.map(kb => (
                <div key={kb.id} onClick={() => onNavigateToKnowledge?.(kb.name)} className="flex items-center gap-2 px-2.5 py-[6px] rounded-md hover:bg-accent/15 transition-colors cursor-pointer group">
                  <Database size={10} className="text-info/70 flex-shrink-0" />
                  <span className="text-[10.5px] text-info/80 group-hover:text-info">{kb.name}</span>
                  <ChevronRight size={8} className="ml-auto text-muted-foreground/30 group-hover:text-muted-foreground/50" />
                </div>
              ))}
            </div>
          </div>
        )}
        {assistant.tools.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2"><Settings size={10} className="text-muted-foreground" /><span className="text-xs text-muted-foreground">工具</span></div>
            <div className="space-y-1">
              {assistant.tools.map(tool => (
                <div key={tool.id} className="flex items-center gap-2 px-2.5 py-[6px] rounded-md hover:bg-accent/15 transition-colors">
                  <span className="text-xs">{tool.icon}</span>
                  <span className="text-[10.5px] text-foreground/70">{tool.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Clock size={10} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground flex-1">最近话题</span>
            <Tooltip content="历史话题" side="bottom"><Button variant="ghost" size="icon-xs" onClick={onOpenHistory} className="p-1 w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/15">
              <History size={11} />
            </Button></Tooltip>
          </div>
          <div className="text-[9px] text-muted-foreground/50 px-1 mb-1.5 mt-3">昨天</div>
          <div className="space-y-0.5">
            {topics.slice(0, 4).map(topic => (
              <Button variant="ghost" size="xs" key={topic.id} onClick={() => { onSelectTopic(topic.id); onClose(); }}
                className="w-full justify-start gap-2 px-2.5 py-[6px] h-auto text-left hover:bg-accent/15 transition-colors group">
                <span className="text-[10.5px] text-foreground/70 flex-1 truncate group-hover:text-foreground">{topic.title}</span>
                <span className="text-[9px] text-muted-foreground/40 flex-shrink-0">{topic.timestamp}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </FloatingPanel>
  );
}

// ===========================
// Chat Detail Panel
// ===========================

function ChatDetailPanel({ metadata, onClose }: {
  metadata: MessageMetadata;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [jsonTab, setJsonTab] = useState<'request' | 'response' | 'process'>('request');
  const [tokenHover, setTokenHover] = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false);
  const [jsonExpanded, setJsonExpanded] = useState(false);

  const copyId = () => { copyToClipboard(metadata.sessionId); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const total = metadata.tokens.input + metadata.tokens.output + (metadata.tokens.thinking || 0) + (metadata.tokens.cache || 0);
  const jsonContent = jsonTab === 'request' ? metadata.requestJson : jsonTab === 'response' ? metadata.responseJson : metadata.processJson || '{}';

  return (
    <FloatingPanel title="聊天详情" icon={<Activity size={12} className="text-muted-foreground" />} onClose={onClose}>
      <div className="px-4 py-3 space-y-3">
        <div className="space-y-[6px]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground/70">会话 ID</span>
            <Button variant="ghost" size="xs" onClick={copyId} className="gap-1 h-auto text-foreground/60 hover:text-foreground transition-colors font-mono text-[9px]">
              <span>{metadata.sessionId.slice(0, 16)}...</span>
              {copied ? <Check size={8} className="text-cherry-primary" /> : <Copy size={8} />}
            </Button>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground/70">模型</span>
            <div className="flex items-center gap-1.5"><Sparkles size={9} className="text-muted-foreground/40" /><span className="text-foreground/70">{metadata.model}</span></div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground/70">状态</span>
            <span className={metadata.status === 'success' ? 'text-foreground/60' : 'text-destructive'}>{metadata.status === 'success' ? '成功' : '失败'}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground/70">时间</span>
            <span className="text-foreground/70">{metadata.startTime} · {metadata.duration}</span>
          </div>
          <div className="relative flex items-center justify-between text-xs"
            onMouseEnter={() => setTokenHover(true)} onMouseLeave={() => setTokenHover(false)}>
            <span className="text-muted-foreground/70">令牌数</span>
            <span className="text-foreground/70 tabular-nums cursor-default">{total.toLocaleString()}</span>
            <AnimatePresence>
              {tokenHover && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.1 }}
                  className="absolute right-0 top-full mt-1 z-10 bg-popover rounded-lg shadow-lg shadow-black/10 border border-border/25 px-3 py-2 min-w-[160px]">
                  <div className="space-y-[4px]">
                    <div className="flex items-center justify-between text-[9.5px]"><span className="text-muted-foreground">输入</span><span className="text-info tabular-nums">{metadata.tokens.input.toLocaleString()}</span></div>
                    <div className="flex items-center justify-between text-[9.5px]"><span className="text-muted-foreground">输出</span><span className="text-foreground/60 tabular-nums">{metadata.tokens.output.toLocaleString()}</span></div>
                    {metadata.tokens.thinking !== undefined && metadata.tokens.thinking > 0 && (
                      <div className="flex items-center justify-between text-[9.5px]"><span className="text-muted-foreground">思考</span><span className="text-purple-500 tabular-nums">{metadata.tokens.thinking.toLocaleString()}</span></div>
                    )}
                    {metadata.tokens.cache !== undefined && metadata.tokens.cache > 0 && (
                      <div className="flex items-center justify-between text-[9.5px]"><span className="text-muted-foreground">缓存</span><span className="text-warning tabular-nums">{metadata.tokens.cache.toLocaleString()}</span></div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-0.5">
              {(['request', 'response', 'process'] as const).map(t => (
                <Button variant="ghost" size="xs" key={t} onClick={() => setJsonTab(t)}
                  className={`px-2.5 py-[4px] h-auto text-[9.5px] transition-all duration-100 ${jsonTab === t ? 'bg-foreground/8 text-foreground' : 'text-muted-foreground/60 hover:text-foreground'}`}>
                  {t === 'request' ? '请求' : t === 'response' ? '响应' : '过程'}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-0.5">
              <Tooltip content="复制" side="bottom"><Button variant="ghost" size="icon-xs" onClick={() => { copyToClipboard(jsonContent); setJsonCopied(true); setTimeout(() => setJsonCopied(false), 1500); }}
                className="p-1 w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/15">
                {jsonCopied ? <Check size={9} className="text-cherry-primary" /> : <Copy size={9} />}
              </Button></Tooltip>
              <Tooltip content="放大" side="bottom"><Button variant="ghost" size="icon-xs" onClick={() => setJsonExpanded(true)} className="p-1 w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/15">
                <Maximize2 size={9} />
              </Button></Tooltip>
            </div>
          </div>
          <div className="rounded-lg bg-muted/15 overflow-auto [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/20">
            <pre className="px-3 py-2.5 text-[9.5px] leading-[1.7] font-mono whitespace-pre">
              {jsonContent.split('\n').map((line, i) => <div key={i}>{highlightLine(line)}</div>)}
            </pre>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {jsonExpanded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-8" onClick={() => setJsonExpanded(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }} className="bg-popover rounded-xl shadow-2xl w-full max-w-[700px] max-h-[80vh] flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-1">
                  {(['request', 'response', 'process'] as const).map(t => (
                    <Button variant="ghost" size="xs" key={t} onClick={() => setJsonTab(t)}
                      className={`px-2.5 py-[4px] h-auto text-xs transition-all duration-100 ${jsonTab === t ? 'bg-foreground/8 text-foreground' : 'text-muted-foreground/60 hover:text-foreground'}`}>
                      {t === 'request' ? '请求' : t === 'response' ? '响应' : '过程'}
                    </Button>
                  ))}
                </div>
                <Button variant="ghost" size="icon-xs" onClick={() => setJsonExpanded(false)} className="p-1.5 w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/15">
                  <Minimize2 size={11} />
                </Button>
              </div>
              <div className="flex-1 overflow-auto px-4 pb-4 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30">
                <pre className="text-xs leading-[1.7] font-mono whitespace-pre">
                  {jsonContent.split('\n').map((line, i) => <div key={i}>{highlightLine(line)}</div>)}
                </pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </FloatingPanel>
  );
}

// ===========================
// RAG Panel
// ===========================

function RAGPanel({ ragInfo, onClose }: { ragInfo: RAGInfo; onClose: () => void }) {
  const [subTab, setSubTab] = useState<'chunks' | 'process'>('chunks');
  const [expandedChunk, setExpandedChunk] = useState<number | null>(null);

  return (
    <FloatingPanel title="知识库" icon={<Database size={12} className="text-info/70" />} onClose={onClose}>
      <div className="px-4 py-3 space-y-3">
        <div className="space-y-[6px]">
          <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground/70">知识库</span><span className="text-info cursor-pointer hover:underline">{ragInfo.knowledgeBaseName}</span></div>
          <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground/70">Top-k</span><span className="text-foreground/70">{ragInfo.topK}</span></div>
          <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground/70">分数阈值</span><span className="text-foreground/70">{ragInfo.scoreThreshold}</span></div>
          {ragInfo.rerankModel && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground/70">重排</span>
              <div className="flex items-center gap-1.5"><Sparkles size={8} className="text-muted-foreground/40" /><span className="text-foreground/70">{ragInfo.rerankModel}</span></div>
            </div>
          )}
          <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground/70">检索方式</span><span className="text-foreground/70">{ragInfo.retrievalMethod}</span></div>
        </div>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="xs" onClick={() => setSubTab('chunks')} className={`px-2.5 py-[4px] h-auto text-xs transition-all ${subTab === 'chunks' ? 'bg-foreground/8 text-foreground' : 'text-muted-foreground/60 hover:text-foreground'}`}>top-k</Button>
          <Button variant="ghost" size="xs" onClick={() => setSubTab('process')} className={`px-2.5 py-[4px] h-auto text-xs transition-all ${subTab === 'process' ? 'bg-foreground/8 text-foreground' : 'text-muted-foreground/60 hover:text-foreground'}`}>过程</Button>
        </div>
        {subTab === 'chunks' && (
          <div className="space-y-2">
            <AnimatePresence>
              {expandedChunk !== null && (
                <RAGChunkPreview
                  chunk={ragInfo.chunks[expandedChunk]}
                  index={expandedChunk + 1}
                  onClose={() => setExpandedChunk(null)}
                />
              )}
            </AnimatePresence>
            {ragInfo.chunks.map((chunk, i) => (
              <div
                key={i}
                onClick={() => setExpandedChunk(expandedChunk === i ? null : i)}
                className={`rounded-lg p-3 space-y-2 cursor-pointer transition-all duration-100 ${
                  expandedChunk === i
                    ? 'bg-blue-500/10 ring-1 ring-blue-400/25'
                    : 'bg-muted/15 hover:bg-muted/25'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5"><span className={`w-5 h-5 rounded text-[9px] flex items-center justify-center tabular-nums ${expandedChunk === i ? 'bg-blue-500/20 text-info' : 'bg-blue-500/15 text-info'}`}>{i + 1}</span><span className="text-[9px] text-muted-foreground">相关度</span></div>
                  <div className="h-1.5 w-16 rounded-full bg-accent/30 overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${chunk.score * 100}%` }} /></div>
                  <span className="text-xs text-info tabular-nums">{chunk.score.toFixed(2)}</span>
                </div>
                <p className="text-xs text-foreground/65 leading-[1.65] line-clamp-3">{chunk.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/60"><File size={8} /><span>{chunk.source}</span></div>
                  <Eye size={9} className={`transition-colors ${expandedChunk === i ? 'text-info' : 'text-muted-foreground/30'}`} />
                </div>
              </div>
            ))}
          </div>
        )}
        {subTab === 'process' && (
          <div className="rounded-lg bg-muted/15 overflow-auto [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/20">
            <pre className="px-3 py-2.5 text-[9.5px] leading-[1.7] font-mono">
              {ragInfo.processLog.map((log, i) => <div key={i}>{highlightLine(log)}</div>)}
            </pre>
          </div>
        )}
      </div>
    </FloatingPanel>
  );
}

// ===========================
// Web Search Panel
// ===========================

function WebSearchPanel({ results, onClose, startIndex }: { results: SearchResultItem[]; onClose: () => void; startIndex?: number }) {
  const offset = startIndex ?? 0;
  return (
    <FloatingPanel title="搜索结果" icon={<Globe size={12} className="text-info/70" />} onClose={onClose}>
      <div className="px-4 py-3 space-y-1.5">
        {results.map((r, i) => (
          <div key={i} className="rounded-lg p-2.5 hover:bg-accent/10 transition-colors">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded bg-foreground/[0.08] text-foreground/70 text-[9px] flex items-center justify-center flex-shrink-0 tabular-nums mt-px">{offset + i + 1}</span>
              <div className="flex-1 min-w-0">
                <a href={r.url} target="_blank" rel="noopener noreferrer"
                  className="text-[10.5px] text-foreground/85 hover:text-info transition-colors line-clamp-1 flex items-center gap-1">
                  {r.title}<ExternalLink size={8} className="flex-shrink-0 text-muted-foreground/30" />
                </a>
                <p className="text-[9.5px] text-foreground/55 leading-[1.55] mt-1 line-clamp-3">{r.snippet}</p>
                <div className="flex items-center gap-1.5 mt-1 text-[9px] text-muted-foreground/50"><Globe size={8} /><span>{r.source}</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </FloatingPanel>
  );
}

// ===========================
// Source Citations (inline + preview)
// ===========================

type SourceItem = {
  index: number;
  type: 'rag' | 'search';
  title: string;
  snippet: string;
  source: string;
  url?: string;
  score?: number;
};

function buildSourceMap(msg: AssistantMessage): SourceItem[] {
  const items: SourceItem[] = [];
  if (msg.ragInfo) {
    msg.ragInfo.chunks.forEach((chunk) => {
      items.push({
        index: items.length + 1, type: 'rag',
        title: chunk.source, snippet: chunk.content,
        source: msg.ragInfo!.knowledgeBaseName, score: chunk.score,
      });
    });
  }
  if (msg.searchResults) {
    msg.searchResults.forEach((r) => {
      items.push({
        index: items.length + 1, type: 'search',
        title: r.title, snippet: r.snippet,
        source: r.source, url: r.url,
      });
    });
  }
  return items;
}

/** Inline citation badge with hover popover */
function InlineCitationBadge({ source }: { source: SourceItem }) {
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => { if (timerRef.current) clearTimeout(timerRef.current); setHovered(true); };
  const hide = () => { timerRef.current = setTimeout(() => setHovered(false), 120); };

  return (
    <span className="relative inline-block align-top" onMouseEnter={show} onMouseLeave={hide}>
      <span
        className={`inline-flex items-center justify-center min-w-[16px] h-[15px] px-[3px] rounded text-[8px] tabular-nums ml-[1px] mr-[1px] transition-all duration-100 cursor-default ${
          hovered
            ? source.type === 'rag' ? 'bg-blue-500/25 text-info ring-1 ring-blue-400/30' : 'bg-sky-500/25 text-sky-600 ring-1 ring-sky-400/30'
            : source.type === 'rag' ? 'bg-blue-500/10 text-info/70' : 'bg-sky-500/10 text-sky-500/70'
        }`}
      >{source.index}</span>
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 480, damping: 30 }}
            onMouseEnter={show}
            onMouseLeave={hide}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-50 w-[300px] rounded-xl border border-border/30 bg-popover shadow-2xl shadow-black/10 overflow-hidden"
          >
            <div className="px-3 py-2.5 space-y-1">
              <div className="flex items-start gap-2">
                <span className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-[9px] tabular-nums mt-px ${
                  source.type === 'rag' ? 'bg-blue-500/15 text-info' : 'bg-sky-500/15 text-sky-600'
                }`}>{source.index}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {source.type === 'rag' ? <Database size={9} className="text-info/60 flex-shrink-0" /> : <Globe size={9} className="text-sky-500/60 flex-shrink-0" />}
                    <span className="text-xs text-foreground/80 truncate">{source.title}</span>
                    {source.url && <ExternalLink size={8} className="text-muted-foreground/30 flex-shrink-0" />}
                  </div>
                  {source.score !== undefined && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] text-muted-foreground/50">相关度</span>
                      <div className="h-1 w-12 rounded-full bg-accent/30 overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${source.score * 100}%` }} /></div>
                      <span className="text-[9px] text-info tabular-nums">{source.score.toFixed(2)}</span>
                    </div>
                  )}
                  <p className="text-[9.5px] text-foreground/55 leading-[1.6] mt-1 line-clamp-3">{source.snippet}</p>
                  <div className="flex items-center gap-1 mt-1.5 text-[9px] text-muted-foreground/45">
                    {source.type === 'rag' ? <BookOpen size={8} /> : <Globe size={8} />}
                    <span className="truncate">{source.source}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

/** Parse text and replace [N] markers with inline React citation badges */
function renderInlineWithCitations(
  text: string,
  sources: SourceItem[],
): React.ReactNode[] {
  const parts = text.split(RE_CITATION_SPLIT_PAT);
  const nodes: React.ReactNode[] = [];
  parts.forEach((part, i) => {
    const citMatch = part.match(RE_CITATION_MATCH_PAT);
    if (citMatch) {
      const n = parseInt(citMatch[1], 10);
      const src = sources.find(s => s.index === n);
      if (src) {
        nodes.push(<InlineCitationBadge key={`cit-${i}`} source={src} />);
        return;
      }
    }
    if (part) {
      const html = applyBoldAndCode(part);
      nodes.push(<span key={`txt-${i}`} dangerouslySetInnerHTML={{ __html: html }} />);
    }
  });
  return nodes;
}

// ===========================
// RAG Chunk Detail Preview (in-panel)
// ===========================

function RAGChunkPreview({ chunk, index, onClose }: { chunk: RAGChunk; index: number; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded bg-blue-500/15 text-info text-[9px] flex items-center justify-center tabular-nums">{index}</span>
          <span className="text-xs text-foreground/75">片段 #{index} 详情</span>
        </div>
        <Button variant="ghost" size="icon-xs" onClick={onClose} className="p-1 w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/15"><X size={10} /></Button>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] text-muted-foreground/50">相关度</span>
        <div className="h-1.5 w-20 rounded-full bg-accent/30 overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${chunk.score * 100}%` }} /></div>
        <span className="text-xs text-info tabular-nums">{chunk.score.toFixed(4)}</span>
      </div>
      <div className="rounded-lg bg-muted/15 p-2.5">
        <p className="text-xs text-foreground/70 leading-[1.7] whitespace-pre-wrap">{chunk.content}</p>
      </div>
      <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/50">
        <File size={8} />
        <span>{chunk.source}</span>
      </div>
    </motion.div>
  );
}

// ===========================
// Message Action Bar & Context Menu
// ===========================

function MessageActionBar({ onCopy, onQuote, onDelete, onBookmark, onShare, onInfo, onRetry, ctxMenuOpen, onMore, onCloseCtxMenu, alignRight }: {
  onCopy: () => void;
  onQuote: () => void;
  onDelete: () => void;
  onBookmark: () => void;
  onShare: () => void;
  onInfo?: () => void;
  onRetry?: () => void;
  ctxMenuOpen: boolean;
  onMore: () => void;
  onCloseCtxMenu: () => void;
  alignRight?: boolean;
}) {
  return (
    <div className="flex items-center gap-0.5 mt-1 -ml-1">
      <Tooltip content="复制" side="bottom"><Button variant="ghost" size="icon-xs" onClick={onCopy} className="p-[4px] w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/20"><Copy size={12} /></Button></Tooltip>
      {onRetry && <Tooltip content="重试" side="bottom"><Button variant="ghost" size="icon-xs" onClick={onRetry} className="p-[4px] w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/20"><RotateCcw size={12} /></Button></Tooltip>}
      <Tooltip content="字体" side="bottom"><Button variant="ghost" size="icon-xs" className="p-[4px] w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/20"><Type size={12} /></Button></Tooltip>
      <Tooltip content="@提及" side="bottom"><Button variant="ghost" size="icon-xs" className="p-[4px] w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/20"><AtSign size={12} /></Button></Tooltip>
      <Tooltip content="引用" side="bottom"><Button variant="ghost" size="icon-xs" onClick={onQuote} className="p-[4px] w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/20"><Quote size={12} /></Button></Tooltip>
      <Tooltip content="删除" side="bottom"><Button variant="ghost" size="icon-xs" onClick={onDelete} className="p-[4px] w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/20"><Trash2 size={12} /></Button></Tooltip>
      <Tooltip content="收藏" side="bottom"><Button variant="ghost" size="icon-xs" onClick={onBookmark} className="p-[4px] w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/20"><Bookmark size={12} /></Button></Tooltip>
      <Tooltip content="分享" side="bottom"><Button variant="ghost" size="icon-xs" onClick={onShare} className="p-[4px] w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/20"><Share2 size={12} /></Button></Tooltip>
      {onInfo && <Tooltip content="聊天详情" side="bottom"><Button variant="ghost" size="icon-xs" onClick={onInfo} className="p-[4px] w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/20"><Info size={12} /></Button></Tooltip>}
      <div className="relative">
        <Tooltip content="更多" side="bottom"><Button variant="ghost" size="icon-xs" onClick={onMore} className="p-[4px] w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/20"><MoreHorizontal size={12} /></Button></Tooltip>
        <AnimatePresence>{ctxMenuOpen && <MessageContextMenu onClose={onCloseCtxMenu} onAction={() => {}} alignRight={alignRight} />}</AnimatePresence>
      </div>
    </div>
  );
}

function MessageContextMenu({ onClose, onAction, alignRight }: {
  onClose: () => void;
  onAction: (action: string) => void;
  alignRight?: boolean;
}) {
  const [showExportSub, setShowExportSub] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ openUp: boolean; openLeft: boolean }>({ openUp: true, openLeft: !!alignRight });
  const exportItems = [
    '复制为纯文本（去除 Markdown）', '复制为图片', '导出为图片',
    '导出为 Markdown', '导出��� Markdown（包含思考）', '导出为 Word',
    '导出到 Notion', '导出到 Obsidian', '导出到语雀', '导出到 Joplin', '导出到思源笔记',
  ];

  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const scrollParent = menuRef.current.closest('[class*="overflow-y"]') || document.documentElement;
    const containerRect = scrollParent.getBoundingClientRect();
    const newPos = { openUp: true, openLeft: false };
    if (rect.top < containerRect.top + 8) newPos.openUp = false;
    if (rect.right > containerRect.right - 8) newPos.openLeft = true;
    if (newPos.openUp !== pos.openUp || newPos.openLeft !== pos.openLeft) setPos(newPos);
  }, []);

  return (
    <div>
      <div className="fixed inset-0 z-[60]" onClick={onClose} />
      <motion.div ref={menuRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.08 }}
        className={`absolute z-[60] bg-popover border border-border/40 rounded-lg shadow-xl shadow-black/10 py-1 min-w-[160px] ${pos.openUp ? 'bottom-full mb-1' : 'top-full mt-1'} ${pos.openLeft ? 'right-0' : 'left-0'}`}>
        <Button variant="ghost" size="xs" onClick={() => { onAction('edit'); onClose(); }} className="w-full justify-start gap-2.5 px-3 py-[6px] h-auto text-[10.5px] text-foreground/80 hover:bg-accent/20"><Edit3 size={11} className="text-muted-foreground" /><span>编辑</span></Button>
        <Button variant="ghost" size="xs" onClick={() => { onAction('branch'); onClose(); }} className="w-full justify-start gap-2.5 px-3 py-[6px] h-auto text-[10.5px] text-foreground/80 hover:bg-accent/20"><GitBranch size={11} className="text-muted-foreground" /><span>分支</span></Button>
        <Button variant="ghost" size="xs" onClick={() => { onAction('multiSelect'); onClose(); }} className="w-full justify-start gap-2.5 px-3 py-[6px] h-auto text-[10.5px] text-foreground/80 hover:bg-accent/20"><ListChecks size={11} className="text-muted-foreground" /><span>多选</span></Button>
        <Button variant="ghost" size="xs" onClick={() => { onAction('save'); onClose(); }} className="w-full justify-start gap-2.5 px-3 py-[6px] h-auto text-[10.5px] text-foreground/80 hover:bg-accent/20"><Bookmark size={11} className="text-muted-foreground" /><span>保存</span><ChevronRight size={9} className="ml-auto text-muted-foreground/40" /></Button>
        <div className="relative" onMouseEnter={() => setShowExportSub(true)} onMouseLeave={() => setShowExportSub(false)}>
          <Button variant="ghost" size="xs" className="w-full justify-start gap-2.5 px-3 py-[6px] h-auto text-[10.5px] text-foreground/80 hover:bg-accent/20">
            <Share2 size={11} className="text-muted-foreground" /><span className="flex-1 text-left">导出</span><ChevronRight size={9} className="text-muted-foreground/40" />
          </Button>
          {showExportSub && (
            <ExportSubMenu onAction={onAction} onClose={onClose} exportItems={exportItems} parentOpenLeft={pos.openLeft} />
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ExportSubMenu({ onAction, onClose, exportItems, parentOpenLeft }: {
  onAction: (action: string) => void;
  onClose: () => void;
  exportItems: string[];
  parentOpenLeft: boolean;
}) {
  const subRef = useRef<HTMLDivElement>(null);
  const [openLeft, setOpenLeft] = useState(parentOpenLeft);

  useEffect(() => {
    if (!subRef.current) return;
    const rect = subRef.current.getBoundingClientRect();
    const scrollParent = subRef.current.closest('[class*="overflow-y"]') || document.documentElement;
    const containerRect = scrollParent.getBoundingClientRect();
    if (rect.right > containerRect.right - 8) setOpenLeft(true);
  }, []);

  return (
    <motion.div ref={subRef} initial={{ opacity: 0, x: openLeft ? 4 : -4 }} animate={{ opacity: 1, x: 0 }}
      className={`absolute top-0 bg-popover border border-border/40 rounded-lg shadow-xl shadow-black/10 py-1 min-w-[220px] z-[70] ${openLeft ? 'right-full mr-1' : 'left-full ml-1'}`}>
      {exportItems.map((item, i) => (
        <Button variant="ghost" size="xs" key={i} onClick={() => { onAction(`export-${i}`); onClose(); }}
          className="w-full justify-start gap-2 px-3 py-[5px] h-auto text-[10.5px] text-foreground/80 hover:bg-accent/20"><span>{item}</span></Button>
      ))}
    </motion.div>
  );
}

// ===========================
// Chat Message Bubble (Enhanced)
// ===========================

function MessageBubble({ msg, onOpenPanel, onAvatarClick, onOpenArtifact, assistantEmoji, assistantName, modelDisplayName }: {
  msg: AssistantMessage;
  onOpenPanel: (panel: 'chatDetail' | 'rag' | 'search', msg: AssistantMessage) => void;
  onAvatarClick: () => void;
  onOpenArtifact?: (artifact: ArtifactData) => void;
  assistantEmoji?: string;
  assistantName?: string;
  modelDisplayName?: string;
}) {
  const [ctxMenu, setCtxMenu] = useState(false);
  const handleCopy = () => { copyToClipboard(msg.content); };

  const sources = useMemo(() => buildSourceMap(msg), [msg]);
  const hasCitations = sources.length > 0;

  // === User Message ===
  if (msg.role === 'user') {
    return (
      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="flex justify-end">
        <div className="max-w-[85%]">
          {/* Attachments above bubble */}
          {msg.attachments && msg.attachments.length > 0 && (
            <div className="flex justify-end mb-1">
              <AttachmentList attachments={msg.attachments} />
            </div>
          )}
          <div className="px-3.5 py-2.5 rounded-[14px] rounded-br-[4px] bg-foreground text-background text-xs leading-[1.65]">
            {msg.content}
          </div>
          <MessageActionBar
            onCopy={handleCopy} onQuote={() => {}} onDelete={() => {}} onBookmark={() => {}} onShare={() => {}}
            ctxMenuOpen={ctxMenu} onMore={() => setCtxMenu(true)} onCloseCtxMenu={() => setCtxMenu(false)}
            alignRight
          />
        </div>
      </motion.div>
    );
  }

  // === Parallel Responses ===
  if (msg.parallelResponses && msg.parallelResponses.length > 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="flex gap-2.5 max-w-[95%]">
        <Tooltip content="查看助手信息" side="left"><Button variant="ghost" size="icon-xs" onClick={onAvatarClick} className="w-6 h-6 rounded-[6px] bg-accent/40 hover:bg-accent/60 mt-[1px]">
          <Bot size={12} className="text-muted-foreground" />
        </Button></Tooltip>
        <div className="flex-1 min-w-0">
          <ParallelResponsesBlock responses={msg.parallelResponses} />
          <MessageActionBar
            onCopy={handleCopy} onQuote={() => {}} onDelete={() => {}} onBookmark={() => {}} onShare={() => {}}
            onRetry={() => {}}
            ctxMenuOpen={ctxMenu} onMore={() => setCtxMenu(true)} onCloseCtxMenu={() => setCtxMenu(false)}
          />
        </div>
      </motion.div>
    );
  }

  // === Regular Assistant Message ===
  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="flex gap-2.5 max-w-[95%]">
      <Tooltip content="查看助手信息" side="left"><Button variant="ghost" size="icon-xs" onClick={onAvatarClick} className="w-6 h-6 rounded-[6px] bg-accent/40 hover:bg-accent/60 mt-[1px] text-sm leading-none">
        {(msg.assistantLabel && ASSISTANT_EMOJI_MAP[msg.assistantLabel]) || assistantEmoji || <Bot size={12} className="text-muted-foreground" />}
      </Button></Tooltip>
      <div className="flex-1 min-w-0">
        {/* Assistant name + model */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-xs text-foreground/70">{msg.assistantLabel || assistantName || '助手'}</span>
          {modelDisplayName && <span className="text-[9px] text-muted-foreground/35">{modelDisplayName}</span>}
        </div>

        {/* Thinking block */}
        {msg.thinking && <ThinkingBlock content={msg.thinking} />}

        {/* Content */}
        <div className="text-xs text-foreground/90 leading-[1.75] py-1">
          {msg.content.split('\n').map((line, i) => {
            if (line.startsWith('- **')) {
              const match = line.match(RE_DASH_BOLD);
              if (match) {
                if (hasCitations) {
                  return <div key={i} className="flex items-start gap-1.5 py-0.5"><span className="text-muted-foreground/40 mt-px">-</span><span>{renderInlineWithCitations(`**${match[1]}**${match[2]}`, sources)}</span></div>;
                }
                return <div key={i} className="flex items-start gap-1.5 py-0.5"><span className="text-muted-foreground/40 mt-px">-</span><span><span className="text-foreground">{match[1]}</span>{match[2]}</span></div>;
              }
            }
            if (RE_NUM_TEST.test(line)) {
              const num = line.match(RE_NUM_MATCH);
              if (num) {
                if (hasCitations) {
                  return <div key={i} className="flex items-start gap-1.5 py-0.5"><span className="text-muted-foreground/40 w-3 text-right flex-shrink-0">{num[1]}.</span><span>{renderInlineWithCitations(num[2], sources)}</span></div>;
                }
                return <div key={i} className="flex items-start gap-1.5 py-0.5"><span className="text-muted-foreground/40 w-3 text-right flex-shrink-0">{num[1]}.</span><span dangerouslySetInnerHTML={{ __html: applyBoldAndCode(num[2]) }} /></div>;
              }
            }
            if (line.trim() === '') return <div key={i} className="h-1.5" />;
            if (hasCitations) {
              return <p key={i}>{renderInlineWithCitations(line, sources)}</p>;
            }
            return <p key={i} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>').replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-muted/50 text-[9px] font-mono">$1</code>') }} />;
          })}
        </div>

        {/* Inline code block */}
        {msg.codeBlock && <InlineCodeBlock language={msg.codeBlock.language} code={msg.codeBlock.code} />}

        {/* Mermaid diagram */}
        {msg.mermaidCode && <MermaidBlock code={msg.mermaidCode} />}

        {/* Generated images */}
        {msg.images && msg.images.length > 0 && <ImageGallery images={msg.images} />}

        {/* Artifact indicator — clickable to open preview */}
        {msg.artifact && (
          <Button variant="ghost" size="xs"
            onClick={() => onOpenArtifact?.(msg.artifact!)}
            className="mt-2 mb-1 w-full justify-start gap-2 px-2.5 py-[6px] h-auto rounded-lg bg-accent/20 border border-border/25 text-xs text-foreground/70 hover:bg-accent/30 hover:border-border/40 group"
          >
            <Layers size={10} className="text-cherry-primary flex-shrink-0" />
            <span className="flex-1 truncate">{msg.artifact.title}</span>
            <span className="text-[9px] text-muted-foreground/50">{msg.artifact.type === 'document' ? '文档' : msg.artifact.type === 'code' ? '代码' : '预览'}</span>
            <ExternalLink size={9} className="text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors flex-shrink-0" />
          </Button>
        )}

        {/* Triggered indicators */}
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {msg.ragInfo && (
            <Button variant="ghost" size="xs" onClick={() => onOpenPanel('rag', msg)}
              className="gap-1 px-2 py-[3px] h-auto rounded-md text-[9px] text-info/60 bg-blue-500/8 hover:bg-blue-500/15 hover:text-info">
              <Database size={9} /><span>知识库 · {msg.ragInfo.chunks.length} 条</span>
            </Button>
          )}
          {msg.searchResults && msg.searchResults.length > 0 && (
            <Button variant="ghost" size="xs" onClick={() => onOpenPanel('search', msg)}
              className="gap-1 px-2 py-[3px] h-auto rounded-md text-[9px] text-cherry-text-muted bg-cherry-active-bg hover:bg-cherry-active-border hover:text-cherry-primary-dark">
              <Globe size={9} /><span>搜索 · {msg.searchResults.length} 条</span>
            </Button>
          )}
        </div>

        {/* Action bar */}
        <MessageActionBar
          onCopy={handleCopy} onQuote={() => {}} onDelete={() => {}} onBookmark={() => {}} onShare={() => {}}
          onRetry={() => {}}
          onInfo={msg.metadata ? () => onOpenPanel('chatDetail', msg) : undefined}
          ctxMenuOpen={ctxMenu} onMore={() => setCtxMenu(true)} onCloseCtxMenu={() => setCtxMenu(false)}
        />
      </div>
    </motion.div>
  );
}

// ===========================
// Multi-Select Picker
// ===========================

// CAP_ICONS / CAP_TAG_ICONS moved to shared ModelPickerPanel

// ===========================
// Topic Breadcrumb (fixed label)
// ===========================

function TopicBreadcrumb({ activeTopic }: {
  activeTopic: AssistantTopic;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <ChevronRight size={10} className="text-muted-foreground/30 flex-shrink-0" />
      <div className="flex items-center gap-1 px-1.5 py-[3px] text-[9.5px] text-foreground/55 max-w-[220px]">
        <MessageCircle size={9} className="text-muted-foreground/50 flex-shrink-0" />
        <span className="truncate">{activeTopic.title}</span>
      </div>
    </div>
  );
}

type SelectMode = 'assistant' | 'model';

function MultiSelectPicker({
  mode, selectedAssistants, selectedModels, onSelectAssistant, onSelectModel, onChangeMode,
  multiAssistant, multiModel, onToggleMultiAssistant, onToggleMultiModel,
  onCreateAssistant,
}: {
  mode: SelectMode;
  selectedAssistants: string[];
  selectedModels: string[];
  onSelectAssistant: (id: string) => void;
  onSelectModel: (id: string) => void;
  onChangeMode: (m: SelectMode) => void;
  multiAssistant: boolean;
  multiModel: boolean;
  onToggleMultiAssistant: () => void;
  onToggleMultiModel: () => void;
  onCreateAssistant?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const activeAssistant = MOCK_ASSISTANTS.find(a => a.id === selectedAssistants[0]);
  const activeModel = ASSISTANT_MODELS.find(m => m.id === selectedModels[0]);

  const handleOpenAssistant = () => {
    const nextOpen = !(open && mode === 'assistant');
    setOpen(nextOpen);
    onChangeMode('assistant');
  };

  const handleOpenModel = () => {
    const nextOpen = !(open && mode === 'model');
    setOpen(nextOpen);
    onChangeMode('model');
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative">
        <Button variant="ghost" size="xs" onClick={handleOpenAssistant}
          className={`gap-1.5 px-2 py-[4px] h-auto text-[10.5px] ${
            open && mode === 'assistant' ? 'bg-accent/25 text-foreground' : 'text-foreground/75 hover:text-foreground hover:bg-accent/15'
          }`}>
          <span className="text-sm leading-none flex-shrink-0">{activeAssistant ? (ASSISTANT_EMOJI_MAP[activeAssistant.name] || '\uD83E\uDD16') : '\uD83E\uDD16'}</span>
          <span className="truncate max-w-[100px]">
            {selectedAssistants.length > 1 ? `${selectedAssistants.length} 个助手` : activeAssistant?.name || '选择助手'}
          </span>
          {selectedAssistants.length > 1 && <span className="w-4 h-4 rounded-full bg-foreground/10 text-foreground/60 text-[8px] flex items-center justify-center flex-shrink-0">{selectedAssistants.length}</span>}
          <ChevronDown size={8} className={`text-muted-foreground/50 flex-shrink-0 transition-transform duration-100 ${open && mode === 'assistant' ? 'rotate-180' : ''}`} />
        </Button>
        <AnimatePresence>
          {open && mode === 'assistant' && (
            <div>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <motion.div initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: 0.1 }}
                className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border/40 rounded-lg shadow-xl shadow-black/10 overflow-hidden max-h-[380px]">
                <AssistantPickerPanel
                  selectedAssistants={selectedAssistants}
                  onSelectAssistant={onSelectAssistant}
                  multiAssistant={multiAssistant}
                  onToggleMultiAssistant={onToggleMultiAssistant}
                  onClose={() => setOpen(false)}
                  onCreateAssistant={onCreateAssistant}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
      <div className="w-px h-3.5 bg-border/25" />
      <div className="relative">
        <Button variant="ghost" size="xs" onClick={handleOpenModel}
          className={`gap-1 px-1.5 py-[3px] h-auto text-[9.5px] ${
            open && mode === 'model' ? 'bg-accent/25 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/15'
          }`}>
          <Sparkles size={9} className="text-muted-foreground/50" />
          <span className="truncate max-w-[160px]">
            {selectedModels.length > 1 ? `${selectedModels.length} 个模型` : activeModel?.name || '选择模型'}
          </span>
          {selectedModels.length > 1 && <span className="w-4 h-4 rounded-full bg-foreground/10 text-foreground/60 text-[8px] flex items-center justify-center flex-shrink-0">{selectedModels.length}</span>}
          <ChevronDown size={7} className={`text-muted-foreground/50 transition-transform duration-100 ${open && mode === 'model' ? 'rotate-180' : ''}`} />
        </Button>
        <AnimatePresence>
          {open && mode === 'model' && (
            <div>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <motion.div initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: 0.1 }}
                className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border/40 rounded-lg shadow-xl shadow-black/8 w-[380px]"
                >
                <ModelPickerPanel
                  selectedModels={selectedModels}
                  onSelectModel={onSelectModel}
                  multiModel={multiModel}
                  onToggleMultiModel={onToggleMultiModel}
                  onClose={() => setOpen(false)}
                  initialProvider={activeModel?.provider}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ===========================
// Assistant Run Page
// ===========================

export function AssistantRunPage() {
  const { editAssistantInLibrary: onEditAssistantInLibrary, navigateToKnowledge: onNavigateToKnowledge, navigateToLibrary: _navLib, changeTabTitle: onTabTitleChange, openSettings: onOpenSettings } = useGlobalActions();
  const onNavigateToLibrary = () => _navLib('assistant');
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState('');



  // Multi-select state
  const [selectMode, setSelectMode] = useState<SelectMode>('assistant');
  const [selectedAssistants, setSelectedAssistants] = useState<string[]>(['ast-1']);
  const [selectedModels, setSelectedModels] = useState<string[]>(['gemini-3-pro-image']);
  const [multiAssistant, setMultiAssistant] = useState(false);
  const [multiModel, setMultiModel] = useState(false);

  // Topics
  const [topics, setTopics] = useState<AssistantTopic[]>(MOCK_TOPICS);
  const [activeTopicId, setActiveTopicId] = useState<string | null>('new-topic-init');
  const [newTopicCounter, setNewTopicCounter] = useState(1);

  // Ensure there's always an initial "新话题"
  useEffect(() => {
    if (!topics.find(t => t.id === 'new-topic-init')) {
      setTopics(prev => [{
        id: 'new-topic-init',
        title: '新话题',
        assistantName: '通用助手',
        lastMessage: '',
        timestamp: '刚刚',
        messageCount: 0,
        status: 'active' as const,
      }, ...prev]);
    }
  }, []);

  const activeTopic = useMemo(() => topics.find(t => t.id === activeTopicId), [topics, activeTopicId]);

  const handleNewTopic = useCallback(() => {
    // If the active topic is already a new/empty topic, don't create another
    if (activeTopic && activeTopic.title === '\u65b0\u8bdd\u9898' && activeTopic.messageCount === 0) {
      return;
    }
    // Check if there's any existing empty new topic — switch to it instead
    const existingNew = topics.find(t => t.title === '\u65b0\u8bdd\u9898' && t.messageCount === 0);
    if (existingNew) {
      setActiveTopicId(existingNew.id);
      setMessages([]);
      setActiveArtifact(null);
      setShowArtifacts(false);
      setArtifactFullscreen(false);
      setRightPanel(null);
      setShowBranchTree(false);
      setShowChatSettings(false);
      return;
    }
    const newId = `new-topic-${Date.now()}-${newTopicCounter}`;
    const newTopic: AssistantTopic = {
      id: newId,
      title: '新话题',
      assistantName: '通用助手',
      lastMessage: '',
      timestamp: '刚刚',
      messageCount: 0,
      status: 'active' as const,
    };
    setTopics(prev => [newTopic, ...prev]);
    setActiveTopicId(newId);
    setMessages([]);
    setActiveArtifact(null);
    setShowArtifacts(false);
    setArtifactFullscreen(false);
    setRightPanel(null);
    setShowBranchTree(false);
    setShowChatSettings(false);
    setNewTopicCounter(c => c + 1);
  }, [newTopicCounter]);

  // Sync topic name to tab title
  useEffect(() => {
    if (onTabTitleChange) {
      onTabTitleChange(activeTopic ? activeTopic.title : '聊天');
    }
  }, [activeTopic, onTabTitleChange]);

  // Panels
  const [showArtifacts, setShowArtifacts] = useState(false);
  const [artifactFullscreen, setArtifactFullscreen] = useState(false);
  const [artifactPanelWidth, setArtifactPanelWidth] = useState(420);
  const artifactResizing = useRef(false);
  const artifactContainerRef = useRef<HTMLDivElement>(null);

  const handleArtifactResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    artifactResizing.current = true;
    const startX = e.clientX;
    const startW = artifactPanelWidth;
    const onMove = (ev: MouseEvent) => {
      if (!artifactResizing.current) return;
      const containerRect = artifactContainerRef.current?.getBoundingClientRect();
      const maxW = containerRect ? containerRect.width * 0.65 : 800;
      const newW = Math.max(280, Math.min(maxW, startW - (ev.clientX - startX)));
      setArtifactPanelWidth(newW);
    };
    const onUp = () => {
      artifactResizing.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [artifactPanelWidth]);
  const historySidebar = useHistorySidebar('compact');
  const [showBranchTree, setShowBranchTree] = useState(false);
  const [showChatSettings, setShowChatSettings] = useState(false);

  type RightPanel = null | 'assistantInfo' | 'chatDetail' | 'rag' | 'search';
  const [rightPanel, setRightPanel] = useState<RightPanel>(null);
  const [historyInitialAssistant, setHistoryInitialAssistant] = useState<string | null>(null);
  const [inspectedMsg, setInspectedMsg] = useState<AssistantMessage | null>(null);

  const currentAssistant = useMemo(() => MOCK_ASSISTANTS.find(a => a.id === selectedAssistants[0]) || MOCK_ASSISTANTS[0], [selectedAssistants]);
  const currentModel = useMemo(() => ASSISTANT_MODELS.find(m => m.id === selectedModels[0]) || ASSISTANT_MODELS[0], [selectedModels]);
  const currentAssistantEmoji = ASSISTANT_EMOJI_MAP[currentAssistant.name] || '🤖';
  const currentModelDisplayName = currentModel.name.split('/').pop() || currentModel.name;

  // Multi-select handlers
  const handleSelectAssistant = useCallback((id: string) => {
    if (multiAssistant) {
      setSelectedAssistants(prev => {
        if (prev.includes(id)) {
          if (prev.length === 1) return prev;
          return prev.filter(x => x !== id);
        }
        return [...prev, id];
      });
    } else {
      setSelectedAssistants([id]);
    }
  }, [multiAssistant]);

  const handleSelectModel = useCallback((id: string) => {
    if (multiModel) {
      setSelectedModels(prev => {
        if (prev.includes(id)) {
          if (prev.length === 1) return prev;
          return prev.filter(x => x !== id);
        }
        return [...prev, id];
      });
    } else {
      setSelectedModels([id]);
    }
  }, [multiModel]);

  const handleToggleMultiAssistant = useCallback(() => {
    setMultiAssistant(prev => {
      if (!prev) {
        // Turning on multi-assistant → turn off multi-model, keep only first model
        setMultiModel(false);
        setSelectedModels(m => [m[0]]);
      } else {
        // Turning off → keep only first assistant
        setSelectedAssistants(a => [a[0]]);
      }
      return !prev;
    });
  }, []);

  const handleToggleMultiModel = useCallback(() => {
    setMultiModel(prev => {
      if (!prev) {
        // Turning on multi-model → turn off multi-assistant, keep only first assistant
        setMultiAssistant(false);
        setSelectedAssistants(a => [a[0]]);
      } else {
        // Turning off → keep only first model
        setSelectedModels(m => [m[0]]);
      }
      return !prev;
    });
  }, []);

  const handleDeleteTopic = useCallback((id: string) => {
    setTopics(prev => prev.filter(t => t.id !== id));
    if (activeTopicId === id) handleNewTopic();
  }, [activeTopicId, handleNewTopic]);

  const handleUpdateTopic = useCallback((id: string, updates: Partial<AssistantTopic>) => {
    setTopics(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const handleSelectTopic = useCallback((id: string) => {
    setActiveTopicId(id);
    // Reset UI state for a clean topic view
    setActiveArtifact(null);
    setShowArtifacts(false);
    setArtifactFullscreen(false);
    setRightPanel(null);
    setShowBranchTree(false);
    setShowChatSettings(false);
    // Load parallel messages for the multi-model / multi-assistant topics
    if (id === 'topic-11') {
      setMessages(MOCK_PARALLEL_MESSAGES);
    } else if (id === 'topic-39') {
      setMessages(MOCK_MULTI_ASSISTANT_MESSAGES);
    } else {
      setMessages(MOCK_MESSAGES);
    }
  }, []);

  // Active artifact — opened by clicking artifact indicators in messages
  const [activeArtifact, setActiveArtifact] = useState<ArtifactData | null>(null);

  const handleOpenArtifact = useCallback((artifact: ArtifactData) => {
    setActiveArtifact(artifact);
    setShowArtifacts(true);
    setArtifactFullscreen(false);
  }, []);

  const handleCloseArtifacts = useCallback(() => {
    setShowArtifacts(false);
    setArtifactFullscreen(false);
  }, []);

  // Header file history dropdown
  const [showHeaderFileHistory, setShowHeaderFileHistory] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Plus & @ menu state
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showPlusMore, setShowPlusMore] = useState(false);
  const [showAtMenu, setShowAtMenu] = useState(false);
  const plusBtnRef = useRef<HTMLButtonElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);

  const plusMenuItems = [
    { id: 'attach', label: '添加图片或附件', icon: Paperclip, separator: true },
    { id: 'genimg', label: '生成图片', icon: ImageIcon },
    { id: 'reasoning', label: '推理', icon: Brain },
    { id: 'websearch', label: '网络搜索', icon: Globe },
    { id: 'knowledge', label: '知识库', icon: BookOpen },
    { id: 'mcp', label: 'MCP', icon: Hammer },
    { id: 'webcontext', label: '网页上下文', icon: Link },
  ];
  const plusMenuSecondary = [
    { id: 'quickphrase', label: '快捷短语', icon: Zap, shortcut: null as string | null },
    { id: 'expand', label: '展开输入框', icon: Maximize2, shortcut: '⌘⇧E' },
    { id: 'clearctx', label: '清除上下文', icon: RotateCcw, shortcut: '⌘K' },
  ];
  useEffect(() => {
    if (!showPlusMenu) return;
    const handler = (e: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target as Node) &&
          plusBtnRef.current && !plusBtnRef.current.contains(e.target as Node)) {
        setShowPlusMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPlusMenu]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    const ts = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const activeModel = ASSISTANT_MODELS.find(m => m.id === selectedModels[0]) || ASSISTANT_MODELS[0];

    setMessages(prev => [...prev, { id: `msg-${Date.now()}`, role: 'user', content: input.trim(), timestamp: ts }]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // Simulate response
    const respondingAssistants = selectedAssistants.length > 1 ? selectedAssistants : [selectedAssistants[0]];
    const respondingModels = selectedModels.length > 1 ? selectedModels : [selectedModels[0]];

    if (respondingAssistants.length > 1) {
      // Multi-assistant parallel
      const parallelResps: ParallelResponse[] = respondingAssistants.map((astId, idx) => {
        const ast = MOCK_ASSISTANTS.find(a => a.id === astId);
        return {
          id: `pr-${Date.now()}-${idx}`,
          assistantName: ast?.name,
          modelName: ast?.model?.split('/').pop() || 'Unknown',
          modelProvider: ast?.modelProvider || 'Unknown',
          content: `[${ast?.name}] 收到你的请求，正在处理中...\n\n这是来自 ${ast?.name} 的回答，基于 ${ast?.model} 模型。`,
          timestamp: ts,
          duration: `${(2 + idx * 1.5).toFixed(1)}s`,
          tokens: { input: 128 + idx * 32, output: 64 + idx * 16 },
        };
      });
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: '',
          timestamp: ts,
          parallelResponses: parallelResps,
        }]);
      }, 800);
    } else if (respondingModels.length > 1) {
      // Multi-model parallel
      const parallelResps: ParallelResponse[] = respondingModels.map((modelId, idx) => {
        const mdl = ASSISTANT_MODELS.find(m => m.id === modelId);
        return {
          id: `pr-${Date.now()}-${idx}`,
          modelName: mdl?.name || 'Unknown',
          modelProvider: mdl?.provider || 'Unknown',
          content: `这是来自 ${mdl?.name} 的回答。\n\n模型分析了你的请求，以下是回复...`,
          thinking: idx === 0 ? '分析用户输入...\n确定回答策略...\n生成回复内容...' : undefined,
          timestamp: ts,
          duration: `${(3 + idx * 1.2).toFixed(1)}s`,
          tokens: { input: 256, output: 128 + idx * 48, thinking: idx === 0 ? 64 : undefined },
        };
      });
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: '',
          timestamp: ts,
          parallelResponses: parallelResps,
        }]);
      }, 800);
    } else {
      // Single response with thinking
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: '收到，正在为你处理中...',
          timestamp: ts,
          thinking: '分析用户的请求内容...\n确定最佳回答策略...\n准备生成回复...',
          metadata: {
            sessionId: `sess-${Date.now()}`,
            model: activeModel.name,
            status: 'success',
            startTime: new Date().toLocaleString(),
            duration: '2.3s',
            tokens: { input: 128, output: 64, thinking: 32 },
            requestJson: '{}',
            responseJson: '{}',
          },
        }]);
      }, 800);
    }
  }, [input, selectedModels, selectedAssistants]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && showAtMenu) { e.preventDefault(); setShowAtMenu(false); return; }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    // Detect @ typed at end of input (or after a space)
    if (val.length > input.length) {
      const lastChar = val.charAt(val.length - 1);
      if (lastChar === '@') {
        const charBefore = val.length >= 2 ? val.charAt(val.length - 2) : ' ';
        if (charBefore === ' ' || charBefore === '\n' || val.length === 1) {
          setShowAtMenu(true);
          setShowPlusMenu(false);
          // Remove the @ from input
          setInput(val.slice(0, -1));
          return;
        }
      }
    }
    setInput(val);
    const el = e.target; el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  };

  const handleOpenPanel = useCallback((panel: 'chatDetail' | 'rag' | 'search', msg: AssistantMessage) => {
    setInspectedMsg(msg);
    setRightPanel(panel);
  }, []);

  const handleAvatarClick = useCallback(() => {
    setRightPanel(rightPanel === 'assistantInfo' ? null : 'assistantInfo');
  }, [rightPanel]);

  const hasMessages = messages.length > 0;
  const hasModels = ASSISTANT_MODELS.length > 0;

  if (!hasModels) {
    return (
      <div className="flex flex-col h-full bg-background select-none relative">
        <EmptyState
          preset="no-model"
          description="请先前往设置页面添加模型服务商并启用模型，才能开始对话"
          actionLabel="前往设置"
          onAction={onOpenSettings}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background select-none relative">
      {/* ===== Left: History Sidebar (compact) ===== */}
      <AnimatePresence initial={false}>
        {historySidebar.isCompact && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="flex-shrink-0 min-w-0 overflow-hidden h-full"
            style={{ width: 220 }}
          >
            <HistorySidebar
              items={topics}
              activeItemId={activeTopicId}
              onSelectItem={handleSelectTopic}
              onDeleteItem={handleDeleteTopic}
              onUpdateItem={handleUpdateTopic}
              onNewItem={handleNewTopic}
              onExpand={() => { setHistoryInitialAssistant(null); historySidebar.expand(); }}
              onHide={historySidebar.hide}
              entityLabel="话题"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Right: Header + Content ===== */}
      <div className="flex flex-col flex-1 min-w-0 relative">
        {/* ===== Header ===== */}
        <header className="flex items-center px-3 flex-shrink-0 h-[40px]">
          {/* History sidebar toggle */}
          <Tooltip content={historySidebar.isCompact ? '收起话题列表' : '展开话题列表'} side="bottom">
            <Button variant="ghost" size="icon-xs" onClick={() => historySidebar.toggle()}
              className={`p-1.5 w-auto h-auto mr-1 ${historySidebar.isCompact ? 'text-foreground/60 hover:text-foreground hover:bg-accent/15' : 'text-foreground/35 hover:text-foreground/60 hover:bg-accent/15'}`}>
              <History size={13} />
            </Button>
          </Tooltip>
          <MultiSelectPicker
          mode={selectMode}
          selectedAssistants={selectedAssistants}
          selectedModels={selectedModels}
          onSelectAssistant={handleSelectAssistant}
          onSelectModel={handleSelectModel}
          onChangeMode={setSelectMode}
          multiAssistant={multiAssistant}
          multiModel={multiModel}
          onToggleMultiAssistant={handleToggleMultiAssistant}
          onToggleMultiModel={handleToggleMultiModel}
          onCreateAssistant={onNavigateToLibrary}
        />
        {activeTopic && (
          <TopicBreadcrumb
            activeTopic={activeTopic}
          />
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-0.5">
          {(selectedAssistants.length > 1 || selectedModels.length > 1) && (
            <span className="text-[9px] text-foreground/60 bg-accent/30 px-2 py-[2px] rounded-md mr-1">
              并行 {selectedAssistants.length > 1 ? `${selectedAssistants.length} 助手` : `${selectedModels.length} 模型`}
            </span>
          )}
          <Tooltip content="新建话题" side="bottom"><Button variant="ghost" size="icon-xs" onClick={handleNewTopic} className="p-1.5 w-auto h-auto text-muted-foreground hover:text-foreground hover:bg-accent/15">
            <MessageCirclePlus size={13} />
          </Button></Tooltip>
          {hasMessages && (
            <>
              <div className="relative">
                <Tooltip content="历史文件" side="bottom"><Button variant="ghost" size="icon-xs" onClick={() => setShowHeaderFileHistory(v => !v)}
                  className={`p-1.5 w-auto h-auto ${showHeaderFileHistory ? 'text-foreground/80 bg-accent/25' : 'text-muted-foreground hover:text-foreground hover:bg-accent/15'}`}>
                  <File size={12} />
                </Button></Tooltip>
                <AnimatePresence>
                  {showHeaderFileHistory && (
                    <FileHistoryDropdown
                      onSelect={(a) => { handleOpenArtifact(a); }}
                      onClose={() => setShowHeaderFileHistory(false)}
                      anchorRight
                      selectedTitle={activeArtifact?.title}
                      hasTopic={activeTopicId !== null}
                    />
                  )}
                </AnimatePresence>
              </div>
              <Tooltip content="分支管理" side="bottom"><Button variant="ghost" size="icon-xs" onClick={() => setShowBranchTree(!showBranchTree)}
                className={`p-1.5 w-auto h-auto ${showBranchTree ? 'text-foreground/80 bg-accent/25' : 'text-muted-foreground hover:text-foreground hover:bg-accent/15'}`}>
                <GitFork size={12} />
              </Button></Tooltip>
              <div className="w-px h-3.5 bg-border/25 mx-0.5" />
            </>
          )}
          <Tooltip content="参数设置" side="bottom"><Button variant="ghost" size="icon-xs" onClick={() => setShowChatSettings(v => !v)}
            className={`p-1.5 w-auto h-auto ${showChatSettings ? 'text-foreground/80 bg-accent/25' : 'text-muted-foreground hover:text-foreground hover:bg-accent/15'}`}>
            <SlidersHorizontal size={12} />
          </Button></Tooltip>
        </div>
      </header>

      {/* ===== Main Content ===== */}
      <div ref={artifactContainerRef} className="flex flex-1 min-h-0 relative">
        {/* Fullscreen Artifacts */}
        <AnimatePresence>
          {artifactFullscreen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="absolute inset-0 z-30 bg-background p-2">
              <div className="h-full rounded-2xl border border-border/30 bg-background shadow-lg overflow-hidden">
                <ArtifactsPanel artifact={activeArtifact} isFullscreen={true} onToggleFullscreen={() => setArtifactFullscreen(false)} onClose={handleCloseArtifacts} onSelectArtifact={handleOpenArtifact} hasTopic={activeTopicId !== null} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center: Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatInterface
            scrollDeps={[messages]}
            onSendMessage={() => handleSend()}
            hasMessages={hasMessages}
            messageListClassName="px-5"
            emptyState={
              <div className="flex-1 flex flex-col items-center justify-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                  className="flex flex-col items-center max-w-[360px] w-full">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-accent/60 to-accent/30 border border-border/30 flex items-center justify-center mb-5">
                    <Bot size={22} strokeWidth={1.3} className="text-foreground/40" />
                  </div>
                  <h2 className="text-sm text-foreground tracking-[-0.01em]">你好，有什么需要帮助的？</h2>
                  <p className="text-xs text-muted-foreground/60 text-center leading-[1.6] mt-1.5">
                    向 {currentAssistant.name} 提问，支持生成文章、代码和可视化内���
                  </p>
                </motion.div>
              </div>
            }
            customComposer={
              <div className="flex-shrink-0 px-4 pb-3">
                <div className="relative rounded-xl border border-border/50 bg-background shadow-sm focus-within:border-border/80 transition-all duration-150">
                  {/* Plus Menu Popover */}
                  {showPlusMenu && (
                    <div ref={plusMenuRef}
                      className="absolute bottom-full left-0 mb-2 w-44 bg-popover border border-border rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                      <div className="px-1 flex flex-col">
                        {plusMenuItems.map((item, idx) => {
                          const Icon = item.icon;
                          return (
                            <div key={item.id}>
                              <Button variant="ghost" size="xs" onClick={() => setShowPlusMenu(false)}
                                className="w-full justify-start gap-2 px-2 py-[5px] h-auto text-xs text-popover-foreground hover:bg-accent/50">
                                <Icon size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
                                <span className="flex-1 text-left">{item.label}</span>
                              </Button>
                              {(item as { separator?: boolean }).separator && idx < plusMenuItems.length - 1 && (
                                <div className="my-0.5 mx-1.5 border-t border-border/60" />
                              )}
                            </div>
                          );
                        })}
                        <div className="my-0.5 mx-1.5 border-t border-border/60" />
                        <div className="relative">
                          <Button variant="ghost" size="xs" onMouseEnter={() => setShowPlusMore(true)} onMouseLeave={() => setShowPlusMore(false)}
                            className="w-full justify-start gap-2 px-2 py-[5px] h-auto text-xs text-muted-foreground hover:text-popover-foreground hover:bg-accent/50">
                            <MoreHorizontal size={13} strokeWidth={1.5} className="flex-shrink-0" />
                            <span className="flex-1 text-left">更多</span>
                            <ChevronRight size={12} />
                          </Button>
                          {showPlusMore && (
                            <div onMouseEnter={() => setShowPlusMore(true)} onMouseLeave={() => setShowPlusMore(false)}
                              className="absolute left-full bottom-0 ml-1.5 w-40 bg-popover border border-border rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-left-1 duration-100">
                              <div className="px-1 flex flex-col">
                                {plusMenuSecondary.map(item => {
                                  const Icon = item.icon;
                                  return (
                                    <Button variant="ghost" size="xs" key={item.id} onClick={() => { setShowPlusMenu(false); setShowPlusMore(false); }}
                                      className="w-full justify-start gap-2 px-2 py-[5px] h-auto text-xs text-popover-foreground hover:bg-accent/50">
                                      <Icon size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
                                      <span className="flex-1 text-left">{item.label}</span>
                                      {item.shortcut && <span className="text-[9px] text-muted-foreground/60 tracking-wider">{item.shortcut}</span>}
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <textarea
                    ref={textareaRef} value={input} onChange={handleInput} onKeyDown={handleKeyDown}
                    placeholder="在这里输入消息，按 Enter 发送 - @ 选择助手/模型"
                    rows={1}
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none min-h-[36px] max-h-[140px] leading-[1.6] px-3.5 pt-[10px] pb-[36px]"
                  />
                  {/* @ Mention Picker */}
                  {showAtMenu && (
                    <AtMentionPicker
                      selectedAssistants={selectedAssistants}
                      selectedModels={selectedModels}
                      onSelectAssistant={handleSelectAssistant}
                      onSelectModel={handleSelectModel}
                      multiAssistant={multiAssistant}
                      multiModel={multiModel}
                      onToggleMultiAssistant={handleToggleMultiAssistant}
                      onToggleMultiModel={handleToggleMultiModel}
                      onCreateAssistant={onNavigateToLibrary}
                      onClose={() => setShowAtMenu(false)}
                    />
                  )}
                  <div className="absolute bottom-[7px] left-2.5 right-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      <Button variant="ghost" size="icon-sm" ref={plusBtnRef}
                        onClick={() => { setShowPlusMenu(v => !v); setShowAtMenu(false); }}
                        className={`p-[5px] w-auto h-auto transition-colors ${
                          showPlusMenu ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/20'
                        }`}><Plus size={14} /></Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Layers size={10} />6/20</span>
                        <span className="flex items-center gap-1"><Link2 size={10} />0/0</span>
                      </div>
                      <Button variant="default" size="icon" onClick={handleSend} disabled={!input.trim()}
                        className="w-7 h-7 rounded-full">
                        <ArrowUp size={14} strokeWidth={2} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            }
          >
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} onOpenPanel={handleOpenPanel} onAvatarClick={handleAvatarClick} onOpenArtifact={handleOpenArtifact} assistantEmoji={currentAssistantEmoji} assistantName={currentAssistant.name} modelDisplayName={currentModelDisplayName} />
            ))}
          </ChatInterface>
        </div>

        {/* Right: Artifacts */}
        <AnimatePresence initial={false}>
          {showArtifacts && !artifactFullscreen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: artifactPanelWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="flex-shrink-0 min-w-0 relative flex"
              style={{ width: artifactPanelWidth }}
            >
              {/* Resize handle */}
              <div
                onMouseDown={handleArtifactResizeStart}
                className="w-[6px] flex-shrink-0 cursor-col-resize group flex items-center justify-center relative z-10"
              >
                <div className="w-[2px] h-8 rounded-full bg-border/0 group-hover:bg-border/50 group-active:bg-foreground/20 transition-colors" />
              </div>
              <div className="flex-1 min-w-0 m-2 ml-0 rounded-2xl border border-border/30 bg-background shadow-lg overflow-hidden">
                <ArtifactsPanel artifact={activeArtifact} isFullscreen={false} onToggleFullscreen={() => setArtifactFullscreen(true)} onClose={handleCloseArtifacts} onSelectArtifact={handleOpenArtifact} hasTopic={activeTopicId !== null} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right: Chat Settings Panel */}
        <AnimatePresence>
          {showChatSettings && (
            <ChatSettingsPanel onClose={() => setShowChatSettings(false)} />
          )}
        </AnimatePresence>

        {/* Right: Branch Tree Panel */}
        <AnimatePresence initial={false}>
          {showBranchTree && (
            <BranchTreePanel
              messages={messages}
              onClose={() => setShowBranchTree(false)}
              assistantName={currentAssistant.name}
              modelName={ASSISTANT_MODELS.find(m => m.id === selectedModels[0])?.name || 'Gemini 3 Pro'}
              topicName={activeTopic?.title}
            />
          )}
        </AnimatePresence>

        {/* Right: Floating Panels */}
        <AnimatePresence mode="wait">
          {rightPanel === 'assistantInfo' && (
            <AssistantInfoPanel
              key="assistantInfo"
              assistant={currentAssistant}
              topics={topics}
              onSelectTopic={handleSelectTopic}
              onClose={() => setRightPanel(null)}
              onEdit={() => onEditAssistantInLibrary?.(currentAssistant.name)}
              onOpenHistory={() => { setRightPanel(null); setHistoryInitialAssistant(currentAssistant.name); historySidebar.expand(); }}
              onNavigateToKnowledge={onNavigateToKnowledge}
            />
          )}
          {rightPanel === 'chatDetail' && inspectedMsg?.metadata && (
            <ChatDetailPanel key="chatDetail" metadata={inspectedMsg.metadata} onClose={() => setRightPanel(null)} />
          )}
          {rightPanel === 'rag' && inspectedMsg?.ragInfo && (
            <RAGPanel key="rag" ragInfo={inspectedMsg.ragInfo} onClose={() => setRightPanel(null)} />
          )}
          {rightPanel === 'search' && inspectedMsg?.searchResults && (
            <WebSearchPanel key="search" results={inspectedMsg.searchResults} onClose={() => setRightPanel(null)} startIndex={inspectedMsg.ragInfo?.chunks.length ?? 0} />
          )}
        </AnimatePresence>

      </div>

      {/* ===== History Overlay (fullscreen only) ===== */}
      <AnimatePresence>
        {historySidebar.isExpanded && (
          <TopicHistoryPage
            topics={topics}
            activeTopicId={activeTopicId}
            onSelectTopic={handleSelectTopic}
            onDeleteTopic={handleDeleteTopic}
            onUpdateTopic={handleUpdateTopic}
            onClose={() => { historySidebar.collapse(); setHistoryInitialAssistant(null); }}
            initialAssistant={historyInitialAssistant}
          />
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

export default AssistantRunPage;
