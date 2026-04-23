import React, { useState, useMemo, useCallback } from 'react';
import {
  X, Download, Trash2, RefreshCw,
  Star, ArrowUpRight, Shield, Wrench, Package,
  CheckCircle2, AlertCircle, ChevronRight, HardDrive,
  Blocks, ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, SearchInput, Switch, Tabs, TabsList, TabsTrigger, TabsContent, EmptyState } from '@cherry-studio/ui';
import {
  installedExtensions as INSTALLED,
  marketplaceExtensions as MARKETPLACE,
  runtimeDependencies as DEPS,
  formatDownloads,
  type Extension,
  type RuntimeDependency,
  type ExtensionTab,
  type ExtensionCategory,
  type DepStatus,
} from './ExtensionsData';

// ===========================
// Tab Config
// ===========================

const tabs: { id: ExtensionTab; label: string; count?: number }[] = [
  { id: 'installed', label: '已安装', count: INSTALLED.length },
  { id: 'marketplace', label: '市场' },
  { id: 'dependencies', label: '依赖管理' },
];

const categoryFilters: { id: ExtensionCategory; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'official', label: '官方' },
  { id: 'community', label: '社区' },
];

// ===========================
// Status helpers
// ===========================

function depStatusLabel(s: DepStatus) {
  if (s === 'ready') return '就绪';
  if (s === 'missing') return '未安装';
  if (s === 'outdated') return '需更新';
  return '安装中...';
}

function depStatusColor(s: DepStatus) {
  if (s === 'ready') return 'text-primary bg-primary/10';
  if (s === 'missing') return 'text-muted-foreground/60 bg-muted/50';
  if (s === 'outdated') return 'text-warning bg-warning/10';
  return 'text-info bg-info/10';
}

function depTypeLabel(t: string) {
  if (t === 'binary') return '二进制';
  if (t === 'npm') return 'NPM 包';
  return '模型';
}

// ===========================
// Extension Card — Installed
// ===========================

