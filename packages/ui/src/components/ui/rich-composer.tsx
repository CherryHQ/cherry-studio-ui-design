"use client"

// ===========================
// Rich Composer
// ===========================
// A contentEditable text area that supports inline file/image chips
// mixed with text — the chat-input equivalent of a one-line rich text
// editor. Designed for the chat composer so users can drop attachments
// inline with their prompt:
//
//   "帮我分析 [📄 spec.md] 并用 [🖼 design.png] 做参考。"
//
// API surface is intentionally small:
// - `value` / `onChange` give plain-text content with chip placeholders
// - `attachments` is the React-rendered list of inline chips (the parent
//   manages the list; this component never mutates it directly)
// - Imperative ref methods to insert a chip, focus, and clear

import * as React from "react";
import { cn } from "../../lib/utils";
import { InlineAttachmentChip, type InlineAttachmentChipProps } from "./inline-attachment-chip";

export interface ComposerAttachment extends InlineAttachmentChipProps {
  /** Stable id so React can key it; also used to identify the chip on remove. */
  id: string;
}

export interface RichComposerProps {
  /** Placeholder shown when the editor is empty. */
  placeholder?: string;
  /** Ordered list of inline attachments. Each one renders as a chip at
   *  the head of the editor for now; future versions can carry an
   *  insertion position. */
  attachments: ComposerAttachment[];
  /** Optional class applied to the contentEditable area. */
  className?: string;
  /** Forwarded onKeyDown (so callers can hook Enter-to-send). */
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  /** Forwarded onPaste (so callers can intercept file paste). */
  onPaste?: (e: React.ClipboardEvent<HTMLDivElement>) => void;
  /** Called when the user removes a chip (clicking the remove button in
   *  the chip preview). */
  onRemoveAttachment?: (id: string) => void;
}

export interface RichComposerHandle {
  /** Move focus into the editor, placing the caret at the end. */
  focus: () => void;
  /** Clear all editable text content (chips are untouched — the parent
   *  controls them via the `attachments` prop). */
  clearText: () => void;
  /** Get the current plain-text content typed by the user. */
  getText: () => string;
}

export const RichComposer = React.forwardRef<RichComposerHandle, RichComposerProps>(function RichComposer(
  { placeholder, attachments, className, onKeyDown, onPaste, onRemoveAttachment }, ref,
) {
  const editorRef = React.useRef<HTMLDivElement>(null);

  React.useImperativeHandle(ref, () => ({
    focus: () => {
      const el = editorRef.current;
      if (!el) return;
      el.focus();
      // Move caret to end
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    },
    clearText: () => {
      const el = editorRef.current;
      if (!el) return;
      el.textContent = "";
    },
    getText: () => editorRef.current?.textContent ?? "",
  }), []);

  return (
    <div className={cn("relative", className)}>
      {/* Chip strip — sits inline with text by floating left. Each chip is
          rendered before the editor so it appears at the start of the
          composed line. Visually it reads as one continuous rich-text
          line because chips and text share the same baseline + line height. */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        className={cn(
          // Replicates the old textarea visual exactly (no border — parent
          // owns the bordered container).
          "w-full bg-transparent text-sm text-foreground outline-none",
          "min-h-[88px] max-h-[140px] leading-[1.6] px-3.5 pt-[10px] pb-[36px]",
          "overflow-y-auto scrollbar-thin",
          // Empty-state placeholder using `before:content` driven by data attribute.
          "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60 empty:before:pointer-events-none",
        )}
      >
        {attachments.map((att) => (
          <React.Fragment key={att.id}>
            <InlineAttachmentChip
              {...att}
              onRemove={onRemoveAttachment ? () => onRemoveAttachment(att.id) : undefined}
            />
            {" "}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
});
