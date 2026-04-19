import React, { useState, useCallback } from 'react';
import {
  ChevronDown, Sparkles, X, Check, Code2,
  FolderOpen, Terminal, Cpu,
  Play, Info, Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tooltip } from '@/components/common/Tooltip';
import { EmptyState } from '@/components/ui/EmptyState';
import { BrandLogo } from '@/components/ui/BrandLogos';
import { Button, Input, Popover, PopoverTrigger, PopoverContent } from '@cherry-studio/ui';

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
        <Button
          variant="ghost"
          className={`w-full flex items-center justify-between px-2.5 py-1.5 h-auto rounded-md border text-xs bg-transparent hover:bg-muted/30 transition-colors ${open ? 'border-primary/40 ring-1 ring-primary/15' : 'border-border/40'}`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1 text-left">
            {selected ? renderSelected(selected) : <span className="text-muted-foreground/50">{placeholder || '请选择...'}</span>}
          </div>
          <ChevronDown size={12} className={`text-muted-foreground/50 transition-transform flex-shrink-0 ml-2 ${open ? 'rotate-180' : ''}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-1 rounded-md overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full"
        style={{ maxHeight }}
      >
        {items.map(item => (
          <Button
            key={item.id}
            variant="ghost"
            className={`w-full text-left justify-start px-2.5 py-1.5 h-auto text-xs rounded-md font-normal transition-colors ${selectedId === item.id ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-accent/60'}`}
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
      <span className="text-xs text-muted-foreground/50">{children}</span>
      {hint && (
        <Tooltip content={hint} side="top">
          <Info size={9} className="text-muted-foreground/25 cursor-help" />
        </Tooltip>
      )}
    </div>
  );
}

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
  }>>({});

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
        <div className="relative max-w-md mx-auto">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
          <Input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="搜索 CLI 工具…"
            className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-border/50 bg-muted/20 text-xs text-foreground placeholder:text-muted-foreground/30 focus:border-primary/30 transition-colors"
          />
          {searchTerm && (
            <Button variant="ghost" onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-muted-foreground p-0 h-auto transition-colors">
              <X size={12} />
            </Button>
          )}
        </div>
      </div>

      {/* Grid content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 [&::-webkit-scrollbar]:hidden">
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
                  <p className="text-xs text-muted-foreground/35 mb-3 px-1">官方工具</p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-x-2 gap-y-4">
                    {officialTools.map(tool => (
                      <Button
                        key={tool.id}
                        variant="ghost"
                        onClick={() => setSelectedCli(tool.id)}
                        className="flex flex-col items-center gap-1.5 group relative h-auto p-0"
                      >
                        <div className={`transition-transform group-hover:scale-110 shadow-sm ${selectedCli === tool.id ? 'ring-2 ring-cherry-ring rounded-xl' : ''}`}>
                          <CLIIcon tool={tool} />
                        </div>
                        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[68px]">
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
                  <p className="text-xs text-muted-foreground/35 mb-3 px-1">社区工具</p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-x-2 gap-y-4">
                    {communityTools.map(tool => (
                      <Button
                        key={tool.id}
                        variant="ghost"
                        onClick={() => setSelectedCli(tool.id)}
                        className="flex flex-col items-center gap-1.5 group relative h-auto p-0"
                      >
                        <div className={`transition-transform group-hover:scale-110 shadow-sm ${selectedCli === tool.id ? 'ring-2 ring-cherry-ring rounded-xl' : ''}`}>
                          <CLIIcon tool={tool} />
                        </div>
                        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[68px]">
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
            className="absolute inset-0 z-40 bg-black/20"
            onClick={() => setSelectedCli(null)}
          />
        )}
      </AnimatePresence>

      {/* ========== Config Drawer ========== */}
      <AnimatePresence>
        {selectedCli && selectedTool && config && (
          <motion.div
            key={selectedCli}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="absolute top-2 right-2 bottom-2 z-50 w-[400px] bg-card rounded-2xl border border-border/30 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-11 flex-shrink-0 border-b border-border/15">
              <div className="flex items-center gap-2">
                <CLIIcon tool={selectedTool} size="sm" />
                <div>
                  <span className="text-xs text-foreground">{selectedTool.name}</span>
                  <span className="text-[9px] text-muted-foreground/35 ml-1.5">{selectedTool.version}</span>
                </div>
              </div>
              <Button variant="ghost" onClick={() => setSelectedCli(null)} className="w-6 h-6 rounded-md p-0 text-muted-foreground/40 hover:text-foreground hover:bg-accent transition-colors">
                <X size={13} />
              </Button>
            </div>

            {/* Scrollable config */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 [&::-webkit-scrollbar]:hidden">
              {/* Tool info card */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/5 border border-border/10">
                <CLIIcon tool={selectedTool} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-foreground">{selectedTool.name}</div>
                  <div className="text-xs text-muted-foreground/40">{selectedTool.desc}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent/40 text-muted-foreground/50">{selectedTool.version}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent/40 text-muted-foreground/50">
                      {selectedTool.category === 'official' ? '官方' : '社区'}
                    </span>
                  </div>
                </div>
              </div>

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
                      <span className="text-muted-foreground/30 flex-shrink-0 text-[9px]">{item.provider}</span>
                      {isSelected && <Check size={11} className="text-primary flex-shrink-0 ml-0.5" />}
                    </div>
                  )}
                />
              </div>

              {/* Working directory */}
              <div>
                <FieldLabel hint="CLI 工具启动时的工作目录">工作目录</FieldLabel>
                <div className="flex items-center gap-0 rounded-md border border-border/30 overflow-hidden">
                  <div className="flex items-center px-2.5 text-muted-foreground/30">
                    <FolderOpen size={11} />
                  </div>
                  <Input
                    value={config.workDir}
                    onChange={e => updateConfig(selectedCli, { workDir: e.target.value })}
                    className="flex-1 bg-transparent border-none outline-none py-1.5 pr-1 text-xs text-foreground placeholder:text-muted-foreground/25 font-mono rounded-none shadow-none focus-visible:ring-0"
                    placeholder="选择工作目录..."
                  />
                  {config.workDir && (
                    <Button
                      variant="ghost"
                      onClick={() => updateConfig(selectedCli, { workDir: '' })}
                      className="px-2 h-auto text-muted-foreground/25 hover:text-foreground transition-colors"
                    >
                      <X size={10} />
                    </Button>
                  )}
                  <div className="w-px h-4 bg-border/20" />
                  <Button variant="ghost" className="px-2 py-1.5 h-auto text-xs text-muted-foreground/40 hover:text-foreground hover:bg-accent/40 transition-colors flex-shrink-0 rounded-none">
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
                <textarea
                  value={config.envVars}
                  onChange={e => updateConfig(selectedCli, { envVars: e.target.value })}
                  rows={2}
                  className="w-full bg-transparent border border-border/30 rounded-md px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-border/50 transition-colors resize-none font-mono [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30"
                  placeholder={"KEY1=value1\nKEY2=value2"}
                />
              </div>

              {/* Check updates */}
              <label className="flex items-center gap-2 cursor-pointer group">
                <Button
                  variant="ghost"
                  onClick={() => updateConfig(selectedCli, { checkUpdates: !config.checkUpdates })}
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 p-0 transition-colors ${config.checkUpdates ? 'bg-cherry-primary border-cherry-primary' : 'border-muted-foreground/20 hover:border-muted-foreground/35'}`}
                >
                  {config.checkUpdates && <Check size={8} className="text-white" />}
                </Button>
                <span className="text-xs text-muted-foreground/40 group-hover:text-foreground/50 transition-colors">检查更新并安装最新版本</span>
              </label>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-border/15 px-4 py-3 space-y-2.5">
              {/* Summary */}
              <div className="flex items-center gap-2 text-[9px] text-muted-foreground/30">
                <div className="flex items-center gap-1">
                  <Cpu size={9} />
                  <span>{selectedTool.name}</span>
                </div>
                <span className="text-border/30">·</span>
                <div className="flex items-center gap-1 truncate">
                  <Sparkles size={8} />
                  <span className="truncate">{codeModels.find(m => m.id === config.model)?.name?.split('/').pop()}</span>
                </div>
                <span className="text-border/30">·</span>
                <div className="flex items-center gap-1">
                  <Terminal size={9} />
                  <span>{terminalOptions.find(t => t.id === config.terminal)?.name}</span>
                </div>
              </div>

              {/* Launch button */}
              <Button
                variant="ghost"
                onClick={handleLaunch}
                disabled={launching}
                className={`w-full flex items-center justify-center gap-2 py-2 h-auto rounded-lg text-xs transition-all ${
                  launchSuccess
                    ? 'bg-cherry-primary-dark text-white'
                    : launching
                      ? 'bg-foreground/60 text-background/70 cursor-wait'
                      : 'bg-foreground text-background hover:bg-foreground/90 active:scale-[0.99]'
                }`}
              >
                {launchSuccess ? (
                  <div className="flex items-center gap-1.5">
                    <Check size={12} />
                    <span>已启动</span>
                  </div>
                ) : launching ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    <span>正在启动...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Play size={11} />
                    <span>启动</span>
                  </div>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
