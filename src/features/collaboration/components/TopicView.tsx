import { useMemo, useRef, useState } from 'react';
import { Plus, Settings2, FileText, UserPlus, Bot, ThumbsUp, MessageCircle, Share2, Bookmark, Link2, ImageIcon, Pin, FolderOpen, Search, MoreHorizontal, Forward, FileImage, FileCode, File as FileIcon, SmilePlus } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@cherry-studio/ui';
import { Locate } from 'lucide-react';
import { toast } from 'sonner';
import { Attachment, findMember, findMemberByMention, Group, MessageRef, Topic } from '../data';
import { useGroupSharedArtifacts } from '@/app/stores/sharedArtifactsStore';
import { Avatar } from './Avatar';
import { ShareDialog, type ShareItem } from './ShareDialog';
import { MemberCardPopover } from './ContactsPanel';
import { MessageContextMenu, AttachmentContextMenu } from './MessageContextMenu';

// ===========================
// Reactions
// ===========================

const COMMON_EMOJIS = ['👍', '❤️', '😄', '🎉', '🙏', '👀'] as const;
const ME_ID = 'me';

interface Reaction {
  emoji: string;
  users: string[]; // member ids in click order
}

// Mock starting reactions per topic — illustrative only, no persistence.
const INITIAL_REACTIONS_BY_TOPIC: Record<string, Reaction[]> = {
  't-agent-im': [
    { emoji: '👍', users: ['u-lisi', 'u-zhangsan', 'a-stella'] },
    { emoji: '🎉', users: ['u-lisi'] },
  ],
  't-trash': [
    { emoji: '👀', users: ['me', 'u-zhangsan'] },
  ],
};

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function formatReactorNames(users: string[]): string {
  const names = users.map(uid => findMember(uid)?.name ?? uid);
  if (names.length === 0) return '';
  if (names.length <= 5) return names.join('、');
  return `${names.slice(0, 3).join('、')} 等 ${names.length} 人`;
}

interface TopicViewProps {
  group: Group;
  onOpenGroupSettings: () => void;
  onClickNewTopic: () => void;
  onClickAddMember?: () => void;
  onOpenTopic: (topicId: string) => void;
  // Lift HTML artifact opening to the page level so it renders in a
  // side-by-side right panel (Agent ArtifactViewer style) instead of a center modal.
  onOpenHtmlArtifact: (fileName: string) => void;
}

type TabId = 'messages' | 'pinned' | 'files' | 'subscribed';

// Seed: a couple of topics are pre-subscribed per group so the 已订阅 tab
// is non-empty on first view (prototype-grade, no real persistence).
const INITIALLY_SUBSCRIBED_TOPICS = new Set<string>(['t-agent-im']);

