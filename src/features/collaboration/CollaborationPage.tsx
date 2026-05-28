import { useState } from 'react';
import { toast } from 'sonner';
import { MOCK_GROUPS, MOCK_AGENTS, MOCK_HUMANS, type CollabUser, type FriendRequest } from './data';
import { useCollab } from './CollabContext';
import { SessionList } from './components/SessionList';
import { TopicView } from './components/TopicView';
import { TopicDetail } from './components/TopicDetail';
import { ContactsList, ContactDetail } from './components/ContactsPanel';
import { FriendRequestsList, FriendRequestDetail } from './components/FriendRequestsPanel';
import { AddFriendDialog } from './components/AddFriendDialog';
import { NewGroupDialog } from './components/NewGroupDialog';
import { CreateAgentDialog } from './components/CreateAgentDialog';
import { NewTopicDialog } from './components/NewTopicDialog';
import { AddMemberDialog } from './components/AddMemberDialog';
import { GroupSettingsDrawer } from './components/GroupSettingsDrawer';
import { HtmlArtifactPanel } from './components/HtmlArtifactPanel';
import { Users2, Mail } from 'lucide-react';

type LeftMode = 'sessions' | 'contacts' | 'requests';

export function CollaborationPage() {
  const { boundEmail, pendingRequests, acceptRequest, rejectRequest, openUserInfo } = useCollab();

  const [mode, setMode] = useState<LeftMode>('sessions');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(MOCK_GROUPS[0]?.id ?? null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const [addFriendOpen, setAddFriendOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [createAgentOpen, setCreateAgentOpen] = useState(false);
  const [newTopicOpen, setNewTopicOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [groupSettingsOpen, setGroupSettingsOpen] = useState(false);
  const [openHtmlFile, setOpenHtmlFile] = useState<string | null>(null);
  const [htmlPanelMaximized, setHtmlPanelMaximized] = useState(false);

  // Gate add-friend behind email binding. If user hasn't bound their own email,
  // route to the user info popup with a toast hint instead of opening the
  // friend dialog — otherwise the "bind YOUR email" banner and the "enter
  // THEIR email" input both appear at once and fight for attention.
  const handleAddFriendClick = () => {
    if (!boundEmail) {
      toast.warning('请先绑定你的协作邮箱', {
        description: '在左下角个人信息里绑定 Gmail 或 QQ 邮箱后即可添加好友',
      });
      openUserInfo();
      return;
    }
    setAddFriendOpen(true);
  };

  const selectedGroup = MOCK_GROUPS.find(g => g.id === selectedGroupId) ?? null;
  const selectedRequest = pendingRequests.find(r => r.id === selectedRequestId);

  // ----- Left pane modes -----
  const handleOpenContacts = () => {
    setMode('contacts');
    setSelectedContactId(null);
  };

  const handleOpenFriendRequests = () => {
    setMode('requests');
    setSelectedRequestId(pendingRequests[0]?.id ?? null);
  };

  const handleBackToSessions = () => {
    setMode('sessions');
  };

  const handleSelectGroup = (id: string) => {
    setMode('sessions');
    setSelectedGroupId(id);
    setSelectedTopicId(null); // reset to group's topic list when switching groups
  };

  const selectedTopic = selectedGroup?.topics.find(t => t.id === selectedTopicId) ?? null;

  // ----- Render right pane -----
  let rightPane: React.ReactNode;
  if (mode === 'sessions') {
    if (selectedGroup && selectedTopic) {
      rightPane = (
        <TopicDetail
          group={selectedGroup}
          topic={selectedTopic}
          onBack={() => setSelectedTopicId(null)}
        />
      );
    } else if (selectedGroup) {
      rightPane = (
        <TopicView
          group={selectedGroup}
          onOpenGroupSettings={() => setGroupSettingsOpen(true)}
          onClickNewTopic={() => setNewTopicOpen(true)}
          onClickAddMember={() => setAddMemberOpen(true)}
          onOpenTopic={(id) => setSelectedTopicId(id)}
          onOpenHtmlArtifact={setOpenHtmlFile}
        />
      );
    } else {
      rightPane = <CollabEmptyState bound={!!boundEmail} onBind={openUserInfo} onAddFriend={handleAddFriendClick} onNewGroup={() => setNewGroupOpen(true)} />;
    }
  } else if (mode === 'contacts') {
    rightPane = selectedContactId ? (
      <ContactDetail
        contactId={selectedContactId}
        onSelectContact={setSelectedContactId}
        onEnterSession={(groupId) => {
          setMode('sessions');
          setSelectedGroupId(groupId);
          setSelectedTopicId(null);
        }}
      />
    ) : (
      <EmptyHint text="点左侧联系人查看详情" />
    );
  } else {
    rightPane = selectedRequest ? (
      <FriendRequestDetail
        request={selectedRequest}
        onAccept={() => {
          // Promote the requester into a real contact and jump into their detail page,
          // so accepting flows directly into the "已添加好友" view.
          const newId = promoteRequestToContact(selectedRequest);
          acceptRequest(selectedRequest.id);
          setSelectedRequestId(null);
          setMode('contacts');
          setSelectedContactId(newId);
          toast.success(`已添加 ${selectedRequest.fromName} 为好友`);
        }}
        onReject={() => {
          rejectRequest(selectedRequest.id);
          setSelectedRequestId(null);
          if (pendingRequests.length <= 1) setMode('sessions');
        }}
      />
    ) : (
      <EmptyHint text="没有待处理的请求" />
    );
  }

  return (
    <div className="relative h-full min-h-0">
      <div className="flex h-full min-h-0">
        {/* Left pane */}
        <div className="w-[260px] flex-shrink-0 border-r border-border/40 bg-foreground/[0.015] flex flex-col">
          {mode === 'sessions' && (
            <SessionList
              groups={MOCK_GROUPS}
              pendingRequests={pendingRequests}
              selectedGroupId={selectedGroupId}
              showingFriendRequests={false}
              onSelectGroup={handleSelectGroup}
              onOpenFriendRequests={handleOpenFriendRequests}
              onOpenContacts={handleOpenContacts}
              onClickNewGroup={() => setNewGroupOpen(true)}
              onClickCreateAgent={() => setCreateAgentOpen(true)}
              onClickAddFriend={handleAddFriendClick}
            />
          )}
          {mode === 'contacts' && (
            <ContactsList
              selectedId={selectedContactId}
              onSelect={setSelectedContactId}
              onBack={handleBackToSessions}
            />
          )}
          {mode === 'requests' && (
            <FriendRequestsList
              requests={pendingRequests}
              selectedId={selectedRequestId}
              onSelect={setSelectedRequestId}
              onBack={handleBackToSessions}
            />
          )}
        </div>

        {/* Right pane — `relative` so the group settings drawer can scope
            its overlay/panel to just this area (not the whole window). */}
        <div className="flex-1 min-w-0 flex flex-col relative overflow-hidden">
          {rightPane}
          <GroupSettingsDrawer
            open={groupSettingsOpen}
            group={selectedGroup}
            onClose={() => setGroupSettingsOpen(false)}
            onOpenAddMember={() => {
              setGroupSettingsOpen(false);
              setAddMemberOpen(true);
            }}
          />
        </div>

        {/* HTML artifact side panel — opens to the right of the main right pane
            when an HTML file is clicked. Mirrors Agent run page's ArtifactViewer.
            When maximized, the panel takes over the full content area (the left
            session list and main right pane are hidden via conditional rendering). */}
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

      {/* Maximized HTML artifact panel — overlays the whole collaboration content area */}
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

      <AddFriendDialog
        open={addFriendOpen}
        onClose={() => setAddFriendOpen(false)}
      />
      <NewGroupDialog open={newGroupOpen} onClose={() => setNewGroupOpen(false)} />
      <CreateAgentDialog open={createAgentOpen} onClose={() => setCreateAgentOpen(false)} />
      <NewTopicDialog
        open={newTopicOpen}
        group={selectedGroup}
        onClose={() => setNewTopicOpen(false)}
      />
      <AddMemberDialog
        open={addMemberOpen}
        group={selectedGroup}
        onClose={() => setAddMemberOpen(false)}
        onConfirm={(ids) => {
          toast.success(`已添加 ${ids.length} 位成员到「${selectedGroup?.name}」`);
        }}
      />
    </div>
  );
}

// Convert an accepted FriendRequest into a CollabUser and register it so the
// contacts list and ContactDetail can resolve the new friend by id. Mutates
// MOCK_HUMANS in place — prototype-level, sufficient for the design demo.
function promoteRequestToContact(req: FriendRequest): string {
  const newId = `u-from-req-${req.id}`;
  if (!MOCK_HUMANS.some(h => h.id === newId)) {
    const newContact: CollabUser = {
      id: newId,
      name: req.fromName,
      email: req.fromEmail,
      avatarColor: req.fromAvatarColor,
      avatarInitial: req.fromAvatarInitial,
      kind: 'human',
    };
    MOCK_HUMANS.push(newContact);
  }
  return newId;
}

// ===========================
// Empty states
// ===========================

function CollabEmptyState({
  bound,
  onBind,
  onAddFriend,
  onNewGroup,
}: {
  bound: boolean;
  onBind: () => void;
  onAddFriend: () => void;
  onNewGroup: () => void;
}) {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
          <Users2 size={26} strokeWidth={1.6} />
        </div>
        <div className="text-[15px] text-foreground mb-1.5">协作</div>
        <div className="text-[12px] text-muted-foreground leading-relaxed mb-5">
          多人 + 多 Agent 在话题群内推进任务。第一阶段通过邮箱协议收发消息。
        </div>

        {!bound ? (
          <div className="px-4 py-3 rounded-lg border border-amber-500/30 bg-amber-500/5 text-left mb-3">
            <div className="flex items-center gap-1.5 text-[12px] text-amber-700 dark:text-amber-400 mb-1">
              <Mail size={12} strokeWidth={1.8} />
              <span>第一步：绑定邮箱</span>
            </div>
            <div className="text-[11px] text-muted-foreground leading-relaxed mb-2">
              协作消息通过你的邮箱收发，需要先在个人信息里绑定 Gmail 或 QQ 邮箱。
            </div>
            <button
              onClick={onBind}
              className="text-[11px] text-amber-700 dark:text-amber-400 hover:opacity-80 underline"
            >
              去绑定邮箱 →
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 mb-3">
            <button
              onClick={onNewGroup}
              className="px-3 py-1.5 rounded-lg text-[12px] bg-primary text-primary-foreground hover:bg-primary/90"
            >
              发起群聊
            </button>
            <button
              onClick={onAddFriend}
              className="px-3 py-1.5 rounded-lg text-[12px] border border-border text-foreground hover:bg-accent/40"
            >
              添加好友
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="h-full flex items-center justify-center text-[12px] text-muted-foreground">
      {text}
    </div>
  );
}
