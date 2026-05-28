import { useState, useEffect, useMemo } from 'react';
import { Input, Textarea, Switch } from '@cherry-studio/ui';
import { ChevronRight, ChevronLeft, Plus, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { Group, findMember, isAgent } from '../data';
import { Avatar } from './Avatar';
import { ShareDialog, type ShareItem } from './ShareDialog';

interface GroupSettingsDrawerProps {
  open: boolean;
  group: Group | null;
  onClose: () => void;
  onOpenAddMember?: () => void;
}

type View = 'main' | 'members';

const DEFAULT_MEMBER_LIMIT = 500;
// How many member avatars to show in the inline preview row before truncating
const AVATAR_PREVIEW_COUNT = 6;

/**
 * Drawer is scoped to its nearest positioned ancestor (the topic-group right
 * pane), not the viewport. The parent container must be `relative` so this
 * overlay/panel only covers the topic area — never the sidebar or session list.
 */
export function GroupSettingsDrawer({
  open,
  group,
  onClose,
  onOpenAddMember,
}: GroupSettingsDrawerProps) {
  const [view, setView] = useState<View>('main');
  // Reuse the unified ShareDialog so "分享群" matches the share flow used
  // elsewhere (topic header, file preview, etc.) — same picker, same chips,
  // same留言 composer — instead of firing a one-off toast.
  const [shareItem, setShareItem] = useState<ShareItem | null>(null);

  // Local editable copies — in a real impl these would persist, here they
  // just reflect what the user typed during this open session.
  const [name, setName] = useState(group?.name ?? '');
  const [description, setDescription] = useState(group?.description ?? '');
  const [muted, setMuted] = useState(false);
  // Per-user-per-group toggle: should my Agent auto-reply when others @ it?
  // Default on so people don't wonder why their Agent stays silent; user can
  // turn it off to save their own tokens.
  const [agentAutoReply, setAgentAutoReply] = useState(true);

  // Reset state whenever drawer opens for a (possibly different) group
  useEffect(() => {
    if (open && group) {
      setView('main');
      setName(group.name);
      setDescription(group.description ?? '');
      setMuted(false);
      setAgentAutoReply(true);
    }
  }, [open, group?.id]);

  // Close on Escape while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!group || !open) return null;

  const ownerId = group.ownerId ?? group.members[0];
  const isOwner = ownerId === 'me';
  const limit = group.memberLimit ?? DEFAULT_MEMBER_LIMIT;

  return (
    <>
      {/* Backdrop — scoped to parent pane via absolute inset-0 */}
      <button
        type="button"
        aria-label="关闭设置"
        onClick={onClose}
        className="absolute inset-0 z-10 bg-foreground/15 backdrop-blur-[1px] animate-in fade-in duration-150"
      />

      {/* Panel — fixed-width, slides in from the right edge of the parent */}
      <aside
        role="dialog"
        aria-label="群设置"
        className="absolute inset-y-0 right-0 z-20 w-[320px] max-w-full bg-background border-l border-border/60 shadow-xl flex flex-col animate-in slide-in-from-right duration-200"
      >
        {view === 'main' ? (
          <MainView
            group={group}
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            muted={muted}
            setMuted={setMuted}
            agentAutoReply={agentAutoReply}
            setAgentAutoReply={setAgentAutoReply}
            isOwner={isOwner}
            limit={limit}
            onOpenMembers={() => setView('members')}
            onOpenAddMember={onOpenAddMember}
            onShare={setShareItem}
            onClose={onClose}
          />
        ) : (
          <MembersView
            group={group}
            ownerId={ownerId}
            onBack={() => setView('main')}
          />
        )}
      </aside>

      <ShareDialog
        open={!!shareItem}
        item={shareItem}
        onClose={() => setShareItem(null)}
      />
    </>
  );
}

// ===========================
// Main view
// ===========================

interface MainViewProps {
  group: Group;
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  muted: boolean;
  setMuted: (v: boolean) => void;
  agentAutoReply: boolean;
  setAgentAutoReply: (v: boolean) => void;
  isOwner: boolean;
  limit: number;
  onOpenMembers: () => void;
  onOpenAddMember?: () => void;
  onShare: (item: ShareItem) => void;
  onClose: () => void;
}

function MainView({
  group,
  name,
  setName,
  description,
  setDescription,
  muted,
  setMuted,
  agentAutoReply,
  setAgentAutoReply,
  isOwner,
  limit,
  onOpenMembers,
  onOpenAddMember,
  onShare,
  onClose,
}: MainViewProps) {
  // Avatars shown in the inline preview row. Match Feishu's design: a
  // non-overlapping row of all group members (truncated if very large) with
  // a "+" tile at the end as the add-member affordance.
  const previewMembers = group.members.slice(0, AVATAR_PREVIEW_COUNT);
  const hiddenCount = Math.max(0, group.members.length - previewMembers.length);

  // Only show the "my Agent auto-reply" toggle if I actually own an Agent
  // that lives in this group — otherwise the setting controls nothing.
  const hasOwnAgentInGroup = group.members.some(id => {
    const m = findMember(id);
    return !!m && isAgent(m) && m.ownerId === 'me';
  });

  return (
    <>
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-2.5">
        <div className="text-[13px] text-foreground/90">设置</div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50"
          title="关闭"
          aria-label="关闭"
        >
          <X size={14} strokeWidth={1.8} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-5">
        {/* 群聊名称 */}
        <div className="space-y-1.5">
          <label className="text-[12px] text-foreground/80">群聊名称</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isOwner}
            className="text-[12.5px]"
          />
        </div>

        {/* 群聊描述 */}
        <div className="space-y-1.5">
          <label className="text-[12px] text-foreground/80">群聊描述</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={isOwner ? '介绍这个群的协作目标' : '群主未填写群描述'}
            disabled={!isOwner}
            rows={3}
            className="text-[12.5px] resize-none"
          />
        </div>

        {/* 群成员 — Feishu-style: a tappable header row over a clean
            non-overlapping avatar row with "+" at the end. */}
        <div className="space-y-2">
          <button
            onClick={onOpenMembers}
            className="w-full flex items-center justify-between gap-2 py-0.5 -mx-1 px-1 rounded-md hover:bg-accent/40 transition-colors"
          >
            <span className="text-[12px] text-foreground/80">群成员</span>
            <div className="flex items-center gap-0.5 text-muted-foreground">
              <span className="text-[12px]">{group.members.length}</span>
              <ChevronRight size={14} strokeWidth={1.8} />
            </div>
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            {previewMembers.map(id => {
              const m = findMember(id);
              if (!m) return null;
              return <Avatar key={id} member={m} size="sm" />;
            })}
            {hiddenCount > 0 && (
              <button
                onClick={onOpenMembers}
                className="w-7 h-7 rounded-full bg-foreground/[0.06] flex items-center justify-center text-[10px] text-muted-foreground hover:bg-accent transition-colors flex-shrink-0"
                title={`查看全部 ${group.members.length} 位成员`}
                aria-label="查看全部成员"
              >
                +{hiddenCount}
              </button>
            )}
            {onOpenAddMember && (
              <button
                onClick={onOpenAddMember}
                className="w-7 h-7 rounded-full border border-dashed border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/40 hover:bg-accent/30 transition-colors flex-shrink-0"
                title="添加成员"
                aria-label="添加成员"
              >
                <Plus size={13} strokeWidth={1.8} />
              </button>
            )}
          </div>
        </div>

        {/* 群成员上限 */}
        <div className="flex items-center justify-between py-1">
          <span className="text-[12px] text-foreground/80">群成员上限</span>
          <span className="text-[12px] text-muted-foreground">
            {group.members.length} / {limit}
          </span>
        </div>

        {/* 消息免打扰 */}
        <div className="flex items-center justify-between py-1">
          <span className="text-[12px] text-foreground/80">消息免打扰</span>
          <Switch checked={muted} onCheckedChange={setMuted} />
        </div>

        {/* 我的 Agent 自动回复别人的 @ — only meaningful if I have an Agent here */}
        {hasOwnAgentInGroup && (
          <div className="flex items-start justify-between gap-3 py-1">
            <div className="min-w-0">
              <div className="text-[12px] text-foreground/80">我的 Agent 自动回复别人的 @</div>
              <div className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                关掉后，群里有人 @ 你的 Agent 时不会自动回复，不消耗你的 Token。
              </div>
            </div>
            <Switch
              checked={agentAutoReply}
              onCheckedChange={setAgentAutoReply}
              className="flex-shrink-0 mt-0.5"
            />
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="border-t border-border/40 px-5 py-4 space-y-2">
        <button
          onClick={() => onShare({
            kind: 'group',
            title: group.name,
            subtitle: `${group.members.length} 位成员 · ${group.topics.length} 个话题`,
          })}
          className="w-full py-2 rounded-lg text-[12.5px] border border-border text-foreground hover:bg-accent/40 transition-colors"
        >
          分享群
        </button>
        {isOwner ? (
          <button
            onClick={() => {
              toast.warning(`已解散「${group.name}」（模拟）`);
              onClose();
            }}
            className="w-full py-2 rounded-lg text-[12.5px] text-destructive hover:bg-destructive/5 transition-colors"
          >
            解散群聊
          </button>
        ) : (
          <button
            onClick={() => {
              toast.success(`已退出「${group.name}」（模拟）`);
              onClose();
            }}
            className="w-full py-2 rounded-lg text-[12.5px] text-destructive hover:bg-destructive/5 transition-colors"
          >
            退出群聊
          </button>
        )}
      </div>
    </>
  );
}

// ===========================
// Members sub-view
// ===========================

interface MembersViewProps {
  group: Group;
  ownerId: string;
  onBack: () => void;
}

function MembersView({ group, ownerId, onBack }: MembersViewProps) {
  const [query, setQuery] = useState('');

  const allMembers = useMemo(
    () => group.members.map(findMember).filter(Boolean) as NonNullable<ReturnType<typeof findMember>>[],
    [group.members],
  );

  const q = query.trim().toLowerCase();
  const filtered = allMembers.filter(m => {
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      ('email' in m && m.email.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <div className="flex items-center gap-2 border-b border-border/40 px-3 py-2.5">
        <button
          onClick={onBack}
          className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50"
          title="返回"
          aria-label="返回"
        >
          <ChevronLeft size={14} strokeWidth={1.8} />
        </button>
        <div className="text-[13px] text-foreground/90">
          群成员 <span className="text-muted-foreground">({allMembers.length})</span>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pt-3">
        <div className="relative">
          <Search
            size={13}
            strokeWidth={1.8}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索群成员"
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
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {filtered.length === 0 ? (
          <div className="text-center text-[12px] text-muted-foreground py-12">
            没有匹配的成员
          </div>
        ) : (
          filtered.map(m => (
            <div
              key={m.id}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-accent/40 transition-colors"
            >
              <Avatar member={m} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] text-foreground truncate">
                    {m.id === 'me' ? `${m.name}（我）` : m.name}
                  </span>
                  {m.id === ownerId && (
                    <span className="text-[10px] px-1 py-px rounded bg-primary/10 text-primary flex-shrink-0">
                      群主
                    </span>
                  )}
                  {isAgent(m) && (
                    <span className="text-[10px] px-1 py-px rounded bg-foreground/[0.06] text-muted-foreground flex-shrink-0">
                      Agent
                    </span>
                  )}
                </div>
                {!isAgent(m) && (
                  <div className="text-[10.5px] text-muted-foreground truncate">{m.email}</div>
                )}
                {isAgent(m) && (
                  <div className="text-[10.5px] text-muted-foreground truncate">
                    {m.ownerName} 的 Agent
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
