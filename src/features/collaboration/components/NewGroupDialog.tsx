import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Input, Button, Popover, PopoverTrigger, PopoverContent } from '@cherry-studio/ui';
import { MOCK_AGENTS, MOCK_HUMANS } from '../data';
import { Avatar } from './Avatar';
import { AVATAR_OPTIONS } from '@/app/config/constants';
import { Check, Search } from 'lucide-react';

interface NewGroupDialogProps {
  open: boolean;
  onClose: () => void;
  /** Jump to 设置 → 效率 → 队友 to invite new teammates. The member pool here
   * only lists existing teammates + my Agents; adding people happens there. */
  onManageTeammates?: () => void;
}

export function NewGroupDialog({ open, onClose, onManageTeammates }: NewGroupDialogProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📋');
  const [emojiSearch, setEmojiSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Only my own agents can be invited at group-creation time; others' agents
  // join via their owner participating in the group.
  const myAgents = MOCK_AGENTS.filter(a => a.ownerId === 'me');

  // Emojis aren't text-searchable; treat the query as a literal include over
  // the glyphs so a pasted emoji can be located, otherwise show all.
  const filteredEmojis = useMemo(() => {
    if (!emojiSearch.trim()) return AVATAR_OPTIONS;
    return AVATAR_OPTIONS.filter(e => e.includes(emojiSearch.trim()));
  }, [emojiSearch]);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleClose = () => {
    setName('');
    setEmoji('📋');
    setEmojiSearch('');
    setSelected(new Set());
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-[460px]">
        <DialogHeader>
          <DialogTitle>发起群聊</DialogTitle>
          <DialogDescription>
            创建一个长期协作的群组。话题在群组内独立组织。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="text-[12px] text-foreground/80 block mb-1.5">图标与名称</label>
            {/* Emoji avatar sits inline with the name, mirroring 创建 Agent. */}
            <div className="flex items-center gap-2.5">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-xl bg-accent/30 border border-border/40 hover:bg-accent/50 transition-colors"
                  >
                    {emoji}
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[300px] p-2">
                  <div className="relative mb-2">
                    <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                    <Input
                      value={emojiSearch}
                      onChange={(e) => setEmojiSearch(e.target.value)}
                      placeholder="挑一个图标"
                      className="h-7 pl-6 pr-2 text-xs border border-border/40 bg-accent/15 focus-visible:ring-0 shadow-none"
                    />
                  </div>
                  <div className="grid grid-cols-8 gap-0.5 max-h-[180px] overflow-y-auto scrollbar-thin">
                    {filteredEmojis.map((e, i) => (
                      <button
                        key={`${e}-${i}`}
                        type="button"
                        onClick={() => setEmoji(e)}
                        className={`w-8 h-8 rounded-md flex items-center justify-center text-lg transition-colors ${
                          emoji === e ? 'bg-accent/60 ring-1 ring-foreground/25' : 'hover:bg-accent/50'
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <Input
                placeholder="例如：产品方案讨论组"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 text-[12.5px]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[12px] text-foreground/80">
                成员 <span className="text-muted-foreground">（已选 {selected.size}）</span>
              </label>
              {onManageTeammates && (
                <button
                  type="button"
                  onClick={onManageTeammates}
                  className="text-[11px] text-primary hover:opacity-80"
                >
                  管理队友 →
                </button>
              )}
            </div>
            <div className="border border-border rounded-md max-h-[260px] overflow-y-auto">
              <SectionLabel>联系人</SectionLabel>
              {MOCK_HUMANS.map(h => (
                <MemberRow
                  key={h.id}
                  member={h}
                  selected={selected.has(h.id)}
                  onClick={() => toggle(h.id)}
                />
              ))}
              {myAgents.length > 0 && (
                <>
                  <SectionLabel>Agent</SectionLabel>
                  {myAgents.map(a => (
                    <MemberRow
                      key={a.id}
                      member={a}
                      selected={selected.has(a.id)}
                      onClick={() => toggle(a.id)}
                    />
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={handleClose}>取消</Button>
            <Button disabled={!name.trim() || selected.size === 0} onClick={handleClose}>
              创建群组
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  );
}

function MemberRow({
  member,
  selected,
  onClick,
}: {
  member: typeof MOCK_HUMANS[number] | typeof MOCK_AGENTS[number];
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-accent/40 transition-colors"
    >
      <Avatar member={member as any} size="sm" />
      <div className="flex-1 min-w-0 text-left">
        <div className="text-[12.5px] text-foreground truncate">{member.name}</div>
        <div className="text-[10px] text-muted-foreground truncate">{member.email}</div>
      </div>
      <div
        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selected ? 'bg-primary border-primary text-primary-foreground' : 'border-border'}`}
      >
        {selected && <Check size={11} strokeWidth={2.4} />}
      </div>
    </button>
  );
}
