import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Plus, X, ChevronDown, ChevronRight, Check, Trash2,
  Server, Package, Store, ExternalLink, Eye, EyeOff, Pencil,
  ArrowLeft, Save, Settings2, Filter, FileText, Info,
} from 'lucide-react';
import {
  Button, Input, Textarea, Switch,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Popover, PopoverTrigger, PopoverContent,
  BrandLogo, SearchInput, EmptyState, Typography,
  RadioGroup, RadioGroupItem,
} from '@cherry-studio/ui';

// ===========================
// Types
// ===========================
type NavPage = 'servers' | 'builtin' | 'marketplace' | string; // string for provider ids
type ServerTab = 'general' | 'tools' | 'prompts' | 'resources';

interface MCPServer {
  id: string;
  name: string;
  description?: string;
  version?: string;
  type: 'stdio' | 'sse';
  enabled: boolean;
  tags?: string[];
  command?: string;
  args?: string;
  envVars?: string;
  packageSource?: string;
  longRunning?: boolean;
  tools?: MCPTool[];
  prompts?: MCPPrompt[];
  resources?: MCPResource[];
}

interface MCPTool {
  name: string;
  description: string;
  enabled: boolean;
  autoApprove: boolean;
  params?: { name: string; type: string }[];
}

interface MCPPrompt {
  name: string;
  description: string;
}

interface MCPResource {
  name: string;
  uri: string;
  description: string;
  mimeType: string;
}

interface BuiltinServer {
  id: string;
  name: string;
  description: string;
  tags: string[];
  installed: boolean;
}

interface MarketplaceSite {
  id: string;
  name: string;
  icon: string;
  description: string;
  url: string;
}

interface Provider {
  id: string;
  name: string;
  icon: string;
  iconBg: string;
  hasApiKey?: boolean;
}

// ===========================
// Mock Data
// ===========================
const MOCK_SERVERS: MCPServer[] = [
  {
    id: 's1', name: '@cherry/mcp-auto-install', description: '', version: '', type: 'stdio', enabled: false,
    tags: ['\u5185\u7f6e', 'CherryAI'], command: 'npx', args: '@anthropic/mcp-auto-install', packageSource: 'default',
    tools: [], prompts: [], resources: [],
  },
  {
    id: 's2', name: 'xhs-toolkit', description: '', version: '', type: 'stdio', enabled: false,
    tags: ['STDIO'], command: 'npx', args: 'xhs-toolkit', packageSource: 'default',
    tools: [], prompts: [], resources: [],
  },
  {
    id: 's3', name: 'time-service', description: '', version: '1.26.0', type: 'stdio', enabled: true,
    tags: ['STDIO'], command: 'uvx', args: 'mcp-time-service1', packageSource: 'default', longRunning: false,
    envVars: 'KEY1=value1\nKEY2=value2',
    tools: [
      { name: 'get_current_time', description: '\u83b7\u53d6\u5f53\u524d\u65f6\u95f4\uff0c\u7cbe\u786e\u5230\u6beb\u79d2', enabled: true, autoApprove: true, params: [] },
      { name: 'format_date', description: '\u6309\u7167\u6307\u5b9a\u683c\u5f0f\u8fd4\u56de\u5f53\u524d\u65e5\u671f \u53c2\u6570: format_string: Python strftime \u683c\u5f0f\u5b57\u7b26\u4e32 (\u4f8b\u5982 "%Y-%m-%d")', enabled: true, autoApprove: true, params: [{ name: 'format_string', type: 'string' }] },
    ],
    prompts: [{ name: 'time_prompt', description: '\u83b7\u53d6\u683c\u5f0f\u5316\u65f6\u95f4\u7684\u63d0\u793a\u6a21\u677f' }],
    resources: [{ name: 'timezone_info', uri: 'time://timezone_info', description: '\u63d0\u4f9b\u5f53\u524d\u65f6\u533a\u4fe1\u606f', mimeType: 'text/plain' }],
  },
  {
    id: 's4', name: 'MCP \u670d\u52a1\u5668', description: '', version: '', type: 'stdio', enabled: false,
    tags: ['STDIO'], command: 'npx', args: '', packageSource: 'default',
    tools: [], prompts: [], resources: [],
  },
  {
    id: 's5', name: 'MCP \u670d\u52a1\u5668', description: '', version: '', type: 'stdio', enabled: false,
    tags: ['STDIO'], command: 'npx', args: '', packageSource: 'default',
    tools: [], prompts: [], resources: [],
  },
  {
    id: 's6', name: '\u58f6\u5bb6\u7cbe\u70752', description: '', version: '1.0.0', type: 'sse', enabled: true,
    tags: ['1.0.0', 'SSE'], command: '', args: '', packageSource: 'default',
    tools: [], prompts: [], resources: [],
  },
  {
    id: 's7', name: 'Fetch', description: 'Fetch MCP Server', version: '1.26.0', type: 'stdio', enabled: true,
    tags: ['1.26.0', 'STDIO'], command: 'uvx', args: 'mcp-fetch', packageSource: 'default',
    tools: [], prompts: [], resources: [],
  },
  {
    id: 's8', name: 'Playwright', description: 'Playwright Tools for MCP \u7528\u6cd5: npx @playwright/mcp NPM: https://www.npmjs.com/package/@playwright/mcp', version: '', type: 'stdio', enabled: true,
    tags: ['STDIO'], command: 'npx', args: '@playwright/mcp', packageSource: 'default',
    tools: [], prompts: [], resources: [],
  },
  {
    id: 's9', name: 'Filesystem', description: '\u6587\u4ef6\u7cfb\u7edf', version: '', type: 'stdio', enabled: true,
    tags: ['STDIO'], command: 'npx', args: '@modelcontextprotocol/server-filesystem', packageSource: 'default',
    tools: [], prompts: [], resources: [],
  },
];

