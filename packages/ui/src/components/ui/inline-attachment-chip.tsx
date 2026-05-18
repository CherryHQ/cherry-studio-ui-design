"use client"

// ===========================
// Inline Attachment Chip
// ===========================
// Renders a single attachment as a small pill that sits inline with text
// inside a rich-text composer. Different file types get different color
// treatments; hovering the chip reveals a preview popup with file detail
// (and a thumbnail for images).
//
// The chip itself is `contentEditable={false}` so it acts as an atomic
// unit when embedded inside a contentEditable parent — backspace / delete
// remove the whole chip, the caret can't enter it.

import * as React from "react";
import {
  Image as ImageIcon, FileText, FileCode2, FileArchive,
  Music, Video, Sheet, FileQuestion, FileType2,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";

// ----- Type → style map ---------------------------------------------------

type ChipKind = "image" | "doc" | "pdf" | "code" | "archive" | "audio" | "video" | "sheet" | "generic";

interface KindConfig {
  Icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  /** Type-coded color — only applied to the icon, never to the chip chrome. */
  iconCls: string;
  /** Short label shown on the preview popover. */
  hoverHint: string;
}

const KIND_CONFIG: Record<ChipKind, KindConfig> = {
  image:   { Icon: ImageIcon,    iconCls: "text-accent-pink",   hoverHint: "图片" },
  doc:     { Icon: FileText,     iconCls: "text-accent-blue",   hoverHint: "文档" },
  pdf:     { Icon: FileType2,    iconCls: "text-destructive",   hoverHint: "PDF" },
  code:    { Icon: FileCode2,    iconCls: "text-accent-violet", hoverHint: "代码" },
  archive: { Icon: FileArchive,  iconCls: "text-accent-orange", hoverHint: "压缩包" },
  audio:   { Icon: Music,        iconCls: "text-accent-amber",  hoverHint: "音频" },
  video:   { Icon: Video,        iconCls: "text-accent-indigo", hoverHint: "视频" },
  sheet:   { Icon: Sheet,        iconCls: "text-success",       hoverHint: "表格" },
  generic: { Icon: FileQuestion, iconCls: "text-muted-foreground", hoverHint: "文件" },
};

const EXT_TO_KIND: Record<string, ChipKind> = {
  png: "image", jpg: "image", jpeg: "image", gif: "image", webp: "image", svg: "image", heic: "image",
  pdf: "pdf",
  md: "doc", txt: "doc", doc: "doc", docx: "doc", rtf: "doc",
  ts: "code", tsx: "code", js: "code", jsx: "code", py: "code", go: "code", rs: "code",
  java: "code", sh: "code", yml: "code", yaml: "code", toml: "code", json: "code", html: "code", css: "code",
  zip: "archive", tar: "archive", gz: "archive", "7z": "archive", rar: "archive",
  mp3: "audio", wav: "audio", m4a: "audio", flac: "audio",
  mp4: "video", mov: "video", webm: "video", mkv: "video",
  xlsx: "sheet", xls: "sheet", csv: "sheet", tsv: "sheet",
};

export function getChipKind(ext: string): ChipKind {
  return EXT_TO_KIND[ext.toLowerCase()] || "generic";
}

// ----- Public types -------------------------------------------------------

export interface InlineAttachmentChipProps {
  /** File name (with extension). */
  name: string;
  /** File extension without dot, e.g. "png", "md". */
  ext: string;
  /** Human-readable size, e.g. "2.4 MB". */
  size?: string;
  /** Image preview URL — only used when kind === "image". */
  previewUrl?: string;
  /** Optional short text snippet for doc / code previews. */
  snippet?: string;
  /** Optional override of the kind classification. */
  kind?: ChipKind;
  /** Show a small remove button on hover that calls `onRemove`. */
  onRemove?: () => void;
  className?: string;
}

// ----- Component ----------------------------------------------------------

export function InlineAttachmentChip({
  name, ext, size, previewUrl, snippet, kind, onRemove, className,
}: InlineAttachmentChipProps) {
  const resolvedKind = kind ?? getChipKind(ext);
  const cfg = KIND_CONFIG[resolvedKind];
  const Icon = cfg.Icon;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <span
          contentEditable={false}
          data-slot="inline-attachment-chip"
          data-chip-kind={resolvedKind}
          className={cn(
            "inline-flex items-center gap-1 align-baseline mx-[1px]",
            "px-1.5 py-[1px] rounded-sm border font-medium leading-none",
            "text-[11px] cursor-default select-none",
            // Neutral chrome — color lives only in the icon below.
            "border-border/40 bg-muted/50 text-foreground/85",
            "hover:bg-muted/70 hover:border-border/60 transition-colors",
            className,
          )}
          title={name}
        >
          {resolvedKind === "image" && previewUrl ? (
            <img
              src={previewUrl}
              alt=""
              className="w-3 h-3 rounded-[2px] object-cover flex-shrink-0"
            />
          ) : (
            <Icon size={10} strokeWidth={2} className={cn("flex-shrink-0", cfg.iconCls)} />
          )}
          <span className="truncate max-w-[180px]">{name}</span>
          {ext && <span className="opacity-50 uppercase tracking-wide text-[9px]">{ext}</span>}
        </span>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" sideOffset={6} className="w-[260px] p-0 overflow-hidden">
        <ChipPreviewBody
          name={name} ext={ext} size={size}
          previewUrl={previewUrl} snippet={snippet}
          kind={resolvedKind} onRemove={onRemove}
        />
      </PopoverContent>
    </Popover>
  );
}

function ChipPreviewBody({
  name, ext, size, previewUrl, snippet, kind, onRemove,
}: Required<Pick<InlineAttachmentChipProps, "name" | "ext">> & {
  size?: string;
  previewUrl?: string;
  snippet?: string;
  kind: ChipKind;
  onRemove?: () => void;
}) {
  const cfg = KIND_CONFIG[kind];
  const Icon = cfg.Icon;
  return (
    <div>
      {kind === "image" && previewUrl ? (
        <div className="aspect-video w-full bg-muted/30 flex items-center justify-center overflow-hidden">
          <img src={previewUrl} alt={name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className={cn(
          "h-20 flex items-center justify-center",
          "bg-[image:linear-gradient(135deg,var(--color-muted)_25%,transparent_25%,transparent_50%,var(--color-muted)_50%,var(--color-muted)_75%,transparent_75%)]",
          "bg-[length:8px_8px] bg-muted/15",
        )}>
          <div className="w-12 h-12 rounded-md border border-border/40 bg-muted/50 flex items-center justify-center">
            <Icon size={22} strokeWidth={1.6} className={cfg.iconCls} />
          </div>
        </div>
      )}
      <div className="p-3 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-medium text-foreground truncate" title={name}>{name}</div>
          <span className="text-[10px] uppercase px-1.5 py-px rounded-sm border border-border/40 bg-muted/50 text-muted-foreground/80">
            {cfg.hoverHint}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
          {ext && <span className="font-mono uppercase">{ext}</span>}
          {ext && size && <span className="opacity-40">·</span>}
          {size && <span>{size}</span>}
        </div>
        {snippet && (
          <div className="text-[11px] text-muted-foreground/60 line-clamp-3 leading-relaxed pt-1 border-t border-border/30 mt-1.5">
            {snippet}
          </div>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="text-[11px] text-destructive/80 hover:text-destructive transition-colors pt-1.5"
          >
            移除附件
          </button>
        )}
      </div>
    </div>
  );
}
