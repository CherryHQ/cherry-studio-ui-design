import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Trash2, X } from 'lucide-react';
import { Button } from '@cherrystudio/ui/components/primitives/button';
import { Dialog, DialogContent } from '@cherrystudio/ui/components/primitives/dialog';
import { useGlobalActions } from '@/app/context/GlobalActionContext';
import type {
  FolderNode, LibraryConfigView, LibrarySidebarFilter,
  ResourceItem, ResourceType, SortKey,
} from '@/app/types';
import { MOCK_FOLDERS, MOCK_RESOURCES, RESOURCE_TYPE_CONFIG } from '@/app/config/constants';
import { getUserSkills, useUserSkills } from '@/app/stores/userSkillsStore';
import { LibrarySidebar } from './LibrarySidebar';
import { ResourceGrid } from './ResourceGrid';
import { ImportModal } from './ImportModal';
import { SkillPluginImportModal } from './SkillPluginImportModal';
import { CreateSkillWithAgentDialog } from './CreateSkillWithAgentDialog';
import { SkillPluginDetail } from './SkillPluginDetail';
import { AssistantConfig } from '@/features/assistant/AssistantConfig';
import { AgentConfig } from '@/features/agent/AgentConfig';
import { useRecycleBin, type RecycleBinItemType } from "@/app/context/RecycleBinContext";
import { RecycleBinConfirmDialog } from "@/app/components/shared/RecycleBinConfirmDialog";
import { TemplateBrowsePage } from "./TemplateBrowsePage";
import { PromptEditPage } from "./PromptEditPage";
import { buildTags, findFolder } from "./helpers";

// ===========================
// Main Library Page
// ===========================

