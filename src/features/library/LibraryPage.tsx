import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGlobalActions } from '@/app/context/GlobalActionContext';
import type { ResourceItem, FolderNode, TagItem, LibrarySidebarFilter, LibraryConfigView, ResourceType } from '@/app/types';
import type { ViewMode, SortKey } from '@/app/types';
import { MOCK_RESOURCES, MOCK_FOLDERS, TAG_COLORS, DEFAULT_TAG_COLOR } from '@/app/config/constants';
import { LibrarySidebar } from './LibrarySidebar';
import { ResourceGrid } from './ResourceGrid';
import { ImportModal } from './ImportModal';
import { SkillPluginImportModal } from './SkillPluginImportModal';
import { SkillPluginDetail } from './SkillPluginDetail';
import { AssistantConfig } from '@/app/components/assistant/AssistantConfig';
import { AgentConfig } from '@/app/components/agent/AgentConfig';

// ===========================
// Helpers
// ===========================

function findFolder(nodes: FolderNode[], id: string): FolderNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findFolder(n.children, id);
    if (found) return found;
  }
  return null;
}

function buildTags(resources: ResourceItem[], filterType?: ResourceType): TagItem[] {
  const tagMap = new Map<string, number>();
  const list = filterType ? resources.filter(r => r.type === filterType) : resources;
  list.forEach(r => r.tags.forEach(t => tagMap.set(t, (tagMap.get(t) || 0) + 1)));
  return Array.from(tagMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count], i) => ({
      id: `tag-${i}`,
      name,
      color: TAG_COLORS[name] || DEFAULT_TAG_COLOR,
      count,
    }));
}

// Folder tree helpers
function addFolderToTree(nodes: FolderNode[], parentId: string | undefined, newFolder: FolderNode): FolderNode[] {
  if (!parentId) return [...nodes, newFolder];
  return nodes.map(n => {
    if (n.id === parentId) return { ...n, children: [...n.children, newFolder] };
    return { ...n, children: addFolderToTree(n.children, parentId, newFolder) };
  });
}

function renameFolderInTree(nodes: FolderNode[], id: string, name: string): FolderNode[] {
  return nodes.map(n => {
    if (n.id === id) return { ...n, name };
    return { ...n, children: renameFolderInTree(n.children, id, name) };
  });
}

function deleteFolderFromTree(nodes: FolderNode[], id: string): FolderNode[] {
  return nodes.filter(n => n.id !== id).map(n => ({ ...n, children: deleteFolderFromTree(n.children, id) }));
}

// ===========================
// Main Library Page
// ===========================

