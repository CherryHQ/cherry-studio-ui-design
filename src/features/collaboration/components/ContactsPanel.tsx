import { useState } from 'react';
import { ArrowLeft, Users, Bot, Copy, MessageSquarePlus, MessageSquare, UserMinus, Settings2, Share2, X } from 'lucide-react';
import { Dialog, DialogContent } from '@cherrystudio/ui/components/primitives/dialog';
import { Popover, PopoverTrigger, PopoverContent } from '@cherry-studio/ui';
import { AgentConfig } from '@/features/agent/AgentConfig';
import { RESOURCE_TYPE_CONFIG } from '@/app/config/constants';
import type { ResourceItem } from '@/app/types';
import { CollabAgent, CollabMember, MOCK_AGENTS, MOCK_HUMANS, findDyadGroupWith, getOrCreateDyadGroupWithAgent, isAgent } from '../data';
import { Avatar } from './Avatar';
import { ShareDialog, type ShareItem } from './ShareDialog';

interface ContactsListProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBack: () => void;
}

export function ContactsList({ selectedId, onSelect, onBack }: ContactsListProps) {
  // The Agent directory only lists agents the current user owns. Others'
  // agents are reachable from messages (e.g. @-mentions) but not surfaced here.
  const myAgents = MOCK_AGENTS.filter(a => a.ownerId === 'me');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/40">
        <button
          onClick={onBack}
          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50"
          title="返回"
        >
          <ArrowLeft size={14} strokeWidth={1.8} />
        </button>
        <span className="text-[13px] text-foreground/90">通讯录</span>
      </div>

      {/* List body */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Humans section */}
        <SectionHeader icon={<Users size={11} strokeWidth={1.8} />} label="联系人" count={MOCK_HUMANS.length} />
        {MOCK_HUMANS.map(h => (
          <ContactRow
            key={h.id}
            member={h}
            selected={selectedId === h.id}
            onClick={() => onSelect(h.id)}
          />
        ))}

        {/* Agents section — only my own agents */}
        <SectionHeader icon={<Bot size={11} strokeWidth={1.8} />} label="Agent" count={myAgents.length} />
        {myAgents.map(a => (
          <ContactRow
            key={a.id}
            member={a}
            selected={selectedId === a.id}
            onClick={() => onSelect(a.id)}
          />
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
  return (
    <div className="flex items-center gap-1.5 px-3 pt-3 pb-1 text-muted-foreground">
      {icon}
      <span className="text-[10px] uppercase tracking-wider">{label}</span>
      <span className="text-[10px] text-muted-foreground/70">({count})</span>
    </div>
  );
}

function ContactRow({ member, selected, onClick }: { member: CollabMember; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-1.5 transition-colors relative ${selected ? 'bg-cherry-active-bg' : 'hover:bg-accent/50'}`}
    >
      {selected && <div className="absolute inset-0 border-l-2 border-primary pointer-events-none" />}
      <Avatar member={member} size="sm" />
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-1 text-[12.5px] text-foreground">
          <span className="truncate">{member.name}</span>
          {isAgent(member) && <Bot size={11} strokeWidth={1.8} className="text-muted-foreground flex-shrink-0" />}
        </div>
        {isAgent(member) ? (
          // Contacts list only surfaces my own agents, so "<my name> 的 Agent"
          // is redundant — show the description (or owner for others' agents).
          <div className="text-[10px] text-muted-foreground truncate">
            {member.ownerId === 'me'
              ? member.description ?? '我的 Agent'
              : `${member.ownerName} 的 Agent`}
          </div>
        ) : (
          <div className="text-[10px] text-muted-foreground truncate">{member.email}</div>
        )}
      </div>
    </button>
  );
}

// ===========================
// Right pane: Contact detail
// ===========================

interface ContactDetailProps {
  contactId: string;
  onSelectContact?: (id: string) => void;
  onEnterSession?: (groupId: string) => void;
  onClonedAgent?: (agent: CollabAgent) => void;
}

export function ContactDetail({ contactId, onSelectContact, onEnterSession }: ContactDetailProps) {
  const member = MOCK_HUMANS.find(h => h.id === contactId) ?? MOCK_AGENTS.find(a => a.id === contactId);
  if (!member) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-[12px]">
        联系人不存在
      </div>
    );
  }
  return (
    <div className="h-full flex items-center justify-center px-8 py-10 overflow-y-auto">
      <MemberCardBody
        member={member}
        onSelectContact={onSelectContact}
        onEnterSession={onEnterSession}
      />
    </div>
  );
}

/**
 * Identity + actions card for a single member (human or Agent).
 *
 * Reused by:
 *   - {@link ContactDetail} — fills the right pane of the contacts page.
 *   - {@link MemberCardPopover} — same content inside a chat-message popover,
 *     so clicking an avatar/name in a topic surfaces the identical card.
 *
 * Keeping a single source of truth here means action buttons, ownership
 * lines, and the cloneable/settings affordances stay consistent across
 * surfaces. Callers control framing (full pane vs. popover).
 */
export function MemberCardBody({
  member,
  onSelectContact,
  onEnterSession,
}: {
  member: CollabMember;
  onSelectContact?: (id: string) => void;
  onEnterSession?: (groupId: string) => void;
}) {
  const [agentSettingsOpen, setAgentSettingsOpen] = useState(false);
  const [shareItem, setShareItem] = useState<ShareItem | null>(null);

  // Existing 1:1 dyad session with this member — applies to humans AND to my
  // own agents (each agent can have a dedicated "me ↔ agent" group).
  const existingDyad = findDyadGroupWith(member.id);
  const canCreateAgentDyad = isAgent(member) && member.ownerId === 'me';

  return (
    <>
      <div className="w-full max-w-sm space-y-7">
        {/* Identity — unified structure across agents and humans */}
        <div className="flex flex-col items-center text-center">
          <Avatar member={member} size="xl" />
          <div className="mt-3 flex items-center gap-1.5">
            <span className="text-[17px] text-foreground">{member.name}</span>
            {isAgent(member) && <Bot size={15} strokeWidth={1.8} className="text-muted-foreground" />}
          </div>

          {isAgent(member) ? (
            <>
              {/* Description first */}
              {member.description && (
                <div className="mt-1.5 text-[12px] text-muted-foreground">{member.description}</div>
              )}
              {/* Then ownership: only meaningful when the agent isn't mine — my
                  own agents live in this directory by default, so the line is noise. */}
              {member.ownerId !== 'me' && (
                <div className="mt-1 text-[12px] text-muted-foreground">
                  <span>来自 </span>
                  <button
                    onClick={() => onSelectContact?.(member.ownerId)}
                    className="text-[12px] leading-[18px] font-normal text-muted-foreground hover:text-primary hover:underline underline-offset-2 cursor-pointer transition-colors"
                    title={`查看 ${member.ownerName} 的联系人信息`}
                  >
                    {member.ownerName}
                  </button>
                </div>
              )}
            </>
          ) : (
            // Human: email directly under name, no structured field/label
            <div className="mt-1.5 text-[12px] text-muted-foreground">{member.email}</div>
          )}
        </div>

        {/* Actions — buttons sized to their content (with a small min-width)
            and centered as a group, so the action row reads as a compact
            cluster rather than a stretched grid. */}
        {isAgent(member) ? (
          member.ownerId === 'me' ? (
            // Order per design: 进入/创建会话 (primary, left) → 分享 → 设置.
            <div className="flex items-center justify-center gap-2">
              {existingDyad ? (
                <button
                  onClick={() => onEnterSession?.(existingDyad.id)}
                  className="inline-flex items-center justify-center gap-1.5 min-w-[88px] h-9 px-3.5 rounded-lg text-[12.5px] bg-foreground text-background hover:bg-foreground/90"
                >
                  <MessageSquare size={13} strokeWidth={1.8} />
                  进入会话
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (!canCreateAgentDyad) return;
                    const id = getOrCreateDyadGroupWithAgent(member);
                    onEnterSession?.(id);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 min-w-[88px] h-9 px-3.5 rounded-lg text-[12.5px] bg-foreground text-background hover:bg-foreground/90"
                >
                  <MessageSquarePlus size={13} strokeWidth={1.8} />
                  创建会话
                </button>
              )}
              <button
                onClick={() => setShareItem({
                  kind: 'agent',
                  title: member.name,
                  subtitle: member.description ?? `${member.ownerName} 的 Agent`,
                  emoji: member.avatarEmoji,
                })}
                className="inline-flex items-center justify-center gap-1.5 min-w-[88px] h-9 px-3.5 rounded-lg text-[12.5px] border border-border text-foreground hover:bg-accent/40"
              >
                <Share2 size={13} strokeWidth={1.8} />
                分享
              </button>
              <button
                onClick={() => setAgentSettingsOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 min-w-[88px] h-9 px-3.5 rounded-lg text-[12.5px] border border-border text-foreground hover:bg-accent/40"
              >
                <Settings2 size={13} strokeWidth={1.8} />
                设置
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                disabled={!member.cloneable}
                className={`inline-flex items-center justify-center gap-1.5 min-w-[140px] h-9 px-4 rounded-lg text-[12.5px] ${
                  member.cloneable
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-foreground/[0.06] text-muted-foreground cursor-not-allowed'
                }`}
              >
                <Copy size={13} strokeWidth={1.8} />
                {member.cloneable ? '克隆使用' : '不支持克隆'}
              </button>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center gap-2.5">
            {existingDyad ? (
              <button
                onClick={() => onEnterSession?.(existingDyad.id)}
                className="inline-flex items-center justify-center gap-1.5 min-w-[112px] h-9 px-4 rounded-lg text-[12.5px] bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <MessageSquare size={13} strokeWidth={1.8} />
                进入会话
              </button>
            ) : (
              <button className="inline-flex items-center justify-center gap-1.5 min-w-[112px] h-9 px-4 rounded-lg text-[12.5px] bg-primary text-primary-foreground hover:bg-primary/90">
                <MessageSquarePlus size={13} strokeWidth={1.8} />
                创建会话
              </button>
            )}
            <button className="inline-flex items-center justify-center gap-1.5 min-w-[112px] h-9 px-4 rounded-lg text-[12.5px] border border-destructive/30 text-destructive hover:bg-destructive/5">
              <UserMinus size={13} strokeWidth={1.8} />
              删除好友
            </button>
          </div>
        )}
      </div>

      {/* Unified Agent settings modal — only my-own agents reach this branch. */}
      {isAgent(member) && member.ownerId === 'me' && (
        <AgentSettingsModal
          open={agentSettingsOpen}
          agent={member}
          onClose={() => setAgentSettingsOpen(false)}
        />
      )}

      <ShareDialog
        open={!!shareItem}
        item={shareItem}
        onClose={() => setShareItem(null)}
      />
    </>
  );
}

/**
 * Trigger-wrapping popover that surfaces a member's identity card.
 *
 * Pass the trigger element as children; clicking it opens a popover with the
 * same {@link MemberCardBody} the contacts page renders in its right pane.
 * Use this wherever the user might want to inspect or act on a member from
 * within a chat surface (avatars, names, @-mentions, attribution lines).
 *
 * Resolves the member from either MOCK_HUMANS or MOCK_AGENTS — unknown IDs
 * render only the trigger (no broken popover).
 */
export function MemberCardPopover({
  memberId,
  children,
  onEnterSession,
  onSelectContact,
}: {
  memberId: string;
  children: React.ReactNode;
  onEnterSession?: (groupId: string) => void;
  onSelectContact?: (id: string) => void;
}) {
  // Track the currently-displayed member so the popover can navigate from
  // an Agent card to its owner's card (and beyond) without closing. Resets
  // back to the trigger's original member each time the popover reopens.
  const [currentMemberId, setCurrentMemberId] = useState(memberId);

  const member =
    MOCK_HUMANS.find(h => h.id === currentMemberId) ??
    MOCK_AGENTS.find(a => a.id === currentMemberId);
  if (!member) return <>{children}</>;

  const handleSelectContact = (id: string) => {
    // Swap the popover to the clicked member if they exist in the directory;
    // otherwise fall back to whatever the caller wants to do (e.g. navigate).
    const exists =
      MOCK_HUMANS.some(h => h.id === id) ||
      MOCK_AGENTS.some(a => a.id === id);
    if (exists) {
      setCurrentMemberId(id);
      return;
    }
    onSelectContact?.(id);
  };

  return (
    <Popover
      onOpenChange={(open) => {
        if (!open) setCurrentMemberId(memberId);
      }}
    >
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={6}
        className="w-[340px] p-5"
      >
        <MemberCardBody
          member={member}
          onEnterSession={onEnterSession}
          onSelectContact={handleSelectContact}
        />
      </PopoverContent>
    </Popover>
  );
}

// Wraps the shared AgentConfig editor in the same in-app modal frame used by
// the Library page, so agents reached from the contacts panel get the same
// unified settings experience.
function AgentSettingsModal({ open, agent, onClose }: { open: boolean; agent: CollabAgent; onClose: () => void }) {
  const resource: ResourceItem = {
    id: agent.id,
    name: agent.name,
    type: 'agent',
    description: agent.description ?? '',
    avatar: agent.avatarEmoji,
    tags: [],
    createdAt: '',
    updatedAt: '',
    enabled: true,
  };
  const cfg = RESOURCE_TYPE_CONFIG.agent;
  const TypeIcon = cfg.icon;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-[760px] sm:!max-w-[760px] !w-[min(760px,84vw)] !h-[min(520px,72vh)] !max-h-[72vh] !rounded-2xl !p-0 !gap-0 !grid-cols-1 overflow-hidden border border-border/20 shadow-xl flex flex-col"
      >
        {/* Header — mirrors LibraryPage's resource config modal header */}
        <div className="flex items-center gap-3 px-5 h-14 border-b border-border/15 flex-shrink-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${cfg.color}`}>
            {resource.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-semibold text-foreground truncate">{resource.name}</span>
              <span className="inline-flex items-center gap-1 flex-shrink-0 px-1.5 py-px rounded text-[10px] leading-none border border-border/30 bg-muted/40 text-muted-foreground/75 font-normal">
                <TypeIcon size={9} />
                {cfg.label}
              </span>
              <span className="inline-flex items-center gap-1 flex-shrink-0 text-[11px] text-muted-foreground/65 font-normal">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                已启用
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground/55 hover:text-foreground hover:bg-muted/40 transition-colors flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 min-h-0 flex">
          <AgentConfig resource={resource} onBack={onClose} inModal />
        </div>
      </DialogContent>
    </Dialog>
  );
}

