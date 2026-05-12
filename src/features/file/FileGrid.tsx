import React, { useState, useRef, useEffect } from 'react';
import {
  FileText, Image as ImageIcon, FileCode, Music, Video,
  File, Star, MoreHorizontal, Eye,
} from 'lucide-react';
import { Button, Input } from '@cherry-studio/ui';
import type { FileItem, FileTag } from './mockData';
import { getFormatLabel } from './mockData';

const typeIcons: Record<string, React.ElementType> = {
  image: ImageIcon, document: FileText, code: FileCode,
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

// Curated photo-gallery placeholder gradients. Without real previews we pick a
// deterministic gradient per filename so each image tile looks distinct.
const GALLERY_GRADIENTS = [
  'linear-gradient(135deg,#ffd3a5,#fd6585)',
  'linear-gradient(135deg,#a1c4fd,#c2e9fb)',
  'linear-gradient(135deg,#fbc2eb,#a6c1ee)',
  'linear-gradient(135deg,#fad0c4,#ffd1ff)',
  'linear-gradient(135deg,#a8edea,#fed6e3)',
  'linear-gradient(135deg,#ffecd2,#fcb69f)',
  'linear-gradient(135deg,#84fab0,#8fd3f4)',
  'linear-gradient(135deg,#fccb90,#d57eeb)',
  'linear-gradient(135deg,#e0c3fc,#8ec5fc)',
  'linear-gradient(135deg,#f6d365,#fda085)',
  'linear-gradient(135deg,#cfd9df,#e2ebf0)',
  'linear-gradient(135deg,#43cea2,#185a9d)',
];
function gradientFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return GALLERY_GRADIENTS[Math.abs(h) % GALLERY_GRADIENTS.length];
}

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
    <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-3 p-4">
      {files.map(file => {
        const selected = selectedIds.has(file.id);
        const Icon = typeIcons[file.type] || File;
        const fileTags = tags.filter(t => file.tags.includes(t.id));
        const isRenaming = renamingId === file.id;
        const isImage = file.type === 'image';
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
            {/* Thumbnail — square gallery tile for images, fixed-height card for other types */}
            <div
              className={`${isImage ? 'aspect-square' : 'h-[88px]'} rounded-t-lg flex items-center justify-center ${isImage ? '' : (typeBgColors[file.type] || typeBgColors.other)} relative overflow-hidden`}
              style={isImage ? { backgroundImage: gradientFor(file.name) } : undefined}
            >
              {!isImage && (
                <Icon size={26} strokeWidth={1.2} className={typeIconColors[file.type] || typeIconColors.other} />
              )}
              {/* Format badge */}
              <span className={`absolute top-1.5 left-1.5 px-1.5 py-[1px] rounded text-xs tracking-wide font-medium ${
                isImage ? 'bg-black/30 text-white/85 backdrop-blur-sm' : 'bg-muted/50 text-muted-foreground/60'
              }`}>
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
      className="w-full bg-background border border-border text-xs text-foreground px-1.5 py-0.5 h-auto rounded-md shadow-sm focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/15 text-center"
      onClick={e => e.stopPropagation()}
    />
  );
}
