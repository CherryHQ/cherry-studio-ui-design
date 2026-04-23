import React, { useState, useEffect, useMemo } from 'react';
import type { Tab } from '@/app/types';
import { useGlobalActions } from '@/app/context/GlobalActionContext';
import { ErrorBoundary } from '@cherry-studio/ui';
import { ChatPage } from '@/features/chat/ChatPage';
import { GenericPage } from '@/features/chat/GenericPage';
import { TranslatePage } from '@/features/translate/TranslatePage';
import { NotePage } from '@/features/note/NotePage';
import { CodeToolPage } from '@/features/codetool/CodeToolPage';
import { KnowledgePage } from '@/features/knowledge/KnowledgePage';
import { MiniAppsPage } from '@/features/miniapp/MiniAppsPage';
import { MiniAppEmbedPage } from '@/features/miniapp/MiniAppEmbedPage';
import { ExplorePage } from '@/features/explore/ExplorePage';
import { LibraryPage } from '@/features/library/LibraryPage';
import { AgentRunPage } from '@/features/agent/run/AgentRunPage';
import { AssistantRunPage } from '@/app/components/assistant/AssistantRunPage';
import { ImagePage } from '@/features/painting/ImagePage';
import { FilePage } from '@/features/file/FilePage';
import { ModelServicePage } from '@/app/components/settings/ModelServicePage';
import { ExtensionsPage } from '@/features/extensions/ExtensionsPage';

interface MainContentProps {
  tabs: Tab[];
  activeTabId: string;
}

/**
 * Keep-Alive MainContent: once a tab is activated, its component stays mounted in the DOM.
 * Switching tabs only toggles CSS display, preserving scroll position, input state, etc.
 * All action callbacks are sourced from GlobalActionContext (no prop drilling).
 */
export function MainContent({ tabs, activeTabId }: MainContentProps) {
  // Track which tab IDs have been activated at least once (lazy mount)
  const [mountedTabIds, setMountedTabIds] = useState<Set<string>>(() => new Set([activeTabId]));

  useEffect(() => {
    if (activeTabId) {
      setMountedTabIds(prev => {
        if (prev.has(activeTabId)) return prev;
        const next = new Set(prev);
        next.add(activeTabId);
        return next;
      });
    }
  }, [activeTabId]);

  // Clean up mounted ids when tabs are removed
  const tabIdSet = useMemo(() => new Set(tabs.map(t => t.id)), [tabs]);
  useEffect(() => {
    setMountedTabIds(prev => {
      const next = new Set<string>();
      prev.forEach(id => { if (tabIdSet.has(id)) next.add(id); });
      if (tabIdSet.has('home')) next.add('home');
      if (next.size !== prev.size) return next;
      return prev;
    });
  }, [tabIdSet]);

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Regular tabs - keep-alive with display toggle */}
      {tabs.filter(t => t.id !== 'home' && mountedTabIds.has(t.id)).map(tab => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            className="absolute inset-0 flex flex-col"
            style={{ display: isActive ? 'flex' : 'none' }}
          >
            <TabContent tab={tab} isActive={isActive} />
          </div>
        );
      })}
    </div>
  );
}

/**
 * Renders the appropriate page component for a given tab.
 * Uses GlobalActionContext for all cross-cutting callbacks.
 * Wrapped in React.memo to prevent re-renders of hidden tabs.
 */
const TabContent = React.memo(function TabContent({ tab, isActive }: { tab: Tab; isActive: boolean }) {
  const actions = useGlobalActions();
  const menuItemId = tab.menuItemId;

  return (
    <ErrorBoundary>
      {menuItemId === 'chat' ? <AssistantRunPage />
        : menuItemId === 'agent' ? <AgentRunPage />
        : menuItemId === 'models' ? <ModelServicePage />
        : menuItemId === 'painting' ? <ImagePage />
        : menuItemId === 'translate' ? <TranslatePage />
        : menuItemId === 'note' ? <NotePage />
        : menuItemId === 'code' ? <CodeToolPage />
        : menuItemId === 'knowledge' ? <KnowledgePage />
        : menuItemId === 'explore' ? <ExplorePage />
        : menuItemId === 'library' ? <LibraryPage />
        : menuItemId === 'file' ? <FilePage />
        : menuItemId === 'miniapp' ? <MiniAppsPage />
        : menuItemId === 'extensions' ? <ExtensionsPage />
        : tab.miniAppId ? <MiniAppEmbedPage tab={tab} />
        : <GenericPage tab={tab} />
      }
    </ErrorBoundary>
  );
});