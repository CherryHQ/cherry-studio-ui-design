import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings2,
  Plug, RefreshCw,
  X,
  Globe2, Command,
  Cloud, FileScan, BrainCircuit, Database, Server, Sparkles, Info, MousePointer,
  Home, Zap, MessageSquareText,
  HelpCircle, Rss, MessageSquare, Building2, Mail, Users, Bug, Github,
  Loader2, CheckCircle2, Calendar, ArrowUpRight,
  FileText, BarChart3,
} from 'lucide-react';
import { ModelServicePage } from './ModelServicePage';
import { WebSearchPage } from './WebSearchPage';
import { DocumentServicePage } from './DocumentServicePage';
import { MemoriesPage } from './MemoriesPage';
import { DataSettingsPage } from './DataSettingsPage';
import { ApiGatewayPage } from './ApiGatewayPage';
import { ShortcutsPage } from './ShortcutsPage';
import { SelectionAssistantPage } from './SelectionAssistantPage';
import { QuickAssistantPage } from './QuickAssistantPage';
import { QuickPhrasesPage } from './QuickPhrasesPage';
import { GeneralSettingsPage } from './GeneralSettingsPage';
import { MCPServicePage } from './MCPServicePage';
import { DashboardPage } from './DashboardPage';
import { DefaultModelSettingsPage } from './DefaultModelSettingsPage';
import { Toggle, InlineSelect } from './shared';
import { Tooltip } from '@/app/components/Tooltip';

// ===========================
// Types
// ===========================
type SettingsSection =
  | 'home'
  | 'general' | 'data-settings' | 'api-gateway' | 'shortcuts' | 'about' | 'dashboard'
  | 'models' | 'default-model' | 'mcp' | 'search' | 'documents' | 'memories'
  | 'quick-assistant' | 'selection-assistant' | 'quick-phrases';

