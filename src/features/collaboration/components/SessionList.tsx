import { Bell, Contact, Plus, Search } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@cherry-studio/ui';
import { Group, FriendRequest } from '../data';

interface SessionListProps {
  groups: Group[];
  pendingRequests: FriendRequest[];
  selectedGroupId: string | null;
  showingFriendRequests: boolean;
  onSelectGroup: (groupId: string) => void;
  onOpenFriendRequests: () => void;
  onOpenContacts: () => void;
  onClickNewGroup: () => void;
  onClickAddFriend: () => void;
  onClickCreateAgent: () => void;
}

export function SessionList({
  groups,
  pendingRequests,
  selectedGroupId,
  showingFriendRequests,
  onSelectGroup,
  onOpenFriendRequests,
  onOpenContacts,
  onClickNewGroup,
  onClickAddFriend,
  onClickCreateAgent,
}: SessionListProps) {
  const pendingCount = pendingRequests.length;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar — search on left, contacts + new on right */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/40">
        {/* Search — matches sidebar search style */}
        <div className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-sidebar-accent/50 text-muted-foreground text-xs cursor-pointer hover:bg-accent transition-colors">
          <Search size={13} />
          <span>搜索</span>
        </div>
        {/* Contacts icon — with red dot when pending requests */}
        <button
          onClick={onOpenContacts}
          className="relative w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          title="通讯录"
        >
          <Contact size={14} strokeWidth={1.6} />
          {pendingCount > 0 && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary ring-1 ring-background" />
          )}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              title="新建"
            >
              <Plus size={15} strokeWidth={1.8} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4} className="w-36">
            <DropdownMenuItem onClick={onClickNewGroup}>发起群聊</DropdownMenuItem>
            <DropdownMenuItem onClick={onClickAddFriend}>添加好友</DropdownMenuItem>
            <DropdownMenuItem onClick={onClickCreateAgent}>创建 Agent</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-1">
        {/* Friend requests pinned item — Slack-channel style row */}
        {pendingCount > 0 && (
          <button
            onClick={onOpenFriendRequests}
            className={`w-full flex items-center gap-2 px-3 py-1.5 transition-colors relative
              ${showingFriendRequests ? 'bg-cherry-active-bg' : 'hover:bg-accent/50'}`}
          >
            {showingFriendRequests && (
              <div className="absolute inset-0 border-l-2 border-primary pointer-events-none" />
            )}
            <span className="w-4 flex items-center justify-center text-muted-foreground flex-shrink-0">
              <Bell size={13} strokeWidth={1.6} />
            </span>
            <span className="flex-1 text-left text-[13px] text-foreground/80 truncate">
              新好友请求
            </span>
            <div className="min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center flex-shrink-0">
              {pendingCount}
            </div>
          </button>
        )}

        {/* Separator between pinned and groups */}
        {pendingCount > 0 && <div className="mx-3 my-1 border-t border-border/30" />}

        {/* Group items — Slack-channel style: just #name + optional unread badge */}
        {groups.map(group => {
          const isActive = !showingFriendRequests && selectedGroupId === group.id;
          const prefix = '#';
          return (
            <button
              key={group.id}
              onClick={() => onSelectGroup(group.id)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 transition-colors relative
                ${isActive ? 'bg-cherry-active-bg' : 'hover:bg-accent/50'}`}
            >
              {isActive && (
                <div className="absolute inset-0 border-l-2 border-primary pointer-events-none" />
              )}
              <span className="text-[13px] text-muted-foreground flex-shrink-0 w-4 text-center">
                {prefix}
              </span>
              <span className={`flex-1 text-left text-[13px] truncate ${(group.unread ?? 0) > 0 ? 'text-foreground' : 'text-foreground/80'}`}>
                {group.name}
              </span>
              {(group.unread ?? 0) > 0 && (
                <div className="min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center flex-shrink-0">
                  {group.unread}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
