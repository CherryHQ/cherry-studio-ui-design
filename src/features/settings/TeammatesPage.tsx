import { useMemo, useState } from 'react';
import { Plus, Search, MoreHorizontal, X, Send } from 'lucide-react';
import { toast } from 'sonner';
import {
  Button, Input, Typography,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@cherry-studio/ui';
import { CURRENT_USER, MOCK_HUMANS } from '@/features/collaboration/data';

// ===========================
// Teammates (设置 → 效率 → 队友)
// ===========================
// Workspace-member management, modeled after Syncless's 队友 page. This is the
// social layer that used to live in the standalone 协作 module: teammates here
// are exactly the human members you can pull into a 项目组 (群聊) from the 工作
// module. Inviting people happens here (single source of truth); the group
// creation dialog only *picks* from this list.

type MemberStatus = 'joined' | 'invited';
type MemberRole = 'Owner' | 'Member';

interface Teammate {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  avatarInitial: string;
  role: MemberRole;
  status: MemberStatus;
}

// Seed from the same people the group member-pool draws on, so 队友 and 建群
//成员 stay consistent. The current user is the workspace Owner.
const SEED_TEAMMATES: Teammate[] = [
  {
    id: CURRENT_USER.id,
    name: CURRENT_USER.name,
    email: CURRENT_USER.email,
    avatarColor: CURRENT_USER.avatarColor,
    avatarInitial: CURRENT_USER.avatarInitial,
    role: 'Owner',
    status: 'joined',
  },
  ...MOCK_HUMANS.map((h, i): Teammate => ({
    id: h.id,
    name: h.name,
    email: h.email,
    avatarColor: h.avatarColor,
    avatarInitial: h.avatarInitial,
    role: 'Member',
    // A couple seeded as 已邀请 to show both states.
    status: i % 3 === 2 ? 'invited' : 'joined',
  })),
];

const STATUS_LABEL: Record<MemberStatus, string> = { joined: '已加入', invited: '已邀请' };

export function TeammatesPage() {
  const [members, setMembers] = useState<Teammate[]>(SEED_TEAMMATES);
  const [query, setQuery] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
  }, [members, query]);

  const sendInvite = () => {
    const email = inviteEmail.trim();
    if (!email) return;
    if (members.some(m => m.email === email)) {
      toast.warning('该邮箱已在队友列表中');
      return;
    }
    const initial = email[0]?.toUpperCase() ?? '?';
    setMembers(prev => [
      ...prev,
      {
        id: `invite-${email}`,
        name: email.split('@')[0],
        email,
        avatarColor: 'from-slate-400 to-slate-500',
        avatarInitial: initial,
        role: 'Member',
        status: 'invited',
      },
    ]);
    toast.success(`已向 ${email} 发送邀请`);
    setInviteEmail('');
    setInviting(false);
  };

  const removeMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    toast.success('已移除队友');
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-section-border flex-shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Typography variant="subtitle">队友</Typography>
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              工作区中的成员，可邀请加入「项目组」一起协作。
            </p>
          </div>
          {!inviting && (
            <Button size="sm" onClick={() => setInviting(true)} className="gap-1.5 flex-shrink-0">
              <Plus size={14} />邀请
            </Button>
          )}
        </div>

        {/* Inline invite row */}
        {inviting && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-2.5 h-8 rounded-md bg-muted/30 border border-border/30">
              <Input
                autoFocus
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendInvite(); }}
                placeholder="输入对方邮箱，邀请 ta 加入工作区…"
                className="flex-1 border-0 bg-transparent h-7 px-0 text-[12.5px] shadow-none focus-visible:ring-0"
              />
            </div>
            <Button size="sm" onClick={sendInvite} disabled={!inviteEmail.trim()} className="gap-1.5">
              <Send size={13} />发送邀请
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setInviting(false); setInviteEmail(''); }}>
              <X size={14} />
            </Button>
          </div>
        )}

        {/* Search */}
        <div className="mt-3 flex items-center gap-2 px-2.5 h-8 rounded-md bg-muted/30 border border-border/20 text-muted-foreground">
          <Search size={13} />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索成员…"
            className="flex-1 border-0 bg-transparent h-7 px-0 text-[12.5px] shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      {/* Members table */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Column header */}
        <div className="flex items-center gap-3 px-5 py-2 text-[11px] text-muted-foreground/60 border-b border-section-border/60 sticky top-0 bg-content-bg">
          <span className="flex-1 min-w-0">名称</span>
          <span className="w-20 flex-shrink-0">状态</span>
          <span className="w-20 flex-shrink-0">角色</span>
          <span className="w-8 flex-shrink-0 text-right">操作</span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground/50">无匹配成员</div>
        ) : (
          filtered.map(m => (
            <div key={m.id} className="group flex items-center gap-3 px-5 py-2.5 border-b border-section-border/40 hover:bg-accent/30 transition-colors">
              {/* Name + avatar + email */}
              <div className="flex-1 min-w-0 flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${m.avatarColor} flex items-center justify-center text-[11px] font-medium text-white flex-shrink-0`}>
                  {m.avatarInitial}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] text-foreground truncate">{m.name}</div>
                  <div className="text-[11px] text-muted-foreground/60 truncate">{m.email}</div>
                </div>
              </div>
              {/* Status */}
              <div className="w-20 flex-shrink-0">
                <span className={`inline-flex items-center gap-1 text-[11px] ${m.status === 'joined' ? 'text-success' : 'text-muted-foreground/70'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'joined' ? 'bg-success' : 'bg-muted-foreground/40'}`} />
                  {STATUS_LABEL[m.status]}
                </span>
              </div>
              {/* Role */}
              <div className="w-20 flex-shrink-0 text-[12px] text-muted-foreground">{m.role}</div>
              {/* Actions */}
              <div className="w-8 flex-shrink-0 flex justify-end">
                {m.role !== 'Owner' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded text-muted-foreground/40 hover:text-foreground hover:bg-accent/60 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal size={14} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      {m.status === 'invited' && (
                        <DropdownMenuItem className="text-xs" onClick={() => toast.success('已重新发送邀请')}>重新邀请</DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-xs text-destructive focus:text-destructive" onClick={() => removeMember(m.id)}>
                        移除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