export function TopicView({ group, onOpenGroupSettings, onClickNewTopic, onClickAddMember, onOpenTopic, onOpenHtmlArtifact }: TopicViewProps) {
  const [groupShareItem, setGroupShareItem] = useState<ShareItem | null>(null);
  const [tab, setTab] = useState<TabId>('messages');
  const setOpenHtmlFile = onOpenHtmlArtifact;

  // Subscription state lives at the page level so the 已订阅 tab and each
  // TopicCard's bookmark button stay in sync. Keyed by topic id.
  const [subscribedIds, setSubscribedIds] = useState<Set<string>>(
    () => new Set(INITIALLY_SUBSCRIBED_TOPICS),
  );
  const toggleSubscribed = (topicId: string) => {
    setSubscribedIds(prev => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  };

  // Aggregate all attachments across topics for the Files tab. Pinned items
  // are a curated subset (first topic starter + first few file-type
  // attachments) — prototype-grade, no persistence.
  const sharedFromAgent = useGroupSharedArtifacts(group.id);
  const allFiles = useMemo(() => {
    const base = collectFiles(group);
    // Synthesize FileEntry rows for artifacts shared via the agent run's
    // "分享到群组" menu. They show up as HTML files, alongside attachments
    // pulled from real topic messages.
    const synthetic: FileEntry[] = sharedFromAgent.map(a => ({
      key: `shared:${a.id}`,
      att: { name: a.fileName, kind: 'html' },
      authorName: '从智能体分享',
      time: formatTime(a.sharedAt),
      topicId: `shared:${a.id}`,
      // When the user typed a comment in the share dialog, surface it as
      // the row's secondary line (where topicTitle normally renders).
      topicTitle: a.comment?.trim() ? a.comment.trim() : '分享文件',
    }));
    return [...synthetic, ...base];
  }, [group, sharedFromAgent]);
  const pinnedItems = useMemo(() => derivePinned(group, allFiles), [group, allFiles]);
  const subscribedTopics = useMemo(
    () => group.topics.filter(t => subscribedIds.has(t.id)),
    [group.topics, subscribedIds],
  );

  return (
    <div className="flex flex-col h-full relative">
      {/* Group header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/40">
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Emoji icon — same glyph the merged 工作 list uses for this group,
              so the row icon and the header icon stay consistent (private chat
              shows its Agent's emoji the same way). */}
          <span className="text-[15px] leading-none flex-shrink-0">{group.avatarEmoji ?? '💬'}</span>
          <span className="text-[14px] text-foreground truncate">
            {group.name}
          </span>
          <span className="text-[11px] text-muted-foreground">({group.members.length})</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={onClickAddMember}
            className="flex items-center gap-1 px-2 h-7 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent/50"
            title="添加成员"
          >
            <UserPlus size={13} strokeWidth={1.6} />
            <span>添加成员</span>
          </button>
          <button
            onClick={() => setGroupShareItem({
              kind: 'group',
              title: group.name,
              subtitle: `${group.members.length} 位成员 · ${group.topics.length} 个话题`,
            })}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50"
            title="分享群组"
          >
            <Share2 size={14} strokeWidth={1.6} />
          </button>
          <button
            onClick={onOpenGroupSettings}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50"
            title="群设置"
          >
            <Settings2 size={14} strokeWidth={1.6} />
          </button>
        </div>
      </div>

      {/* Tabs — Feishu-style underline tabs: 消息 / Pin / 文件 */}
      <div className="flex items-center gap-4 px-5 border-b border-border/30">
        <TabChip
          icon={MessageCircle}
          label="消息"
          active={tab === 'messages'}
          onClick={() => setTab('messages')}
        />
        <TabChip
          icon={Pin}
          label="Pin"
          count={pinnedItems.length > 0 ? pinnedItems.length : undefined}
          active={tab === 'pinned'}
          onClick={() => setTab('pinned')}
        />
        <TabChip
          icon={Bookmark}
          label="已订阅"
          count={subscribedTopics.length > 0 ? subscribedTopics.length : undefined}
          active={tab === 'subscribed'}
          onClick={() => setTab('subscribed')}
        />
        <TabChip
          icon={FolderOpen}
          label="文件"
          count={allFiles.length > 0 ? allFiles.length : undefined}
          active={tab === 'files'}
          onClick={() => setTab('files')}
        />
      </div>

      {/* Tab content */}
      {tab === 'messages' && (
        <div className="flex-1 overflow-y-auto px-5 py-4 pb-24 space-y-3">
          {group.topics.length === 0 && (
            <div className="text-center text-[12px] text-muted-foreground py-12">
              还没有话题，点右下角按钮新建第一个话题
            </div>
          )}
          {group.topics.map(topic => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onOpen={() => onOpenTopic(topic.id)}
              subscribed={subscribedIds.has(topic.id)}
              onToggleSubscribed={() => toggleSubscribed(topic.id)}
            />
          ))}
        </div>
      )}

      {tab === 'subscribed' && (
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {subscribedTopics.length === 0 ? (
            <div className="text-center text-[12px] text-muted-foreground py-12">
              还没有订阅话题。在话题底部点 <Bookmark size={11} strokeWidth={1.8} className="inline-block -mt-0.5 mx-0.5" /> 订阅，有新回复会通知你。
            </div>
          ) : (
            subscribedTopics.map(topic => (
              <TopicCard
                key={topic.id}
                topic={topic}
                onOpen={() => onOpenTopic(topic.id)}
                subscribed={subscribedIds.has(topic.id)}
                onToggleSubscribed={() => toggleSubscribed(topic.id)}
              />
            ))
          )}
        </div>
      )}

      {tab === 'pinned' && (
        <PinnedPanel
          items={pinnedItems}
          onOpenTopic={onOpenTopic}
          onShare={setGroupShareItem}
          onOpenHtml={setOpenHtmlFile}
        />
      )}

      {tab === 'files' && (
        <FilesPanel
          files={allFiles}
          onShare={setGroupShareItem}
          onOpenHtml={setOpenHtmlFile}
        />
      )}

      {/* FAB — new topic. Only relevant for the 消息 tab. */}
      {tab === 'messages' && (
        <button
          onClick={onClickNewTopic}
          className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-xl active:scale-95 transition-all flex items-center justify-center"
          title="新建话题"
          aria-label="新建话题"
        >
          <Plus size={22} strokeWidth={2} />
        </button>
      )}

      <ShareDialog
        open={!!groupShareItem}
        item={groupShareItem}
        onClose={() => setGroupShareItem(null)}
      />
    </div>
  );
}