interface NavGroup {
  label: string;
  items: { id: SettingsSection; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[];
}

interface ModelProvider {
  id: string;
  name: string;
  logo: string;
  color: string;
  enabledModels: number;
  totalModels: number;
  status: 'connected' | 'disconnected' | 'error';
  latency?: number;
  apiKey?: string;
  baseUrl?: string;
  models: { id: string; name: string; enabled: boolean; contextWindow: string }[];
}

// ===========================
// Navigation Config
// ===========================
const NAV_GROUPS: NavGroup[] = [
  {
    label: '',
    items: [
      { id: 'home', label: '\u9996\u9875', icon: Home },
    ],
  },
  {
    label: '\u96c6\u6210',
    items: [
      { id: 'models', label: '\u6a21\u578b\u670d\u52a1', icon: Cloud },
      { id: 'default-model', label: '\u9ed8\u8ba4\u6a21\u578b', icon: Sparkles },
      { id: 'api-gateway', label: 'API \u7f51\u5173', icon: Server },
    ],
  },
  {
    label: '\u670d\u52a1',
    items: [
      { id: 'mcp', label: 'MCP \u670d\u52a1', icon: Plug },
      { id: 'search', label: '\u7f51\u7edc\u641c\u7d22', icon: Globe2 },
      { id: 'documents', label: '\u6587\u6863\u89e3\u6790', icon: FileScan },
      { id: 'memories', label: '\u8bb0\u5fc6\u529f\u80fd', icon: BrainCircuit },
    ],
  },
  {
    label: '\u5e94\u7528\u8bbe\u7f6e',
    items: [
      { id: 'general', label: '\u901a\u7528\u8bbe\u7f6e', icon: Settings2 },
      { id: 'data-settings', label: '\u6570\u636e\u8bbe\u7f6e', icon: Database },
    ],
  },
  {
    label: '\u6548\u7387\u5de5\u5177',
    items: [
      { id: 'selection-assistant', label: '\u5212\u8bcd\u52a9\u624b', icon: MousePointer },
      { id: 'shortcuts', label: '\u5feb\u6377\u952e', icon: Command },
      { id: 'quick-assistant', label: '\u5feb\u6377\u52a9\u624b', icon: Sparkles },
      { id: 'quick-phrases', label: '\u5feb\u6377\u77ed\u8bed', icon: MessageSquareText },
    ],
  },
  {
    label: '\u7cfb\u7edf',
    items: [
      { id: 'dashboard', label: '\u6570\u636e\u7edf\u8ba1', icon: BarChart3 },
      { id: 'about', label: '\u5173\u4e8e\u6211\u4eec', icon: Info },
    ],
  },
];

// ===========================
// Mock Data
// ===========================
const MOCK_PROVIDERS: ModelProvider[] = [
  {
    id: 'openai', name: 'OpenAI', logo: 'O', color: '#10a37f',
    enabledModels: 4, totalModels: 8, status: 'connected', latency: 120,
    apiKey: 'sk-\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u20223kFj', baseUrl: 'https://api.openai.com/v1',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', enabled: true, contextWindow: '128K' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', enabled: true, contextWindow: '128K' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', enabled: true, contextWindow: '128K' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', enabled: true, contextWindow: '16K' },
      { id: 'o1', name: 'o1', enabled: false, contextWindow: '200K' },
      { id: 'o1-mini', name: 'o1 Mini', enabled: false, contextWindow: '128K' },
      { id: 'o3-mini', name: 'o3 Mini', enabled: false, contextWindow: '200K' },
      { id: 'dall-e-3', name: 'DALL\u00b7E 3', enabled: false, contextWindow: '\u2014' },
    ],
  },
  {
    id: 'anthropic', name: 'Anthropic', logo: 'A', color: '#d97706',
    enabledModels: 3, totalModels: 5, status: 'connected', latency: 85,
    apiKey: 'sk-ant-\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022Lm4Q', baseUrl: 'https://api.anthropic.com',
    models: [
      { id: 'claude-4-sonnet', name: 'Claude 4 Sonnet', enabled: true, contextWindow: '200K' },
      { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', enabled: true, contextWindow: '200K' },
      { id: 'claude-3.5-haiku', name: 'Claude 3.5 Haiku', enabled: true, contextWindow: '200K' },
      { id: 'claude-3-opus', name: 'Claude 3 Opus', enabled: false, contextWindow: '200K' },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', enabled: false, contextWindow: '200K' },
    ],
  },
  {
    id: 'google', name: 'Google', logo: 'G', color: '#4285f4',
    enabledModels: 2, totalModels: 4, status: 'connected', latency: 145,
    apiKey: 'AIza\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022bCdE', baseUrl: 'https://generativelanguage.googleapis.com',
    models: [
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', enabled: true, contextWindow: '1M' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', enabled: true, contextWindow: '1M' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', enabled: false, contextWindow: '1M' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', enabled: false, contextWindow: '2M' },
    ],
  },
  {
    id: 'ollama', name: 'Ollama', logo: '\ud83e\udd99', color: '#1a1a1a',
    enabledModels: 2, totalModels: 3, status: 'connected', latency: 30,
    apiKey: '', baseUrl: 'http://localhost:11434',
    models: [
      { id: 'llama3.3', name: 'Llama 3.3 70B', enabled: true, contextWindow: '128K' },
      { id: 'qwen2.5', name: 'Qwen 2.5 32B', enabled: true, contextWindow: '128K' },
      { id: 'deepseek-r1', name: 'DeepSeek R1 14B', enabled: false, contextWindow: '128K' },
    ],
  },
  {
    id: 'deepseek', name: 'DeepSeek', logo: 'D', color: '#4f6ef7',
    enabledModels: 1, totalModels: 3, status: 'disconnected',
    apiKey: '', baseUrl: 'https://api.deepseek.com',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek V3', enabled: true, contextWindow: '128K' },
      { id: 'deepseek-reasoner', name: 'DeepSeek R1', enabled: false, contextWindow: '128K' },
      { id: 'deepseek-coder', name: 'DeepSeek Coder', enabled: false, contextWindow: '128K' },
    ],
  },
  {
    id: 'groq', name: 'Groq', logo: 'G', color: '#f55036',
    enabledModels: 0, totalModels: 4, status: 'disconnected',
    apiKey: '', baseUrl: 'https://api.groq.com/openai/v1',
    models: [
      { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', enabled: false, contextWindow: '128K' },
      { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', enabled: false, contextWindow: '32K' },
      { id: 'gemma2-9b', name: 'Gemma 2 9B', enabled: false, contextWindow: '8K' },
      { id: 'whisper', name: 'Whisper Large v3', enabled: false, contextWindow: '\u2014' },
    ],
  },
  {
    id: 'mistral', name: 'Mistral', logo: 'M', color: '#ff7000',
    enabledModels: 0, totalModels: 3, status: 'disconnected',
    apiKey: '', baseUrl: 'https://api.mistral.ai/v1',
    models: [
      { id: 'mistral-large', name: 'Mistral Large', enabled: false, contextWindow: '128K' },
      { id: 'mistral-medium', name: 'Mistral Medium', enabled: false, contextWindow: '32K' },
      { id: 'codestral', name: 'Codestral', enabled: false, contextWindow: '32K' },
    ],
  },
  {
    id: 'zhipu', name: '\u667a\u8c31 AI', logo: '\u667a', color: '#2563eb',
    enabledModels: 1, totalModels: 3, status: 'connected', latency: 200,
    apiKey: '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022Xk9P', baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    models: [
      { id: 'glm-4-plus', name: 'GLM-4 Plus', enabled: true, contextWindow: '128K' },
      { id: 'glm-4-flash', name: 'GLM-4 Flash', enabled: false, contextWindow: '128K' },
      { id: 'glm-4v-plus', name: 'GLM-4V Plus', enabled: false, contextWindow: '8K' },
    ],
  },
];

// ===========================
// About Page \u2014 Changelog Data
// ===========================
const CHANGELOG_DATA = [
  {
    version: 'v2.6.0',
    date: '2026-02-26',
    tag: '\u6700\u65b0\u7248\u672c',
    changes: [
      { type: 'feature' as const, text: '\u65b0\u589e MCP \u670d\u52a1\u96c6\u6210\uff0c\u652f\u6301\u81ea\u5b9a\u4e49\u5de5\u5177\u8c03\u7528' },
      { type: 'feature' as const, text: '\u65b0\u589e\u5212\u8bcd\u52a9\u624b\u529f\u80fd\uff0c\u9009\u4e2d\u6587\u5b57\u5373\u53ef\u5feb\u63d0\u95ee' },
      { type: 'improve' as const, text: '\u4f18\u5316\u6a21\u578b\u7ba1\u7406\u9762\u677f\uff0c\u652f\u6301\u6279\u91cf\u5bfc\u5165\u548c\u5065\u5eb7\u68c0\u67e5' },
      { type: 'improve' as const, text: '\u63d0\u5347\u6df1\u8272\u6a21\u5f0f\u4e0b\u7684\u6587\u5b57\u5bf9\u6bd4\u5ea6\u548c\u53ef\u8bfb\u6027' },
      { type: 'fix' as const, text: '\u4fee\u590d Portal \u5f39\u7a97\u5728 zoom \u7f29\u653e\u4e0b\u5b9a\u4f4d\u504f\u79fb\u7684\u95ee\u9898' },
      { type: 'fix' as const, text: '\u4fee\u590d\u5bf9\u8bdd\u5217\u8868\u62d6\u62fd\u6392\u5e8f\u65f6\u5076\u53d1\u7684\u95ea\u70c1' },
    ],
  },
  {
    version: 'v2.5.2',
    date: '2026-01-18',
    tag: '',
    changes: [
      { type: 'feature' as const, text: '\u652f\u6301 Gemini 2.5 Pro / Flash \u7cfb\u5217\u6a21\u578b' },
      { type: 'improve' as const, text: '\u91cd\u6784\u8bbe\u7f6e\u9875\u9762\uff0c\u65b0\u589e\u9996\u9875\u5feb\u6377\u914d\u7f6e\u9762\u677f' },
      { type: 'improve' as const, text: '\u4f18\u5316\u6d41\u5f0f\u8f93\u51fa\u6e32\u67d3\u6027\u80fd\uff0c\u964d\u4f4e CPU \u5360\u7528' },
      { type: 'fix' as const, text: '\u4fee\u590d\u5bfc\u51fa\u5bf9\u8bdd\u4e3a Markdown \u65f6\u56fe\u7247\u4e22\u5931\u7684\u95ee\u9898' },
    ],
  },
  {
    version: 'v2.5.0',
    date: '2025-12-05',
    tag: '',
    changes: [
      { type: 'feature' as const, text: '\u65b0\u589e\u8bb0\u5fc6\u529f\u80fd\uff0cAI \u53ef\u8de8\u5bf9\u8bdd\u8bb0\u4f4f\u7528\u6237\u504f\u597d' },
      { type: 'feature' as const, text: '\u65b0\u589e API \u7f51\u5173\uff0c\u652f\u6301\u5bf9\u5916\u66b4\u9732\u6a21\u578b\u670d\u52a1' },
      { type: 'improve' as const, text: '\u5168\u9762\u5347\u7ea7 UI \u8bbe\u8ba1\u7cfb\u7edf\uff0c\u7edf\u4e00\u7ec4\u4ef6\u98ce\u683c' },
      { type: 'fix' as const, text: '\u4fee\u590d Ollama \u672c\u5730\u6a21\u578b\u8fde\u63a5\u8d85\u65f6\u7684\u95ee\u9898' },
      { type: 'fix' as const, text: '\u4fee\u590d\u5feb\u6377\u952e\u5728\u8f93\u5165\u6846\u5185\u8bef\u89e6\u53d1\u7684\u95ee\u9898' },
    ],
  },
  {
    version: 'v2.4.0',
    date: '2025-10-20',
    tag: '',
    changes: [
      { type: 'feature' as const, text: '\u65b0\u589e\u6587\u6863\u89e3\u6790\u670d\u52a1\uff0c\u652f\u6301 PDF/Word/Excel \u6587\u4ef6' },
      { type: 'feature' as const, text: '\u652f\u6301 DeepSeek R1 \u63a8\u7406\u6a21\u578b' },
      { type: 'improve' as const, text: '\u4f18\u5316\u4ee3\u7801\u9ad8\u4eae\u6e32\u67d3\uff0c\u65b0\u589e 20+ \u8bed\u8a00\u652f\u6301' },
    ],
  },
  {
    version: 'v2.3.0',
    date: '2025-08-12',
    tag: '',
    changes: [
      { type: 'feature' as const, text: '\u65b0\u589e\u7f51\u7edc\u641c\u7d22\u96c6\u6210\uff0c\u652f\u6301\u5b9e\u65f6\u8054\u7f51\u95ee\u7b54' },
      { type: 'improve' as const, text: '\u4f18\u5316\u5bf9\u8bdd\u5386\u53f2\u641c\u7d22\u529f\u80fd\uff0c\u652f\u6301\u5168\u6587\u68c0\u7d22' },
      { type: 'fix' as const, text: '\u4fee\u590d\u957f\u5bf9\u8bdd\u5bfc\u81f4\u5185\u5b58\u6cc4\u6f0f\u7684\u95ee\u9898' },
    ],
  },
];

const CHANGE_TYPE_MAP = {
  feature: { label: '\u65b0\u589e', color: 'text-foreground/60', bg: 'bg-foreground/[0.06]' },
  improve: { label: '\u4f18\u5316', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  fix: { label: '\u4fee\u590d', color: 'text-amber-400', bg: 'bg-amber-400/10' },
};

// ===========================
// Settings Sidebar
// ===========================
function SettingsSidebar({ active, onSelect, onClose }: { active: SettingsSection; onSelect: (s: SettingsSection) => void; onClose: () => void }) {
  return (
    <div className="w-[180px] flex-shrink-0 flex flex-col overflow-y-auto select-none [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/20">
      {/* Traffic lights */}
      <div className="h-10 flex items-center px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] hover:brightness-90 transition-all cursor-default" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d4a528]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#24a732]" />
        </div>
      </div>
      <div className="flex-1 px-2 pb-4 space-y-1">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <p className="px-3 pb-1 pt-2 text-[9px] text-foreground/40 leading-[12px]">{group.label}</p>
            )}
            <div className="space-y-[1px]">
              {group.items.map(item => {
                const isActive = active === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-[5px] rounded-lg transition-all duration-150 text-[11px] relative ${
                      isActive
                        ? 'bg-cherry-active-bg text-foreground/90'
                        : 'text-foreground/70 hover:text-foreground/90 hover:bg-foreground/[0.04]'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 rounded-lg border border-cherry-active-border pointer-events-none" />
                    )}
                    <Icon size={13} className="flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===========================
// Section Components
// ===========================
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[13px] text-foreground/90 mb-3" style={{ fontWeight: 500 }}>{children}</h2>;
}

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl px-3.5 py-1 ${className || ''}`}>
      {children}
    </div>
  );
}

// ===========================
// Home Settings
// ===========================
function HomeSettings({ onNavigate }: { onNavigate: (s: SettingsSection) => void }) {
  const [defaultModel, setDefaultModel] = useState('claude-4-sonnet');
  const [language, setLanguage] = useState('zh-CN');
  const [theme, setTheme] = useState('dark');
  const [sendKey, setSendKey] = useState('enter');
  const [autoTitle, setAutoTitle] = useState(true);
  const [launchAtLogin, setLaunchAtLogin] = useState(true);
  const [proxyMode, setProxyMode] = useState('system');

  const connectedCount = MOCK_PROVIDERS.filter(p => p.status === 'connected').length;
  const totalModels = MOCK_PROVIDERS.reduce((sum, p) => sum + p.enabledModels, 0);
  const totalProviders = MOCK_PROVIDERS.length;

  const card = "bg-foreground/[0.03] border border-foreground/[0.06] rounded-2xl p-3.5 hover:border-foreground/[0.12] transition-all duration-200";
  const cardLabel = "text-[9px] text-foreground/30 tracking-wide";

  const recentModels = [
    { name: 'Claude 4 Sonnet', provider: 'Anthropic', count: 48, color: '#d97706' },
    { name: 'GPT-4o', provider: 'OpenAI', count: 31, color: '#10a37f' },
    { name: 'Gemini 2.5 Pro', provider: 'Google', count: 18, color: '#4285f4' },
    { name: 'DeepSeek V3', provider: 'DeepSeek', count: 12, color: '#4f6ef7' },
    { name: 'Llama 3.3 70B', provider: 'Ollama', count: 7, color: '#888' },
  ];
  const maxCount = Math.max(...recentModels.map(m => m.count));

  return (
    <div className="grid grid-cols-4 gap-2">

      {/* Row 1 */}
      <div className={`${card} cursor-pointer`} onClick={() => onNavigate('models')}>
        <p className={`${cardLabel} mb-2`}>{'\u670d\u52a1\u8fde\u63a5'}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-[20px] text-primary" style={{ fontWeight: 700 }}>{connectedCount}</span>
          <span className="text-[10px] text-foreground/20">/ {totalProviders}</span>
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
          <span className="text-[9px] text-primary">{'\u5168\u90e8\u5728\u7ebf'}</span>
        </div>
      </div>

      <div className={`${card} cursor-pointer`} onClick={() => onNavigate('models')}>
        <p className={`${cardLabel} mb-2`}>{'\u53ef\u7528\u6a21\u578b'}</p>
        <span className="text-[20px] text-foreground/70" style={{ fontWeight: 700 }}>{totalModels}</span>
        <p className="text-[9px] text-foreground/20 mt-1.5">{'\u5df2\u542f\u7528'}</p>
      </div>

      <div className={`${card}`}>
        <p className={`${cardLabel} mb-2`}>{'\u4eca\u65e5\u5bf9\u8bdd'}</p>
        <span className="text-[20px] text-foreground/70" style={{ fontWeight: 700 }}>24</span>
        <div className="flex items-center gap-1 mt-1.5">
          <span className="text-[9px] text-foreground/40">{'\u2191 12%'}</span>
          <span className="text-[9px] text-foreground/20">{'\u8f83\u6628\u65e5'}</span>
        </div>
      </div>

      <div className={`${card}`}>
        <p className={`${cardLabel} mb-2`}>Token {'\u7528\u91cf'}</p>
        <div className="flex items-baseline gap-0.5">
          <span className="text-[20px] text-foreground/70" style={{ fontWeight: 700 }}>1.2</span>
          <span className="text-[10px] text-foreground/25">M</span>
        </div>
        <div className="flex gap-[2px] items-end mt-1.5 h-[10px]">
          {[3, 5, 4, 7, 6, 8, 5, 9, 7, 6, 8, 10].map((h, i) => (
            <div key={i} className="flex-1 rounded-[1px] bg-foreground/[0.08]" style={{ height: `${h}px` }} />
          ))}
        </div>
      </div>

      {/* Row 2 */}
      <div className={`${card} col-span-2`}>
        <div className="flex items-center justify-between mb-2.5">
          <p className={cardLabel}>{'\u9ed8\u8ba4\u6a21\u578b'}</p>
          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-violet-500/15 to-indigo-500/15 flex items-center justify-center">
            <Sparkles size={10} className="text-violet-400/80" />
          </div>
        </div>
        <InlineSelect value={defaultModel} onChange={setDefaultModel} fullWidth
          options={[
            { value: 'claude-4-sonnet', label: 'Claude 4 Sonnet' },
            { value: 'gpt-4o', label: 'GPT-4o' },
            { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
            { value: 'deepseek-chat', label: 'DeepSeek V3' },
          ]}
        />
      </div>

      <div className={`${card} cursor-pointer`} onClick={() => onNavigate('mcp')}>
        <div className="flex items-center justify-between mb-2.5">
          <p className={cardLabel}>MCP {'\u670d\u52a1'}</p>
          <div className="w-5 h-5 rounded-lg bg-foreground/[0.06] flex items-center justify-center">
            <Plug size={10} className="text-foreground/50" />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] text-primary">3 {'\u4e2a\u5de5\u5177\u8fd0\u884c\u4e2d'}</span>
        </div>
      </div>

      <div className={`${card}`}>
        <p className={`${cardLabel} mb-2`}>{'\u5b58\u50a8\u7a7a\u95f4'}</p>
        <div className="flex items-baseline gap-0.5">
          <span className="text-[15px] text-foreground/70" style={{ fontWeight: 700 }}>256</span>
          <span className="text-[9px] text-foreground/25">MB</span>
        </div>
        <div className="mt-1.5 h-[3px] rounded-full bg-foreground/[0.06] overflow-hidden">
          <div className="h-full rounded-full bg-foreground/30" style={{ width: '32%' }} />
        </div>
      </div>

      {/* Row 3 */}
      <div className={`${card} col-span-2`}>
        <p className={`${cardLabel} mb-2.5`}>{'\u5916\u89c2\u4e0e\u8bed\u8a00'}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? <span className="text-[11px]">{'\ud83c\udf19'}</span>
                : theme === 'light' ? <span className="text-[11px]">{'\u2600\ufe0f'}</span>
                : <span className="text-[11px]">{'\ud83d\udcbb'}</span>}
              <span className="text-[10px] text-foreground/55">{'\u4e3b\u9898\u5916\u89c2'}</span>
            </div>
            <InlineSelect value={theme} onChange={setTheme}
              options={[
                { value: 'dark', label: '\u6df1\u8272' },
                { value: 'light', label: '\u6d45\u8272' },
                { value: 'system', label: '\u8ddf\u968f\u7cfb\u7edf' },
              ]}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe2 size={12} className="text-foreground/30" />
              <span className="text-[10px] text-foreground/55">{'\u754c\u9762\u8bed\u8a00'}</span>
            </div>
            <InlineSelect value={language} onChange={setLanguage}
              options={[
                { value: 'zh-CN', label: '\u7b80\u4f53\u4e2d\u6587' },
                { value: 'zh-TW', label: '\u7e41\u9ad4\u4e2d\u6587' },
                { value: 'en', label: 'English' },
                { value: 'ja', label: '\u65e5\u672c\u8a9e' },
              ]}
            />
          </div>
        </div>
      </div>

      <div className={`${card} col-span-2`}>
        <p className={`${cardLabel} mb-2.5`}>{'\u504f\u597d\u8bbe\u7f6e'}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={11} className="text-foreground/30" />
              <span className="text-[10px] text-foreground/55">{'\u81ea\u52a8\u751f\u6210\u6807\u9898'}</span>
            </div>
            <Toggle checked={autoTitle} onChange={setAutoTitle} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw size={11} className="text-foreground/30" />
              <span className="text-[10px] text-foreground/55">{'\u5f00\u673a\u81ea\u542f\u52a8'}</span>
            </div>
            <Toggle checked={launchAtLogin} onChange={setLaunchAtLogin} />
          </div>
        </div>
      </div>

      {/* Row 4 */}
      <div className={`${card} col-span-2`}>
        <p className={`${cardLabel} mb-2.5`}>{'\u8f93\u5165\u4e0e\u53d1\u9001'}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Command size={11} className="text-foreground/30" />
              <span className="text-[10px] text-foreground/55">{'\u53d1\u9001\u5feb\u6377\u952e'}</span>
            </div>
            <InlineSelect value={sendKey} onChange={setSendKey}
              options={[
                { value: 'enter', label: 'Enter' },
                { value: 'ctrl-enter', label: 'Ctrl+Enter' },
                { value: 'shift-enter', label: 'Shift+Enter' },
              ]}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe2 size={11} className="text-foreground/30" />
              <span className="text-[10px] text-foreground/55">{'\u4ee3\u7406\u6a21\u5f0f'}</span>
            </div>
            <InlineSelect value={proxyMode} onChange={setProxyMode}
              options={[
                { value: 'system', label: '\u7cfb\u7edf\u4ee3\u7406' },
                { value: 'none', label: '\u65e0\u4ee3\u7406' },
                { value: 'custom', label: '\u81ea\u5b9a\u4e49' },
              ]}
            />
          </div>
        </div>
      </div>

      <div className={`${card} col-span-2`}>
        <p className={`${cardLabel} mb-2`}>{'\u5feb\u6377\u8df3\u8f6c'}</p>
        <div className="grid grid-cols-4 gap-1">
          {[
            { label: '\u5feb\u6377\u952e', icon: Command, target: 'shortcuts' as SettingsSection },
            { label: '\u6570\u636e', icon: Database, target: 'data-settings' as SettingsSection },
            { label: '\u901a\u7528', icon: Settings2, target: 'general' as SettingsSection },
            { label: '\u5173\u4e8e', icon: Info, target: 'about' as SettingsSection },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.target}
                onClick={() => onNavigate(item.target)}
                className="flex flex-col items-center gap-1.5 py-2 rounded-xl bg-foreground/[0.03] hover:bg-foreground/[0.06] border border-transparent hover:border-foreground/[0.06] transition-all text-[10px]"
              >
                <Icon size={13} className="text-foreground/30" />
                <span className="text-[9px] text-foreground/40">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 5 */}
      <div className={`${card} col-span-2`}>
        <p className={`${cardLabel} mb-2.5`}>{'\u6a21\u578b\u4f7f\u7528\u6392\u884c'}</p>
        <div className="space-y-[6px]">
          {recentModels.map((m, i) => (
            <div key={m.name} className="flex items-center gap-2">
              <span className="text-[9px] text-foreground/20 w-3 text-right">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-[2px]">
                  <span className="text-[10px] text-foreground/60 truncate">{m.name}</span>
                  <span className="text-[9px] text-foreground/25 flex-shrink-0 ml-2">{m.count} {'\u6b21'}</span>
                </div>
                <div className="h-[2px] rounded-full bg-foreground/[0.04] overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(m.count / maxCount) * 100}%`, backgroundColor: m.color, opacity: 0.5 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`${card} col-span-2`}>
        <p className={`${cardLabel} mb-2.5`}>{'\u672c\u6708\u8d39\u7528\u6982\u89c8'}</p>
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-[9px] text-foreground/25">$</span>
          <span className="text-[18px] text-foreground/70" style={{ fontWeight: 700 }}>4.28</span>
          <span className="text-[9px] text-foreground/20 ml-1">/ {'\u672c\u6708'}</span>
        </div>
        <div className="space-y-1.5">
          {[
            { label: 'Anthropic', amount: '$2.56', pct: 60, color: '#d97706' },
            { label: 'OpenAI', amount: '$1.23', pct: 29, color: '#10a37f' },
            { label: 'Google', amount: '$0.49', pct: 11, color: '#4285f4' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[10px] text-foreground/50 flex-1">{item.label}</span>
              <span className="text-[9px] text-foreground/30">{item.amount}</span>
              <div className="w-12 h-[2px] rounded-full bg-foreground/[0.04] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color, opacity: 0.5 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ===========================
// About Page
// ===========================
function AboutPage() {
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [betaPlan, setBetaPlan] = useState(false);
  const [versionChannel, setVersionChannel] = useState<'rc' | 'beta'>('rc');
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'latest' | 'available'>('idle');
  const [showChangelog, setShowChangelog] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2200);
  }, []);

  const handleCheckUpdate = useCallback(() => {
    if (updateStatus === 'checking') return;
    setUpdateStatus('checking');
    setTimeout(() => {
      setUpdateStatus('latest');
      setTimeout(() => setUpdateStatus('idle'), 3000);
    }, 1800);
  }, [updateStatus]);

  const handleLinkAction = useCallback((label: string, action: string) => {
    if (label === '\u66f4\u65b0\u65e5\u5fd7') {
      setShowChangelog(true);
    } else if (label === '\u5b98\u65b9\u7f51\u7ad9') {
      showToast('\u5df2\u5728\u6d4f\u89c8\u5668\u4e2d\u6253\u5f00\u5b98\u65b9\u7f51\u7ad9');
    } else if (label === '\u5e2e\u52a9\u6587\u6863') {
      showToast('\u5df2\u5728\u6d4f\u89c8\u5668\u4e2d\u6253\u5f00\u5e2e\u52a9\u6587\u6863');
    } else if (label === '\u610f\u89c1\u53cd\u9988') {
      showToast('\u5df2\u6253\u5f00\u53cd\u9988\u9875\u9762');
    } else if (label === '\u4f01\u4e1a\u7248') {
      showToast('\u5df2\u5728\u6d4f\u89c8\u5668\u4e2d\u6253\u5f00\u4f01\u4e1a\u7248\u9875\u9762');
    } else if (label === '\u90ae\u4ef6\u8054\u7cfb') {
      showToast('\u5df2\u590d\u5236\u8054\u7cfb\u90ae\u7bb1\u5230\u526a\u8d34\u677f');
    } else if (label === '\u52a0\u5165\u6211\u4eec') {
      showToast('\u5df2\u5728\u6d4f\u89c8\u5668\u4e2d\u6253\u5f00\u62db\u8058\u9875\u9762');
    } else if (label === '\u8c03\u8bd5\u9762\u677f') {
      showToast('\u8c03\u8bd5\u9762\u677f\u5df2\u6253\u5f00');
    }
  }, [showToast]);

  const ABOUT_LINKS = [
    { icon: HelpCircle, label: '\u5e2e\u52a9\u6587\u6863', action: '\u67e5\u770b' },
    { icon: Rss, label: '\u66f4\u65b0\u65e5\u5fd7', action: '\u67e5\u770b' },
    { icon: Globe2, label: '\u5b98\u65b9\u7f51\u7ad9', action: '\u67e5\u770b' },
    { icon: MessageSquare, label: '\u610f\u89c1\u53cd\u9988', action: '\u53cd\u9988' },
    { icon: Building2, label: '\u4f01\u4e1a\u7248', action: '\u67e5\u770b' },
    { icon: Mail, label: '\u90ae\u4ef6\u8054\u7cfb', action: '\u90ae\u4ef6' },
    { icon: Users, label: '\u52a0\u5165\u6211\u4eec', action: '\u67e5\u770b' },
    { icon: Bug, label: '\u8c03\u8bd5\u9762\u677f', action: '\u6253\u5f00' },
  ];

  const AboutRow = ({ icon: Icon, label, children }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between gap-4 py-[5px]">
      <div className="flex items-center gap-2 min-w-0">
        <Icon size={13} className="text-foreground/35 flex-shrink-0" />
        <span className="text-[11px] text-foreground/80">{label}</span>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );

  return (
    <div className="space-y-2.5">
      {/* Toast notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2 rounded-xl bg-foreground/90 text-background text-[11px] shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 size={13} className="text-foreground/50 flex-shrink-0" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with title and GitHub icon */}
      <div className="flex items-center justify-between">
        <SectionTitle>{'\u5173\u4e8e\u6211\u4eec'}</SectionTitle>
        <Tooltip content={'\u5728 GitHub \u4e0a\u67e5\u770b\u6e90\u7801'} side="left">
          <button
            onClick={() => showToast('\u5df2\u5728\u6d4f\u89c8\u5668\u4e2d\u6253\u5f00 GitHub \u4ed3\u5e93')}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground/40 hover:text-foreground/70 hover:bg-foreground/[0.06] transition-colors"
          >
            <Github size={16} />
          </button>
        </Tooltip>
      </div>

      {/* App info card */}
      <SectionCard>
        <div className="px-2 py-2.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-foreground/45 via-foreground/40 to-foreground/60 flex items-center justify-center text-white text-[18px] shadow-lg shadow-foreground/[0.1] flex-shrink-0" style={{ fontWeight: 700 }}>
              {'\ud83c\udf52'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[13px] text-foreground/90" style={{ fontWeight: 500 }}>Cherry Studio</h3>
              <p className="text-[10px] text-foreground/45 mt-0.5">{'\u4e00\u6b3e\u4e3a\u521b\u9020\u8005\u800c\u751f\u7684 AI \u52a9\u624b'}</p>
              <span className="inline-block mt-1 px-2 py-[1px] rounded-md border border-foreground/[0.15] text-[9px] text-foreground/60" style={{ fontWeight: 500 }}>v2.6.0</span>
            </div>
            <button
              onClick={handleCheckUpdate}
              disabled={updateStatus === 'checking'}
              className={`flex items-center gap-1.5 px-3 py-[5px] rounded-lg border text-[10px] transition-all flex-shrink-0 ${
                updateStatus === 'latest'
                  ? 'border-foreground/[0.15] text-foreground/60 bg-foreground/[0.03]'
                  : updateStatus === 'checking'
                    ? 'border-border/30 text-foreground/40 cursor-wait'
                    : 'border-border/30 text-foreground/55 hover:text-foreground/75 hover:bg-accent'
              }`}
            >
              {updateStatus === 'checking' ? (
                <Loader2 size={10} className="animate-spin" />
              ) : updateStatus === 'latest' ? (
                <CheckCircle2 size={10} />
              ) : (
                <RefreshCw size={10} />
              )}
              <span>
                {updateStatus === 'checking' ? '\u68c0\u67e5\u4e2d...' : updateStatus === 'latest' ? '\u5df2\u662f\u6700\u65b0' : '\u68c0\u67e5\u66f4\u65b0'}
              </span>
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Update settings */}
      <SectionCard>
        <div className="px-2">
          <AboutRow icon={RefreshCw} label={'\u81ea\u52a8\u66f4\u65b0'}>
            <Toggle checked={autoUpdate} onChange={setAutoUpdate} />
          </AboutRow>
          <AboutRow icon={Sparkles} label={'\u6d4b\u8bd5\u8ba1\u5212'}>
            <Toggle checked={betaPlan} onChange={setBetaPlan} />
          </AboutRow>
          <AboutRow icon={Server} label={'\u7248\u672c\u9009\u62e9'}>
            <div className="flex items-center bg-foreground/[0.06] rounded-lg p-[2px]">
              <button
                onClick={() => setVersionChannel('rc')}
                className={`px-2.5 py-[3px] rounded-md text-[10px] transition-all ${
                  versionChannel === 'rc'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground/50 hover:text-foreground/70'
                }`}
              >
                {'\u9884\u89c8\u7248 (RC)'}
              </button>
              <button
                onClick={() => setVersionChannel('beta')}
                className={`px-2.5 py-[3px] rounded-md text-[10px] transition-all ${
                  versionChannel === 'beta'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground/50 hover:text-foreground/70'
                }`}
              >
                {'\u6d4b\u8bd5\u7248 (Beta)'}
              </button>
            </div>
          </AboutRow>
        </div>
      </SectionCard>

      {/* Links section */}
      <SectionCard>
        <div className="px-2">
          {ABOUT_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <div
                key={link.label}
                className="flex items-center justify-between gap-4 py-[5px]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon size={13} className="text-foreground/35 flex-shrink-0" />
                  <span className="text-[11px] text-foreground/75">{link.label}</span>
                </div>
                <button
                  onClick={() => handleLinkAction(link.label, link.action)}
                  className="px-2 py-[2px] rounded-md border border-border/30 text-[10px] text-foreground/45 hover:text-foreground/70 hover:bg-accent transition-colors flex-shrink-0"
                >
                  {link.action}
                </button>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Tech info card */}
      <SectionCard>
        <div className="px-2">
          <AboutRow icon={FileText} label={'\u5f00\u6e90\u534f\u8bae'}>
            <span className="text-[11px] text-foreground/50">Apache-2.0</span>
          </AboutRow>
          <AboutRow icon={Zap} label="Electron">
            <span className="text-[11px] text-foreground/50">v33.2.0</span>
          </AboutRow>
          <AboutRow icon={Globe2} label="Chromium">
            <span className="text-[11px] text-foreground/50">v130.0.6723.0</span>
          </AboutRow>
          <AboutRow icon={Command} label="Node.js">
            <span className="text-[11px] text-foreground/50">v20.18.1</span>
          </AboutRow>
        </div>
      </SectionCard>

      {/* Footer */}
      <div className="text-center pt-0.5 pb-1">
        <p className="text-[9px] text-foreground/30">{'\u00a9 2024-2026 Cherry Studio. All rights reserved.'}</p>
      </div>

      {/* Changelog Panel */}
      <AnimatePresence>
        {showChangelog && (
          <div className="fixed inset-0 z-[9998] flex items-center justify-center" onClick={() => setShowChangelog(false)}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative w-[480px] max-w-[85vw] max-h-[75vh] bg-background rounded-2xl shadow-2xl border border-border/50 flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Changelog header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-foreground/[0.06] flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Rss size={14} className="text-foreground/50" />
                  <h3 className="text-[13px] text-foreground/90" style={{ fontWeight: 500 }}>{'\u66f4\u65b0\u65e5\u5fd7'}</h3>
                </div>
                <button
                  onClick={() => setShowChangelog(false)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-foreground/35 hover:text-foreground/70 hover:bg-foreground/[0.06] transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Changelog body */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/20">
                {CHANGELOG_DATA.map((release, ri) => (
                  <div key={release.version}>
                    {/* Version header */}
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="text-[12px] text-foreground/85" style={{ fontWeight: 500 }}>{release.version}</span>
                      {release.tag && (
                        <span className="px-1.5 py-[1px] rounded-md bg-foreground/[0.06] text-[9px] text-foreground/60" style={{ fontWeight: 500 }}>{release.tag}</span>
                      )}
                      <span className="text-[9px] text-foreground/30 ml-auto flex items-center gap-1">
                        <Calendar size={9} />
                        {release.date}
                      </span>
                    </div>

                    {/* Changes list */}
                    <div className="space-y-[6px] pl-0.5">
                      {release.changes.map((change, ci) => {
                        const typeInfo = CHANGE_TYPE_MAP[change.type];
                        return (
                          <div key={ci} className="flex items-start gap-2">
                            <span className={`flex-shrink-0 mt-[1px] px-1.5 py-[1px] rounded text-[8px] ${typeInfo.bg} ${typeInfo.color}`} style={{ fontWeight: 500 }}>
                              {typeInfo.label}
                            </span>
                            <span className="text-[11px] text-foreground/65 leading-[16px]">{change.text}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Separator */}
                    {ri < CHANGELOG_DATA.length - 1 && (
                      <div className="mt-4 border-b border-foreground/[0.04]" />
                    )}
                  </div>
                ))}
              </div>

              {/* Changelog footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-foreground/[0.06] flex-shrink-0">
                <span className="text-[9px] text-foreground/30">{'\u5171'} {CHANGELOG_DATA.length} {'\u4e2a\u7248\u672c'}</span>
                <button
                  onClick={() => showToast('\u5df2\u5728\u6d4f\u89c8\u5668\u4e2d\u6253\u5f00\u5b8c\u6574\u66f4\u65b0\u65e5\u5fd7')}
                  className="flex items-center gap-1 px-2.5 py-[3px] rounded-lg border border-border/30 text-[10px] text-foreground/50 hover:text-foreground/70 hover:bg-accent transition-colors"
                >
                  <span>{'\u67e5\u770b\u5168\u90e8'}</span>
                  <ArrowUpRight size={9} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===========================
// Main Settings Page (Modal Window)
// ===========================
export function SettingsPage({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('home');

  const renderContent = () => {
    switch (activeSection) {
      case 'home': return <HomeSettings onNavigate={setActiveSection} />;
      case 'general': return null; // handled separately
      case 'shortcuts': return null; // handled separately
      case 'about': return <AboutPage />;
      case 'models': return null; // handled separately
      case 'default-model': return null; // handled separately
      case 'mcp': return null; // handled separately
      case 'data-settings': return null; // handled separately
      case 'api-gateway': return null; // handled separately
      case 'search': return null; // handled separately
      case 'documents': return null; // handled separately
      case 'memories': return null; // handled separately
      case 'quick-assistant': return null; // handled separately
      case 'selection-assistant': return null; // handled separately
      case 'quick-phrases': return null; // handled separately
      default: return null;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-[820px] max-w-[90vw] h-[600px] max-h-[85vh] bg-background rounded-2xl shadow-2xl border border-border/50 flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Body: sidebar + content */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <SettingsSidebar active={activeSection} onSelect={setActiveSection} onClose={onClose} />

          {/* Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden mr-2 mb-2 mt-2 ml-0 bg-foreground/[0.02] border border-foreground/[0.06] rounded-2xl">
            {activeSection === 'models' || activeSection === 'default-model' || activeSection === 'search' || activeSection === 'documents' || activeSection === 'memories' || activeSection === 'data-settings' || activeSection === 'api-gateway' || activeSection === 'shortcuts' || activeSection === 'selection-assistant' || activeSection === 'quick-assistant' || activeSection === 'quick-phrases' || activeSection === 'general' || activeSection === 'mcp' || activeSection === 'dashboard' ? (
              activeSection === 'models' ? <ModelServicePage />
                : activeSection === 'default-model' ? <DefaultModelSettingsPage />
                : activeSection === 'search' ? <WebSearchPage />
                : activeSection === 'documents' ? <DocumentServicePage />
                : activeSection === 'memories' ? <MemoriesPage />
                : activeSection === 'data-settings' ? <DataSettingsPage />
                : activeSection === 'api-gateway' ? <ApiGatewayPage />
                : activeSection === 'shortcuts' ? <ShortcutsPage />
                : activeSection === 'selection-assistant' ? <SelectionAssistantPage />
                : activeSection === 'quick-assistant' ? <QuickAssistantPage />
                : activeSection === 'quick-phrases' ? <QuickPhrasesPage />
                : activeSection === 'general' ? <GeneralSettingsPage />
                : activeSection === 'dashboard' ? <DashboardPage />
                : <MCPServicePage />
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-5 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/20">
                {renderContent()}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
