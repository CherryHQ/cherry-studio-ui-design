import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Input, Button } from '@cherry-studio/ui';
import { Group, MOCK_AGENTS, MOCK_HUMANS } from '../data';
import { Avatar } from './Avatar';
import { Check, Search, X } from 'lucide-react';

interface AddMemberDialogProps {
  open: boolean;
  group: Group | null;
  onClose: () => void;
  onConfirm?: (memberIds: string[]) => void;
}

export function AddMemberDialog({ open, group, onClose, onConfirm }: AddMemberDialogProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');

  // Reset selection + search whenever the dialog is reopened or target group changes
  useEffect(() => {
    if (open) {
      setSelected(new Set());
      setQuery('');
    }
  }, [open, group?.id]);

  const existingIds = useMemo(
    () => new Set(group?.members ?? []),
    [group?.members],
  );

  const normalizedQuery = query.trim().toLowerCase();
  const matchesQuery = (name: string, email: string) =>
    !normalizedQuery ||
    name.toLowerCase().includes(normalizedQuery) ||
    email.toLowerCase().includes(normalizedQuery);

  // Only humans not already in the group, filtered by search
  const candidateHumans = useMemo(
    () => MOCK_HUMANS.filter(h => !existingIds.has(h.id) && matchesQuery(h.name, h.email)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [existingIds, normalizedQuery],
  );

  // Only my own agents not already in the group (others' agents arrive via their owner)
  const candidateAgents = useMemo(
    () =>
      MOCK_AGENTS.filter(
        a => a.ownerId === 'me' && !existingIds.has(a.id) && matchesQuery(a.name, a.email),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [existingIds, normalizedQuery],
  );

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    onConfirm?.(Array.from(selected));
    onClose();
  };

  const empty = candidateHumans.length === 0 && candidateAgents.length === 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[460px]">
        <DialogHeader>
          <DialogTitle>添加成员</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="text-[12px] text-foreground/80 block mb-1.5">
              成员 <span className="text-muted-foreground">（已选 {selected.size}）</span>
            </label>

            {/* Search box */}
            <div className="relative mb-2">
              <Search
                size={13}
                strokeWidth={1.8}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索联系人或 Agent"
                className="pl-7 pr-7 h-8 text-[12.5px]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  title="清除"
                  aria-label="清除搜索"
                >
                  <X size={11} strokeWidth={2} />
                </button>
              )}
            </div>

            <div className="border border-border rounded-md max-h-[260px] overflow-y-auto">
              {empty ? (
                <div className="text-center text-[12px] text-muted-foreground py-8 px-3">
                  {normalizedQuery ? '没有匹配的联系人' : '通讯录里的联系人都已在群里'}
                </div>
              ) : (
                <>
                  {candidateHumans.length > 0 && (
                    <>
                      <SectionLabel>联系人</SectionLabel>
                      {candidateHumans.map(h => (
                        <MemberRow
                          key={h.id}
                          member={h}
                          selected={selected.has(h.id)}
                          onClick={() => toggle(h.id)}
                        />
                      ))}
                    </>
                  )}
                  {candidateAgents.length > 0 && (
                    <>
                      <SectionLabel>Agent</SectionLabel>
                      {candidateAgents.map(a => (
                        <MemberRow
                          key={a.id}
                          member={a}
                          selected={selected.has(a.id)}
                          onClick={() => toggle(a.id)}
                        />
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={onClose}>取消</Button>
            <Button disabled={selected.size === 0} onClick={handleConfirm}>
              添加（{selected.size}）
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
