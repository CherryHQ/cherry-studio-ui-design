import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Button,
  EmojiPicker,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
} from '@cherry-studio/ui';
import { toast } from 'sonner';
import { Smile, AtSign, Image as ImageIcon, Paperclip, Send, Bot, FileCode, X } from 'lucide-react';
import { CollabMember, Group, findMember, isAgent } from '../data';
import { Avatar } from './Avatar';

export interface AttachedArtifact {
  fileName: string;
  label: string;
  emoji: string;
  html: string;
}

interface NewTopicDialogProps {
  open: boolean;
  group: Group | null;
  onClose: () => void;
  /**
   * When set, the dialog opens as a "share-into-group" composer: the
   * artifact is pre-attached and displayed below the text area. On send,
   * `onSubmit(text, artifact)` fires so callers can persist both pieces.
   */
  attachedArtifact?: AttachedArtifact;
  onSubmit?: (text: string, artifact: AttachedArtifact | null) => void;
}

export function NewTopicDialog({ open, group, onClose, attachedArtifact, onSubmit }: NewTopicDialogProps) {
  const [draft, setDraft] = useState('');
  const [keepArtifact, setKeepArtifact] = useState(true);
  const [mentionOpen, setMentionOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Track caret across focus changes so popover selections insert in the right place.
  const caretRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  useEffect(() => {
    if (open) {
      setDraft('');
      setKeepArtifact(true);
      caretRef.current = { start: 0, end: 0 };
      const t = window.setTimeout(() => textareaRef.current?.focus(), 60);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  const rememberCaret = () => {
    const el = textareaRef.current;
    if (!el) return;
    caretRef.current = { start: el.selectionStart, end: el.selectionEnd };
  };

  // Insert text at the last-remembered caret position, then restore focus.
  const insertAtCaret = (insert: string) => {
    const { start, end } = caretRef.current;
    setDraft(prev => {
      const safeStart = Math.min(start, prev.length);
      const safeEnd = Math.min(end, prev.length);
      const next = prev.slice(0, safeStart) + insert + prev.slice(safeEnd);
      const newCaret = safeStart + insert.length;
      // Restore caret + focus after React commits the new value
      window.requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.focus();
        el.setSelectionRange(newCaret, newCaret);
        caretRef.current = { start: newCaret, end: newCaret };
      });
      return next;
    });
  };

  // With an attached artifact, an empty comment still counts as a valid
  // share (the artifact itself carries the content).
  const canSend = draft.trim().length > 0 || (!!attachedArtifact && keepArtifact);

  const handleSend = () => {
    if (!canSend) return;
    const artifact = attachedArtifact && keepArtifact ? attachedArtifact : null;
    if (onSubmit) {
      onSubmit(draft.trim(), artifact);
    } else {
      toast.success('已发起话题', {
        description: group ? `话题已发布到「${group.name}」` : undefined,
      });
    }
    onClose();
  };

  // Resolve group members for the @ picker
  const members: CollabMember[] = group
    ? group.members
        .map(id => findMember(id))
        .filter((m): m is CollabMember => !!m && m.id !== 'me')
    : [];
  const humans = members.filter(m => !isAgent(m));
  const agents = members.filter(isAgent);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[520px] gap-0 p-0 overflow-hidden">
        {/* Header — group context, kept minimal */}
        <div className="flex items-center px-5 h-11 border-b border-border/50">
          <DialogTitle className="text-[13px] font-normal leading-none">发起话题</DialogTitle>
          {group && (
            <DialogDescription className="ml-2 text-[11.5px] text-muted-foreground truncate">
              # {group.name}
            </DialogDescription>
          )}
        </div>

        {/* Composer — single content area, no heavy formatting toolbar */}
        <div className="px-5 pt-4 pb-2">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onSelect={rememberCaret}
            onKeyUp={rememberCaret}
            onClick={rememberCaret}
            onBlur={rememberCaret}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={attachedArtifact ? '写点什么再分享…（选填）' : '分享你的想法…'}
            rows={attachedArtifact ? 5 : 8}
            className="w-full resize-none bg-transparent text-[13px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60"
          />
          {attachedArtifact && keepArtifact && (
            <div className="mt-2 flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-border/40 bg-accent/20">
              <div className="w-8 h-8 rounded-md bg-accent-orange-muted text-accent-orange flex items-center justify-center flex-shrink-0">
                <FileCode size={14} strokeWidth={1.6} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] text-foreground truncate">{attachedArtifact.fileName}</div>
                <div className="text-[10.5px] text-muted-foreground/60">HTML 原型 · 从智能体分享</div>
              </div>
              <button
                type="button"
                onClick={() => setKeepArtifact(false)}
                aria-label="移除附件"
                title="移除附件"
                className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Bottom toolbar — inline actions + send */}
        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-0.5">
            <EmojiPicker
              onSelect={(emoji) => insertAtCaret(emoji)}
              trigger={
                <button
                  type="button"
                  title="表情"
                  aria-label="表情"
                  onMouseDown={rememberCaret}
                  className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                >
                  <Smile size={14} strokeWidth={1.6} />
                </button>
              }
            />

            <Popover open={mentionOpen} onOpenChange={setMentionOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  title="@ 提及"
                  aria-label="@ 提及"
                  onMouseDown={rememberCaret}
                  className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                >
                  <AtSign size={14} strokeWidth={1.6} />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                sideOffset={4}
                className="w-[260px] p-0 rounded-[var(--radius-card)]"
              >
                <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  提及群成员
                </div>
                <ScrollArea className="max-h-[260px]">
                  {humans.length === 0 && agents.length === 0 && (
                    <div className="px-3 py-6 text-center text-[11.5px] text-muted-foreground">
                      群内还没有其他成员
                    </div>
                  )}
                  {humans.length > 0 && (
                    <>
                      <SectionLabel>联系人</SectionLabel>
                      {humans.map(m => (
                        <MemberRow
                          key={m.id}
                          member={m}
                          onSelect={() => {
                            insertAtCaret(`@${m.name} `);
                            setMentionOpen(false);
                          }}
                        />
                      ))}
                    </>
                  )}
                  {agents.length > 0 && (
                    <>
                      <SectionLabel>Agent</SectionLabel>
                      {agents.map(m => (
                        <MemberRow
                          key={m.id}
                          member={m}
                          onSelect={() => {
                            insertAtCaret(`@${m.name} `);
                            setMentionOpen(false);
                          }}
                        />
                      ))}
                    </>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>

            <ToolbarButton title="图片" icon={ImageIcon} onClick={() => {}} />
            <ToolbarButton title="附件" icon={Paperclip} onClick={() => {}} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] text-muted-foreground/70 hidden sm:inline">
              ⌘ + Enter 发送
            </span>
            <Button
              size="sm"
              disabled={!canSend}
              onClick={handleSend}
              className="gap-1.5"
            >
              <Send size={12} strokeWidth={2} />
              发起
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ToolbarButton({
  icon: Icon,
  title,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
    >
      <Icon size={14} strokeWidth={1.6} />
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
      {children}
    </div>
  );
}

function MemberRow({ member, onSelect }: { member: CollabMember; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-accent/50 transition-colors"
    >
      <Avatar member={member} size="sm" />
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-1 text-[12.5px] text-foreground truncate">
          <span className="truncate">{member.name}</span>
          {isAgent(member) && (
            <Bot size={10} strokeWidth={1.8} className="text-muted-foreground flex-shrink-0" />
          )}
        </div>
        <div className="text-[10px] text-muted-foreground truncate">{member.email}</div>
      </div>
    </button>
  );
}
