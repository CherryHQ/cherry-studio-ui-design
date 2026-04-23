import React, { useState, useRef, useEffect } from 'react';
import {
  Files, Clock, Star, Trash2, FileText, Image as ImageIcon,
  Code2, Music, Video, ChevronRight, ChevronDown,
  FolderClosed, FolderOpen, Plus,
} from 'lucide-react';
import { Button, Input } from '@cherry-studio/ui';
import type { FileFolder, FileTag } from './mockData';

export type SidebarFilter =
  | { kind: 'library'; value: 'all' | 'recent' | 'starred' | 'trash' }
  | { kind: 'type'; value: 'document' | 'image' | 'code' | 'audio' | 'video' }
  | { kind: 'folder'; value: string }
  | { kind: 'tag'; value: string };

const libraryItems: { id: 'all' | 'recent' | 'starred' | 'trash'; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: '全部文件', icon: Files },
  { id: 'recent', label: '最近使用', icon: Clock },
  { id: 'starred', label: '已收藏', icon: Star },
  { id: 'trash', label: '回收站', icon: Trash2 },
];

const typeItems: { id: 'document' | 'image' | 'code' | 'audio' | 'video'; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'document', label: '文档', icon: FileText, color: 'text-accent-blue/45' },
  { id: 'image', label: '图片', icon: ImageIcon, color: 'text-accent-pink/45' },
  { id: 'code', label: '代码', icon: Code2, color: 'text-accent-cyan/45' },
  { id: 'audio', label: '音频', icon: Music, color: 'text-accent-amber/45' },
  { id: 'video', label: '视频', icon: Video, color: 'text-accent-violet/45' },
];

function InlineInput({ onConfirm, onCancel }: { onConfirm: (v: string) => void; onCancel: () => void }) {
  const [text, setText] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div className="flex items-center gap-1.5 px-3 py-[5px]">
      <FolderClosed size={12} className="flex-shrink-0 text-muted-foreground/40" />
      <Input
        ref={ref}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && text.trim()) onConfirm(text.trim());
          if (e.key === 'Escape') onCancel();
        }}
        onBlur={() => { if (text.trim()) onConfirm(text.trim()); else onCancel(); }}
        placeholder="文件夹名称"
        className="flex-1 bg-transparent outline-none text-xs text-foreground border-b border-border/50 py-0.5 min-w-0 placeholder:text-muted-foreground/60 h-auto border-x-0 border-t-0 rounded-none shadow-none focus-visible:ring-0"
      />
    </div>
  );
}

