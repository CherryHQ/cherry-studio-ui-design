import React from 'react';
import { getFileIcon } from '@/app/utils/fileIcons';
import type { FileAttachment } from '@/app/types/chat';

// ===========================
// File Attachments Display
// ===========================
// Renders image previews and file chips for message attachments.
// Extracted from AssistantRunPage for shared use.

export function AttachmentList({
  attachments,
  onOpen,
}: {
  attachments: FileAttachment[];
  onOpen?: (att: FileAttachment) => void;
}) {
  const imageAttachments = attachments.filter(a => a.previewUrl);
  const fileAttachments = attachments.filter(a => !a.previewUrl);

  return (
    <div className="mb-2">
      {/* Image previews */}
      {imageAttachments.length > 0 && (
        <div className="flex gap-1.5 mb-1.5 flex-wrap justify-end">
          {imageAttachments.map(att => (
            <button
              type="button"
              key={att.id}
              onClick={onOpen ? () => onOpen(att) : undefined}
              className={`relative group rounded-lg overflow-hidden border border-border/30 w-[80px] h-[80px] ${
                onOpen ? 'hover:border-border/60 active:scale-[0.98] transition-all cursor-pointer' : ''
              }`}
            >
              <img src={att.previewUrl} alt={att.name} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                <span className="text-xs text-white/90 truncate block">{att.name}</span>
              </div>
            </button>
          ))}
        </div>
      )}
      {/* File chips */}
      {fileAttachments.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-1.5 justify-end">
          {fileAttachments.map(att => (
            <button
              type="button"
              key={att.id}
              onClick={onOpen ? () => onOpen(att) : undefined}
              className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent/50 border border-border/30 text-left ${
                onOpen ? 'hover:bg-accent/70 hover:border-border/60 active:scale-[0.99] transition-all cursor-pointer' : ''
              }`}
              title={onOpen ? `打开 ${att.name}` : att.name}
            >
              {getFileIcon(att.type)}
              <div className="min-w-0">
                <div className="text-sm text-foreground truncate max-w-[120px]">{att.name}</div>
                <div className="text-xs text-muted-foreground/50">{att.size}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}