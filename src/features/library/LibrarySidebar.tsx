import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, ChevronDown, ChevronRight, FolderPlus, Import, Rss, Pencil, Trash2, FolderOpen, MoreHorizontal } from 'lucide-react';
import { Tooltip } from '@/app/components/Tooltip';
import type { FolderNode, LibrarySidebarFilter } from '@/app/types';
import { RESOURCE_TYPES_LIST } from '@/app/config/constants';

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
  const [folderCtx, setFolderCtx] = useState<{ id: string; x: number; y: number } | null>(null);
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
    `flex items-center gap-2 w-full px-2.5 py-[6px] rounded-lg text-[11px] transition-all cursor-pointer ${
      isActive(f) ? 'bg-accent/70 text-foreground' : 'text-muted-foreground/70 hover:text-foreground hover:bg-accent/35'
    }`;

  const handleFolderCtx = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setFolderCtx({ id, x: e.clientX, y: e.clientY });
  };

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
    setFolderCtx(null);
  };

  const handleRenameSubmit = () => {
    if (renaming && renameValue.trim()) {
      onRenameFolder(renaming, renameValue.trim());
    }
    setRenaming(null);
  };

  const handleDeleteFolder = () => {
    if (folderCtx) {
      onDeleteFolder(folderCtx.id);
      if (filter.type === 'folder' && filter.folderId === folderCtx.id) {
        onFilterChange({ type: 'all' });
      }
      setFolderCtx(null);
    }
  };

  return (
    <div className="w-[200px] flex-shrink-0 border-r border-border/15 flex flex-col min-h-0 bg-background/50">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <h2 className="text-[13px] text-foreground tracking-tight">资源库</h2>
        <p className="text-[9px] text-muted-foreground/50 mt-0.5">管理你的 AI 资源</p>
      </div>

      {/* Scrollable */}
      <div className="flex-1 overflow-y-auto px-2.5 pb-2 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full">
        {/* All */}
        <div className="mb-1">
          <button onClick={() => onFilterChange({ type: 'all' })} className={itemCls({ type: 'all' })}>
            <Layers size={12} strokeWidth={1.6} />
            <span className="flex-1 text-left">所有资源</span>
          </button>
        </div>

        {/* Resource Types */}
        <div className="mb-3">
          {RESOURCE_TYPES_LIST.map(rt => (
            <button key={rt.id} onClick={() => onFilterChange({ type: 'resource', resourceType: rt.id })} className={itemCls({ type: 'resource', resourceType: rt.id })}>
              <rt.icon size={12} strokeWidth={1.6} />
              <span className="flex-1 text-left">{rt.label}</span>
              {typeCounts?.[rt.id] != null && (
                <span className="text-[9px] text-muted-foreground/35 tabular-nums">{typeCounts[rt.id]}</span>
              )}
            </button>
          ))}
        </div>

        <div className="h-px bg-border/10 mx-1 mb-3" />

        {/* Folders */}
        <div className="mb-3">
          <div className="flex items-center gap-1 w-full px-2 py-1 group">
            <button onClick={() => setFoldersOpen(!foldersOpen)} className="flex items-center gap-1 text-[9px] text-muted-foreground/50 hover:text-muted-foreground/70 transition-colors flex-1">
              {foldersOpen ? <ChevronDown size={9} /> : <ChevronRight size={9} />}
              <span className="uppercase tracking-wider">文件夹</span>
            </button>
            <Tooltip content="创建文件夹" side="right"><button onClick={() => onCreateFolder()} className="text-muted-foreground/35 hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
              <FolderPlus size={10} />
            </button></Tooltip>
          </div>
          <AnimatePresence>
            {foldersOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                {folders.map(f => (
                  <FolderItem
                    key={f.id} node={f} depth={0}
                    filter={filter} onFilterChange={onFilterChange} itemCls={itemCls}
                    onContextMenu={handleFolderCtx}
                    renaming={renaming} renameValue={renameValue}
                    onRenameChange={setRenameValue} onRenameSubmit={handleRenameSubmit}
                    onCreateSubfolder={onCreateFolder}
                  />
                ))}
                {folders.length === 0 && (
                  <p className="text-[9px] text-muted-foreground/35 px-2.5 py-2 text-center">暂无文件夹</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom */}
      <div className="flex-shrink-0 border-t border-border/10 p-2.5 space-y-0.5">
        <button onClick={onImport} className="flex items-center gap-2 w-full px-2.5 py-[6px] rounded-lg text-[11px] text-muted-foreground/45 hover:text-foreground hover:bg-accent/35 transition-all">
          <Import size={12} strokeWidth={1.6} /><span>导入配置</span>
        </button>
        <button className="flex items-center gap-2 w-full px-2.5 py-[6px] rounded-lg text-[11px] text-muted-foreground/45 hover:text-foreground hover:bg-accent/35 transition-all">
          <Rss size={12} strokeWidth={1.6} /><span>订阅资源库</span>
        </button>
      </div>

      {/* Folder ctx menu */}
      <AnimatePresence>
        {folderCtx && (
          <div className="contents">
            <div className="fixed inset-0 z-[600]" onClick={() => setFolderCtx(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="fixed z-[601] bg-popover border border-border/30 rounded-xl shadow-xl p-1 min-w-[130px]"
              style={{ left: folderCtx.x, top: folderCtx.y }}
            >
              <button onClick={() => handleStartRename(folderCtx.id)}
                className="flex items-center gap-2 w-full px-2.5 py-[5px] rounded-md text-[10px] text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 transition-colors">
                <Pencil size={10} /> 重命名
              </button>
              <button onClick={() => { onCreateFolder(folderCtx.id); setFolderCtx(null); }}
                className="flex items-center gap-2 w-full px-2.5 py-[5px] rounded-md text-[10px] text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 transition-colors">
                <FolderPlus size={10} /> 新建子文件夹
              </button>
              <div className="h-px bg-border/15 my-0.5 mx-1" />
              <button onClick={handleDeleteFolder}
                className="flex items-center gap-2 w-full px-2.5 py-[5px] rounded-md text-[10px] text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                <Trash2 size={10} /> 删除
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===========================
// Folder Item (recursive)
// ===========================

function FolderItem({ node, depth, filter, onFilterChange, itemCls, onContextMenu, renaming, renameValue, onRenameChange, onRenameSubmit, onCreateSubfolder }: {
  node: FolderNode; depth: number;
  filter: LibrarySidebarFilter; onFilterChange: (f: LibrarySidebarFilter) => void;
  itemCls: (f: LibrarySidebarFilter) => string;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  renaming: string | null; renameValue: string; onRenameChange: (v: string) => void; onRenameSubmit: () => void;
  onCreateSubfolder: (parentId?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = node.children.length > 0;
  const f: LibrarySidebarFilter = { type: 'folder', folderId: node.id };

  return (
    <div style={{ paddingLeft: depth * 10 }}>
      <div className="flex items-center group" onContextMenu={e => onContextMenu(e, node.id)}>
        {hasChildren ? (
          <button onClick={() => setOpen(!open)} className="w-4 h-4 flex items-center justify-center text-muted-foreground/25 hover:text-muted-foreground/50 flex-shrink-0">
            {open ? <ChevronDown size={9} /> : <ChevronRight size={9} />}
          </button>
        ) : <div className="w-4" />}
        <button onClick={() => onFilterChange(f)} className={`${itemCls(f)} flex-1 min-w-0`}>
          <FolderOpen size={11} strokeWidth={1.6} />
          {renaming === node.id ? (
            <input autoFocus value={renameValue} onChange={e => onRenameChange(e.target.value)}
              onBlur={onRenameSubmit} onKeyDown={e => { if (e.key === 'Enter') onRenameSubmit(); if (e.key === 'Escape') { onRenameChange(''); onRenameSubmit(); } }}
              onClick={e => e.stopPropagation()}
              className="flex-1 bg-transparent outline-none text-[11px] min-w-0" />
          ) : (
            <span className="flex-1 text-left truncate">{node.name}</span>
          )}
          <MoreHorizontal size={9} className="opacity-0 group-hover:opacity-50 flex-shrink-0 cursor-pointer" onClick={e => onContextMenu(e, node.id)} />
        </button>
      </div>
      <AnimatePresence>
        {open && hasChildren && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            {node.children.map(c => (
              <FolderItem key={c.id} node={c} depth={depth + 1} filter={filter} onFilterChange={onFilterChange}
                itemCls={itemCls} onContextMenu={onContextMenu} renaming={renaming} renameValue={renameValue}
                onRenameChange={onRenameChange} onRenameSubmit={onRenameSubmit} onCreateSubfolder={onCreateSubfolder} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
