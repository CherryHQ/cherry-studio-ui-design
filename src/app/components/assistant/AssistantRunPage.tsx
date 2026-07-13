import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useGlobalActions } from '@/app/context/GlobalActionContext';
import {
  ChevronDown, ChevronRight, ChevronLeft, ChevronUp, X, Copy, Check, Maximize2, Minimize2,
  Bot, Plus, ArrowUp, FileText, Code2, Eye, BookOpen,
  Clock, Settings, History, MessageCirclePlus, MessageSquarePlus, AtSign,
  ExternalLink, File, Globe,
  Layers, Activity, Database, Info, Languages,
  Trash2, Bookmark, Share2, MoreHorizontal,
  GitBranch, GitFork, ListChecks, Edit3,
  Quote, Type, Brain, BrainCircuit, BrainCog, Minus, RotateCcw,
  LayoutGrid, Rows3, Columns3,
  Search, Paperclip, Hammer, Link, Zap,
  Settings2, NotebookPen, PenTool, Lightbulb, ScanLine, Eraser,
  PanelLeftOpen, PanelLeftClose,
  MessageCircle, Image as ImageIcon, PlugZap, FlaskConical,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { copyToClipboard } from '@/app/utils/clipboard';
import { highlightLine } from '@/app/utils/syntaxHighlight';
import { getFileIcon } from '@/app/utils/fileIcons';
import { ChatInterface } from '@/app/components/shared/Chat/ChatInterface';
import { ThinkingBlock, InlineCodeBlock, MermaidBlock, ImageGallery, VideoGallery } from '@/app/components/shared/Chat/components/MessageComponents';
import { AttachmentList } from '@/app/components/shared/Chat/AttachmentList';
import { Tooltip } from '@/app/components/Tooltip';
import {
  Button, Textarea, EmptyState, SearchInput, Typography,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,
  Popover, PopoverTrigger, PopoverContent,
  HoverCard, HoverCardTrigger, HoverCardContent, BrandLogo,
  MessageErrorBlock, Dialog, DialogContent, Input,
  RichComposer, type RichComposerHandle, type ComposerAttachment,
} from '@cherry-studio/ui';
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

// Infer provider ID from model name for BrandLogo
function inferProviderId(model?: string, provider?: string): string {
  if (provider) return provider.toLowerCase();
  if (!model) return '';
  const m = model.toLowerCase();
  if (m.includes('gpt') || m.includes('dall-e') || m.includes('o1') || m.includes('o3') || m.includes('o4') || m.includes('codex')) return 'openai';
  if (m.includes('claude')) return 'anthropic';
  if (m.includes('gemini')) return 'google';
  if (m.includes('deepseek')) return 'deepseek';
  if (m.includes('qwen')) return 'qwen';
  if (m.includes('llama') || m.includes('mixtral')) return 'meta';
  if (m.includes('mistral') || m.includes('codestral')) return 'mistral';
  if (m.includes('glm')) return 'zhipu';
  return '';
}
function inferProviderLetter(model?: string, provider?: string): string {
  if (provider) return provider[0]?.toUpperCase() || '?';
  if (!model) return '?';
  const id = inferProviderId(model, provider);
  const letterMap: Record<string, string> = { openai: 'O', anthropic: 'A', google: 'G', deepseek: 'D', qwen: 'Q', meta: 'M', mistral: 'M', zhipu: '智' };
  return letterMap[id] || model[0]?.toUpperCase() || '?';
}
import { ASSISTANT_MODELS } from '@/app/config/models';
import { TopicHistoryPage } from '@/features/assistant/TopicHistoryPage';
import { BranchTreePanel } from '@/features/assistant/BranchTreePanel';
import { ChatSettingsPanel } from '@/features/assistant/ChatSettingsPanel';
import { MentionPickerPanel } from '@/app/components/shared/MentionPickerPanel';
import { ModelPickerPanel } from '@/app/components/shared/ModelPickerPanel';
import { EntityRail, PanelRightInsetIcon, type EntityRailItem, type EntityRailTreeGroup, type EntityRailSection } from '@/app/components/shared/EntityNav';
import { AssistantManagePage } from '@/features/assistant/AssistantManagePage';
import { usePersistedState } from '@/app/hooks/usePersistedState';
import { applyOrder } from '@/app/utils/applyOrder';
import { CreateAssistantWizard } from '@/app/components/shared/CreateAssistantWizard';
import { openQuickProviderSetup } from '@/features/chat/QuickProviderSetup/quickProviderSetupStore';
import { HistorySidebar } from '@/app/components/shared/HistorySidebar';
import { RecycleBinConfirmDialog } from '@/app/components/shared/RecycleBinConfirmDialog';
import { ResourceConfigDialog } from '@/app/components/shared/ResourceConfigDialog';
import { useRecycleBin } from '@/app/context/RecycleBinContext';
import { useHistorySidebar } from '@/app/hooks/useHistorySidebar';
import { useDockPreference } from '@/app/hooks/useDockPreference';
import type { ResourceItem } from '@/app/types';

// Convert the runtime AssistantInfo + emoji into the ResourceItem the
// shared config dialog expects.
function assistantToResource(a: AssistantInfo, emoji: string): ResourceItem {
  return {
    id: a.id,
    name: a.name,
    type: 'assistant',
    description: a.systemPrompt?.slice(0, 80) || '',
    avatar: emoji,
    model: a.model,
    tags: a.tags,
    enabled: true,
    createdAt: a.updatedAt,
    updatedAt: a.updatedAt,
  };
}

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
  return text.replace(new RegExp(BT + '([^' + BT + ']+)' + BT, 'g'), '<code class="px-1 py-0.5 rounded bg-muted/50 text-xs font-mono">$1</code>');
}
function applyBoldAndCode(text: string): string {
  return applyCodeReplace(applyBoldReplace(text));
}
function applyCodeReplaceMd(text: string): string {
  return text.replace(new RegExp(BT + '([^' + BT + ']+)' + BT, 'g'), '<code class="px-1 py-0.5 rounded bg-muted/50 text-xs font-mono text-foreground">$1</code>');
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
          <span className="text-xs text-cherry-primary-dark bg-cherry-active-bg px-2 py-[2px] rounded-md">
            并行 {responses.length} {isMultiAssistant ? '助手' : '模型'}
          </span>
        </div>
        <div className="flex items-center gap-0.5 bg-accent/25 rounded-md p-0.5">
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
        layout === 'horizontal' ? 'flex gap-2 overflow-x-auto scrollbar-thin-xs pb-1 min-w-0' :
        'grid grid-cols-2 gap-2'
      }>
        {responses.map(resp => {
          const isContext = contextId === resp.id;
          return (
            <div
              key={resp.id}
              className={`rounded-xl border overflow-hidden flex flex-col ${
                layout === 'horizontal' ? 'min-w-[280px] max-w-[340px] flex-shrink-0' : ''
              } ${isContext ? 'border-cherry-ring bg-cherry-active-bg/30' : 'border-border/20 bg-accent/5'}`}
            >
              {/* Response header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-border/15">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-md bg-accent/50 flex items-center justify-center text-xs leading-none flex-shrink-0">
                    {getParallelAvatar(resp)}
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    {resp.assistantName && (
                      <span className="text-xs text-foreground flex-shrink-0">{resp.assistantName}</span>
                    )}
                    <span className={`text-xs truncate ${resp.assistantName ? 'text-muted-foreground/50' : 'text-foreground'}`}>{resp.modelName}</span>
                    <span className="text-xs text-muted-foreground/40 flex-shrink-0">{resp.modelProvider}</span>
                  </div>
                </div>
                {isContext && (
                  <Tooltip content="当前上下文" side="top"><span className="text-xs text-cherry-primary flex-shrink-0 ml-2">✦</span></Tooltip>
                )}
              </div>
              {/* Thinking */}
              {resp.thinking && <ThinkingBlock content={resp.thinking} />}
              {/* Content */}
              <div className="px-3 py-2.5 text-xs text-foreground leading-[1.75] flex-1">
                {resp.content.split('\n').map((line, i) => {
                  if (line.startsWith('|') && line.includes('|')) {
                    const cells = line.split('|').filter(c => c.trim()).map(c => c.trim());
                    const isSep = cells.every(c => RE_TABLE_SEP.test(c));
                    if (isSep) return null;
                    return (
                      <div key={i} className="flex gap-0">
                        {cells.map((cell, j) => (
                          <span key={j} className={`flex-1 px-1.5 py-0.5 text-xs border-b border-border/15 ${
                            i === 0 ? 'text-foreground' : 'text-muted-foreground'
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
              <div className="flex items-center justify-between px-3 py-1.5 border-t border-border/15">
                <div className="flex items-center gap-1 text-xs text-muted-foreground/40">
                  <span>{resp.duration}</span>
                  <span className="mx-0.5">·</span>
                  <span>{(resp.tokens.input + resp.tokens.output + (resp.tokens.thinking || 0)).toLocaleString()} tokens</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <Tooltip content="重新生成" side="bottom">
                  <Button variant="ghost" size="icon-xs"
                    onClick={() => {}}
                    className="p-1 w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/40"
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
  { id: 'hf-1', title: 'StatsRow.tsx', type: 'code', timestamp: '14:35', content: 'import React from "react";\n\ninterface Props {\n  label: string;\n  value: number;\n}\n\nexport function StatsRow({ label, value }: Props) {\n  return (\n    <div className="flex items-center justify-between py-2">\n      <span className="text-sm text-muted-foreground">{label}</span>\n      <span className="text-lg font-semibold">{value.toLocaleString()}</span>\n    </div>\n  );\n}' },
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
    case 'code': return <Code2 size={size} className="text-accent-violet" />;
    case 'html': return <Globe size={size} className="text-accent-blue" />;
    case 'svg': return <Eye size={size} className="text-accent-pink" />;
    case 'mermaid': return <Layers size={size} className="text-accent-cyan" />;
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
      <div className="fixed inset-0 z-[var(--z-overlay)]" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: -4, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.97 }}
        transition={{ duration: 0.12 }}
        className={`absolute top-full mt-1.5 z-[var(--z-popover)] w-[270px] bg-popover border border-border/40 rounded-xl shadow-2xl shadow-black/12 overflow-hidden ${anchorRight ? 'right-0' : 'left-0'}`}
      >
        {/* Category tabs */}
        <div className="flex items-center gap-0.5 px-2.5 pt-2 pb-1">
          {FILE_CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <Button variant="ghost" size="inline" key={cat.key} onClick={() => setCategory(cat.key)}
                className={`gap-1 px-2 py-[4px] text-xs ${category === cat.key ? 'bg-accent/50 text-foreground' : 'text-muted-foreground/60 hover:text-foreground hover:bg-accent/40'}`}>
                <Icon size={9} />
                <span>{cat.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Search */}
        <div className="px-2.5 pt-1 pb-1.5">
          <SearchInput
            ref={inputRef}
            value={query}
            onChange={setQuery}
            placeholder="搜索历史文件..."
            iconSize={10}
            wrapperClassName="flex items-center gap-2 px-2.5 py-[5px] rounded-lg bg-accent/15 border border-border/20"
          />
        </div>

        {/* File list */}
        <div className="max-h-[260px] overflow-y-auto px-1.5 py-0.5 scrollbar-thin-xs">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-6">
              <Search size={14} className="text-muted-foreground/40 mb-2" />
              <span className="text-xs text-muted-foreground/40">没有匹配的文件</span>
            </div>
          ) : (
            filtered.map(file => {
              const isSelected = selectedTitle === file.title;
              return (
                <Button variant="ghost" size="inline"
                  key={file.id}
                  onClick={() => { onSelect({ type: file.type, title: file.title, content: file.content }); onClose(); }}
                  className={`w-full justify-start gap-2.5 px-2.5 py-[7px] rounded-lg transition-colors group mb-0.5 ${isSelected ? 'bg-accent/50' : 'hover:bg-accent/50'}`}
                >
                  <div className="flex-shrink-0">
                    {artifactTypeIcon(file.type, 13)}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className={`text-xs truncate ${isSelected ? 'text-foreground' : 'text-foreground'}`}>{file.title}</div>
                    <div className="text-xs text-muted-foreground/40">{artifactTypeLabel(file.type)} · {file.timestamp}</div>
                  </div>
                  <Eye size={9} className={`flex-shrink-0 transition-opacity ${isSelected ? 'text-muted-foreground/40 opacity-100' : 'text-muted-foreground/40 opacity-0 group-hover:opacity-100'}`} />
                </Button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-1.5 border-t border-border/30">
          <span className="text-xs text-muted-foreground/40">{files.length} 个历史文件</span>
        </div>
      </motion.div>
    </div>
  );
}

// ===========================
// Artifacts Panel
// ===========================

function ArtifactsPanel({ artifact, isFullscreen, onToggleFullscreen, onClose, onSelectArtifact, hasTopic, tabSlot }: {
  artifact: ArtifactData | null;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onClose: () => void;
  onSelectArtifact: (artifact: ArtifactData) => void;
  hasTopic: boolean;
  tabSlot?: React.ReactNode;
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
          {tabSlot ?? <span className="text-xs text-muted-foreground/50">内容预览</span>}
          <div className="flex items-center gap-0.5">
            <Tooltip content="关闭" side="bottom"><Button variant="ghost" size="icon-xs" onClick={onClose} className="p-1.5 w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/40">
              <X size={11} />
            </Button></Tooltip>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 px-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-accent/40 to-accent/20 border border-border/20 flex items-center justify-center mb-5">
            <Layers size={22} strokeWidth={1.3} className="text-muted-foreground/40" />
          </div>
          <p className="text-xs text-muted-foreground mb-2">暂无预览内容</p>
          <p className="text-xs text-muted-foreground/40 text-center leading-[1.6] mb-5">
            点击消息中的代码块、文档或网页卡片即可在此查看
          </p>
          <div className="w-full space-y-[6px]">
            <div className="flex items-center gap-2.5 px-3 py-[6px] rounded-lg bg-accent/15 border border-border/15">
              <div className="w-5 h-5 rounded bg-accent-violet/10 flex items-center justify-center"><Code2 size={10} className="text-accent-violet/60" /></div>
              <span className="text-xs text-muted-foreground/50">代码 — 语法高亮 + 复制</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-[6px] rounded-lg bg-accent/15 border border-border/15">
              <div className="w-5 h-5 rounded bg-warning/10 flex items-center justify-center"><FileText size={10} className="text-warning/60" /></div>
              <span className="text-xs text-muted-foreground/50">文档 — Markdown 渲染</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-[6px] rounded-lg bg-accent/15 border border-border/15">
              <div className="w-5 h-5 rounded bg-accent-blue/10 flex items-center justify-center"><Globe size={10} className="text-accent-blue/60" /></div>
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
          {tabSlot}
          {tabSlot && availableTabs.length > 0 && <div className="w-px h-3.5 bg-border/30 mx-1" />}
          {availableTabs.map(t => (
            <Button variant="ghost" size="inline" key={t.key} onClick={() => setTab(t.key)}
              className={`gap-1.5 px-2.5 py-[5px] text-xs transition-all duration-100 ${tab === t.key ? 'bg-accent/50 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'}`}>
              <t.icon size={10} />{t.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-0.5">
          <span className="text-xs text-muted-foreground/50 mr-1.5 truncate max-w-[100px]">{artifact.title}</span>
          <Tooltip content="复制" side="bottom"><Button variant="ghost" size="icon-xs" onClick={handleCopy} className="p-1.5 w-auto h-auto text-muted-foreground hover:text-foreground hover:bg-accent/40">
            {copied ? <Check size={11} className="text-cherry-primary" /> : <Copy size={11} />}
          </Button></Tooltip>
          <Tooltip content={isFullscreen ? '还原' : '全屏'} side="bottom"><Button variant="ghost" size="icon-xs" onClick={onToggleFullscreen} className="p-1.5 w-auto h-auto text-muted-foreground hover:text-foreground hover:bg-accent/40">
            {isFullscreen ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
          </Button></Tooltip>
          <Tooltip content="关闭" side="bottom"><Button variant="ghost" size="icon-xs" onClick={onClose} className="p-1.5 w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/40">
            <X size={11} />
          </Button></Tooltip>
        </div>
      </div>
      <div className="flex-1 overflow-auto scrollbar-thin">
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
            {codeLang && <div className="px-3 py-1.5 bg-muted/40 border-b border-border/30"><span className="text-xs text-muted-foreground">{codeLang}</span></div>}
            <pre className="px-3 py-2.5 overflow-x-auto text-xs leading-[1.7] font-mono bg-muted/20">
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
      if (bold) elements.push(<div key={i} className="flex items-start gap-1.5 py-0.5 text-xs text-foreground leading-[1.7]"><span className="text-muted-foreground/40 mt-px">-</span><span><span className="text-foreground">{bold[1]}</span>{bold[2]}</span></div>);
    } else if (RE_NUM_SPACE_TEST.test(line)) {
      elements.push(<div key={i} className="flex items-start gap-2 py-0.5 text-xs text-foreground leading-[1.7]"><span className="text-muted-foreground/50 w-4 text-right flex-shrink-0">{line.match(RE_NUM_EXTRACT)?.[1]}.</span><span>{line.replace(RE_NUM_PREFIX, '')}</span></div>);
    } else if (line.trim() === '') elements.push(<div key={i} className="h-2" />);
    else {
      const formatted = applyBoldReplace(applyCodeReplaceMd(line));
      elements.push(<p key={i} className="text-xs text-foreground leading-[1.8]" dangerouslySetInnerHTML={{ __html: formatted }} />);
    }
  });
  return <div>{elements}</div>;
}

function CodeRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <pre className="px-0 py-2 text-xs leading-[1.75] font-mono">
      {lines.map((line, i) => (
        <div key={i} className="flex hover:bg-accent/40 transition-colors">
          <span className="w-10 text-right pr-3 text-xs text-muted-foreground/50 select-none flex-shrink-0 tabular-nums">{i + 1}</span>
          <span className="flex-1 pr-4">{highlightLine(line)}</span>
        </div>
      ))}
    </pre>
  );
}

function PreviewRenderer({ content, type }: { content: string; type: string }) {
  if (type === 'html' || type === 'svg') {
    return (
      <div className="h-full flex items-start justify-center p-4 bg-background">
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
      className="absolute top-2 right-2 bottom-2 z-[var(--z-sticky)] bg-background rounded-xl border border-border/20 shadow-2xl shadow-black/12 flex flex-col overflow-hidden"
      style={{ width }}
    >
      <div className="flex items-center justify-between px-4 h-[38px] flex-shrink-0">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs text-foreground">{title}</span>
        </div>
        <Button variant="ghost" size="icon-xs" onClick={onClose} className="p-1.5 w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/40">
          <X size={11} />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
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
            <Typography variant="subtitle" className="mb-1">{assistant.name}</Typography>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock size={9} />
              <span>最新使用 {assistant.updatedAt}</span>
            </div>
          </div>
          <Button variant="outline" size="xs" onClick={onEdit} className="px-2 border-border/30 text-muted-foreground hover:text-foreground hover:bg-accent/40 gap-1">
            <Edit3 size={9} />编辑
          </Button>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">默认模型</span>
          <div className="flex items-center gap-1.5 px-2 py-[3px] rounded-md bg-accent/25">
            <BrandLogo id={inferProviderId(assistant.model, assistant.provider)} fallbackLetter={inferProviderLetter(assistant.model, assistant.provider)} size={14} className="shrink-0" />
            <span className="text-foreground">{assistant.model}</span>
          </div>
        </div>
        {assistant.tags.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">标签</span>
            <div className="flex gap-1">
              {assistant.tags.map(t => (
                <span key={t} className="px-1.5 py-[2px] rounded text-xs bg-accent/25 text-foreground">{t}</span>
              ))}
            </div>
          </div>
        )}
        <div className="rounded-lg bg-muted/15 overflow-hidden">
          <Button variant="ghost" size="xs" onClick={() => setPromptExpanded(!promptExpanded)}
            className="w-full justify-start gap-2 px-3 text-xs text-foreground hover:bg-accent/40 transition-colors">
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
                  <pre className="text-xs text-muted-foreground leading-[1.7] whitespace-pre-wrap mt-1 font-sans">{assistant.systemPrompt}</pre>
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
                <div key={kb.id} onClick={() => onNavigateToKnowledge?.(kb.name)} className="flex items-center gap-2 px-2.5 py-[6px] rounded-md hover:bg-accent/40 transition-colors cursor-pointer group">
                  <Database size={10} className="text-info/70 flex-shrink-0" />
                  <span className="text-xs text-info/80 group-hover:text-info">{kb.name}</span>
                  <ChevronRight size={8} className="ml-auto text-muted-foreground/40 group-hover:text-muted-foreground/50" />
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
                <div key={tool.id} className="flex items-center gap-2 px-2.5 py-[6px] rounded-md hover:bg-accent/40 transition-colors">
                  <span className="text-xs">{tool.icon}</span>
                  <span className="text-xs text-foreground">{tool.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Clock size={10} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground flex-1">最近话题</span>
            <Tooltip content="历史话题" side="bottom"><Button variant="ghost" size="icon-xs" onClick={onOpenHistory} className="p-1 w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/40">
              <History size={11} />
            </Button></Tooltip>
          </div>
          <div className="text-xs text-muted-foreground/50 px-1 mb-1.5 mt-3">昨天</div>
          <div className="space-y-0.5">
            {topics.slice(0, 4).map(topic => (
              <Button variant="ghost" size="xs" key={topic.id} onClick={() => { onSelectTopic(topic.id); onClose(); }}
                className="w-full justify-start gap-2 px-2.5 text-left hover:bg-accent/50 transition-colors group">
                <span className="text-sm text-foreground flex-1 truncate group-hover:text-foreground">{topic.title}</span>
                <span className="text-xs text-muted-foreground/40 flex-shrink-0">{topic.timestamp}</span>
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
            <span className="text-muted-foreground/60">会话 ID</span>
            <Button variant="ghost" size="inline" onClick={copyId} className="gap-1 text-muted-foreground hover:text-foreground transition-colors font-mono text-xs">
              <span>{metadata.sessionId.slice(0, 16)}...</span>
              {copied ? <Check size={8} className="text-cherry-primary" /> : <Copy size={8} />}
            </Button>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground/60">模型</span>
            <div className="flex items-center gap-1.5"><BrandLogo id={inferProviderId(metadata.model, metadata.provider)} fallbackLetter={inferProviderLetter(metadata.model, metadata.provider)} size={14} className="shrink-0" /><span className="text-foreground">{metadata.model}</span></div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground/60">状态</span>
            <span className={metadata.status === 'success' ? 'text-muted-foreground' : 'text-destructive'}>{metadata.status === 'success' ? '成功' : '失败'}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground/60">时间</span>
            <span className="text-foreground">{metadata.startTime} · {metadata.duration}</span>
          </div>
          <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div className="flex items-center justify-between text-xs cursor-default">
                <span className="text-muted-foreground/60">令牌数</span>
                <span className="text-foreground tabular-nums">{total.toLocaleString()}</span>
              </div>
            </HoverCardTrigger>
            <HoverCardContent align="end" className="px-3 py-2 min-w-[160px]">
              <div className="space-y-[4px]">
                <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">输入</span><span className="text-info tabular-nums">{metadata.tokens.input.toLocaleString()}</span></div>
                <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">输出</span><span className="text-muted-foreground tabular-nums">{metadata.tokens.output.toLocaleString()}</span></div>
                {metadata.tokens.thinking !== undefined && metadata.tokens.thinking > 0 && (
                  <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">思考</span><span className="text-accent-purple tabular-nums">{metadata.tokens.thinking.toLocaleString()}</span></div>
                )}
                {metadata.tokens.cache !== undefined && metadata.tokens.cache > 0 && (
                  <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">缓存</span><span className="text-warning tabular-nums">{metadata.tokens.cache.toLocaleString()}</span></div>
                )}
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-0.5">
              {(['request', 'response', 'process'] as const).map(t => (
                <Button variant="ghost" size="inline" key={t} onClick={() => setJsonTab(t)}
                  className={`px-2.5 py-[4px] text-xs transition-all duration-100 ${jsonTab === t ? 'bg-accent/50 text-foreground' : 'text-muted-foreground/60 hover:text-foreground'}`}>
                  {t === 'request' ? '请求' : t === 'response' ? '响应' : '过程'}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-0.5">
              <Tooltip content="复制" side="bottom"><Button variant="ghost" size="icon-xs" onClick={() => { copyToClipboard(jsonContent); setJsonCopied(true); setTimeout(() => setJsonCopied(false), 1500); }}
                className="p-1 w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/40">
                {jsonCopied ? <Check size={9} className="text-cherry-primary" /> : <Copy size={9} />}
              </Button></Tooltip>
              <Tooltip content="放大" side="bottom"><Button variant="ghost" size="icon-xs" onClick={() => setJsonExpanded(true)} className="p-1 w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/40">
                <Maximize2 size={9} />
              </Button></Tooltip>
            </div>
          </div>
          <div className="rounded-lg bg-muted/15 overflow-auto scrollbar-thin-xs">
            <pre className="px-3 py-2.5 text-xs leading-[1.7] font-mono whitespace-pre select-text">
              {jsonContent.split('\n').map((line, i) => <div key={i}>{highlightLine(line)}</div>)}
            </pre>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {jsonExpanded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[var(--z-overlay)] bg-muted0 flex items-center justify-center p-8" onClick={() => setJsonExpanded(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }} className="bg-popover rounded-xl shadow-2xl w-full max-w-[700px] max-h-[80vh] flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-1">
                  {(['request', 'response', 'process'] as const).map(t => (
                    <Button variant="ghost" size="inline" key={t} onClick={() => setJsonTab(t)}
                      className={`px-2.5 py-[4px] text-xs transition-all duration-100 ${jsonTab === t ? 'bg-accent/50 text-foreground' : 'text-muted-foreground/60 hover:text-foreground'}`}>
                      {t === 'request' ? '请求' : t === 'response' ? '响应' : '过程'}
                    </Button>
                  ))}
                </div>
                <Button variant="ghost" size="icon-xs" onClick={() => setJsonExpanded(false)} className="p-1.5 w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/40">
                  <Minimize2 size={11} />
                </Button>
              </div>
              <div className="flex-1 overflow-auto px-4 pb-4 scrollbar-thin">
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
  const [logCopied, setLogCopied] = useState(false);

  return (
    <FloatingPanel title="知识库" icon={<Database size={12} className="text-info/70" />} onClose={onClose}>
      <div className="px-4 py-3 space-y-3">
        <div className="space-y-[6px]">
          <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground/60">知识库</span><span className="text-info cursor-pointer hover:underline">{ragInfo.knowledgeBaseName}</span></div>
          <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground/60">Top-k</span><span className="text-foreground">{ragInfo.topK}</span></div>
          <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground/60">分数阈值</span><span className="text-foreground">{ragInfo.scoreThreshold}</span></div>
          {ragInfo.rerankModel && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground/60">重排</span>
              <div className="flex items-center gap-1.5"><BrandLogo id={inferProviderId(ragInfo.rerankModel)} fallbackLetter={inferProviderLetter(ragInfo.rerankModel)} size={14} className="shrink-0" /><span className="text-foreground">{ragInfo.rerankModel}</span></div>
            </div>
          )}
          <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground/60">检索方式</span><span className="text-foreground">{ragInfo.retrievalMethod}</span></div>
        </div>
        <div className="flex items-center gap-0.5">
          <Button variant={subTab === 'chunks' ? 'secondary' : 'ghost'} size="inline" onClick={() => setSubTab('chunks')} className={`px-2.5 py-[4px] text-xs transition-all ${subTab !== 'chunks' ? 'text-muted-foreground hover:text-foreground' : ''}`}>top-k</Button>
          <Button variant={subTab === 'process' ? 'secondary' : 'ghost'} size="inline" onClick={() => setSubTab('process')} className={`px-2.5 py-[4px] text-xs transition-all ${subTab !== 'process' ? 'text-muted-foreground hover:text-foreground' : ''}`}>过程</Button>
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
                    ? 'bg-info/10 ring-1 ring-blue-400/25'
                    : 'bg-muted/15 hover:bg-accent/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5"><span className={`w-5 h-5 rounded text-xs flex items-center justify-center tabular-nums ${expandedChunk === i ? 'bg-info/20 text-info' : 'bg-info/15 text-info'}`}>{i + 1}</span><span className="text-xs text-muted-foreground">相关度</span></div>
                  <div className="h-1.5 w-16 rounded-full bg-accent/25 overflow-hidden"><div className="h-full bg-info rounded-full" style={{ width: `${chunk.score * 100}%` }} /></div>
                  <span className="text-xs text-info tabular-nums">{chunk.score.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-[1.65] line-clamp-3">{chunk.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60"><File size={8} /><span>{chunk.source}</span></div>
                  <Eye size={9} className={`transition-colors ${expandedChunk === i ? 'text-info' : 'text-muted-foreground/50'}`} />
                </div>
              </div>
            ))}
          </div>
        )}
        {subTab === 'process' && (
          <div>
            <div className="flex items-center justify-end mb-1.5">
              <Tooltip content="复制" side="bottom"><Button variant="ghost" size="icon-xs"
                onClick={() => { copyToClipboard(ragInfo.processLog.join('\n')); setLogCopied(true); setTimeout(() => setLogCopied(false), 1500); }}
                className="p-1 w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/40">
                {logCopied ? <Check size={9} className="text-cherry-primary" /> : <Copy size={9} />}
              </Button></Tooltip>
            </div>
            <div className="rounded-lg bg-muted/15 overflow-auto scrollbar-thin-xs">
              <pre className="px-3 py-2.5 text-xs leading-[1.7] font-mono select-text">
                {ragInfo.processLog.map((log, i) => <div key={i}>{highlightLine(log)}</div>)}
              </pre>
            </div>
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
          <div key={i} className="rounded-lg p-2.5 hover:bg-accent/50 transition-colors">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded bg-muted text-foreground text-xs flex items-center justify-center flex-shrink-0 tabular-nums mt-px">{offset + i + 1}</span>
              <div className="flex-1 min-w-0">
                <a href={r.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-foreground hover:text-info transition-colors line-clamp-1 flex items-center gap-1">
                  {r.title}<ExternalLink size={8} className="flex-shrink-0 text-muted-foreground/40" />
                </a>
                <p className="text-xs text-muted-foreground leading-[1.55] mt-1 line-clamp-3">{r.snippet}</p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground/50"><Globe size={8} /><span>{r.source}</span></div>
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

function buildSourceMap(msg: Message): SourceItem[] {
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
  return (
    <HoverCard openDelay={150} closeDelay={120}>
      <HoverCardTrigger asChild>
        <span
          className={`inline-flex items-center justify-center min-w-[16px] h-[15px] px-[3px] rounded text-xs tabular-nums ml-[1px] mr-[1px] transition-all duration-100 cursor-default align-top ${
            source.type === 'rag' ? 'bg-info/10 text-info/70 hover:bg-info/25 hover:text-info hover:ring-1 hover:ring-info/30' : 'bg-accent-blue/10 text-accent-blue/70 hover:bg-accent-blue/25 hover:text-accent-blue hover:ring-1 hover:ring-accent-blue/30'
          }`}
        >{source.index}</span>
      </HoverCardTrigger>
      <HoverCardContent className="w-[300px] p-0 overflow-hidden">
        <div className="px-3 py-2.5 space-y-1">
          <div className="flex items-start gap-2">
            <span className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-xs tabular-nums mt-px ${
              source.type === 'rag' ? 'bg-info/15 text-info' : 'bg-accent-blue/15 text-accent-blue'
            }`}>{source.index}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {source.type === 'rag' ? <Database size={9} className="text-info/60 flex-shrink-0" /> : <Globe size={9} className="text-accent-blue/60 flex-shrink-0" />}
                <span className="text-xs text-foreground truncate">{source.title}</span>
                {source.url && <ExternalLink size={8} className="text-muted-foreground/40 flex-shrink-0" />}
              </div>
              {source.score !== undefined && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs text-muted-foreground/50">相关度</span>
                  <div className="h-1 w-12 rounded-full bg-accent/25 overflow-hidden"><div className="h-full bg-info rounded-full" style={{ width: `${source.score * 100}%` }} /></div>
                  <span className="text-xs text-info tabular-nums">{source.score.toFixed(2)}</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground leading-[1.6] mt-1 line-clamp-3">{source.snippet}</p>
              <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground/40">
                {source.type === 'rag' ? <BookOpen size={8} /> : <Globe size={8} />}
                <span className="truncate">{source.source}</span>
              </div>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
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
      className="rounded-xl border border-info/20 bg-info/5 p-3 space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded bg-info/15 text-info text-xs flex items-center justify-center tabular-nums">{index}</span>
          <span className="text-xs text-foreground">片段 #{index} 详情</span>
        </div>
        <Button variant="ghost" size="icon-xs" onClick={onClose} className="p-1.5 w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/40"><X size={11} /></Button>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground/50">相关度</span>
        <div className="h-1.5 w-20 rounded-full bg-accent/25 overflow-hidden"><div className="h-full bg-info rounded-full" style={{ width: `${chunk.score * 100}%` }} /></div>
        <span className="text-xs text-info tabular-nums">{chunk.score.toFixed(4)}</span>
      </div>
      <div className="rounded-lg bg-muted/15 p-2.5">
        <p className="text-xs text-foreground leading-[1.7] whitespace-pre-wrap">{chunk.content}</p>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
        <File size={8} />
        <span>{chunk.source}</span>
      </div>
    </motion.div>
  );
}

// ===========================
// Message Action Bar & Context Menu
// ===========================

const EXPORT_ITEMS = [
  '复制为纯文本（去除 Markdown）', '复制为图片', '导出为图片',
  '导出为 Markdown', '导出为 Markdown（包含思考）', '导出为 Word',
  '导出到 Notion', '导出到 Obsidian', '导出到语雀', '导出到 Joplin', '导出到思源笔记',
];

function MessageActionBar({ onCopy, onQuote, onDelete, onBookmark, onShare, onInfo, onRetry, ctxMenuOpen, onOpenChange, alignRight, retryCount, activeRetryIndex, onRetryNav, isUser }: {
  onCopy: () => void;
  onQuote: () => void;
  onDelete: () => void;
  onBookmark: () => void;
  onShare: () => void;
  onInfo?: () => void;
  onRetry?: () => void;
  ctxMenuOpen: boolean;
  onOpenChange: (open: boolean) => void;
  alignRight?: boolean;
  retryCount?: number;
  activeRetryIndex?: number;
  onRetryNav?: (index: number) => void;
  isUser?: boolean;
}) {
  const totalVersions = retryCount ?? 1;
  const currentVersion = (activeRetryIndex ?? 0) + 1;
  const btnCls = "p-[4px] w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/40";

  if (isUser) {
    // User message: retry, 复制, 删除
    return (
      <div className="flex items-center gap-0.5 mt-1 -ml-1">
        {onRetry && <Tooltip content="重试" side="bottom"><Button variant="ghost" size="icon-xs" onClick={onRetry} className={btnCls}><RotateCcw size={12} /></Button></Tooltip>}
        <Tooltip content="复制" side="bottom"><Button variant="ghost" size="icon-xs" onClick={onCopy} className={btnCls}><Copy size={12} /></Button></Tooltip>
        <Tooltip content="删除" side="bottom"><Button variant="ghost" size="icon-xs" onClick={onDelete} className={btnCls}><Trash2 size={12} /></Button></Tooltip>
      </div>
    );
  }

  // Assistant message: 复制, retry, @, 翻译, 笔记, 信息, 删除, 分支 + dropdown(编辑, 多选, 保存, 导出)
  return (
    <div className="flex items-center gap-0.5 mt-1 -ml-1">
      {/* Retry pagination */}
      {totalVersions > 1 && onRetryNav && (
        <div className="flex items-center gap-0 mr-0.5">
          <Tooltip content="上一个版本" side="bottom"><Button variant="ghost" size="icon-xs"
            onClick={() => onRetryNav(Math.max(0, (activeRetryIndex ?? 0) - 1))}
            disabled={currentVersion <= 1}
            className="p-[3px] w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/40 disabled:opacity-20"
          ><ChevronLeft size={11} /></Button></Tooltip>
          <span className="text-xs text-muted-foreground/50 tabular-nums min-w-[28px] text-center">{currentVersion}/{totalVersions}</span>
          <Tooltip content="下一个版本" side="bottom"><Button variant="ghost" size="icon-xs"
            onClick={() => onRetryNav(Math.min(totalVersions - 1, (activeRetryIndex ?? 0) + 1))}
            disabled={currentVersion >= totalVersions}
            className="p-[3px] w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/40 disabled:opacity-20"
          ><ChevronRight size={11} /></Button></Tooltip>
        </div>
      )}
      <Tooltip content="复制" side="bottom"><Button variant="ghost" size="icon-xs" onClick={onCopy} className={btnCls}><Copy size={12} /></Button></Tooltip>
      {onRetry && <Tooltip content="重试" side="bottom"><Button variant="ghost" size="icon-xs" onClick={onRetry} className={btnCls}><RotateCcw size={12} /></Button></Tooltip>}
      <Tooltip content="@提及" side="bottom"><Button variant="ghost" size="icon-xs" className={btnCls}><AtSign size={12} /></Button></Tooltip>
      <Tooltip content="翻译" side="bottom"><Button variant="ghost" size="icon-xs" className={btnCls}><Languages size={12} /></Button></Tooltip>
      <Tooltip content="笔记" side="bottom"><Button variant="ghost" size="icon-xs" className={btnCls}><NotebookPen size={12} /></Button></Tooltip>
      {onInfo && <Tooltip content="信息" side="bottom"><Button variant="ghost" size="icon-xs" onClick={onInfo} className={btnCls}><Info size={12} /></Button></Tooltip>}
      <Tooltip content="删除" side="bottom"><Button variant="ghost" size="icon-xs" onClick={onDelete} className={btnCls}><Trash2 size={12} /></Button></Tooltip>
      <Tooltip content="分支" side="bottom"><Button variant="ghost" size="icon-xs" className={btnCls}><GitBranch size={12} /></Button></Tooltip>
      <DropdownMenu open={ctxMenuOpen} onOpenChange={onOpenChange}>
        <Tooltip content="更多" side="bottom">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-xs" className={btnCls}><MoreHorizontal size={12} /></Button>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent align={alignRight ? 'end' : 'start'} side="top" className="min-w-[140px]">
          <DropdownMenuItem onClick={() => {}} className="gap-2.5 text-xs"><ListChecks size={11} className="text-muted-foreground" />多选</DropdownMenuItem>
          <DropdownMenuItem onClick={onBookmark} className="gap-2.5 text-xs"><Bookmark size={11} className="text-muted-foreground" />保存</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2.5 text-xs"><Share2 size={11} className="text-muted-foreground" />导出</DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="min-w-[220px]">
              {EXPORT_ITEMS.map((item, i) => (
                <DropdownMenuItem key={i} onClick={() => {}} className="text-xs">{item}</DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ===========================
// Chat Message Bubble (Enhanced)
// ===========================

function MessageBubble({ msg, onOpenPanel, onAvatarClick, onOpenArtifact, assistantEmoji, assistantName, modelDisplayName, onRetry, onRetryNav }: {
  msg: Message;
  onOpenPanel: (panel: 'chatDetail' | 'rag' | 'search', msg: Message) => void;
  onAvatarClick: () => void;
  onOpenArtifact?: (artifact: ArtifactData) => void;
  assistantEmoji?: string;
  assistantName?: string;
  modelDisplayName?: string;
  onRetry?: (msgId: string) => void;
  onRetryNav?: (msgId: string, index: number) => void;
}) {
  const [ctxMenu, setCtxMenu] = useState(false);

  // Retry version handling: determine which version to display
  const retryVersions = msg.retryVersions || [];
  const totalVersions = 1 + retryVersions.length; // original + retries
  const activeIdx = msg.activeRetryIndex ?? 0;
  const displayMsg = activeIdx === 0 ? msg : retryVersions[activeIdx - 1] || msg;

  const handleCopy = () => { copyToClipboard(displayMsg.content); };

  const sources = useMemo(() => buildSourceMap(displayMsg), [displayMsg]);
  const hasCitations = sources.length > 0;

  // === User Message ===
  if (msg.role === 'user') {
    return (
      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="flex justify-end min-w-0 max-w-full" style={{ width: '100%' }}>
        <div className="max-w-[85%] min-w-0" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
          {/* Attachments above bubble — clickable to open in artifact viewer */}
          {msg.attachments && msg.attachments.length > 0 && (
            <div className="flex justify-end mb-1">
              <AttachmentList
                attachments={msg.attachments}
                onOpen={onOpenArtifact ? (att) => {
                  const ext = (att.name.split('.').pop() || '').toLowerCase();
                  const artifactType: ArtifactData['type'] =
                    ['html', 'htm'].includes(ext) ? 'html' :
                    ['svg'].includes(ext) ? 'svg' :
                    ['md', 'txt', 'pdf', 'docx', 'doc', 'rtf'].includes(ext) ? 'document' : 'code';
                  onOpenArtifact({
                    type: artifactType,
                    title: att.name,
                    content: att.previewUrl
                      ? `<!-- ${att.name} (${att.size}) -->\n[图片附件: ${att.name}]`
                      : `# ${att.name}\n\n大小: ${att.size}\n类型: ${att.type || ext.toUpperCase()}\n\n（这是一个用户上传的文件，点击下载或在外部应用中打开查看完整内容。）`,
                    language: ext || undefined,
                  });
                } : undefined}
              />
            </div>
          )}
          <div className="px-3.5 py-2.5 rounded-[var(--radius-button)] rounded-br-[var(--radius-dot)] bg-muted/50 text-foreground text-xs leading-[1.65] break-all whitespace-pre-wrap">
            {msg.content}
          </div>
          <MessageActionBar
            onCopy={handleCopy} onQuote={() => {}} onDelete={() => {}} onBookmark={() => {}} onShare={() => {}}
            ctxMenuOpen={ctxMenu} onOpenChange={setCtxMenu}
            alignRight isUser
          />
        </div>
      </motion.div>
    );
  }

  // === Parallel Responses ===
  if (msg.parallelResponses && msg.parallelResponses.length > 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="flex gap-2.5 max-w-[95%]">
        <Tooltip content="查看助手信息" side="left"><Button variant="ghost" size="icon-xs" onClick={onAvatarClick} className="rounded-[var(--radius-kbd)] bg-accent/50 mt-[1px]">
          <Bot size={12} className="text-muted-foreground" />
        </Button></Tooltip>
        <div className="flex-1 min-w-0">
          <ParallelResponsesBlock responses={msg.parallelResponses} />
          <MessageActionBar
            onCopy={handleCopy} onQuote={() => {}} onDelete={() => {}} onBookmark={() => {}} onShare={() => {}}
            onRetry={() => {}}
            ctxMenuOpen={ctxMenu} onOpenChange={setCtxMenu}
          />
        </div>
      </motion.div>
    );
  }

  // === Regular Assistant Message ===
  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="flex gap-2.5 max-w-[95%]">
      <Tooltip content="查看助手信息" side="left"><Button variant="ghost" size="icon-xs" onClick={onAvatarClick} className="rounded-[var(--radius-kbd)] bg-accent/50 mt-[1px] text-sm leading-none">
        {(msg.assistantLabel && ASSISTANT_EMOJI_MAP[msg.assistantLabel]) || assistantEmoji || <Bot size={12} className="text-muted-foreground" />}
      </Button></Tooltip>
      <div className="flex-1 min-w-0">
        {/* Assistant name + model */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-xs text-foreground">{displayMsg.assistantLabel || assistantName || '助手'}</span>
          {modelDisplayName && <span className="text-xs text-muted-foreground/50">{modelDisplayName}</span>}
        </div>

        {/* Thinking block */}
        {displayMsg.thinking && <ThinkingBlock content={displayMsg.thinking} />}

        {/* Content */}
        <div className="text-xs text-foreground leading-[1.75] py-1">
          {(displayMsg.content || '').split('\n').map((line, i) => {
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
            return <p key={i} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>').replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-muted/50 text-xs font-mono">$1</code>') }} />;
          })}
        </div>

        {/* Inline code block */}
        {msg.codeBlock && <InlineCodeBlock language={msg.codeBlock.language} code={msg.codeBlock.code} />}

        {/* Mermaid diagram */}
        {msg.mermaidCode && <MermaidBlock code={msg.mermaidCode} />}

        {/* Generated images */}
        {msg.images && msg.images.length > 0 && <ImageGallery images={msg.images} />}

        {/* Generated videos */}
        {msg.videos && msg.videos.length > 0 && <VideoGallery videos={msg.videos} />}

        {(displayMsg.errorMessage || displayMsg.error || displayMsg.metadata?.status === 'error') && (
          <MessageErrorBlock
            className="mt-1.5"
            message={displayMsg.errorMessage || displayMsg.error?.message || '请求失败，请重试'}
            code={displayMsg.errorCode || displayMsg.error?.code}
            detail={displayMsg.error}
            onRetry={onRetry ? () => onRetry(msg.id) : undefined}
          />
        )}

        {/* Triggered indicators */}
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {/* Artifact indicator */}
          {msg.artifact && (
            <Button variant="ghost" size="inline"
              onClick={() => onOpenArtifact?.(msg.artifact!)}
              className="gap-1 px-2 py-[3px] rounded-md text-xs text-cherry-primary/60 bg-cherry-primary/8 hover:bg-cherry-primary/15 hover:text-cherry-primary"
            >
              <Layers size={9} />
              <span className="truncate max-w-[160px]">{msg.artifact.title}</span>
              <ExternalLink size={8} className="opacity-50" />
            </Button>
          )}
          {msg.ragInfo && (
            <Button variant="ghost" size="inline" onClick={() => onOpenPanel('rag', msg)}
              className="gap-1 px-2 py-[3px] rounded-md text-xs text-info/60 bg-info/8 hover:bg-info/15 hover:text-info">
              <Database size={9} /><span>知识库 · {msg.ragInfo.chunks.length} 条</span>
            </Button>
          )}
          {msg.searchResults && msg.searchResults.length > 0 && (
            <Button variant="ghost" size="inline" onClick={() => onOpenPanel('search', msg)}
              className="gap-1 px-2 py-[3px] rounded-md text-xs text-cherry-text-muted bg-cherry-active-bg hover:bg-cherry-active-border hover:text-cherry-primary-dark">
              <Globe size={9} /><span>搜索 · {msg.searchResults.length} 条</span>
            </Button>
          )}
        </div>

        {/* Action bar */}
        <MessageActionBar
          onCopy={handleCopy} onQuote={() => {}} onDelete={() => {}} onBookmark={() => {}} onShare={() => {}}
          onRetry={onRetry ? () => onRetry(msg.id) : undefined}
          onInfo={msg.metadata ? () => onOpenPanel('chatDetail', msg) : undefined}
          ctxMenuOpen={ctxMenu} onOpenChange={setCtxMenu}
          retryCount={totalVersions}
          activeRetryIndex={activeIdx}
          onRetryNav={onRetryNav ? (idx) => onRetryNav(msg.id, idx) : undefined}
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
      <ChevronRight size={10} className="text-muted-foreground/40 flex-shrink-0" />
      <div className="flex items-center gap-1 px-1.5 py-[3px] text-xs text-muted-foreground max-w-[220px]">
        <MessageCircle size={9} className="text-muted-foreground/50 flex-shrink-0" />
        <span className="truncate">{activeTopic.title}</span>
      </div>
    </div>
  );
}

type SelectMode = 'assistant' | 'model';

function MultiSelectPicker({
  selectedModels, onSelectModel, multiModel, onToggleMultiModel, onConnectProvider,
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
  onConfigureAssistant?: (id: string) => void;
  onConnectProvider?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const activeModel = ASSISTANT_MODELS.find(m => m.id === selectedModels[0]);

  return (
    <div className="flex items-center gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="inline"
            className={`gap-1.5 px-1.5 py-[3px] text-xs ${
              open ? 'bg-accent/25 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
            }`}>
            {activeModel && <BrandLogo id={activeModel.provider.toLowerCase()} fallbackLetter={activeModel.provider[0]} size={14} className="shrink-0" />}
            <span className="truncate max-w-[240px]">
              {selectedModels.length > 1 ? `${selectedModels.length} 个模型` : activeModel?.name || '选择模型'}
            </span>
            {selectedModels.length > 1 && <span className="w-4 h-4 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center flex-shrink-0">{selectedModels.length}</span>}
            <ChevronDown size={7} className={`text-muted-foreground/50 transition-transform duration-100 ${open ? 'rotate-180' : ''}`} />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-0 w-[420px]">
          <ModelPickerPanel
            selectedModels={selectedModels}
            onSelectModel={onSelectModel}
            multiModel={multiModel}
            onToggleMultiModel={onToggleMultiModel}
            onClose={() => setOpen(false)}
            onConnectProvider={onConnectProvider ? () => { setOpen(false); onConnectProvider(); } : undefined}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ===========================
// Assistant Run Page
// ===========================

export function AssistantRunPage() {
  const { editAssistantInLibrary: onEditAssistantInLibrary, navigateToKnowledge: onNavigateToKnowledge, navigateToLibrary: _navLib, changeTabTitle: onTabTitleChange, openSettings: onOpenSettings, launchpadOpen } = useGlobalActions();
  const onNavigateToLibrary = () => _navLib('assistant');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const [queuedMessages, setQueuedMessages] = useState<{ id: string; text: string }[]>([]);



  // Multi-select state — driven entirely by the @ mention picker
  const [selectedAssistants, setSelectedAssistants] = useState<string[]>(['ast-1']);
  const [selectedModels, setSelectedModels] = useState<string[]>(['gemini-3-pro-image']);
  // Chat defaults to multi-select for both assistants and models so the @
  // picker shows checkboxes immediately (single-pick remains available via
  // the in-panel Switch).
  const [multiAssistant, setMultiAssistant] = useState(true);
  const [multiModel, setMultiModel] = useState(true);

  // Topics
  const [topics, setTopics] = useState<AssistantTopic[]>(MOCK_TOPICS);
  const [activeTopicId, setActiveTopicId] = useState<string | null>('new-topic-init');
  const [newTopicCounter, setNewTopicCounter] = useState(1);

  // Ensure there's always an initial "新话题" — 挂到默认助手名下，保证
  // 左栏助手树里能看到它（挂在不存在的助手下会从树形视图消失）。
  useEffect(() => {
    if (!topics.find(t => t.id === 'new-topic-init')) {
      setTopics(prev => [{
        id: 'new-topic-init',
        title: '新话题',
        assistantName: MOCK_ASSISTANTS[0].name,
        lastMessage: '',
        timestamp: '刚刚',
        messageCount: 0,
        status: 'active' as const,
      }, ...prev]);
    }
  }, []);

  const activeTopic = useMemo(() => topics.find(t => t.id === activeTopicId), [topics, activeTopicId]);

  const handleNewTopic = useCallback(() => {
    // \u65b0\u8bdd\u9898\u6302\u5230\u5f53\u524d\u9009\u4e2d\u52a9\u624b\u540d\u4e0b\uff08\u5de6\u680f\u52a9\u624b\u6811\u6309 assistantName \u5f52\u7ec4\uff0c\u6302\u5728
    // \u4e0d\u5b58\u5728\u7684\u52a9\u624b\u4e0b\u4f1a\u4ece\u6811\u5f62\u89c6\u56fe\u6d88\u5931\uff09\u3002
    const ownerName = (MOCK_ASSISTANTS.find(a => a.id === selectedAssistants[0]) || MOCK_ASSISTANTS[0]).name;
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
      return;
    }
    const newId = `new-topic-${Date.now()}-${newTopicCounter}`;
    const newTopic: AssistantTopic = {
      id: newId,
      title: '新话题',
      assistantName: ownerName,
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
    setNewTopicCounter(c => c + 1);
  }, [newTopicCounter, selectedAssistants, activeTopic, topics]);

  const currentAssistant = useMemo(() => MOCK_ASSISTANTS.find(a => a.id === selectedAssistants[0]) || MOCK_ASSISTANTS[0], [selectedAssistants]);
  // Topics belong to the selected assistant — switching assistants changes the list.
  const assistantTopics = useMemo(
    () => topics.filter(t => t.assistantName === currentAssistant.name),
    [topics, currentAssistant],
  );
  const currentModel = useMemo(() => ASSISTANT_MODELS.find(m => m.id === selectedModels[0]) || ASSISTANT_MODELS[0], [selectedModels]);
  const currentAssistantEmoji = ASSISTANT_EMOJI_MAP[currentAssistant.name] || '🤖';
  const currentModelDisplayName = currentModel.name.split('/').pop() || currentModel.name;

  // Copy branch node as new topic — inherits messages up to (and including) the node
  const handleCopyAsTopic = useCallback((truncatedMessages: Message[], _sourceNodeId: string) => {
    const newId = `branch-topic-${Date.now()}`;
    const firstMsg = truncatedMessages[0]?.content?.slice(0, 20) || '分支话题';
    const newTopic: AssistantTopic = {
      id: newId,
      title: firstMsg,
      assistantName: currentAssistant.name,
      lastMessage: truncatedMessages[truncatedMessages.length - 1]?.content?.slice(0, 50) || '',
      timestamp: '刚刚',
      messageCount: truncatedMessages.length,
      status: 'active' as const,
    };
    setTopics(prev => [newTopic, ...prev]);
    setActiveTopicId(newId);
    setMessages([...truncatedMessages]);
    setActiveArtifact(null);
    setShowArtifacts(false);
    setArtifactFullscreen(false);
    setActiveBranchId('main');
  }, [currentAssistant]);

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
  // Pinned 话题 popover uses a narrower default so it reads as a 浮窗, not a
  // flush wide dock; topics and 创作物 each keep their own resize state.
  const [topicPanelWidth, setTopicPanelWidth] = useState(320);
  // The right dock is a shared module — 话题 / 文件 / 侧边聊天 / 浏览器 / 终端,
  // switched by a vertical tab rail on its right edge. null = hidden.
  type DockTab = 'topics' | 'artifacts' | 'settings';
  // Remember whether the 话题 list was left docked open (per the Syncless-style
  // persistent side panel). Restored on page entry.
  const [topicsDockPref, setTopicsDockPref] = useDockPreference('cherry-chat-topics-dock');
  const [dockTab, setDockTab] = useState<DockTab | null>(topicsDockPref ? 'topics' : null);
  const artifactResizing = useRef(false);
  const artifactContainerRef = useRef<HTMLDivElement>(null);

  const handleArtifactResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    artifactResizing.current = true;
    const startX = e.clientX;
    const isTopic = dockTab === 'topics';
    const startW = isTopic ? topicPanelWidth : artifactPanelWidth;
    const setW = isTopic ? setTopicPanelWidth : setArtifactPanelWidth;
    const minW = isTopic ? 260 : 280;
    const onMove = (ev: MouseEvent) => {
      if (!artifactResizing.current) return;
      const containerRect = artifactContainerRef.current?.getBoundingClientRect();
      const containerCap = containerRect ? containerRect.width * 0.65 : 800;
      const maxW = isTopic ? Math.min(560, containerCap) : containerCap;
      const newW = Math.max(minW, Math.min(maxW, startW - (ev.clientX - startX)));
      setW(newW);
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
  }, [dockTab, artifactPanelWidth, topicPanelWidth]);
  const historySidebar = useHistorySidebar('compact');
  const [showCreateAssistant, setShowCreateAssistant] = useState(false);
  // "No model configured" demo state; connecting a provider flips it back.
  const [modelConfigured, setModelConfigured] = useState(true);
  const openProviderSetup = useCallback(
    () => openQuickProviderSetup({ onSaved: () => setModelConfigured(true) }),
    [],
  );
  const [showBranchTree, setShowBranchTree] = useState(false);
  const [minimalInput, setMinimalInput] = useState(true);
  const [toolbarExpanded, setToolbarExpanded] = useState(true);
  const [composerModelOpen, setComposerModelOpen] = useState(false);
  const [reasoningLevel, setReasoningLevel] = useState<string | null>(null);

  // Toolbar tool definitions — secondary tools are reorderable
  const defaultSecondaryTools = [
    { id: 'mcp', label: 'MCP', icon: Hammer },
    { id: 'scan', label: '截图', icon: ScanLine },
    { id: 'pen', label: '画笔', icon: PenTool },
    { id: 'genimg', label: '生成图片', icon: ImageIcon },
    { id: 'reasoning', label: '思考', icon: Lightbulb },
    { id: 'quickphrase', label: '快捷短语', icon: Zap },
    { id: 'code', label: '代码', icon: Code2 },
    { id: 'webctx', label: '网页上下文', icon: Link },
    { id: 'clearctx', label: '清除上下文', icon: Eraser },
  ];
  const [secondaryToolOrder, setSecondaryToolOrder] = useState(defaultSecondaryTools.map(t => t.id));
  // Image-gen tool state
  const [imgResolution, setImgResolution] = useState<'1K' | '2K' | '4K'>('1K');
  const [imgAspect, setImgAspect] = useState<string>('1:1');
  const [imgCount, setImgCount] = useState<number>(1);
  const toolDragRef = useRef<{ dragging: string | null; over: string | null }>({ dragging: null, over: null });
  const orderedSecondaryTools = secondaryToolOrder.map(id => defaultSecondaryTools.find(t => t.id === id)!).filter(Boolean);
  const [activeBranchId, setActiveBranchId] = useState('main');

  type RightPanel = null | 'assistantInfo' | 'chatDetail' | 'rag' | 'search';
  const [rightPanel, setRightPanel] = useState<RightPanel>(null);
  const [historyInitialAssistant, setHistoryInitialAssistant] = useState<string | null>(null);
  const [inspectedMsg, setInspectedMsg] = useState<Message | null>(null);

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

  const { moveToBin, retentionDays } = useRecycleBin();
  const [pendingDeleteTopic, setPendingDeleteTopic] = useState<AssistantTopic | null>(null);

  const sendTopicToBin = useCallback((topic: AssistantTopic) => {
    setTopics(prev => prev.filter(t => t.id !== topic.id));
    if (activeTopicId === topic.id) handleNewTopic();
    moveToBin(
      {
        id: `bin-topic-${topic.id}-${Date.now()}`,
        type: 'topic',
        name: topic.title,
        icon: '💬',
        meta: topic.assistantName,
        source: 'manual',
      },
      {
        onUndo: () => setTopics(prev => [topic, ...prev]),
      },
    );
  }, [activeTopicId, handleNewTopic, moveToBin]);

  const handleDeleteTopic = useCallback((id: string) => {
    const topic = topics.find(t => t.id === id);
    if (!topic) return;
    setPendingDeleteTopic(topic);
  }, [topics]);

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
    // Load parallel messages for the multi-model / multi-assistant topics
    if (id === 'topic-11') {
      setMessages(MOCK_PARALLEL_MESSAGES);
    } else if (id === 'topic-39') {
      setMessages(MOCK_MULTI_ASSISTANT_MESSAGES);
    } else {
      setMessages(MOCK_MESSAGES);
    }
  }, []);

  // ===== 左栏（EntityRail）状态 — 与工作模块同构：展示方式/排序/手动顺序/
  // 标签分组/助手图标模式，全部按 localStorage 持久化 =====
  // 话题列表 = 全部话题平铺；助手列表 = 助手为组头、其下挂话题的树形。
  const [railDisplay, setRailDisplay] = usePersistedState<'topics' | 'assistants'>('cherry-chat-rail-display', 'assistants');
  const [railSort, setRailSort] = usePersistedState<'created' | 'updated' | 'manual'>('cherry-chat-rail-sort', 'manual');
  const [assistantOrder, setAssistantOrder] = usePersistedState<string[]>('cherry-chat-rail-assistant-order', []);
  const [topicOrder, setTopicOrder] = usePersistedState<string[]>('cherry-chat-rail-topic-order', []);
  // 标签分组 — 仅助手视图生效（Cherry 真实行为）：标签为段头、段内挂助手树。
  const [tagGrouping, setTagGrouping] = usePersistedState<boolean>('cherry-chat-rail-tag-group', true);
  const [assistantIconModes, setAssistantIconModes] = usePersistedState<Record<string, 'emoji' | 'model' | 'none'>>('cherry-chat-rail-icon-modes', {});
  const [hiddenAssistants, setHiddenAssistants] = useState<Set<string>>(() => new Set());
  // 管理助手页（筛选菜单进入），接管内容区。
  const [showAssistantManage, setShowAssistantManage] = useState(false);
  // 话题重命名（行右键菜单）。
  const [renameTopicTarget, setRenameTopicTarget] = useState<AssistantTopic | null>(null);
  const [renameTopicValue, setRenameTopicValue] = useState('');
  // 话题列表位置（左/右）— 布局级全局开关：话题要么挂在左栏（助手树下 +
  // 置顶段），要么整体进右侧「话题」面板。选右侧时左栏只当助手目录。
  const [topicListPosition, setTopicListPositionRaw] = usePersistedState<'left' | 'right'>('cherry-chat-topic-list-position', 'left');
  const setTopicListPosition = useCallback((pos: 'left' | 'right') => {
    setTopicListPositionRaw(pos);
    // 切到右侧立即展开右栏话题面板（让用户看到列表去了哪）；切回左侧时收起。
    if (pos === 'right') { setDockTab('topics'); setTopicsDockPref(true); }
    else { setDockTab(prev => (prev === 'topics' ? null : prev)); setTopicsDockPref(false); }
  }, [setTopicListPositionRaw, setTopicsDockPref]);

  // ===== 左栏数据组装（与工作模块 railSections 同构） =====
  const visibleAssistants = useMemo(
    () => applyOrder(MOCK_ASSISTANTS.filter(a => !hiddenAssistants.has(a.id)), assistantOrder),
    [hiddenAssistants, assistantOrder],
  );
  const orderedTopics = useMemo(() => {
    // 归档的话题不进左栏（话题历史页仍可见）。
    const visible = topics.filter(t => !t.archived);
    const base = railSort === 'manual'
      ? applyOrder(visible, topicOrder)
      : visible; // 创建/更新时间：mock 时间戳为人读文案，保持默认序（已按最近排列）
    // 置顶话题冒泡到最前（树形视图下即各自分组内的最前），相对顺序不变。
    return [...base.filter(t => t.pinned), ...base.filter(t => !t.pinned)];
  }, [topics, railSort, topicOrder]);
  const unpinnedTopics = useMemo(() => orderedTopics.filter(t => !t.pinned), [orderedTopics]);
  // 话题行一律纯文字（Codex 式）——归属信息由段/分组表达。
  const topicToRow = (t: AssistantTopic): EntityRailItem => ({ id: t.id, name: t.title, avatar: '' });
  const pinnedTopicRows = useMemo<EntityRailItem[]>(
    () => orderedTopics.filter(t => t.pinned).map(topicToRow),
    [orderedTopics],
  );
  // 助手树形分组：助手组头 + 其话题子行。
  const assistantTreeGroups = useMemo<EntityRailTreeGroup[]>(
    () => visibleAssistants.map(a => ({
      key: a.id,
      name: a.name,
      avatar: ASSISTANT_EMOJI_MAP[a.name] || '🤖',
      children: unpinnedTopics.filter(t => t.assistantName === a.name).map(topicToRow),
    })),
    [visibleAssistants, unpinnedTopics],
  );
  const chatRailSections = useMemo<EntityRailSection[]>(() => {
    const pinnedSection: EntityRailSection = {
      key: 'pinned', label: '置顶', items: pinnedTopicRows, rowsDraggable: false, limitRows: false,
    };
    if (railDisplay === 'topics') {
      return [pinnedSection, { key: 'topics', label: '话题', items: unpinnedTopics.map(topicToRow) }];
    }
    // 助手视图。话题列表在右侧时左栏只当「助手目录」：不再重复展示话题，
    // 置顶段（属于话题列表的一部分）也一并隐藏。
    const emptied = topicListPosition === 'right';
    const groupsOf = (gs: EntityRailTreeGroup[]) => (emptied ? gs.map(g => ({ ...g, children: [] })) : gs);
    if (!tagGrouping) {
      const sec: EntityRailSection = { key: 'assistants', label: '助手', groups: groupsOf(assistantTreeGroups) };
      return emptied ? [sec] : [pinnedSection, sec];
    }
    // 标签分组：每个标签一段（段头即标签名），段内挂该标签下的助手树；
    // 多标签助手在每个标签下都出现；无标签助手归入「未分组」。
    const byTag = new Map<string, EntityRailTreeGroup[]>();
    visibleAssistants.forEach((a, i) => {
      const g = assistantTreeGroups[i];
      const tags = a.tags.length > 0 ? a.tags : ['未分组'];
      tags.forEach(tag => byTag.set(tag, [...(byTag.get(tag) ?? []), g]));
    });
    const tagSections: EntityRailSection[] = Array.from(byTag.entries()).map(([tag, gs]) => ({
      key: `tag-${tag}`, label: tag, groups: groupsOf(gs),
    }));
    return emptied ? tagSections : [pinnedSection, ...tagSections];
  }, [railDisplay, tagGrouping, topicListPosition, pinnedTopicRows, unpinnedTopics, assistantTreeGroups, visibleAssistants]);

  // ===== 左栏菜单处理器 =====
  // 新话题挂到指定助手（组头 hover 的新会话按钮）——同时切到该助手。
  const handleNewTopicFor = useCallback((assistant: AssistantInfo) => {
    setSelectedAssistants([assistant.id]);
    const existingNew = topics.find(t => t.title === '新话题' && t.messageCount === 0 && t.assistantName === assistant.name);
    const reset = () => {
      setMessages([]);
      setActiveArtifact(null);
      setShowArtifacts(false);
      setArtifactFullscreen(false);
      setRightPanel(null);
      setShowBranchTree(false);
    };
    if (existingNew) { setActiveTopicId(existingNew.id); reset(); return; }
    const newId = `new-topic-${Date.now()}-${assistant.id}`;
    setTopics(prev => [{
      id: newId, title: '新话题', assistantName: assistant.name,
      lastMessage: '', timestamp: '刚刚', messageCount: 0, status: 'active' as const,
    }, ...prev]);
    setActiveTopicId(newId);
    reset();
  }, [topics]);
  // 清空该助手名下的全部话题（组头「…」菜单）。
  const handleClearTopicsOf = useCallback((assistantId: string) => {
    const a = MOCK_ASSISTANTS.find(x => x.id === assistantId);
    if (!a) return;
    const clearingActive = !!activeTopic && activeTopic.assistantName === a.name;
    setTopics(prev => prev.filter(t => t.assistantName !== a.name));
    if (clearingActive) handleNewTopic();
  }, [activeTopic, handleNewTopic]);
  const handlePinTopAssistant = useCallback((id: string) => {
    setAssistantOrder([id, ...visibleAssistants.map(a => a.id).filter(x => x !== id)]);
  }, [visibleAssistants, setAssistantOrder]);
  const setAssistantIconMode = useCallback((key: string, mode: 'emoji' | 'model' | 'none') => {
    setAssistantIconModes({ ...assistantIconModes, [key]: mode });
  }, [assistantIconModes, setAssistantIconModes]);
  const handleDeleteAssistant = useCallback((id: string) => {
    setHiddenAssistants(prev => new Set(prev).add(id));
    // 删除的是当前助手时退到列表里第一个其它助手。
    setSelectedAssistants(prev => {
      const rest = prev.filter(x => x !== id);
      if (rest.length > 0) return rest;
      const fallback = MOCK_ASSISTANTS.find(a => a.id !== id && !hiddenAssistants.has(a.id));
      return fallback ? [fallback.id] : prev;
    });
  }, [hiddenAssistants]);
  // 话题列表位置的读写句柄（右键菜单 & 筛选菜单共用；id 参数仅为
  // EntityRail 行级接口兼容，实际是全局开关）。
  const topicPositionApi = useMemo(() => ({
    get: (_id: string): 'left' | 'right' => topicListPosition,
    set: (_id: string, pos: 'left' | 'right') => setTopicListPosition(pos),
  }), [topicListPosition, setTopicListPosition]);
  // 话题行右键菜单（重命名/置顶/归档/新标签页/新窗口/话题列表位置/删除）。
  const topicContextMenu = useMemo(() => ({
    rowLabel: '话题',
    positionLabel: '话题列表位置',
    onRename: (id: string) => {
      const t = topics.find(x => x.id === id);
      if (t) { setRenameTopicTarget(t); setRenameTopicValue(t.title); }
    },
    isPinned: (id: string) => !!topics.find(x => x.id === id)?.pinned,
    onTogglePin: (id: string) => {
      const t = topics.find(x => x.id === id);
      if (t) handleUpdateTopic(id, { pinned: !t.pinned });
    },
    onArchive: (id: string) => handleUpdateTopic(id, { archived: true }),
    // 原型行为：新标签页 = 应用内再开一个「对话」tab；新窗口 = 浏览器新窗口。
    onOpenInNewTab: (_id: string) => launchpadOpen('chat'),
    onOpenInNewWindow: (_id: string) => { window.open(window.location.href, '_blank', 'width=1280,height=800'); },
    onDelete: (id: string) => handleDeleteTopic(id),
  }), [topics, handleUpdateTopic, handleDeleteTopic, launchpadOpen]);

  // Active artifact — opened by clicking artifact indicators in messages
  const [activeArtifact, setActiveArtifact] = useState<ArtifactData | null>(null);

  const handleOpenArtifact = useCallback((artifact: ArtifactData) => {
    setActiveArtifact(artifact);
    setShowArtifacts(true);
    setArtifactFullscreen(false);
    setDockTab('artifacts');
  }, []);

  const handleCloseArtifacts = useCallback(() => {
    setShowArtifacts(false);
    setArtifactFullscreen(false);
    setDockTab((d) => (d === 'artifacts' ? null : d));
  }, []);

  // Header file history dropdown
  const [showHeaderFileHistory, setShowHeaderFileHistory] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composerRef = useRef<RichComposerHandle>(null);

  // Inline attachment chips that sit beside the user-typed text in the
  // RichComposer. Pre-seeded with one of each major category so the UI
  // demonstrates the design at a glance; new ones are appended via the
  // Paperclip button.
  const [inlineAttachments, setInlineAttachments] = useState<ComposerAttachment[]>([
    {
      id: 'demo-img',
      name: 'dashboard-mockup.png',
      ext: 'png',
      size: '1.8 MB',
      previewUrl: 'https://images.unsplash.com/photo-1766934587214-86e21b3ae093?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=320',
    },
    {
      id: 'demo-doc',
      name: 'design-spec.md',
      ext: 'md',
      size: '4.2 KB',
      snippet: '# 仪表盘设计规范\n\n- 主色调：#2563EB / #F59E0B\n- 字体：Inter, system-ui\n- 卡片圆角：12px ...',
    },
    {
      id: 'demo-pdf',
      name: '品牌指南.pdf',
      ext: 'pdf',
      size: '5.6 MB',
      snippet: '完整的品牌识别系统手册，包含 logo 使用规范、配色系统与排版规则。',
    },
  ]);

  // Demo file pool that the Paperclip button cycles through when clicked
  const demoAttachmentPool = useRef<Omit<ComposerAttachment, 'id'>[]>([
    { name: 'analytics.xlsx', ext: 'xlsx', size: '230 KB', snippet: '过去 30 天的产品 KPI 表，含 1,024 行数据。' },
    { name: 'demo-clip.mp4', ext: 'mp4', size: '12.4 MB', snippet: '产品演示视频，时长 2:38。' },
    { name: 'reference.zip', ext: 'zip', size: '3.1 MB', snippet: '5 张参考图 + 1 份样例数据 JSON。' },
    { name: 'voice-memo.m4a', ext: 'm4a', size: '892 KB', snippet: '产品负责人的录音备注，时长 1:24。' },
    { name: 'server.ts', ext: 'ts', size: '6.8 KB', snippet: 'Express + tRPC 路由初始化文件，183 行。' },
  ]);
  const demoPoolCursor = useRef(0);

  const addDemoAttachment = useCallback(() => {
    const pool = demoAttachmentPool.current;
    if (pool.length === 0) return;
    const next = pool[demoPoolCursor.current % pool.length];
    demoPoolCursor.current += 1;
    setInlineAttachments(prev => [...prev, { ...next, id: `att-${Date.now()}-${prev.length}` }]);
    composerRef.current?.focus();
  }, []);

  const removeInlineAttachment = useCallback((id: string) => {
    setInlineAttachments(prev => prev.filter(a => a.id !== id));
  }, []);

  // Plus & @ menu state
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showPlusMore, setShowPlusMore] = useState(false);
  const [showAtMenu, setShowAtMenu] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const plusBtnRef = useRef<HTMLButtonElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);

  const plusMenuItems = [
    { id: 'attach', label: '添加图片或附件', icon: Paperclip, separator: true },
    { id: 'genimg', label: '生成图片', icon: ImageIcon },
    { id: 'knowledge', label: '知识库', icon: BookOpen },
    { id: 'mcp', label: 'MCP', icon: Hammer },
  ];
  // Thinking effort cascade — submenu under 思考.
  // Distinct brain-family icons that visibly ramp in complexity:
  //   默认 — Minus         (no thinking — neutral dash)
  //   浮想 — Brain         (brain alive)
  //   斟酌 — BrainCircuit  (brain + circuits — actively reasoning)
  //   沉思 — BrainCog      (brain + cog — deepest deliberation)
  const thinkingEfforts: { id: string; label: string; Icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }> }[] = [
    { id: 'default', label: '默认', Icon: Minus },
    { id: 'low',     label: '浮想', Icon: Brain },
    { id: 'mid',     label: '斟酌', Icon: BrainCircuit },
    { id: 'high',    label: '沉思', Icon: BrainCog },
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

  // Inner send: actually pushes the user message and simulates a response
  const performSend = useCallback((text: string) => {
    const ts = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const activeModel = ASSISTANT_MODELS.find(m => m.id === selectedModels[0]) || ASSISTANT_MODELS[0];

    setMessages(prev => [...prev, { id: `msg-${Date.now()}`, role: 'user', content: text, timestamp: ts }]);
    setIsResponding(true);

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
        setIsResponding(false);
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
        setIsResponding(false);
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
        setIsResponding(false);
      }, 800);
    }
  }, [selectedModels, selectedAssistants]);

  // Public send: routes to queue when responding, else fires immediately
  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    if (isResponding) {
      setQueuedMessages(prev => [...prev, { id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text: trimmed }]);
    } else {
      performSend(trimmed);
    }
  }, [input, isResponding, performSend]);

  // Auto-flush queue when assistant becomes idle
  const queueRef = useRef(queuedMessages);
  queueRef.current = queuedMessages;
  useEffect(() => {
    if (!isResponding && queueRef.current.length > 0) {
      const next = queueRef.current[0];
      setQueuedMessages(prev => prev.slice(1));
      performSend(next.text);
    }
  }, [isResponding, performSend]);

  const removeQueueItem = useCallback((id: string) => setQueuedMessages(prev => prev.filter(m => m.id !== id)), []);
  const moveQueueItemUp = useCallback((id: string) => setQueuedMessages(prev => {
    const idx = prev.findIndex(m => m.id === id);
    if (idx <= 0) return prev;
    const next = [...prev];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    return next;
  }), []);
  const editQueueItem = useCallback((id: string) => {
    setQueuedMessages(prev => {
      const item = prev.find(m => m.id === id);
      if (!item) return prev;
      const existing = input.trim();
      const filtered = prev.filter(m => m.id !== id);
      setInput(item.text);
      if (existing) return [{ id: `q-${Date.now()}`, text: existing }, ...filtered];
      return filtered;
    });
  }, [input]);
  const clearQueue = useCallback(() => setQueuedMessages([]), []);

  // Retry: create a new version of an assistant message
  const handleRetry = useCallback((msgId: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id !== msgId || msg.role !== 'assistant') return msg;
      const ts = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      const versions = msg.retryVersions || [];
      const newVersion: Message = {
        id: `retry-${Date.now()}`,
        role: 'assistant',
        content: `[重试版本 ${versions.length + 2}] ${msg.content?.split('\n')[0] || '重新生成的回答'}...\n\n这是对同一问题的重新生成回答，提供了不同的视角和分析。`,
        timestamp: ts,
        assistantLabel: msg.assistantLabel,
        thinking: '重新分析问题...\n从不同角度思考...\n生成新的回答...',
      };
      return {
        ...msg,
        retryVersions: [...versions, newVersion],
        activeRetryIndex: versions.length + 1, // Switch to the new version (0 = original, 1+ = retries)
      };
    }));
  }, []);

  // Navigate between retry versions
  const handleRetryNav = useCallback((msgId: string, index: number) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id !== msgId) return msg;
      return { ...msg, activeRetryIndex: index };
    }));
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && showAtMenu) { e.preventDefault(); setShowAtMenu(false); return; }
    if (e.key === 'Escape' && showSlashMenu) { e.preventDefault(); setShowSlashMenu(false); return; }
    // @ opens the assistant/model picker (RichComposer doesn't expose an
    // onChange, so we sniff the key directly). Consume the `@` so the picker
    // is the sole affordance.
    if (e.key === '@' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      setShowAtMenu(true);
      setShowSlashMenu(false);
      setShowPlusMenu(false);
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Slash command prompt templates
  const SLASH_PROMPTS = [
    { id: 'translate', label: '翻译', desc: '将内容翻译成目标语言', prompt: '请将以下内容翻译成英文：\n' },
    { id: 'summarize', label: '总结', desc: '总结核心要点', prompt: '请总结以下内容的核心要点：\n' },
    { id: 'explain', label: '解释', desc: '用简单语言解释', prompt: '请用简单易懂的语言解释以下内容：\n' },
    { id: 'rewrite', label: '改写', desc: '优化文字表达', prompt: '请改写以下内容，使其更加专业流畅：\n' },
    { id: 'code-review', label: '代码审查', desc: '审查代码质量', prompt: '请审查以下代码，指出潜在问题并给出优化建议：\n' },
    { id: 'brainstorm', label: '头脑风暴', desc: '生成创意想法', prompt: '请围绕以下主题进行头脑风暴，给出5个创意方向：\n' },
  ];

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
          setShowSlashMenu(false);
          // Remove the @ from input
          setInput(val.slice(0, -1));
          return;
        }
      }
      // Detect / typed at start of input
      if (lastChar === '/' && val.length === 1) {
        setShowSlashMenu(true);
        setShowAtMenu(false);
        setShowPlusMenu(false);
        setInput('');
        return;
      }
    }
    setInput(val);
    const el = e.target; el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  };

  const handleOpenPanel = useCallback((panel: 'chatDetail' | 'rag' | 'search', msg: Message) => {
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

  // 话题 list — a minimal, narrow dock that mirrors the 工作 (agent) 会话 list:
  // just a close button at the top-right; the flat list shows directly below
  // (no group headers, no per-row icon, pinned rows flagged with a pin glyph on
  // the right, only the "…" hover action). Selecting a topic keeps it open.
  const closeTopicDock = () => { setDockTab(null); setTopicsDockPref(false); };
  const renderTopicList = () => (
    <HistorySidebar
      items={assistantTopics}
      activeItemId={activeTopicId}
      onSelectItem={(id) => handleSelectTopic(id)}
      onDeleteItem={handleDeleteTopic}
      onUpdateItem={handleUpdateTopic}
      onNewItem={() => handleNewTopic()}
      onExpand={() => { setHistoryInitialAssistant(null); historySidebar.expand(); closeTopicDock(); }}
      onClose={closeTopicDock}
      entityLabel="话题"
      hideGroupBy
      plainList
      headerActions={
        <Tooltip content="关闭" side="bottom">
          <Button variant="ghost" size="icon-xs" onClick={closeTopicDock}
            className="text-muted-foreground/40 hover:text-foreground hover:bg-accent/40">
            <X size={11} />
          </Button>
        </Tooltip>
      }
    />
  );

  return (
    <div className="flex h-full bg-background select-none relative">
      {/* ===== Left: Assistant list rail (compact) ===== */}
      <AnimatePresence initial={false}>
        {historySidebar.isCompact && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="flex-shrink-0 min-w-0 overflow-hidden h-full border-r border-border/40 bg-foreground/[0.015]"
            style={{ width: 220 }}
          >
            <EntityRail
              title="助手"
              searchable={false}
              filterable={false}
              newLabel={railDisplay === 'assistants' ? '添加助手' : '新建话题'}
              newAsRow
              newActions={railDisplay === 'assistants' ? [
                { id: 'assistant', label: '添加助手', icon: Bot, onClick: () => setShowCreateAssistant(true) },
              ] : [
                { id: 'topic', label: '新建话题', icon: MessageSquarePlus, onClick: handleNewTopic },
              ]}
              railMenu={{
                displayModes: {
                  options: [
                    { id: 'topics', label: '话题列表' },
                    { id: 'assistants', label: '助手列表' },
                  ],
                  value: railDisplay,
                  onChange: (id) => setRailDisplay(id as 'topics' | 'assistants'),
                },
                sortModes: {
                  options: [
                    { id: 'created', label: '创建时间' },
                    { id: 'updated', label: '更新时间' },
                    { id: 'manual', label: '手动排序' },
                  ],
                  value: railSort,
                  onChange: (id) => setRailSort(id as 'created' | 'updated' | 'manual'),
                },
                ...(railDisplay === 'assistants' ? {
                  taskPosition: {
                    label: '话题列表位置',
                    options: [
                      { id: 'left', label: '左侧' },
                      { id: 'right', label: '右侧' },
                    ],
                    value: topicListPosition,
                    onChange: (id: string) => setTopicListPosition(id as 'left' | 'right'),
                  },
                } : {}),
                expandCollapse: true,
                actions: [
                  { id: 'history', label: '历史话题', onClick: () => { setHistoryInitialAssistant(null); historySidebar.expand(); } },
                  { id: 'manage', label: '管理助手', onClick: () => setShowAssistantManage(true) },
                ],
              }}
              sections={chatRailSections}
              persistKey="chat"
              activeGroupKey={railDisplay === 'assistants' && !showAssistantManage ? selectedAssistants[0] : null}
              onGroupSelect={(key) => {
                // 助手组头 → 切换当前助手。
                setShowAssistantManage(false);
                setSelectedAssistants([key]);
              }}
              onReorderGroups={railDisplay === 'assistants' ? setAssistantOrder : undefined}
              onReorderItems={(ids) => {
                // 话题任何时候都可拖；拖动即隐式切到「手动排序」（Codex 式）。
                setTopicOrder(ids);
                if (railSort !== 'manual') setRailSort('manual');
              }}
              rowContextMenu={{
                ...topicContextMenu,
                // 「话题列表位置」子菜单只在助手列表视图出现。
                position: railDisplay === 'assistants' ? topicPositionApi : undefined,
              }}
              groupHoverMenu={{
                onNewSession: (key) => {
                  const a = MOCK_ASSISTANTS.find(x => x.id === key);
                  if (a) handleNewTopicFor(a); else handleNewTopic();
                },
                expert: {
                  label: '助手',
                  onEdit: (key) => { setShowAssistantManage(false); setSelectedAssistants([key]); setRightPanel('assistantInfo'); },
                  onPinTop: handlePinTopAssistant,
                  onClearTopics: handleClearTopicsOf,
                  iconMode: {
                    get: (key) => assistantIconModes[key] ?? 'emoji',
                    set: setAssistantIconMode,
                  },
                  // 标签分组开关 — 仅助手视图下出现在组头菜单里。
                  tagGrouping: { enabled: tagGrouping, onToggle: () => setTagGrouping(!tagGrouping) },
                  onDelete: handleDeleteAssistant,
                },
              }}
              items={[]}
              activeId={showAssistantManage ? null : activeTopicId}
              onSelect={(id) => {
                // 所有行都是话题——打开话题并切到其所属助手。
                const t = topics.find(x => x.id === id);
                if (!t) return;
                const owner = MOCK_ASSISTANTS.find(a => a.name === t.assistantName);
                if (owner) setSelectedAssistants([owner.id]);
                setShowAssistantManage(false);
                handleSelectTopic(id);
              }}
              onEdit={(id) => { setSelectedAssistants([id]); setRightPanel('assistantInfo'); }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Right: Header + Content ===== */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0 relative">
        {/* 管理助手页（筛选菜单进入）接管内容区；向导/回收站等弹窗不受影响。 */}
        {showAssistantManage ? (
          <AssistantManagePage
            assistants={visibleAssistants}
            emojiOf={(name) => ASSISTANT_EMOJI_MAP[name] || '🤖'}
            onBack={() => setShowAssistantManage(false)}
            onOpen={(id) => { setSelectedAssistants([id]); setShowAssistantManage(false); }}
            onEdit={(id) => { setSelectedAssistants([id]); setShowAssistantManage(false); setRightPanel('assistantInfo'); }}
            onCreate={() => setShowCreateAssistant(true)}
          />
        ) : (<>
        {/* ===== Header ===== */}
        <header className="flex items-center px-3 flex-shrink-0 h-[40px]">
          {/* Assistant list rail toggle */}
          <Tooltip content={historySidebar.isCompact ? '收起助手列表' : '展开助手列表'} side="bottom">
            <Button variant="ghost" size="icon-xs" onClick={() => historySidebar.toggle()}
              className={`p-1.5 w-auto h-auto mr-1 ${historySidebar.isCompact ? 'text-muted-foreground hover:text-foreground hover:bg-accent/40' : 'text-muted-foreground/40 hover:text-foreground hover:bg-accent/40'}`}>
              {historySidebar.isCompact ? <PanelLeftClose size={16} strokeWidth={1.6} /> : <PanelLeftOpen size={16} strokeWidth={1.6} />}
            </Button>
          </Tooltip>
        <div className="flex-1" />
        <div className="flex items-center gap-0.5">
          {/* Topics for the selected assistant — opens the right dock to the
              话题 list. icon-only（与工作模块的会话按钮同构）。 */}
          <Tooltip content={dockTab === 'topics' ? '收起话题列表' : '话题列表'} side="bottom">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => { const open = dockTab !== 'topics'; setDockTab(open ? 'topics' : null); setTopicsDockPref(open); }}
              className={`p-1.5 w-auto h-auto ${
                dockTab === 'topics' ? 'bg-accent/25 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
              }`}
            >
              <MessageCircle size={16} strokeWidth={1.6} />
            </Button>
          </Tooltip>
          <div className="w-px h-3.5 bg-border/30 mx-0.5" />
          <Tooltip content={modelConfigured ? '演示：切到「未配置模型」状态' : '演示：恢复已配置状态'} side="bottom">
            <Button variant="ghost" size="icon-xs" onClick={() => setModelConfigured(v => !v)}
              className={`p-1.5 w-auto h-auto ${modelConfigured ? 'text-muted-foreground/40 hover:text-foreground hover:bg-accent/40' : 'text-foreground bg-accent/25'}`}>
              <FlaskConical size={16} strokeWidth={1.6} />
            </Button>
          </Tooltip>
          {hasMessages && (
            <>
              <div className="relative">
                <Tooltip content="历史文件" side="bottom"><Button variant="ghost" size="icon-xs" onClick={() => setShowHeaderFileHistory(v => !v)}
                  className={`p-1.5 w-auto h-auto ${showHeaderFileHistory ? 'text-foreground bg-accent/25' : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'}`}>
                  <File size={16} strokeWidth={1.6} />
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
                className={`p-1.5 w-auto h-auto ${showBranchTree ? 'text-foreground bg-accent/25' : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'}`}>
                <GitBranch size={16} strokeWidth={1.6} />
              </Button></Tooltip>
              <div className="w-px h-3.5 bg-border/30 mx-0.5" />
            </>
          )}
          <Tooltip content="参数设置" side="bottom"><Button variant="ghost" size="icon-xs" onClick={() => { const open = dockTab !== 'settings'; setDockTab(open ? 'settings' : null); if (open) setTopicsDockPref(false); }}
            className={`p-1.5 w-auto h-auto ${dockTab === 'settings' ? 'text-foreground bg-accent/25' : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'}`}>
            <Settings2 size={16} strokeWidth={1.6} />
          </Button></Tooltip>
          {/* 产物面板开关 — 常驻最右缘（与工作模块的预览面板按钮同构）。
              助手生成的 md/html 等产物在右侧面板浏览。 */}
          <div className="w-px h-3.5 bg-border/30 mx-0.5" />
          <Tooltip content={dockTab === 'artifacts' ? '收起产物面板' : '显示产物面板'} side="bottom">
            <Button variant="ghost" size="icon-xs"
              onClick={() => { const open = dockTab !== 'artifacts'; setDockTab(open ? 'artifacts' : null); if (open) setTopicsDockPref(false); }}
              className={`p-1.5 w-auto h-auto ${dockTab === 'artifacts' ? 'text-foreground bg-accent/25' : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'}`}>
              <PanelRightInsetIcon size={16} className="size-4" />
            </Button>
          </Tooltip>
        </div>
      </header>

      {/* ===== Main Content ===== */}
      <div ref={artifactContainerRef} className="flex flex-1 min-h-0 relative">
        {/* Fullscreen Artifacts */}
        <AnimatePresence>
          {artifactFullscreen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="absolute inset-0 z-[var(--z-sticky)] bg-background p-2">
              <div className="h-full rounded-2xl border border-border/30 bg-background shadow-lg overflow-hidden">
                <ArtifactsPanel artifact={activeArtifact} isFullscreen={true} onToggleFullscreen={() => setArtifactFullscreen(false)} onClose={handleCloseArtifacts} onSelectArtifact={handleOpenArtifact} hasTopic={activeTopicId !== null} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center: Chat */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <ChatInterface
            scrollDeps={[messages]}
            onSendMessage={() => handleSend()}
            hasMessages={hasMessages}
            messageListClassName="px-5"
            emptyState={
              !modelConfigured ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                    className="flex flex-col items-center max-w-[380px] w-full">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center mb-5">
                      <PlugZap size={22} strokeWidth={1.4} className="text-primary/70" />
                    </div>
                    <h2 className="text-sm text-foreground tracking-[-0.01em]">还没有可用的模型</h2>
                    <p className="text-xs text-muted-foreground/60 text-center leading-[1.6] mt-1.5">
                      连接一个服务商即可开始对话，填入 API Key 会自动拉取可用模型。
                    </p>
                    <Button variant="default" size="sm" onClick={openProviderSetup} className="mt-4 text-xs gap-1.5">
                      <Plus size={13} />连接服务商
                    </Button>
                  </motion.div>
                </div>
              ) : (
              <div className="flex-1 flex flex-col items-center justify-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                  className="flex flex-col items-center max-w-[360px] w-full">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-accent/60 to-accent/30 border border-border/30 flex items-center justify-center mb-5">
                    <Bot size={22} strokeWidth={1.3} className="text-muted-foreground/60" />
                  </div>
                  <h2 className="text-sm text-foreground tracking-[-0.01em]">你好，有什么需要帮助的？</h2>
                  <p className="text-xs text-muted-foreground/60 text-center leading-[1.6] mt-1.5">
                    向 {currentAssistant.name} 提问，支持生成文章、代码和可视化内���
                  </p>
                </motion.div>
              </div>
              )
            }
            customComposer={
              <>
              {/* Queued user messages — sit above the input, sent in order when assistant idles */}
              <AnimatePresence initial={false}>
                {queuedMessages.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex-shrink-0 px-4 pt-1 overflow-hidden"
                  >
                    <div className="rounded-xl border border-border/40 bg-muted/20 overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/30">
                        <div className="flex items-center gap-1.5">
                          <Clock size={10} className="text-muted-foreground/60" />
                          <span className="text-xs text-muted-foreground">待发送队列</span>
                          <span className="text-xs text-muted-foreground/60 tabular-nums">{queuedMessages.length}</span>
                        </div>
                        <button
                          type="button"
                          onClick={clearQueue}
                          className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors"
                        >
                          清空
                        </button>
                      </div>
                      <div className="max-h-[140px] overflow-y-auto">
                        {queuedMessages.map((m, i) => (
                          <div key={m.id} className="group/q flex items-center gap-2 px-3 py-1.5 hover:bg-accent/40 transition-colors border-b border-border/15 last:border-b-0">
                            <span className="w-4 text-[10px] text-muted-foreground/60 tabular-nums flex-shrink-0">{i + 1}</span>
                            <span className="flex-1 min-w-0 text-xs text-foreground truncate">{m.text}</span>
                            <div className="flex items-center gap-0.5 opacity-0 group-hover/q:opacity-100 transition-opacity flex-shrink-0">
                              {i > 0 && (
                                <button type="button" onClick={() => moveQueueItemUp(m.id)} title="上移"
                                  className="p-1 rounded text-muted-foreground/60 hover:text-foreground hover:bg-accent/40 transition-colors">
                                  <ArrowUp size={10} />
                                </button>
                              )}
                              <button type="button" onClick={() => editQueueItem(m.id)} title="编辑（取回到输入框）"
                                className="p-1 rounded text-muted-foreground/60 hover:text-foreground hover:bg-accent/40 transition-colors">
                                <Pencil size={10} />
                              </button>
                              <button type="button" onClick={() => removeQueueItem(m.id)} title="删除"
                                className="p-1 rounded text-muted-foreground/60 hover:text-destructive hover:bg-destructive/8 transition-colors">
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex-shrink-0 px-4 pb-3">
                <div className="relative rounded-xl border border-border/50 bg-background shadow-sm focus-within:border-border/50 transition-all duration-150">
                  <RichComposer
                    ref={composerRef}
                    attachments={inlineAttachments}
                    onRemoveAttachment={removeInlineAttachment}
                    placeholder={isResponding ? '助手回复中，发送的消息将加入队列…' : (minimalInput ? '在这里输入消息，附件可以与文字混合 — @ 选择助手 / 插入 Prompt' : '在这里输入消息 — @ 选择助手 / 模型 / 插入 Prompt')}
                    onKeyDown={handleKeyDown}
                  />
                  {/* / Slash Prompt Picker */}
                  {showSlashMenu && (
                    <div className="absolute bottom-full left-0 right-0 mb-1 z-10">
                      <div className="mx-2 rounded-xl border border-border/50 bg-background shadow-lg overflow-hidden">
                        <div className="px-3 py-2 border-b border-border/30 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground/60">插入 Prompt</span>
                          <button onClick={() => setShowSlashMenu(false)} className="text-muted-foreground/40 hover:text-foreground transition-colors">
                            <X size={12} />
                          </button>
                        </div>
                        <div className="max-h-[200px] overflow-y-auto py-1 scrollbar-thin-xs">
                          {SLASH_PROMPTS.map(item => (
                            <button
                              key={item.id}
                              onClick={() => {
                                setInput(item.prompt);
                                setShowSlashMenu(false);
                                textareaRef.current?.focus();
                              }}
                              className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-accent/50 transition-colors"
                            >
                              <span className="text-xs text-foreground font-medium whitespace-nowrap mt-[1px]">{item.label}</span>
                              <span className="text-xs text-muted-foreground/60 truncate">{item.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* @ Mention Picker — shared two-page panel (助手 / 模型 /
                      文件 / MCP). 助手 & 模型 picks update selection state;
                      文件 & MCP picks insert an @<label> token into the
                      composer. */}
                  {showAtMenu && (
                    <div className="absolute bottom-full left-0 right-0 mb-1 z-10">
                      <div className="mx-2 rounded-xl border border-border/50 bg-popover shadow-lg overflow-hidden max-h-[360px]">
                        <MentionPickerPanel
                          selectedAssistantIds={selectedAssistants}
                          selectedModelIds={selectedModels}
                          multiAssistant={multiAssistant}
                          multiModel={multiModel}
                          onToggleMultiAssistant={handleToggleMultiAssistant}
                          onToggleMultiModel={handleToggleMultiModel}
                          onPick={(pick) => {
                            if (pick.type === 'assistant') {
                              handleSelectAssistant(pick.id);
                            } else if (pick.type === 'model') {
                              handleSelectModel(pick.id);
                            } else {
                              // file / mcp → insert @<label> into the composer text
                              composerRef.current?.insertText(`@${pick.label} `);
                            }
                          }}
                          onClose={() => setShowAtMenu(false)}
                        />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-[7px] left-2.5 right-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {/* 新建会话 — 最左侧 */}
                      <Tooltip content="新建会话" side="top">
                        <button onClick={handleNewTopic} className="flex items-center p-[5px] rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
                          <MessageSquarePlus size={14} strokeWidth={1.5} />
                        </button>
                      </Tooltip>
                      {minimalInput ? null : (
                        /* Full toolbar mode */
                        <>
                          {/* Primary tools — always visible */}
                          <Tooltip content="添加附件（与文字混合插入）" side="top">
                            <Button variant="ghost" size="icon-sm" onClick={addDemoAttachment} className="p-[5px] w-auto h-auto text-muted-foreground hover:text-foreground hover:bg-accent/50"><Paperclip size={14} strokeWidth={1.5} /></Button>
                          </Tooltip>
                          <Tooltip content="网络搜索" side="top">
                            <Button variant="ghost" size="icon-sm" className="p-[5px] w-auto h-auto text-muted-foreground hover:text-foreground hover:bg-accent/50"><Globe size={14} strokeWidth={1.5} /></Button>
                          </Tooltip>
                          <Tooltip content="@提及" side="top">
                            <Button variant="ghost" size="icon-sm" onClick={() => setShowAtMenu(v => !v)} className="p-[5px] w-auto h-auto text-muted-foreground hover:text-foreground hover:bg-accent/50"><AtSign size={14} strokeWidth={1.5} /></Button>
                          </Tooltip>
                          <Tooltip content="知识库" side="top">
                            <Button variant="ghost" size="icon-sm" className="p-[5px] w-auto h-auto text-muted-foreground hover:text-foreground hover:bg-accent/50"><BookOpen size={14} strokeWidth={1.5} /></Button>
                          </Tooltip>
                          {/* Separator */}
                          <div className="w-px h-3.5 bg-border/40 mx-0.5" />
                          {/* Secondary tools — collapsible + draggable reorder */}
                          {toolbarExpanded && orderedSecondaryTools.map(tool => {
                            const Icon = tool.icon;
                            const isReasoning = tool.id === 'reasoning';
                            const isReasoningActive = isReasoning && reasoningLevel !== null;
                            const btnCls = `p-[5px] w-auto h-auto hover:text-foreground hover:bg-accent/50 cursor-grab active:cursor-grabbing ${
                              isReasoningActive ? 'text-success/70' : 'text-muted-foreground'
                            }`;
                            const btn = (
                              <div
                                key={tool.id}
                                draggable
                                onDragStart={() => { toolDragRef.current.dragging = tool.id; }}
                                onDragOver={(e) => { e.preventDefault(); toolDragRef.current.over = tool.id; }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const from = toolDragRef.current.dragging;
                                  const to = toolDragRef.current.over;
                                  if (from && to && from !== to) {
                                    setSecondaryToolOrder(prev => {
                                      const next = [...prev];
                                      const fi = next.indexOf(from);
                                      const ti = next.indexOf(to);
                                      if (fi === -1 || ti === -1) return prev;
                                      next.splice(fi, 1);
                                      next.splice(ti, 0, from);
                                      return next;
                                    });
                                  }
                                  toolDragRef.current = { dragging: null, over: null };
                                }}
                                onDragEnd={() => { toolDragRef.current = { dragging: null, over: null }; }}
                                className="inline-flex"
                              >
                                {isReasoning ? (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="ghost" size="icon-sm" className={btnCls}>
                                        <Icon size={14} strokeWidth={1.5} />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent side="top" align="start" className="w-[140px] p-1">
                                      <div className="text-xs text-muted-foreground/60 px-2 py-1">思考等级</div>
                                      {[
                                        { key: null, label: '关闭' },
                                        { key: 'low', label: '低' },
                                        { key: 'medium', label: '中' },
                                        { key: 'high', label: '高' },
                                      ].map(opt => (
                                        <Button key={opt.key ?? 'off'} variant="ghost" size="xs"
                                          onClick={() => setReasoningLevel(opt.key)}
                                          className={`w-full justify-start gap-2 px-2 ${reasoningLevel === opt.key ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                          <span className="flex-1 text-left">{opt.label}</span>
                                          {reasoningLevel === opt.key && <Check size={10} className="text-primary flex-shrink-0" />}
                                        </Button>
                                      ))}
                                    </PopoverContent>
                                  </Popover>
                                ) : tool.id === 'genimg' ? (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="ghost" size="icon-sm" className={btnCls}
                                        title={`生成图片 · ${imgResolution} · ${imgAspect} · ${imgCount} img`}>
                                        <Icon size={14} strokeWidth={1.5} />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent side="top" align="start" className="w-[280px] p-3 space-y-3">
                                      {/* Resolution */}
                                      <div>
                                        <div className="text-xs text-muted-foreground/80 mb-1.5">Resolution</div>
                                        <div className="flex items-center gap-1.5">
                                          {(['1K', '2K', '4K'] as const).map(r => {
                                            const active = imgResolution === r;
                                            return (
                                              <button key={r} type="button"
                                                onClick={() => setImgResolution(r)}
                                                className={`flex-1 py-1.5 rounded-md text-xs transition-colors border ${
                                                  active
                                                    ? 'bg-accent/40 border-border text-foreground'
                                                    : 'border-border/30 text-muted-foreground/80 hover:bg-accent/40 hover:text-foreground'
                                                }`}>
                                                {r}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                      {/* Size */}
                                      <div>
                                        <div className="text-xs text-muted-foreground/80 mb-1.5">Size</div>
                                        <div className="grid grid-cols-3 gap-1.5">
                                          {[
                                            { ratio: '21:9', w: 28, h: 12 },
                                            { ratio: '16:9', w: 26, h: 14 },
                                            { ratio: '4:3',  w: 24, h: 18 },
                                            { ratio: '5:4',  w: 22, h: 18 },
                                            { ratio: '1:1',  w: 20, h: 20 },
                                            { ratio: '4:5',  w: 18, h: 22 },
                                            { ratio: '3:4',  w: 18, h: 24 },
                                            { ratio: '2:3',  w: 14, h: 21 },
                                            { ratio: '9:16', w: 14, h: 26 },
                                          ].map(s => {
                                            const active = imgAspect === s.ratio;
                                            return (
                                              <button key={s.ratio} type="button"
                                                onClick={() => setImgAspect(s.ratio)}
                                                className={`flex flex-col items-center justify-center gap-1 py-2 rounded-md transition-colors border ${
                                                  active
                                                    ? 'bg-accent/40 border-border text-foreground'
                                                    : 'border-border/30 text-muted-foreground/80 hover:bg-accent/40 hover:text-foreground'
                                                }`}>
                                                <span className="rounded-[3px] border border-current/70"
                                                  style={{ width: s.w, height: s.h }} />
                                                <span className="text-[10px] tabular-nums">{s.ratio}</span>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                      {/* Quantity */}
                                      <div>
                                        <div className="text-xs text-muted-foreground/80 mb-1.5">数量</div>
                                        <div className="grid grid-cols-4 gap-1.5">
                                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => {
                                            const active = imgCount === n;
                                            return (
                                              <button key={n} type="button"
                                                onClick={() => setImgCount(n)}
                                                className={`py-1.5 rounded-md text-xs transition-colors border ${
                                                  active
                                                    ? 'bg-accent/40 border-border text-foreground'
                                                    : 'border-border/30 text-muted-foreground/80 hover:bg-accent/40 hover:text-foreground'
                                                }`}>
                                                {n} img
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                ) : (
                                  <Tooltip content={tool.label} side="top">
                                    <Button variant="ghost" size="icon-sm" className={btnCls}>
                                      <Icon size={14} strokeWidth={1.5} />
                                    </Button>
                                  </Tooltip>
                                )}
                              </div>
                            );
                            return btn;
                          })}
                          {/* Collapse/Expand toggle */}
                          <Tooltip content={toolbarExpanded ? '收起工具' : '展开工具'} side="top">
                            <Button variant="ghost" size="icon-sm" onClick={() => setToolbarExpanded(v => !v)}
                              className="p-[5px] w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/50">
                              <ChevronRight size={14} strokeWidth={1.5} className={`transition-transform duration-150 ${toolbarExpanded ? '' : 'rotate-180'}`} />
                            </Button>
                          </Tooltip>
                        </>
                      )}
                      {/* Model picker — sits next to the + */}
                      <Popover open={composerModelOpen} onOpenChange={setComposerModelOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="inline" className="gap-1 px-1.5 py-1 ml-0.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md">
                            {(() => {
                              const am = ASSISTANT_MODELS.find(m => m.id === selectedModels[0]);
                              return (<>
                                {am && <BrandLogo id={am.provider.toLowerCase()} fallbackLetter={am.provider[0]} size={13} className="shrink-0" />}
                                <span className="truncate max-w-[130px]">{selectedModels.length > 1 ? `${selectedModels.length} 个模型` : am?.name || '选择模型'}</span>
                                <ChevronDown size={9} className={`text-muted-foreground/40 transition-transform ${composerModelOpen ? 'rotate-180' : ''}`} />
                              </>);
                            })()}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent side="top" align="start" className="p-0 w-[480px]">
                          <ModelPickerPanel
                            selectedModels={selectedModels}
                            onSelectModel={handleSelectModel}
                            multiModel={multiModel}
                            onToggleMultiModel={handleToggleMultiModel}
                            onClose={() => setComposerModelOpen(false)}
                            onConnectProvider={() => { setComposerModelOpen(false); openProviderSetup(); }}
                          />
                        </PopoverContent>
                      </Popover>
                      {/* Thinking level pill — matches the cascade icons:
                          Brain / BrainCircuit / BrainCog ramp by depth. */}
                      {reasoningLevel && (() => {
                        const LevelIcon =
                          reasoningLevel === 'high' ? BrainCog
                          : reasoningLevel === 'mid' || reasoningLevel === 'medium' ? BrainCircuit
                          : Brain;
                        const levelLabel =
                          reasoningLevel === 'low' ? '低'
                          : reasoningLevel === 'mid' || reasoningLevel === 'medium' ? '中'
                          : reasoningLevel === 'high' ? '高'
                          : reasoningLevel;
                        return (
                          <Tooltip content="点击关闭思考" side="top">
                            <button
                              type="button"
                              onClick={() => setReasoningLevel(null)}
                              className="inline-flex items-center gap-1 px-1.5 h-[22px] rounded-md bg-success/12 text-success hover:bg-success/20 transition-colors text-xs leading-none font-medium ml-1"
                            >
                              <LevelIcon size={12} strokeWidth={1.6} />
                              <span>{levelLabel}</span>
                            </button>
                          </Tooltip>
                        );
                      })()}
                      {/* Assistant + model selection moved to @ mention —
                          users type `@` to open a picker that supports
                          multi-select for both assistants and models. */}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                        {input.length > 0 && (
                          <Tooltip content="预估 Token 数" side="top">
                            <span className="flex items-center gap-1 cursor-default"><Layers size={10} />{Math.ceil(input.length * 1.3)}</span>
                          </Tooltip>
                        )}
                      </div>
                      {minimalInput && (
                        <DropdownMenu open={showPlusMenu} onOpenChange={(v) => { setShowPlusMenu(v); if (v) setShowAtMenu(false); }}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" ref={plusBtnRef}
                              className={`p-[5px] w-auto h-auto transition-colors ${
                                showPlusMenu ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                              }`}><Plus size={14} /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="top" align="start" className="w-44">
                            {plusMenuItems.map((item, idx) => {
                              const Icon = item.icon;
                              if (item.id === 'genimg') {
                                return (
                                  <DropdownMenuSub key={item.id}>
                                    <DropdownMenuSubTrigger className="gap-2 px-2 py-[5px] text-xs">
                                      <Icon size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
                                      <span className="flex-1 text-left">{item.label}</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="w-[280px] p-3 space-y-3">
                                      <div>
                                        <div className="text-xs text-muted-foreground/80 mb-1.5">Resolution</div>
                                        <div className="flex items-center gap-1.5">
                                          {(['1K', '2K', '4K'] as const).map(r => {
                                            const active = imgResolution === r;
                                            return (
                                              <button key={r} type="button"
                                                onClick={() => setImgResolution(r)}
                                                className={`flex-1 py-1.5 rounded-md text-xs transition-colors border ${
                                                  active
                                                    ? 'bg-accent/40 border-border text-foreground'
                                                    : 'border-border/30 text-muted-foreground/80 hover:bg-accent/40 hover:text-foreground'
                                                }`}>{r}</button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-muted-foreground/80 mb-1.5">Size</div>
                                        <div className="grid grid-cols-3 gap-1.5">
                                          {[
                                            { ratio: '21:9', w: 28, h: 12 },
                                            { ratio: '16:9', w: 26, h: 14 },
                                            { ratio: '4:3',  w: 24, h: 18 },
                                            { ratio: '5:4',  w: 22, h: 18 },
                                            { ratio: '1:1',  w: 20, h: 20 },
                                            { ratio: '4:5',  w: 18, h: 22 },
                                            { ratio: '3:4',  w: 18, h: 24 },
                                            { ratio: '2:3',  w: 14, h: 21 },
                                            { ratio: '9:16', w: 14, h: 26 },
                                          ].map(s => {
                                            const active = imgAspect === s.ratio;
                                            return (
                                              <button key={s.ratio} type="button"
                                                onClick={() => setImgAspect(s.ratio)}
                                                className={`flex flex-col items-center justify-center gap-1 py-2 rounded-md transition-colors border ${
                                                  active
                                                    ? 'bg-accent/40 border-border text-foreground'
                                                    : 'border-border/30 text-muted-foreground/80 hover:bg-accent/40 hover:text-foreground'
                                                }`}>
                                                <span className="rounded-[3px] border border-current/70"
                                                  style={{ width: s.w, height: s.h }} />
                                                <span className="text-[10px] tabular-nums">{s.ratio}</span>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-muted-foreground/80 mb-1.5">数量</div>
                                        <div className="grid grid-cols-4 gap-1.5">
                                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => {
                                            const active = imgCount === n;
                                            return (
                                              <button key={n} type="button"
                                                onClick={() => setImgCount(n)}
                                                className={`py-1.5 rounded-md text-xs transition-colors border ${
                                                  active
                                                    ? 'bg-accent/40 border-border text-foreground'
                                                    : 'border-border/30 text-muted-foreground/80 hover:bg-accent/40 hover:text-foreground'
                                                }`}>{n} img</button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </DropdownMenuSubContent>
                                  </DropdownMenuSub>
                                );
                              }
                              return (
                                <div key={item.id}>
                                  <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs">
                                    <Icon size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
                                    <span className="flex-1 text-left">{item.label}</span>
                                  </DropdownMenuItem>
                                  {(item as { separator?: boolean }).separator && idx < plusMenuItems.length - 1 && (
                                    <DropdownMenuSeparator />
                                  )}
                                </div>
                              );
                            })}
                            {/* 思考 — cascade with effort options */}
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="gap-2 px-2 py-[5px] text-xs">
                                <Brain size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
                                <span className="flex-1 text-left">思考</span>
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {thinkingEfforts.map(t => {
                                  const Icon = t.Icon;
                                  return (
                                    <DropdownMenuItem
                                      key={t.id}
                                      className="gap-2 px-2 py-[5px] text-xs"
                                      onSelect={() => setReasoningLevel(t.id === 'default' ? null : t.id)}
                                    >
                                      <Icon size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
                                      <span className="flex-1 text-left">{t.label}</span>
                                      {((t.id === 'default' && reasoningLevel === null) || reasoningLevel === t.id) && (
                                        <Check size={10} className="text-primary flex-shrink-0" />
                                      )}
                                    </DropdownMenuItem>
                                  );
                                })}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="gap-2 px-2 py-[5px] text-xs text-muted-foreground">
                                <MoreHorizontal size={13} strokeWidth={1.5} className="flex-shrink-0" />
                                <span className="flex-1 text-left">更多</span>
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {plusMenuSecondary.map(item => {
                                  const Icon = item.icon;
                                  return (
                                    <DropdownMenuItem key={item.id} className="gap-2 px-2 py-[5px] text-xs">
                                      <Icon size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
                                      <span className="flex-1 text-left">{item.label}</span>
                                      {item.shortcut && <span className="text-xs text-muted-foreground/60 tracking-wider">{item.shortcut}</span>}
                                    </DropdownMenuItem>
                                  );
                                })}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      <Button variant="default" size="icon" onClick={handleSend} disabled={!input.trim()}
                        className="w-6 h-6 rounded-full">
                        <ArrowUp size={13} strokeWidth={2} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              </>
            }
          >
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} onOpenPanel={handleOpenPanel} onAvatarClick={handleAvatarClick} onOpenArtifact={handleOpenArtifact} assistantEmoji={currentAssistantEmoji} assistantName={currentAssistant.name} modelDisplayName={currentModelDisplayName} onRetry={handleRetry} onRetryNav={handleRetryNav} />
            ))}
          </ChatInterface>
        </div>

        {/* Right: Branch Tree Panel */}
        <AnimatePresence initial={false}>
          {showBranchTree && (
            <BranchTreePanel
              messages={messages}
              onClose={() => setShowBranchTree(false)}
              assistantName={currentAssistant.name}
              modelName={ASSISTANT_MODELS.find(m => m.id === selectedModels[0])?.name || 'Gemini 3 Pro'}
              topicName={activeTopic?.title}
              onCopyAsTopic={handleCopyAsTopic}
              onBranchChange={(branchId, newNode) => {
                setActiveBranchId(branchId);
                if (newNode) {
                  // Add a system-like message indicating branch switch
                  const ts = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                  setMessages(prev => [...prev, {
                    id: `branch-${Date.now()}`,
                    role: 'assistant' as const,
                    content: `[已切换到新分支 ${branchId}] 从此处开始新的对话分支。`,
                    timestamp: ts,
                    assistantLabel: newNode.model || '助手',
                  }]);
                }
              }}
            />
          )}
        </AnimatePresence>

        {/* Assistant configuration dialog — same modal used in
            LibraryPage, opened by clicking the avatar / 配置 entry
            instead of jumping out to the library. */}
        <ResourceConfigDialog
          resource={rightPanel === 'assistantInfo' ? assistantToResource(currentAssistant, currentAssistantEmoji) : null}
          onOpenChange={(open) => { if (!open) setRightPanel(null); }}
        />

        {/* Right: Floating Panels */}
        <AnimatePresence mode="wait">
          {/* assistantInfo handled via ResourceConfigDialog above */}
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
      </>)}

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

      {/* ===== Create Assistant Onboarding ===== */}
      <CreateAssistantWizard
        open={showCreateAssistant}
        onOpenChange={setShowCreateAssistant}
      />

      {/* ===== Recycle Bin: delete-topic confirmation ===== */}
      <RecycleBinConfirmDialog
        open={!!pendingDeleteTopic}
        onOpenChange={(open) => { if (!open) setPendingDeleteTopic(null); }}
        retentionDays={retentionDays}
        onConfirm={() => {
          if (pendingDeleteTopic) sendTopicToBin(pendingDeleteTopic);
        }}
      />

      {/* ===== 话题重命名（行右键菜单） ===== */}
      <Dialog open={!!renameTopicTarget} onOpenChange={(open) => { if (!open) setRenameTopicTarget(null); }}>
        <DialogContent className="w-[360px] p-5">
          <div className="text-sm font-medium mb-3">重命名话题</div>
          <Input
            value={renameTopicValue}
            onChange={(e) => setRenameTopicValue(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && renameTopicTarget && renameTopicValue.trim()) {
                handleUpdateTopic(renameTopicTarget.id, { title: renameTopicValue.trim() });
                setRenameTopicTarget(null);
              }
            }}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setRenameTopicTarget(null)}>取消</Button>
            <Button
              size="sm"
              disabled={!renameTopicValue.trim()}
              onClick={() => {
                if (renameTopicTarget && renameTopicValue.trim()) {
                  handleUpdateTopic(renameTopicTarget.id, { title: renameTopicValue.trim() });
                  setRenameTopicTarget(null);
                }
              }}
            >
              确定
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      </div>

      {/* ===== Right dock panel — 话题 or 创作物 — docked to the app's far-right
          edge. 话题 renders as a 浮窗 (floating popover with rounded corners,
          shadow and a margin from the edges) while still reserving flex width
          so the chat content reflows around it. 创作物 stays as a flush dock
          since it needs full-bleed canvas space. ===== */}
      <AnimatePresence initial={false}>
        {dockTab !== null && !artifactFullscreen && (() => {
          // The 话题 list is a compact, fixed-width rail; 参数设置 a slightly wider
          // fixed rail; 创作物 keeps the wide, resizable preview width.
          const isTopics = dockTab === 'topics';
          const isSettings = dockTab === 'settings';
          const isFixed = isTopics || isSettings;
          // 话题列表与左侧助手栏同宽（220），把空间让给中间对话区。
          const effectiveWidth = isTopics ? 220 : isSettings ? 340 : artifactPanelWidth;
          return (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: effectiveWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="flex-shrink-0 min-w-0 relative flex"
            style={{ width: effectiveWidth }}
          >
            {/* Resize handle — doubles as the persistent divider line. 话题 /
                参数设置 are fixed-width, so they only show the divider (no drag). */}
            <div
              onMouseDown={isFixed ? undefined : handleArtifactResizeStart}
              className={`w-[7px] flex-shrink-0 group flex items-stretch justify-center relative z-10 ${isFixed ? '' : 'cursor-col-resize'}`}
            >
              <div className="w-px bg-border/40 group-hover:bg-border/70 group-active:bg-foreground/30 transition-colors" />
            </div>
            {/* Panel content — 话题 / 参数设置 / 创作物, flush, separated only by the divider */}
            <div className="flex-1 min-w-0 bg-background overflow-hidden flex flex-col">
              {isTopics ? (
                renderTopicList()
              ) : isSettings ? (
                <ChatSettingsPanel docked onClose={() => setDockTab(null)} minimalInput={minimalInput} onMinimalInputChange={setMinimalInput} />
              ) : (
                <ArtifactsPanel artifact={activeArtifact} isFullscreen={false} onToggleFullscreen={() => setArtifactFullscreen(true)} onClose={handleCloseArtifacts} onSelectArtifact={handleOpenArtifact} hasTopic={activeTopicId !== null} />
              )}
            </div>
          </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

export default AssistantRunPage;
