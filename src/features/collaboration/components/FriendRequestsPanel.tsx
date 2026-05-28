import { ArrowLeft } from 'lucide-react';
import { FriendRequest } from '../data';
import { Avatar } from './Avatar';

interface FriendRequestsListProps {
  requests: FriendRequest[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBack: () => void;
}

export function FriendRequestsList({ requests, selectedId, onSelect, onBack }: FriendRequestsListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/40">
        <button
          onClick={onBack}
          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50"
          title="返回"
        >
          <ArrowLeft size={14} strokeWidth={1.8} />
        </button>
        <span className="text-[13px] text-foreground/90">新好友请求</span>
        <span className="text-[11px] text-muted-foreground">· {requests.length} 个待处理</span>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {requests.length === 0 && (
          <div className="text-center text-[12px] text-muted-foreground py-12">
            没有待处理的好友请求
          </div>
        )}
        {requests.map(r => (
          <button
            key={r.id}
            onClick={() => onSelect(r.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 transition-colors relative ${selectedId === r.id ? 'bg-cherry-active-bg' : 'hover:bg-accent/50'}`}
          >
            {selectedId === r.id && <div className="absolute inset-0 border-l-2 border-primary pointer-events-none" />}
            <Avatar
              initial={r.fromAvatarInitial}
              color={r.fromAvatarColor}
              size="sm"
            />
            <div className="flex-1 min-w-0 text-left">
              <div className="text-[12.5px] text-foreground truncate">{r.fromName}</div>
              <div className="text-[10px] text-muted-foreground truncate">{r.fromEmail}</div>
            </div>
            <div className="text-[10px] text-muted-foreground flex-shrink-0">{r.time}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

interface FriendRequestDetailProps {
  request: FriendRequest;
  onAccept: () => void;
  onReject: () => void;
}

export function FriendRequestDetail({ request, onAccept, onReject }: FriendRequestDetailProps) {
  return (
    <div className="h-full flex items-center justify-center px-8 py-10 overflow-y-auto">
      <div className="w-full max-w-sm space-y-7">
        {/* Identity — mirrors ContactDetail's identity block */}
        <div className="flex flex-col items-center text-center">
          <Avatar initial={request.fromAvatarInitial} color={request.fromAvatarColor} size="xl" />
          <div className="mt-3 text-[17px] text-foreground">{request.fromName}</div>
          <div className="mt-1.5 text-[12px] text-muted-foreground">{request.fromEmail}</div>
          <div className="mt-1 text-[10.5px] text-muted-foreground">{request.time}</div>
        </div>

        {/* Note from requester */}
        <div className="px-4 py-3 rounded-lg bg-foreground/[0.03] border border-border/40">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
            附言
          </div>
          <div className="text-[12.5px] text-foreground/85 leading-relaxed">
            {request.message}
          </div>
        </div>

        {/* Actions — compact intrinsic-width buttons centered as a cluster,
            matching the ContactDetail layout. */}
        <div className="flex items-center justify-center gap-2.5">
          <button
            onClick={onReject}
            className="inline-flex items-center justify-center min-w-[96px] h-9 px-4 rounded-lg text-[12.5px] border border-border text-foreground hover:bg-accent/40"
          >
            拒绝
          </button>
          <button
            onClick={onAccept}
            className="inline-flex items-center justify-center min-w-[96px] h-9 px-4 rounded-lg text-[12.5px] bg-primary text-primary-foreground hover:bg-primary/90"
          >
            接受
          </button>
        </div>
      </div>
    </div>
  );
}
