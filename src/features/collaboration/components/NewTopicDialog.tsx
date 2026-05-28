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
import { Smile, AtSign, Image as ImageIcon, Paperclip, Send, Bot } from 'lucide-react';
import { CollabMember, Group, findMember, isAgent } from '../data';
import { Avatar } from './Avatar';

interface NewTopicDialogProps {
  open: boolean;
  group: Group | null;
  onClose: () => void;
}

export function NewTopicDialog({ open, group, onClose }: NewTopicDialogProps) {
  const [draft, setDraft] = useState('');
  const [mentionOpen, setMentionOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Track caret across focus changes so popover selections insert in the right place.
  const caretRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  useEffect(() => {
    if (open) {
      setDraft('');
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

  const canSend = draft.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    toast.success('已发起话题', {
      description: group ? `话题已发布到「${group.name}」` : undefined,
    });
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
            placeholder="分享你的想法…"
            rows={8}
            className="w-full resize-none bg-transparent text-[13px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60"
          />
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
