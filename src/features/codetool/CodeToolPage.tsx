import React, { useState } from 'react';
import {
  ChevronDown, EyeOff, X, Check, Code2, ExternalLink,
  Server, Download, ArrowUpCircle, GripVertical, RotateCcw, Play,
  FlaskConical, ListPlus, Wand2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Tooltip } from '@/app/components/Tooltip';
import { MOCK_RESOURCES } from '@/app/config/constants';
import { Button, Input, SearchInput, Textarea, Checkbox, Switch, BrandLogo, Popover, PopoverTrigger, PopoverContent, ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from '@cherry-studio/ui';

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
  { id: 'openai', name: 'OpenAI Codex', desc: 'OpenAI 编码引擎', color: '#10a37f', initial: 'O', version: 'v4.1.0', category: 'official' },
  { id: 'gemini', name: 'Gemini CLI', desc: 'Google 代码工具', color: '#2563eb', initial: 'G', version: 'v0.8.5', category: 'official' },
  { id: 'qwen', name: 'Qwen Code', desc: '通义千问代码助手', color: '#7c3aed', initial: 'Q', version: 'v2.3.1', category: 'official' },
  { id: 'iflow', name: 'iFlow CLI', desc: '智能工作流 CLI', color: '#eab308', initial: '⚡', version: 'v1.5.2', category: 'official' },
  { id: 'copilot', name: 'GitHub Copilot CLI', desc: 'GitHub 编码助手', color: '#1a1a2e', initial: 'GH', version: 'v2.1.0', category: 'official' },
  { id: 'kimi', name: 'Kimi CLI', desc: 'Moonshot 代码工具', color: '#1a1a2e', initial: 'K', version: 'v0.9.3', category: 'official' },
  { id: 'opencode', name: 'OpenCode', desc: '开源 AI 编程终端', color: '#0ea5e9', initial: 'OC', version: 'v0.5.0', category: 'community' },
  { id: 'openclaw', name: 'OpenClaw', desc: '多供应商网关 CLI', color: '#8b5cf6', initial: 'OW', version: 'v0.3.2', category: 'community' },
  { id: 'hermes', name: 'Hermes', desc: 'Hermes Agent', color: '#f43f5e', initial: 'H', version: 'v1.1.0', category: 'community' },
];

