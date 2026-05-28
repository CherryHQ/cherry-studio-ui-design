import { ReactNode } from 'react';
import { Forward, Pin, Reply, Copy, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@cherry-studio/ui';
import type { Attachment, MessageRef } from '../data';
import type { ShareItem } from './ShareDialog';

// Common IM right-click pattern (Slack / Feishu / Discord):
// — One menu component, two flavours: message or attachment.
// — Items grouped by intent: action → organize → utility.
// — Destructive items would go in a separator group at the bottom; we don't
//   surface any here (no delete in the prototype).

interface MessageMenuProps {
  msg: MessageRef;
  topicTitle?: string;          // used for the share preview subtitle
  onShare: (item: ShareItem) => void;
  onReply?: (msg: MessageRef) => void;
  children: ReactNode;
}

export function MessageContextMenu({ msg, topicTitle, onShare, onReply, children }: MessageMenuProps) {
  const handleReply = () => {
    if (onReply) {
      onReply(msg);
    } else {
      toast.success(`已引用 ${msg.authorName} 的消息`);
    }
  };

  const handleShare = () => {
    onShare({
      kind: 'topic',
      title: topicTitle ?? msg.authorName,
      subtitle: msg.text.slice(0, 60),
    });
  };

  const handlePin = () => {
    toast.success('已 Pin 到群组');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(msg.text);
      toast.success('已复制到剪贴板');
    } catch {
      toast.error('复制失败');
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="min-w-[180px]">
        <ContextMenuItem onSelect={handleReply} className="gap-2.5 text-xs">
          <Reply size={12} className="text-muted-foreground" />
          回复
        </ContextMenuItem>
        <ContextMenuItem onSelect={handleShare} className="gap-2.5 text-xs">
          <Forward size={12} className="text-muted-foreground" />
          转发
        </ContextMenuItem>
        <ContextMenuItem onSelect={handlePin} className="gap-2.5 text-xs">
          <Pin size={12} className="text-muted-foreground" />
          Pin 到群组
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={handleCopy} className="gap-2.5 text-xs">
          <Copy size={12} className="text-muted-foreground" />
          复制消息文本
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

// =========================================================================

interface AttachmentMenuProps {
  att: Attachment;
  onShare: (item: ShareItem) => void;
  children: ReactNode;
}

export function AttachmentContextMenu({ att, onShare, children }: AttachmentMenuProps) {
  // "Reveal in finder" only makes sense for produced artifacts that exist as
  // local files. Links live on a remote URL, so we hide the entry for them.
  const isLocalArtifact = att.kind === 'file' || att.kind === 'html' || att.kind === 'image';

  const handleShare = () => {
    onShare({
      kind: 'attachment',
      title: att.name,
      subtitle: att.kind === 'link' ? (att.siteName ?? att.url) : att.size,
      fileKind: att.kind === 'image' ? 'image' : att.kind === 'link' ? 'link' : 'file',
    });
  };

  const handleReveal = () => {
    toast.success(`已在文件夹中显示 ${att.name}`);
  };

  const handlePin = () => {
    toast.success(`已 Pin ${att.name}`);
  };

  const handleCopy = async () => {
    const text = att.kind === 'link' && att.url ? att.url : att.name;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(att.kind === 'link' ? '已复制链接' : '已复制文件名');
    } catch {
      toast.error('复制失败');
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="min-w-[180px]">
        <ContextMenuItem onSelect={handleShare} className="gap-2.5 text-xs">
          <Forward size={12} className="text-muted-foreground" />
          转发
        </ContextMenuItem>
        {isLocalArtifact && (
          <ContextMenuItem onSelect={handleReveal} className="gap-2.5 text-xs">
            <FolderOpen size={12} className="text-muted-foreground" />
            打开所在文件夹
          </ContextMenuItem>
        )}
        <ContextMenuItem onSelect={handlePin} className="gap-2.5 text-xs">
          <Pin size={12} className="text-muted-foreground" />
          Pin 到群组
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={handleCopy} className="gap-2.5 text-xs">
          <Copy size={12} className="text-muted-foreground" />
          {att.kind === 'link' ? '复制链接' : '复制文件名'}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
