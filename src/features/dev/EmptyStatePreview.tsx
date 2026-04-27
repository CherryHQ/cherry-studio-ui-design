import React, { useState } from 'react';
import { EmptyState, Button } from '@cherry-studio/ui';
import type { EmptyStatePreset, EmptyStateLocale } from '@cherry-studio/ui';

// Group presets by module for navigation
const MODULES: { id: string; label: string; presets: { preset: EmptyStatePreset; module: string }[] }[] = [
  {
    id: 'chat',
    label: '聊天',
    presets: [
      { preset: 'no-chat', module: 'ChatPage' },
      { preset: 'no-topic', module: 'TopicHistoryPage' },
      { preset: 'no-session', module: 'SessionHistoryPage' },
    ],
  },
  {
    id: 'model',
    label: '模型',
    presets: [
      { preset: 'no-model', module: 'ImagePage / TranslatePage' },
      { preset: 'no-api-key', module: 'ApiGatewayPage' },
    ],
  },
  {
    id: 'resource',
    label: '资源库',
    presets: [
      { preset: 'no-assistant', module: 'LibraryPage' },
      { preset: 'no-agent', module: 'LibraryPage' },
      { preset: 'no-resource', module: 'LibraryPage' },
      { preset: 'no-favorite', module: 'FavoritesDrawer' },
    ],
  },
  {
    id: 'knowledge',
    label: '知识库',
    presets: [
      { preset: 'no-knowledge', module: 'KnowledgePage' },
      { preset: 'no-datasource', module: 'DataSourceList' },
    ],
  },
  {
    id: 'file',
    label: '文件',
    presets: [
      { preset: 'no-file', module: 'FilePage' },
      { preset: 'no-folder', module: 'LibrarySidebar' },
      { preset: 'no-note', module: 'NotePage' },
    ],
  },
  {
    id: 'painting',
    label: '创作',
    presets: [
      { preset: 'no-image', module: 'ImagePage' },
    ],
  },
  {
    id: 'translate',
    label: '翻译',
    presets: [
      { preset: 'no-translate', module: 'TranslatePage' },
      { preset: 'no-history', module: 'TranslatePage' },
    ],
  },
  {
    id: 'settings',
    label: '设置',
    presets: [
      { preset: 'no-action', module: 'QuickAssistantPage' },
      { preset: 'no-phrase', module: 'QuickPhrasesPage' },
      { preset: 'no-search-engine', module: 'WebSearchPage' },
      { preset: 'no-stats', module: 'DashboardPage' },
    ],
  },
  {
    id: 'common',
    label: '通用',
    presets: [
      { preset: 'no-result', module: '(search/filter)' },
      { preset: 'no-miniapp', module: 'MiniAppsPage' },
      { preset: 'no-code-tool', module: 'CodeToolPage' },
      { preset: 'no-tag', module: 'LibrarySidebar' },
    ],
  },
];

// noop handler for preview — just to trigger preset actionLabel display
const noop = () => {};

export function EmptyStatePreview() {
  const [activeModule, setActiveModule] = useState(MODULES[0].id);
  const [locale, setLocale] = useState<EmptyStateLocale>('zh');
  const [compact, setCompact] = useState(false);

  const currentModule = MODULES.find(m => m.id === activeModule) || MODULES[0];

  return (
    <div className="flex h-full min-h-0 bg-content-bg">
      {/* Sidebar nav */}
      <div className="w-[140px] flex-shrink-0 border-r border-section-border flex flex-col">
        <div className="px-3 pt-4 pb-2 flex-shrink-0">
          <p className="text-xs text-muted-foreground font-medium">Empty State</p>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-3 scrollbar-thin-xs space-y-[1px]">
          {MODULES.map(mod => {
            const isActive = activeModule === mod.id;
            return (
              <Button
                key={mod.id}
                variant="ghost"
                size="inline"
                onClick={() => setActiveModule(mod.id)}
                className={`w-full justify-start gap-2 px-3 py-[6px] rounded-lg text-sm relative ${
                  isActive
                    ? 'bg-cherry-active-bg text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-lg border border-cherry-active-border pointer-events-none" />
                )}
                <span>{mod.label}</span>
                <span className="ml-auto text-xs text-muted-foreground/40">{mod.presets.length}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-section-border flex-shrink-0">
          <h2 className="text-sm font-medium text-foreground">{currentModule.label}</h2>
          <span className="text-xs text-muted-foreground/40">{currentModule.presets.length} presets</span>
          <div className="flex-1" />

          {/* Locale toggle */}
          <div className="flex items-center border border-border/30 rounded-md overflow-hidden">
            {(['zh', 'en', 'ja'] as const).map(l => (
              <Button
                key={l}
                variant="ghost"
                size="inline"
                onClick={() => setLocale(l)}
                className={`px-2 py-[2px] rounded-none text-xs transition-colors ${
                  locale === l ? 'bg-accent text-foreground' : 'text-muted-foreground/50 hover:text-foreground'
                }`}
              >
                {l.toUpperCase()}
              </Button>
            ))}
          </div>

          {/* Compact toggle */}
          <div className="flex items-center border border-border/30 rounded-md overflow-hidden">
            <Button
              variant="ghost"
              size="inline"
              onClick={() => setCompact(false)}
              className={`px-2.5 py-[2px] rounded-none text-xs transition-colors ${
                !compact ? 'bg-accent text-foreground' : 'text-muted-foreground/50 hover:text-foreground'
              }`}
            >
              Full
            </Button>
            <Button
              variant="ghost"
              size="inline"
              onClick={() => setCompact(true)}
              className={`px-2.5 py-[2px] rounded-none text-xs transition-colors ${
                compact ? 'bg-accent text-foreground' : 'text-muted-foreground/50 hover:text-foreground'
              }`}
            >
              Compact
            </Button>
          </div>
        </div>

        {/* Preview grid */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          <div className={compact ? 'grid grid-cols-3 gap-3' : 'grid grid-cols-2 gap-4'}>
            {currentModule.presets.map(({ preset, module }) => (
              <div
                key={preset}
                className="border border-section-border rounded-2xl overflow-hidden flex flex-col bg-sidebar"
              >
                {/* Card header */}
                <div className="flex items-center justify-between px-3.5 py-2 border-b border-section-border/50">
                  <code className="text-xs text-foreground font-mono">{preset}</code>
                  <span className="text-xs text-muted-foreground/40">{module}</span>
                </div>
                {/* EmptyState render */}
                <div className={compact ? 'min-h-[180px] flex' : 'min-h-[360px] flex'}>
                  <EmptyState
                    preset={preset}
                    locale={locale}
                    compact={compact}
                    onAction={noop}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