export function LibraryPage() {
  const { libraryEditResourceId: initialEditResourceId, libraryCreateType: initialCreateType, libraryReturn: onReturn, navigateToMarket } = useGlobalActions();
  const userSkills = useUserSkills();
  const [resources, setResources] = useState<ResourceItem[]>(() => {
    const seed = MOCK_RESOURCES.filter(r => r.type !== 'plugin');
    return [...getUserSkills(), ...seed];
  });

  // Merge in any user skills created while the library was unmounted
  // (e.g. via the agent's "保存为 Skill" flow). De-dupes by id.
  useEffect(() => {
    setResources(prev => {
      const known = new Set(prev.map(r => r.id));
      const newOnes = userSkills.filter(s => !known.has(s.id));
      return newOnes.length === 0 ? prev : [...newOnes, ...prev];
    });
  }, [userSkills]);
  const folders: FolderNode[] = MOCK_FOLDERS;

  const [configView, setConfigView] = useState<LibraryConfigView>({ type: 'list' });
  // Default landing: open on the first resource type ("Skill") instead of
  // mixing every type together. Users switch via the left sidebar.
  const [sidebarFilter, setSidebarFilter] = useState<LibrarySidebarFilter>({ type: 'resource', resourceType: 'skill' });
  const [templateBrowse, setTemplateBrowse] = useState<'skill' | 'assistant' | null>(null);

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [importOpen, setImportOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<ResourceItem | null>(null);

  // Skill/Plugin import modal
  const [spImportOpen, setSpImportOpen] = useState(false);
  const [aiSkillOpen, setAiSkillOpen] = useState(false);
  const [spImportType, setSpImportType] = useState<'skill' | 'plugin'>('skill');

  // Tag filter (separate from sidebar filter) — multi-select.
  const [activeTags, setActiveTags] = useState<Set<string>>(() => new Set());
  const toggleTag = useCallback((name: string) => {
    setActiveTags(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  }, []);
  const clearTags = useCallback(() => setActiveTags(new Set()), []);

  // Type filter (toolbar). Null = no implicit filter — let the left sidebar
  // drive resource-type selection.
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
    if (activeTags.size > 0) {
      list = list.filter(r => r.tags.some(t => activeTags.has(t)));
    }
    // Optional toolbar-driven type filter (left sidebar is the primary one)
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
  }, [resources, sidebarFilter, activeTags, activeType, search, sortKey, folders]);


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
    setActiveTags(prev => {
      if (!prev.has(tagName)) return prev;
      const next = new Set(prev);
      next.delete(tagName);
      return next;
    });
  }, []);

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
    if (r.type === 'prompt') setConfigView({ type: 'prompt-edit', resource: r });
    else if (r.type === 'agent') setConfigView({ type: 'agent-config', resource: r });
    else if (r.type === 'assistant') setConfigView({ type: 'assistant-config', resource: r });
    else setConfigView({ type: 'skill-plugin-detail', resource: r });
  }, []);

  const handleDuplicate = useCallback((r: ResourceItem) => {
    const now = new Date().toISOString();
    setResources(prev => [{ ...r, id: `res-dup-${Date.now()}`, name: `${r.name} (副本)`, createdAt: now, updatedAt: now }, ...prev]);
  }, []);

  const { moveToBin: moveToRecycleBin, retentionDays: recycleRetentionDays } = useRecycleBin();

  const resourceTypeToBinType = (t: ResourceType): RecycleBinItemType | null => {
    if (t === 'agent') return 'agent';
    if (t === 'assistant') return 'assistant';
    if (t === 'skill') return 'skill';
    if (t === 'prompt') return 'prompt';
    // 'plugin' is a legacy ResourceType not exposed in the new product —
    // it just gets hard-deleted without recycle bin entry.
    return null;
  };

  const handleDelete = useCallback((r: ResourceItem) => setDeleteConfirm(r), []);

  const confirmDelete = useCallback(() => {
    if (!deleteConfirm) return;
    const r = deleteConfirm;
    setResources(prev => prev.filter(x => x.id !== r.id));
    setDeleteConfirm(null);
    if (configView.type !== 'list') setConfigView({ type: 'list' });

    const binType = resourceTypeToBinType(r.type);
    if (binType) {
      moveToRecycleBin(
        {
          id: `bin-${binType}-${r.id}-${Date.now()}`,
          type: binType,
          name: r.name,
          icon: r.avatar,
          meta: r.author ?? '资源库',
          source: 'manual',
        },
        {
          onUndo: () => setResources(prev => [r, ...prev]),
        },
      );
    }
  }, [deleteConfirm, configView, moveToRecycleBin]);

  const handleToggle = useCallback((id: string) => {
    setResources(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  }, []);

  const handleCreateResource = useCallback((type: ResourceType) => {
    if (type === 'skill') {
      setSpImportType('skill');
      setSpImportOpen(true);
      return;
    }
    const now = new Date().toISOString();
    const nameMap: Record<string, string> = { agent: '新智能体', assistant: '新助手', prompt: '新 Prompt' };
    const avatarMap: Record<string, string> = { agent: '\uD83E\uDD16', assistant: '\uD83D\uDCAC', prompt: '\uD83D\uDCDD' };
    const newRes: ResourceItem = {
      id: `res-new-${Date.now()}`, type,
      name: nameMap[type] || '新资源',
      description: type === 'prompt' ? '' : '点击编辑配置...',
      avatar: avatarMap[type] || '\uD83D\uDCDD',
      model: type !== 'prompt' ? 'GPT-4o' : undefined,
      content: type === 'prompt' ? '' : undefined,
      tags: [], createdAt: now, updatedAt: now, enabled: true,
    };
    setResources(prev => [newRes, ...prev]);
    if (type === 'prompt') setConfigView({ type: 'prompt-edit', resource: newRes });
    else if (type === 'agent') setConfigView({ type: 'agent-config', resource: newRes });
    else if (type === 'assistant') setConfigView({ type: 'assistant-config', resource: newRes });
  }, []);

  const handleImportComplete = useCallback((resource: ResourceItem) => {
    setResources(prev => [resource, ...prev]);
    setSpImportOpen(false);
    setConfigView({ type: 'skill-plugin-detail', resource });
  }, []);

  const handleMoveToFolder = useCallback((resourceId: string, folderId: string | undefined) => {
    setResources(prev => prev.map(r => r.id === resourceId ? { ...r, folderId } : r));
  }, []);

  // Installed resource names (for template installed indicator)
  const installedNames = useMemo(() => new Set(resources.map(r => r.name)), [resources]);

  // ===========================
  // Render
  // ===========================

  if (templateBrowse) {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="template-browse" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col min-h-0 bg-background">
          <TemplateBrowsePage
            resourceType={templateBrowse}
            installedNames={installedNames}
            onBack={() => setTemplateBrowse(null)}
            onUse={(item) => {
              const now = new Date().toISOString();
              const newRes: ResourceItem = {
                id: `res-tpl-${Date.now()}`, type: templateBrowse,
                name: item.name,
                description: item.description,
                avatar: item.avatar || item.icon || '📦',
                tags: item.tags?.slice(0, 2) || [],
                createdAt: now, updatedAt: now, enabled: true,
              };
              setResources(prev => [newRes, ...prev]);
            }}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  // All resource config pages render inside a single centered modal
  // (Dialog) overlaying the library list. The list view stays mounted
  // underneath so closing the modal returns straight to the same
  // browsing state. See `ConfigDialog` below.
  return (
    <div className="flex-1 flex min-h-0 bg-background">
      <LibrarySidebar
        filter={sidebarFilter}
        onFilterChange={f => { setSidebarFilter(f); setActiveTag(null); }}
        typeCounts={typeCounts}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <ResourceGrid
          resources={filtered}
          sortKey={sortKey} search={search}
          onSearchChange={setSearch} onSortKeyChange={setSortKey}
          onEdit={handleEdit} onDuplicate={handleDuplicate} onDelete={handleDelete}
          onCreate={handleCreateResource}
          folders={folders} onMoveToFolder={handleMoveToFolder}
          tags={scopedTags} activeTags={activeTags} onToggleTag={toggleTag} onClearTags={clearTags}
          onAddTag={handleAddTag} onDeleteTag={handleDeleteTag}
          allTagNames={allTagNames} onUpdateResourceTags={handleUpdateResourceTags}
          activeType={activeType} onTypeFilter={setActiveType} typeCounts={typeCounts}
          onBrowseTemplates={navigateToMarket}
          onCreateSkillWithAgent={() => setAiSkillOpen(true)}
        />
      </div>

      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
      <SkillPluginImportModal
        open={spImportOpen} importType={spImportType}
        onClose={() => setSpImportOpen(false)} onImportComplete={handleImportComplete}
      />
      <CreateSkillWithAgentDialog
        open={aiSkillOpen}
        onClose={() => setAiSkillOpen(false)}
        onComplete={(resource) => {
          setResources(prev => [resource, ...prev]);
          setAiSkillOpen(false);
          setConfigView({ type: 'skill-plugin-detail', resource });
        }}
      />

      {/* Move-to-recycle-bin confirm — iOS-style minimal alert. */}
      <RecycleBinConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}
        retentionDays={recycleRetentionDays}
        onConfirm={() => confirmDelete()}
      />

      {/* Resource config modal — sized to sit inside the app shell
          (not full viewport). Provides the unified avatar + name +
          close-X header on top; the embedded editor renders inside
          with `inModal={true}` so it strips its own redundant
          breadcrumb / back / cancel chrome. The 两栏 (sidebar +
          content) layout comes from the editors themselves. */}
      {/* modal={false}: keeps the focus trap off the outer dialog so that
          nested wizards (e.g. EmailAuthWizard from the agent 协作 tab)
          can actually receive keystrokes in their own inputs. Outside
          clicks no longer auto-dismiss — explicit X / ESC instead. */}
      <Dialog
        modal={false}
        open={configView.type !== 'list'}
        onOpenChange={(open) => { if (!open) handleConfigBack(); }}
      >
        <DialogContent
          showCloseButton={false}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          // Defaults shipped by DialogContent (`sm:max-w-lg`, `p-6`,
          // `grid gap-4`) all need explicit `!` overrides to lose;
          // the flex column + min-w-0 lets the embedded editors
          // flow naturally inside.
          // Compact in-app modal — fits inside the app shell with
          // generous margin and prefers width slightly over height so
          // the dense Assistant / Agent forms breathe.
          className="!max-w-[760px] sm:!max-w-[760px] !w-[min(760px,84vw)] !h-[min(520px,72vh)] !max-h-[72vh] !rounded-2xl !p-0 !gap-0 !grid-cols-1 overflow-hidden border border-border/20 shadow-xl flex flex-col"
        >
          {configView.type !== 'list' && (() => {
            const r = configView.resource;
            const cfg = RESOURCE_TYPE_CONFIG[r.type];
            const TypeIcon = cfg.icon;
            return (
              <div className="flex items-center gap-3 px-5 h-14 border-b border-border/15 flex-shrink-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${cfg.color}`}>
                  {r.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">{r.name}</span>
                    <span className="inline-flex items-center gap-1 flex-shrink-0 px-1.5 py-px rounded text-[10px] leading-none border border-border/30 bg-muted/40 text-muted-foreground/80 font-normal">
                      <TypeIcon size={9} />
                      {cfg.label}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleConfigBack}
                  aria-label="关闭"
                  className="text-muted-foreground/50 hover:text-foreground hover:bg-accent/40 flex-shrink-0"
                >
                  <X size={14} />
                </Button>
              </div>
            );
          })()}

          <div className="flex-1 min-h-0 flex">
            {configView.type === 'prompt-edit' && (
              <PromptEditPage
                key={configView.resource.id}
                resource={configView.resource}
                onBack={handleConfigBack}
                inModal
                onSave={(updates) => {
                  setResources(prev => prev.map(r => r.id === configView.resource.id ? { ...r, ...updates } : r));
                  setConfigView({ type: 'list' });
                }}
              />
            )}
            {configView.type === 'assistant-config' && (
              <AssistantConfig
                key={configView.resource.id}
                resource={configView.resource}
                onBack={handleConfigBack}
                inModal
              />
            )}
            {configView.type === 'agent-config' && (
              <AgentConfig
                key={configView.resource.id}
                resource={configView.resource}
                onBack={handleConfigBack}
                inModal
              />
            )}
            {configView.type === 'skill-plugin-detail' && (
              <SkillPluginDetail
                key={configView.resource.id}
                resource={configView.resource}
                onBack={handleConfigBack}
                onToggle={handleToggle}
                onDelete={handleDelete}
                inModal
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
