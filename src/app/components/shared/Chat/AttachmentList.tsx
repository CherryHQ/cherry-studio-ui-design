import React from 'react';
import { getFileIcon } from '@/app/utils/fileIcons';
import type { FileAttachment } from '@/app/types/chat';

// ===========================
// File Attachments Display
// ===========================
// Renders image previews and file chips for message attachments.
// Extracted from AssistantRunPage for shared use.

export function AttachmentList({ attachments }: { attachments: FileAttachment[] }) {
  const imageAttachments = attachments.filter(a => a.previewUrl);
  const fileAttachments = attachments.filter(a => !a.previewUrl);

  return (
    <div className="mb-2">
      {/* Image previews */}
      {imageAttachments.length > 0 && (
        <div className="flex gap-1.5 mb-1.5 flex-wrap justify-end">
          {imageAttachments.map(att => (
            <div key={att.id} className="relative group rounded-lg overflow-hidden border border-border/30 w-[80px] h-[80px]">
              <img src={att.previewUrl} alt={att.name} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                <span className="text-xs text-white/90 truncate block">{att.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* File chips */}
      {fileAttachments.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-1.5 justify-end">
          {fileAttachments.map(att => (
            <div key={att.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent/50 border border-border/30">
              {getFileIcon(att.type)}
              <div className="min-w-0">
                <div className="text-sm text-foreground truncate max-w-[120px]">{att.name}</div>
                <div className="text-xs text-muted-foreground/50">{att.size}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}