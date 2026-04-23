import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Plus, Check, ChevronDown, X,
  Eye, EyeOff, Copy, ExternalLink,
  Settings2, Globe, Trash2, Save,
  ChevronRight, Info,
} from 'lucide-react';
import { Button, Input, Slider, Textarea, BrandLogo, Typography, Switch } from '@cherry-studio/ui';
import { Tooltip } from '@/app/components/Tooltip';
import type { SearchProvider, BlacklistSubscription } from '@/app/types/shared';
import { InlineSelect } from './shared';

// ===========================
// Mock Data
// ===========================
const MOCK_SEARCH_PROVIDERS: SearchProvider[] = [
  {
    id: 'tavily',
    name: 'Tavily',
    logo: 'T',
    color: '#6366f1',
    subtitle: 'API Key Configured',
    enabled: true,
    configured: true,
    apiKey: '••••••••••••••••••••••••',
    params: [
      { id: 'search-depth', label: 'Search Depth', type: 'select', value: 'basic', options: [{ value: 'basic', label: 'Basic (Fast)' }, { value: 'advanced', label: 'Advanced (Thorough)' }] },
      { id: 'include-answer', label: 'Include Answer', type: 'toggle', value: true, desc: '让 Tavily 直接生成简短回答。' },
    ],
  },
  {
    id: 'google',
    name: 'Google Search',
    logo: 'G',
    color: '#4285f4',
    subtitle: 'Standard Search API',
    enabled: false,
    configured: false,
    apiKey: '',
    baseUrl: 'https://www.googleapis.com/customsearch/v1',
    params: [
      { id: 'cx', label: 'Search Engine ID (CX)', type: 'text', value: '', desc: '在 Google Programmable Search Engine 控制台获取。' },
      { id: 'safe-search', label: 'Safe Search', type: 'select', value: 'moderate', options: [{ value: 'off', label: 'Off' }, { value: 'moderate', label: 'Moderate' }, { value: 'strict', label: 'Strict' }] },
      { id: 'gl', label: '地理位置 (GL)', type: 'select', value: 'cn', options: [{ value: 'cn', label: '中国 (CN)' }, { value: 'us', label: '美国 (US)' }, { value: 'jp', label: '日本 (JP)' }, { value: 'auto', label: '自动检测' }] },
    ],
  },
  {
    id: 'searxng',
    name: 'SearXNG',
    logo: 'S',
    color: '#0ea5e9',
    subtitle: 'Self-hosted Instance',
    enabled: true,
    configured: true,
    baseUrl: 'https://search.example.com',
    params: [
      { id: 'engines', label: '搜索引擎', type: 'text', value: 'google,bing,duckduckgo', desc: '逗号分隔的引擎列表。' },
      { id: 'language', label: '搜索语言', type: 'select', value: 'auto', options: [{ value: 'auto', label: '自动检测' }, { value: 'zh-CN', label: '简体中文' }, { value: 'en', label: 'English' }, { value: 'ja', label: '日本語' }] },
      { id: 'time-range', label: '时间范围', type: 'select', value: '', options: [{ value: '', label: '不限' }, { value: 'day', label: '24 小时' }, { value: 'week', label: '一周' }, { value: 'month', label: '一月' }, { value: 'year', label: '一年' }] },
    ],
  },
  {
    id: 'bing',
    name: 'Bing Search',
    logo: 'B',
    color: '#0078d4',
    subtitle: 'Azure Subscription',
    enabled: false,
    configured: false,
    apiKey: '',
    baseUrl: 'https://api.bing.microsoft.com/v7.0/search',
    params: [
      { id: 'market', label: '市场 (Market)', type: 'select', value: 'zh-CN', options: [{ value: 'zh-CN', label: '中国 (zh-CN)' }, { value: 'en-US', label: '美国 (en-US)' }, { value: 'ja-JP', label: '日本 (ja-JP)' }] },
      { id: 'response-filter', label: '结果类型过滤', type: 'select', value: 'webpages', options: [{ value: 'webpages', label: '仅网页' }, { value: 'webpages,news', label: '网页 + 新闻' }, { value: 'all', label: '全部类型' }] },
    ],
  },
];

