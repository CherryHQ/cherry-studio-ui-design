import React, { useState, useRef, useEffect } from 'react';
import {
  FileText, Image as ImageIcon, Code2, Music, Video,
  File, Star, MoreHorizontal, Eye,
} from 'lucide-react';
import { Button, Input } from '@cherry-studio/ui';
import type { FileItem, FileTag } from './mockData';
import { getFormatLabel } from './mockData';

const typeIcons: Record<string, React.ElementType> = {
  image: ImageIcon, document: FileText, code: Code2,
  audio: Music, video: Video, other: File,
};

// Muted but distinguishable type colors
const typeIconColors: Record<string, string> = {
  image: 'text-accent-pink/50',
  document: 'text-accent-blue/50',
  code: 'text-accent-cyan/50',
  audio: 'text-accent-amber/50',
  video: 'text-accent-violet/50',
  other: 'text-muted-foreground/50',
};

const typeBgColors: Record<string, string> = {
  image: 'bg-accent-pink/[0.04]',
  document: 'bg-accent-blue/[0.04]',
  code: 'bg-accent-cyan/[0.04]',
  audio: 'bg-accent-amber/[0.04]',
  video: 'bg-accent-violet/[0.04]',
  other: 'bg-muted/20',
};

export function FileGrid({
  files,
  selectedIds,
  onSelect,
  onContextMenu,
  onPreview,
  onToggleStar,
  tags,
  renamingId,
  onRenameConfirm,
  onRenameCancel,
}: {
  files: FileItem[];
  selectedIds: Set<string>;
  onSelect: (id: string, multi: boolean) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onPreview: (file: FileItem) => void;
  onToggleStar: (id: string) => void;
  tags: FileTag[];
  renamingId: string | null;
  onRenameConfirm: (id: string, name: string) => void;
  onRenameCancel: () => void;
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(145px,1fr))] gap-2 p-3">
      {files.map(file => {
        const selected = selectedIds.has(file.id);
        const Icon = typeIcons[file.type] || File;
        const fileTags = tags.filter(t => file.tags.includes(t.id));
        const isRenaming = renamingId === file.id;
        return (
          <div
            key={file.id}
            onClick={(e) => { if (!isRenaming) onSelect(file.id, e.metaKey || e.ctrlKey); }}
            onContextMenu={(e) => onContextMenu(e, file.id)}
            onDoubleClick={() => { if (!isRenaming) onPreview(file); }}
            className={`group relative rounded-lg border transition-all cursor-pointer ${
              selected
                ? 'border-border/50 bg-accent/50'
                : 'border-border/30 hover:border-border/50 hover:bg-accent/50'
            }`}
          >
            {/* Thumbnail */}
            <div className={`h-[88px] rounded-t-lg flex items-center justify-center ${typeBgColors[file.type] || typeBgColors.other} relative overflow-hidden`}>
              <Icon size={26} strokeWidth={1.2} className={typeIconColors[file.type] || typeIconColors.other} />
              {/* Format badge */}
              <span className="absolute top-1.5 left-1.5 px-1.5 py-[1px] rounded text-xs tracking-wide bg-muted/50 text-muted-foreground/60 font-medium">
                {getFormatLabel(file.format)}
              </span>
              {/* Hover actions */}
              <div className="absolute top-1 right-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  onClick={(e) => { e.stopPropagation(); onToggleStar(file.id); }}
                  className={`w-5 h-5 p-0 rounded flex items-center justify-center transition-colors text-xs ${
                    file.starred ? 'text-accent-amber/70' : 'text-muted-foreground/50 hover:text-accent-amber/50 bg-background/70'
                  }`}
                >
                  <Star size={11} fill={file.starred ? 'currentColor' : 'none'} />
                </Button>
                <Button
                  variant="ghost"
                  onClick={(e) => { e.stopPropagation(); onPreview(file); }}
                  className="w-5 h-5 p-0 rounded flex items-center justify-center text-muted-foreground/50 hover:text-foreground bg-background/70 transition-colors"
                >
                  <Eye size={11} />
                </Button>
                <Button
                  variant="ghost"
                  onClick={(e) => { e.stopPropagation(); onContextMenu(e, file.id); }}
                  className="w-5 h-5 p-0 rounded flex items-center justify-center text-muted-foreground/50 hover:text-foreground bg-background/70 transition-colors"
                >
                  <MoreHorizontal size={11} />
                </Button>
              </div>
              {/* Star indicator */}
              {file.starred && (
                <Star size={9} fill="currentColor" className="absolute bottom-1.5 right-1.5 text-accent-amber/50" />
              )}
            </div>
            {/* Info */}
            <div className="px-2 py-1.5">
              {isRenaming ? (
                <InlineRename
                  value={file.name}
                  onConfirm={(v) => onRenameConfirm(file.id, v)}
                  onCancel={onRenameCancel}
                />
              ) : (
                <p className="text-sm text-foreground truncate" title={file.name}>{file.name}</p>
              )}
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs text-muted-foreground/50">{file.size}</span>
                {fileTags.length > 0 && (
                  <div className="flex items-center gap-0.5 ml-auto">
                    {fileTags.slice(0, 2).map(t => (
                      <span key={t.id} className={`w-1.5 h-1.5 rounded-full flex-shrink-0 opacity-60 ${t.color.dot}`} />
                    ))}
                  </div>
                )}
              </div>
            </div>
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
      className="w-full bg-transparent outline-none text-xs text-foreground border-b border-border/50 py-0 h-auto border-x-0 border-t-0 rounded-none shadow-none focus-visible:ring-0"
      onClick={e => e.stopPropagation()}
    />
  );
}