// Per-CLI install / version status (cc-switch 版本状态卡片). Mock data.
const cliStatus: Record<string, { installed: boolean; current: string; latest: string; canUpgrade: boolean }> = {
  claude: { installed: true, current: '2.1.146', latest: '2.1.191', canUpgrade: true },
  qwen: { installed: true, current: '2.3.1', latest: '2.3.1', canUpgrade: false },
  gemini: { installed: true, current: '0.8.5', latest: '0.9.0', canUpgrade: true },
  openai: { installed: false, current: '未安装', latest: '0.142.1', canUpgrade: false },
  iflow: { installed: true, current: '1.5.2', latest: '1.5.2', canUpgrade: false },
  copilot: { installed: false, current: '未安装', latest: '2.1.0', canUpgrade: false },
  kimi: { installed: true, current: '0.9.3', latest: '1.0.0', canUpgrade: true },
  opencode: { installed: true, current: '0.5.0', latest: '0.6.0', canUpgrade: true },
  openclaw: { installed: false, current: '未安装', latest: '0.3.2', canUpgrade: false },
  hermes: { installed: true, current: '1.1.0', latest: '1.1.0', canUpgrade: false },
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

const healthMeta: Record<ProviderHealth, { dot: string; label: string }> = {
  ok: { dot: 'bg-success', label: '正常' },
  degraded: { dot: 'bg-warning', label: '波动' },
  down: { dot: 'bg-destructive', label: '不可用' },
};

const DEFAULT_PROMPT = '# 项目约定\n\n- 使用 TypeScript 严格模式\n- 提交前跑 lint 与测试\n- 优先复用现有组件\n';

// cc-switch Claude 配置（请求行为，不是服务商端点/Key）
const QUICK_FLAGS = [
  { id: 'hideSign', label: '隐藏 AI 署名' },
  { id: 'teammates', label: 'Teammates 模式' },
  { id: 'toolSearch', label: '启用 Tool Search' },
  { id: 'maxThinking', label: '最大强度思考' },
  { id: 'noAutoUpgrade', label: '禁用自动升级' },
];
const apiFormatItems = [
  { id: 'anthropic', name: 'Anthropic Messages（原生）' },
  { id: 'openai', name: 'OpenAI Chat Completions' },
  { id: 'responses', name: 'OpenAI Responses' },
];
const authFieldItems = [
  { id: 'token', name: 'ANTHROPIC_AUTH_TOKEN（默认）' },
  { id: 'key', name: 'ANTHROPIC_API_KEY' },
];
const MODEL_ROLES = [
  { id: 'sonnet', label: 'Sonnet' },
  { id: 'opus', label: 'Opus' },
  { id: 'haiku', label: 'Haiku' },
];

// OpenAI Codex 用两份文件配置：auth.json + config.toml
const DEFAULT_CODEX_AUTH = '{}\n';
const DEFAULT_CODEX_TOML = `model_provider = "OpenAI"
model = "gpt-5.5"
review_model = "gpt-5.4"
model_reasoning_effort = "xhigh"
disable_response_storage = true
network_access = "enabled"
windows_wsl_setup_acknowledged = true
model_context_window = 1000000
model_auto_compact_token_limit = 900000

[model_providers.OpenAI]
name = "OpenAI"
base_url = "https://yin.ai-free.work"
wire_api = "responses"
requires_openai_auth = true

[mcp_servers]

[mcp_servers.pencil]
type = "stdio"
command = "/Applications/Pencil.app/Contents/Resources/app.asar.unpacked/out/mcp-server-darwin-arm64"
args = ["--app", "desktop"]

[projects."/Users/siin/conductor/repos/cherry-studio"]
trust_level = "trusted"
`;

// Claude Code 自定义配置（~/.claude/settings.json）
const DEFAULT_CLAUDE_SETTINGS = `{
  "autoUpdatesChannel": "latest",
  "env": {
    "ANTHROPIC_MODEL": "claude-sonnet-4-5",
    "CLAUDE_CODE_DISABLE_TERMINAL_TITLE": "1"
  },
  "permissions": {
    "allow": []
  }
}
`;

// Codex 推理强度（config.toml: model_reasoning_effort）
const codexEffortItems = [
  { id: 'minimal', name: 'minimal' },
  { id: 'low', name: 'low' },
  { id: 'medium', name: 'medium' },
  { id: 'high', name: 'high' },
  { id: 'xhigh', name: 'xhigh' },
];

// Gemini CLI 配置：单一模型 + 认证方式 + settings.json（无 API 格式 / 角色映射）
const geminiAuthItems = [
  { id: 'apikey', name: 'Gemini API Key' },
  { id: 'oauth', name: 'Google 登录（OAuth）' },
  { id: 'vertex', name: 'Vertex AI' },
];
const geminiModelItems = [
  { id: 'gemini-2.5-pro', name: 'gemini-2.5-pro' },
  { id: 'gemini-2.5-flash', name: 'gemini-2.5-flash' },
  { id: 'gemini-2.5-flash-lite', name: 'gemini-2.5-flash-lite' },
  { id: 'gemini-2.0-flash', name: 'gemini-2.0-flash' },
];
const geminiAuthHint: Record<string, string> = {
  apikey: '通过 GEMINI_API_KEY 鉴权，第三方网关需设置 GOOGLE_GEMINI_BASE_URL',
  oauth: '使用 Google 账号交互登录，无需 API Key',
  vertex: '走 Vertex AI（GOOGLE_CLOUD_PROJECT / LOCATION + ADC）',
};
const DEFAULT_GEMINI_SETTINGS = `{
  "model": {
    "name": "gemini-2.5-pro"
  },
  "ui": {
    "theme": "Default"
  }
}
`;

// 非 Claude 单一模型 CLI 的自定义配置文件
const DEFAULT_GENERIC_SETTINGS = `{
  "model": "",
  "env": {},
  "mcpServers": {}
}
`;

// 单一模型 CLI 可选的模型（来自 模型服务）
const codeModelItems = [
  { id: 'claude-sonnet-4-5', name: 'claude-sonnet-4-5' },
  { id: 'claude-opus-4-5', name: 'claude-opus-4-5' },
  { id: 'deepseek-v3', name: 'deepseek-v3' },
  { id: 'deepseek-r1', name: 'deepseek-r1' },
  { id: 'gpt-5.1', name: 'gpt-5.1' },
  { id: 'kimi-k2-0905', name: 'kimi-k2-0905' },
  { id: 'qwen3-max', name: 'qwen3-max' },
  { id: 'glm-4.6', name: 'glm-4.6' },
  { id: 'gemini-2.5-pro', name: 'gemini-2.5-pro' },
];

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
  const [selectedCli, setSelectedCli] = useState<string | null>(cliTools[0].id);
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
  const [configOpen, setConfigOpen] = useState(false);
  const [configProvider, setConfigProvider] = useState(configuredProviders[0].id);
  const [apiFormat, setApiFormat] = useState<'anthropic' | 'openai' | 'responses'>('anthropic');
  const [authField, setAuthField] = useState<'token' | 'key'>('token');
  const [quickFlags, setQuickFlags] = useState<Set<string>>(new Set(['maxThinking']));
  const [bigContext, setBigContext] = useState<Set<string>>(new Set());
  const [testSeparate, setTestSeparate] = useState(false);
  const [codexAuth, setCodexAuth] = useState(DEFAULT_CODEX_AUTH);
  const [codexToml, setCodexToml] = useState(DEFAULT_CODEX_TOML);
  const [codexEffort, setCodexEffort] = useState('xhigh');
  const [goalMode, setGoalMode] = useState(false);
  const [writeShared, setWriteShared] = useState(false);
  const [claudeJson, setClaudeJson] = useState(DEFAULT_CLAUDE_SETTINGS);
  const [geminiAuth, setGeminiAuth] = useState('apikey');
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-pro');
  const [geminiJson, setGeminiJson] = useState(DEFAULT_GEMINI_SETTINGS);
  const [genericModel, setGenericModel] = useState('');
  const [genericJson, setGenericJson] = useState(DEFAULT_GENERIC_SETTINGS);
  const [providerOrder, setProviderOrder] = useState(configuredProviders.map(p => p.id));
  const [collapsedProviders, setCollapsedProviders] = useState<Set<string>>(new Set());
  const [collapsedSectionOpen, setCollapsedSectionOpen] = useState(true);
  const [dragProvider, setDragProvider] = useState<string | null>(null);
  const [installedOverride, setInstalledOverride] = useState<Set<string>>(new Set());
  const [launchState, setLaunchState] = useState<'idle' | 'launching' | 'launched'>('idle');
  const handleLaunchCli = () => {
    if (launchState === 'launching') return;
    setLaunchState('launching');
    setTimeout(() => { setLaunchState('launched'); setTimeout(() => setLaunchState('idle'), 2200); }, 1400);
  };
  const orderedProviders = providerOrder
    .map(id => configuredProviders.find(p => p.id === id))
    .filter((p): p is ConfiguredProvider => Boolean(p));
  const handleProviderDrop = (targetId: string) => {
    if (!dragProvider || dragProvider === targetId) { setDragProvider(null); return; }
    setProviderOrder(prev => {
      const arr = prev.filter(id => id !== dragProvider);
      const ti = arr.indexOf(targetId);
      arr.splice(ti < 0 ? arr.length : ti, 0, dragProvider);
      return arr;
    });
    setDragProvider(null);
  };
  const toggleProviderCollapsed = (id: string) =>
    setCollapsedProviders(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  // Get or create config for a CLI tool
  const getConfig = (cliId: string) => {
    if (configState[cliId]) return configState[cliId];
    return {
      model: 'cm1',
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

  // Active routing profile of the selected CLI — its primary is the "已启用" 服务商.
  const activeProfile = config ? (config.profiles.find(p => p.id === config.activeProfile) ?? config.profiles[0]) : null;
  const updateActiveProfile = (patch: Partial<RouteProfile>) => {
    if (!selectedCli || !config || !activeProfile) return;
    updateConfig(selectedCli, {
      profiles: config.profiles.map(p => (p.id === activeProfile.id ? { ...p, ...patch } : p)),
    });
  };

  const displayedTools = cliTools.filter(
    t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.desc.includes(searchTerm)
  );

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

      {/* Body: 左侧 CLI 工具列表 + 右侧配置 */}
      <div className="flex-1 flex min-h-0 border-t border-border/15">
        {/* Left rail: CLI tools */}
        <div className="w-[210px] flex-shrink-0 border-r border-border/15 flex flex-col min-h-0">
          <div className="p-2.5 border-b border-border/10">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="搜索 CLI…"
              iconSize={12}
              wrapperClassName="px-2.5 py-1.5 rounded-md border border-border/50 bg-muted/20"
              clearable
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
            {displayedTools.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground/50 py-8">{searchTerm ? '没有匹配的工具' : '暂无工具'}</div>
            ) : (
              <div className="space-y-0.5">
                {displayedTools.map(tool => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => setSelectedCli(tool.id)}
                    className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors ${selectedCli === tool.id ? 'bg-accent/55' : 'hover:bg-accent/30'}`}
                  >
                    <CLIIcon tool={tool} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] text-foreground truncate">{tool.name}</div>
                      <div className="flex items-center gap-1.5">
                        {cliStatus[tool.id]?.installed === false && !installedOverride.has(tool.id)
                          ? <span className="text-[11px] text-muted-foreground/55 truncate">未安装</span>
                          : <span className="text-[11px] text-muted-foreground/50 font-mono truncate">v{cliStatus[tool.id]?.installed ? cliStatus[tool.id]?.current : (cliStatus[tool.id]?.latest ?? tool.version.replace(/^v/, ''))}</span>}
                        {cliStatus[tool.id]?.installed && cliStatus[tool.id]?.canUpgrade && <Tooltip content="可升级" side="top"><ArrowUpCircle size={12} className="text-warning flex-shrink-0" /></Tooltip>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: 版本状态卡片 + 服务商卡片 */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          {selectedCli && selectedTool && config ? (
          <>
          <div className="flex-1 overflow-y-auto px-6 pt-2.5 pb-5 scrollbar-thin">
            <div className="max-w-2xl mx-auto space-y-5">
              {/* 版本状态卡片 */}
              {(() => {
                const st = cliStatus[selectedCli] ?? { installed: true, current: selectedTool.version, latest: selectedTool.version, canUpgrade: false };
                const isInstalled = st.installed || installedOverride.has(selectedCli);
                const canUpgrade = st.installed && st.canUpgrade;
                return (
                  <div className="rounded-lg border border-border/40 bg-card px-4 py-3">
                    <div className="flex items-center gap-3">
                      <CLIIcon tool={selectedTool} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-foreground font-medium truncate">{selectedTool.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/50 text-muted-foreground/60 flex-shrink-0">macOS</span>
                          {!isInstalled ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/60 text-muted-foreground/70 flex-shrink-0">未安装</span>
                          ) : canUpgrade ? (
                            <Button size="inline" variant="ghost" className="gap-1 px-1.5 py-0 h-auto text-[10px] rounded text-warning hover:text-warning hover:bg-warning/10 flex-shrink-0"><ArrowUpCircle size={10} /> 升级</Button>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/15 text-success flex-shrink-0">已是最新</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 mt-1">
                          <span className="font-mono">{isInstalled ? `v${st.installed ? st.current : st.latest}` : `最新 v${st.latest}`}</span>
                          {canUpgrade && <><ArrowUpCircle size={11} className="text-warning flex-shrink-0" /><span className="font-mono text-warning">v{st.latest}</span></>}
                        </div>
                      </div>
                      {!isInstalled ? (
                        <Button size="inline" variant="ghost" onClick={() => setInstalledOverride(prev => new Set(prev).add(selectedCli))} className="gap-1.5 px-3 py-1.5 text-xs rounded-md border border-border/60 text-muted-foreground hover:text-foreground flex-shrink-0"><Download size={12} /> 安装</Button>
                      ) : (
                        <Button size="inline" variant="ghost" onClick={handleLaunchCli} disabled={launchState === 'launching'} className="gap-1.5 px-3 py-1.5 text-xs rounded-md border border-border/60 text-muted-foreground hover:text-foreground flex-shrink-0">
                          {launchState === 'launched'
                            ? <><Check size={12} className="text-success" /> 已启动</>
                            : launchState === 'launching'
                            ? <><span className="w-3 h-3 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" /> 启动中</>
                            : <><Play size={12} /> 启动</>}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* 服务商卡片 */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Server size={13} className="text-foreground/60" />
                  <span className="text-sm text-foreground">服务商</span>
                </div>
                <div className="space-y-2">
                  {orderedProviders.filter(p => !collapsedProviders.has(p.id)).map(p => {
                    const isActive = activeProfile?.primary === p.id;
                    return (
                      <ContextMenu key={p.id}>
                        <ContextMenuTrigger asChild>
                          <div
                            draggable
                            onDragStart={() => setDragProvider(p.id)}
                            onDragEnd={() => setDragProvider(null)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleProviderDrop(p.id)}
                            className={`rounded-xl border p-3.5 transition-colors ${isActive ? 'border-success/50 bg-success/[0.04]' : 'border-border/40 hover:border-border'} ${dragProvider === p.id ? 'opacity-50' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              <GripVertical size={13} className="text-muted-foreground/25 hover:text-muted-foreground/55 cursor-grab active:cursor-grabbing flex-shrink-0" />
                              <Tooltip content={healthMeta[p.health].label} side="top"><span className={`w-2 h-2 rounded-full flex-shrink-0 ${healthMeta[p.health].dot}`} /></Tooltip>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-foreground truncate">{p.name}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/60 text-muted-foreground/60 flex-shrink-0">{p.type}</span>
                                  {isActive && <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/15 text-success flex-shrink-0">已启用</span>}
                                </div>
                                <div className="text-[11px] text-muted-foreground/50 font-mono truncate mt-0.5">{p.apiHost}</div>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <Button variant="ghost" size="inline" onClick={() => { setConfigProvider(p.id); setConfigOpen(true); }} className="gap-1 px-2.5 py-1 text-xs rounded-md border border-border/50">配置</Button>
                                {isActive ? (
                                  <Button variant="ghost" size="inline" onClick={() => updateActiveProfile({ primary: '' })} className="gap-1 px-2.5 py-1 text-xs rounded-md border border-border/50 text-muted-foreground">禁用</Button>
                                ) : (
                                  <Button variant="ghost" size="inline" onClick={() => updateActiveProfile({ primary: p.id })} className="gap-1 px-2.5 py-1 text-xs rounded-md border border-border/50 text-foreground">启用</Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-32 p-1">
                          <ContextMenuItem onClick={() => toggleProviderCollapsed(p.id)} className="text-xs py-1 gap-1.5">
                            <EyeOff size={11} /> 折叠隐藏
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    );
                  })}

                  <button type="button" className="w-full flex items-center justify-center gap-1 py-2 rounded-xl border border-dashed border-border/50 text-xs text-muted-foreground/55 hover:text-foreground hover:border-border transition-colors">
                    在 设置 → 模型服务 添加服务商 <ExternalLink size={10} />
                  </button>

                  {/* 折叠分割线 + 折叠的服务商 */}
                  {orderedProviders.some(p => collapsedProviders.has(p.id)) && (
                    <div className="pt-1.5 space-y-1.5">
                      <button type="button" onClick={() => setCollapsedSectionOpen(v => !v)} className="w-full flex items-center gap-2 group">
                        <div className="flex-1 h-px bg-border/40" />
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors flex-shrink-0">
                          <ChevronDown size={10} className={`transition-transform ${collapsedSectionOpen ? '' : '-rotate-90'}`} />
                          已折叠 {orderedProviders.filter(p => collapsedProviders.has(p.id)).length}
                        </span>
                        <div className="flex-1 h-px bg-border/40" />
                      </button>
                      {collapsedSectionOpen && orderedProviders.filter(p => collapsedProviders.has(p.id)).map(p => {
                        const isActive = activeProfile?.primary === p.id;
                        return (
                          <ContextMenu key={p.id}>
                            <ContextMenuTrigger asChild>
                              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-border/30 bg-muted/15 hover:bg-accent/25 transition-colors">
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${healthMeta[p.health].dot}`} />
                                <span className="text-xs text-foreground truncate">{p.name}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/50 text-muted-foreground/50 flex-shrink-0">{p.type}</span>
                                {isActive && <span className="text-[10px] text-success flex-shrink-0">已启用</span>}
                                <Button variant="ghost" size="inline" onClick={() => toggleProviderCollapsed(p.id)} className="ml-auto gap-1 px-2 py-0.5 text-[11px] rounded-md text-muted-foreground/55 hover:text-foreground flex-shrink-0"><RotateCcw size={10} /> 恢复</Button>
                              </div>
                            </ContextMenuTrigger>
                            <ContextMenuContent className="w-32 p-1">
                              <ContextMenuItem onClick={() => toggleProviderCollapsed(p.id)} className="text-xs py-1 gap-1.5">
                                <RotateCcw size={11} /> 恢复显示
                              </ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 配置弹框（点服务商卡片「配置」打开） */}
          {configOpen && (
          <div className="fixed inset-0 z-[var(--z-popover)] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-foreground/20" onClick={() => setConfigOpen(false)} />
            <motion.div
              key={selectedCli}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative z-10 w-[720px] max-w-[calc(100%-3rem)] h-[560px] max-h-[calc(100%-1.5rem)] bg-card rounded-2xl border border-border/30 shadow-2xl flex flex-col overflow-hidden"
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
              <Button variant="ghost" onClick={() => setConfigOpen(false)} className="w-6 h-6 rounded-md p-0 text-muted-foreground/40 hover:text-foreground hover:bg-accent transition-colors">
                <X size={13} />
              </Button>
            </div>

            {/* Body: cc-switch Claude 配置（请求行为，不在此配置端点/Key） */}
            <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
              {(() => {
                const prov = configuredProviders.find(p => p.id === configProvider) ?? configuredProviders[0];
                const toggleFlag = (id: string) => setQuickFlags(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
                const toggleBig = (id: string) => setBigContext(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
                const cfgKind = selectedCli === 'openai' ? 'codex' : selectedCli === 'gemini' ? 'gemini' : selectedCli === 'claude' ? 'claude' : 'single';
                return (
                  <div key={prov.id} className="space-y-5">
                    {cfgKind === 'codex' ? (
                    <>
                      {/* 模型配置 */}
                      <div>
                        <div className="text-xs text-foreground/70 mb-2">模型配置</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-[11px] text-foreground/65 mb-1">模型</div>
                            <Input defaultValue="gpt-5.5" className="w-full bg-transparent border border-muted-foreground/25 rounded-md px-2.5 py-1.5 text-xs text-foreground font-mono shadow-none outline-none focus-visible:ring-0 focus:border-border" />
                          </div>
                          <div>
                            <div className="text-[11px] text-foreground/65 mb-1">审阅模型</div>
                            <Input defaultValue="gpt-5.4" className="w-full bg-transparent border border-muted-foreground/25 rounded-md px-2.5 py-1.5 text-xs text-foreground font-mono shadow-none outline-none focus-visible:ring-0 focus:border-border" />
                          </div>
                          <div>
                            <div className="text-[11px] text-foreground/65 mb-1">推理强度</div>
                            <SelectDropdown
                              items={codexEffortItems}
                              selectedId={codexEffort}
                              onSelect={setCodexEffort}
                              renderSelected={(item) => item && <span className="text-foreground font-mono">{item.name}</span>}
                              renderItem={(item, isSelected) => (<div className="flex items-center gap-2"><span className="flex-1 font-mono">{item.name}</span>{isSelected && <Check size={11} className="text-primary flex-shrink-0" />}</div>)}
                            />
                          </div>
                          <div>
                            <div className="text-[11px] text-foreground/65 mb-1">上下文窗口</div>
                            <Input defaultValue="1000000" className="w-full bg-transparent border border-muted-foreground/25 rounded-md px-2.5 py-1.5 text-xs text-foreground font-mono shadow-none outline-none focus-visible:ring-0 focus:border-border" />
                          </div>
                        </div>
                        <div className="text-[11px] text-muted-foreground/45 mt-1.5">写入下方 config.toml 的 model / review_model / model_reasoning_effort</div>
                      </div>

                      {/* auth.json (JSON) */}
                      <div>
                        <div className="flex items-center gap-1 mb-1.5">
                          <span className="text-xs text-foreground/70 font-mono">auth.json</span>
                          <span className="text-[10px] text-muted-foreground/45">(JSON)</span>
                          <span className="text-destructive text-xs leading-none">*</span>
                        </div>
                        <Textarea value={codexAuth} onChange={e => setCodexAuth(e.target.value)} rows={3} spellCheck={false} className="w-full bg-muted/25 border border-border/40 rounded-md px-3 py-2 text-[11px] leading-relaxed text-foreground font-mono outline-none focus:border-border transition-colors resize-none scrollbar-thin" />
                        <div className="flex items-center gap-2 mt-1.5">
                          <Button variant="ghost" size="inline" className="gap-1 px-2 py-0.5 text-[11px] rounded-md text-muted-foreground/60 hover:text-foreground"><Wand2 size={11} /> 格式化</Button>
                          <span className="text-[11px] text-muted-foreground/45">Codex auth.json 配置内容</span>
                        </div>
                      </div>

                      {/* config.toml (TOML) */}
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs text-foreground/70 font-mono">config.toml</span>
                          <span className="text-[10px] text-muted-foreground/45">(TOML)</span>
                          <div className="ml-auto flex items-center gap-3">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <Checkbox checked={goalMode} onCheckedChange={() => setGoalMode(v => !v)} className="rounded-[4px]" />
                              <span className="text-[11px] text-muted-foreground/65">启用 Goal mode</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <Checkbox checked={writeShared} onCheckedChange={() => setWriteShared(v => !v)} className="rounded-[4px]" />
                              <span className="text-[11px] text-muted-foreground/65">写入通用配置</span>
                            </label>
                          </div>
                        </div>
                        <Textarea value={codexToml} onChange={e => setCodexToml(e.target.value)} rows={16} spellCheck={false} className="w-full bg-muted/25 border border-border/40 rounded-md px-3 py-2 text-[11px] leading-relaxed text-foreground font-mono outline-none focus:border-border transition-colors resize-none scrollbar-thin" />
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[11px] text-muted-foreground/45">Codex config.toml 配置内容</span>
                          <button type="button" className="text-[11px] text-accent-blue hover:underline">编辑通用配置</button>
                        </div>
                      </div>
                    </>
                    ) : cfgKind === 'gemini' ? (
                    <>
                    {/* 服务商上下文（端点 / Key 在 模型服务 配置） */}
                    <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-accent/15 px-3 py-2">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${healthMeta[prov.health].dot}`} />
                      <span className="text-xs text-foreground font-medium flex-shrink-0">{prov.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/60 text-muted-foreground/60 flex-shrink-0">{prov.type}</span>
                      <span className="text-[11px] text-muted-foreground/45 font-mono truncate">{prov.apiHost}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground/45 flex-shrink-0">端点 / Key 在 模型服务</span>
                    </div>

                    {/* 认证方式 */}
                    <div>
                      <div className="text-xs text-foreground/70 mb-1.5">认证方式</div>
                      <SelectDropdown
                        items={geminiAuthItems}
                        selectedId={geminiAuth}
                        onSelect={setGeminiAuth}
                        renderSelected={(item) => item && <span className="text-foreground">{item.name}</span>}
                        renderItem={(item, isSelected) => (<div className="flex items-center gap-2"><span className="flex-1">{item.name}</span>{isSelected && <Check size={11} className="text-primary flex-shrink-0" />}</div>)}
                      />
                      <div className="text-[11px] text-muted-foreground/50 mt-1.5">{geminiAuthHint[geminiAuth]}</div>
                    </div>

                    {/* 模型（单一） */}
                    <div>
                      <div className="text-xs text-foreground/70 mb-1.5">模型</div>
                      <SelectDropdown
                        items={geminiModelItems}
                        selectedId={geminiModel}
                        onSelect={setGeminiModel}
                        renderSelected={(item) => item && <span className="text-foreground font-mono">{item.name}</span>}
                        renderItem={(item, isSelected) => (<div className="flex items-center gap-2"><span className="flex-1 font-mono">{item.name}</span>{isSelected && <Check size={11} className="text-primary flex-shrink-0" />}</div>)}
                      />
                      <div className="text-[11px] text-muted-foreground/50 mt-1.5">Gemini CLI 使用单一模型（GEMINI_MODEL），无 Sonnet/Opus/Haiku 角色映射</div>
                    </div>

                    {/* 自定义配置 settings.json */}
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs text-foreground/70 font-mono">settings.json</span>
                        <span className="text-[10px] text-muted-foreground/45">(JSON)</span>
                        <div className="ml-auto flex items-center gap-3">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <Checkbox checked={writeShared} onCheckedChange={() => setWriteShared(v => !v)} className="rounded-[4px]" />
                            <span className="text-[11px] text-muted-foreground/65">写入通用配置</span>
                          </label>
                          <button type="button" className="text-[11px] text-accent-blue hover:underline">编辑通用配置</button>
                        </div>
                      </div>
                      <Textarea value={geminiJson} onChange={e => setGeminiJson(e.target.value)} rows={10} spellCheck={false} className="w-full bg-muted/25 border border-border/40 rounded-md px-3 py-2 text-[11px] leading-relaxed text-foreground font-mono outline-none focus:border-border transition-colors resize-none scrollbar-thin" />
                      <div className="text-[11px] text-muted-foreground/45 mt-1.5">写入 ~/.gemini/settings.json，可覆盖主题 / MCP / 工具等</div>
                    </div>
                    </>
                    ) : cfgKind === 'claude' ? (
                    <>
                    {/* 服务商上下文（端点 / Key 在 模型服务 配置） */}
                    <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-accent/15 px-3 py-2">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${healthMeta[prov.health].dot}`} />
                      <span className="text-xs text-foreground font-medium flex-shrink-0">{prov.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/60 text-muted-foreground/60 flex-shrink-0">{prov.type}</span>
                      <span className="text-[11px] text-muted-foreground/45 font-mono truncate">{prov.apiHost}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground/45 flex-shrink-0">端点 / Key 在 模型服务</span>
                    </div>

                    {/* 快捷开关 */}
                    <div>
                      <div className="text-xs text-foreground/70 mb-2">快捷开关</div>
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_FLAGS.map(f => {
                          const on = quickFlags.has(f.id);
                          return (
                            <button key={f.id} type="button" onClick={() => toggleFlag(f.id)}
                              className={`inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full border text-[11px] transition-colors ${on ? 'border-foreground/25 bg-foreground/[0.06] text-foreground' : 'border-border/50 text-muted-foreground/60 hover:text-foreground hover:border-border'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${on ? 'bg-success' : 'bg-muted-foreground/30'}`} />
                              {f.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* API 格式 */}
                    <div>
                      <div className="text-xs text-foreground/70 mb-1.5">API 格式</div>
                      <SelectDropdown
                        items={apiFormatItems}
                        selectedId={apiFormat}
                        onSelect={(id) => setApiFormat(id as typeof apiFormat)}
                        renderSelected={(item) => item && <span className="text-foreground">{item.name}</span>}
                        renderItem={(item, isSelected) => (<div className="flex items-center gap-2"><span className="flex-1">{item.name}</span>{isSelected && <Check size={11} className="text-primary flex-shrink-0" />}</div>)}
                      />
                      <div className="text-[11px] text-muted-foreground/50 mt-1.5">选择供应商 API 的输入格式{apiFormat !== 'anthropic' && '，非 Anthropic 格式由本地代理自动转换'}</div>
                    </div>

                    {/* 认证字段 */}
                    <div>
                      <div className="text-xs text-foreground/70 mb-1.5">认证字段</div>
                      <SelectDropdown
                        items={authFieldItems}
                        selectedId={authField}
                        onSelect={(id) => setAuthField(id as typeof authField)}
                        renderSelected={(item) => item && <span className="text-foreground font-mono">{item.name}</span>}
                        renderItem={(item, isSelected) => (<div className="flex items-center gap-2"><span className="flex-1 font-mono">{item.name}</span>{isSelected && <Check size={11} className="text-primary flex-shrink-0" />}</div>)}
                      />
                      <div className="text-[11px] text-muted-foreground/50 mt-1.5">选择写入配置的认证环境变量名</div>
                    </div>

                    {/* 模型映射 */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-foreground/70">模型映射</span>
                        <Button variant="ghost" size="inline" className="ml-auto gap-1 px-2 py-0.5 text-[11px] rounded-md text-muted-foreground/60 hover:text-foreground"><ListPlus size={11} /> 获取模型列表</Button>
                      </div>
                      <div className="rounded-lg border border-border/40 overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/20 text-[10px] text-muted-foreground/55">
                          <span className="w-12 flex-shrink-0">角色</span>
                          <span className="flex-1">实际请求模型</span>
                          <span className="w-8 flex-shrink-0 text-center">1M</span>
                        </div>
                        {MODEL_ROLES.map((role, i) => (
                          <div key={role.id} className={`flex items-center gap-2 px-3 py-2 ${i > 0 ? 'border-t border-border/20' : ''}`}>
                            <span className="w-12 flex-shrink-0 text-xs text-foreground">{role.label}</span>
                            <Input key={`map-${prov.id}-${role.id}`} defaultValue="" placeholder="例：deepseek-v4-pro" className="flex-1 bg-transparent border border-muted-foreground/25 rounded-md px-2 py-1 text-xs text-foreground font-mono placeholder:text-muted-foreground/40 shadow-none outline-none focus-visible:ring-0 focus:border-border" />
                            <div className="w-8 flex-shrink-0 flex justify-center"><Switch size="sm" checked={bigContext.has(role.id)} onCheckedChange={() => toggleBig(role.id)} /></div>
                          </div>
                        ))}
                      </div>
                      <div className="text-[11px] text-muted-foreground/50 mt-1.5">显示名影响 /model 菜单；1M 仅声明上下文窗口</div>
                    </div>

                    {/* 配置 JSON（settings.json） */}
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs text-foreground/70 font-mono">配置 JSON</span>
                        <span className="text-[10px] text-muted-foreground/45">settings.json</span>
                        <div className="ml-auto flex items-center gap-3">
                          <Button variant="ghost" size="inline" className="gap-1 px-2 py-0.5 text-[11px] rounded-md text-muted-foreground/60 hover:text-foreground"><Wand2 size={11} /> 格式化</Button>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <Checkbox checked={writeShared} onCheckedChange={() => setWriteShared(v => !v)} className="rounded-[4px]" />
                            <span className="text-[11px] text-muted-foreground/65">写入通用配置</span>
                          </label>
                          <button type="button" className="text-[11px] text-accent-blue hover:underline">编辑通用配置</button>
                        </div>
                      </div>
                      <Textarea value={claudeJson} onChange={e => setClaudeJson(e.target.value)} rows={10} spellCheck={false} className="w-full bg-muted/25 border border-border/40 rounded-md px-3 py-2 text-[11px] leading-relaxed text-foreground font-mono outline-none focus:border-border transition-colors resize-none scrollbar-thin" />
                      <div className="text-[11px] text-muted-foreground/45 mt-1.5">写入 ~/.claude/settings.json，可覆盖插件 / env / 权限等</div>
                    </div>
                    </>
                    ) : (
                    <>
                    {/* 服务商上下文（端点 / Key 在 模型服务 配置） */}
                    <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-accent/15 px-3 py-2">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${healthMeta[prov.health].dot}`} />
                      <span className="text-xs text-foreground font-medium flex-shrink-0">{prov.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/60 text-muted-foreground/60 flex-shrink-0">{prov.type}</span>
                      <span className="text-[11px] text-muted-foreground/45 font-mono truncate">{prov.apiHost}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground/45 flex-shrink-0">端点 / Key 在 模型服务</span>
                    </div>

                    {/* 模型（单一） */}
                    <div>
                      <div className="text-xs text-foreground/70 mb-1.5">模型</div>
                      <SelectDropdown
                        items={codeModelItems}
                        selectedId={genericModel}
                        onSelect={setGenericModel}
                        placeholder="选择模型…"
                        renderSelected={(item) => item && <span className="text-foreground font-mono">{item.name}</span>}
                        renderItem={(item, isSelected) => (<div className="flex items-center gap-2"><span className="flex-1 font-mono">{item.name}</span>{isSelected && <Check size={11} className="text-primary flex-shrink-0" />}</div>)}
                      />
                      <div className="text-[11px] text-muted-foreground/50 mt-1.5">该 CLI 使用单一模型，无 Sonnet/Opus/Haiku 角色映射</div>
                    </div>

                    {/* 自定义配置 */}
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs text-foreground/70 font-mono">自定义配置</span>
                        <span className="text-[10px] text-muted-foreground/45">(JSON)</span>
                        <div className="ml-auto flex items-center gap-3">
                          <Button variant="ghost" size="inline" className="gap-1 px-2 py-0.5 text-[11px] rounded-md text-muted-foreground/60 hover:text-foreground"><Wand2 size={11} /> 格式化</Button>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <Checkbox checked={writeShared} onCheckedChange={() => setWriteShared(v => !v)} className="rounded-[4px]" />
                            <span className="text-[11px] text-muted-foreground/65">写入通用配置</span>
                          </label>
                          <button type="button" className="text-[11px] text-accent-blue hover:underline">编辑通用配置</button>
                        </div>
                      </div>
                      <Textarea value={genericJson} onChange={e => setGenericJson(e.target.value)} rows={10} spellCheck={false} className="w-full bg-muted/25 border border-border/40 rounded-md px-3 py-2 text-[11px] leading-relaxed text-foreground font-mono outline-none focus:border-border transition-colors resize-none scrollbar-thin" />
                      <div className="text-[11px] text-muted-foreground/45 mt-1.5">写入该 CLI 的配置文件，可覆盖 env / MCP / 工具等</div>
                    </div>
                    </>
                    )}

                    {/* 模型测试配置 */}
                    <div className="rounded-lg border border-border/40">
                      <div className="flex items-center gap-2 px-3 py-2.5">
                        <FlaskConical size={13} className="text-foreground/55" />
                        <span className="text-xs text-foreground font-medium">模型测试配置</span>
                        <div className="ml-auto flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground/55">使用单独配置</span>
                          <Switch size="sm" checked={testSeparate} onCheckedChange={() => setTestSeparate(v => !v)} />
                        </div>
                      </div>
                      {testSeparate && (
                        <div className="px-3 pb-3 pt-1 border-t border-border/20 space-y-3">
                          <div className="text-[11px] text-muted-foreground/55">为此供应商配置单独的模型测试参数，不启用时使用全局配置。</div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="text-[11px] text-foreground/65 mb-1">超时时间（秒）</div>
                              <Input defaultValue="8" className="w-full bg-transparent border border-muted-foreground/25 rounded-md px-2.5 py-1.5 text-xs text-foreground font-mono shadow-none outline-none focus-visible:ring-0 focus:border-border" />
                            </div>
                            <div>
                              <div className="text-[11px] text-foreground/65 mb-1">降级阈值（毫秒）</div>
                              <Input defaultValue="6000" className="w-full bg-transparent border border-muted-foreground/25 rounded-md px-2.5 py-1.5 text-xs text-foreground font-mono shadow-none outline-none focus-visible:ring-0 focus:border-border" />
                            </div>
                            <div>
                              <div className="text-[11px] text-foreground/65 mb-1">最大重试次数</div>
                              <Input defaultValue="1" className="w-full bg-transparent border border-muted-foreground/25 rounded-md px-2.5 py-1.5 text-xs text-foreground font-mono shadow-none outline-none focus-visible:ring-0 focus:border-border" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
            {/* Footer — 取消 / 保存 */}
            <div className="flex-shrink-0 border-t border-border/15 px-4 py-2.5 flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setConfigOpen(false)} className="text-muted-foreground">取消</Button>
              <Button variant="default" size="sm" onClick={() => setConfigOpen(false)} className="px-5">保存</Button>
            </div>
            </motion.div>
          </div>
          )}
          </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground/50">从左侧选择一个 CLI 工具开始配置</div>
          )}
        </div>
      </div>
    </div>
  );
}