const MOCK_SUBSCRIPTIONS: BlacklistSubscription[] = [
  { id: 's1', name: 'SEO Spam Blocklist', url: 'https://raw.githubusercontent.com/nicholasgasior/seo-spam/list.txt', enabled: true },
  { id: 's2', name: 'AdGuard URL Filters', url: 'https://filters.adguard.com/url-filter.txt', enabled: false },
];

// ===========================
// Global Strategy Config (Right Panel)
// ===========================
function GlobalStrategyConfig() {
  const [topK, setTopK] = useState(10);
  const [includeDates, setIncludeDates] = useState(true);
  const [compression, setCompression] = useState('llm-summary');
  const [maxTokens, setMaxTokens] = useState('4000');
  const [blacklistRules, setBlacklistRules] = useState('csdn.net\nbaidu.com/link?\n*://*.advertisement.*');
  const [subscriptions, setSubscriptions] = useState(MOCK_SUBSCRIPTIONS);

  const toggleSubscription = (id: string) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center">
          <Settings2 size={14} className="text-muted-foreground/40" />
        </div>
        <div>
          <Typography variant="subtitle">全局搜索策略</Typography>
          <p className="text-xs text-muted-foreground/60 mt-0.5">控制所有搜索服务商的通用行为和结果处理规则。</p>
        </div>
      </div>

      {/* 常规设置 */}
      <div className="mb-5">
        <p className="text-sm font-medium text-muted-foreground mb-3">常规设置</p>

        {/* Top K Slider */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm text-muted-foreground">搜索结果个数 (Top K)</label>
            <span className="text-xs font-semibold text-primary">{topK}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-muted-foreground/40 flex-shrink-0 w-3 text-right">1</span>
            <Slider
              min={1}
              max={50}
              value={[topK]}
              onValueChange={([v]) => setTopK(v)}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground/40 flex-shrink-0 w-4">50</span>
          </div>
        </div>

        {/* Include Dates */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <p className="text-sm text-muted-foreground">搜索包含日期</p>
            <Tooltip content="开启后，搜索结果将优先包含发布时间的元数据。" side="top">
              <span className="text-muted-foreground/50 hover:text-muted-foreground/50 transition-colors cursor-help flex-shrink-0">
                <Info size={10} />
              </span>
            </Tooltip>
          </div>
          <Switch size="sm" checked={includeDates} onCheckedChange={setIncludeDates} />
        </div>
      </div>

      {/* 结果处理 */}
      <div className="mb-5">
        <p className="text-sm font-medium text-muted-foreground mb-3">结果处理 (Post-Processing)</p>

        <div className="mb-3.5">
          <label className="text-sm text-muted-foreground mb-1.5 block">压缩方法</label>
          <InlineSelect
            value={compression}
            onChange={setCompression}
            options={[
              { value: 'llm-summary', label: 'LLM 智能摘要 (推荐)' },
              { value: 'extractive', label: '关键句提取' },
              { value: 'none', label: '不压缩 (原始文本)' },
            ]}
            fullWidth
          />
        </div>

        <div className="mb-1">
          <div className="flex items-center gap-1.5 mb-1.5">
            <label className="text-sm text-muted-foreground">最大上下文长度 (Tokens)</label>
            <Tooltip content="限制搜索结果注入到提示词中的最大 Token 数量，防止超出上下文窗口。" side="top">
              <span className="text-muted-foreground/50 hover:text-muted-foreground/50 transition-colors cursor-help flex-shrink-0">
                <Info size={10} />
              </span>
            </Tooltip>
          </div>
          <div className="flex items-center px-2.5 py-[5px] bg-muted/30 rounded-lg border border-border/30">
            <Input type="text" value={maxTokens} onChange={e => setMaxTokens(e.target.value)} className="flex-1 bg-transparent text-xs text-muted-foreground border-0 shadow-none h-auto p-0 min-w-0" />
          </div>
        </div>
      </div>

      {/* 黑名单 */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-sm font-medium text-muted-foreground">黑名单 (Blacklist)</p>
          <span className="text-xs text-primary bg-primary/10 px-1.5 py-[1px] rounded-md font-medium">
            {blacklistRules.split('\n').filter(r => r.trim()).length} Rules
          </span>
        </div>

        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <label className="text-sm text-muted-foreground">自定义黑名单规则</label>
            <Tooltip content="支持域名匹配与正则表达式。被匹配的 URL 将不会出现在搜索结果中。" side="top">
              <span className="text-muted-foreground/50 hover:text-muted-foreground/50 transition-colors cursor-help flex-shrink-0">
                <Info size={10} />
              </span>
            </Tooltip>
          </div>
          <Textarea
            value={blacklistRules}
            onChange={e => setBlacklistRules(e.target.value)}
            rows={4}
            className="w-full px-2.5 py-2 bg-muted/30 rounded-lg border border-border/30 text-xs text-muted-foreground outline-none resize-none font-mono scrollbar-thin-xs"
          />
        </div>

        <div className="flex justify-end mb-4">
          <Button variant="default" size="xs">
            <Save size={9} />
            <span>保存规则</span>
          </Button>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <label className="text-sm text-muted-foreground">订阅黑名单源</label>
            <Button variant="outline" size="xs" className="text-xs">
              <Plus size={8} />
              <span>添加订阅</span>
            </Button>
          </div>
          <div className="bg-muted/30 border border-border/50 rounded-xl overflow-hidden">
            {subscriptions.map((sub, i) => (
              <div key={sub.id} className={`flex items-center justify-between px-3.5 py-2.5`}>
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-sm font-medium text-muted-foreground">{sub.name}</p>
                  <p className="text-xs text-muted-foreground/40 mt-0.5 truncate font-mono">{sub.url}</p>
                </div>
                <Switch size="sm" checked={sub.enabled} onCheckedChange={() => toggleSubscription(sub.id)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================
// Provider Detail Config (Right Panel)
// ===========================
function ProviderDetailConfig({ provider }: { provider: SearchProvider }) {
  const [enabled, setEnabled] = useState(provider.enabled);
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState(provider.apiKey || '');
  const [baseUrl, setBaseUrl] = useState(provider.baseUrl || '');
  const [paramValues, setParamValues] = useState<Record<string, string | boolean | number>>(() => {
    const vals: Record<string, string | boolean | number> = {};
    provider.params.forEach(p => { vals[p.id] = p.value; });
    return vals;
  });

  const updateParam = (id: string, value: string | boolean | number) => {
    setParamValues(prev => ({ ...prev, [id]: value }));
  };

  const subtitles: Record<string, string> = {
    tavily: '专为 LLM 优化的搜索引擎。',
    google: 'Google Programmable Search Engine API。',
    searxng: '开源、可自托管的元搜索引擎。',
    bing: 'Microsoft Azure Bing Search API。',
  };

  const docsLinks: Record<string, { label: string; url: string }> = {
    tavily: { label: 'tavily.com', url: '#' },
    google: { label: 'developers.google.com', url: '#' },
    searxng: { label: 'docs.searxng.org', url: '#' },
    bing: { label: 'azure.microsoft.com', url: '#' },
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">
      <div className="flex items-center gap-3 mb-5">
        <BrandLogo id={provider.id} fallbackLetter={provider.logo} fallbackColor={provider.color} size={36} className="rounded-xl" />
        <div className="flex-1 min-w-0">
          <Typography variant="subtitle">{provider.name}</Typography>
          <p className="text-xs text-muted-foreground/60 mt-0.5">{subtitles[provider.id] || provider.subtitle}</p>
        </div>
        <Switch size="sm" checked={enabled} onCheckedChange={setEnabled} />
      </div>

      <div className="mb-5">
        <p className="text-sm font-medium text-muted-foreground mb-3">认证 (Authentication)</p>

        {provider.id !== 'searxng' && (
          <div className="mb-3">
            <label className="text-sm text-muted-foreground mb-1.5 block">API Key</label>
            <div className="flex items-center gap-1.5">
              <div className="flex-1 flex items-center px-2.5 py-[5px] bg-muted/30 rounded-lg border border-border/30">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="输入 API Key"
                  className="flex-1 bg-transparent text-xs text-muted-foreground border-0 shadow-none h-auto p-0 placeholder:text-muted-foreground/60 min-w-0"
                />
                <Button variant="ghost" size="icon-xs" onClick={() => setShowKey(v => !v)} className="text-muted-foreground/50 hover:text-foreground ml-1.5">
                  {showKey ? <EyeOff size={10} /> : <Eye size={10} />}
                </Button>
              </div>
              <Button variant="outline" size="icon-xs" className="">
                <Copy size={9} />
              </Button>
            </div>
            {docsLinks[provider.id] && (
              <p className="text-xs text-muted-foreground/40 mt-1">
                从{' '}
                <a href={docsLinks[provider.id].url} className="text-muted-foreground/60 hover:text-foreground transition-colors">
                  {docsLinks[provider.id].label}
                </a>
                {' '}获取您的 API 密钥。
              </p>
            )}
          </div>
        )}

        {provider.baseUrl !== undefined && (
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Base URL</label>
            <div className="flex items-center px-2.5 py-[5px] bg-muted/30 rounded-lg border border-border/30">
              <Input type="text" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} className="flex-1 bg-transparent text-xs text-muted-foreground border-0 shadow-none h-auto p-0 min-w-0" />
              <Button variant="ghost" size="icon-xs" className="text-muted-foreground/50 hover:text-foreground ml-1.5">
                <ExternalLink size={9} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {provider.params.length > 0 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">参数配置</p>
          <div className="space-y-3.5">
            {provider.params.map(param => (
              <div key={param.id}>
                {param.type === 'select' && param.options && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <label className="text-sm text-muted-foreground">{param.label}</label>
                      {param.desc && (
                        <Tooltip content={param.desc} side="top">
                          <span className="text-muted-foreground/50 hover:text-muted-foreground/50 transition-colors cursor-help flex-shrink-0">
                            <Info size={10} />
                          </span>
                        </Tooltip>
                      )}
                    </div>
                    <InlineSelect value={String(paramValues[param.id])} onChange={v => updateParam(param.id, v)} options={param.options} fullWidth />
                  </div>
                )}
                {param.type === 'toggle' && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm text-muted-foreground">{param.label}</p>
                      {param.desc && (
                        <Tooltip content={param.desc} side="top">
                          <span className="text-muted-foreground/50 hover:text-muted-foreground/50 transition-colors cursor-help flex-shrink-0">
                            <Info size={10} />
                          </span>
                        </Tooltip>
                      )}
                    </div>
                    <Switch size="sm" checked={Boolean(paramValues[param.id])} onCheckedChange={v => updateParam(param.id, v)} />
                  </div>
                )}
                {param.type === 'text' && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <label className="text-sm text-muted-foreground">{param.label}</label>
                      {param.desc && (
                        <Tooltip content={param.desc} side="top">
                          <span className="text-muted-foreground/50 hover:text-muted-foreground/50 transition-colors cursor-help flex-shrink-0">
                            <Info size={10} />
                          </span>
                        </Tooltip>
                      )}
                    </div>
                    <div className="flex items-center px-2.5 py-[5px] bg-muted/30 rounded-lg border border-border/30">
                      <Input type="text" value={String(paramValues[param.id])} onChange={e => updateParam(param.id, e.target.value)} className="flex-1 bg-transparent text-xs text-muted-foreground border-0 shadow-none h-auto p-0 min-w-0" />
                    </div>
                  </div>
                )}
                {param.type === 'number' && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <label className="text-sm text-muted-foreground">{param.label}</label>
                      {param.desc && (
                        <Tooltip content={param.desc} side="top">
                          <span className="text-muted-foreground/50 hover:text-muted-foreground/50 transition-colors cursor-help flex-shrink-0">
                            <Info size={10} />
                          </span>
                        </Tooltip>
                      )}
                    </div>
                    <div className="flex items-center px-2.5 py-[5px] bg-muted/30 rounded-lg border border-border/30">
                      <Input type="number" value={String(paramValues[param.id])} onChange={e => updateParam(param.id, Number(e.target.value))} className="flex-1 bg-transparent text-xs text-muted-foreground border-0 shadow-none h-auto p-0 min-w-0" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===========================
// Main: WebSearchPage
// ===========================
export function WebSearchPage() {
  const [selectedId, setSelectedId] = useState<string>('global');
  const [providers] = useState(MOCK_SEARCH_PROVIDERS);

  const selectedProvider = selectedId !== 'global'
    ? providers.find(p => p.id === selectedId) || null
    : null;

  return (
    <div className="flex h-full min-h-0">
      {/* Middle Column: Service List */}
      <div className="w-[160px] flex-shrink-0 flex flex-col border-r border-border/30 min-h-0">
        <div className="px-3.5 pt-4 pb-2 flex-shrink-0">
          <p className="text-xs font-medium text-muted-foreground/60">网络搜索</p>
        </div>

        <div className="flex-1 overflow-y-auto px-2.5 pb-3 scrollbar-thin-xs">
          <div className="space-y-[2px]">
            {/* Global Strategy - Pinned */}
            <Button size="inline"
              variant="ghost"
              onClick={() => setSelectedId('global')}
              className={`w-full flex items-center justify-between px-3 py-[8px] transition-all text-left relative ${
                selectedId === 'global'
                  ? 'bg-cherry-active-bg'
                  : 'border border-transparent hover:bg-accent/50'
              }`}
            >
              {selectedId === 'global' && (
                <div className="absolute inset-0 rounded-xl border border-cherry-active-border pointer-events-none" />
              )}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className={`flex-shrink-0 ${selectedId === 'global' ? 'text-muted-foreground/60' : 'text-muted-foreground/40'}`}><Settings2 size={14} /></span>
                <span className={`text-sm truncate ${selectedId === 'global' ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>全局搜索策略</span>
              </div>
              <ChevronRight size={9} className={`flex-shrink-0 ${selectedId === 'global' ? 'text-muted-foreground/40' : 'text-muted-foreground/50'}`} />
            </Button>

            {/* Providers */}
            {providers.map(provider => (
              <Button size="inline"
                variant="ghost"
                key={provider.id}
                onClick={() => setSelectedId(provider.id)}
                className={`w-full flex items-center justify-between px-3 py-[8px] transition-all text-left relative ${
                  selectedId === provider.id
                    ? 'bg-cherry-active-bg'
                    : 'border border-transparent hover:bg-accent/50'
                }`}
              >
                {selectedId === provider.id && (
                  <div className="absolute inset-0 rounded-xl border border-cherry-active-border pointer-events-none" />
                )}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="flex-shrink-0"><BrandLogo id={provider.id} fallbackLetter={provider.logo} fallbackColor={provider.color} size={15} /></span>
                  <span className={`text-sm truncate ${selectedId === provider.id ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{provider.name}</span>
                </div>
                <ChevronRight size={9} className={`flex-shrink-0 ${selectedId === provider.id ? 'text-muted-foreground/40' : 'text-muted-foreground/50'}`} />
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Config Panel */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {selectedId === 'global' ? (
          <GlobalStrategyConfig />
        ) : selectedProvider ? (
          <ProviderDetailConfig provider={selectedProvider} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-muted-foreground/40">选择一个服务查看配置</p>
          </div>
        )}
      </div>
    </div>
  );
}