function TabChip({ icon: Icon, label, count, active, onClick }: {
  icon: React.ElementType;
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-1 h-9 text-[12.5px] border-b-2 -mb-px transition-colors ${
        active
          ? 'border-foreground text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon size={12} strokeWidth={1.8} />
      <span>{label}</span>
      {count !== undefined && (
        <span className="text-[10.5px] text-muted-foreground/70 ml-0.5">
          {count}
        </span>
      )}
    </button>
  );
}

// ===========================
// File aggregation
// ===========================

interface FileEntry {
  // Stable key for React lists (synthesized from topic id + message idx + att idx)
  key: string;
  att: Attachment;
  authorName: string;
  time: string;
  topicId: string;
  topicTitle: string;
}

// Walk every message in every topic and pull out file/image/html attachments
// (links are excluded — they show in messages, not in the files list).
function collectFiles(group: Group): FileEntry[] {
  const out: FileEntry[] = [];
  group.topics.forEach(topic => {
    const visit = (msg: MessageRef, msgKey: string) => {
      msg.attachments?.forEach((att, ai) => {
        if (att.kind === 'link') return;
        out.push({
          key: `${topic.id}:${msgKey}:${ai}`,
          att,
          authorName: msg.authorName,
          time: msg.time,
          topicId: topic.id,
          topicTitle: topic.title,
        });
      });
    };
    visit(topic.starter, 's');
    topic.replies.forEach((r, ri) => visit(r, `r${ri}`));
  });
  return out;
}

// ===========================
// Pinned items
// ===========================

type PinnedItem =
  | { kind: 'message'; key: string; topicId: string; topicTitle: string; msg: MessageRef }
  | { kind: 'file';    key: string; file: FileEntry };

// Mock-only: pin the first topic's starter, every HTML artifact (so the user
// can demo opening it), and the first non-HTML file. Real product persists
// pin state per group.
function derivePinned(group: Group, files: FileEntry[]): PinnedItem[] {
  const items: PinnedItem[] = [];
  const firstTopic = group.topics[0];
  if (firstTopic) {
    items.push({
      kind: 'message',
      key: `pin-msg-${firstTopic.id}`,
      topicId: firstTopic.id,
      topicTitle: firstTopic.title,
      msg: firstTopic.starter,
    });
  }
  const htmlFiles = files.filter(f => isHtmlFile(f.att));
  const otherFiles = files.filter(f => !isHtmlFile(f.att));
  htmlFiles.forEach(f => items.push({ kind: 'file', key: `pin-${f.key}`, file: f }));
  otherFiles.slice(0, 1).forEach(f => items.push({ kind: 'file', key: `pin-${f.key}`, file: f }));
  return items;
}

function isHtmlFile(att: Attachment): boolean {
  return att.kind === 'html' || att.name.toLowerCase().endsWith('.html');
}

// ===========================
// Pinned panel
// ===========================

function PinnedPanel({ items, onOpenTopic, onShare, onOpenHtml }: {
  items: PinnedItem[];
  onOpenTopic: (topicId: string) => void;
  onShare: (item: ShareItem) => void;
  onOpenHtml: (fileName: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="text-center max-w-xs">
          <div className="w-10 h-10 rounded-full bg-foreground/[0.05] mx-auto mb-3 flex items-center justify-center text-muted-foreground">
            <Pin size={16} strokeWidth={1.6} />
          </div>
          <div className="text-[12.5px] text-foreground/85 mb-1">还没有 Pin 的内容</div>
          <div className="text-[11px] text-muted-foreground leading-relaxed">
            把重要消息或文件 Pin 在群里，方便所有人快速回看
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
      {items.map(item => item.kind === 'message' ? (
        <PinnedMessageRow
          key={item.key}
          topicTitle={item.topicTitle}
          msg={item.msg}
          onOpen={() => onOpenTopic(item.topicId)}
          onShare={() => onShare({
            kind: 'topic',
            title: item.topicTitle,
            subtitle: item.msg.text.slice(0, 60),
          })}
        />
      ) : (
        <PinnedFileRow
          key={item.key}
          file={item.file}
          onOpen={isHtmlFile(item.file.att) ? () => onOpenHtml(item.file.att.name) : undefined}
          onShare={() => onShare({
            kind: 'attachment',
            title: item.file.att.name,
            subtitle: item.file.att.size,
            fileKind: item.file.att.kind === 'image' ? 'image' : 'file',
          })}
        />
      ))}
    </div>
  );
}

function PinnedMessageRow({ topicTitle, msg, onOpen, onShare }: {
  topicTitle: string;
  msg: MessageRef;
  onOpen: () => void;
  onShare: () => void;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-card overflow-hidden hover:border-border transition-colors">
      <div onClick={onOpen} className="cursor-pointer hover:bg-accent/10 transition-colors px-3 pt-2.5 pb-2">
        <div className="flex items-center gap-1.5 mb-1.5 text-[10.5px] text-muted-foreground">
          <Pin size={10} strokeWidth={1.8} className="text-primary" />
          <span className="truncate">话题：{topicTitle}</span>
        </div>
        <div className="flex items-start gap-2">
          <MemberCardPopover memberId={msg.authorId}>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title={msg.authorName}
            >
              <Avatar
                emoji={msg.authorKind === 'agent' ? msg.authorAvatar : undefined}
                initial={msg.authorKind === 'human' ? msg.authorAvatar : undefined}
                color={msg.authorColor}
                size="sm"
              />
            </button>
          </MemberCardPopover>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <MemberCardPopover memberId={msg.authorId}>
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[12px] font-medium text-foreground hover:text-primary cursor-pointer"
                >
                  {msg.authorName}
                </button>
              </MemberCardPopover>
              {msg.authorKind === 'agent' && <Bot size={11} strokeWidth={1.8} className="text-muted-foreground" />}
              <span className="text-[10px] text-muted-foreground">{msg.time}</span>
            </div>
            <div className="text-[12.5px] text-foreground/85 leading-relaxed line-clamp-3 break-words">
              {msg.text.replace(/\n+/g, ' ')}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-0.5 px-2 py-1 border-t border-border/30 bg-foreground/[0.015]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              title="更多"
              className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/40"
            >
              <MoreHorizontal size={13} strokeWidth={1.8} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[140px]">
            <DropdownMenuItem className="text-[12.5px] font-normal py-1.5" onSelect={onOpen}>
              <Locate className="size-3.5" strokeWidth={1.8} />
              定位到原消息
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[12.5px] font-normal py-1.5" onSelect={onShare}>
              <Forward className="size-3.5" strokeWidth={1.8} />
              分享
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function PinnedFileRow({ file, onShare, onOpen }: { file: FileEntry; onShare: () => void; onOpen?: () => void }) {
  const clickable = !!onOpen;
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg border border-border/50 bg-card transition-colors ${clickable ? 'hover:border-border hover:bg-accent/20 cursor-pointer' : 'hover:border-border'}`}
         onClick={onOpen}
    >
      <FileTypeIcon att={file.att} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground mb-0.5">
          <Pin size={10} strokeWidth={1.8} className="text-primary" />
          <span className="truncate">{file.authorName} · {file.time}</span>
        </div>
        <div className="text-[12.5px] text-foreground truncate">
          {file.att.name}
        </div>
        {file.att.size && (
          <div className="text-[10.5px] text-muted-foreground">{file.att.size}</div>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            title="更多"
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/40 flex-shrink-0"
          >
            <MoreHorizontal size={13} strokeWidth={1.8} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[140px]">
          <DropdownMenuItem className="text-[12.5px] font-normal py-1.5" onSelect={() => toast.info(`已定位到「${file.authorName}」${file.time} 的消息`)}>
            <Locate className="size-3.5" strokeWidth={1.8} />
            定位到原消息
          </DropdownMenuItem>
          <DropdownMenuItem className="text-[12.5px] font-normal py-1.5" onSelect={onShare}>
            <Forward className="size-3.5" strokeWidth={1.8} />
            分享
          </DropdownMenuItem>
          <DropdownMenuItem className="text-[12.5px] font-normal py-1.5" onSelect={() => toast.info(`已打开 ${file.att.name} 所在文件夹`)}>
            <FolderOpen className="size-3.5" strokeWidth={1.8} />
            打开文件夹
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ===========================
// Files panel
// ===========================

function FilesPanel({ files, onShare, onOpenHtml }: { files: FileEntry[]; onShare: (item: ShareItem) => void; onOpenHtml: (fileName: string) => void }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return files;
    return files.filter(f =>
      f.att.name.toLowerCase().includes(q) ||
      f.authorName.toLowerCase().includes(q)
    );
  }, [files, query]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Search */}
      <div className="px-5 pt-3 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border/60 bg-foreground/[0.02] focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-colors">
          <Search size={13} strokeWidth={1.8} className="text-muted-foreground flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索会话内的文件"
            className="flex-1 bg-transparent text-[12.5px] text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {/* Column header */}
      <div className="grid grid-cols-[1fr_120px_120px_72px] items-center gap-2 px-5 py-1.5 text-[10.5px] uppercase tracking-wider text-muted-foreground border-b border-border/30 flex-shrink-0">
        <span>标题</span>
        <span>发送人</span>
        <span>发送时间</span>
        <span />
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="text-center text-[12px] text-muted-foreground py-12">
            {files.length === 0 ? '群里还没有任何文件' : '没有匹配的文件'}
          </div>
        )}
        {filtered.map(f => (
          <FileRow
            key={f.key}
            file={f}
            onOpen={isHtmlFile(f.att) ? () => onOpenHtml(f.att.name) : undefined}
            onShare={() => onShare({
              kind: 'attachment',
              title: f.att.name,
              subtitle: f.att.size,
              fileKind: f.att.kind === 'image' ? 'image' : 'file',
            })}
          />
        ))}
      </div>
    </div>
  );
}

function FileRow({ file, onShare, onOpen }: { file: FileEntry; onShare: () => void; onOpen?: () => void }) {
  const clickable = !!onOpen;
  return (
    <div
      onClick={onOpen}
      className={`grid grid-cols-[1fr_120px_120px_72px] items-center gap-2 px-5 py-2 hover:bg-accent/30 border-b border-border/20 transition-colors group ${clickable ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <FileTypeIcon att={file.att} />
        <div className="min-w-0">
          <div className={`text-[12.5px] truncate ${clickable ? 'text-foreground group-hover:text-primary' : 'text-foreground'}`}>{file.att.name}</div>
          {file.att.size && (
            <div className="text-[10.5px] text-muted-foreground">{file.att.size}</div>
          )}
        </div>
      </div>
      <div className="text-[11.5px] text-muted-foreground truncate">{file.authorName}</div>
      <div className="text-[11.5px] text-muted-foreground truncate">{file.time}</div>
      <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              title="更多"
              className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/40"
            >
              <MoreHorizontal size={13} strokeWidth={1.8} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[140px]">
            <DropdownMenuItem className="text-[12.5px] font-normal py-1.5" onSelect={() => toast.info(`已定位到「${file.authorName}」${file.time} 的消息`)}>
              <Locate className="size-3.5" strokeWidth={1.8} />
              定位到原消息
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[12.5px] font-normal py-1.5" onSelect={onShare}>
              <Forward className="size-3.5" strokeWidth={1.8} />
              分享
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[12.5px] font-normal py-1.5" onSelect={() => toast.info(`已打开 ${file.att.name} 所在文件夹`)}>
              <FolderOpen className="size-3.5" strokeWidth={1.8} />
              打开文件夹
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function FileTypeIcon({ att }: { att: Attachment }) {
  const { Icon, color } = fileIconFor(att);
  return (
    <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={14} strokeWidth={1.6} />
    </div>
  );
}

function fileIconFor(att: Attachment): { Icon: React.ElementType; color: string } {
  if (att.kind === 'image') {
    return { Icon: FileImage, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' };
  }
  const lower = att.name.toLowerCase();
  if (lower.endsWith('.md'))   return { Icon: FileText, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' };
  if (lower.endsWith('.html')) return { Icon: FileCode, color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' };
  if (lower.endsWith('.pdf'))  return { Icon: FileText, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' };
  if (lower.endsWith('.xlsx') || lower.endsWith('.csv')) return { Icon: FileText, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' };
  if (lower.endsWith('.zip') || lower.endsWith('.tar')) return { Icon: FileIcon, color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' };
  return { Icon: FileText, color: 'bg-foreground/[0.06] text-muted-foreground' };
}

function TopicCard({
  topic,
  onOpen,
  subscribed,
  onToggleSubscribed,
}: {
  topic: Topic;
  onOpen: () => void;
  subscribed: boolean;
  onToggleSubscribed: () => void;
}) {
  const replyCount = topic.replies.length;
  // Feishu-style preview: show at most the latest 2 replies inline.
  const previewReplies = topic.replies.slice(-2);
  const moreCount = Math.max(0, replyCount - previewReplies.length);

  // Local mock state — prototype-level (no persistence).
  const [reactions, setReactions] = useState<Reaction[]>(
    () => INITIAL_REACTIONS_BY_TOPIC[topic.id]?.map(r => ({ ...r, users: [...r.users] })) ?? [],
  );
  const [shareItem, setShareItem] = useState<ShareItem | null>(null);

  // Toggle my reaction with an emoji. Adds/removes me; removes the chip
  // entirely once nobody is left reacting with that emoji.
  const toggleReaction = (emoji: string) => {
    setReactions(prev => {
      const existing = prev.find(r => r.emoji === emoji);
      if (!existing) {
        return [...prev, { emoji, users: [ME_ID] }];
      }
      if (existing.users.includes(ME_ID)) {
        const nextUsers = existing.users.filter(u => u !== ME_ID);
        if (nextUsers.length === 0) {
          return prev.filter(r => r.emoji !== emoji);
        }
        return prev.map(r => (r.emoji === emoji ? { ...r, users: nextUsers } : r));
      }
      return prev.map(r => (r.emoji === emoji ? { ...r, users: [...r.users, ME_ID] } : r));
    });
  };

  const myThumbsUp = reactions.find(r => r.emoji === '👍')?.users.includes(ME_ID) ?? false;

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      {/* Clickable region — starter + comments preview both open the topic detail */}
      <div onClick={onOpen} className="cursor-pointer hover:bg-accent/10 transition-colors">
        {/* Starter message — the topic itself */}
        <div className="px-4 pt-3 pb-2.5">
          <MessageRow msg={topic.starter} onShare={setShareItem} topicTitle={topic.title} />
        </div>

        {/* Comment preview area — Feishu-style: "查看更早 N 条回复" at top, latest 2 below.
            The grey block is inset to align with the starter message text (avatar + gap),
            so it reads as an indented reply thread under the starter rather than a
            full-width strip with an empty left gutter. */}
        {replyCount > 0 && (
          <div className="ml-[52px] mr-4 mb-3 rounded-lg bg-foreground/[0.03] px-3 py-2">
            {moreCount > 0 && (
              <div className="text-[11px] text-primary mb-1.5">查看更早 {moreCount} 条回复 →</div>
            )}
            <div className="space-y-1">
              {previewReplies.map((reply, idx) => (
                <CompactCommentRow key={idx} msg={reply} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reactions strip — sits between content and action row when present.
          Indented to align with starter text + comment block. */}
      {reactions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 pl-[52px] pr-4 pb-2">
          {reactions.map(r => (
            <ReactionChip
              key={r.emoji}
              reaction={r}
              onToggle={() => toggleReaction(r.emoji)}
            />
          ))}
          {/* Trailing "add reaction" chip — extra entry point besides the like button */}
          <ReactionPicker onPick={toggleReaction}>
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center w-7 h-6 rounded-full bg-foreground/[0.04] text-muted-foreground hover:bg-foreground/[0.08] hover:text-foreground transition-colors"
              aria-label="添加表情"
              title="添加表情"
            >
              <SmilePlus size={12} strokeWidth={1.8} />
            </button>
          </ReactionPicker>
        </div>
      )}

      {/* Action row — like / comment / share / subscribe.
          Indented to align with the starter message text (avatar width + gap),
          so the icons sit in the same column as the message body above. */}
      <div className="border-t border-border/30 flex items-center gap-0.5 pl-[44px] pr-2 py-1.5">
        {/* Like button: click toggles 👍, hover reveals quick emoji picker.
            Rendered as a bare button (not ActionButton) so HoverCard's
            asChild trigger can attach directly to it. */}
        <ReactionPicker onPick={toggleReaction}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleReaction('👍');
            }}
            className={`flex items-center gap-1 px-2 h-7 rounded-md text-[11px] transition-colors ${
              myThumbsUp
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
            }`}
            aria-label="点赞 / 表情"
            title="点赞 / 表情"
          >
            <ThumbsUp size={13} strokeWidth={1.8} fill={myThumbsUp ? 'currentColor' : 'none'} />
          </button>
        </ReactionPicker>
        <ActionButton
          icon={MessageCircle}
          count={replyCount > 0 ? replyCount : undefined}
          ariaLabel="发评论"
          onClick={onOpen}
        />
        <ActionButton
          icon={Share2}
          ariaLabel="分享"
          onClick={() => setShareItem({
            kind: 'topic',
            title: topic.title,
            subtitle: topic.starter.text.slice(0, 60),
          })}
        />
        <ActionButton
          icon={Bookmark}
          active={subscribed}
          ariaLabel={subscribed ? '取消订阅' : '订阅'}
          onClick={() => {
            const wasSubscribed = subscribed;
            onToggleSubscribed();
            toast.success(wasSubscribed ? '已取消订阅' : '已订阅，有新回复会通知你');
          }}
        />
      </div>

      <ShareDialog
        open={!!shareItem}
        item={shareItem}
        onClose={() => setShareItem(null)}
      />
    </div>
  );
}

// ===========================
// Reaction picker & chip
// ===========================

/**
 * Wraps a trigger button. On hover, reveals a small horizontal emoji palette
 * above the trigger via Radix HoverCard (portal-rendered so it isn't clipped
 * by the card's overflow:hidden). Clicking an emoji calls onPick and closes.
 */
function ReactionPicker({
  onPick,
  children,
}: {
  onPick: (emoji: string) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <HoverCard open={open} onOpenChange={setOpen} openDelay={80} closeDelay={120}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="start"
        sideOffset={6}
        className="w-auto p-1 rounded-full border border-border shadow-lg"
      >
        <div className="flex items-center gap-0.5">
          {COMMON_EMOJIS.map(e => (
            <button
              key={e}
              onClick={(ev) => {
                ev.stopPropagation();
                onPick(e);
                setOpen(false);
              }}
              className="w-7 h-7 rounded-full hover:bg-accent flex items-center justify-center text-[15px] leading-none transition-transform hover:scale-110"
              aria-label={`添加 ${e}`}
              title={e}
            >
              {e}
            </button>
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

/**
 * Single reaction "sticker": emoji + count. Highlighted when I've reacted.
 * Clicking toggles my reaction. Hovering pops a card showing reactor names
 * (truncated with "等 N 人" past 5).
 */
function ReactionChip({ reaction, onToggle }: { reaction: Reaction; onToggle: () => void }) {
  const reacted = reaction.users.includes(ME_ID);
  const tooltip = formatReactorNames(reaction.users);

  return (
    <HoverCard openDelay={150} closeDelay={80}>
      <HoverCardTrigger asChild>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`flex items-center gap-1 px-2 h-6 rounded-full text-[11px] leading-none transition-colors ${
            reacted
              ? 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary/15'
              : 'bg-foreground/[0.05] text-foreground/80 border border-transparent hover:bg-foreground/[0.08]'
          }`}
          aria-label={`${reaction.emoji} ${reaction.users.length} 人`}
        >
          <span className="text-[13px] leading-none">{reaction.emoji}</span>
          <span className="tabular-nums">{reaction.users.length}</span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="start"
        sideOffset={6}
        className="w-auto max-w-[240px] px-2.5 py-1.5 text-[11px] leading-relaxed"
      >
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[13px]">{reaction.emoji}</span>
          <span className="text-muted-foreground">{reaction.users.length} 人</span>
        </div>
        <div className="text-foreground/90">{tooltip}</div>
      </HoverCardContent>
    </HoverCard>
  );
}

function ActionButton({
  icon: Icon,
  count,
  active,
  ariaLabel,
  onClick,
}: {
  icon: React.ElementType;
  count?: number;
  active?: boolean;
  ariaLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`flex items-center gap-1 px-2 h-7 rounded-md text-[11px] transition-colors ${
        active
          ? 'text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
      }`}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <Icon size={13} strokeWidth={1.8} fill={active ? 'currentColor' : 'none'} />
      {count !== undefined && count > 0 && <span>{count}</span>}
    </button>
  );
}

// Compact comment preview row — Feishu话题群 style: "name: text" inline, no avatar/time.
// Used only inside TopicCard previews; the topic detail page keeps full MessageRow.
function CompactCommentRow({ msg }: { msg: MessageRef }) {
  return (
    <div className="text-[12px] text-foreground/80 leading-[1.55]">
      <span className="text-foreground/55">
        {msg.authorName}
        {msg.authorKind === 'agent' && (
          <Bot size={10} strokeWidth={1.8} className="inline-block ml-0.5 -mt-0.5 text-muted-foreground" />
        )}
        ：
      </span>
      <span className="text-foreground/85">{renderTextWithMention(msg.text)}</span>
    </div>
  );
}

function MessageRow({ msg, onShare, topicTitle }: { msg: MessageRef; onShare?: (item: ShareItem) => void; topicTitle?: string }) {
  const row = (
    <div className="flex items-start gap-2">
      <MemberCardPopover memberId={msg.authorId}>
        <button
          type="button"
          className="flex-shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          title={msg.authorName}
        >
          <Avatar
            emoji={msg.authorKind === 'agent' ? msg.authorAvatar : undefined}
            initial={msg.authorKind === 'human' ? msg.authorAvatar : undefined}
            color={msg.authorColor}
            size="sm"
          />
        </button>
      </MemberCardPopover>
      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 mb-0.5">
          <MemberCardPopover memberId={msg.authorId}>
            <button
              type="button"
              className="text-[12px] font-medium text-foreground hover:text-primary focus:outline-none focus-visible:text-primary cursor-pointer"
            >
              {msg.authorName}
            </button>
          </MemberCardPopover>
          {msg.authorKind === 'agent' && (
            <Bot size={11} strokeWidth={1.8} className="text-muted-foreground flex-shrink-0" />
          )}
          {msg.replyMode === 'reference' && (
            <span className="text-[9px] text-muted-foreground bg-foreground/[0.06] px-1 py-px rounded flex-shrink-0">参考</span>
          )}
          <span className="text-[10.5px] text-muted-foreground flex-shrink-0">{msg.time}</span>
        </div>
        <div className="text-[12.5px] text-foreground/85 leading-relaxed break-words">
          {renderRichText(msg.text)}
        </div>
        <AttachmentList attachments={msg.attachments} onShare={onShare} />
      </div>
    </div>
  );
  if (!onShare) return row;
  return (
    <MessageContextMenu msg={msg} topicTitle={topicTitle} onShare={onShare}>
      {row}
    </MessageContextMenu>
  );
}

function AttachmentList({ attachments, onShare }: { attachments?: Attachment[]; onShare?: (item: ShareItem) => void }) {
  if (!attachments || attachments.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {attachments.map((att, i) => {
        const chip = <AttachmentChip att={att} />;
        return onShare ? (
          <AttachmentContextMenu key={i} att={att} onShare={onShare}>
            <div>{chip}</div>
          </AttachmentContextMenu>
        ) : (
          <div key={i}>{chip}</div>
        );
      })}
    </div>
  );
}

function AttachmentChip({ att }: { att: Attachment }) {
  if (att.kind === 'image') {
    return (
      <div className="relative w-32 h-20 rounded-md overflow-hidden border border-border/60 group">
        <div className={`absolute inset-0 bg-gradient-to-br ${att.thumbColor ?? 'from-slate-300 to-slate-400'}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
        <div className="absolute top-1 left-1 w-4 h-4 rounded bg-white/85 backdrop-blur-sm flex items-center justify-center">
          <ImageIcon size={9} strokeWidth={1.8} className="text-foreground/70" />
        </div>
        <div className="absolute bottom-1 left-1.5 right-1.5 text-[10px] text-white/95 truncate">{att.name}</div>
      </div>
    );
  }
  if (att.kind === 'link') {
    return (
      <a
        href={att.url}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="block w-full max-w-md rounded-md border border-border/60 bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-colors px-2.5 py-1.5"
      >
        <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground mb-0.5">
          <Link2 size={10} strokeWidth={1.8} />
          <span className="truncate">{att.siteName ?? att.url}</span>
        </div>
        <div className="text-[12px] text-foreground/90 leading-snug truncate">{att.name}</div>
        {att.description && (
          <div className="text-[11px] text-muted-foreground leading-snug line-clamp-1 mt-px">{att.description}</div>
        )}
      </a>
    );
  }
  // 'file' | 'html'
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-border/60 bg-foreground/[0.02] text-[11px] text-foreground/80">
      <FileText size={11} strokeWidth={1.6} />
      <span>{att.name}</span>
      {att.size && <span className="text-muted-foreground">· {att.size}</span>}
    </div>
  );
}

// Highlight @mentions inline (single line — assumes paragraphs already split out).
// Resolvable mentions wrap in MemberCardPopover so clicking surfaces the card.
function renderTextWithMention(text: string) {
  const parts = text.split(/(@\S+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      const target = findMemberByMention(part);
      const pill = (
        <span
          onClick={(e) => target && e.stopPropagation()}
          className={`text-blue-500 bg-blue-500/10 px-0.5 rounded ${target ? 'cursor-pointer hover:bg-blue-500/20' : ''}`}
        >
          {part}
        </span>
      );
      if (!target) return <span key={i}>{pill}</span>;
      return (
        <MemberCardPopover key={i} memberId={target.id}>
          {pill}
        </MemberCardPopover>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

// Render message text with paragraph breaks (\n\n) as tight 6px gaps,
// and intra-paragraph single \n as <br/>. Replaces relying on `whitespace-pre-wrap`,
// which gave a full empty line for every \n\n and looked too airy.
function renderRichText(text: string) {
  return text.split(/\n{2,}/).map((para, pi) => (
    <p key={pi} className={pi > 0 ? 'mt-1.5' : ''}>
      {para.split('\n').map((line, li) => (
        <span key={li}>
          {li > 0 && <br />}
          {renderTextWithMention(line)}
        </span>
      ))}
    </p>
  ));
}
