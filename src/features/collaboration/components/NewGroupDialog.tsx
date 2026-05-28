import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Input, Button } from '@cherry-studio/ui';
import { MOCK_AGENTS, MOCK_HUMANS } from '../data';
import { Avatar } from './Avatar';
import { Check } from 'lucide-react';

interface NewGroupDialogProps {
  open: boolean;
  onClose: () => void;
}

export function NewGroupDialog({ open, onClose }: NewGroupDialogProps) {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Only my own agents can be invited at group-creation time; others' agents
  // join via their owner participating in the group.
  const myAgents = MOCK_AGENTS.filter(a => a.ownerId === 'me');

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
            <label className="text-[12px] text-foreground/80 block mb-1.5">群组名称</label>
            <Input
              placeholder="例如：产品方案讨论组"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-[12.5px]"
            />
          </div>

          <div>
            <label className="text-[12px] text-foreground/80 block mb-1.5">
              成员 <span className="text-muted-foreground">（已选 {selected.size}）</span>
            </label>
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
