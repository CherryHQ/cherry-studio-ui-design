import React, { useState, useCallback } from 'react';
import {
  ChevronDown, Sparkles, X, Check, Code2,
  FolderOpen, Terminal, Cpu,
  Play, Info,
  Plus, FileCode2, ArrowUp, ArrowDown, Trash2, ExternalLink, RefreshCw,
  Server, Puzzle, FileText, ArrowLeftRight,
  Activity, Zap, Copy, ShieldAlert, Boxes, GitMerge,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tooltip } from '@/app/components/Tooltip';
import { MOCK_RESOURCES } from '@/app/config/constants';
import { Button, Input, SearchInput, Textarea, EmptyState, BrandLogo, Popover, PopoverTrigger, PopoverContent , Checkbox, Switch} from '@cherry-studio/ui';

// ===========================
// Data
// ===========================

interface CLITool {
  id: string;
  name: string;
  desc: string;
  color: string;
  initial: string;
  version: string;
  category: 'official' | 'community';
}

const cliTools: CLITool[] = [
  { id: 'claude', name: 'Claude Code', desc: 'Anthropic 官方 CLI', color: '#d97706', initial: 'C', version: 'v1.0.28', category: 'official' },
  { id: 'qwen', name: 'Qwen Code', desc: '通义千问代码助手', color: '#7c3aed', initial: 'Q', version: 'v2.3.1', category: 'official' },
  { id: 'gemini', name: 'Gemini CLI', desc: 'Google 代码工具', color: '#2563eb', initial: 'G', version: 'v0.8.5', category: 'official' },
  { id: 'openai', name: 'OpenAI Codex', desc: 'OpenAI 编码引擎', color: '#10a37f', initial: 'O', version: 'v4.1.0', category: 'official' },
  { id: 'iflow', name: 'iFlow CLI', desc: '智能工作流 CLI', color: '#eab308', initial: '⚡', version: 'v1.5.2', category: 'official' },
  { id: 'copilot', name: 'GitHub Copilot CLI', desc: 'GitHub 编码助手', color: '#1a1a2e', initial: 'GH', version: 'v2.1.0', category: 'official' },
  { id: 'kimi', name: 'Kimi CLI', desc: 'Moonshot 代码工具', color: '#1a1a2e', initial: 'K', version: 'v0.9.3', category: 'official' },
];

const codeModels = [
  { id: 'cm1', name: 'anthropic/claude-sonnet-4', provider: 'CherryIN', color: '#d97706' },
  { id: 'cm2', name: 'anthropic/claude-opus-4', provider: 'CherryIN', color: '#d97706' },
  { id: 'cm3', name: 'deepseek/deepseek-r1(free)', provider: 'CherryIN', color: '#3b82f6' },
  { id: 'cm4', name: 'deepseek/deepseek-v3(free)', provider: 'CherryIN', color: '#3b82f6' },
  { id: 'cm5', name: 'google/gemini-2.5-flash-image', provider: 'CherryIN', color: '#6366f1' },
  { id: 'cm6', name: 'google/gemini-2.5-flash-image-preview', provider: 'CherryIN', color: '#6366f1' },
  { id: 'cm7', name: 'google/gemini-2.5-pro', provider: 'CherryIN', color: '#6366f1' },
  { id: 'cm8', name: 'google/gemini-3-pro-image-preview', provider: 'CherryIN', color: '#6366f1' },
  { id: 'cm9', name: 'google/gemini-3-pro-preview', provider: 'CherryIN', color: '#6366f1' },
  { id: 'cm10', name: 'moonshotai/kimi-k2-0905', provider: 'CherryIN', color: '#111' },
  { id: 'cm11', name: 'openai/gpt-5.1', provider: 'CherryIN', color: '#ec4899' },
  { id: 'cm12', name: 'qwen/qwen3-235b-a22b-instruct-2507(free)', provider: 'CherryIN', color: '#8b5cf6' },
];

const terminalOptions = [
  { id: 'terminal', name: 'Terminal', icon: '🖥️' },
  { id: 'iterm2', name: 'iTerm2', icon: '🟩' },
  { id: 'warp', name: 'Warp', icon: '🚀' },
  { id: 'hyper', name: 'Hyper', icon: '⚡' },
  { id: 'alacritty', name: 'Alacritty', icon: '🔲' },
  { id: 'kitty', name: 'Kitty', icon: '🐱' },
];

// Per-CLI default model mapping
const cliDefaultModels: Record<string, string> = {
  claude: 'cm1',
  qwen: 'cm12',
  gemini: 'cm7',
  openai: 'cm11',
  iflow: 'cm12',
  copilot: 'cm11',
  kimi: 'cm10',
};

// ===========================
// cc-switch style routing config (mock)
// Reuses Cherry's already-configured 服务商 (model service) as the routing
// targets; the "essence" here is profile switching + write-down + sync, not a
// second provider system.
// ===========================

type ProviderHealth = 'ok' | 'degraded' | 'down';

interface ConfiguredProvider {
  id: string;
  name: string;
  type: 'anthropic' | 'openai' | 'gemini';
  apiHost: string;
  health: ProviderHealth;
}

// Mirrors Cherry's Provider shape (id/name/type/apiHost). In the real app this
// comes from 模型服务 settings; here it is mock data.
const configuredProviders: ConfiguredProvider[] = [
  { id: 'cherryin', name: 'CherryIN', type: 'anthropic', apiHost: 'https://api.cherryin.ai', health: 'ok' },
  { id: 'packy', name: 'PackyCode 中转', type: 'anthropic', apiHost: 'https://api.packyapi.com', health: 'ok' },
  { id: 'dmx', name: 'DMXAPI', type: 'openai', apiHost: 'https://www.dmxapi.cn/v1', health: 'degraded' },
  { id: 'official', name: 'Anthropic 官方', type: 'anthropic', apiHost: 'https://api.anthropic.com', health: 'down' },
  { id: 'openrouter', name: 'OpenRouter', type: 'openai', apiHost: 'https://openrouter.ai/api/v1', health: 'ok' },
];

// A named snapshot of "which 服务商 + 备用 + auto-failover" — the thing the user
// switches between with one click (the cc-switch "Switch").
interface RouteProfile {
  id: string;
  name: string;
  primary: string;      // provider id
  fallbacks: string[];  // provider ids, in failover order
  autoFailover: boolean;
}

const defaultProfiles = (): RouteProfile[] => [
  { id: 'p-direct', name: '官方直连', primary: 'official', fallbacks: [], autoFailover: false },
  { id: 'p-relay', name: '中转 · Packy', primary: 'packy', fallbacks: ['cherryin'], autoFailover: true },
  { id: 'p-ha', name: '多服务商容灾', primary: 'cherryin', fallbacks: ['packy', 'dmx'], autoFailover: true },
];

