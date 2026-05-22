import React, { useState } from 'react';
import { Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { Button, SearchInput, EmptyState, Typography } from '@cherry-studio/ui';
import { toast } from 'sonner';
import { useRecycleBin } from '@/app/context/RecycleBinContext';
import { useArchive } from '@/app/context/ArchiveContext';

// ===========================
// Archive Manage Page
// ===========================

export function ArchiveManagePage() {
  // Archived sessions live in a context (not local state) so the recycle
  // bin's undo callback can restore an archived item even if the user
  // navigates away from this page during the 5-second toast window.
  const { sessions, setSessions } = useArchive();
  const [searchQuery, setSearchQuery] = useState('');

  // Deleting from archive sends the item to the recycle bin (industry-standard
  // two-step deletion: archive → bin → permanent). User has already made an
  // archive decision, so we skip the confirm dialog and rely on the undo toast.
  const { moveToBin } = useRecycleBin();

  const filtered = sessions.filter(s => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return s.title.toLowerCase().includes(q) || s.agentName.toLowerCase().includes(q);
    }
    return true;
  });

  const handleUnarchive = (id: string) => {
    const session = sessions.find(s => s.id === id);
    setSessions(prev => prev.filter(s => s.id !== id));
    if (session) {
      const target = session.type === 'agent' ? 'Agent 运行历史' : '聊天列表';
      toast.success('已取消归档', {
        description: `「${session.title}」已恢复，可在${target}中查看。`,
      });
    }
  };

  const handleDelete = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (!session) return;
    setSessions(prev => prev.filter(s => s.id !== id));
    moveToBin(
      {
        id: `bin-archived-${session.id}-${Date.now()}`,
        type: session.type === 'agent' ? 'session' : 'topic',
        name: session.title,
        icon: session.agentIcon,
        meta: session.agentName,
        source: 'manual',
        fromArchived: true,
      },
      {
        // Both the 5-second undo and the later "恢复" inside the recycle
        // bin put the item back into the archive list. The user already
        // intentionally archived this item before deleting it; restoring
        // should respect that prior state. To return it to active use,
        // they can un-archive from the archive page afterwards.
        onUndo: () => setSessions(prev => [session, ...prev]),
      },
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <Archive size={16} className="text-muted-foreground" />
          <Typography variant="subtitle">归档管理</Typography>
          <span className="text-xs text-muted-foreground tabular-nums">{sessions.length}</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">已归档的会话记录，可随时恢复或删除（删除后会先进回收站）。</p>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="搜索归档会话..."
              clearable
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 scrollbar-thin">
        {filtered.length === 0 ? (
          <EmptyState
            preset="no-result"
            title={searchQuery ? '未找到匹配的归档' : '暂无归档会话'}
            compact
          />
        ) : (
          <div className="space-y-px">
            {filtered.map(session => (
              <div
                key={session.id}
                className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/15 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground truncate">{session.title}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs flex-shrink-0">{session.agentIcon}</span>
                    <span className="text-xs text-muted-foreground">{session.agentName}</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0 group-hover:hidden">{session.timestamp}</span>
                <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="inline"
                    onClick={() => handleUnarchive(session.id)}
                    className="px-2 py-[2px] text-xs text-foreground hover:bg-accent/30"
                  >
                    <ArchiveRestore size={11} />
                    <span>恢复</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="inline"
                    onClick={() => handleDelete(session.id)}
                    title="移到回收站"
                    className="px-2 py-[2px] text-xs text-destructive/70 hover:bg-destructive/8"
                  >
                    <Trash2 size={11} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