export function FileSidebar({
  filter,
  onFilterChange,
  folders,
  tags,
  fileCounts,
  onCreateFolder,
}: {
  filter: SidebarFilter;
  onFilterChange: (f: SidebarFilter) => void;
  folders: FileFolder[];
  tags: FileTag[];
  fileCounts: Record<string, number>;
  onCreateFolder: (name: string, parentId: string | null) => void;
}) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['f1', 'f2']));
  const [showFolders, setShowFolders] = useState(true);
  const [showTags, setShowTags] = useState(true);
  const [showTypes, setShowTypes] = useState(true);
  const [creatingFolder, setCreatingFolder] = useState(false);

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isActive = (f: SidebarFilter) => f.kind === filter.kind && f.value === filter.value;

  const SectionHeader = ({ label, expanded, onToggle, onAdd }: { label: string; expanded: boolean; onToggle: () => void; onAdd?: () => void }) => (
    <div className="flex items-center justify-between px-3 pt-3 pb-1">
      <Button variant="ghost" onClick={onToggle} size="inline" className="p-0 flex items-center gap-1 text-xs text-muted-foreground/60 uppercase tracking-wider hover:text-foreground transition-colors">
        {expanded ? <ChevronDown size={9} /> : <ChevronRight size={9} />}
        <span>{label}</span>
      </Button>
      {onAdd && (
        <Button variant="ghost" onClick={onAdd} className="w-4 h-4 p-0 flex items-center justify-center text-muted-foreground/40 hover:text-foreground transition-colors">
          <Plus size={10} />
        </Button>
      )}
    </div>
  );

  const renderFolderTree = (items: FileFolder[], depth: number = 0) => {
    return items.map(folder => {
      const hasChildren = folder.children && folder.children.length > 0;
      const expanded = expandedFolders.has(folder.id);
      const active = isActive({ kind: 'folder', value: folder.id });
      const FIcon = active && expanded ? FolderOpen : FolderClosed;
      return (
        <div key={folder.id}>
          <Button size="inline"
            variant="ghost"
            onClick={() => {
              onFilterChange({ kind: 'folder', value: folder.id });
              if (hasChildren) toggleFolder(folder.id);
            }}
            className={`w-full flex items-center gap-1.5 py-[5px] rounded-md transition-colors text-sm ${
              active
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            }`}
            style={{ paddingLeft: `${12 + depth * 14}px`, paddingRight: '8px' }}
          >
            {hasChildren ? (
              expanded ? <ChevronDown size={9} className="flex-shrink-0 text-muted-foreground/40" /> : <ChevronRight size={9} className="flex-shrink-0 text-muted-foreground/40" />
            ) : (
              <span className="w-[9px] flex-shrink-0" />
            )}
            <FIcon size={12} className="flex-shrink-0 text-muted-foreground/60" />
            <span className="truncate">{folder.name}</span>
            {fileCounts[folder.id] !== undefined && fileCounts[folder.id] > 0 && (
              <span className="ml-auto text-xs text-muted-foreground/40">{fileCounts[folder.id]}</span>
            )}
          </Button>
          {hasChildren && expanded && renderFolderTree(folder.children!, depth + 1)}
        </div>
      );
    });
  };

  return (
    <div className="w-[180px] flex-shrink-0 border-r border-border/30 flex flex-col overflow-y-auto select-none scrollbar-thin-xs">
      {/* Library */}
      <div className="px-1.5 pt-2 pb-1 space-y-[1px]">
        {libraryItems.map(item => {
          const active = isActive({ kind: 'library', value: item.id });
          const Icon = item.icon;
          const count = fileCounts[item.id];
          return (
            <Button size="inline"
              key={item.id}
              variant="ghost"
              onClick={() => onFilterChange({ kind: 'library', value: item.id })}
              className={`w-full flex items-center gap-2 px-2.5 py-[5px] rounded-md transition-colors text-sm ${
                active
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              }`}
            >
              <Icon size={13} strokeWidth={1.5} className="flex-shrink-0 text-muted-foreground/60" />
              <span className="flex-1 text-left truncate">{item.label}</span>
              {count !== undefined && count > 0 && (
                <span className="text-xs text-muted-foreground/40">{count}</span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Type Filter */}
      <SectionHeader label="类型" expanded={showTypes} onToggle={() => setShowTypes(v => !v)} />
      {showTypes && (
        <div className="px-1.5 pb-1 space-y-[1px]">
          {typeItems.map(item => {
            const active = isActive({ kind: 'type', value: item.id });
            const Icon = item.icon;
            const count = fileCounts[`type_${item.id}`];
            return (
              <Button size="inline"
                key={item.id}
                variant="ghost"
                onClick={() => onFilterChange({ kind: 'type', value: item.id })}
                className={`w-full flex items-center gap-2 px-2.5 py-[5px] rounded-md transition-colors text-sm ${
                  active
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                }`}
              >
                <Icon size={12} strokeWidth={1.5} className={`flex-shrink-0 ${item.color}`} />
                <span className="flex-1 text-left truncate">{item.label}</span>
                {count !== undefined && count > 0 && (
                  <span className="text-xs text-muted-foreground/40">{count}</span>
                )}
              </Button>
            );
          })}
        </div>
      )}

      {/* Folders */}
      <SectionHeader label="文件夹" expanded={showFolders} onToggle={() => setShowFolders(v => !v)} onAdd={() => setCreatingFolder(true)} />
      {showFolders && (
        <div className="px-1.5 pb-1 space-y-[1px]">
          {renderFolderTree(folders)}
          {creatingFolder && (
            <InlineInput
              onConfirm={(name) => { onCreateFolder(name, null); setCreatingFolder(false); }}
              onCancel={() => setCreatingFolder(false)}
            />
          )}
        </div>
      )}

      {/* Tags */}
      <SectionHeader label="标签" expanded={showTags} onToggle={() => setShowTags(v => !v)} />
      {showTags && (
        <div className="px-1.5 pb-2 space-y-[1px]">
          {tags.map(tag => {
            const active = isActive({ kind: 'tag', value: tag.id });
            return (
              <Button size="inline"
                key={tag.id}
                variant="ghost"
                onClick={() => onFilterChange({ kind: 'tag', value: tag.id })}
                className={`w-full flex items-center gap-2 px-2.5 py-[5px] rounded-md transition-colors text-sm ${
                  active
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 opacity-70 ${tag.color.dot}`} />
                <span className="flex-1 text-left truncate">{tag.name}</span>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