function InstalledCard({
  ext,
  isSelected,
  onClick,
  onCheckedChange,
}: {
  ext: Extension;
  isSelected: boolean;
  onClick: () => void;
  onCheckedChange: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={`w-full text-left px-3.5 py-3 rounded-xl border transition-all duration-150 group/card ${
        isSelected
          ? 'bg-muted/50 border-border/50'
          : 'bg-transparent border-transparent hover:bg-accent/50 hover:border-border/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center text-lg flex-shrink-0">
          {ext.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground truncate">{ext.name}</span>
            {ext.category === 'official' && (
              <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-info/10 text-info">官方</span>
            )}
            {ext.status === 'update-available' && (
              <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-warning/10 text-warning">可更新</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground/60 mt-0.5 line-clamp-1">{ext.description}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-muted-foreground/40">v{ext.version}</span>
            <span className="text-xs text-muted-foreground/30">·</span>
            <span className="text-xs text-muted-foreground/40">{ext.size}</span>
            {ext.mcpTools && ext.mcpTools.length > 0 && (
              <>
                <span className="text-xs text-muted-foreground/30">·</span>
                <span className="text-xs text-muted-foreground/40 flex items-center gap-0.5">
                  <Wrench size={9} />
                  {ext.mcpTools.length} MCP
                </span>
              </>
            )}
          </div>
        </div>
        <Switch size="sm" checked={ext.enabled} onCheckedChange={() => onCheckedChange()} onClick={(e) => e.stopPropagation()} />
      </div>
    </motion.button>
  );
}

// ===========================
// Extension Card — Marketplace
// ===========================

function MarketplaceCard({ ext }: { ext: Extension }) {
  const [installing, setInstalling] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="px-3.5 py-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-accent/50 hover:border-border/50 transition-all duration-150 group/card"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-xl flex-shrink-0">
          {ext.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground truncate">{ext.name}</span>
            {ext.category === 'official' && (
              <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-info/10 text-info">官方</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground/60 mt-0.5 line-clamp-2">{ext.description}</p>
          <div className="flex items-center gap-3 mt-2">
            {ext.rating && (
              <span className="text-xs text-warning flex items-center gap-0.5">
                <Star size={10} fill="currentColor" />
                {ext.rating}
              </span>
            )}
            {ext.downloads && (
              <span className="text-xs text-muted-foreground/40 flex items-center gap-0.5">
                <Download size={9} />
                {formatDownloads(ext.downloads)}
              </span>
            )}
            <span className="text-xs text-muted-foreground/40">{ext.size}</span>
            {ext.mcpTools && ext.mcpTools.length > 0 && (
              <span className="text-xs text-muted-foreground/40 flex items-center gap-0.5">
                <Wrench size={9} />
                {ext.mcpTools.length} MCP
              </span>
            )}
          </div>
        </div>
        <Button
          variant="default"
          size="xs"
          onClick={() => setInstalling(true)}
          disabled={installing}
          className={`flex-shrink-0 ${
            installing ? 'cursor-wait' : 'active:scale-[0.97]'
          }`}
        >
          {installing ? (
            <span className="flex items-center gap-1">
              <RefreshCw size={11} className="animate-spin" />
              安装中
            </span>
          ) : '安装'}
        </Button>
      </div>
    </motion.div>
  );
}

// ===========================
// Detail Panel
// ===========================

function DetailPanel({ ext, onClose }: { ext: Extension; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-start gap-3 px-5 pt-5 pb-4 flex-shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-2xl flex-shrink-0">
          {ext.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">{ext.name}</h3>
            {ext.category === 'official' && (
              <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-info/10 text-info">官方</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground/50 mt-0.5">{ext.author} · v{ext.version} · {ext.size}</p>
        </div>
        <Button variant="ghost" size="icon-xs" onClick={onClose} className="text-muted-foreground/40 hover:text-foreground">
          <X size={14} />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4 scrollbar-thin">
        {/* Description */}
        <div>
          <p className="text-sm text-foreground leading-relaxed">{ext.description}</p>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          {ext.status === 'installed' && ext.enabled && (
            <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary flex items-center gap-1">
              <CheckCircle2 size={10} /> 已启用
            </span>
          )}
          {ext.status === 'installed' && !ext.enabled && (
            <span className="text-xs px-2 py-1 rounded-md bg-muted/50 text-muted-foreground/50 flex items-center gap-1">
              已停用
            </span>
          )}
          {ext.status === 'update-available' && (
            <span className="text-xs px-2 py-1 rounded-md bg-warning/10 text-warning flex items-center gap-1">
              <AlertCircle size={10} /> 有更新 v2.1.0
            </span>
          )}
        </div>

        {/* MCP Tools */}
        {ext.mcpTools && ext.mcpTools.length > 0 && (
          <div className="rounded-xl border border-border/25 bg-muted/30 p-3.5">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Wrench size={12} className="text-muted-foreground/50" />
              <span className="text-xs font-medium text-muted-foreground">MCP 工具</span>
              <span className="text-xs text-muted-foreground/50 ml-auto">Agent 可调用</span>
            </div>
            <div className="space-y-1.5">
              {ext.mcpTools.map(tool => (
                <div key={tool} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/30">
                  <div className="w-1 h-1 rounded-full bg-muted0 flex-shrink-0" />
                  <code className="text-xs text-muted-foreground font-mono">{tool}</code>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Permissions */}
        {ext.permissions && ext.permissions.length > 0 && (
          <div className="rounded-xl border border-border/25 bg-muted/30 p-3.5">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Shield size={12} className="text-muted-foreground/50" />
              <span className="text-xs font-medium text-muted-foreground">权限</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ext.permissions.map(p => (
                <span key={p} className="text-xs px-2 py-1 rounded-md bg-muted/50 text-muted-foreground/60 font-mono">{p}</span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {ext.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {ext.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full border border-border/20 text-muted-foreground/50">{tag}</span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {ext.status === 'update-available' && (
            <Button variant="default" size="xs" className="active:scale-[0.97]">
              <RefreshCw size={11} /> 更新
            </Button>
          )}
          {ext.homepage && (
            <Button variant="ghost" size="xs" className="active:scale-[0.97]">
              <ArrowUpRight size={11} /> 主页
            </Button>
          )}
          {ext.status === 'installed' && (
            <Button variant="destructive" size="xs" className="active:scale-[0.97] ml-auto">
              <Trash2 size={11} /> 卸载
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ===========================
// Dependency Row
// ===========================

function DependencyRow({ dep }: { dep: RuntimeDependency }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.12 }}
      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-accent/50 transition-colors group/dep"
    >
      {/* Icon */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        dep.type === 'binary' ? 'bg-accent-violet/10 text-accent-violet' :
        dep.type === 'npm' ? 'bg-accent-blue-muted text-accent-blue' :
        'bg-info/10 text-info'
      }`}>
        {dep.type === 'binary' ? <HardDrive size={14} /> : <Package size={14} />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{dep.name}</span>
          <span className="text-xs text-muted-foreground/50 font-mono">v{dep.version}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground/40">{depTypeLabel(dep.type)}</span>
          {dep.size && (
            <>
              <span className="text-xs text-muted-foreground/30">·</span>
              <span className="text-xs text-muted-foreground/40">{dep.size}</span>
            </>
          )}
          <span className="text-xs text-muted-foreground/30">·</span>
          <span className="text-xs text-muted-foreground/40">
            {dep.requiredBy.map(r => r.split('.').pop()).join(', ')}
          </span>
        </div>
      </div>

      {/* Right side: fixed-width area for status + action */}
      <div className="flex items-center gap-2 flex-shrink-0 w-[120px] justify-end">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-md whitespace-nowrap ${depStatusColor(dep.status)}`}>
          {depStatusLabel(dep.status)}
        </span>
        {dep.status === 'missing' && (
          <Button variant="ghost" size="xs" className="active:scale-[0.97] whitespace-nowrap">
            <Download size={10} /> 安装
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ===========================
// Main Page
// ===========================

export function ExtensionsPage() {
  const [activeTab, setActiveTab] = useState<ExtensionTab>('installed');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ExtensionCategory>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [extensions, setExtensions] = useState(INSTALLED);

  // Filter installed
  const filteredInstalled = useMemo(() => {
    let list = extensions;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
    }
    if (category !== 'all') {
      list = list.filter(e => e.category === category);
    }
    return list;
  }, [extensions, search, category]);

  // Filter marketplace
  const filteredMarketplace = useMemo(() => {
    let list = MARKETPLACE;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
    }
    if (category !== 'all') {
      list = list.filter(e => e.category === category);
    }
    return list;
  }, [search, category]);

  // Filter dependencies
  const filteredDeps = useMemo(() => {
    if (!search) return DEPS;
    const q = search.toLowerCase();
    return DEPS.filter(d => d.name.toLowerCase().includes(q));
  }, [search]);

  const selectedExt = useMemo(() => {
    if (!selectedId) return null;
    return [...extensions, ...MARKETPLACE].find(e => e.id === selectedId) || null;
  }, [selectedId, extensions]);

  const handleToggle = useCallback((id: string) => {
    setExtensions(prev => prev.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e));
  }, []);

  const enabledCount = extensions.filter(e => e.enabled).length;
  const mcpToolCount = extensions.filter(e => e.enabled).reduce((sum, e) => sum + (e.mcpTools?.length || 0), 0);
  const depsReady = DEPS.filter(d => d.status === 'ready').length;
  const depsMissing = DEPS.filter(d => d.status === 'missing').length;

  return (
    <Tabs value={activeTab} onValueChange={v => { setActiveTab(v as ExtensionTab); setSelectedId(null); }} className="flex-1 flex flex-col min-h-0 bg-background relative">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-shrink-0 px-6 pt-5 pb-0"
      >
        {/* Title row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent-violet/10 flex items-center justify-center">
              <Blocks size={16} className="text-accent-violet" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">扩展</h1>
              <p className="text-xs text-muted-foreground/40 mt-0">
                {enabledCount} 个启用 · {mcpToolCount} 个 MCP 工具可供 Agent 调用
              </p>
            </div>
          </div>
          <Button variant="ghost" size="xs" className="active:scale-[0.97]">
            <Package size={12} />
            从文件安装
          </Button>
        </div>

        {/* Tabs row */}
        <div className="flex items-center justify-between mb-3">
          <TabsList>
            {tabs.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-1 text-xs text-muted-foreground/50">{tab.count}</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground/60">{enabledCount} 已启用</span>
            </div>
            <div className="flex items-center gap-1">
              <Wrench size={9} className="text-muted-foreground/40" />
              <span className="text-xs text-muted-foreground/60">{mcpToolCount} MCP 工具</span>
            </div>
            <div className="flex items-center gap-1">
              <HardDrive size={9} className="text-muted-foreground/40" />
              <span className="text-xs text-muted-foreground/60">
                {depsReady}/{DEPS.length} 依赖
                {depsMissing > 0 && <span className="text-warning ml-0.5">({depsMissing} 缺失)</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Search + Filter row */}
        <div className="flex items-center gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={activeTab === 'dependencies' ? '搜索依赖...' : '搜索扩展...'}
            iconSize={13}
            wrapperClassName="flex-1 px-2.5 py-[6px] rounded-lg bg-muted/30 border border-transparent focus-within:border-border/50 transition-colors"
            clearable
          />

          {/* Category filter (not for dependencies) */}
          {activeTab !== 'dependencies' && (
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {categoryFilters.map(cf => (
                <Button
                  key={cf.id}
                  variant="ghost"
                  size="xs"
                  onClick={() => setCategory(cf.id)}
                  className={`px-2.5 transition-all duration-150 ${
                    category === cf.id
                      ? 'bg-muted/50 text-foreground font-medium'
                      : 'text-muted-foreground/40 hover:text-foreground'
                  }`}
                >
                  {cf.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 relative min-h-0 mt-3">
        {/* List — always full width */}
        <div className="absolute inset-0 overflow-y-auto px-4 pb-4 scrollbar-thin">
          <TabsContent value="installed" className="mt-0">
            <motion.div
              key="installed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="space-y-1"
            >
              {filteredInstalled.length === 0 ? (
                <EmptyState preset="no-result" title="没有找到扩展" />
              ) : (
                filteredInstalled.map(ext => (
                  <InstalledCard
                    key={ext.id}
                    ext={ext}
                    isSelected={selectedId === ext.id}
                    onClick={() => setSelectedId(selectedId === ext.id ? null : ext.id)}
                    onCheckedChange={() => handleToggle(ext.id)}
                  />
                ))
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="marketplace" className="mt-0">
            <motion.div
              key="marketplace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-2"
            >
              {filteredMarketplace.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState preset="no-result" title="没有找到扩展" />
                </div>
              ) : (
                filteredMarketplace.map(ext => (
                  <MarketplaceCard key={ext.id} ext={ext} />
                ))
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="dependencies" className="mt-0">
            <motion.div
              key="dependencies"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="space-y-0.5"
            >
              {filteredDeps.length === 0 ? (
                <EmptyState preset="no-result" title="没有依赖" />
              ) : (
                filteredDeps.map(dep => (
                  <DependencyRow key={dep.id} dep={dep} />
                ))
              )}
            </motion.div>
          </TabsContent>
        </div>

      </div>

      {/* Collapsible Detail Side Panel — positioned relative to root */}
      <AnimatePresence>
        {selectedExt && activeTab === 'installed' && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-foreground/10 backdrop-blur-[1px] z-[var(--z-overlay)]"
              onClick={() => setSelectedId(null)}
            />
            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="absolute top-2 right-2 bottom-2 w-[340px] z-[var(--z-dropdown)] slide-panel"
            >
              <DetailPanel ext={selectedExt} onClose={() => setSelectedId(null)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Tabs>
  );
}
