import React, { useMemo, useState } from 'react';
import {
  Bot, Cpu, FileText, Folder, Wrench, Globe,
  ChevronRight, ArrowLeft, Search as SearchIcon,
} from 'lucide-react';
import { Separator, AssistantPickerPanel } from '@cherry-studio/ui';
import { ModelPickerPanel } from '@/app/components/shared/ModelPickerPanel';
import { MOCK_ASSISTANTS, ASSISTANT_EMOJI_MAP } from '@/app/mock';
import { ASSISTANT_MODELS } from '@/app/config/models';

// ===========================
// Shared @ Mention Picker
// ===========================
//
// Two-level popup used by both the chat (AssistantRunPage) and the agent
// (CodexStyleInput) composers.
//
//   ROOT: 4 category buttons — 助手 / 模型 / 文件 / MCP
//   SUB:  list view for each, with search; 助手 also has tag-chip filtering.
//
// 助手 / 模型 picks fire `onPick({ type: 'assistant' | 'model', ... })` and
// the parent can either toggle selection state (for chat) or insert text
// (for agent). 文件 / MCP picks always carry just a label.

export type MentionPick =
  | { type: 'assistant'; id: string; name: string }
  | { type: 'model'; id: string; name: string }
  | { type: 'file'; label: string }
  | { type: 'mcp'; label: string };

export interface MentionPickerPanelProps {
  /** Currently-selected assistant ids — used to render check marks. */
  selectedAssistantIds?: string[];
  /** Currently-selected model ids — used to render check marks. */
  selectedModelIds?: string[];
  /** When true, the assistant sub-page stays open after a pick (multi-select). */
  multiAssistant?: boolean;
  /** When true, the model sub-page stays open after a pick (multi-select). */
  multiModel?: boolean;
  /** Toggle multi-select on the assistants page (renders Checkbox rows). */
  onToggleMultiAssistant?: () => void;
  /** Toggle multi-select on the models page. */
  onToggleMultiModel?: () => void;
  /** Hide the in-panel multi-select Switch rows (single-pick only UIs like
   * the Agent composer). */
  disableMulti?: boolean;
  /** Label for the assistants category — defaults to "助手"; pass "Agent" or
   * "智能体" from the Agent composer. */
  assistantLabel?: string;
  onPick: (pick: MentionPick) => void;
  onClose: () => void;
}

const FILE_ITEMS = [
  { id: 'file-app', label: 'src/App.tsx', desc: '文件', icon: FileText },
  { id: 'file-readme', label: 'README.md', desc: '文件', icon: FileText },
  { id: 'folder-comp', label: 'src/components/', desc: '文件夹', icon: Folder },
  { id: 'folder-features', label: 'src/features/', desc: '文件夹', icon: Folder },
  { id: 'file-package', label: 'package.json', desc: '文件', icon: FileText },
];

const MCP_ITEMS = [
  { id: 'mcp-fs', label: 'filesystem', desc: '本地文件读取', icon: Wrench },
  { id: 'mcp-search', label: 'web-search', desc: '网页搜索', icon: Globe },
  { id: 'mcp-browser', label: 'browser', desc: '浏览器自动化', icon: Globe },
  { id: 'mcp-github', label: 'github', desc: 'GitHub 操作', icon: Wrench },
];

type Page = 'root' | 'assistants' | 'models' | 'files' | 'mcp';

