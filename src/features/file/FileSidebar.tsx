import React from 'react';
import {
  Files,
  FileText, Image as ImageIcon, FileCode, Music, Video, FileQuestion,
} from 'lucide-react';
import { Button } from '@cherry-studio/ui';
import type { FileFolder } from './mockData';

export type SidebarFilter =
  | { kind: 'library'; value: 'all' | 'recent' | 'starred' | 'trash' }
  | { kind: 'type'; value: 'image' | 'video' | 'audio' | 'text' | 'document' | 'other' }
  | { kind: 'folder'; value: string }
  | { kind: 'tag'; value: string };

type SidebarEntry =
  | { kind: 'library'; value: 'all' | 'recent' | 'trash'; label: string; icon: React.ElementType; countKey: string }
  | { kind: 'type'; value: 'image' | 'video' | 'audio' | 'text' | 'document' | 'other'; label: string; icon: React.ElementType; countKey: string };

const SIDEBAR_ENTRIES: SidebarEntry[] = [
  { kind: 'type',    value: 'image',    label: '图片',     icon: ImageIcon,   countKey: 'type_image' },
  { kind: 'type',    value: 'video',    label: '视频',     icon: Video,       countKey: 'type_video' },
  { kind: 'type',    value: 'audio',    label: '音频',     icon: Music,       countKey: 'type_audio' },
  { kind: 'type',    value: 'text',     label: '文本',     icon: FileCode,    countKey: 'type_text' },
  { kind: 'type',    value: 'document', label: '文档',     icon: FileText,    countKey: 'type_document' },
  { kind: 'type',    value: 'other',    label: '其他',     icon: FileQuestion, countKey: 'type_other' },
  { kind: 'library', value: 'all',      label: '全部文件', icon: Files,       countKey: 'all' },
];

export function FileSidebar({
  filter,
  onFilterChange,
  fileCounts,
}: {
  filter: SidebarFilter;
  onFilterChange: (f: SidebarFilter) => void;
  folders: FileFolder[];
  fileCounts: Record<string, number>;
  onCreateFolder: (name: string, parentId: string | null) => void;
}) {
  const isActive = (entry: SidebarEntry) =>
    filter.kind === entry.kind && filter.value === entry.value;

  return (
    <div className="w-[180px] flex-shrink-0 border-r border-border/30 flex flex-col overflow-y-auto select-none scrollbar-thin-xs">
      <div className="px-1.5 pt-2 pb-1 space-y-[1px]">
        {SIDEBAR_ENTRIES.map(entry => {
          const active = isActive(entry);
          const Icon = entry.icon;
          const count = fileCounts[entry.countKey];
          return (
            <Button size="inline"
              key={`${entry.kind}-${entry.value}`}
              variant="ghost"
              onClick={() => onFilterChange({ kind: entry.kind, value: entry.value } as SidebarFilter)}
              className={`w-full flex items-center gap-2 px-2.5 py-[5px] rounded-md transition-colors text-sm ${
                active
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              }`}
            >
              <Icon size={13} strokeWidth={1.5} className="flex-shrink-0 text-muted-foreground/60" />
              <span className="flex-1 text-left truncate">{entry.label}</span>
              {count !== undefined && count > 0 && (
                <span className="text-xs text-muted-foreground/40">{count}</span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
