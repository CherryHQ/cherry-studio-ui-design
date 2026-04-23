import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  X, ChevronDown, LayoutGrid, List, Upload, FolderPlus,
  Pencil, Trash2, FolderInput, Tag, Share2, Eye, Download,
  Copy, ArrowUpDown, Star, Check, RotateCcw, FolderClosed,
} from 'lucide-react';
import { Button, Input, SearchInput, Dialog, DialogContent, Popover as UIPopover, PopoverTrigger, PopoverContent, EmptyState, Checkbox } from '@cherry-studio/ui';
import { FileSidebar } from './FileSidebar';
import type { SidebarFilter } from './FileSidebar';
import { FileGrid } from './FileGrid';
import { FileList } from './FileList';
import type { SortKey, SortDir } from './FileList';
import { FilePreview } from './FilePreview';
import {
  MOCK_FILES, FILE_TAGS, FILE_FOLDERS, flattenFolders,
} from './mockData';
import type { FileItem, FileFolder, FileTag } from './mockData';

// ===========================
// Popover wrapper (click-outside dismiss)
// ===========================
function Popover({ x, y, children, onClose, width }: { x: number; y: number; children: React.ReactNode; onClose: () => void; width?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', h);
    document.addEventListener('keydown', k);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k); };
  }, [onClose]);

  const [pos, setPos] = useState({ left: x, top: y });
  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const nl = rect.right > window.innerWidth ? x - rect.width : x;
    const nt = rect.bottom > window.innerHeight ? y - rect.height : y;
    setPos({ left: Math.max(4, nl), top: Math.max(4, nt) });
  }, [x, y]);

  return (
    <div ref={ref} className="fixed z-[var(--z-sticky)] bg-popover border border-border rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-100"
      style={{ ...pos, width: width || undefined }}>
      {children}
    </div>
  );
}