const MOCK_BUILTIN: BuiltinServer[] = [
  { id: 'b1', name: '@cherry/mcp-auto-install', description: '\u81ea\u52a8\u5b89\u88c5 MCP \u670d\u52a1 (\u539f\u59cb\u7248)', tags: ['\u5185\u7f6e'], installed: true },
  { id: 'b2', name: '@cherry/memory', description: '\u57fa\u4e8e\u672c\u5730\u77e5\u8bc6\u56fe\u8c31\u7684\u6301\u4e45\u5316\u8bb0\u5fc6\u80fd\u529b\u5b9e\u73b0\uff0c\u6ca1\u6709\u4f9d\u8d56\u7b2c\u4e09\u65b9\u670d\u52a1', tags: ['\u5185\u7f6e', '\u9700\u8981\u914d\u7f6e'], installed: false },
  { id: 'b3', name: '@cherry/sequentialthinking', description: '\u4e00\u4e2a MCP \u670d\u52a1\u5668\u5b9e\u73b0\uff0c\u63d0\u4f9b\u4e86\u901a\u8fc7\u8fc7\u7a0b\u5316\u751f\u6210\u56de\u8def\u63a2\u7d22\u95ee\u9898\u7684\u5de5\u5177', tags: ['\u5185\u7f6e'], installed: false },
  { id: 'b4', name: '@cherry/brave-search', description: '\u4e00\u4e2a\u96c6\u6210\u4e86 Brave \u641c\u7d22 API \u7684 MCP \u670d\u52a1\u5668\u5b9e\u73b0', tags: ['\u5185\u7f6e', '\u9700\u8981\u914d\u7f6e'], installed: false },
  { id: 'b5', name: '@cherry/fetch', description: '\u7528\u4e8e\u83b7\u53d6 URL \u7f51\u9875\u5185\u5bb9\u7684 MCP \u670d\u52a1\u5668\u5b9e\u73b0', tags: ['\u5185\u7f6e'], installed: false },
  { id: 'b6', name: '@cherry/filesystem', description: '\u5b9e\u73b0\u6587\u4ef6\u7cfb\u7edf\u64cd\u4f5c\u6240\u6709\u673a\u5668\u4e0a\u4e0b\u6587\u534f\u8bae (MCP) \u7684 Node.js \u670d\u52a1\u5668', tags: ['\u5185\u7f6e', '\u9700\u8981\u914d\u7f6e'], installed: false },
  { id: 'b7', name: '@cherry/dify-knowledge', description: 'Dify \u7684 MCP \u670d\u52a1\u5668\u5b9e\u73b0\uff0c\u63d0\u4f9b\u4e86\u4e00\u4e2a/\u7b80\u5355\u7684 API \u6765\u4e0e Dify \u8fdb\u884c\u4ea4\u4e92', tags: ['\u5185\u7f6e', '\u9700\u8981\u914d\u7f6e'], installed: false },
  { id: 'b8', name: '@cherry/python', description: '\u5728\u5b89\u5168\u7684\u6c99\u7bb1\u73af\u5883\u4e2d\u6267\u884c Python \u4ee3\u7801', tags: ['\u5185\u7f6e'], installed: false },
  { id: 'b9', name: '@cherry/didi-mcp', description: '\u4e00\u4e2a\u96c6\u6210\u4e86\u6ef4\u6ef4\u51fa\u884c MCP \u670d\u52a1\u5668\u5b9e\u73b0\uff0c\u63d0\u4f9b\u7f51\u7ea6\u8f66\u670d\u52a1\u5982\u51fa\u884c\u6253\u8f66\u7b49', tags: ['\u5185\u7f6e', '\u9700\u8981\u914d\u7f6e'], installed: false },
  { id: 'b10', name: '@cherry/browser', description: '\u901a\u8fc7 Chrome DevTools \u534f\u8bae\u63a7\u5236\u6e38\u620f\u5668\u7684 Electron \u7a97\u53e3', tags: ['\u5185\u7f6e'], installed: false },
  { id: 'b11', name: '@cherry/knowledge-mem', description: '\u8981\u5728\u672c\u5730\u8fd0\u884c Knowledge-Mem \u5e94\u7528\uff0c\u5c06 AI \u5bf9\u8bdd\u3001\u5de5\u5177\u8c03\u7528\u6570\u636e\u5f52\u96c6\u5230\u672c\u5730', tags: ['\u5185\u7f6e'], installed: false },
];

const MOCK_MARKETPLACE: MarketplaceSite[] = [
  { id: 'mk1', name: 'BigModel MCP Market', icon: '\ud83d\udfe3', description: '\u7cbe\u9009MCP\uff0c\u6781\u901f\u63a5\u5165', url: '#' },
  { id: 'mk2', name: 'modelscope.cn', icon: '\ud83d\udfe2', description: '\u9b54\u641e\u793e\u533a MCP \u670d\u52a1\u5668', url: '#' },
  { id: 'mk3', name: 'mcp.higress.ai', icon: '\ud83d\udfe5', description: 'Higress MCP \u670d\u52a1\u5668', url: '#' },
  { id: 'mk4', name: 'mcp.so', icon: '\u26ab', description: 'MCP \u670d\u52a1\u5668\u53d1\u73b0\u5e73\u53f0', url: '#' },
  { id: 'mk5', name: 'smithery.ai', icon: '\u2b1c', description: 'Smithery MCP \u5de5\u5177', url: '#' },
  { id: 'mk6', name: 'glama.ai', icon: '\ud83d\udfe1', description: 'Glama MCP \u670d\u52a1\u5668\u76ee\u5f55', url: '#' },
  { id: 'mk7', name: 'pulsemcp.com', icon: '\ud83d\udd34', description: 'Pulse MCP \u670d\u52a1\u5668', url: '#' },
  { id: 'mk8', name: 'mcp.composio.dev', icon: '\ud83d\udfe0', description: 'Composio MCP \u5f00\u53d1\u5de5\u5177', url: '#' },
  { id: 'mk9', name: 'Model Context Protocol Servers', icon: '\ud83d\udce6', description: '\u5b98\u65b9 MCP \u670d\u52a1\u5668\u96c6\u5408', url: '#' },
  { id: 'mk10', name: 'Awesome MCP Servers', icon: '\u2728', description: '\u7cbe\u9009\u7684 MCP \u670d\u52a1\u5668\u5217\u8868', url: '#' },
];

