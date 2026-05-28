import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Puzzle, Layers, Database, Globe } from 'lucide-react';
import { Sidebar } from './layout/Sidebar';
import { TabBar } from './layout/TabBar';
import { TabContextMenu, FloatingWindow, NewTabDialog, SearchDialog, DragGhost, AnnotationProvider, AnnotationOverlay, AnnotationToggle, AnnotationList } from '@cherry-studio/ui';
import { MainContent } from './MainContent';
import {
  menuItems, getLayout,
  dialogAppIcons, dialogFilterTabs,
  newTabHistoryItems, newTabFileItems, dialogQuickActions, newTabHtmlPreviews,
  searchFilterTabs, searchRecentItems, searchFileItems, searchQuickActions,
  MOCK_RESOURCES,
} from '@/app/config/constants';

// Agent-produced HTML artifacts (reports, summaries, dashboards) appear as
// additional launcher tiles in the NewTabDialog grid. Clicking one opens the
// artifact in a new top-bar tab (see handleDialogCreateTab). All artifact
// tiles share a single generic icon — they're typed by being artifacts, not
// by their topic — so the visual scan reads as one bucket.
const ArtifactTileIcon: React.ElementType = (props: { size?: number; strokeWidth?: number; className?: string }) =>
  <Globe size={props.size} strokeWidth={props.strokeWidth ?? 1.6} className={props.className} />;

const dialogAppIconsWithAgents = [
  ...dialogAppIcons,
  ...Object.entries(newTabHtmlPreviews).map(([key, preview]) => ({
    id: `html:${key}`,
    label: preview.label,
    icon: ArtifactTileIcon,
    color: 'text-accent-violet',
    bg: 'bg-accent-violet/15',
  })),
];
import type { Tab, MenuItem, ContextMenuState } from '@/app/types';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { SettingsProvider, useSettings } from '@/app/context/SettingsContext';
import { GlobalActionProvider } from '@/app/context/GlobalActionContext';
import type { GlobalActions } from '@/app/context/GlobalActionContext';
import { RecycleBinProvider } from '@/app/context/RecycleBinContext';
import { ArchiveProvider } from '@/app/context/ArchiveContext';
import { Toaster, toast } from 'sonner';
import { DataMigrationOverlay } from './DataMigrationOverlay';
import { initGlobalErrorHandler } from '@/app/services/errorHandler';
import { useTabs } from '@/app/hooks/useTabs';
import { useFloatingWindows } from '@/app/hooks/useFloatingWindows';
import { useTabDrag } from '@/app/hooks/useTabDrag';
import { CollabProvider, useCollab } from '@/features/collaboration/CollabContext';
import { UserInfoPopup } from '@/features/collaboration/components/UserInfoPopup';
import { usePinnedArtifacts, findPinnedArtifact } from '@/app/stores/sharedArtifactsStore';

