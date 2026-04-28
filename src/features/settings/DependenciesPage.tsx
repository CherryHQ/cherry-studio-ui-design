import React, { useState } from 'react';
import { Download, HardDrive, Loader2, Package, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { Button, EmptyState } from '@cherry-studio/ui';
import {
  runtimeDependencies as DEPS,
  type RuntimeDependency,
  type DepStatus,
} from '../extensions/ExtensionsData';

function depStatusLabel(s: DepStatus) {
  if (s === 'ready') return '已安装';
  if (s === 'missing') return '未安装';
  if (s === 'outdated') return '需更新';
  return '安装中…';
}
function depStatusColor(s: DepStatus) {
  if (s === 'ready') return 'text-success bg-success/10';
  if (s === 'missing') return 'text-muted-foreground/60 bg-muted/50';
  if (s === 'outdated') return 'text-warning bg-warning/10';
  return 'text-info bg-info/10';
}
function depScenarioLabel(requiredBy: string[]) {
  const map: Record<string, string> = {
    'code-tools': '代码工具',
    'backup': '数据备份',
    'tts': '语音合成',
    'asr': '语音识别',
    'browser': '网页浏览',
    'ocr': '文字识别',
    'knowledge': '知识库',
  };
  return requiredBy.map(r => {
    const key = r.split('.').pop() || r;
    return map[key] || key;
  }).join(', ');
}

function DependencyRow({ dep, installing, onInstall }: { dep: RuntimeDependency; installing?: boolean; onInstall?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.12 }}
      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-accent/50 transition-colors"
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        dep.type === 'binary' ? 'bg-accent-violet/10 text-accent-violet' :
        dep.type === 'npm' ? 'bg-accent-blue-muted text-accent-blue' :
        'bg-info/10 text-info'
      }`}>
        {dep.type === 'binary' ? <HardDrive size={14} /> : <Package size={14} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{dep.name}</span>
          <span className="text-xs text-muted-foreground/50 font-mono">v{dep.version}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground/40">{depScenarioLabel(dep.requiredBy)}</span>
          {dep.size && (
            <>
              <span className="text-xs text-muted-foreground/30">·</span>
              <span className="text-xs text-muted-foreground/40">{dep.size}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 w-[120px] justify-end">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-md whitespace-nowrap ${depStatusColor(dep.status)}`}>
          {depStatusLabel(dep.status)}
        </span>
        {dep.status === 'missing' && (
          <Button variant="ghost" size="xs" onClick={onInstall} disabled={installing} className="active:scale-[0.97] whitespace-nowrap">
            {installing ? <Loader2 size={10} className="animate-spin" /> : <Download size={10} />}
            {installing ? '安装中...' : '安装'}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export function DependenciesPage() {
  const [deps, setDeps] = useState(DEPS);
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const handleInstall = (id: string) => {
    setInstallingId(id);
    setTimeout(() => {
      setDeps((prev: RuntimeDependency[]) => prev.map((d: RuntimeDependency) => d.id === id ? { ...d, status: 'ready' as DepStatus } : d));
      setInstallingId(null);
    }, 2000);
  };

  const handleCheckUpdate = () => {
    setChecking(true);
    setTimeout(() => setChecking(false), 1500);
  };

  const filtered = deps;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <HardDrive size={16} className="text-muted-foreground" />
          <h2 className="text-sm font-medium text-foreground">环境依赖</h2>
          <span className="text-xs text-muted-foreground/40 tabular-nums">{DEPS.length}</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">管理应用运行所需的二进制工具、NPM 包和模型依赖。</p>
        <div className="flex items-center gap-2">
          <div className="flex-1" />
          <Button variant="outline" size="inline" onClick={handleCheckUpdate} disabled={checking} className="flex items-center gap-1 px-2 py-[2px] rounded-md text-xs text-muted-foreground/60 hover:text-foreground border-border/30">
            <RefreshCw size={9} className={checking ? 'animate-spin' : ''} />
            <span>{checking ? '检查中...' : '检查更新'}</span>
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin">
        {filtered.length === 0 ? (
          <EmptyState preset="no-result" compact />
        ) : (
          filtered.map((dep: RuntimeDependency) => <DependencyRow key={dep.id} dep={dep} installing={installingId === dep.id} onInstall={() => handleInstall(dep.id)} />)
        )}
      </div>
    </div>
  );
}