const MOCK_PROVIDERS: Provider[] = [
  { id: 'aliyun', name: '\u963f\u91cc\u4e91\u767e\u70bc', icon: '\u2601\ufe0f', iconBg: 'bg-accent-blue' },
  { id: 'modelscope', name: 'ModelScope', icon: '\ud83d\udd2c', iconBg: 'bg-accent-emerald' },
  { id: 'tokenflux', name: 'TokenFlux', icon: '\u26a1', iconBg: 'bg-accent-purple' },
  { id: 'lanyun', name: '\u84dd\u8018\u79d1\u6280', icon: '\ud83c\udf0a', iconBg: 'bg-accent-cyan' },
  { id: '302ai', name: '302.AI', icon: '\ud83e\udd16', iconBg: 'bg-accent-orange' },
  { id: 'mcp-router', name: 'MCP Router', icon: '\ud83d\udd00', iconBg: 'bg-accent/50' },
];

const PKG_SOURCES = ['\u9ed8\u8ba4', '\u6e05\u534e\u5927\u5b66', '\u963f\u91cc\u4e91', '\u4e2d\u56fd\u79d1\u5b66\u6280\u672f\u5927\u5b66', '\u534e\u4e3a\u4e91', '\u817e\u8baf\u4e91'];

// ===========================
// Server List Panel
// ===========================
type ServerFilter = 'all' | 'enabled' | 'disabled' | 'stdio' | 'sse' | 'builtin';

