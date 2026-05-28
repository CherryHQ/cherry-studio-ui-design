import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Link2, X, Hash, Users as UsersIcon, Bot, FileText, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '@cherrystudio/ui/components/primitives/dialog';
import { MOCK_GROUPS, MOCK_HUMANS, type Group, type CollabUser } from '../data';
import { Avatar } from './Avatar';

// What's being shared. The dialog renders a tiny preview block so users
// have context about which artifact they're forwarding.
export type ShareItem =
  | { kind: 'agent';      title: string; subtitle?: string; emoji?: string }
  | { kind: 'group';      title: string; subtitle?: string }
  | { kind: 'topic';      title: string; subtitle?: string }
  | { kind: 'attachment'; title: string; subtitle?: string; fileKind?: 'file' | 'image' | 'link' };

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  item: ShareItem | null;
}

// Unified recipient identity — groups stay as themselves, humans stand on
// their own (and may auto-create a dyad on submit).
type Recipient =
  | { kind: 'group';  id: string; group: Group }
  | { kind: 'human';  id: string; human: CollabUser };

// Feishu-style "转发" dialog. The top is a combobox picker — selected
// recipients render as chips inside the picker; focusing or typing opens a
// dropdown of candidates. Below the picker, a compact preview shows the
// artifact being forwarded, then a留言 composer, then the footer actions.
export function ShareDialog({ open, onClose, item }: ShareDialogProps) {
  const [query, setQuery] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selected, setSelected] = useState<Recipient[]>([]);
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Reset state whenever the dialog opens with a new item.
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected([]);
      setMessage('');
      setPickerOpen(true);
    }
  }, [open, item?.title]);

  // Close the dropdown when clicking outside the picker.
  useEffect(() => {
    if (!pickerOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!pickerRef.current) return;
      if (!pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [pickerOpen]);

  // Build candidate list — groups first, then humans. Filter by query.
  const candidates = useMemo<Recipient[]>(() => {
    const q = query.trim().toLowerCase();
    const matchGroup = (g: Group) => !q || g.name.toLowerCase().includes(q);
    const matchHuman = (h: CollabUser) =>
      !q || h.name.toLowerCase().includes(q) || h.email.toLowerCase().includes(q);
    return [
      ...MOCK_GROUPS.filter(matchGroup).map<Recipient>(g => ({ kind: 'group', id: g.id, group: g })),
      ...MOCK_HUMANS.filter(matchHuman).map<Recipient>(h => ({ kind: 'human', id: h.id, human: h })),
    ];
  }, [query]);

  const isSelected = (r: Recipient) => selected.some(s => s.kind === r.kind && s.id === r.id);
  const toggle = (r: Recipient) => {
    setSelected(prev => {
      const exists = prev.find(s => s.kind === r.kind && s.id === r.id);
      return exists
        ? prev.filter(s => !(s.kind === r.kind && s.id === r.id))
        : [...prev, r];
    });
    setQuery('');
    inputRef.current?.focus();
  };
  const remove = (r: Recipient) =>
    setSelected(prev => prev.filter(s => !(s.kind === r.kind && s.id === r.id)));

  const handleCopyLink = () => {
    toast.success('已复制分享链接');
  };

  const handleSubmit = () => {
    if (selected.length === 0) return;
    let createdDyads = 0;
    selected.forEach(r => {
      if (r.kind !== 'human') return;
      const existing = MOCK_GROUPS.find(g => g.isDyad && g.members.includes('me') && g.members.includes(r.id));
      if (existing) return;
      const newGroup: Group = {
        id: `g-dyad-auto-${r.id}-${Date.now()}`,
        name: `与${r.human.name}的协作`,
        members: ['me', r.id],
        topics: [],
        agentMentionConfig: { ownerCanMention: true, othersCanMentionMyAgent: false },
        isDyad: true,
        lastActivityLabel: '刚刚开始协作',
        lastActivityTime: '刚刚',
      };
      MOCK_GROUPS.push(newGroup);
      createdDyads += 1;
    });
    const noun = item ? itemNoun(item) : '内容';
    let msg = `已分别发送${noun}到 ${selected.length} 个会话`;
    if (createdDyads > 0) msg += `（新建 ${createdDyads} 个单聊）`;
    if (message.trim()) msg += '，附带留言';
    toast.success(msg);
    onClose();
  };

  // ⌘/Ctrl + Enter from the textarea — Feishu shortcut.
  const onComposerKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-[460px] sm:!max-w-[460px] !w-[min(460px,90vw)] !rounded-2xl !p-0 !gap-0 !grid-cols-1 overflow-visible border border-border/20 shadow-xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 h-11 border-b border-border/15 flex-shrink-0">
          <span className="text-[13px] font-medium text-foreground">转发</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground/55 hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-4 py-3 space-y-3">
          {/* Combobox picker — chips + input. Click to open the dropdown. */}
          <div className="relative" ref={pickerRef}>
            <div
              onClick={() => { setPickerOpen(true); inputRef.current?.focus(); }}
              className={`min-h-[36px] flex flex-wrap items-center gap-1 px-2 py-1 rounded-md border bg-background cursor-text transition-colors ${
                pickerOpen ? 'border-primary/60 ring-1 ring-primary/20' : 'border-border/60 hover:border-border'
              }`}
            >
              {selected.length === 0 && !pickerOpen && (
                <span className="inline-flex items-center gap-1.5 px-1 text-muted-foreground text-[12.5px]">
                  <Search size={12} strokeWidth={1.8} />
                  搜索群组、联系人…
                </span>
              )}
              {selected.map(r => (
                <RecipientChip key={`${r.kind}:${r.id}`} recipient={r} onRemove={() => remove(r)} />
              ))}
              {(pickerOpen || selected.length > 0) && (
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPickerOpen(true); }}
                  onFocus={() => setPickerOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !query && selected.length > 0) {
                      remove(selected[selected.length - 1]);
                    }
                  }}
                  placeholder={selected.length === 0 ? '搜索群组、联系人…' : ''}
                  className="flex-1 min-w-[80px] bg-transparent text-[12.5px] text-foreground outline-none placeholder:text-muted-foreground/60 px-1 py-0.5"
                />
              )}
            </div>

            {/* Dropdown — recipient candidates */}
            {pickerOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 max-h-[260px] overflow-y-auto rounded-md border border-border/60 bg-popover shadow-lg py-1">
                <div className="px-2.5 pt-1.5 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  最近对话
                </div>
                {candidates.length === 0 && (
                  <div className="px-3 py-6 text-center text-[11.5px] text-muted-foreground">
                    没有匹配的群组或联系人
                  </div>
                )}
                {candidates.map(r => (
                  <CandidateRow
                    key={`${r.kind}:${r.id}`}
                    recipient={r}
                    selected={isSelected(r)}
                    onToggle={() => toggle(r)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Artifact preview — compact single-row card with chevron. */}
          {item && <SharePreview item={item} />}

          {/* Composer — leaves room for the user to add a留言 (note). */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={onComposerKeyDown}
            placeholder="留言（可@成员）"
            rows={4}
            className="w-full resize-none rounded-md border border-border/60 bg-background px-3 py-2 text-[12.5px] text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-colors"
          />
        </div>

        {/* Footer — copy link on the left, cancel + primary action on the right */}
        <div className="flex items-center justify-between gap-2 px-4 h-12 border-t border-border/15 flex-shrink-0">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-2 h-8 rounded-md text-[12px] text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
          >
            <Link2 size={13} strokeWidth={1.8} />
            复制链接
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 h-8 rounded-md text-[12px] border border-border text-foreground hover:bg-accent/40 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={selected.length === 0}
              title="分别发送 (⌘/Ctrl + Enter)"
              className={`px-3 h-8 rounded-md text-[12px] inline-flex items-center gap-1.5 transition-colors ${
                selected.length === 0
                  ? 'bg-primary/40 text-primary-foreground/70 cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              分别发送
              <span className="text-[10.5px] opacity-80">⌘+Enter</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Small chip — selected recipient inside the picker, with a × to remove.
function RecipientChip({ recipient, onRemove }: { recipient: Recipient; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 pl-1 pr-1.5 py-0.5 rounded-full bg-foreground/[0.06] text-[12px] text-foreground/90 max-w-[180px]">
      {recipient.kind === 'group' ? (
        <span className="w-4 h-4 rounded-full bg-foreground/[0.08] text-muted-foreground flex items-center justify-center flex-shrink-0">
          {recipient.group.isDyad ? <UsersIcon size={9} strokeWidth={2} /> : <Hash size={9} strokeWidth={2} />}
        </span>
      ) : (
        <Avatar member={recipient.human} size="xs" />
      )}
      <span className="truncate">{recipient.kind === 'group' ? recipient.group.name : recipient.human.name}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/[0.08]"
        aria-label="移除"
      >
        <X size={9} strokeWidth={2.5} />
      </button>
    </span>
  );
}

// Dropdown row — group or human candidate.
function CandidateRow({ recipient, selected, onToggle }: { recipient: Recipient; selected: boolean; onToggle: () => void }) {
  if (recipient.kind === 'group') {
    const g = recipient.group;
    return (
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 transition-colors ${selected ? 'bg-primary/[0.08]' : 'hover:bg-accent/40'}`}
      >
        <div className="w-6 h-6 rounded-md flex items-center justify-center bg-foreground/[0.06] text-muted-foreground flex-shrink-0">
          {g.isDyad ? <UsersIcon size={12} strokeWidth={1.8} /> : <Hash size={12} strokeWidth={1.8} />}
        </div>
        <div className="flex-1 min-w-0 text-left text-[12.5px] text-foreground truncate">
          {g.name}
          <span className="text-muted-foreground ml-1">({g.members.length})</span>
        </div>
        {selected && <span className="text-[10px] text-primary flex-shrink-0">已选</span>}
      </button>
    );
  }
  const h = recipient.human;
  const existingDyad = MOCK_GROUPS.find(g => g.isDyad && g.members.includes('me') && g.members.includes(h.id));
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 transition-colors ${selected ? 'bg-primary/[0.08]' : 'hover:bg-accent/40'}`}
    >
      <Avatar member={h} size="sm" />
      <div className="flex-1 min-w-0 text-left">
        <div className="text-[12.5px] text-foreground truncate">{h.name}</div>
        <div className="text-[10px] text-muted-foreground truncate">{h.email}</div>
      </div>
      {!existingDyad && (
        <span className="text-[10px] text-muted-foreground bg-foreground/[0.05] px-1.5 py-0.5 rounded flex-shrink-0">
          新建单聊
        </span>
      )}
      {selected && <span className="text-[10px] text-primary flex-shrink-0 ml-1">已选</span>}
    </button>
  );
}

// Compact single-row artifact preview, like Feishu's "郑克kenny的话题 ›".
function SharePreview({ item }: { item: ShareItem }) {
  const Icon = previewIcon(item);
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-foreground/[0.04] border border-border/40">
      <div className="w-6 h-6 rounded-md flex items-center justify-center bg-background text-muted-foreground flex-shrink-0 text-[13px] leading-none border border-border/40">
        {item.kind === 'agent' && item.emoji ? item.emoji : <Icon size={12} strokeWidth={1.8} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-foreground/90 truncate">{item.title}</div>
        {item.subtitle && (
          <div className="text-[10.5px] text-muted-foreground truncate">{item.subtitle}</div>
        )}
      </div>
      <ChevronRight size={13} strokeWidth={1.8} className="text-muted-foreground flex-shrink-0" />
    </div>
  );
}

function itemNoun(item: ShareItem): string {
  switch (item.kind) {
    case 'agent':      return 'Agent';
    case 'group':      return '群组';
    case 'topic':      return '话题';
    case 'attachment': return '附件';
  }
}

function previewIcon(item: ShareItem): React.ElementType {
  switch (item.kind) {
    case 'agent':      return Bot;
    case 'group':      return Hash;
    case 'topic':      return Hash;
    case 'attachment':
      if (item.fileKind === 'image') return ImageIcon;
      if (item.fileKind === 'link')  return Link2;
      return FileText;
  }
}