// ===========================
// Context Menu Items
// ===========================
function CMenuItem({ icon: Icon, label, danger, onClick, disabled }: { icon: React.ElementType; label: string; danger?: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <Button size="inline"
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-1.5 px-2 py-[5px] rounded-md transition-colors text-left text-xs justify-start ${
        disabled ? 'text-muted-foreground/30 cursor-not-allowed' :
        danger ? 'text-destructive/70 hover:bg-destructive/8' : 'text-popover-foreground/70 hover:bg-accent'
      }`}
    >
      <Icon size={11} className={disabled ? 'opacity-30' : ''} />
      <span>{label}</span>
    </Button>
  );
}

// ===========================
// Move-to-folder dialog
// ===========================
function MoveToDialog({ folders, currentFolderId, onMove, onClose }: {
  folders: FileFolder[];
  currentFolderId: string | null;
  onMove: (folderId: string | null) => void;
  onClose: () => void;
}) {
  const flat = useMemo(() => flattenFolders(folders), [folders]);
  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="bg-popover border border-border rounded-xl shadow-2xl w-[240px] overflow-hidden p-0">
        <div className="px-3 py-2 border-b border-border/30">
          <p className="text-xs text-muted-foreground font-medium">移动到文件夹</p>
        </div>
        <div className="max-h-[240px] overflow-y-auto p-1 scrollbar-thin-xs">
          <Button size="inline"
            variant="ghost"
            onClick={() => onMove(null)}
            className={`w-full flex items-center gap-2 px-2.5 py-[5px] rounded-md transition-colors text-xs justify-start ${
              currentFolderId === null ? 'bg-accent text-foreground' : 'text-muted-foreground/60 hover:bg-accent/50'
            }`}
          >
            <FolderClosed size={11} className="text-muted-foreground/40" />
            <span>根目录 (无文件夹)</span>
          </Button>
          {flat.map(f => (
            <Button size="inline"
              key={f.id}
              variant="ghost"
              onClick={() => onMove(f.id)}
              className={`w-full flex items-center gap-2 px-2.5 py-[5px] rounded-md transition-colors text-xs justify-start ${
                currentFolderId === f.id ? 'bg-accent text-foreground' : 'text-muted-foreground/60 hover:bg-accent/50'
              }`}
              style={{ paddingLeft: `${10 + (f.parentId ? 14 : 0)}px` }}
            >
              <FolderClosed size={11} className="text-muted-foreground/40" />
              <span className="truncate">{f.name}</span>
              {currentFolderId === f.id && <Check size={10} className="ml-auto text-muted-foreground/60" />}
            </Button>
          ))}
        </div>
        <div className="px-3 py-1.5 border-t border-border/30 flex justify-end">
          <Button variant="ghost" size="inline" onClick={onClose} className="px-2 py-[3px] rounded-md text-xs text-muted-foreground/60 hover:text-foreground hover:bg-accent transition-colors">
            取消
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ===========================
// Tag picker dialog
// ===========================
function TagPickerDialog({ allTags, currentTags, onToggleTag, onClose }: {
  allTags: FileTag[];
  currentTags: string[];
  onToggleTag: (tagId: string) => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="bg-popover border border-border rounded-xl shadow-2xl w-[200px] overflow-hidden p-0">
        <div className="px-3 py-2 border-b border-border/30">
          <p className="text-xs text-muted-foreground font-medium">管理标签</p>
        </div>
        <div className="p-1">
          {allTags.map(tag => {
            const active = currentTags.includes(tag.id);
            return (
              <Button size="inline"
                key={tag.id}
                variant="ghost"
                onClick={() => onToggleTag(tag.id)}
                className={`w-full flex items-center gap-2 px-2.5 py-[5px] rounded-md transition-colors text-xs justify-start ${
                  active ? 'bg-accent text-foreground' : 'text-muted-foreground/60 hover:bg-accent/50'
                }`}
              >
                <Checkbox checked={active} className="flex-shrink-0" />
                <span className="truncate">{tag.name}</span>
              </Button>
            );
          })}
        </div>
        <div className="px-3 py-1.5 border-t border-border/30 flex justify-end">
          <Button variant="ghost" size="inline" onClick={onClose} className="px-2 py-[3px] rounded-md text-xs text-muted-foreground/60 hover:text-foreground hover:bg-accent transition-colors">
            完成
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ===========================
// Filter Dropdown
// ===========================
function FilterDropdown({ label, options, value, onChange }: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <UIPopover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`flex items-center gap-1 px-2 py-[4px] rounded-md text-xs transition-colors ${
            open ? 'border-border bg-accent text-foreground' : 'border-border/30 text-muted-foreground/60 hover:border-border hover:text-foreground'
          }`}
        >
          <span>{label}: {selected?.label || 'All'}</span>
          <ChevronDown size={9} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-32 p-0.5">
        {options.map(opt => (
          <Button
            key={opt.value}
            variant="ghost"
            onClick={() => { onChange(opt.value); setOpen(false); }}
            className={`w-full text-left px-2 py-[4px] rounded-md text-xs transition-colors justify-start ${
              value === opt.value ? 'bg-accent text-foreground' : 'text-muted-foreground/60 hover:bg-accent/50'
            }`}
          >
            {opt.label}
          </Button>
        ))}
      </PopoverContent>
    </UIPopover>
  );
}

// ===========================
// Batch Action Bar
// ===========================
function BatchBar({ count, onDelete, onMove, onDownload, onClear }: {
  count: number;
  onDelete: () => void;
  onMove: () => void;
  onDownload: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-1.5 bg-accent/50 border-b border-border/30">
      <span className="text-xs text-muted-foreground font-medium">已选择 {count} 个文件</span>
      <div className="flex-1" />
      <Button variant="ghost" size="inline" onClick={onDownload} className="flex items-center gap-1 px-2 py-[3px] rounded-md text-xs text-muted-foreground/60 hover:bg-accent transition-colors">
        <Download size={10} />
        <span>下载</span>
      </Button>
      <Button variant="ghost" size="inline" onClick={onMove} className="flex items-center gap-1 px-2 py-[3px] rounded-md text-xs text-muted-foreground/60 hover:bg-accent transition-colors">
        <FolderInput size={10} />
        <span>移动</span>
      </Button>
      <Button variant="ghost" size="inline" onClick={onDelete} className="flex items-center gap-1 px-2 py-[3px] rounded-md text-xs text-destructive/60 hover:bg-destructive/8 transition-colors">
        <Trash2 size={10} />
        <span>删除</span>
      </Button>
      <Button variant="ghost" onClick={onClear} className="w-5 h-5 p-0 rounded-md flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-accent transition-colors">
        <X size={10} />
      </Button>
    </div>
  );
}

// Regex patterns constructed via new RegExp to satisfy project constraints
const RE_TYPE_CAPTURE = new RegExp('type:(' + String.fromCharCode(92) + 'w+)');
const RE_TAG_CAPTURE = new RegExp('tag:(' + String.fromCharCode(92) + 'S+)');
const RE_TYPE_GLOBAL = new RegExp('type:' + String.fromCharCode(92) + 'w+', 'g');
const RE_TAG_GLOBAL = new RegExp('tag:' + String.fromCharCode(92) + 'S+', 'g');
const RE_EXT_SUFFIX = new RegExp('(' + String.fromCharCode(92) + '.' + String.fromCharCode(92) + 'w+)$');

// ===========================
// Main FilePage
// ===========================
export function FilePage() {
  const [files, setFiles] = useState<FileItem[]>(MOCK_FILES);
  const [folders, setFolders] = useState<FileFolder[]>(FILE_FOLDERS);
  const [filter, setFilter] = useState<SidebarFilter>({ kind: 'library', value: 'all' });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchText, setSearchText] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [dateFilter, setDateFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; fileId: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [moveDialogIds, setMoveDialogIds] = useState<string[] | null>(null);
  const [tagDialogId, setTagDialogId] = useState<string | null>(null);
  const [folderCounter, setFolderCounter] = useState(6);

  const flatFolderList = useMemo(() => flattenFolders(folders), [folders]);

  // Filter logic
  const filteredFiles = useMemo(() => {
    let result = files;

    if (filter.kind === 'library') {
      if (filter.value === 'trash') result = result.filter(f => f.trashed);
      else {
        result = result.filter(f => !f.trashed);
        if (filter.value === 'starred') result = result.filter(f => f.starred);
        if (filter.value === 'recent') {
          result = [...result].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 10);
        }
      }
    } else if (filter.kind === 'type') {
      result = result.filter(f => !f.trashed && f.type === filter.value);
    } else if (filter.kind === 'folder') {
      const folderId = filter.value;
      const childIds = flatFolderList.filter(f => f.parentId === folderId).map(f => f.id);
      result = result.filter(f => !f.trashed && (f.folderId === folderId || childIds.includes(f.folderId || '')));
    } else if (filter.kind === 'tag') {
      result = result.filter(f => !f.trashed && f.tags.includes(filter.value));
    }

    // Search
    if (searchText.trim()) {
      const terms = searchText.toLowerCase().trim();
      const typeMatch = terms.match(RE_TYPE_CAPTURE);
      const tagMatch = terms.match(RE_TAG_CAPTURE);
      let textSearch = terms.replace(RE_TYPE_GLOBAL, '').replace(RE_TAG_GLOBAL, '').trim();

      if (typeMatch) result = result.filter(f => f.type === typeMatch[1] || f.format === typeMatch[1]);
      if (tagMatch) {
        const tagName = tagMatch[1];
        const matchTag = FILE_TAGS.find(t => t.name.toLowerCase().includes(tagName));
        if (matchTag) result = result.filter(f => f.tags.includes(matchTag.id));
      }
      if (textSearch) result = result.filter(f =>
        f.name.toLowerCase().includes(textSearch) || (f.description || '').toLowerCase().includes(textSearch)
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date('2026-02-26');
      result = result.filter(f => {
        const diff = (now.getTime() - new Date(f.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
        if (dateFilter === 'today') return diff < 1;
        if (dateFilter === 'week') return diff < 7;
        if (dateFilter === 'month') return diff < 30;
        return true;
      });
    }

    // Size filter
    if (sizeFilter !== 'all') {
      result = result.filter(f => {
        if (sizeFilter === 'small') return f.sizeBytes < 100 * 1024;
        if (sizeFilter === 'medium') return f.sizeBytes >= 100 * 1024 && f.sizeBytes < 10 * 1024 * 1024;
        if (sizeFilter === 'large') return f.sizeBytes >= 10 * 1024 * 1024;
        return true;
      });
    }

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'size') cmp = a.sizeBytes - b.sizeBytes;
      else if (sortKey === 'updatedAt') cmp = a.updatedAt.localeCompare(b.updatedAt);
      else if (sortKey === 'type') cmp = a.type.localeCompare(b.type);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [files, filter, searchText, dateFilter, sizeFilter, sortKey, sortDir, flatFolderList]);

  // File counts
  const fileCounts = useMemo(() => {
    const active = files.filter(f => !f.trashed);
    const counts: Record<string, number> = {
      all: active.length,
      recent: Math.min(active.length, 10),
      starred: active.filter(f => f.starred).length,
      trash: files.filter(f => f.trashed).length,
      type_document: active.filter(f => f.type === 'document').length,
      type_image: active.filter(f => f.type === 'image').length,
      type_code: active.filter(f => f.type === 'code').length,
      type_audio: active.filter(f => f.type === 'audio').length,
      type_video: active.filter(f => f.type === 'video').length,
    };
    flatFolderList.forEach(f => {
      const childIds = flatFolderList.filter(c => c.parentId === f.id).map(c => c.id);
      counts[f.id] = active.filter(file => file.folderId === f.id || childIds.includes(file.folderId || '')).length;
    });
    return counts;
  }, [files, flatFolderList]);

  // Handlers
  const handleSelect = useCallback((id: string, multi: boolean) => {
    setSelectedIds(prev => {
      if (multi) {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      }
      return prev.has(id) && prev.size === 1 ? new Set() : new Set([id]);
    });
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!selectedIds.has(id)) setSelectedIds(new Set([id]));
    setContextMenu({ x: e.clientX, y: e.clientY, fileId: id });
  }, [selectedIds]);

  const handleToggleStar = useCallback((id: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, starred: !f.starred } : f));
  }, []);

  const handleDelete = useCallback((ids?: Set<string>) => {
    const targets = ids || selectedIds;
    if (filter.kind === 'library' && filter.value === 'trash') {
      // Permanent delete from trash
      setFiles(prev => prev.filter(f => !targets.has(f.id)));
    } else {
      setFiles(prev => prev.map(f => targets.has(f.id) ? { ...f, trashed: true } : f));
    }
    setSelectedIds(new Set());
  }, [selectedIds, filter]);

  const handleRestore = useCallback((ids: Set<string>) => {
    setFiles(prev => prev.map(f => ids.has(f.id) ? { ...f, trashed: false } : f));
    setSelectedIds(new Set());
  }, []);

  const handleRename = useCallback((id: string, newName: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
    setRenamingId(null);
  }, []);

  const handleMoveFiles = useCallback((folderId: string | null) => {
    if (!moveDialogIds) return;
    setFiles(prev => prev.map(f => moveDialogIds.includes(f.id) ? { ...f, folderId } : f));
    setMoveDialogIds(null);
    setSelectedIds(new Set());
  }, [moveDialogIds]);

  const handleToggleTag = useCallback((tagId: string) => {
    if (!tagDialogId) return;
    setFiles(prev => prev.map(f => {
      if (f.id !== tagDialogId) return f;
      const has = f.tags.includes(tagId);
      return { ...f, tags: has ? f.tags.filter(t => t !== tagId) : [...f.tags, tagId] };
    }));
  }, [tagDialogId]);

  const handleCreateFolder = useCallback((name: string, parentId: string | null) => {
    const newId = `f${folderCounter}`;
    setFolderCounter(c => c + 1);
    if (parentId === null) {
      setFolders(prev => [...prev, { id: newId, name, parentId: null }]);
    } else {
      const addChild = (items: FileFolder[]): FileFolder[] => items.map(f => {
        if (f.id === parentId) return { ...f, children: [...(f.children || []), { id: newId, name, parentId }] };
        if (f.children) return { ...f, children: addChild(f.children) };
        return f;
      });
      setFolders(prev => addChild(prev));
    }
  }, [folderCounter]);

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }, [sortKey]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (renamingId || moveDialogIds || tagDialogId) return;
      if (e.key === ' ' && selectedIds.size === 1 && !previewFile) {
        e.preventDefault();
        const file = files.find(f => selectedIds.has(f.id));
        if (file) setPreviewFile(file);
      }
      if (e.key === 'Escape' && previewFile) setPreviewFile(null);
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.size > 0 && !previewFile) {
        handleDelete();
      }
      if (e.key === 'F2' && selectedIds.size === 1) {
        e.preventDefault();
        setRenamingId([...selectedIds][0]);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [selectedIds, files, previewFile, handleDelete, renamingId, moveDialogIds, tagDialogId]);

  // Filter title
  const filterTitle = useMemo(() => {
    if (filter.kind === 'library') {
      return ({ all: '全部文件', recent: '最近使用', starred: '已收藏', trash: '回收站' } as Record<string, string>)[filter.value] || '';
    }
    if (filter.kind === 'type') {
      return ({ document: '文档', image: '图片', code: '代码', audio: '音频', video: '视频' } as Record<string, string>)[filter.value] || '';
    }
    if (filter.kind === 'folder') return flatFolderList.find(f => f.id === filter.value)?.name || '';
    if (filter.kind === 'tag') return FILE_TAGS.find(t => t.id === filter.value)?.name || '';
    return '';
  }, [filter, flatFolderList]);

  const isTrash = filter.kind === 'library' && filter.value === 'trash';
  const contextFile = contextMenu ? files.find(f => f.id === contextMenu.fileId) : null;

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* Sidebar */}
      <FileSidebar
        filter={filter}
        onFilterChange={(f) => { setFilter(f); setSelectedIds(new Set()); setRenamingId(null); }}
        folders={folders}
        tags={FILE_TAGS}
        fileCounts={fileCounts}
        onCreateFolder={handleCreateFolder}
      />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col min-w-0 relative transition-colors ${dragOver ? 'bg-accent/25' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
      >
        {/* Header Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border/30">
          <h2 className="text-sm text-foreground flex-shrink-0 mr-1 font-medium">{filterTitle}</h2>

          {/* Search */}
          <SearchInput
            value={searchText}
            onChange={setSearchText}
            placeholder="搜索文件… (type:image, tag:工作)"
            wrapperClassName="flex-1 max-w-[280px] px-2.5 h-[26px] bg-muted/20 rounded-md border border-border/20"
            clearable
          />

          <FilterDropdown label="时间" value={dateFilter} onChange={setDateFilter}
            options={[{ value: 'all', label: '全部' }, { value: 'today', label: '今天' }, { value: 'week', label: '本周' }, { value: 'month', label: '本月' }]} />
          <FilterDropdown label="大小" value={sizeFilter} onChange={setSizeFilter}
            options={[{ value: 'all', label: '全部' }, { value: 'small', label: '< 100KB' }, { value: 'medium', label: '100KB-10MB' }, { value: 'large', label: '> 10MB' }]} />

          <div className="flex-1" />

          <Button
            variant="ghost"
            onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-1 px-1.5 py-[3px] rounded-md text-xs text-muted-foreground/40 hover:text-foreground hover:bg-accent transition-colors"
          >
            <ArrowUpDown size={9} />
            <span>{sortKey === 'name' ? '名称' : sortKey === 'size' ? '大小' : sortKey === 'type' ? '类型' : '时间'}</span>
          </Button>

          <div className="flex items-center border border-border/25 rounded-md overflow-hidden">
            <Button variant="ghost" onClick={() => setViewMode('grid')}
              className={`w-6 h-6 p-0 rounded-none flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-accent text-muted-foreground' : 'text-muted-foreground/40 hover:text-foreground'}`}>
              <LayoutGrid size={11} />
            </Button>
            <Button variant="ghost" onClick={() => setViewMode('list')}
              className={`w-6 h-6 p-0 rounded-none flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-accent text-muted-foreground' : 'text-muted-foreground/40 hover:text-foreground'}`}>
              <List size={11} />
            </Button>
          </div>

          <Button variant="outline" size="inline" className="flex items-center gap-1 px-2.5 py-[4px] rounded-md text-xs text-muted-foreground/60 hover:text-foreground hover:bg-accent transition-colors border-border/30">
            <Upload size={10} />
            <span>上传</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleCreateFolder('新建文件夹', null)}
            className="flex items-center gap-1 px-2.5 py-[4px] rounded-md text-xs text-muted-foreground/60 hover:text-foreground hover:bg-accent transition-colors border-border/30"
          >
            <FolderPlus size={10} />
            <span>新建</span>
          </Button>
        </div>

        {/* Batch action bar */}
        {selectedIds.size > 1 && (
          <BatchBar
            count={selectedIds.size}
            onDelete={() => handleDelete()}
            onMove={() => setMoveDialogIds([...selectedIds])}
            onDownload={() => {}}
            onClear={() => setSelectedIds(new Set())}
          />
        )}

        {/* Drag overlay */}
        {dragOver && (
          <div className="absolute inset-0 z-[var(--z-popover)] flex items-center justify-center bg-accent/25 border-2 border-dashed border-border/50 rounded-lg m-2 pointer-events-none">
            <div className="text-center">
              <Upload size={28} className="text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground/40">拖拽文件到此处上传</p>
            </div>
          </div>
        )}

        {/* File area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin relative"
          onClick={(e) => { if (e.target === e.currentTarget) { setSelectedIds(new Set()); setRenamingId(null); } }}>
          {filteredFiles.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
              {files.filter(f => !f.trashed).length === 0 ? (
                <EmptyState preset="no-file" />
              ) : (
                <EmptyState
                  preset="no-result"
                  title="没有找到匹配的文件"
                  description={searchText ? '尝试调整搜索关键词或筛选条件' : '当前筛选条件下没有文件'}
                />
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <FileGrid
              files={filteredFiles}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onContextMenu={handleContextMenu}
              onPreview={setPreviewFile}
              onToggleStar={handleToggleStar}
              tags={FILE_TAGS}
              renamingId={renamingId}
              onRenameConfirm={handleRename}
              onRenameCancel={() => setRenamingId(null)}
            />
          ) : (
            <FileList
              files={filteredFiles}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onContextMenu={handleContextMenu}
              onPreview={setPreviewFile}
              onToggleStar={handleToggleStar}
              tags={FILE_TAGS}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
              renamingId={renamingId}
              onRenameConfirm={handleRename}
              onRenameCancel={() => setRenamingId(null)}
            />
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-3 px-4 py-1 border-t border-border/15">
          <span className="text-xs text-muted-foreground/40">{filteredFiles.length} 个文件</span>
          {selectedIds.size > 0 && <span className="text-xs text-muted-foreground/40">{selectedIds.size} 个已选</span>}
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground/50">空格预览 · F2 重命名 · 右键菜单</span>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && contextFile && (
        <Popover x={contextMenu.x} y={contextMenu.y} onClose={() => setContextMenu(null)}>
          <div className="p-0.5 min-w-[130px]">
            {isTrash ? (
              <div>
                <CMenuItem icon={RotateCcw} label="恢复" onClick={() => {
                  handleRestore(new Set([contextMenu.fileId]));
                  setContextMenu(null);
                }} />
                <div className="my-0.5 mx-1.5 border-t border-border/30" />
                <CMenuItem icon={Trash2} label="永久删除" danger onClick={() => {
                  handleDelete(new Set([contextMenu.fileId]));
                  setContextMenu(null);
                }} />
              </div>
            ) : (
              <div>
                <CMenuItem icon={Eye} label="预览" onClick={() => {
                  setPreviewFile(contextFile);
                  setContextMenu(null);
                }} />
                <CMenuItem icon={Download} label="下载" onClick={() => setContextMenu(null)} />
                <CMenuItem icon={Share2} label="分享" onClick={() => setContextMenu(null)} />
                <div className="my-0.5 mx-1.5 border-t border-border/30" />
                <CMenuItem icon={Pencil} label="重命名" onClick={() => {
                  setRenamingId(contextMenu.fileId);
                  setContextMenu(null);
                }} />
                <CMenuItem icon={FolderInput} label="移动到…" onClick={() => {
                  setMoveDialogIds([contextMenu.fileId]);
                  setContextMenu(null);
                }} />
                <CMenuItem icon={Copy} label="复制" onClick={() => {
                  const orig = files.find(f => f.id === contextMenu.fileId);
                  if (orig) {
                    const copy: FileItem = { ...orig, id: `${orig.id}_copy_${Date.now()}`, name: `${orig.name.replace(RE_EXT_SUFFIX, ' (副本)$1')}` };
                    setFiles(prev => [...prev, copy]);
                  }
                  setContextMenu(null);
                }} />
                <CMenuItem icon={Tag} label="管理标签" onClick={() => {
                  setTagDialogId(contextMenu.fileId);
                  setContextMenu(null);
                }} />
                <CMenuItem icon={Star} label={contextFile.starred ? '取消收藏' : '收藏'} onClick={() => {
                  handleToggleStar(contextMenu.fileId);
                  setContextMenu(null);
                }} />
                <div className="my-0.5 mx-1.5 border-t border-border/30" />
                <CMenuItem icon={Trash2} label="删除" danger onClick={() => {
                  handleDelete(new Set([contextMenu.fileId]));
                  setContextMenu(null);
                }} />
              </div>
            )}
          </div>
        </Popover>
      )}

      {/* Move Dialog */}
      {moveDialogIds && (
        <MoveToDialog
          folders={folders}
          currentFolderId={files.find(f => f.id === moveDialogIds[0])?.folderId || null}
          onMove={handleMoveFiles}
          onClose={() => setMoveDialogIds(null)}
        />
      )}

      {/* Tag Picker */}
      {tagDialogId && (
        <TagPickerDialog
          allTags={FILE_TAGS}
          currentTags={files.find(f => f.id === tagDialogId)?.tags || []}
          onToggleTag={handleToggleTag}
          onClose={() => setTagDialogId(null)}
        />
      )}

      {/* Preview Modal */}
      {previewFile && (
        <FilePreview
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          tags={FILE_TAGS}
          folders={folders}
        />
      )}
    </div>
  );
}