function ServerListPanel({ servers, onSelectServer }: {
  servers: MCPServer[];
  onSelectServer: (s: MCPServer) => void;
}) {
  const [items, setItems] = useState(servers);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ServerFilter>('all');

  const applyFilter = (list: MCPServer[]) => {
    switch (activeFilter) {
      case 'enabled': return list.filter(s => s.enabled);
      case 'disabled': return list.filter(s => !s.enabled);
      case 'stdio': return list.filter(s => s.type === 'stdio');
      case 'sse': return list.filter(s => s.type === 'sse');
      case 'builtin': return list.filter(s => s.tags?.includes('\u5185\u7f6e') || s.tags?.includes('CherryAI'));
      default: return list;
    }
  };

  const searched = searchQuery
    ? items.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : items;
  const filtered = applyFilter(searched);

  const enabledCount = items.filter(s => s.enabled).length;

  const handleToggle = (id: string, val: boolean) => {
    setItems(prev => prev.map(s => s.id === id ? { ...s, enabled: val } : s));
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(s => s.id !== id));
  };

  const filters: { id: ServerFilter; label: string }[] = [
    { id: 'all', label: '\u5168\u90e8' },
    { id: 'enabled', label: '\u5df2\u542f\u7528' },
    { id: 'disabled', label: '\u5df2\u7981\u7528' },
    { id: 'stdio', label: 'STDIO' },
    { id: 'sse', label: 'SSE' },
    { id: 'builtin', label: '\u5185\u7f6e' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-1.5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Typography variant="subtitle">MCP {'\u670d\u52a1\u5668'}</Typography>
          <span className="text-xs text-muted-foreground/40 tabular-nums">{enabledCount}/{items.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setShowSearch(v => !v)}
            className={showSearch ? 'bg-accent text-muted-foreground' : 'text-muted-foreground/40 hover:text-foreground hover:bg-accent'}
          >
            <Search size={12} />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setIsEditing(v => !v)}
            className={`text-xs ${
              isEditing ? 'text-cherry-primary-dark bg-cherry-active-bg' : 'text-muted-foreground/60 hover:text-foreground hover:bg-accent'
            }`}
          >
            <Pencil size={9} />
            <span>{isEditing ? '\u5b8c\u6210' : '\u7f16\u8f91'}</span>
          </Button>
          <Button variant="ghost" size="xs" className="text-xs text-cherry-primary-dark bg-cherry-active-bg hover:bg-cherry-active-border">
            <Plus size={9} />
            <span>{'\u6dfb\u52a0'}</span>
          </Button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="px-5 pb-2 flex-shrink-0 space-y-1.5">
        {showSearch && (
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={'\u641c\u7d22\u670d\u52a1\u5668...'}
            autoFocus
          />
        )}
        {/* Filter chips */}
        <div className="flex items-center gap-1 flex-wrap">
          {filters.map(f => (
            <Button size="inline"
              key={f.id}
              variant="ghost"
              onClick={() => setActiveFilter(f.id)}
              className={`px-2 py-[3px] rounded-md text-xs ${
                activeFilter === f.id
                  ? (f.id === 'enabled' ? 'bg-primary/10 text-primary border border-primary/15 font-medium' : 'bg-muted/50 text-foreground border border-border/50 font-medium')
                  : 'text-muted-foreground/40 hover:text-foreground hover:bg-accent/50 border border-transparent'
              }`}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Server list */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 scrollbar-thin">
        {filtered.length === 0 ? (
          <EmptyState preset="no-result" compact />
        ) : (
          <div className="space-y-[1px]">
            {filtered.map(server => {
              const isEnabled = server.enabled;
              return (
                <div
                  key={server.id}
                  className={`flex items-center gap-2.5 px-3 py-[9px] rounded-lg transition-all group cursor-pointer ${
                    isEnabled
                      ? 'hover:bg-accent/50'
                      : 'opacity-30 hover:opacity-80 hover:bg-accent/50'
                  }`}
                  onClick={() => onSelectServer(server)}
                >
                  {/* Status dot */}
                  <div className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${isEnabled ? 'bg-primary' : 'bg-accent'}`} />

                  {/* Name + inline tags */}
                  <div className="flex-1 min-w-0 flex items-center gap-1.5">
                    <span className="text-sm text-foreground truncate font-medium">{server.name}</span>
                    {server.tags && server.tags.map((tag, i) => {
                      const isVersion = new RegExp('^' + String.fromCharCode(92) + 'd').test(tag);
                      const isType = tag === 'STDIO' || tag === 'SSE';
                      const isBuiltin = tag === '\u5185\u7f6e' || tag === 'CherryAI';
                      return (
                        <span
                          key={i}
                          className={`px-1 py-0 rounded text-xs flex-shrink-0 whitespace-nowrap font-medium ${
                            isBuiltin
                              ? 'bg-info/10 text-info'
                              : isVersion
                                ? 'bg-muted/50 text-muted-foreground'
                                : isType
                                  ? 'bg-muted/50 text-muted-foreground/40'
                                  : 'bg-muted/50 text-muted-foreground/40'
                          }`}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDelete(server.id)}
                        className="text-muted-foreground/50 hover:text-destructive hover:bg-destructive/[0.06]"
                      >
                        <Trash2 size={10} />
                      </Button>
                    )}
                    <Switch size="sm" checked={server.enabled} onCheckedChange={v => handleToggle(server.id, v)} />
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onSelectServer(server)}
                      className="text-muted-foreground/40 hover:text-foreground opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight size={11} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================
// Built-in Servers Panel
// ===========================
function BuiltinServersPanel() {
  const [items, setItems] = useState(MOCK_BUILTIN);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'installed' | 'notInstalled'>('all');

  const handleInstall = (id: string) => {
    setItems(prev => prev.map(s => s.id === id ? { ...s, installed: true } : s));
  };

  const handleUninstall = (id: string) => {
    setItems(prev => prev.map(s => s.id === id ? { ...s, installed: false } : s));
  };

  const searched = searchQuery
    ? items.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase()))
    : items;

  const filtered = filterMode === 'installed'
    ? searched.filter(s => s.installed)
    : filterMode === 'notInstalled'
      ? searched.filter(s => !s.installed)
      : searched;

  const installedCount = items.filter(s => s.installed).length;

  const builtinFilters: { id: 'all' | 'installed' | 'notInstalled'; label: string }[] = [
    { id: 'all', label: '\u5168\u90e8' },
    { id: 'installed', label: '\u5df2\u5b89\u88c5' },
    { id: 'notInstalled', label: '\u672a\u5b89\u88c5' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="px-5 pt-4 pb-1.5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Typography variant="subtitle">{'\u5185\u7f6e\u670d\u52a1\u5668'}</Typography>
            <span className="text-xs text-muted-foreground/40 tabular-nums">{installedCount}/{items.length}</span>
          </div>
        </div>
      </div>
      {/* Search + Filter */}
      <div className="px-5 pb-2 flex-shrink-0 space-y-1.5">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={'\u641c\u7d22\u5185\u7f6e\u670d\u52a1\u5668...'}
        />
        <div className="flex items-center gap-1">
          {builtinFilters.map(f => (
            <Button size="inline"
              key={f.id}
              variant="ghost"
              onClick={() => setFilterMode(f.id)}
              className={`px-2 py-[3px] rounded-md text-xs ${
                filterMode === f.id
                  ? 'bg-muted/50 text-foreground border border-border/50 font-medium'
                  : 'text-muted-foreground/40 hover:text-foreground hover:bg-accent/50 border border-transparent'
              }`}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-4 scrollbar-thin">
        {filtered.length === 0 ? (
          <EmptyState preset="no-result" compact />
        ) : (
          <div className="space-y-[1px]">
            {filtered.map(server => (
              <div
                key={server.id}
                className="flex items-center gap-2.5 px-3 py-[9px] rounded-lg transition-all group cursor-default hover:bg-accent/50"
              >
                {/* Status indicator */}
                <div className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${server.installed ? 'bg-primary' : 'bg-accent'}`} />

                {/* Name + description + tags */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-foreground truncate font-medium">
                      {server.name.replace('@cherry/', '')}
                    </span>
                    {server.tags.map((tag, i) => (
                      <span
                        key={i}
                        className={`px-1 py-0 rounded text-xs flex-shrink-0 whitespace-nowrap font-medium ${
                          tag === '\u5185\u7f6e'
                            ? 'bg-warning-muted text-warning'
                            : 'bg-accent-orange-muted text-accent-orange'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground/60 mt-0.5 truncate">{server.description}</p>
                </div>

                {/* Install / Installed action */}
                <div className="flex-shrink-0">
                  {server.installed ? (
                    <Button size="inline"
                      variant="ghost"
                      onClick={() => handleUninstall(server.id)}
                      className="px-2 py-[3px] rounded-md text-xs text-cherry-primary bg-cherry-active-bg hover:bg-destructive/[0.08] hover:text-destructive font-medium group/btn"
                    >
                      <Check size={9} className="group-hover/btn:hidden" />
                      <X size={9} className="hidden group-hover/btn:block" />
                      <span className="group-hover/btn:hidden">{'\u5df2\u5b89\u88c5'}</span>
                      <span className="hidden group-hover/btn:block">{'\u5378\u8f7d'}</span>
                    </Button>
                  ) : (
                    <Button size="inline"
                      variant="ghost"
                      onClick={() => handleInstall(server.id)}
                      className="px-2 py-[3px] rounded-md text-xs text-muted-foreground/40 hover:text-cherry-primary hover:bg-cherry-active-bg font-medium"
                    >
                      <Plus size={9} />
                      <span>{'\u5b89\u88c5'}</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================
// Marketplace Panel
// ===========================
function MarketplacePanel() {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = searchQuery
    ? MOCK_MARKETPLACE.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase()))
    : MOCK_MARKETPLACE;

  return (
    <div className="h-full flex flex-col">
      <div className="px-5 pt-4 pb-1.5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Typography variant="subtitle">{'\u66f4\u591a MCP'}</Typography>
          <span className="text-xs text-muted-foreground/40 tabular-nums">{MOCK_MARKETPLACE.length}</span>
        </div>
        <p className="text-xs text-muted-foreground/60 mt-0.5">{'\u63a2\u7d22\u793e\u533a MCP \u670d\u52a1\u5668\u548c\u5de5\u5177'}</p>
      </div>
      {/* Search */}
      <div className="px-5 pb-2 flex-shrink-0">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={'\u641c\u7d22\u5e02\u573a...'}
        />
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-4 scrollbar-thin">
        {filtered.length === 0 ? (
          <EmptyState preset="no-result" compact />
        ) : (
          <div className="space-y-[1px]">
            {filtered.map(site => (
              <div
                key={site.id}
                className="flex items-center gap-2.5 px-3 py-[9px] rounded-lg transition-all cursor-pointer group hover:bg-accent/50"
              >
                {/* Icon */}
                <div className="w-5 h-5 rounded-md bg-muted/50 flex items-center justify-center text-xs flex-shrink-0">
                  {site.icon}
                </div>

                {/* Name + description */}
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-foreground font-medium">{site.name}</span>
                  <p className="text-xs text-muted-foreground/60 mt-0.5 truncate">{site.description}</p>
                </div>

                {/* External link */}
                <ExternalLink size={10} className="text-muted-foreground/40 group-hover:text-foreground transition-colors flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================
// Provider Detail Panel
// ===========================
function ProviderPanel({ provider }: { provider: Provider }) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-5 pt-4 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Typography variant="subtitle">{provider.name}</Typography>
          <ExternalLink size={10} className="text-muted-foreground/40" />
        </div>
        <Button variant="outline" size="xs" className="px-2.5 border-border/30 text-xs text-muted-foreground/60 hover:text-foreground hover:bg-accent">
          <span>{'\u83b7\u53d6\u670d\u52a1\u5668'}</span>
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-4 scrollbar-thin">
        <div className="max-w-[560px]">
          <p className="text-sm text-foreground mb-2 font-semibold">API {'\u5bc6\u94a5'}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center px-3 py-[7px] bg-muted/30 rounded-lg border border-border/50">
              <Input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder={'\u5728\u6b64\u8f93\u5165 API \u4ee4\u724c'}
                className="flex-1 bg-transparent text-xs text-muted-foreground placeholder:text-muted-foreground/60 min-w-0 border-0 h-auto p-0 focus-visible:ring-0"
              />
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setShowKey(v => !v)}
                className="text-muted-foreground/50 hover:text-foreground ml-2"
              >
                {showKey ? <EyeOff size={11} /> : <Eye size={11} />}
              </Button>
            </div>
          </div>
          <Button variant="link" size="xs" className="text-xs text-info hover:text-info mt-2">
            {'\u70b9\u51fb\u8fd9\u91cc\u83b7\u53d6\u5bc6\u94a5'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ===========================
// Server Detail Panel (tabs)
// ===========================
function ServerDetailPanel({ server, onBack }: { server: MCPServer; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<ServerTab>('general');
  const [enabled, setEnabled] = useState(server.enabled);
  const [name, setName] = useState(server.name);
  const [desc, setDesc] = useState(server.description || '');
  const [serverType, setServerType] = useState(server.type);
  const [command, setCommand] = useState(server.command || '');
  const [pkgSource, setPkgSource] = useState(server.packageSource || '\u9ed8\u8ba4');
  const [args, setArgs] = useState(server.args || '');
  const [envVars, setEnvVars] = useState(server.envVars || '');
  const [longRunning, setLongRunning] = useState(server.longRunning || false);
  const [tools, setTools] = useState<MCPTool[]>(server.tools || []);
  const [typeOpen, setTypeOpen] = useState(false);

  const toolCount = tools.length;
  const promptCount = (server.prompts || []).length;
  const resourceCount = (server.resources || []).length;

  const tabs: { id: ServerTab; label: string; count?: number }[] = [
    { id: 'general', label: '\u901a\u7528' },
    { id: 'tools', label: '\u5de5\u5177', count: toolCount },
    { id: 'prompts', label: '\u63d0\u793a' },
    { id: 'resources', label: '\u8d44\u6e90', count: resourceCount },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Back + header */}
      <div className="px-5 pt-3 pb-0 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onBack}
          className="p-1 -ml-1 mb-2 text-muted-foreground/40 hover:text-foreground hover:bg-accent"
        >
          <ArrowLeft size={15} />
        </Button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Typography variant="subtitle" className="font-semibold">{name}</Typography>
            {server.version && (
              <span className="px-2 py-[2px] rounded-md bg-cherry-primary text-white text-xs font-medium">{server.version}</span>
            )}
            <Button variant="ghost" size="xs" className="text-xs text-muted-foreground/60 hover:text-foreground">{'\u65e5\u5fd7'}</Button>
            <Button variant="ghost" size="icon-xs" className="text-muted-foreground/50 hover:text-destructive">
              <Trash2 size={11} />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Switch size="sm" checked={enabled} onCheckedChange={setEnabled} />
            <Button variant="outline" size="xs" className="border-border/30 text-muted-foreground/60 hover:text-foreground hover:bg-accent">
              <Save size={10} />
              <span>{'\u4fdd\u5b58'}</span>
            </Button>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ServerTab)} className="flex-1 flex flex-col min-h-0 gap-0">
        <TabsList variant="line" className="border-b border-border/30 h-auto px-5 flex-shrink-0">
          {tabs.map(tab => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="px-3.5 pb-2.5 pt-1 text-sm data-[state=active]:text-primary data-[state=active]:font-medium text-muted-foreground/60 hover:text-foreground"
            >
              {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ''}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general" className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
          <GeneralTab
            name={name} setName={setName}
            desc={desc} setDesc={setDesc}
            serverType={serverType} setServerType={setServerType}
            typeOpen={typeOpen} setTypeOpen={setTypeOpen}
            command={command} setCommand={setCommand}
            pkgSource={pkgSource} setPkgSource={setPkgSource}
            args={args} setArgs={setArgs}
            envVars={envVars} setEnvVars={setEnvVars}
            longRunning={longRunning} setLongRunning={setLongRunning}
          />
        </TabsContent>
        <TabsContent value="tools" className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
          <ToolsTab tools={tools} setTools={setTools} />
        </TabsContent>
        <TabsContent value="prompts" className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
          <PromptsTab prompts={server.prompts || []} />
        </TabsContent>
        <TabsContent value="resources" className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
          <ResourcesTab resources={server.resources || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ===========================
// General Tab
// ===========================
function GeneralTab({ name, setName, desc, setDesc, serverType, setServerType, typeOpen, setTypeOpen, command, setCommand, pkgSource, setPkgSource, args, setArgs, envVars, setEnvVars, longRunning, setLongRunning }: {
  name: string; setName: (v: string) => void;
  desc: string; setDesc: (v: string) => void;
  serverType: string; setServerType: (v: string) => void;
  typeOpen: boolean; setTypeOpen: (v: boolean) => void;
  command: string; setCommand: (v: string) => void;
  pkgSource: string; setPkgSource: (v: string) => void;
  args: string; setArgs: (v: string) => void;
  envVars: string; setEnvVars: (v: string) => void;
  longRunning: boolean; setLongRunning: (v: boolean) => void;
}) {
  return (
    <div className="max-w-[560px] space-y-5">
      {/* Name */}
      <div>
        <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-0.5 font-medium">
          <span className="text-destructive">*</span> {'\u540d\u79f0'}
        </label>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-3 py-[8px] bg-muted/30 rounded-lg border border-border/30 text-sm text-foreground focus:border-border/50 transition-colors h-auto"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-sm text-muted-foreground mb-1.5 block font-medium">{'\u63cf\u8ff0'}</label>
        <Input
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder={'\u63cf\u8ff0'}
          className="w-full px-3 py-[8px] bg-muted/30 rounded-lg border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-border/50 transition-colors h-auto"
        />
      </div>

      {/* Type */}
      <div>
        <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-0.5 font-medium">
          <span className="text-destructive">*</span> {'\u7c7b\u578b'}
        </label>
        <Popover open={typeOpen} onOpenChange={setTypeOpen}>
          <PopoverTrigger asChild>
            <Button size="inline"
              variant="outline"
              className="w-full flex items-center justify-between px-3 py-[8px] bg-muted/30 rounded-lg border-border/30 text-sm text-muted-foreground hover:border-border/50"
            >
              <span>{serverType === 'stdio' ? '\u6807\u51c6\u8f93\u5165 / \u8f93\u51fa (stdio)' : 'Server-Sent Events (SSE)'}</span>
              <ChevronDown size={10} className={`transition-transform ${typeOpen ? 'rotate-180' : ''}`} />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0.5">
            {['stdio', 'sse'].map(t => (
              <Button size="inline"
                key={t}
                variant="ghost"
                onClick={() => { setServerType(t); setTypeOpen(false); }}
                className={`w-full text-left px-3 py-[6px] rounded-md text-xs justify-between ${
                  serverType === t ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/50'
                }`}
              >
                <span>{t === 'stdio' ? '\u6807\u51c6\u8f93\u5165 / \u8f93\u51fa (stdio)' : 'Server-Sent Events (SSE)'}</span>
                {serverType === t && <Check size={9} className="text-cherry-primary" />}
              </Button>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      {/* Command */}
      <div>
        <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-0.5 font-medium">
          <span className="text-destructive">*</span> {'\u547d\u4ee4'}
        </label>
        <Input
          value={command}
          onChange={e => setCommand(e.target.value)}
          className="w-full px-3 py-[8px] bg-muted/30 rounded-lg border border-border/30 text-sm text-foreground font-mono focus:border-border/50 transition-colors h-auto"
        />
      </div>

      {/* Package Source */}
      <div>
        <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-1 font-medium">
          {'\u5305\u7ba1\u7406\u6e90'}
          <Info size={11} className="text-muted-foreground/40" />
        </label>
        <RadioGroup value={pkgSource} onValueChange={setPkgSource} className="flex items-center gap-3 flex-wrap">
          {PKG_SOURCES.map(src => (
            <label key={src} className="flex items-center gap-1.5 cursor-pointer">
              <RadioGroupItem value={src} />
              <span className="text-sm text-muted-foreground">{src}</span>
            </label>
          ))}
        </RadioGroup>
      </div>

      {/* Args */}
      <div>
        <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-1 font-medium">
          {'\u53c2\u6570'}
          <Info size={11} className="text-muted-foreground/40" />
        </label>
        <Input
          value={args}
          onChange={e => setArgs(e.target.value)}
          className="w-full px-3 py-[8px] bg-muted/30 rounded-lg border border-border/30 text-sm text-foreground font-mono focus:border-border/50 transition-colors h-auto"
        />
      </div>

      {/* Env Vars */}
      <div>
        <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-1 font-medium">
          {'\u73af\u5883\u53d8\u91cf'}
          <Info size={11} className="text-muted-foreground/40" />
        </label>
        <Textarea
          value={envVars}
          onChange={e => setEnvVars(e.target.value)}
          placeholder={'KEY1=value1\nKEY2=value2'}
          rows={3}
          className="w-full px-3 py-2.5 bg-muted/30 rounded-lg border border-border/30 text-sm text-foreground outline-none font-mono placeholder:text-muted-foreground/60 resize-y focus:border-border/50 transition-colors scrollbar-thin-xs"
        />
      </div>

      {/* Long running */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-foreground font-medium">{'\u957f\u65f6\u95f4\u8fd0\u884c\u6a21\u5f0f'}</span>
          <Info size={11} className="text-muted-foreground/40" />
        </div>
        <Switch size="sm" checked={longRunning} onCheckedChange={setLongRunning} />
      </div>
    </div>
  );
}

// ===========================
// Tools Tab
// ===========================
function ToolsTab({ tools, setTools }: { tools: MCPTool[]; setTools: (t: MCPTool[]) => void }) {
  const [expandedTool, setExpandedTool] = useState<string | null>(null);

  const handleToggleEnabled = (name: string) => {
    setTools(tools.map(t => t.name === name ? { ...t, enabled: !t.enabled } : t));
  };

  const handleToggleAutoApprove = (name: string) => {
    setTools(tools.map(t => t.name === name ? { ...t, autoApprove: !t.autoApprove } : t));
  };

  if (tools.length === 0) {
    return (
      <EmptyState icon={Settings2} title="暂无可用工具" description="请确认服务器已启动并正确配置" compact />
    );
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between pb-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <p className="text-sm text-foreground font-semibold">{'\u53ef\u7528\u5de5\u5177'}</p>
          <Button variant="ghost" size="icon-xs" className="text-muted-foreground/50 hover:text-foreground">
            <Filter size={10} />
          </Button>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs text-muted-foreground/40">{'\u542f\u7528\u5de5\u5177'}</span>
          <span className="text-xs text-muted-foreground/40">{'\u81ea\u52a8\u6279\u51c6'}</span>
        </div>
      </div>

      {/* Tool list */}
      <div>
        {tools.map(tool => (
          <div key={tool.name} className="last:border-b-0">
            <div className="flex items-center justify-between py-3.5 gap-4">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                {tool.params && tool.params.length > 0 ? (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setExpandedTool(expandedTool === tool.name ? null : tool.name)}
                    className="mt-0.5 text-muted-foreground/40 hover:text-foreground flex-shrink-0"
                  >
                    <ChevronRight size={10} className={`transition-transform ${expandedTool === tool.name ? 'rotate-90' : ''}`} />
                  </Button>
                ) : (
                  <span className="mt-0.5 w-4 text-center text-muted-foreground/50 flex-shrink-0">{'\u2014'}</span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm text-foreground font-semibold">{tool.name}</p>
                    <Info size={9} className="text-muted-foreground/40" />
                  </div>
                  <p className="text-xs text-muted-foreground/60 mt-0.5 leading-relaxed">{tool.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 flex-shrink-0">
                <Switch size="sm" checked={tool.enabled} onCheckedChange={() => handleToggleEnabled(tool.name)} />
                <Switch size="sm" checked={tool.autoApprove} onCheckedChange={() => handleToggleAutoApprove(tool.name)} />
              </div>
            </div>

            {/* Expanded params */}
            {expandedTool === tool.name && tool.params && tool.params.length > 0 && (
              <div className="ml-6 mb-3">
                {tool.params.map(param => (
                  <div key={param.name} className="flex items-center gap-3 px-3 py-2 bg-muted/30 rounded-lg border border-border/50 mb-1">
                    <span className="text-xs text-muted-foreground font-mono flex-1">{param.name}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="w-1 h-1 rounded-full bg-muted0" />
                      {param.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===========================
// Prompts Tab
// ===========================
function PromptsTab({ prompts }: { prompts: MCPPrompt[] }) {
  if (prompts.length === 0) {
    return (
      <EmptyState icon={FileText} title="暂无提示模板" compact />
    );
  }

  return (
    <div>
      <p className="text-sm text-foreground pb-3 border-b border-border/30 mb-1 font-semibold">{'\u53ef\u7528\u63d0\u793a'}</p>
      {prompts.map(p => (
        <div key={p.name} className="py-3 last:border-b-0">
          <p className="text-sm text-foreground font-medium">{p.name}</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">{p.description}</p>
        </div>
      ))}
    </div>
  );
}

// ===========================
// Resources Tab
// ===========================
function ResourcesTab({ resources }: { resources: MCPResource[] }) {
  const [expanded, setExpanded] = useState<string | null>(resources.length > 0 ? resources[0].name : null);

  if (resources.length === 0) {
    return (
      <EmptyState preset="no-resource" compact />
    );
  }

  return (
    <div>
      <p className="text-sm text-foreground pb-3 border-b border-border/30 mb-1 font-semibold">{'\u53ef\u7528\u8d44\u6e90'}</p>
      {resources.map(r => (
        <div key={r.name} className="last:border-b-0">
          <Button size="inline"
            variant="ghost"
            onClick={() => setExpanded(expanded === r.name ? null : r.name)}
            className="w-full flex items-center gap-2 py-3 text-left justify-start"
          >
            <ChevronRight size={10} className={`text-muted-foreground/40 transition-transform ${expanded === r.name ? 'rotate-90' : ''}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground font-medium">
                {r.name} <span className="text-muted-foreground/40 font-mono">({r.uri})</span>
              </p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">{r.description}</p>
            </div>
          </Button>
          {expanded === r.name && (
            <div className="ml-6 mb-3 flex items-center gap-4 px-3 py-2.5 bg-muted/30 rounded-lg border border-border/50">
              <span className="text-xs text-muted-foreground/60 flex-1">MIME {'\u7c7b\u578b'}</span>
              <span className="px-2 py-[2px] rounded-md bg-info/10 text-info text-xs border border-info/15 font-medium">{r.mimeType}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ===========================
// Main: MCPServicePage
// ===========================
export function MCPServicePage() {
  const [selectedNav, setSelectedNav] = useState<NavPage>('servers');
  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null);

  const handleSelectServer = (server: MCPServer) => {
    setSelectedServer(server);
  };

  const handleBackFromDetail = () => {
    setSelectedServer(null);
  };

  const renderRightPanel = () => {
    // If a server detail is open, show that
    if (selectedServer) {
      return <ServerDetailPanel server={selectedServer} onBack={handleBackFromDetail} />;
    }

    if (selectedNav === 'servers') {
      return <ServerListPanel servers={MOCK_SERVERS} onSelectServer={handleSelectServer} />;
    }
    if (selectedNav === 'builtin') {
      return <BuiltinServersPanel />;
    }
    if (selectedNav === 'marketplace') {
      return <MarketplacePanel />;
    }

    // Provider pages
    const provider = MOCK_PROVIDERS.find(p => p.id === selectedNav);
    if (provider) {
      return <ProviderPanel provider={provider} />;
    }

    return null;
  };

  return (
    <div className="flex h-full min-h-0">
      {/* Middle Column: Navigation */}
      <div className="w-[160px] flex-shrink-0 flex flex-col border-r border-border/30 min-h-0">
        <div className="px-3.5 pt-4 pb-2 flex-shrink-0">
          <p className="text-xs text-muted-foreground/60 font-medium">MCP {'\u670d\u52a1'}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-2.5 pb-3 scrollbar-thin-xs">
          <div className="space-y-[2px]">
            {/* Top item */}
            <Button size="inline"
              variant="ghost"
              onClick={() => { setSelectedNav('servers'); setSelectedServer(null); }}
              className={`w-full flex items-center justify-between px-3 py-[8px] text-left relative justify-start ${
                selectedNav === 'servers' && !selectedServer
                  ? 'bg-cherry-active-bg'
                  : 'border border-transparent hover:bg-accent/50'
              }`}
            >
              {selectedNav === 'servers' && !selectedServer && (
                <div className="absolute inset-0 rounded-xl border border-cherry-active-border pointer-events-none" />
              )}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className={`flex-shrink-0 ${selectedNav === 'servers' && !selectedServer ? 'text-muted-foreground/60' : 'text-muted-foreground/40'}`}><Server size={14} /></span>
                <span className={`text-sm ${selectedNav === 'servers' && !selectedServer ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>MCP {'\u670d\u52a1\u5668'}</span>
              </div>
              <ChevronRight size={9} className={`flex-shrink-0 ${selectedNav === 'servers' && !selectedServer ? 'text-muted-foreground/40' : 'text-muted-foreground/50'}`} />
            </Button>

            {/* Discover */}
            <p className="text-xs text-muted-foreground/40 tracking-wider px-3 pt-2.5 pb-1 font-medium">{'\u53d1\u73b0'}</p>
            {[
              { id: 'builtin' as const, label: '\u5185\u7f6e\u670d\u52a1\u5668', icon: <Package size={14} /> },
              { id: 'marketplace' as const, label: '\u5e02\u573a', icon: <Store size={14} /> },
            ].map(item => {
              const isSelected = selectedNav === item.id;
              return (
                <Button size="inline"
                  key={item.id}
                  variant="ghost"
                  onClick={() => { setSelectedNav(item.id); setSelectedServer(null); }}
                  className={`w-full flex items-center justify-between px-3 py-[8px] text-left relative justify-start ${
                    isSelected
                      ? 'bg-cherry-active-bg'
                      : 'border border-transparent hover:bg-accent/50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute inset-0 rounded-xl border border-cherry-active-border pointer-events-none" />
                  )}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className={`flex-shrink-0 ${isSelected ? 'text-muted-foreground/60' : 'text-muted-foreground/40'}`}>{item.icon}</span>
                    <span className={`text-sm ${isSelected ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{item.label}</span>
                  </div>
                  <ChevronRight size={9} className={`flex-shrink-0 ${isSelected ? 'text-muted-foreground/40' : 'text-muted-foreground/50'}`} />
                </Button>
              );
            })}

            {/* Providers */}
            <p className="text-xs text-muted-foreground/40 tracking-wider px-3 pt-2.5 pb-1 font-medium">{'\u63d0\u4f9b\u5546'}</p>
            {MOCK_PROVIDERS.map(provider => {
              const isSelected = selectedNav === provider.id;
              return (
                <Button size="inline"
                  key={provider.id}
                  variant="ghost"
                  onClick={() => { setSelectedNav(provider.id); setSelectedServer(null); }}
                  className={`w-full flex items-center justify-between px-3 py-[8px] text-left relative justify-start ${
                    isSelected
                      ? 'bg-cherry-active-bg'
                      : 'border border-transparent hover:bg-accent/50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute inset-0 rounded-xl border border-cherry-active-border pointer-events-none" />
                  )}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="flex-shrink-0"><BrandLogo id={provider.id} fallbackLetter={provider.icon} fallbackColor="#6b7280" size={15} /></span>
                    <span className={`text-sm truncate ${isSelected ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{provider.name}</span>
                  </div>
                  <ChevronRight size={9} className={`flex-shrink-0 ${isSelected ? 'text-muted-foreground/40' : 'text-muted-foreground/50'}`} />
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {renderRightPanel()}
      </div>
    </div>
  );
}