// Where each CLI's real config file lives — the write-down (下发) target.
const cliConfigTarget: Record<string, string> = {
  claude: '~/.claude/settings.json',
  openai: '~/.codex/config.toml',
  gemini: '~/.gemini/settings.json',
  qwen: '~/.qwen/settings.json',
  iflow: '~/.iflow/config.json',
  copilot: '~/.config/github-copilot/config.json',
  kimi: '~/.kimi/config.json',
};

const healthMeta: Record<ProviderHealth, { dot: string; label: string }> = {
  ok: { dot: 'bg-success', label: '正常' },
  degraded: { dot: 'bg-warning', label: '波动' },
  down: { dot: 'bg-destructive', label: '不可用' },
};

// Failover-queue health状态 (cc-switch: 健康 / 降级 / 熔断). 连续失败 ≥3 次熔断。
const queueStatusMeta: Record<ProviderHealth, { label: string; cls: string }> = {
  ok: { label: '健康', cls: 'bg-success/10 text-success' },
  degraded: { label: '降级', cls: 'bg-warning/10 text-warning' },
  down: { label: '熔断', cls: 'bg-destructive/10 text-destructive' },
};

// Mock telemetry for the local proxy (cc-switch 用量/日志). In the real app this
// comes from the proxy's request logger; here it's static demo data.
const proxyStats = {
  address: 'http://127.0.0.1:15721',
  uptime: '4h 12m',
  totalRequests: 1284,
  successRate: 99.2,
  activeConns: 2,
  tokensIn: '2.41M',
  tokensOut: '386K',
  cost: 12.6,
};
const requestLog: { time: string; provider: string; model: string; tokens: string; latency: string; status: 'ok' | 'fail' }[] = [
  { time: '14:32:08', provider: 'PackyCode 中转', model: 'claude-sonnet-4', tokens: '3.2K', latency: '0.82s', status: 'ok' },
  { time: '14:31:55', provider: 'PackyCode 中转', model: 'claude-sonnet-4', tokens: '1.1K', latency: '0.61s', status: 'ok' },
  { time: '14:30:12', provider: 'CherryIN', model: 'claude-sonnet-4', tokens: '5.6K', latency: '1.24s', status: 'ok' },
  { time: '14:28:41', provider: 'Anthropic 官方', model: 'claude-sonnet-4', tokens: '—', latency: '超时', status: 'fail' },
  { time: '14:28:41', provider: 'PackyCode 中转', model: 'claude-sonnet-4', tokens: '2.0K', latency: '0.74s', status: 'ok' },
];

// Each CLI's native API family — when the chosen 服务商 is a different family,
// the local proxy converts the format (cc-switch "format conversion").
const cliNativeFamily: Record<string, 'anthropic' | 'openai' | 'gemini'> = {
  claude: 'anthropic', kimi: 'anthropic',
  openai: 'openai', copilot: 'openai', iflow: 'openai',
  gemini: 'gemini', qwen: 'gemini',
};
const familyLabel: Record<string, string> = { anthropic: 'Anthropic', openai: 'OpenAI', gemini: 'Gemini' };

// The per-CLI project-memory file the 规则/Prompts get written to.
const cliMemoryFile: Record<string, string> = {
  claude: 'CLAUDE.md', kimi: 'CLAUDE.md',
  openai: 'AGENTS.md', copilot: 'AGENTS.md', iflow: 'AGENTS.md',
  gemini: 'GEMINI.md', qwen: 'GEMINI.md',
};

// Mock pools — in the real app these come from Cherry's MCP/Skills管理; here the
// Code config just picks which ones to write into the CLI's own config.
const mcpServers = [
  { id: 'filesystem', name: '文件系统', desc: '本地文件读写' },
  { id: 'time', name: '时间服务', desc: '时区与时间' },
  { id: 'fetch', name: '网页抓取', desc: 'HTTP 抓取与解析' },
  { id: 'github', name: 'GitHub', desc: '仓库 / Issue / PR' },
  { id: 'memory', name: '记忆库', desc: '跨会话长期记忆' },
  { id: 'postgres', name: 'PostgreSQL', desc: '查询数据库 / 执行 SQL' },
  { id: 'sqlite', name: 'SQLite', desc: '本地 SQLite 读写' },
  { id: 'puppeteer', name: 'Puppeteer', desc: '无头浏览器自动化' },
  { id: 'slack', name: 'Slack', desc: '收发消息 / 频道' },
  { id: 'sequential', name: 'Sequential Thinking', desc: '链式推理增强' },
  { id: 'context7', name: 'Context7', desc: '查询技术文档' },
  { id: 'brave', name: 'Brave Search', desc: '联网搜索' },
];
const DEFAULT_PROMPT = '# 项目约定\n\n- 使用 TypeScript 严格模式\n- 提交前跑 lint 与测试\n- 优先复用现有组件\n';

// Prompts available in Cherry's resource library (资源库). Selecting one writes
// its content into the CLI's project-memory file. Sourced from MOCK_RESOURCES so
// the picker stays in sync with what the user has in 资源库 → Prompt.
const promptLibrary = MOCK_RESOURCES
  .filter(r => r.type === 'prompt')
  .map(r => ({ id: r.id, name: r.name, avatar: r.avatar ?? '📝', description: r.description ?? '', content: r.content ?? '' }));

// Skills available in Cherry's resource library (资源库 → Skill). The CLI config
// picks (via dropdown) which ones to install into the CLI's skills dir.
const skillLibrary = MOCK_RESOURCES
  .filter(r => r.type === 'skill')
  .map(r => ({ id: r.id, name: r.name, avatar: r.avatar ?? '🧩', description: r.description ?? '' }));

