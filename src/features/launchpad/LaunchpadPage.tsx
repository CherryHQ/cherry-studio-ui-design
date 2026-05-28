import { useMemo, useState } from 'react';
import { Plus, Sparkles, FileText, Pin, Trash2, Pencil } from 'lucide-react';
import { useGlobalActions } from '@/app/context/GlobalActionContext';
import { dialogAppIcons, newTabHtmlPreviews } from '@/app/config/constants';
import { miniAppList } from '@/features/miniapp/MiniAppsPage';
import { usePinnedArtifacts, updateArtifact } from '@/app/stores/sharedArtifactsStore';
import { DEFAULT_ARTIFACT_ICON_NAME, resolveArtifactIcon } from '@/app/utils/artifactIcons';
import { PinToWorkbenchForm } from '@/app/components/shared/PinToWorkbenchForm';
import { toast } from 'sonner';
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger,
  Popover, PopoverAnchor, PopoverContent,
} from '@cherry-studio/ui';

// ===========================
// 启动页 (Launchpad)
// ===========================
// Replaces the legacy NewTabDialog modal. Three sections only —
// 功能 (built-in surfaces), 小程序 (user-added agents/mini-apps from
// the launcher), Agent 产物 (HTML artifacts the user pinned from
// agent runs). Clicking a tile delegates to the shared
// `launchpadOpen` action which routes by id namespace.

export function LaunchpadPage() {
  const { launchpadOpen, openMiniApp, pinToSidebar, removeFromLaunchpad, removedFromLaunchpad } = useGlobalActions();
  const pinned = usePinnedArtifacts();

  // Single source of truth for which pinned artifact is being edited
  // (vs one Popover state per tile). Re-keyed draft state resets when
  // the selected tile changes.
  const [editingPinnedId, setEditingPinnedId] = useState<string | null>(null);
  const [editDraftName, setEditDraftName] = useState('');
  const [editDraftIcon, setEditDraftIcon] = useState<string>(DEFAULT_ARTIFACT_ICON_NAME);

  const startEditPinned = (artifact: { id: string; label: string; iconName?: string }) => {
    setEditDraftName(artifact.label);
    setEditDraftIcon(artifact.iconName ?? DEFAULT_ARTIFACT_ICON_NAME);
    setEditingPinnedId(artifact.id);
  };

  const confirmEditPinned = () => {
    if (!editingPinnedId) return;
    const trimmed = editDraftName.trim();
    if (!trimmed) { toast.error('请输入应用名称'); return; }
    updateArtifact(editingPinnedId, { label: trimmed, iconName: editDraftIcon });
    toast.success('已更新');
    setEditingPinnedId(null);
  };

  // 用户添加的小程序 — embedded webpages (Gemini, ChatGPT, etc.).
  // Show the first 8 mini-apps as the user's "added" set; the full
  // catalog lives in the dedicated 小程序 page. Items the user
  // explicitly removed (right-click → 移除) are filtered out.
  const userMiniApps = useMemo(
    () => miniAppList.slice(0, 8).filter(a => !removedFromLaunchpad.has(`miniapp:${a.id}`)),
    [removedFromLaunchpad],
  );
  const visibleHtmlPreviews = useMemo(
    () => Object.entries(newTabHtmlPreviews).filter(([key]) => !removedFromLaunchpad.has(`artifact:${key}`)),
    [removedFromLaunchpad],
  );
  const visiblePinned = useMemo(
    () => pinned.filter(a => !removedFromLaunchpad.has(`artifact:pinned:${a.id}`)),
    [pinned, removedFromLaunchpad],
  );

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-[960px] mx-auto px-8 py-10 space-y-10">
        <header>
          <h1 className="text-xl text-foreground">启动页</h1>
          <p className="text-xs text-muted-foreground/55 mt-1">
            选择一个功能开始，或者从下方继续使用已添加的小程序与 Agent 产物。
          </p>
        </header>

        <Section title="功能">
          <Grid>
            {dialogAppIcons.map(item => {
              const Icon = item.icon;
              return (
                <PinnableTile
                  key={item.id}
                  label={item.label}
                  onOpen={() => launchpadOpen(item.id)}
                  onPin={() => pinToSidebar('function', item.id, item.label)}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg}`}>
                    <Icon size={20} strokeWidth={1.6} className={item.color} />
                  </div>
                </PinnableTile>
              );
            })}
          </Grid>
        </Section>

        <Section title="小程序">
          {userMiniApps.length === 0 ? (
            <EmptyHint text="还没有添加的小程序" />
          ) : (
            <Grid>
              {userMiniApps.map(app => (
                <PinnableTile
                  key={app.id}
                  label={app.name}
                  onOpen={() => openMiniApp(app)}
                  onPin={() => pinToSidebar('miniapp', app.id, app.name)}
                  onRemove={() => removeFromLaunchpad('miniapp', app.id)}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-base font-medium text-white ${app.color}`}>
                    {app.initial}
                  </div>
                </PinnableTile>
              ))}
              <AddTile label="添加小程序" onClick={() => launchpadOpen('miniapp')} />
            </Grid>
          )}
        </Section>

        <Section title="Agent 产物">
          <Grid>
            {visibleHtmlPreviews.map(([key, preview]) => (
              <PinnableTile
                key={`static-${key}`}
                label={preview.label}
                onOpen={() => launchpadOpen(`html:${key}`)}
                onPin={() => pinToSidebar('artifact', key, preview.label)}
                onRemove={() => removeFromLaunchpad('artifact', key)}
              >
                <ArtifactAvatar />
              </PinnableTile>
            ))}
            {visiblePinned.map(a => (
              <Popover
                key={a.id}
                open={editingPinnedId === a.id}
                onOpenChange={(v) => { if (!v) setEditingPinnedId(null); }}
              >
                <PopoverAnchor asChild>
                  <div>
                    <PinnableTile
                      label={a.label}
                      onOpen={() => launchpadOpen(`html:pinned:${a.id}`)}
                      onPin={() => pinToSidebar('artifact', `pinned:${a.id}`, a.label)}
                      onRemove={() => removeFromLaunchpad('artifact', `pinned:${a.id}`)}
                      onEdit={() => startEditPinned(a)}
                    >
                      <ArtifactAvatar iconName={a.iconName} />
                    </PinnableTile>
                  </div>
                </PopoverAnchor>
                <PopoverContent
                  side="bottom"
                  align="start"
                  sideOffset={8}
                  className="w-[300px] p-3"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <PinToWorkbenchForm
                    title="编辑名称与图标"
                    name={editDraftName}
                    iconName={editDraftIcon}
                    onNameChange={setEditDraftName}
                    onIconChange={setEditDraftIcon}
                    onConfirm={confirmEditPinned}
                    onCancel={() => setEditingPinnedId(null)}
                    confirmLabel="保存"
                  />
                </PopoverContent>
              </Popover>
            ))}
            {visiblePinned.length === 0 && visibleHtmlPreviews.length === 0 && (
              <EmptyHint
                text="在 Agent 运行结果里点 Pin，就会出现在这里"
                icon={<Sparkles size={14} strokeWidth={1.5} />}
              />
            )}
          </Grid>
        </Section>
      </div>
    </div>
  );
}