// ===========================
// Main UI
// ===========================
function CherryStudioInner() {
  const { resolvedTheme, updateSetting } = useSettings();
  const isDark = resolvedTheme === 'dark';
  const [sidebarWidth, setSidebarWidth] = useState(170);
  const [activeItem, setActiveItem] = useState('chat');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsInitialSection, setSettingsInitialSection] = useState<string | undefined>();
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ open: false, x: 0, y: 0, tabId: '' });
  const [hoverVisible, setHoverVisible] = useState(false);
  const [newTabDialogOpen, setNewTabDialogOpen] = useState(false);
  const [newTabSearch, setNewTabSearch] = useState('');
  const [newTabManageMode, setNewTabManageMode] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  // Library is intentionally NOT hidden — it's now the home of custom
  // resource management (assistants / agents / skills / prompts / etc.)
  // after main moved "管理我的资源" out of the Market page. Without a
  // visible Library entry in the sidebar, users have no way to reach
  // their resources and the recycle-bin delete flow is unreachable.
  const [hiddenApps, setHiddenApps] = useState<Set<string>>(new Set(['explore', 'knowledge', 'file', 'code', 'note', 'extensions']));
  const [appOrder, setAppOrder] = useState<string[]>(() => dialogAppIconsWithAgents.map(a => a.id));

  // Runtime-pinned HTML artifacts (from ArtifactViewer's "Pin 到工作台").
  // Appended to the static launchpad tiles. Persists via localStorage.
  const pinnedArtifacts = usePinnedArtifacts();
  const launchpadTiles = useMemo(() => [
    ...dialogAppIconsWithAgents,
    ...pinnedArtifacts.map(a => ({
      id: `html:pinned:${a.id}`,
      label: a.label,
      icon: ArtifactTileIcon,
      color: 'text-accent-violet',
      bg: 'bg-accent-violet/15',
    })),
  ], [pinnedArtifacts]);
  const [annotationListOpen, setAnnotationListOpen] = useState(false);
  const [showMigration, setShowMigration] = useState(false);

  // Surface annotation persistence failures (quota exceeded, etc.) so the
  // user knows their comment wasn't actually saved — previously this failed
  // silently, leaving "ghost" annotations the Agent couldn't read.
  useEffect(() => {
    const onStorageError = (e: Event) => {
      const detail = (e as CustomEvent<{ reason?: string }>).detail;
      if (detail?.reason === 'quota') {
        toast.error('批注未能保存：本地存储已满', {
          description: '请删除部分批注或减少附图，再尝试保存。',
        });
      } else {
        toast.error('批注保存失败');
      }
    };
    window.addEventListener('annotation-storage-error', onStorageError);
    return () => window.removeEventListener('annotation-storage-error', onStorageError);
  }, []);

  const [libraryEditResourceId, setLibraryEditResourceId] = useState<string | null>(null);
  const [libraryCreateType, setLibraryCreateType] = useState<'agent' | 'assistant' | null>(null);
  const [libraryReturnTo, setLibraryReturnTo] = useState<string | null>(null);

  // --- Extracted hooks ---
  const {
    tabs, setTabs, activeTabId, setActiveTabId,
    handleCloseTab, createTabForMenuItem,
    handleOpenMiniApp, handlePinTab, handleTabTitleChange,
    handleDockToSidebar, handleUndockFromSidebar, dockedTabs,
  } = useTabs();

  const {
    detachedWindows, handleDetachTab, handleReattach, handleCloseWindow,
  } = useFloatingWindows();

  const {
    dragGhost, sidebarContainerRef, startTabDrag, startSidebarDrag,
  } = useTabDrag();

  // ===========================
  // Sync sidebar highlight with active tab
  // ===========================
  useEffect(() => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab?.menuItemId) {
      setActiveItem(tab.menuItemId);
    } else if (tab?.id === 'home') {
      setActiveItem('');
    }
  }, [activeTabId, tabs]);

  // ===========================
  // Library navigation
  // ===========================
  const handleEditAssistantInLibrary = useCallback((assistantName: string) => {
    const resource = MOCK_RESOURCES.find(r => r.name === assistantName && (r.type === 'assistant' || r.type === 'agent'));
    setLibraryEditResourceId(resource?.id || null);
    navigateToMenuTab('library');
  }, [tabs]);

  const handleNavigateToLibrary = useCallback((createType?: 'agent' | 'assistant') => {
    if (createType) {
      setLibraryCreateType(createType);
      setLibraryReturnTo(createType === 'assistant' ? 'chat' : 'agent');
    }
    navigateToMenuTab('library');
  }, [tabs]);

  const handleLibraryReturn = useCallback(() => {
    const returnTo = libraryReturnTo;
    setLibraryCreateType(null);
    setLibraryReturnTo(null);
    if (returnTo) {
      setActiveItem(returnTo);
      const existing = tabs.find(t => t.menuItemId === returnTo);
      if (existing) setActiveTabId(existing.id);
    }
  }, [libraryReturnTo, tabs]);

  const handleNavigateToKnowledge = useCallback((kbName: string) => {
    navigateToMenuTab('knowledge');
  }, [tabs]);

  // Helper: navigate to a single-instance menu tab
  const navigateToMenuTab = useCallback((menuItemId: string) => {
    setActiveItem(menuItemId);
    const existing = tabs.find(t => t.menuItemId === menuItemId);
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      createTabForMenuItem(menuItemId);
    }
  }, [tabs, createTabForMenuItem]);

  // Clear library state when navigating away
  useEffect(() => {
    const currentTab = tabs.find(t => t.id === activeTabId);
    if (currentTab?.menuItemId !== 'library') {
      if (libraryEditResourceId) setLibraryEditResourceId(null);
      if (libraryCreateType) setLibraryCreateType(null);
      if (libraryReturnTo) setLibraryReturnTo(null);
    }
  }, [activeTabId, tabs, libraryEditResourceId, libraryCreateType, libraryReturnTo]);

  // ===========================
  // Sidebar item filtering
  // ===========================
  const managedIds = new Set(appOrder);
  const orderedVisible = appOrder
    .filter(id => !hiddenApps.has(id))
    .map(id => menuItems.find(m => m.id === id))
    .filter((m): m is MenuItem => !!m);
  // launchpad never shows in the sidebar — it's reached only via the
  // tab-bar "+" button. empty-preview is a dev-only surface.
  const unmanagedItems = menuItems.filter(m => !managedIds.has(m.id) && m.id !== 'empty-preview' && m.id !== 'launchpad');
  const visibleMenuItems = [...orderedVisible, ...unmanagedItems];

  // ===========================
  // Sidebar & dialog handlers
  // ===========================
  const handleSidebarItemClick = useCallback((menuItemId: string) => {
    setActiveItem(menuItemId);
    const existing = tabs.find(t => t.menuItemId === menuItemId);
    if (existing && !['chat', 'agent'].includes(menuItemId)) {
      setActiveTabId(existing.id);
    } else {
      createTabForMenuItem(menuItemId);
    }
    setHoverVisible(false);
  }, [tabs, createTabForMenuItem]);

  const handleDialogCreateTab = (menuItemId: string) => {
    // `html:<key>` tiles open the Agent-produced HTML artifact in a new
    // full-content tab (more room than a modal). If a tab for the same
    // artifact already exists, focus it instead of duplicating.
    if (menuItemId.startsWith('html:')) {
      const key = menuItemId.slice('html:'.length);
      // Two flavors of html-preview keys:
      //   "pinned:<id>"  → runtime-pinned artifact (look up in store)
      //   "<staticKey>"  → entry in newTabHtmlPreviews const
      let title: string;
      if (key.startsWith('pinned:')) {
        const artifact = findPinnedArtifact(key.slice('pinned:'.length));
        if (!artifact) { setNewTabDialogOpen(false); return; }
        title = artifact.label;
      } else {
        const preview = newTabHtmlPreviews[key];
        if (!preview) { setNewTabDialogOpen(false); return; }
        title = preview.title;
      }
      const existing = tabs.find(t => t.htmlPreviewKey === key);
      if (existing) {
        setActiveTabId(existing.id);
      } else {
        const newId = `html-${key}-${Date.now()}`;
        setTabs(prev => [...prev, {
          id: newId,
          title,
          icon: Globe,
          closeable: true,
          htmlPreviewKey: key,
        }]);
        setActiveTabId(newId);
      }
      setNewTabDialogOpen(false);
      return;
    }
    // 'agent:<id>' tiles are user-created agent shortcuts — open the
    // agent tab. (Pre-selecting the specific agent would need extra
    // plumbing; routing to the agent surface is the design intent.)
    if (menuItemId.startsWith('agent:')) menuItemId = 'agent';
    setActiveItem(menuItemId);
    const existing = tabs.find(t => t.menuItemId === menuItemId);
    if (existing && !['chat', 'agent'].includes(menuItemId)) {
      setActiveTabId(existing.id);
    } else {
      createTabForMenuItem(menuItemId);
    }
    setNewTabDialogOpen(false);
  };

  // ===========================
  // Drag callbacks (bridge hooks)
  // ===========================
  const onStartTabDrag = useCallback((e: React.MouseEvent, tabId: string) => {
    startTabDrag(e, tabId, {
      onDockToSidebar: handleDockToSidebar,
      onDetachTab: (tid, x, y) => {
        handleDetachTab(tid, x, y, tabs, (remaining) => {
          setTabs(prev => prev.filter(t => t.id !== tid));
          const closeable = remaining.filter(t => t.closeable);
          if (closeable.length > 0) setActiveTabId(closeable[closeable.length - 1].id);
          else if (remaining.length > 0) setActiveTabId(remaining[0].id);
        });
      },
    });
  }, [tabs, startTabDrag, handleDockToSidebar, handleDetachTab]);

  const onStartSidebarDrag = useCallback((e: React.MouseEvent, tabId: string) => {
    startSidebarDrag(e, tabId, { onUndockFromSidebar: handleUndockFromSidebar });
  }, [startSidebarDrag, handleUndockFromSidebar]);

  const onReattach = useCallback((win: typeof detachedWindows[0]) => {
    const newTab = handleReattach(win);
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, [handleReattach]);

  // ===========================
  // GlobalActionContext value
  // ===========================
  // iPhone-style sidebar pinning: functions toggle via `hiddenApps`
  // (already exists); mini-apps and artifacts get placeholder toasts for
  // now — full sidebar rendering of those kinds is the next step.
  const pinToSidebar = useCallback((kind: 'function' | 'miniapp' | 'artifact', id: string, label?: string) => {
    if (kind === 'function') {
      setHiddenApps(prev => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success(`已固定到侧边栏：${label ?? id}`);
    } else {
      toast(`已固定到侧边栏：${label ?? id}`, { description: '即将在下一版本中真正出现在侧边栏' });
    }
  }, []);

  const unpinFromSidebar = useCallback((kind: 'function' | 'miniapp' | 'artifact', id: string) => {
    if (kind === 'function') {
      setHiddenApps(prev => {
        if (prev.has(id)) return prev;
        return new Set([...prev, id]);
      });
    }
  }, []);

  const openLaunchpad = useCallback(() => {
    setActiveItem('launchpad');
    const existing = tabs.find(t => t.menuItemId === 'launchpad');
    if (existing) setActiveTabId(existing.id);
    else createTabForMenuItem('launchpad');
  }, [tabs, createTabForMenuItem, setActiveTabId]);

  // Tiles the user has explicitly removed from the launchpad — keyed as
  // `${kind}:${id}` (e.g. `miniapp:gemini`, `artifact:roadmap`). Filtered
  // out of the launchpad grids in LaunchpadPage.
  const [removedFromLaunchpad, setRemovedFromLaunchpad] = useState<Set<string>>(new Set());

  const removeFromLaunchpad = useCallback((kind: 'miniapp' | 'artifact', id: string) => {
    setRemovedFromLaunchpad(prev => {
      const next = new Set(prev);
      next.add(`${kind}:${id}`);
      return next;
    });
  }, []);

  const globalActions = useMemo<GlobalActions>(() => ({
    openMiniApp: handleOpenMiniApp,
    pinTab: handlePinTab,
    editAssistantInLibrary: handleEditAssistantInLibrary,
    navigateToKnowledge: handleNavigateToKnowledge,
    navigateToLibrary: handleNavigateToLibrary,
    libraryReturn: handleLibraryReturn,
    changeTabTitle: handleTabTitleChange,
    openSettings: (section?: string) => { setSettingsInitialSection(section); setSettingsOpen(true); },
    launchpadOpen: handleDialogCreateTab,
    pinToSidebar,
    unpinFromSidebar,
    openLaunchpad,
    removeFromLaunchpad,
    libraryEditResourceId,
    libraryCreateType,
    removedFromLaunchpad,
  }), [
    handleOpenMiniApp, handlePinTab, handleEditAssistantInLibrary,
    handleNavigateToKnowledge, handleNavigateToLibrary, handleLibraryReturn,
    handleTabTitleChange, handleDialogCreateTab,
    pinToSidebar, unpinFromSidebar, openLaunchpad, removeFromLaunchpad,
    libraryEditResourceId, libraryCreateType, removedFromLaunchpad,
  ]);

  // ===========================
  // Render
  // ===========================
  return (
    <GlobalActionProvider value={globalActions}>
      <AnnotationProvider page={settingsOpen ? 'settings' : activeItem} boundarySelector="body" appName="cherry-studio">
      <div className="flex items-center justify-center h-screen w-full bg-muted dark:bg-background p-6 relative">
        {/* Dev: Empty State Preview — outside app window */}
        <button
          onClick={() => navigateToMenuTab('empty-preview')}
          className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1 py-3 rounded-l-lg bg-foreground/10 border border-border/30 border-r-0 text-muted-foreground/40 hover:text-foreground hover:bg-foreground/20 hover:px-1.5 transition-all"
          title="Empty State Preview"
        >
          <Layers size={11} />
          <span className="text-[10px] [writing-mode:vertical-rl]">Empty</span>
        </button>
        {/* Dev: Data Migration Demo — outside app window */}
        <button
          onClick={() => setShowMigration(true)}
          className="absolute right-0 top-1/2 translate-y-4 flex items-center gap-1 px-1 py-3 rounded-l-lg bg-foreground/10 border border-border/30 border-r-0 text-muted-foreground/40 hover:text-foreground hover:bg-foreground/20 hover:px-1.5 transition-all"
          title="Data Migration Demo"
        >
          <Database size={11} />
          <span className="text-[10px] [writing-mode:vertical-rl]">Migration</span>
        </button>
        <div id="cherry-app-root" className="flex flex-col w-full h-full max-w-[1440px] max-h-[900px] bg-sidebar text-foreground rounded-2xl border border-border overflow-hidden shadow-2xl relative">
          <TabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onTabClick={setActiveTabId}
            onTabClose={handleCloseTab}
            onTabContext={(e, tabId) => {
              e.preventDefault();
              setContextMenu({ open: true, x: e.clientX, y: e.clientY, tabId });
            }}
            onNewTab={() => navigateToMenuTab('launchpad')}
            onManageShortcuts={() => { setNewTabSearch(''); setNewTabManageMode(true); setNewTabDialogOpen(true); }}
            startTabDrag={onStartTabDrag}
          />

          <div className="flex flex-1 min-h-0">
            <div ref={sidebarContainerRef} className="flex-shrink-0 h-full">
              <Sidebar
                width={sidebarWidth}
                setWidth={setSidebarWidth}
                activeItem={activeItem}
                onItemClick={handleSidebarItemClick}
                onHoverChange={setHoverVisible}
                onSearchClick={() => setSearchDialogOpen(true)}
                onSettingsClick={() => setSettingsOpen(true)}
                items={visibleMenuItems}
                activeMiniAppTabs={tabs.filter(t => t.miniAppId && !t.sidebarDocked)}
                activeTabId={activeTabId}
                onMiniAppTabClick={(tabId) => setActiveTabId(tabId)}
                dockedTabs={dockedTabs}
                onUndockTab={handleUndockFromSidebar}
                onStartSidebarDrag={onStartSidebarDrag}
                onCloseDockedTab={handleCloseTab}
                isDark={isDark}
                onToggleTheme={() => updateSetting('theme', isDark ? 'light' : 'dark')}
              />
            </div>

            <div className={`flex-1 flex flex-col min-w-0 min-h-0 pr-2 pb-2 ${getLayout(sidebarWidth) === 'hidden' ? 'pl-2' : ''}`}>
              <div className="flex-1 bg-content-bg border border-content-border rounded-xl overflow-hidden flex flex-col min-h-0 relative">
                <MainContent tabs={tabs} activeTabId={activeTabId || 'home'} />
              </div>
            </div>
          </div>

          {dragGhost && (
            <DragGhost
              tabId={dragGhost.tabId}
              x={dragGhost.x}
              y={dragGhost.y}
              overSidebar={dragGhost.overSidebar}
              tabs={tabs}
            />
          )}

          {detachedWindows.map(win => (
            <FloatingWindow
              key={win.id}
              win={win}
              onClose={handleCloseWindow}
              onReattach={onReattach}
            />
          ))}

          {hoverVisible && getLayout(sidebarWidth) === 'hidden' && (
            <Sidebar
              isFloating
              onClose={() => setHoverVisible(false)}
              width={sidebarWidth}
              setWidth={setSidebarWidth}
              activeItem={activeItem}
              onItemClick={handleSidebarItemClick}
              onHoverChange={setHoverVisible}
              onSearchClick={() => setSearchDialogOpen(true)}
              onSettingsClick={() => { setSettingsOpen(true); setHoverVisible(false); }}
              items={visibleMenuItems}
              activeMiniAppTabs={tabs.filter(t => t.miniAppId && !t.sidebarDocked)}
              activeTabId={activeTabId}
              onMiniAppTabClick={(tabId) => setActiveTabId(tabId)}
              dockedTabs={dockedTabs}
              onUndockTab={handleUndockFromSidebar}
              onStartSidebarDrag={onStartSidebarDrag}
              onCloseDockedTab={handleCloseTab}
              isDark={isDark}
              onToggleTheme={() => updateSetting('theme', isDark ? 'light' : 'dark')}
            />
          )}
        </div>

        <TabContextMenu
          state={contextMenu}
          tab={tabs.find(t => t.id === contextMenu.tabId)}
          onPin={handlePinTab}
          onClose={handleCloseTab}
          onDock={(tabId) => {
            const t = tabs.find(tt => tt.id === tabId);
            if (t?.sidebarDocked) handleUndockFromSidebar(tabId);
            else handleDockToSidebar(tabId);
          }}
          onDismiss={() => setContextMenu(prev => ({ ...prev, open: false }))}
        />

        <NewTabDialog
          open={newTabDialogOpen}
          search={newTabSearch}
          onSearchChange={setNewTabSearch}
          onSelect={handleDialogCreateTab}
          onClose={() => { setNewTabDialogOpen(false); setNewTabManageMode(false); }}
          hiddenApps={hiddenApps}
          setHiddenApps={setHiddenApps}
          appOrder={appOrder}
          setAppOrder={setAppOrder}
          dialogAppIcons={launchpadTiles}
          dialogFilterTabs={dialogFilterTabs}
          newTabHistoryItems={newTabHistoryItems}
          newTabFileItems={newTabFileItems}
          dialogQuickActions={dialogQuickActions}
          initialManageMode={newTabManageMode}
        />

        <SearchDialog
          open={searchDialogOpen}
          onClose={() => setSearchDialogOpen(false)}
          searchFilterTabs={searchFilterTabs}
          searchRecentItems={searchRecentItems}
          searchFileItems={searchFileItems}
          searchQuickActions={searchQuickActions}
        />


        <SettingsPage
          open={settingsOpen}
          onClose={() => { setSettingsOpen(false); setSettingsInitialSection(undefined); }}
          initialSection={settingsInitialSection}
        />

        <AnnotationOverlay />
        <AnnotationToggle
          onToggleList={() => setAnnotationListOpen(v => !v)}
          listOpen={annotationListOpen}
        />
        <AnnotationList open={annotationListOpen} onClose={() => setAnnotationListOpen(false)} />

        {showMigration && (
          <DataMigrationOverlay onComplete={() => setShowMigration(false)} />
        )}
      </div>
      </AnnotationProvider>
    </GlobalActionProvider>
  );
}

export function CherryStudio() {
  React.useEffect(() => {
    initGlobalErrorHandler();
  }, []);

  return (
    <SettingsProvider>
      <RecycleBinProvider>
        <ArchiveProvider>
          <CollabProvider>
            <CherryStudioInner />
            <UserInfoPopupHost />
            {/* Radix Dialog sets body { pointer-events: none } while open;
                Sonner's portal-rendered toast inherits that and becomes
                visible-but-unclickable. Force pointer-events back on at the
                container + each toast so undo actions work inside Settings. */}
            <Toaster
              position="bottom-right"
              richColors
              closeButton
              className="pointer-events-auto"
              toastOptions={{ className: 'pointer-events-auto' }}
            />
          </CollabProvider>
        </ArchiveProvider>
      </RecycleBinProvider>
    </SettingsProvider>
  );
}

/** Mounts the user-info popup at the top level so any component can trigger it via context. */
function UserInfoPopupHost() {
  const { userInfoOpen, closeUserInfo, boundEmail, setBoundEmail } = useCollab();
  return (
    <UserInfoPopup
      open={userInfoOpen}
      onClose={closeUserInfo}
      boundEmail={boundEmail}
      onBindEmail={(email) => setBoundEmail(email)}
      onUnbind={() => setBoundEmail(null)}
    />
  );
}