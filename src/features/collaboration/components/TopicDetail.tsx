import { useState } from 'react';
import { ArrowLeft, Paperclip, AtSign, FileText, Bot, Link2, ImageIcon, Smile, Image as ImageLine, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Attachment, Group, Topic, MessageRef, findMemberByMention } from '../data';
import { Avatar } from './Avatar';
import { MemberCardPopover } from './ContactsPanel';
import { ShareDialog, type ShareItem } from './ShareDialog';
import { MessageContextMenu, AttachmentContextMenu } from './MessageContextMenu';

interface TopicDetailProps {
  group: Group;
  topic: Topic;
  onBack: () => void;
}

// Independent topic page — opened by clicking a topic card in the group's topic list.
// Mirrors Feishu's "click into a topic" view: shows the starter as the main content,
// then ALL replies as comments, plus a reply composer at the bottom.
export function TopicDetail({ group, topic, onBack }: TopicDetailProps) {
  const replyCount = topic.replies.length;
  const [draft, setDraft] = useState('');
  const [shareItem, setShareItem] = useState<ShareItem | null>(null);

  const send = () => {
    if (!draft.trim()) return;
    toast.success('已发评论');
    setDraft('');
  };

  const handleShareAttachment = (att: Attachment) => {
    const fileKind: 'file' | 'image' | 'link' | undefined =
      att.kind === 'image' ? 'image' : att.kind === 'link' ? 'link' : 'file';
    setShareItem({
      kind: 'attachment',
      title: att.name,
      subtitle: att.kind === 'link' ? (att.siteName ?? att.url) : att.size,
      fileKind,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header — back to group's topic list */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40">
        <button
          onClick={onBack}
          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50"
          title="返回群组"
        >
          <ArrowLeft size={14} strokeWidth={1.8} />
        </button>
        <span className="text-[12px] text-muted-foreground"># {group.name}</span>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* Starter (main content) */}
        <div className="px-5 pt-4 pb-3">
          <DetailMessageRow msg={topic.starter} primary onShareAttachment={handleShareAttachment} onShare={setShareItem} topicTitle={topic.title} />
        </div>

        {/* Comments section */}
        <div className="border-t border-border/40 bg-foreground/[0.015]">
          <div className="px-5 pt-3 pb-1 text-[11px] text-muted-foreground">
            {replyCount > 0 ? `${replyCount} 条评论` : '暂无评论'}
          </div>
          {replyCount > 0 && (
            <div className="px-5 pb-4 space-y-3">
              {topic.replies.map((reply, idx) => (
                <DetailMessageRow key={idx} msg={reply} onShareAttachment={handleShareAttachment} onShare={setShareItem} topicTitle={topic.title} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reply composer — taller textarea + toolbar (emoji / @ / image / attachment) + send */}
      <div className="border-t border-border/40 px-5 py-3 bg-background">
        <div className="rounded-xl border border-border bg-card focus-within:border-border focus-within:ring-1 focus-within:ring-primary/30 transition-shadow">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="发评论…  输入 @ 提及 Agent"
            rows={3}
            className="w-full bg-transparent px-3 pt-2.5 pb-1 text-[12.5px] text-foreground placeholder:text-muted-foreground/60 outline-none resize-none"
          />
          <div className="flex items-center justify-between px-2 py-1.5 border-t border-border/30">
            <div className="flex items-center gap-0.5">
              <ComposerIconButton icon={Smile} label="表情" onClick={() => {}} />
              <ComposerIconButton icon={AtSign} label="@ 提及" onClick={() => {}} />
              <ComposerIconButton icon={ImageLine} label="图片" onClick={() => {}} />
              <ComposerIconButton icon={Paperclip} label="附件" onClick={() => {}} />
            </div>
            <button
              disabled={!draft.trim()}
              onClick={send}
              className={`px-3 h-7 rounded-md text-[12px] flex items-center gap-1 transition-colors ${
                draft.trim()
                  ? 'bg-foreground text-background hover:bg-foreground/90'
                  : 'bg-foreground/[0.08] text-muted-foreground/60 cursor-not-allowed'
              }`}
              title="发送 (⌘/Ctrl + Enter)"
            >
              发送
            </button>
          </div>
        </div>
      </div>

      <ShareDialog
        open={!!shareItem}
        item={shareItem}
        onClose={() => setShareItem(null)}
      />
    </div>
  );
}

function ComposerIconButton({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
      title={label}
      aria-label={label}
    >
      <Icon size={14} strokeWidth={1.6} />
    </button>
  );
}

function DetailMessageRow({ msg, primary, onShareAttachment, onShare, topicTitle }: { msg: MessageRef; primary?: boolean; onShareAttachment?: (att: Attachment) => void; onShare?: (item: ShareItem) => void; topicTitle?: string }) {
  const row = (
    <div className="flex items-start gap-3 px-2 py-1 -mx-2 -my-1 rounded-md transition-colors hover:bg-accent/20 data-[state=open]:bg-accent/30" data-state="closed">
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
              className={`${primary ? 'text-[13px]' : 'text-[12px]'} font-medium text-foreground hover:text-primary cursor-pointer`}
            >
              {msg.authorName}
            </button>
          </MemberCardPopover>
          {msg.authorKind === 'agent' && (
            <Bot size={primary ? 12 : 11} strokeWidth={1.8} className="text-muted-foreground flex-shrink-0" />
          )}
          {msg.replyMode === 'reference' && (
            <span className="text-[9px] text-muted-foreground bg-foreground/[0.06] px-1 py-px rounded flex-shrink-0">参考</span>
          )}
          <span className="text-[10.5px] text-muted-foreground flex-shrink-0">{msg.time}</span>
        </div>
        <div className={`${primary ? 'text-[13px]' : 'text-[12.5px]'} text-foreground/85 leading-relaxed break-words`}>
          {renderRichText(msg.text)}
        </div>
        {msg.attachments && msg.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {msg.attachments.map((att, i) => {
              const chip = <AttachmentChip att={att} onShare={onShareAttachment ? () => onShareAttachment(att) : undefined} />;
              return onShare ? (
                <AttachmentContextMenu key={i} att={att} onShare={onShare}>
                  <div>{chip}</div>
                </AttachmentContextMenu>
              ) : (
                <div key={i}>{chip}</div>
              );
            })}
          </div>
        )}
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

function AttachmentChip({ att, onShare }: { att: Attachment; onShare?: () => void }) {
  // Floating share icon — appears on hover when onShare is provided.
  const shareBtn = onShare ? (
    <button
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); onShare(); }}
      title="分享"
      aria-label="分享"
      className="absolute top-1 right-1 w-5 h-5 rounded bg-background/95 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
    >
      <Share2 size={10} strokeWidth={1.8} />
    </button>
  ) : null;

  if (att.kind === 'image') {
    return (
      <div className="group relative w-40 h-24 rounded-md overflow-hidden border border-border/60">
        <div className={`absolute inset-0 bg-gradient-to-br ${att.thumbColor ?? 'from-slate-300 to-slate-400'}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
        <div className="absolute top-1 left-1 w-4 h-4 rounded bg-white/85 backdrop-blur-sm flex items-center justify-center">
          <ImageIcon size={10} strokeWidth={1.8} className="text-foreground/70" />
        </div>
        <div className="absolute bottom-1 left-1.5 right-1.5 text-[10.5px] text-white/95 truncate">{att.name}</div>
        {shareBtn}
      </div>
    );
  }
  if (att.kind === 'link') {
    return (
      <div className="group relative w-full max-w-md">
        <a
          href={att.url}
          target="_blank"
          rel="noreferrer"
          className="block rounded-md border border-border/60 bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-colors px-2.5 py-1.5"
        >
          <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground mb-0.5">
            <Link2 size={10} strokeWidth={1.8} />
            <span className="truncate">{att.siteName ?? att.url}</span>
          </div>
          <div className="text-[12px] text-foreground/90 leading-snug truncate">{att.name}</div>
          {att.description && (
            <div className="text-[11px] text-muted-foreground leading-snug line-clamp-2 mt-px">{att.description}</div>
          )}
        </a>
        {shareBtn}
      </div>
    );
  }
  return (
    <div className="group relative inline-flex items-center gap-1.5 px-2 py-1 pr-7 rounded-md border border-border/60 bg-foreground/[0.02] text-[11px] text-foreground/80">
      <FileText size={11} strokeWidth={1.6} />
      <span>{att.name}</span>
      {att.size && <span className="text-muted-foreground">· {att.size}</span>}
      {shareBtn}
    </div>
  );
}

function renderTextWithMention(text: string) {
  const parts = text.split(/(@\S+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      const target = findMemberByMention(part);
      const pill = (
        <span
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
// and intra-paragraph single \n as <br/>. Replaces `whitespace-pre-wrap`,
// which rendered every \n\n as a full empty line and looked too airy.
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