// Avatar for any Agent-produced artifact tile. Per-artifact emoji isn't
// surfaced here — the launchpad uses a single document-shaped icon
// (FileText by default) so the section reads as one bucket. When a
// pinned artifact carries a user-picked `iconName` via the
// "添加至工作台" dialog, that lucide icon takes over.
function ArtifactAvatar({ iconName }: { iconName?: string }) {
  const Icon = resolveArtifactIcon(iconName) ?? FileText;
  return (
    <div className="w-12 h-12 rounded-2xl bg-accent-violet/15 flex items-center justify-center text-accent-violet">
      <Icon size={20} strokeWidth={1.6} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-medium text-foreground mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-x-2 gap-y-5"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(86px, 1fr))' }}>
      {children}
    </div>
  );
}

// Tile with a right-click context menu — iPhone home-screen "Edit Home
// Screen" style. "添加至侧边栏" is universal; "编辑名称与图标" appears
// for pinned artifacts (provided by the launchpad); "从启动页移除" appears
// for user-supplied kinds (mini-apps / artifacts), not for built-in 功能.
function PinnableTile({ label, onOpen, onPin, onEdit, onRemove, children }: {
  label: string;
  onOpen: () => void;
  onPin: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
  children: React.ReactNode;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          type="button"
          onClick={onOpen}
          className="group flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-accent/30 active:scale-[0.96] transition-all"
        >
          {children}
          <span className="text-xs text-foreground/80 group-hover:text-foreground truncate max-w-full">
            {label}
          </span>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={onPin}>
          <Pin size={14} strokeWidth={1.6} />
          添加至侧边栏
        </ContextMenuItem>
        {onEdit && (
          <ContextMenuItem onSelect={onEdit}>
            <Pencil size={14} strokeWidth={1.6} />
            编辑名称与图标
          </ContextMenuItem>
        )}
        {onRemove && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive" onSelect={onRemove}>
              <Trash2 size={14} strokeWidth={1.6} />
              从启动页移除
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

function AddTile({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-accent/30 active:scale-[0.96] transition-all"
      title={label}
    >
      <div className="w-12 h-12 rounded-2xl border border-dashed border-border/40 text-muted-foreground/50 group-hover:text-foreground group-hover:border-border/70 flex items-center justify-center transition-colors">
        <Plus size={16} strokeWidth={1.6} />
      </div>
      <span className="text-xs text-muted-foreground/55">{label}</span>
    </button>
  );
}

function EmptyHint({ text, icon }: { text: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-3 py-4 rounded-xl border border-dashed border-border/30 text-xs text-muted-foreground/55">
      {icon}
      <span>{text}</span>
    </div>
  );
}
