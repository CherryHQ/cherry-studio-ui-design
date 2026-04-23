import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, ChevronDown, ChevronRight, FolderPlus, Import, Rss, Pencil, Trash2, FolderOpen, MoreHorizontal } from 'lucide-react';
import { Tooltip } from '@/app/components/Tooltip';
import type { FolderNode, LibrarySidebarFilter } from '@/app/types';
import { RESOURCE_TYPES_LIST } from '@/app/config/constants';
import { Button, Input, ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from '@cherry-studio/ui';

interface Props {
  filter: LibrarySidebarFilter;
  onFilterChange: (f: LibrarySidebarFilter) => void;
  folders: FolderNode[];
  onImport: () => void;
  typeCounts?: Record<string, number>;
  onCreateFolder: (parentId?: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
}

export function LibrarySidebar({
  filter, onFilterChange, folders, onImport, typeCounts,
  onCreateFolder, onRenameFolder, onDeleteFolder,
}: Props) {
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const isActive = (f: LibrarySidebarFilter) => {
    if (filter.type === 'all' && f.type === 'all') return true;
    if (filter.type === 'resource' && f.type === 'resource') return filter.resourceType === f.resourceType;
    if (filter.type === 'folder' && f.type === 'folder') return filter.folderId === f.folderId;
    if (filter.type === 'tag' && f.type === 'tag') return filter.tagName === f.tagName;
    return false;
  };

  const itemCls = (f: LibrarySidebarFilter) =>
    `flex items-center gap-2 w-full px-2.5 py-[6px] rounded-lg text-sm transition-all cursor-pointer ${
      isActive(f) ? 'bg-accent/50 text-foreground' : 'text-muted-foreground/60 hover:text-foreground hover:bg-accent/50'
    }`;

  const handleStartRename = (id: string) => {
    const findName = (nodes: FolderNode[]): string => {
      for (const n of nodes) {
        if (n.id === id) return n.name;
        const found = findName(n.children);
        if (found) return found;
      }
      return '';
    };
    setRenameValue(findName(folders));
    setRenaming(id);
  };

  const handleRenameSubmit = () => {
    if (renaming && renameValue.trim()) {
      onRenameFolder(renaming, renameValue.trim());
    }
    setRenaming(null);
  };

  const handleDeleteFolder = (id: string) => {
    onDeleteFolder(id);
    if (filter.type === 'folder' && filter.folderId === id) {
      onFilterChange({ type: 'all' });
    }
  };

  return (
    <div className="w-[200px] flex-shrink-0 border-r border-border/15 flex flex-col min-h-0 bg-background/50">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <h2 className="text-sm text-foreground tracking-tight">资源库</h2>
        <p className="text-xs text-muted-foreground/50 mt-0.5">管理你的 AI 资源</p>
      </div>

      {/* Scrollable */}
      <div className="flex-1 overflow-y-auto px-2.5 pb-2 scrollbar-thin">
        {/* All */}
        <div className="mb-1">
          <Button variant="ghost" onClick={() => onFilterChange({ type: 'all' })} className={itemCls({ type: 'all' })}>
            <Layers size={12} strokeWidth={1.6} />
            <span className="flex-1 text-left">所有资源</span>
          </Button>
        </div>

        {/* Resource Types */}
        <div className="mb-3">
          {RESOURCE_TYPES_LIST.map(rt => (
            <Button variant="ghost" key={rt.id} onClick={() => onFilterChange({ type: 'resource', resourceType: rt.id })} className={itemCls({ type: 'resource', resourceType: rt.id })}>
              <rt.icon size={12} strokeWidth={1.6} />
              <span className="flex-1 text-left">{rt.label}</span>
              {typeCounts?.[rt.id] != null && (
                <span className="text-xs text-muted-foreground/50 tabular-nums">{typeCounts[rt.id]}</span>
              )}
            </Button>
          ))}
        </div>

      </div>

    </div>
  );
}

// ===========================
// Folder Item (recursive)
// ===========================

function FolderItem({ node, depth, filter, onFilterChange, itemCls, onRename, onDelete, onCreateSubfolder, renaming, renameValue, onRenameChange, onRenameSubmit }: {
  node: FolderNode; depth: number;
  filter: LibrarySidebarFilter; onFilterChange: (f: LibrarySidebarFilter) => void;
  itemCls: (f: LibrarySidebarFilter) => string;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
  onCreateSubfolder: (parentId: string) => void;
  renaming: string | null; renameValue: string; onRenameChange: (v: string) => void; onRenameSubmit: () => void;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = node.children.length > 0;
  const f: LibrarySidebarFilter = { type: 'folder', folderId: node.id };

  return (
    <div style={{ paddingLeft: depth * 10 }}>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="flex items-center group">
            {hasChildren ? (
              <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="w-4 h-4 flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground/50 flex-shrink-0 p-0">
                {open ? <ChevronDown size={9} /> : <ChevronRight size={9} />}
              </Button>
            ) : <div className="w-4" />}
            <Button variant="ghost" onClick={() => onFilterChange(f)} size="inline" className={`${itemCls(f)} flex-1 min-w-0 justify-start`}>
              <FolderOpen size={11} strokeWidth={1.6} />
              {renaming === node.id ? (
                <Input autoFocus value={renameValue} onChange={e => onRenameChange(e.target.value)}
                  onBlur={onRenameSubmit} onKeyDown={e => { if (e.key === 'Enter') onRenameSubmit(); if (e.key === 'Escape') { onRenameChange(''); onRenameSubmit(); } }}
                  onClick={e => e.stopPropagation()}
                  className="flex-1 bg-transparent outline-none text-xs min-w-0 h-auto border-none p-0 focus-visible:ring-0" />
              ) : (
                <span className="flex-1 text-left truncate">{node.name}</span>
              )}
              <MoreHorizontal size={9} className="opacity-0 group-hover:opacity-50 flex-shrink-0 cursor-pointer" />
            </Button>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => onRename(node.id)}>
            <Pencil size={14} /> 重命名
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onCreateSubfolder(node.id)}>
            <FolderPlus size={14} /> 新建子文件夹
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem variant="destructive" onClick={() => onDelete(node.id)}>
            <Trash2 size={14} /> 删除
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <AnimatePresence>
        {open && hasChildren && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            {node.children.map(c => (
              <FolderItem key={c.id} node={c} depth={depth + 1} filter={filter} onFilterChange={onFilterChange}
                itemCls={itemCls} onRename={onRename} onDelete={onDelete} onCreateSubfolder={onCreateSubfolder}
                renaming={renaming} renameValue={renameValue}
                onRenameChange={onRenameChange} onRenameSubmit={onRenameSubmit} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
