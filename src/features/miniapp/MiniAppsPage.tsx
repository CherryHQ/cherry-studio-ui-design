// Canonical location for miniapp/MiniAppsPage
// Physically inlined from @/app/components/MiniAppsPage
// Compliance: relative imports fixed to @/ aliases

import React, { useState, useEffect, useRef } from 'react';
import { useGlobalActions } from '@/app/context/GlobalActionContext';
import {
  Puzzle, Plus, SlidersHorizontal, X, Globe,
  EyeOff, Copy, PenLine, Trash2, Eye, ArrowLeftRight, RotateCcw,
  Upload, Link,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { copyToClipboard } from '@/app/utils/clipboard';
import { Button, Input, Switch, Slider, EmptyState, BrandLogo, SearchInput } from '@cherry-studio/ui';

const miniAppList: { id: string; name: string; color: string; initial: string; url: string }[] = [
  { id: 'chatgpt', name: 'ChatGPT', color: 'bg-accent-emerald', initial: 'G', url: 'https://chat.openai.com' },
  { id: 'gemini', name: 'Gemini', color: 'bg-accent-blue', initial: '\u2726', url: 'https://gemini.google.com' },
  { id: 'siliconflow', name: 'SiliconFlow', color: 'bg-accent-blue', initial: 'SF', url: 'https://siliconflow.cn' },
  { id: 'deepseek', name: 'DeepSeek', color: 'bg-accent-blue', initial: 'DS', url: 'https://chat.deepseek.com' },
  { id: 'wanzhi', name: '\u4e07\u77e5', color: 'bg-accent-indigo', initial: '\u4e07', url: 'https://www.wanzhi.com' },
  { id: 'zhipu', name: '\u667a\u8c31\u6e05\u8a00', color: 'bg-accent-blue', initial: '\u667a', url: 'https://chatglm.cn' },
  { id: 'kimi', name: 'Kimi', color: 'bg-foreground', initial: 'K', url: 'https://kimi.moonshot.cn' },
  { id: 'baichuan', name: '\u767e\u5c0f\u5e94', color: 'bg-accent-amber', initial: '\u767e', url: 'https://ying.baichuan-ai.com' },
  { id: 'tongyi', name: '\u901a\u4e49\u5343\u95ee', color: 'bg-accent-purple', initial: '\u901a', url: 'https://tongyi.aliyun.com' },
  { id: 'jianying', name: '\u526a\u6620AI', color: 'bg-foreground', initial: '\u526a', url: 'https://www.capcut.cn' },
  { id: 'doubao', name: '\u8c46\u5305', color: 'bg-accent-cyan', initial: '\u8c46', url: 'https://www.doubao.com' },
  { id: 'hailuoai', name: '\u6d77\u87ba', color: 'bg-accent-orange', initial: '\u87ba', url: 'https://hailuoai.com' },
  { id: 'groq', name: 'Groq', color: 'bg-accent-orange', initial: 'G', url: 'https://groq.com' },
  { id: 'claude', name: 'Claude', color: 'bg-accent-amber', initial: 'C', url: 'https://claude.ai' },
  { id: 'wenxin', name: '\u6587\u5fc3\u4e00\u8a00', color: 'bg-accent-blue', initial: '\u6587', url: 'https://yiyan.baidu.com' },
  { id: 'baidu_search', name: '\u767e\u5ea6AI\u641c\u7d22', color: 'bg-accent-blue', initial: 'AI', url: 'https://chat.baidu.com' },
  { id: 'tencent', name: '\u817e\u8baf\u5143\u5b9d', color: 'bg-accent-blue', initial: '\u5143', url: 'https://yuanbao.tencent.com' },
  { id: 'nanguang', name: '\u5357\u74dc', color: 'bg-accent-orange', initial: '\u5357', url: 'https://www.nanguang.com' },
  { id: 'sparkdesk', name: 'SparkDesk', color: 'bg-accent-blue', initial: 'SD', url: 'https://xinghuo.xfyun.cn' },
  { id: 'mita', name: '\u79d8\u5854AI\u641c\u7d22', color: 'bg-accent-violet', initial: '\u79d8', url: 'https://metaso.cn' },
  { id: 'poe', name: 'Poe', color: 'bg-accent-purple', initial: 'P', url: 'https://poe.com' },
  { id: 'perplexity', name: 'Perplexity', color: 'bg-accent-blue', initial: 'P', url: 'https://perplexity.ai' },
  { id: 'devv', name: 'DEVV_', color: 'bg-accent-indigo', initial: 'D', url: 'https://devv.ai' },
  { id: 'tiangong', name: '\u5929\u5de5AI', color: 'bg-accent-blue', initial: '\u5929', url: 'https://www.tiangong.cn' },
  { id: 'felo', name: 'Felo', color: 'bg-accent-pink', initial: 'F', url: 'https://felo.ai' },
  { id: 'duckduckgo', name: 'DuckDuckGo', color: 'bg-accent-orange', initial: 'DD', url: 'https://duckduckgo.com' },
  { id: 'bolt', name: 'bolt', color: 'bg-foreground', initial: 'b', url: 'https://bolt.new' },
  { id: 'namai', name: '\u7eb3\u7c73AI', color: 'bg-accent-pink', initial: '\u7eb3', url: 'https://www.namai.com' },
  { id: 'thinkany', name: 'ThinkAny', color: 'bg-accent-violet', initial: 'T', url: 'https://thinkany.ai' },
  { id: 'ghcopilot', name: 'GitHub Copilot', color: 'bg-foreground', initial: 'GH', url: 'https://github.com/features/copilot' },
  { id: 'genspark', name: 'Genspark', color: 'bg-accent-indigo', initial: 'GS', url: 'https://www.genspark.ai' },
  { id: 'grok', name: 'Grok', color: 'bg-foreground', initial: 'X', url: 'https://grok.x.ai' },
  { id: 'qwenchat', name: 'QwenChat', color: 'bg-accent-purple', initial: 'Q', url: 'https://chat.qwen.ai' },
  { id: 'flowith', name: 'Flowith', color: 'bg-foreground', initial: 'F', url: 'https://flowith.io' },
  { id: '3mintop', name: '3MinTop', color: 'bg-accent-amber', initial: '\u26a1', url: 'https://3mintop.com' },
  { id: 'xiaoyi', name: '\u5c0f\u827a', color: 'bg-accent-emerald', initial: '\u827a', url: 'https://xiaoyi.huawei.com' },
  { id: 'notebooklm', name: 'NotebookLM', color: 'bg-accent-amber', initial: 'NL', url: 'https://notebooklm.google.com' },
  { id: 'coze', name: 'Coze', color: 'bg-accent-indigo', initial: 'C', url: 'https://www.coze.com' },
  { id: 'dify', name: 'Dify', color: 'bg-accent-blue', initial: 'D', url: 'https://dify.ai' },
  { id: 'wps', name: 'WPS\u7075\u7280', color: 'bg-accent-pink', initial: 'W', url: 'https://ai.wps.cn' },
  { id: 'lechat', name: 'LeChat', color: 'bg-accent-orange', initial: 'L', url: 'https://chat.mistral.ai' },
  { id: 'abacus', name: 'Abacus', color: 'bg-foreground', initial: 'A', url: 'https://abacus.ai' },
  { id: 'lambdachat', name: 'Lambda Chat', color: 'bg-accent-purple', initial: '\u03bb', url: 'https://lambda.chat' },
  { id: 'monica', name: 'Monica', color: 'bg-foreground', initial: 'M', url: 'https://monica.im' },
  { id: 'you', name: 'You', color: 'bg-accent-blue', initial: 'Y', url: 'https://you.com' },
  { id: 'cci', name: 'Cci', color: 'bg-accent-blue', initial: 'Cc', url: 'https://cci.com' },
  { id: 'zhihu_zhida', name: '\u77e5\u4e4e\u76f4\u7b54', color: 'bg-accent-blue', initial: '\u77e5', url: 'https://zhida.zhihu.com' },
  { id: 'google', name: 'Google', color: 'bg-accent-blue', initial: 'G', url: 'https://google.com' },
  { id: 'longcat', name: 'LongCat', color: 'bg-accent-emerald', initial: 'LC', url: 'https://longcat.ai' },
  { id: 'linlai', name: '\u9cde\u9ca4\u767e\u79d1', color: 'bg-accent-emerald', initial: '\u9cde', url: 'https://www.linlai.com' },
  { id: 'huggingchat', name: 'HuggingChat', color: 'bg-foreground', initial: 'H', url: 'https://huggingface.co/chat' },
  { id: 'grokx', name: 'Grok/X', color: 'bg-foreground', initial: 'X', url: 'https://x.com/i/grok' },
  { id: 'aistudio', name: 'AI Studio', color: 'bg-accent-blue', initial: 'AS', url: 'https://aistudio.google.com' },
  { id: 'n8n', name: 'n8n', color: 'bg-accent-orange', initial: 'n8n', url: 'https://n8n.io' },
];

interface CustomMiniApp { id: string; name: string; color: string; initial: string; url: string; logoUrl?: string; isCustom?: boolean }

export function MiniAppsPage() {
  const { openMiniApp: onOpenMiniApp } = useGlobalActions();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [customApps, setCustomApps] = useState<CustomMiniApp[]>([]);
  const [visibleApps, setVisibleApps] = useState<string[]>(miniAppList.map(a => a.id));
  const [hiddenApps, setHiddenApps] = useState<string[]>([]);
  const [openInBrowser, setOpenInBrowser] = useState(false);
  const [cacheCount, setCacheCount] = useState(5);
  const [showInSidebar, setShowInSidebar] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingApp, setEditingApp] = useState<CustomMiniApp | null>(null);
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formLogoMode, setFormLogoMode] = useState<'url' | 'upload'>('url');
  const [formLogoUrl, setFormLogoUrl] = useState('');
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; appId: string } | null>(null);
  const ctxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setCtxMenu(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  const allApps: CustomMiniApp[] = [...miniAppList, ...customApps];
  const displayedApps = allApps.filter(
    a => visibleApps.includes(a.id) && a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const moveToHidden = (appId: string) => { setVisibleApps(prev => prev.filter(id => id !== appId)); setHiddenApps(prev => [...prev, appId]); };
  const moveToVisible = (appId: string) => { setHiddenApps(prev => prev.filter(id => id !== appId)); setVisibleApps(prev => [...prev, appId]); };
  const swapAll = () => { const v = [...visibleApps]; const h = [...hiddenApps]; setVisibleApps(h); setHiddenApps(v); };
  const resetAll = () => { setVisibleApps(allApps.map(a => a.id)); setHiddenApps([]); };

  const openAddDialog = () => { setEditingApp(null); setFormId(''); setFormName(''); setFormUrl(''); setFormLogoUrl(''); setFormLogoMode('url'); setShowAddDialog(true); };
  const openEditDialog = (app: CustomMiniApp) => { setEditingApp(app); setFormId(app.id); setFormName(app.name); setFormUrl(app.url); setFormLogoUrl(app.logoUrl || ''); setFormLogoMode('url'); setShowAddDialog(true); };
  const saveApp = () => {
    if (!formId.trim() || !formName.trim() || !formUrl.trim()) return;
    const colorPool = ['bg-accent-emerald','bg-accent-indigo','bg-accent-orange','bg-accent-violet','bg-accent-pink','bg-accent-blue','bg-accent-pink','bg-accent-emerald','bg-accent-amber','bg-accent-blue'];
    const newApp: CustomMiniApp = { id: formId.trim(), name: formName.trim(), url: formUrl.trim(), logoUrl: formLogoUrl.trim() || undefined, color: editingApp?.color || colorPool[Math.floor(Math.random() * colorPool.length)], initial: formName.trim().charAt(0).toUpperCase(), isCustom: true };
    if (editingApp) {
      setCustomApps(prev => prev.map(a => a.id === editingApp.id ? newApp : a));
      if (editingApp.id !== newApp.id) { setVisibleApps(prev => prev.map(id => id === editingApp.id ? newApp.id : id)); setHiddenApps(prev => prev.map(id => id === editingApp.id ? newApp.id : id)); }
    } else { setCustomApps(prev => [...prev, newApp]); setVisibleApps(prev => [...prev, newApp.id]); }
    setShowAddDialog(false);
  };
  const deleteCustomApp = (appId: string) => { setCustomApps(prev => prev.filter(a => a.id !== appId)); setVisibleApps(prev => prev.filter(id => id !== appId)); setHiddenApps(prev => prev.filter(id => id !== appId)); setCtxMenu(null); };

  const ctxApp = ctxMenu ? allApps.find(a => a.id === ctxMenu.appId) : null;

  const AppIcon = ({ app, size = 'md' }: { app: CustomMiniApp; size?: 'sm' | 'md' | 'lg' }) => {
    const dims = size === 'sm' ? 'w-5 h-5 rounded-md text-xs' : size === 'lg' ? 'w-16 h-16 rounded-2xl text-xl' : 'w-11 h-11 rounded-xl text-xs';
    const px = size === 'sm' ? 20 : size === 'lg' ? 64 : 44;
    if (app.logoUrl) return <img src={app.logoUrl} alt="" className={`${dims.split(' ').slice(0, 2).join(' ')} ${size === 'sm' ? 'rounded-md' : size === 'lg' ? 'rounded-2xl' : 'rounded-xl'} object-cover flex-shrink-0`} />;
    return <BrandLogo id={app.id} fallbackLetter={app.initial} fallbackColor={app.color} size={px} />;
  };

  const handleOpenApp = (appId: string) => {
    const app = allApps.find(a => a.id === appId);
    if (!app) return;
    onOpenMiniApp?.({ id: app.id, name: app.name, color: app.color, initial: app.initial, url: app.url, logoUrl: app.logoUrl });
  };

  const anyDrawerOpen = showAddDialog || showSettings;

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      <div className="h-11 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs">
          <Puzzle size={13} className="text-muted-foreground" />
          <span className="text-foreground">{'\u5c0f\u7a0b\u5e8f'}</span>
          <span className="text-xs text-muted-foreground/40 ml-1">{displayedApps.length} {'\u4e2a'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-xs" onClick={openAddDialog}><Plus size={14} /></Button>
          <Button variant="ghost" size="icon-xs" onClick={() => setShowSettings(true)}><SlidersHorizontal size={14} /></Button>
        </div>
      </div>

      <div className="px-6 py-2">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={'\u641c\u7d22\u5c0f\u7a0b\u5e8f\u2026'}
          iconSize={13}
          wrapperClassName="max-w-md mx-auto px-3 py-1.5 rounded-lg border border-border/50 bg-muted/20 focus-within:border-primary/30 transition-colors"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-3xl mx-auto">
          {displayedApps.length === 0 ? (
            <EmptyState
              preset={searchTerm ? 'no-result' : 'no-miniapp'}
              title={searchTerm ? '\u6ca1\u6709\u627e\u5230\u5339\u914d\u7684\u5c0f\u7a0b\u5e8f' : undefined}
              description={searchTerm ? '\u5c1d\u8bd5\u8c03\u6574\u641c\u7d22\u5173\u952e\u8bcd' : undefined}
            />
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-x-2 gap-y-4">
              {displayedApps.map(app => (
                <Button key={app.id} variant="ghost" onClick={() => handleOpenApp(app.id)} onContextMenu={e => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY, appId: app.id }); }} className="flex flex-col items-center gap-1.5 group relative p-1" size="inline">
                  <div className="transition-transform group-hover:scale-110 shadow-sm"><AppIcon app={app} /></div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[60px]">{app.name}</span>
                  {app.isCustom && <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary/80 flex items-center justify-center"><PenLine size={7} className="text-white" /></div>}
                </Button>
              ))}
              <Button variant="ghost" onClick={openAddDialog} className="flex flex-col items-center gap-1.5 group p-1" size="inline">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-dashed border-border/60 text-muted-foreground/40 group-hover:border-primary/40 group-hover:text-primary/60 transition-colors"><Plus size={16} /></div>
                <span className="text-xs text-muted-foreground/40 group-hover:text-muted-foreground transition-colors">{'\u81ea\u5b9a\u4e49'}</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {ctxMenu && ctxApp && (
        <div ref={ctxRef} className="fixed z-[var(--z-floating)] bg-card rounded-xl border border-border/30 shadow-xl py-1 min-w-[140px]" style={{ left: ctxMenu.x, top: ctxMenu.y }} onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="xs" onClick={() => { handleOpenApp(ctxMenu.appId); setCtxMenu(null); }} className="w-full justify-start gap-2.5 px-3 py-1.5 text-xs text-foreground"><Globe size={12} className="text-muted-foreground" /> {'\u6253\u5f00'}</Button>
          <Button variant="ghost" size="xs" onClick={() => { moveToHidden(ctxMenu.appId); setCtxMenu(null); }} className="w-full justify-start gap-2.5 px-3 py-1.5 text-xs text-foreground"><EyeOff size={12} className="text-muted-foreground" /> {'\u9690\u85cf'}</Button>
          <Button variant="ghost" size="xs" onClick={() => { copyToClipboard(ctxApp.url); setCtxMenu(null); }} className="w-full justify-start gap-2.5 px-3 py-1.5 text-xs text-foreground"><Copy size={12} className="text-muted-foreground" /> {'\u590d\u5236\u94fe\u63a5'}</Button>
          {ctxApp.isCustom && (
            <div>
              <div className="border-t border-border/30 my-1" />
              <Button variant="ghost" size="xs" onClick={() => { openEditDialog(ctxApp); setCtxMenu(null); }} className="w-full justify-start gap-2.5 px-3 py-1.5 text-xs text-foreground"><PenLine size={12} className="text-muted-foreground" /> {'\u7f16\u8f91'}</Button>
              <Button variant="destructive" size="xs" onClick={() => deleteCustomApp(ctxMenu.appId)} className="w-full justify-start gap-2.5 px-3 py-1.5 text-xs hover:bg-destructive/10"><Trash2 size={12} /> {'\u5220\u9664'}</Button>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {anyDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-[var(--z-overlay)]bg-foreground/20"
            onClick={() => { setShowAddDialog(false); setShowSettings(false); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddDialog && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="absolute top-2 right-2 bottom-2 z-[var(--z-popover)]w-[380px] bg-card rounded-2xl border border-border/30 shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 h-11 flex-shrink-0 border-b border-border/15">
              <span className="text-xs text-foreground">{editingApp ? '\u7f16\u8f91\u81ea\u5b9a\u4e49\u5c0f\u7a0b\u5e8f' : '\u6dfb\u52a0\u81ea\u5b9a\u4e49\u5c0f\u7a0b\u5e8f'}</span>
              <Button variant="ghost" size="icon-xs" onClick={() => setShowAddDialog(false)}>
                <X size={13} />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
              <div className="flex flex-col items-center py-4">
                {formLogoUrl ? (
                  <img src={formLogoUrl} alt="" className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                ) : (
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg shadow-sm ${editingApp?.color || 'bg-accent-indigo'}`}
                  >
                    {formName.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                <span className="text-xs text-foreground mt-2">{formName || '\u672a\u547d\u540d\u5e94\u7528'}</span>
              </div>

              <div className="space-y-3">
                <FormField label="ID" required>
                  <Input
                    type="text" value={formId} onChange={e => setFormId(e.target.value)}
                    placeholder={'\u552f\u4e00\u6807\u8bc6\u7b26'}
                    disabled={!!editingApp}
                    className="w-full px-3 py-2 border border-border/30 bg-accent/5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-border/50 disabled:opacity-30"
                  />
                </FormField>

                <FormField label={'\u540d\u79f0'} required>
                  <Input
                    type="text" value={formName} onChange={e => setFormName(e.target.value)}
                    placeholder={'\u5e94\u7528\u663e\u793a\u540d\u79f0'}
                    className="w-full px-3 py-2 border border-border/30 bg-accent/5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-border/50"
                  />
                </FormField>

                <FormField label="URL" required>
                  <Input
                    type="text" value={formUrl} onChange={e => setFormUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-border/30 bg-accent/5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-border/50 font-mono"
                  />
                </FormField>

                <FormField label="Logo">
                  <div className="flex items-center gap-3 mb-2">
                    <Button
                      variant="ghost" size="xs"
                      onClick={() => setFormLogoMode('url')}
                      className={`gap-1.5 ${
                        formLogoMode === 'url' ? 'bg-accent text-foreground' : 'text-muted-foreground/40'
                      }`}
                    >
                      <Link size={9} /> URL
                    </Button>
                    <Button
                      variant="ghost" size="xs"
                      onClick={() => setFormLogoMode('upload')}
                      className={`gap-1.5 ${
                        formLogoMode === 'upload' ? 'bg-accent text-foreground' : 'text-muted-foreground/40'
                      }`}
                    >
                      <Upload size={9} /> {'\u4e0a\u4f20'}
                    </Button>
                  </div>
                  {formLogoMode === 'url' ? (
                    <Input
                      type="text" value={formLogoUrl} onChange={e => setFormLogoUrl(e.target.value)}
                      placeholder={'Logo \u56fe\u7247\u5730\u5740'}
                      className="w-full px-3 py-2 border border-border/30 bg-accent/5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-border/50 font-mono"
                    />
                  ) : (
                    <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border/30 bg-accent/5 cursor-pointer hover:border-border/50 transition-colors">
                      <Upload size={11} className="text-muted-foreground/40" />
                      <span className="text-xs text-muted-foreground/40">{'\u9009\u62e9\u56fe\u7247\u6587\u4ef6'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = ev => setFormLogoUrl(ev.target?.result as string); reader.readAsDataURL(file); } }} />
                      {formLogoUrl && formLogoMode === 'upload' && <img src={formLogoUrl} alt="" className="w-5 h-5 rounded object-cover ml-auto" />}
                    </label>
                  )}
                </FormField>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-3 border-t border-border/15 flex-shrink-0">
              <Button
                variant="default" size="xs"
                onClick={saveApp}
                disabled={!formId.trim() || !formName.trim() || !formUrl.trim()}
              >
                {'\u4fdd\u5b58'}
              </Button>
              <Button
                variant="ghost" size="xs"
                onClick={() => setShowAddDialog(false)}
              >
                {'\u53d6\u6d88'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="absolute top-2 right-2 bottom-2 z-[var(--z-popover)]w-[400px] bg-card rounded-2xl border border-border/30 shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 h-11 flex-shrink-0 border-b border-border/15">
              <span className="text-xs text-foreground">{'\u663e\u793a\u8bbe\u7f6e'}</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="xs" onClick={swapAll} className="gap-1 text-muted-foreground/40">
                  <ArrowLeftRight size={10} /> {'\u4ea4\u6362'}
                </Button>
                <Button variant="ghost" size="xs" onClick={resetAll} className="gap-1 text-muted-foreground/40">
                  <RotateCcw size={10} /> {'\u91cd\u7f6e'}
                </Button>
                <Button variant="ghost" size="icon-xs" onClick={() => setShowSettings(false)}>
                  <X size={13} />
                </Button>
              </div>
            </div>

            <div className="flex-1 flex min-h-0 overflow-hidden">
              <div className="flex-1 flex flex-col min-h-0 border-r border-border/15">
                <div className="flex items-center justify-between px-3 py-2 flex-shrink-0">
                  <span className="text-xs text-muted-foreground/50">{'\u663e\u793a'}</span>
                  <span className="text-xs text-muted-foreground/50">{visibleApps.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                  {visibleApps.map(id => {
                    const app = allApps.find(a => a.id === id);
                    if (!app) return null;
                    return (
                      <div
                        key={id}
                        onClick={() => moveToHidden(id)}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-accent/50 cursor-pointer transition-colors group"
                      >
                        <AppIcon app={app} size="sm" />
                        <span className="text-sm text-foreground flex-1 truncate">{app.name}</span>
                        <EyeOff size={9} className="text-muted-foreground/40 group-hover:text-muted-foreground/50 transition-colors flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between px-3 py-2 flex-shrink-0">
                  <span className="text-xs text-muted-foreground/50">{'\u9690\u85cf'}</span>
                  <span className="text-xs text-muted-foreground/50">{hiddenApps.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                  {hiddenApps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[120px]">
                      <EyeOff size={14} className="text-muted-foreground/40 mb-1" />
                      <span className="text-xs text-muted-foreground/50">{'\u70b9\u51fb\u5de6\u4fa7\u9879\u76ee\u9690\u85cf'}</span>
                    </div>
                  ) : hiddenApps.map(id => {
                    const app = allApps.find(a => a.id === id);
                    if (!app) return null;
                    return (
                      <div
                        key={id}
                        onClick={() => moveToVisible(id)}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-accent/50 cursor-pointer transition-colors group"
                      >
                        <AppIcon app={app} size="sm" />
                        <span className="text-sm text-muted-foreground/60 flex-1 truncate">{app.name}</span>
                        <Eye size={9} className="text-muted-foreground/40 group-hover:text-muted-foreground/50 transition-colors flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 border-t border-border/15 px-4 py-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground">{'\u5728\u6d4f\u89c8\u5668\u4e2d\u6253\u5f00\u65b0\u7a97\u53e3\u94fe\u63a5'}</span>
                <Switch size="sm" checked={openInBrowser} onCheckedChange={setOpenInBrowser} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-foreground">{'\u5c0f\u7a0b\u5e8f\u7f13\u5b58\u6570\u91cf'}</span>
                  <p className="text-xs text-muted-foreground/60">{'\u540c\u65f6\u4fdd\u6301\u6d3b\u8dc3\u7684\u6700\u5927\u6570\u91cf'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon-xs" onClick={() => setCacheCount(5)}><RotateCcw size={9} /></Button>
                  <Slider min={1} max={10} value={[cacheCount]} onValueChange={([v]) => setCacheCount(v)} className="w-16" />
                  <span className="text-xs text-muted-foreground/40 w-4 text-center">{cacheCount}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-foreground">{'\u4fa7\u8fb9\u680f\u663e\u793a\u6d3b\u8dc3\u5c0f\u7a0b\u5e8f'}</span>
                  <p className="text-xs text-muted-foreground/60">{'\u5728\u4fa7\u8fb9\u680f\u5c55\u793a\u8fd0\u884c\u4e2d\u7684\u5c0f\u7a0b\u5e8f'}</p>
                </div>
                <Switch size="sm" checked={showInSidebar} onCheckedChange={setShowInSidebar} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground/50 block">
        {required && <span className="text-destructive/60 mr-0.5">*</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