export function MentionPickerPanel({
  selectedAssistantIds = [],
  selectedModelIds = [],
  multiAssistant = false,
  multiModel = false,
  onToggleMultiAssistant,
  onToggleMultiModel,
  disableMulti = false,
  assistantLabel = '助手',
  onPick,
  onClose,
}: MentionPickerPanelProps) {
  const [page, setPage] = useState<Page>('root');
  const [search, setSearch] = useState('');
  // Internal multi toggles — fallback when the parent doesn't pipe a
  // controlled flag (Agent composer, which is single-select only). When the
  // parent supplies a controlled `multi*` flag + handler, that wins.
  const [localMultiAssistant, setLocalMultiAssistant] = useState(false);
  const [localMultiModel, setLocalMultiModel] = useState(false);
  const effMultiAssistant = onToggleMultiAssistant ? multiAssistant : localMultiAssistant;
  const effMultiModel = onToggleMultiModel ? multiModel : localMultiModel;
  const handleToggleMultiAssistant = onToggleMultiAssistant ?? (() => setLocalMultiAssistant(v => !v));
  const handleToggleMultiModel = onToggleMultiModel ?? (() => setLocalMultiModel(v => !v));

  const goRoot = () => { setPage('root'); setSearch(''); };

  const filteredFiles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return FILE_ITEMS;
    return FILE_ITEMS.filter(f => f.label.toLowerCase().includes(q));
  }, [search]);

  const filteredMcp = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return MCP_ITEMS;
    return MCP_ITEMS.filter(m => m.label.toLowerCase().includes(q));
  }, [search]);

  const BackBar = (
    <button type="button"
      onClick={goRoot}
      className="w-full flex items-center gap-1.5 px-2 py-[5px] rounded-md text-left transition-colors text-xs text-muted-foreground/70 hover:bg-accent/40 hover:text-foreground"
    >
      <ArrowLeft size={11} className="flex-shrink-0" />
      <span>返回</span>
    </button>
  );

  const SearchBar = (
    <div className="px-1 pt-1 pb-1.5">
      <div className="flex items-center gap-1.5 px-2 h-7 rounded-md bg-muted/30 border border-border/20">
        <SearchIcon size={11} className="text-muted-foreground/50 flex-shrink-0" />
        <input
          autoFocus
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索…"
          className="flex-1 bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground/50"
        />
      </div>
    </div>
  );

  // ROOT
  if (page === 'root') {
    type Cat = { id: Page; title: string; Icon: React.ComponentType<{ size?: number; className?: string }>; count: number };
    const cats: Cat[] = [
      { id: 'assistants', title: assistantLabel, Icon: Bot, count: MOCK_ASSISTANTS.length },
      { id: 'models',     title: '模型', Icon: Cpu,      count: ASSISTANT_MODELS.length },
      { id: 'files',      title: '文件', Icon: FileText, count: FILE_ITEMS.length },
      { id: 'mcp',        title: 'MCP',  Icon: Wrench,   count: MCP_ITEMS.length },
    ];
    return (
      <div className="p-1">
        {cats.map(({ id, title, Icon, count }) => (
          <button key={id} type="button"
            onClick={() => { setSearch(''); setPage(id); }}
            className="w-full flex items-center justify-between gap-3 px-2 py-[6px] rounded-md text-left transition-colors hover:bg-accent/50"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Icon size={13} className="text-muted-foreground/70 flex-shrink-0" />
              <span className="text-xs text-foreground">{title}</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-xs text-muted-foreground/50">{count}</span>
              <ChevronRight size={11} className="text-muted-foreground/50" />
            </div>
          </button>
        ))}
      </div>
    );
  }

  // 助手 — shared AssistantPickerPanel (built-in search, Filter-funnel tag
  // filter, multi-select via Checkbox + emoji avatars).
  if (page === 'assistants') {
    return (
      <div className="flex flex-col min-h-0 max-h-[420px]">
        {BackBar}
        <Separator opacity={30} />
        <div className="flex-1 min-h-0 overflow-y-auto">
          <AssistantPickerPanel
            assistants={MOCK_ASSISTANTS}
            selectedAssistants={selectedAssistantIds}
            onSelectAssistant={(id) => {
              const a = MOCK_ASSISTANTS.find(x => x.id === id);
              if (a) onPick({ type: 'assistant', id, name: a.name });
            }}
            multiAssistant={!disableMulti && effMultiAssistant}
            onToggleMultiAssistant={handleToggleMultiAssistant}
            emojiMap={ASSISTANT_EMOJI_MAP}
            showMultiAssistantToggle={!disableMulti}
            onClose={onClose}
          />
        </div>
      </div>
    );
  }

  // 模型 — shared ModelPickerPanel (built-in provider grouping, capability
  // tag filter, multi-select + pin).
  if (page === 'models') {
    return (
      <div className="flex flex-col min-h-0 max-h-[460px]">
        {BackBar}
        <Separator opacity={30} />
        <div className="flex-1 min-h-0 overflow-hidden">
          <ModelPickerPanel
            models={ASSISTANT_MODELS}
            selectedModels={selectedModelIds}
            onSelectModel={(id) => {
              const m = ASSISTANT_MODELS.find(x => x.id === id);
              if (m) onPick({ type: 'model', id, name: m.name });
            }}
            multiModel={!disableMulti && effMultiModel}
            onToggleMultiModel={handleToggleMultiModel}
            showMultiModelToggle={!disableMulti}
            onClose={onClose}
            onConnectProvider={null}
          />
        </div>
      </div>
    );
  }

  // 文件
  if (page === 'files') {
    return (
      <div className="p-1 flex flex-col min-h-0">
        {BackBar}
        <Separator opacity={30} className="my-1" />
        {SearchBar}
        <div className="flex-1 overflow-y-auto max-h-[260px]">
          {filteredFiles.length === 0 ? (
            <div className="px-2 py-4 text-center text-xs text-muted-foreground/50">无匹配文件</div>
          ) : (
            filteredFiles.map(f => {
              const Icon = f.icon;
              return (
                <button key={f.id} type="button"
                  onClick={() => { onPick({ type: 'file', label: f.label }); onClose(); }}
                  className="w-full flex items-center justify-between gap-3 px-2 py-[5px] rounded-md text-left transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon size={12} className="text-muted-foreground/50 flex-shrink-0" />
                    <span className="text-xs text-foreground truncate">{f.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground/50 flex-shrink-0">{f.desc}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // MCP
  return (
    <div className="p-1 flex flex-col min-h-0">
      {BackBar}
      <Separator opacity={30} className="my-1" />
      {SearchBar}
      <div className="flex-1 overflow-y-auto max-h-[260px]">
        {filteredMcp.length === 0 ? (
          <div className="px-2 py-4 text-center text-xs text-muted-foreground/50">无匹配 MCP</div>
        ) : (
          filteredMcp.map(m => {
            const Icon = m.icon;
            return (
              <button key={m.id} type="button"
                onClick={() => { onPick({ type: 'mcp', label: m.label }); onClose(); }}
                className="w-full flex items-center justify-between gap-3 px-2 py-[5px] rounded-md text-left transition-colors hover:bg-accent/50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon size={12} className="text-muted-foreground/50 flex-shrink-0" />
                  <span className="text-xs text-foreground truncate">{m.label}</span>
                </div>
                <span className="text-xs text-muted-foreground/50 flex-shrink-0">{m.desc}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