export function LibraryPage() {
  const { libraryEditResourceId: initialEditResourceId, libraryCreateType: initialCreateType, libraryReturn: onReturn } = useGlobalActions();
  const [resources, setResources] = useState<ResourceItem[]>(MOCK_RESOURCES);
  const [folders, setFolders] = useState<FolderNode[]>(MOCK_FOLDERS);

  const [configView, setConfigView] = useState<LibraryConfigView>({ type: 'list' });
  const [sidebarFilter, setSidebarFilter] = useState<LibrarySidebarFilter>({ type: 'all' });

  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [importOpen, setImportOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<ResourceItem | null>(null);

  // Skill/Plugin import modal
  const [spImportOpen, setSpImportOpen] = useState(false);
  const [spImportType, setSpImportType] = useState<'skill' | 'plugin'>('skill');

  // Tag filter (separate from sidebar filter)
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Type filter (toolbar, separate from sidebar)
  const [activeType, setActiveType] = useState<ResourceType | null>(null);

  // Track whether we came from external create (to enable return navigation)
  const [returnOnClose, setReturnOnClose] = useState(false);

  // Auto-open config when navigated from chat page edit
  const prevEditId = useRef<string | null>(null);
  useEffect(() => {
    if (initialEditResourceId && initialEditResourceId !== prevEditId.current) {
      prevEditId.current = initialEditResourceId;
      const target = resources.find(r => r.id === initialEditResourceId);
      if (target) {
        if (target.type === 'agent') setConfigView({ type: 'agent-config', resource: target });
        else if (target.type === 'assistant') setConfigView({ type: 'assistant-config', resource: target });
        else setConfigView({ type: 'skill-plugin-detail', resource: target });
      }
    }
  }, [initialEditResourceId, resources]);

  // Auto-create agent when navigated from agent run page with createType
  const prevCreateType = useRef<string | null>(null);
  useEffect(() => {
    if (initialCreateType && initialCreateType !== prevCreateType.current) {
      prevCreateType.current = initialCreateType;
      setReturnOnClose(true);
      const now = new Date().toISOString();
      const newRes: ResourceItem = {
        id: `res-new-${Date.now()}`, type: initialCreateType === 'assistant' ? 'assistant' : 'agent',
        name: initialCreateType === 'assistant' ? '新助手' : '新智能体',
        description: '点击编辑配置...',
        avatar: initialCreateType === 'assistant' ? '\uD83D\uDCAC' : '\uD83E\uDD16',
        model: 'GPT-4o',
        tags: [], createdAt: now, updatedAt: now, enabled: true,
      };
      setResources(prev => [newRes, ...prev]);
      setConfigView({ type: initialCreateType === 'assistant' ? 'assistant-config' : 'agent-config', resource: newRes });
    }
  }, [initialCreateType]);

  // Handle config back — if we came from external create, return to origin
  const handleConfigBack = useCallback(() => {
    setConfigView({ type: 'list' });
    if (returnOnClose && onReturn) {
      setReturnOnClose(false);
      onReturn();
    }
  }, [returnOnClose, onReturn]);

  // Derived data
  const activeResourceType = sidebarFilter.type === 'resource' ? sidebarFilter.resourceType : undefined;
  const scopedTags = useMemo(() => buildTags(resources, activeResourceType), [resources, activeResourceType]);
  const typeCounts = useMemo(() => {
    const c: Record<string, number> = {};
    resources.forEach(r => { c[r.type] = (c[r.type] || 0) + 1; });
    return c;
  }, [resources]);

  // Filter & sort
  const filtered = useMemo(() => {
    let list = resources;
    if (sidebarFilter.type === 'resource') {
      list = list.filter(r => r.type === sidebarFilter.resourceType);
    } else if (sidebarFilter.type === 'folder') {
      const collectIds = (node: FolderNode): string[] => [node.id, ...node.children.flatMap(collectIds)];
      const folder = findFolder(folders, sidebarFilter.folderId);
      if (folder) {
        const ids = new Set(collectIds(folder));
        list = list.filter(r => r.folderId && ids.has(r.folderId));
      }
    } else if (sidebarFilter.type === 'tag') {
      list = list.filter(r => r.tags.includes(sidebarFilter.tagName));
    }
    // Apply tag filter from top bar
    if (activeTag) {
      list = list.filter(r => r.tags.includes(activeTag));
    }
    // Apply type filter from top bar
    if (activeType) {
      list = list.filter(r => r.type === activeType);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name, 'zh');
      if (sortKey === 'createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [resources, sidebarFilter, activeTag, activeType, search, sortKey, folders]);

  // ===========================
  // Folder Management
  // ===========================

  const handleCreateFolder = useCallback((parentId?: string) => {
    const newFolder: FolderNode = { id: `f-${Date.now()}`, name: '新文件夹', children: [] };
    setFolders(prev => addFolderToTree(prev, parentId, newFolder));
  }, []);

  const handleRenameFolder = useCallback((id: string, name: string) => {
    setFolders(prev => renameFolderInTree(prev, id, name));
  }, []);

  const handleDeleteFolder = useCallback((id: string) => {
    setFolders(prev => deleteFolderFromTree(prev, id));
    // Unassign resources from deleted folder
    setResources(prev => prev.map(r => r.folderId === id ? { ...r, folderId: undefined } : r));
  }, []);

  // ===========================
  // Tag Management
  // ===========================

  const handleAddTag = useCallback((tagName: string) => {
    setActiveTag(tagName);
  }, []);

  const handleDeleteTag = useCallback((tagName: string) => {
    setResources(prev => prev.map(r => ({
      ...r,
      tags: r.tags.filter(t => t !== tagName),
    })));
    if (activeTag === tagName) setActiveTag(null);
  }, [activeTag]);

  // Collect all unique tag names across all resources
  const allTagNames = useMemo(() => {
    const s = new Set<string>();
    resources.forEach(r => r.tags.forEach(t => s.add(t)));
    return Array.from(s).sort((a, b) => a.localeCompare(b, 'zh'));
  }, [resources]);

  const handleUpdateResourceTags = useCallback((resourceId: string, tags: string[]) => {
    setResources(prev => prev.map(r => r.id === resourceId ? { ...r, tags, updatedAt: new Date().toISOString() } : r));
  }, []);

  // ===========================
  // Resource Handlers
  // ===========================

  const handleEdit = useCallback((r: ResourceItem) => {
    if (r.type === 'agent') setConfigView({ type: 'agent-config', resource: r });
    else if (r.type === 'assistant') setConfigView({ type: 'assistant-config', resource: r });
    else setConfigView({ type: 'skill-plugin-detail', resource: r });
  }, []);

  const handleDuplicate = useCallback((r: ResourceItem) => {
    const now = new Date().toISOString();
    setResources(prev => [{ ...r, id: `res-dup-${Date.now()}`, name: `${r.name} (副本)`, createdAt: now, updatedAt: now }, ...prev]);
  }, []);

  const handleDelete = useCallback((r: ResourceItem) => setDeleteConfirm(r), []);

  const confirmDelete = useCallback(() => {
    if (deleteConfirm) {
      setResources(prev => prev.filter(x => x.id !== deleteConfirm.id));
      setDeleteConfirm(null);
      if (configView.type !== 'list') setConfigView({ type: 'list' });
    }
  }, [deleteConfirm, configView]);

  const handleToggle = useCallback((id: string) => {
    setResources(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  }, []);

  const handleCreateResource = useCallback((type: ResourceType) => {
    if (type === 'skill' || type === 'plugin') {
      setSpImportType(type);
      setSpImportOpen(true);
      return;
    }
    const now = new Date().toISOString();
    const newRes: ResourceItem = {
      id: `res-new-${Date.now()}`, type,
      name: type === 'agent' ? '新智能体' : '新助手',
      description: '点击编辑配置...',
      avatar: type === 'agent' ? '\uD83E\uDD16' : '\uD83D\uDCAC',
      model: 'GPT-4o',
      tags: [], createdAt: now, updatedAt: now, enabled: true,
    };
    setResources(prev => [newRes, ...prev]);
    if (type === 'agent') setConfigView({ type: 'agent-config', resource: newRes });
    else setConfigView({ type: 'assistant-config', resource: newRes });
  }, []);

  const handleImportComplete = useCallback((resource: ResourceItem) => {
    setResources(prev => [resource, ...prev]);
    setSpImportOpen(false);
    setConfigView({ type: 'skill-plugin-detail', resource });
  }, []);

  const handleMoveToFolder = useCallback((resourceId: string, folderId: string | undefined) => {
    setResources(prev => prev.map(r => r.id === resourceId ? { ...r, folderId } : r));
  }, []);

  // ===========================
  // Render
  // ===========================

  if (configView.type === 'assistant-config') {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="assistant" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col min-h-0 bg-background">
          <AssistantConfig resource={configView.resource} onBack={handleConfigBack} />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (configView.type === 'agent-config') {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="agent" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col min-h-0 bg-background">
          <AgentConfig resource={configView.resource} onBack={handleConfigBack} />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (configView.type === 'skill-plugin-detail') {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="sp-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col min-h-0 bg-background">
          <SkillPluginDetail
            resource={configView.resource}
            onBack={handleConfigBack}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="flex-1 flex min-h-0 bg-background">
      <LibrarySidebar
        filter={sidebarFilter}
        onFilterChange={f => { setSidebarFilter(f); setActiveTag(null); }}
        folders={folders}
        onImport={() => setImportOpen(true)}
        typeCounts={typeCounts}
        onCreateFolder={handleCreateFolder}
        onRenameFolder={handleRenameFolder}
        onDeleteFolder={handleDeleteFolder}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <ResourceGrid
          resources={filtered}
          viewMode={viewMode} sortKey={sortKey} search={search}
          onSearchChange={setSearch} onViewModeChange={setViewMode} onSortKeyChange={setSortKey}
          onEdit={handleEdit} onDuplicate={handleDuplicate} onDelete={handleDelete}
          onToggle={handleToggle} onCreate={handleCreateResource}
          folders={folders} onMoveToFolder={handleMoveToFolder}
          tags={scopedTags} activeTag={activeTag} onTagFilter={setActiveTag}
          onAddTag={handleAddTag} onDeleteTag={handleDeleteTag}
          allTagNames={allTagNames} onUpdateResourceTags={handleUpdateResourceTags}
          activeType={activeType} onTypeFilter={setActiveType} typeCounts={typeCounts}
        />
      </div>

      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
      <SkillPluginImportModal
        open={spImportOpen} importType={spImportType}
        onClose={() => setSpImportOpen(false)} onImportComplete={handleImportComplete}
      />

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-popover rounded-2xl border border-border/30 p-5 w-[320px] shadow-2xl">
              <h3 className="text-[13px] text-foreground mb-2">确认删除</h3>
              <p className="text-[11px] text-muted-foreground/60 mb-4">确定要删除「{deleteConfirm.name}」吗？此操作无法撤销。</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 rounded-lg text-[11px] text-muted-foreground/60 hover:text-foreground hover:bg-accent/40 transition-colors">取消</button>
                <button onClick={confirmDelete} className="px-3 py-1.5 rounded-lg text-[11px] bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">删除</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
