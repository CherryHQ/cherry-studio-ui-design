import React, { useState, useRef, useEffect } from 'react';
import {
  FileText, Image as ImageIcon, Code2, Music, Video,
  File, ChevronUp, ChevronDown,
} from 'lucide-react';
import { Button, Input } from '@cherry-studio/ui';
import type { FileItem } from './mockData';
import { getFormatLabel } from './mockData';

const typeIcons: Record<string, React.ElementType> = {
  image: ImageIcon, document: FileText, code: Code2,
  audio: Music, video: Video, other: File,
};

const typeIconColors: Record<string, string> = {
  image: 'text-accent-pink/50',
  document: 'text-accent-blue/50',
  code: 'text-accent-cyan/50',
  audio: 'text-accent-amber/50',
  video: 'text-accent-violet/50',
  other: 'text-muted-foreground/40',
};

export type SortKey = 'name' | 'size' | 'updatedAt' | 'type';
export type SortDir = 'asc' | 'desc';

export function FileList({
  files,
  selectedIds,
  onSelect,
  onContextMenu,
  onPreview,
  sortKey,
  sortDir,
  onSort,
  renamingId,
  onRenameConfirm,
  onRenameCancel,
}: {
  files: FileItem[];
  selectedIds: Set<string>;
  onSelect: (id: string, multi: boolean) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onPreview: (file: FileItem) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  renamingId: string | null;
  onRenameConfirm: (id: string, name: string) => void;
  onRenameCancel: () => void;
}) {
  const SortHeader = ({ label, field, className: cn }: { label: string; field: SortKey; className?: string }) => (
    <Button size="inline"
      variant="ghost"
      onClick={() => onSort(field)}
      className={`p-0 flex items-center gap-0.5 text-xs uppercase tracking-wider transition-colors ${
        sortKey === field ? 'text-muted-foreground' : 'text-muted-foreground/40 hover:text-foreground'
      } ${cn || ''}`}
    >
      <span>{label}</span>
      {sortKey === field && (
        sortDir === 'asc' ? <ChevronUp size={8} /> : <ChevronDown size={8} />
      )}
    </Button>
  );

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-1.5 border-b border-border/30 sticky top-0 bg-background z-10">
        <SortHeader label="名称" field="name" className="flex-1" />
        <SortHeader label="大小" field="size" className="w-[70px] justify-end" />
        <SortHeader label="类型" field="type" className="w-[55px]" />
        <SortHeader label="修改时间" field="updatedAt" className="w-[110px]" />
      </div>
      {/* Rows */}
      {files.map(file => {
        const selected = selectedIds.has(file.id);
        const Icon = typeIcons[file.type] || File;
        const isRenaming = renamingId === file.id;
        return (
          <div
            key={file.id}
            onClick={(e) => { if (!isRenaming) onSelect(file.id, e.metaKey || e.ctrlKey); }}
            onContextMenu={(e) => onContextMenu(e, file.id)}
            onDoubleClick={() => { if (!isRenaming) onPreview(file); }}
            className={`flex items-center gap-2 px-4 py-[6px] border-b border-border/15 cursor-pointer transition-colors ${
              selected ? 'bg-accent/50' : 'hover:bg-accent/50'
            }`}
          >
            {/* Icon + Name */}
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <Icon size={13} strokeWidth={1.4} className={`flex-shrink-0 ${typeIconColors[file.type] || typeIconColors.other}`} />
              {isRenaming ? (
                <InlineRename
                  value={file.name}
                  onConfirm={(v) => onRenameConfirm(file.id, v)}
                  onCancel={onRenameCancel}
                />
              ) : (
                <span className="text-sm text-foreground truncate">{file.name}</span>
              )}
            </div>
            {/* Size */}
            <span className="text-xs text-muted-foreground/50 w-[70px] text-right flex-shrink-0">{file.size}</span>
            {/* Type */}
            <span className="text-xs text-muted-foreground/50 w-[55px] flex-shrink-0">{getFormatLabel(file.format)}</span>
            {/* Date */}
            <span className="text-xs text-muted-foreground/50 w-[110px] flex-shrink-0">{file.updatedAt}</span>
          </div>
        );
      })}
    </div>
  );
}

function InlineRename({ value, onConfirm, onCancel }: { value: string; onConfirm: (v: string) => void; onCancel: () => void }) {
  const [text, setText] = useState(value);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
      const dotIdx = value.lastIndexOf('.');
      ref.current.setSelectionRange(0, dotIdx > 0 ? dotIdx : value.length);
    }
  }, [value]);
  return (
    <Input
      ref={ref}
      value={text}
      onChange={e => setText(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter' && text.trim()) onConfirm(text.trim());
        if (e.key === 'Escape') onCancel();
      }}
      onBlur={() => { if (text.trim()) onConfirm(text.trim()); else onCancel(); }}
      className="flex-1 bg-background border border-border text-xs text-foreground px-2 py-0.5 h-auto rounded-md shadow-sm focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/15"
      onClick={e => e.stopPropagation()}
    />
  );
}
