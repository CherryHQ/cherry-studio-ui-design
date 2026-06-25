import { useState } from 'react';
import { toast } from 'sonner';
import type { Group } from '@/features/collaboration/data';
import { TopicView } from '@/features/collaboration/components/TopicView';
import { TopicDetail } from '@/features/collaboration/components/TopicDetail';
import { GroupSettingsDrawer } from '@/features/collaboration/components/GroupSettingsDrawer';
import { HtmlArtifactPanel } from '@/features/collaboration/components/HtmlArtifactPanel';
import { NewTopicDialog } from '@/features/collaboration/components/NewTopicDialog';
import { AddMemberDialog } from '@/features/collaboration/components/AddMemberDialog';

// ===========================
// GroupChatPane
// ===========================
// The right-side panel for a selected 项目组 (group), mounted inside the 工作
// (Agent) module. It is the collaboration module's group view — topic list
// (TopicView) → topic thread (TopicDetail) — plus the group-settings drawer,
// the HTML artifact side panel, and the in-group dialogs (发起话题 / 加成员).
// Lifted out of CollaborationPage so 私聊 (Agent) and 群聊 (group) can share
// one merged list. Mount with `key={group.id}` so per-group state (selected
// topic, open panels) resets when switching groups.

export function GroupChatPane({ group }: { group: Group }) {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [newTopicOpen, setNewTopicOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [groupSettingsOpen, setGroupSettingsOpen] = useState(false);
  const [openHtmlFile, setOpenHtmlFile] = useState<string | null>(null);
  const [htmlPanelMaximized, setHtmlPanelMaximized] = useState(false);

  const selectedTopic = group.topics.find(t => t.id === selectedTopicId) ?? null;

  const rightPane = selectedTopic ? (
    <TopicDetail
      group={group}
      topic={selectedTopic}
      onBack={() => setSelectedTopicId(null)}
    />
  ) : (
    <TopicView
      group={group}
      onOpenGroupSettings={() => setGroupSettingsOpen(true)}
      onClickNewTopic={() => setNewTopicOpen(true)}
      onClickAddMember={() => setAddMemberOpen(true)}
      onOpenTopic={(id) => setSelectedTopicId(id)}
      onOpenHtmlArtifact={setOpenHtmlFile}
    />
  );

  return (
    <div className="relative h-full min-h-0">
      <div className="flex h-full min-h-0">
        {/* Main right pane — `relative` so the group settings drawer can scope
            its overlay/panel to just this area. */}
        <div className="flex-1 min-w-0 flex flex-col relative overflow-hidden">
          {rightPane}
          <GroupSettingsDrawer
            open={groupSettingsOpen}
            group={group}
            onClose={() => setGroupSettingsOpen(false)}
            onOpenAddMember={() => {
              setGroupSettingsOpen(false);
              setAddMemberOpen(true);
            }}
          />
        </div>

        {/* HTML artifact side panel — opens to the right when an HTML file is
            clicked. When maximized it takes over the whole pane (below). */}
        {openHtmlFile && !htmlPanelMaximized && (
          <div className="w-[480px] flex-shrink-0 flex flex-col min-h-0 border-l border-border/30">
            <HtmlArtifactPanel
              fileName={openHtmlFile}
              onClose={() => { setOpenHtmlFile(null); setHtmlPanelMaximized(false); }}
              maximized={false}
              onToggleMaximize={() => setHtmlPanelMaximized(true)}
            />
          </div>
        )}
      </div>

      {/* Maximized HTML artifact panel — overlays the whole group content area */}
      {openHtmlFile && htmlPanelMaximized && (
        <div className="absolute inset-0 z-30 flex bg-background">
          <div className="flex-1 min-w-0 flex flex-col">
            <HtmlArtifactPanel
              fileName={openHtmlFile}
              onClose={() => { setOpenHtmlFile(null); setHtmlPanelMaximized(false); }}
              maximized
              onToggleMaximize={() => setHtmlPanelMaximized(false)}
            />
          </div>
        </div>
      )}

      <NewTopicDialog
        open={newTopicOpen}
        group={group}
        onClose={() => setNewTopicOpen(false)}
      />
      <AddMemberDialog
        open={addMemberOpen}
        group={group}
        onClose={() => setAddMemberOpen(false)}
        onConfirm={(ids) => {
          toast.success(`已添加 ${ids.length} 位成员到「${group.name}」`);
        }}
      />
    </div>
  );
}