// ===========================
// Reusable Select Dropdown (Popover-based)
// ===========================
function SelectDropdown<T extends { id: string }>({
  items,
  selectedId,
  onSelect,
  renderSelected,
  renderItem,
  placeholder,
  maxHeight = 240,
}: {
  items: T[];
  selectedId: string;
  onSelect: (id: string) => void;
  renderSelected: (item: T | undefined) => React.ReactNode;
  renderItem: (item: T, isSelected: boolean) => React.ReactNode;
  placeholder?: string;
  maxHeight?: number;
}) {
  const [open, setOpen] = useState(false);

  const selected = items.find(i => i.id === selectedId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="inline"
          variant="ghost"
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md border text-xs bg-transparent hover:bg-accent/40 transition-colors ${open ? 'border-primary/40 ring-1 ring-primary/15' : 'border-muted-foreground/25'}`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1 text-left">
            {selected ? renderSelected(selected) : <span className="text-muted-foreground/50">{placeholder || '请选择...'}</span>}
          </div>
          <ChevronDown size={12} className={`text-muted-foreground/50 transition-transform flex-shrink-0 ml-2 ${open ? 'rotate-180' : ''}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-1 rounded-md overflow-y-auto scrollbar-thin"
        style={{ maxHeight }}
      >
        {items.map(item => (
          <Button size="inline"
            key={item.id}
            variant="ghost"
            className={`w-full text-left justify-start px-2.5 py-1.5 text-xs rounded-md font-normal transition-colors ${selectedId === item.id ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-accent/50'}`}
            onClick={() => { onSelect(item.id); setOpen(false); }}
          >
            {renderItem(item, selectedId === item.id)}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

// ===========================
// Field Label
// ===========================
function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="text-sm text-foreground/80">{children}</span>
      {hint && (
        <Tooltip content={hint} side="top">
          <Info size={9} className="text-muted-foreground/40 cursor-help" />
        </Tooltip>
      )}
    </div>
  );
}

// ===========================
// Collapsible config card — one per config domain (服务商 / MCP / 规则 / 技能)
// ===========================
// ===========================
// CLI Icon
// ===========================
function CLIIcon({ tool, size = 'md' }: { tool: CLITool; size?: 'sm' | 'md' }) {
  const px = size === 'sm' ? 28 : 44;
  return <BrandLogo id={tool.id} fallbackLetter={tool.initial} fallbackColor={tool.color} size={px} />;
}

// ===========================
// Main Component
// ===========================
export function CodeToolPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCli, setSelectedCli] = useState<string | null>(null);
  const [configState, setConfigState] = useState<Record<string, {
    model: string;
    workDir: string;
    envVars: string;
    terminal: string;
    checkUpdates: boolean;
    activeProfile: string;
    profiles: RouteProfile[];
    syncTargets: string[];
    mcp: string[];
    skills: string[];
    prompt: string;
    promptShared: boolean;
    promptSource: 'library' | 'custom';
    promptId: string;
    proxyEnabled: boolean;
    proxyLog: boolean;
  }>>({});
  const [activeTab, setActiveTab] = useState('launch');
  const [appliedConfig, setAppliedConfig] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');
  const [mcpSearch, setMcpSearch] = useState('');

  const [launching, setLaunching] = useState(false);
  const [launchSuccess, setLaunchSuccess] = useState(false);

  // Get or create config for a CLI tool
  const getConfig = (cliId: string) => {
    if (configState[cliId]) return configState[cliId];
    return {
      model: cliDefaultModels[cliId] || 'cm1',
      workDir: '/Users/siin/Desktop',
      envVars: '',
      terminal: 'terminal',
      checkUpdates: false,
      activeProfile: 'p-relay',
      profiles: defaultProfiles(),
      syncTargets: [] as string[],
      mcp: ['filesystem', 'time'] as string[],
      skills: skillLibrary.slice(0, 1).map(s => s.id) as string[],
      prompt: DEFAULT_PROMPT,
      promptShared: false,
      promptSource: 'custom' as 'library' | 'custom',
      promptId: '',
      proxyEnabled: true,
      proxyLog: true,
    };
  };

  const updateConfig = (cliId: string, patch: Partial<typeof configState[string]>) => {
    setConfigState(prev => ({
      ...prev,
      [cliId]: { ...getConfig(cliId), ...patch },
    }));
  };

  const selectedTool = selectedCli ? cliTools.find(t => t.id === selectedCli) : null;
  const config = selectedCli ? getConfig(selectedCli) : null;

  // ----- routing helpers (active profile of the selected CLI) -----
  const activeProfile = config ? (config.profiles.find(p => p.id === config.activeProfile) ?? config.profiles[0]) : null;
  const routeOrder = activeProfile ? [activeProfile.primary, ...activeProfile.fallbacks] : [];
  const routeProviders = routeOrder
    .map(id => configuredProviders.find(p => p.id === id))
    .filter((p): p is ConfiguredProvider => !!p);
  const primaryProvider = routeProviders[0];
  const availableToAdd = configuredProviders.filter(p => !routeOrder.includes(p.id));
  // 本地代理接管 (cc-switch proxy takeover) is an explicit per-CLI toggle. When on,
  // the CLI's BASE_URL is rewritten to the local proxy, which records用量 and (with
  // >1 provider in the queue) does automatic故障转移. When off, the CLI talks直连.
  const proxyEnabled = !!config?.proxyEnabled;
  const proxyTakeover = proxyEnabled;
  const hasFailover = proxyEnabled && routeProviders.length > 1;

  const updateActiveProfile = (patch: Partial<RouteProfile>) => {
    if (!selectedCli || !config || !activeProfile) return;
    updateConfig(selectedCli, {
      profiles: config.profiles.map(p => (p.id === activeProfile.id ? { ...p, ...patch } : p)),
    });
  };
  const reorderRoute = (order: string[]) => updateActiveProfile({ primary: order[0], fallbacks: order.slice(1) });
  const moveProvider = (id: string, dir: -1 | 1) => {
    const i = routeOrder.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= routeOrder.length) return;
    const next = [...routeOrder];
    [next[i], next[j]] = [next[j], next[i]];
    reorderRoute(next);
  };
  const removeProvider = (id: string) => {
    if (routeOrder.length <= 1) return;
    reorderRoute(routeOrder.filter(x => x !== id));
  };
  const addProvider = (id: string) => {
    if (!activeProfile || routeOrder.includes(id)) return;
    updateActiveProfile({ fallbacks: [...activeProfile.fallbacks, id] });
  };
  const toggleSync = (cliId: string) => {
    if (!selectedCli || !config) return;
    const has = config.syncTargets.includes(cliId);
    updateConfig(selectedCli, { syncTargets: has ? config.syncTargets.filter(x => x !== cliId) : [...config.syncTargets, cliId] });
  };
  const toggleInList = (key: 'mcp' | 'skills', id: string) => {
    if (!selectedCli || !config) return;
    const cur = config[key];
    updateConfig(selectedCli, { [key]: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] });
  };
  const applyConfig = () => {
    setAppliedConfig(true);
    setTimeout(() => setAppliedConfig(false), 2200);
  };

  // Format conversion: chosen provider's API family vs the CLI's native family.
  const providerFamily = primaryProvider?.type;
  const nativeFamily = selectedCli ? cliNativeFamily[selectedCli] : undefined;
  const needsConversion = !!providerFamily && !!nativeFamily && providerFamily !== nativeFamily;

  // Files the 下发 will write, given the current config of the selected CLI.
  const writeTargets = (config && selectedCli) ? [
    { file: cliConfigTarget[selectedCli] ?? '~/.config', label: '服务商 / 路由' },
    ...(config.mcp.length ? [{ file: `${(cliConfigTarget[selectedCli] || '~/.config').replace(/\/[^/]+$/, '')}/.mcp.json`, label: `MCP · ${config.mcp.length}` }] : []),
    ...(config.prompt.trim() ? [{ file: `./${cliMemoryFile[selectedCli] ?? 'CLAUDE.md'}`, label: '规则' }] : []),
    ...(config.skills.length ? [{ file: '~/.<cli>/skills/', label: `技能 · ${config.skills.length}` }] : []),
  ] : [];

  const displayedTools = cliTools.filter(
    t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.desc.includes(searchTerm)
  );

  const officialTools = displayedTools.filter(t => t.category === 'official');
  const communityTools = displayedTools.filter(t => t.category === 'community');

  const handleLaunch = useCallback(() => {
    setLaunching(true);
    setLaunchSuccess(false);
    setTimeout(() => {
      setLaunching(false);
      setLaunchSuccess(true);
      setTimeout(() => setLaunchSuccess(false), 2500);
    }, 2000);
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Page header */}
      <div className="h-11 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs">
          <Code2 size={13} className="text-muted-foreground" strokeWidth={1.6} />
          <span className="text-foreground">代码工具</span>
          <span className="text-xs text-muted-foreground/40 ml-1">{cliTools.length} 个</span>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-2">
        <div className="max-w-md mx-auto">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="搜索 CLI 工具…"
            iconSize={13}
            wrapperClassName="px-3 py-1.5 rounded-lg border border-border/50 bg-muted/20"
            clearable
          />
        </div>
      </div>

      {/* Grid content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
        <div className="max-w-3xl mx-auto space-y-5">
          {displayedTools.length === 0 ? (
            <EmptyState
              preset={searchTerm ? 'no-result' : 'no-code-tool'}
              title={searchTerm ? '没有找到匹配的工具' : undefined}
              description={searchTerm ? '尝试调整搜索关键词' : undefined}
            />
          ) : (
            <div>
              {/* Official */}
              {officialTools.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs text-muted-foreground/50 mb-3 px-1">官方工具</p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-x-2 gap-y-4">
                    {officialTools.map(tool => (
                      <Button size="inline"
                        key={tool.id}
                        variant="ghost"
                        onClick={() => setSelectedCli(tool.id)}
                        className="flex flex-col items-center gap-1.5 group relative p-0"
                      >
                        <div className={`transition-transform group-hover:scale-110 shadow-sm ${selectedCli === tool.id ? 'ring-2 ring-cherry-ring rounded-xl' : ''}`}>
                          <CLIIcon tool={tool} />
                        </div>
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[68px]">
                          {tool.name}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Community */}
              {communityTools.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground/50 mb-3 px-1">社区工具</p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-x-2 gap-y-4">
                    {communityTools.map(tool => (
                      <Button size="inline"
                        key={tool.id}
                        variant="ghost"
                        onClick={() => setSelectedCli(tool.id)}
                        className="flex flex-col items-center gap-1.5 group relative p-0"
                      >
                        <div className={`transition-transform group-hover:scale-110 shadow-sm ${selectedCli === tool.id ? 'ring-2 ring-cherry-ring rounded-xl' : ''}`}>
                          <CLIIcon tool={tool} />
                        </div>
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[68px]">
                          {tool.name}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========== Drawer Backdrop ========== */}
      <AnimatePresence>
        {selectedCli && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-[var(--z-overlay)] bg-foreground/20"
            onClick={() => setSelectedCli(null)}
          />
        )}
      </AnimatePresence>

      {/* ========== Config Drawer ========== */}
      <AnimatePresence>
        {selectedCli && selectedTool && config && (
          <motion.div
            key={selectedCli}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-[var(--z-popover)] flex items-center justify-center p-6 pointer-events-none"
          >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="pointer-events-auto w-[720px] max-w-[calc(100%-3rem)] h-[560px] max-h-[calc(100%-1.5rem)] bg-card rounded-2xl border border-border/30 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-12 flex-shrink-0 border-b border-border/15">
              <div className="flex items-center gap-2.5">
                <CLIIcon tool={selectedTool} size="sm" />
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-foreground">{selectedTool.name}</span>
                  <span className="text-xs text-muted-foreground/50">{selectedTool.version}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/50 text-muted-foreground/50">{selectedTool.category === 'official' ? '官方' : '社区'}</span>
                </div>
              </div>
              <Button variant="ghost" onClick={() => setSelectedCli(null)} className="w-6 h-6 rounded-md p-0 text-muted-foreground/40 hover:text-foreground hover:bg-accent transition-colors">
                <X size={13} />
              </Button>
            </div>

            {/* Body: 侧边栏子 Tab + 配置内容 */}
            <div className="flex-1 flex min-h-0">
              {/* sub-tab sidebar */}
              <div className="w-[150px] flex-shrink-0 border-r border-border/15 p-2 space-y-0.5 overflow-y-auto scrollbar-hide">
                {([
                  { id: 'launch', label: '启动', icon: Play },
                  { id: 'provider', label: '路由', icon: Server },
                  { id: 'mcp', label: 'MCP', icon: Boxes },
                  { id: 'prompt', label: '规则', icon: FileText },
                  { id: 'skills', label: '技能', icon: Puzzle },
                  { id: 'sync', label: '下发 · 同步', icon: GitMerge },
                  { id: 'usage', label: '用量 · 日志', icon: Activity },
                ] as const).map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-[13px] transition-colors ${activeTab === t.id ? 'bg-accent/70 text-foreground font-medium' : 'text-foreground/70 hover:text-foreground hover:bg-accent/30'}`}
                  >
                    <t.icon size={14} className="flex-shrink-0" />
                    <span className="flex-1 text-left truncate">{t.label}</span>
                  </button>
                ))}
              </div>

              {/* content panel */}
              <div className="flex-1 min-w-0 overflow-y-auto px-4 py-4 scrollbar-thin">
                {/* ====== 服务商 · 路由 ====== */}
                {activeTab === 'provider' && activeProfile && (
                <div className="space-y-2">
                    {/* 这是什么：给模型挑「服务商端点」，不是选模型本身 */}
                    <div className="rounded-lg border border-border/40 bg-accent/15 p-2.5 mb-1 space-y-2">
                      <div className="text-xs text-foreground/80 leading-relaxed">
                        给「启动」里选的模型挑<span className="font-medium">服务商端点</span>——同一个模型可由不同服务商提供（官方贵但稳 / 中转便宜），这里决定走哪家、主用挂了切谁。
                        <span className="text-muted-foreground/60"> 服务商在 设置 → 模型服务 配置，这里只排顺序。</span>
                      </div>
                      {/* 请求路径：模型 → (本地代理) → 服务商队列 */}
                      <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
                        <span className="px-2 py-1 rounded-md bg-card border border-border/40 font-mono text-foreground/80">{codeModels.find(m => m.id === config.model)?.name?.split('/').pop() ?? '模型'}</span>
                        <span className="text-muted-foreground/40">→</span>
                        {proxyEnabled && (
                          <>
                            <span className="px-2 py-1 rounded-md bg-card border border-border/40 text-foreground/70">本地代理</span>
                            <span className="text-muted-foreground/40">→</span>
                          </>
                        )}
                        <span className="px-2 py-1 rounded-md bg-card border border-border/40 text-foreground/80">{primaryProvider?.name ?? '未配置'}{proxyEnabled && hasFailover ? ` +${routeProviders.length - 1} 备` : ''}</span>
                      </div>
                    </div>
                    {/* 本地代理接管 — 开=经本地代理转发(记录用量 + 故障转移 + 格式转换)；关=CLI 直连 */}
                    <label className="flex items-center justify-between mb-2 cursor-pointer">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <Zap size={12} className="text-foreground/60 flex-shrink-0" />
                        <span className="text-xs text-foreground/80">本地代理接管</span>
                      </span>
                      <Switch checked={proxyEnabled} onCheckedChange={() => updateConfig(selectedCli, { proxyEnabled: !proxyEnabled })} />
                    </label>

                    {proxyEnabled ? (
                      <div className="space-y-2">
                        {/* 代理服务地址 */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-accent/20 border border-border/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0 animate-pulse" />
                          <span className="text-[11px] text-muted-foreground/60 flex-shrink-0">代理地址</span>
                          <span className="text-[11px] font-mono text-foreground/70 truncate flex-1">{proxyStats.address}</span>
                          <Tooltip content="复制" side="top"><Button variant="ghost" size="inline" className="w-5 h-5 p-0 rounded text-muted-foreground/40 hover:text-foreground flex-shrink-0"><Copy size={11} /></Button></Tooltip>
                        </div>
                        {needsConversion && (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-info/10 text-[11px] text-info">
                            <ArrowLeftRight size={11} className="flex-shrink-0" />
                            <span>{familyLabel[providerFamily!]} 格式 → {familyLabel[nativeFamily!]} · 代理自动转换</span>
                          </div>
                        )}
                        {/* 故障转移队列 */}
                        <div className="text-[11px] text-muted-foreground/50">{hasFailover ? '故障转移队列 · 主用挂了按优先级自动切' : '路由 · 单服务商（加备用即开启故障转移）'}</div>
                        <div className="space-y-1.5">
                          {routeProviders.map((prov, i) => (
                            <div key={prov.id} className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-border/30 bg-accent/5">
                              <span className="text-[10px] font-mono text-muted-foreground/40 flex-shrink-0 w-4 text-center">P{i + 1}</span>
                              <Tooltip content={healthMeta[prov.health].label} side="top">
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${healthMeta[prov.health].dot}`} />
                              </Tooltip>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-foreground truncate">{prov.name}</span>
                                  {i === 0
                                    ? <span className="text-[10px] px-1 py-px rounded bg-primary/10 text-primary flex-shrink-0">主用</span>
                                    : <span className="text-[10px] px-1 py-px rounded bg-accent/60 text-muted-foreground/60 flex-shrink-0">备用 {i}</span>}
                                  <span className={`text-[10px] px-1 py-px rounded flex-shrink-0 inline-flex items-center gap-0.5 ${queueStatusMeta[prov.health].cls}`}>
                                    {prov.health === 'down' && <ShieldAlert size={9} />}
                                    {queueStatusMeta[prov.health].label}
                                  </span>
                                </div>
                                <div className="text-[10px] text-muted-foreground/40 truncate font-mono">{prov.apiHost}</div>
                              </div>
                              <div className="flex items-center gap-0.5 flex-shrink-0">
                                <Tooltip content="上移" side="top"><Button variant="ghost" size="inline" disabled={i === 0} onClick={() => moveProvider(prov.id, -1)} className="w-5 h-5 p-0 rounded text-muted-foreground/40 hover:text-foreground disabled:opacity-30"><ArrowUp size={11} /></Button></Tooltip>
                                <Tooltip content="下移" side="top"><Button variant="ghost" size="inline" disabled={i === routeProviders.length - 1} onClick={() => moveProvider(prov.id, 1)} className="w-5 h-5 p-0 rounded text-muted-foreground/40 hover:text-foreground disabled:opacity-30"><ArrowDown size={11} /></Button></Tooltip>
                                <Tooltip content="移除" side="top"><Button variant="ghost" size="inline" disabled={routeProviders.length <= 1} onClick={() => removeProvider(prov.id)} className="w-5 h-5 p-0 rounded text-muted-foreground/40 hover:text-destructive disabled:opacity-30"><Trash2 size={10} /></Button></Tooltip>
                              </div>
                            </div>
                          ))}
                          <div className="flex items-center justify-between">
                            {availableToAdd.length > 0 ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" size="inline" className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground/60 hover:text-foreground"><Plus size={11} /> 添加备用服务商</Button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-[220px] p-1">
                                  {availableToAdd.map(p => (
                                    <Button key={p.id} variant="ghost" size="inline" onClick={() => addProvider(p.id)} className="w-full justify-start gap-2 px-2 py-1.5 text-xs">
                                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${healthMeta[p.health].dot}`} />
                                      <span className="flex-1 text-left truncate">{p.name}</span>
                                      <span className="text-[10px] text-muted-foreground/40">{p.type}</span>
                                    </Button>
                                  ))}
                                </PopoverContent>
                              </Popover>
                            ) : <span />}
                            <button type="button" className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground/50 hover:text-foreground transition-colors">
                              模型服务管理 <ExternalLink size={9} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* 代理关闭：CLI 直连单个服务商 */
                      <div className="space-y-1.5">
                        <SelectDropdown
                          items={configuredProviders}
                          selectedId={activeProfile.primary}
                          onSelect={(id) => updateActiveProfile({ primary: id })}
                          renderSelected={(p) => p && (
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${healthMeta[p.health].dot}`} />
                              <span className="text-foreground truncate">{p.name}</span>
                              <span className="text-muted-foreground/40 truncate font-mono text-[10px]">{p.apiHost}</span>
                            </div>
                          )}
                          renderItem={(p, isSelected) => (
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${healthMeta[p.health].dot}`} />
                              <span className="truncate flex-1 text-left">{p.name}</span>
                              <span className="text-[10px] text-muted-foreground/40 flex-shrink-0">{p.type}</span>
                              {isSelected && <Check size={11} className="text-primary flex-shrink-0 ml-0.5" />}
                            </div>
                          )}
                        />
                        <div className="text-[10px] text-muted-foreground/40">CLI 直接写入该服务商地址，不经本地代理（无用量统计 / 故障转移 / 格式转换）。</div>
                      </div>
                    )}
                </div>
                )}

                {/* ====== 用量 · 日志 ====== */}
                {activeTab === 'usage' && (
                <div className="space-y-2">
                    {proxyEnabled ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: '总请求', value: proxyStats.totalRequests.toLocaleString() },
                            { label: '成功率', value: `${proxyStats.successRate}%` },
                            { label: '活跃连接', value: String(proxyStats.activeConns) },
                            { label: '运行时间', value: proxyStats.uptime },
                          ].map(s => (
                            <div key={s.label} className="px-3 py-2 rounded-md bg-accent/20 border border-border/30">
                              <div className="text-[11px] text-muted-foreground/60">{s.label}</div>
                              <div className="text-base text-foreground font-semibold tabular-nums">{s.value}</div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 rounded-md bg-accent/20 border border-border/30 text-xs">
                          <span className="text-muted-foreground/70">Token <span className="font-mono text-foreground">↑{proxyStats.tokensIn}</span> · <span className="font-mono text-foreground">↓{proxyStats.tokensOut}</span></span>
                          <span className="text-muted-foreground/70">成本估算 <span className="text-foreground font-semibold">${proxyStats.cost.toFixed(2)}</span></span>
                        </div>
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-xs text-foreground/70">记录请求日志</span>
                          <Switch checked={config.proxyLog} onCheckedChange={() => updateConfig(selectedCli, { proxyLog: !config.proxyLog })} />
                        </label>
                        {config.proxyLog && (
                          <div>
                            <div className="text-xs text-muted-foreground/60 mb-1.5">最近请求</div>
                            <div className="space-y-0.5">
                              {requestLog.map((r, i) => (
                                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent/20 text-[11px]">
                                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${r.status === 'ok' ? 'bg-success' : 'bg-destructive'}`} />
                                  <span className="font-mono text-muted-foreground/60 flex-shrink-0">{r.time}</span>
                                  <span className="text-foreground/80 truncate flex-1">{r.provider}</span>
                                  <span className="font-mono text-muted-foreground/60 flex-shrink-0">{r.tokens}</span>
                                  <span className={`font-mono flex-shrink-0 ${r.status === 'ok' ? 'text-muted-foreground/60' : 'text-destructive'}`}>{r.latency}</span>
                                </div>
                              ))}
                            </div>
                            <button type="button" className="mt-1.5 text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors">在「设置 → 用量」查看完整日志 →</button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center min-h-[180px] px-3 rounded-md border border-dashed border-border/40 text-xs text-muted-foreground/50 text-center">
                        开启「本地代理接管」后，这里记录请求数、成功率、Token 用量与请求日志。
                      </div>
                    )}
                </div>
                )}

                {/* ====== MCP (卡片 + 添加，参考 Agent 的配置) ====== */}
                {activeTab === 'mcp' && (
                <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs text-muted-foreground/60">从 Cherry 已配置的 MCP 中选，下发到 <span className="font-mono">.mcp.json</span></span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="inline" className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-foreground/70 hover:text-foreground hover:bg-accent/40 transition-colors">
                            <Plus size={12} /> 添加 MCP
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-[280px] p-0 flex flex-col max-h-[340px]">
                          <div className="p-1.5 border-b border-border/15">
                            <SearchInput
                              value={mcpSearch}
                              onChange={setMcpSearch}
                              placeholder="搜索 MCP…"
                              iconSize={12}
                              wrapperClassName="px-2 py-1 rounded-md border border-border/40 bg-transparent"
                              clearable
                            />
                          </div>
                          <div className="p-1 overflow-y-auto scrollbar-thin">
                            {mcpServers.filter(s => !mcpSearch || s.name.toLowerCase().includes(mcpSearch.toLowerCase()) || s.desc.toLowerCase().includes(mcpSearch.toLowerCase())).map(s => {
                              const on = config.mcp.includes(s.id);
                              return (
                                <button key={s.id} type="button" onClick={() => toggleInList('mcp', s.id)} className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-accent/40 transition-colors text-left">
                                  <span className="w-7 h-7 rounded-md bg-accent/40 flex items-center justify-center flex-shrink-0"><Server size={13} className="text-muted-foreground/70" /></span>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs text-foreground truncate">{s.name}</div>
                                    <div className="text-[10px] text-muted-foreground/55 truncate">{s.desc}</div>
                                  </div>
                                  {on && <Check size={12} className="text-success flex-shrink-0" />}
                                </button>
                              );
                            })}
                            {mcpServers.filter(s => !mcpSearch || s.name.toLowerCase().includes(mcpSearch.toLowerCase()) || s.desc.toLowerCase().includes(mcpSearch.toLowerCase())).length === 0 && (
                              <div className="px-2 py-6 text-center text-xs text-muted-foreground/40">未找到「{mcpSearch}」</div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    {config.mcp.length > 0 ? (
                      <div className="space-y-2">
                        {mcpServers.filter(s => config.mcp.includes(s.id)).map(s => (
                          <div key={s.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-border/30 bg-accent/15">
                            <div className="w-7 h-7 rounded-md bg-accent/40 flex items-center justify-center flex-shrink-0"><Server size={13} className="text-muted-foreground/70" /></div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-foreground truncate">{s.name}</div>
                              <div className="text-xs text-muted-foreground/55 truncate">{s.desc}</div>
                            </div>
                            <Tooltip content="移除" side="top"><Button variant="ghost" size="inline" onClick={() => toggleInList('mcp', s.id)} className="w-6 h-6 p-0 rounded text-muted-foreground/40 hover:text-destructive flex-shrink-0"><X size={11} /></Button></Tooltip>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1.5 py-8 rounded-xl border border-dashed border-border/40">
                        <Server size={20} className="text-muted-foreground/30" />
                        <div className="text-xs text-muted-foreground/50">未启用 MCP · 点右上「添加 MCP」</div>
                      </div>
                    )}
                </div>
                )}

                {/* ====== 规则 (Prompts) ====== */}
                {activeTab === 'prompt' && (
                <div>
                    {/* 来源：资源库 / 自定义 — radio */}
                    <div className="flex items-center gap-4 mb-2.5">
                      <span className="text-xs text-foreground/70">来源</span>
                      {([['library', '资源库'], ['custom', '自定义']] as const).map(([val, label]) => {
                        const active = config.promptSource === val;
                        return (
                          <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                            <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${active ? 'border-foreground' : 'border-muted-foreground/40'}`}>
                              {active && <span className="w-1.5 h-1.5 rounded-full bg-foreground" />}
                            </span>
                            <input type="radio" name="promptSource" className="sr-only" checked={active} onChange={() => updateConfig(selectedCli, { promptSource: val })} />
                            <span className={`text-xs ${active ? 'text-foreground' : 'text-muted-foreground/60'}`}>{label}</span>
                          </label>
                        );
                      })}
                    </div>

                    {config.promptSource === 'library' ? (
                      <div className="space-y-2">
                        <SelectDropdown
                          items={promptLibrary}
                          selectedId={config.promptId}
                          placeholder="从资源库选择 Prompt…"
                          onSelect={(id) => { const p = promptLibrary.find(x => x.id === id); updateConfig(selectedCli, { promptId: id, prompt: p?.content ?? '' }); }}
                          renderSelected={(p) => p && (
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="flex-shrink-0">{p.avatar}</span>
                              <span className="text-foreground truncate">{p.name}</span>
                            </div>
                          )}
                          renderItem={(p, isSelected) => (
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="flex-shrink-0">{p.avatar}</span>
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-left">{p.name}</div>
                                <div className="truncate text-left text-[10px] text-muted-foreground/40">{p.description}</div>
                              </div>
                              {isSelected && <Check size={11} className="text-primary flex-shrink-0 ml-0.5" />}
                            </div>
                          )}
                        />
                        {(() => {
                          const p = promptLibrary.find(x => x.id === config.promptId);
                          return p ? (
                            <div className="px-3 py-2.5 rounded-md border border-muted-foreground/25 bg-accent/20 text-xs text-foreground/90 font-mono whitespace-pre-wrap min-h-[220px] max-h-[320px] overflow-y-auto scrollbar-thin leading-relaxed">{p.content}</div>
                          ) : (
                            <div className="flex items-center justify-center min-h-[220px] px-2.5 rounded-md border border-dashed border-muted-foreground/30 text-xs text-muted-foreground/55 text-center">选一个资源库 Prompt，下发时写入 {cliMemoryFile[selectedCli] ?? 'CLAUDE.md'}</div>
                          );
                        })()}
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground/70">
                          <span>内容来自资源库 · 可一键复制为自定义后修改</span>
                          <button
                            type="button"
                            disabled={!config.promptId}
                            onClick={() => config.promptId && updateConfig(selectedCli, { promptSource: 'custom' })}
                            className="flex items-center gap-0.5 text-[11px] hover:text-foreground transition-colors disabled:opacity-40"
                          >
                            复制为自定义 <ArrowLeftRight size={10} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <Textarea
                        value={config.prompt}
                        onChange={e => updateConfig(selectedCli, { prompt: e.target.value })}
                        rows={11}
                        className="w-full min-h-[240px] bg-transparent border border-border/30 rounded-md px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-border/50 transition-colors resize-none font-mono scrollbar-thin leading-relaxed"
                        placeholder={`# 写入 ${cliMemoryFile[selectedCli] ?? 'CLAUDE.md'}`}
                      />
                    )}

                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                      <Checkbox checked={config.promptShared} onCheckedChange={() => updateConfig(selectedCli, { promptShared: !config.promptShared })} className="rounded-[4px] flex-shrink-0" />
                      <span className="text-xs text-foreground/70">多个 CLI 共用同一份规则</span>
                    </label>
                </div>
                )}

                {/* ====== 技能 (资源库 Skill — 卡片 + 添加，参考 Agent 的加 Skill 交互) ====== */}
                {activeTab === 'skills' && (
                <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs text-muted-foreground/60">从资源库装进该 CLI 的技能目录</span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="inline" className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-foreground/70 hover:text-foreground hover:bg-accent/40 transition-colors">
                            <Plus size={12} /> 添加技能
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-[280px] p-0 flex flex-col max-h-[340px]">
                          <div className="p-1.5 border-b border-border/15">
                            <SearchInput
                              value={skillSearch}
                              onChange={setSkillSearch}
                              placeholder="搜索技能…"
                              iconSize={12}
                              wrapperClassName="px-2 py-1 rounded-md border border-border/40 bg-transparent"
                              clearable
                            />
                          </div>
                          <div className="p-1 overflow-y-auto scrollbar-thin">
                            {skillLibrary.filter(s => !skillSearch || s.name.toLowerCase().includes(skillSearch.toLowerCase()) || s.description.toLowerCase().includes(skillSearch.toLowerCase())).map(s => {
                              const on = config.skills.includes(s.id);
                              return (
                                <button key={s.id} type="button" onClick={() => toggleInList('skills', s.id)} className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-accent/40 transition-colors text-left">
                                  <span className="w-7 h-7 rounded-md bg-accent/40 flex items-center justify-center flex-shrink-0 text-sm">{s.avatar}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs text-foreground truncate">{s.name}</div>
                                    <div className="text-[10px] text-muted-foreground/55 truncate">{s.description}</div>
                                  </div>
                                  {on && <Check size={12} className="text-success flex-shrink-0" />}
                                </button>
                              );
                            })}
                            {skillLibrary.filter(s => !skillSearch || s.name.toLowerCase().includes(skillSearch.toLowerCase()) || s.description.toLowerCase().includes(skillSearch.toLowerCase())).length === 0 && (
                              <div className="px-2 py-6 text-center text-xs text-muted-foreground/40">未找到「{skillSearch}」</div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    {config.skills.length > 0 ? (
                      <div className="space-y-2">
                        {skillLibrary.filter(s => config.skills.includes(s.id)).map(s => (
                          <div key={s.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-border/30 bg-accent/15">
                            <div className="w-7 h-7 rounded-md bg-accent/40 flex items-center justify-center flex-shrink-0 text-sm">{s.avatar}</div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-foreground truncate">{s.name}</div>
                              <div className="text-xs text-muted-foreground/55 truncate">{s.description}</div>
                            </div>
                            <Tooltip content="移除" side="top"><Button variant="ghost" size="inline" onClick={() => toggleInList('skills', s.id)} className="w-6 h-6 p-0 rounded text-muted-foreground/40 hover:text-destructive flex-shrink-0"><X size={11} /></Button></Tooltip>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1.5 py-8 rounded-xl border border-dashed border-border/40">
                        <Puzzle size={20} className="text-muted-foreground/30" />
                        <div className="text-xs text-muted-foreground/50">还没装技能 · 点右上「添加技能」</div>
                      </div>
                    )}
                </div>
                )}

                {/* ====== 下发 · 同步 ====== */}
                {activeTab === 'sync' && (
                <div className="space-y-4">
                  {/* 下发条 — write everything to the CLI's real config files */}
                  <div className="rounded-lg border border-border/40 bg-accent/10 p-3 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />
                        <span className="text-foreground/70 truncate">{proxyTakeover ? `本地代理接管 · ${hasFailover ? `${routeProviders.length} 家故障转移` : '记录用量'}` : `直连 · ${primaryProvider?.name ?? '未配置'}`}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground/50 flex-shrink-0">写入 {writeTargets.length} 个文件</span>
                    </div>
                    <div className="space-y-1">
                      {writeTargets.map((w, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-card border border-border/20">
                          <FileCode2 size={11} className="flex-shrink-0 text-muted-foreground/50" />
                          <span className="text-[11px] text-foreground/70 font-mono truncate flex-1">{w.file}</span>
                          <span className="text-[10px] text-muted-foreground/50 flex-shrink-0">{w.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={applyConfig}
                        className="gap-1.5"
                      >
                        {appliedConfig ? <><Check size={13} /> 已写入并备份</> : <><RefreshCw size={13} /> 应用并备份</>}
                      </Button>
                      <button type="button" className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors">查看 diff</button>
                    </div>
                  </div>

                  {/* 同步到其它工具 (universal — one config, many CLIs) */}
                  <div>
                    <FieldLabel hint="一份服务商配置同步到多个 CLI，改一处全部生效">同步到其它工具</FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="inline"
                          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md border border-border/40 text-xs bg-transparent hover:bg-accent/40 transition-colors"
                        >
                          <span className={`truncate text-left flex-1 ${config.syncTargets.length ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                            {config.syncTargets.length ? `已同步到 ${config.syncTargets.length} 个工具` : '选择要同步的工具…'}
                          </span>
                          <ChevronDown size={12} className="text-muted-foreground/50 flex-shrink-0 ml-2" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-1 max-h-[260px] overflow-y-auto scrollbar-thin">
                        {cliTools.filter(t => t.id !== selectedCli).map(t => {
                          const on = config.syncTargets.includes(t.id);
                          return (
                            <label key={t.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent/40 transition-colors">
                              <Checkbox checked={on} onCheckedChange={() => toggleSync(t.id)} className="rounded-[4px] flex-shrink-0" />
                              <span className="text-xs text-foreground flex-1 truncate">{t.name}</span>
                              <span className="text-[10px] text-muted-foreground/40 flex-shrink-0">{t.version}</span>
                            </label>
                          );
                        })}
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                )}

                {/* ====== 启动参数 ====== */}
                {activeTab === 'launch' && (
                <div className="space-y-4">
              {/* Model */}
              <div>
                <FieldLabel hint="为 CLI 工具选择要使用的 AI 模型">模型</FieldLabel>
                <SelectDropdown
                  items={codeModels}
                  selectedId={config.model}
                  onSelect={(id) => updateConfig(selectedCli, { model: id })}
                  renderSelected={(item) => item && (
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: item.color }}>
                        <Sparkles size={6} className="text-white" />
                      </div>
                      <span className="text-foreground truncate">{item.name}</span>
                    </div>
                  )}
                  renderItem={(item, isSelected) => (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: item.color }}>
                        <Sparkles size={6} className="text-white" />
                      </div>
                      <span className="truncate flex-1">{item.name}</span>
                      <span className="text-muted-foreground/50 flex-shrink-0 text-xs">{item.provider}</span>
                      {isSelected && <Check size={11} className="text-primary flex-shrink-0 ml-0.5" />}
                    </div>
                  )}
                />
              </div>

              {/* Working directory */}
              <div>
                <FieldLabel hint="CLI 工具启动时的工作目录">工作目录</FieldLabel>
                <div className="flex items-center gap-0 rounded-md border border-border/30 overflow-hidden">
                  <div className="flex items-center px-2.5 text-muted-foreground/40">
                    <FolderOpen size={11} />
                  </div>
                  <Input
                    value={config.workDir}
                    onChange={e => updateConfig(selectedCli, { workDir: e.target.value })}
                    className="flex-1 bg-transparent border-none outline-none py-1.5 pr-1 text-xs text-foreground placeholder:text-muted-foreground/60 font-mono shadow-none focus-visible:ring-0"
                    placeholder="选择工作目录..."
                  />
                  {config.workDir && (
                    <Button size="inline"
                      variant="ghost"
                      onClick={() => updateConfig(selectedCli, { workDir: '' })}
                      className="px-2 text-muted-foreground/40 hover:text-foreground transition-colors"
                    >
                      <X size={10} />
                    </Button>
                  )}
                  <div className="w-px h-4 bg-border/30" />
                  <Button variant="ghost" size="inline" className="px-2 py-1.5 text-xs text-muted-foreground/40 hover:text-foreground hover:bg-accent/50 transition-colors flex-shrink-0">
                    选择
                  </Button>
                </div>
              </div>

              {/* Terminal */}
              <div>
                <FieldLabel hint="选择命令执行的终端应用">终端</FieldLabel>
                <SelectDropdown
                  items={terminalOptions}
                  selectedId={config.terminal}
                  onSelect={(id) => updateConfig(selectedCli, { terminal: id })}
                  renderSelected={(item) => item && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs leading-none">{item.icon}</span>
                      <span className="text-foreground">{item.name}</span>
                    </div>
                  )}
                  renderItem={(item, isSelected) => (
                    <div className="flex items-center gap-2">
                      <span className="text-xs leading-none">{item.icon}</span>
                      <span className="flex-1">{item.name}</span>
                      {isSelected && <Check size={11} className="text-primary flex-shrink-0" />}
                    </div>
                  )}
                />
              </div>

              {/* Environment variables */}
              <div>
                <FieldLabel hint="每行一个，格式：KEY=value">环境变量</FieldLabel>
                <Textarea
                  value={config.envVars}
                  onChange={e => updateConfig(selectedCli, { envVars: e.target.value })}
                  rows={2}
                  className="w-full bg-transparent border border-border/30 rounded-md px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-border/50 transition-colors resize-none font-mono scrollbar-thin"
                  placeholder={"KEY1=value1\nKEY2=value2"}
                />
              </div>

              {/* Check updates */}
              <label className="flex items-center gap-2 cursor-pointer group">
                <Checkbox checked={config.checkUpdates} onCheckedChange={() => updateConfig(selectedCli, { checkUpdates: !config.checkUpdates })} className="rounded-[4px] flex-shrink-0" />
                <span className="text-sm text-muted-foreground/40 group-hover:text-foreground transition-colors">检查更新并安装最新版本</span>
              </label>
              </div>
                )}
              </div>
            </div>

            {/* Footer — summary inline-left, compact 启动 right */}
            <div className="flex-shrink-0 border-t border-border/15 px-4 py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground/70 min-w-0">
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Cpu size={11} />
                  <span>{selectedTool.name}</span>
                </div>
                <span className="text-border">·</span>
                <div className="flex items-center gap-1 truncate">
                  <Sparkles size={10} />
                  <span className="truncate">{codeModels.find(m => m.id === config.model)?.name?.split('/').pop()}</span>
                </div>
                <span className="text-border">·</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Terminal size={11} />
                  <span>{terminalOptions.find(t => t.id === config.terminal)?.name}</span>
                </div>
              </div>

              <Button
                variant="default"
                size="sm"
                onClick={handleLaunch}
                disabled={launching}
                className={`gap-1.5 px-5 flex-shrink-0 active:scale-[0.97] ${
                  launchSuccess ? '!bg-cherry-primary-dark !text-white hover:!bg-cherry-primary-dark' : ''
                } ${launching ? 'cursor-wait' : ''}`}
              >
                {launchSuccess ? (
                  <><Check size={13} /><span>已启动</span></>
                ) : launching ? (
                  <><span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" /><span>启动中</span></>
                ) : (
                  <><Play size={12} /><span>启动</span></>
                )}
              </Button>
            </div>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
