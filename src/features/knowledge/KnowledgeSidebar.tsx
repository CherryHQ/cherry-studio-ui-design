import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Plus, BookOpen, ChevronRight, Database,
  Briefcase, User, FolderKanban, MoreHorizontal,
  Pencil, Trash2, FolderPlus, ArrowRightLeft, X, Check,
} from 'lucide-react';
import { Tooltip } from '@/app/components/Tooltip';
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@cherry-studio/ui';

export interface KnowledgeBase {
  id: string;
  name: string;
  icon: string;
  color: string;
  docCount: number;
  status: 'ready' | 'indexing' | 'error';
  group: string;
  updatedAt: string;
}

const defaultGroupIcons: Record<string, React.ElementType> = {
  '工作': Briefcase,
  '个人': User,
  '项目': FolderKanban,
};

const kbIcons = ['📁', '📚', '🤖', '🎨', '📡', '📊', '🧠', '🍒', '✈️', '🍳', '🔬', '💼', '🎯', '📝', '🌐', '⚡', '🛠️', '🎵'];
const kbColors = ['#8b5cf6', '#ec4899', '#3b82f6', '#f59e0b', '#10b981', '#06b6d4', '#f97316', '#ef4444', '#a855f7', '#14b8a6'];

function InlineEditor({ value, onConfirm, onCancel, fontSize = 'text-xs' }: {
  value: string;
  onConfirm: (v: string) => void;
  onCancel: () => void;
  fontSize?: string;
}) {
  const [text, setText] = useState(value);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.select(); }, []);
  return (
    <input
      ref={ref}
      autoFocus
      value={text}
      onChange={e => setText(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter' && text.trim()) onConfirm(text.trim());
        if (e.key === 'Escape') onCancel();
      }}
      onBlur={() => { if (text.trim()) onConfirm(text.trim()); else onCancel(); }}
      className={`flex-1 bg-transparent outline-none ${fontSize} text-foreground border-b border-primary/50 py-0.5 min-w-0`}
    />
  );
}

function ContextMenu({ x, y, children, onDismiss }: { x: number; y: number; children: React.ReactNode; onDismiss: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onDismiss(); };
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss(); };
    document.addEventListener('mousedown', h);
    document.addEventListener('keydown', k);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k); };
  }, [onDismiss]);

  const [pos, setPos] = useState({ left: x, top: y });
  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const nl = rect.right > window.innerWidth ? x - rect.width : x;
    const nt = rect.bottom > window.innerHeight ? y - rect.height : y;
    setPos({ left: Math.max(4, nl), top: Math.max(4, nt) });
  }, [x, y]);

  return (
    <div ref={ref} className="fixed z-[300] bg-popover border border-border rounded-lg shadow-xl p-1 min-w-[130px] animate-in fade-in zoom-in-95 duration-100" style={pos}>
      {children}
    </div>
  );
}

function MenuItem({ icon: Icon, label, danger, onClick }: { icon: React.ElementType; label: string; danger?: boolean; onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-1 rounded-md transition-colors text-left text-xs h-auto justify-start ${danger ? 'text-destructive hover:bg-destructive/10' : 'text-popover-foreground hover:bg-accent'}`}
    >
      <Icon size={11} />
      <span>{label}</span>
    </Button>
  );
}

function CreateKBDialog({ groups, onConfirm, onCancel }: {
  groups: string[];
  onConfirm: (name: string, group: string, icon: string, color: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [group, setGroup] = useState(groups[0] || '工作');
  const [icon, setIcon] = useState('📁');
  const [color, setColor] = useState('#8b5cf6');

  return (
    <Dialog open onOpenChange={open => { if (!open) onCancel(); }}>
      <DialogContent className="w-[340px] p-4">
        <DialogHeader>
          <DialogTitle className="text-xs text-foreground">新建知识库</DialogTitle>
        </DialogHeader>

        <label className="block text-xs text-muted-foreground/60 mb-1">名称</label>
        <Input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="输入知识库名称..."
          className="w-full px-2 py-1.5 rounded-md text-xs mb-2.5"
          onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onConfirm(name.trim(), group, icon, color); }}
        />

        <label className="block text-xs text-muted-foreground/60 mb-1">分组</label>
        <select
          value={group}
          onChange={e => setGroup(e.target.value)}
          className="w-full px-2 py-1.5 rounded-md border border-border/40 bg-transparent text-xs text-foreground outline-none focus:border-primary/40 mb-2.5 cursor-pointer"
        >
          {groups.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        <label className="block text-xs text-muted-foreground/60 mb-1">图标</label>
        <div className="flex flex-wrap gap-0.5 mb-2.5">
          {kbIcons.map(ic => (
            <Button
              key={ic}
              variant="ghost"
              size="icon-xs"
              onClick={() => setIcon(ic)}
              className={`w-6 h-6 rounded text-xs flex items-center justify-center transition-all ${icon === ic ? 'bg-primary/15 ring-1 ring-primary/40' : 'hover:bg-accent'}`}
            >{ic}</Button>
          ))}
        </div>

        <label className="block text-xs text-muted-foreground/60 mb-1">颜色</label>
        <div className="flex flex-wrap gap-1 mb-3">
          {kbColors.map(c => (
            <Button
              key={c}
              variant="ghost"
              size="icon-xs"
              onClick={() => setColor(c)}
              className={`w-5 h-5 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-1 ring-offset-popover ring-primary' : 'hover:scale-110'}`}
              style={{ background: c }}
            />
          ))}
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="ghost" size="xs" onClick={onCancel} className="h-6 px-2.5 text-xs text-muted-foreground hover:text-foreground">取消</Button>
          <Button
            variant="default"
            size="xs"
            onClick={() => { if (name.trim()) onConfirm(name.trim(), group, icon, color); }}
            disabled={!name.trim()}
            className="h-6 px-2.5 text-xs"
          >创建</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface KnowledgeSidebarProps {
  items: KnowledgeBase[];
  selectedId: string;
  onSelect: (id: string) => void;
  onCreateKb: (name: string, group: string, icon: string, color: string) => void;
  onRenameKb: (id: string, name: string) => void;
  onDeleteKb: (id: string) => void;
  onMoveKb: (id: string, toGroup: string) => void;
  onCreateGroup: (name: string) => void;
  onRenameGroup: (oldName: string, newName: string) => void;
  onDeleteGroup: (name: string) => void;
}

export function KnowledgeSidebar({
  items, selectedId, onSelect,
  onCreateKb, onRenameKb, onDeleteKb, onMoveKb,
  onCreateGroup, onRenameGroup, onDeleteGroup,
}: KnowledgeSidebarProps) {
  const [search, setSearch] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingKbId, setEditingKbId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState<string | null>(null);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ type: 'kb' | 'group'; id: string; x: number; y: number } | null>(null);

  const filtered = items.filter(kb =>
    kb.name.toLowerCase().includes(search.toLowerCase())
  );

  const groups = Array.from(new Set(items.map(kb => kb.group)));
  const groupedItems = groups.map(g => ({
    group: g,
    items: filtered.filter(kb => kb.group === g),
  }));

  const toggleGroup = (g: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g); else next.add(g);
      return next;
    });
  };

  const handleGroupContext = (e: React.MouseEvent, group: string) => {
    e.preventDefault();
    setContextMenu({ type: 'group', id: group, x: e.clientX, y: e.clientY });
  };

  const handleKbContext = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ type: 'kb', id, x: e.clientX, y: e.clientY });
  };

  const handleKbDots = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setContextMenu({ type: 'kb', id, x: rect.left, y: rect.bottom + 4 });
  };

  return (
    <div className="flex flex-col h-full select-none">
      {/* Header */}
      <div className="h-11 flex items-center justify-between px-3.5 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs">
          <BookOpen size={12} className="text-muted-foreground" strokeWidth={1.6} />
          <span className="text-foreground">知识库</span>
          <span className="text-muted-foreground/50 ml-0.5">{items.length}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Tooltip content="新建分组" side="bottom">
            <Button variant="ghost" size="icon-xs" onClick={() => setCreatingGroup(true)} className="w-5 h-5 rounded text-muted-foreground hover:text-foreground">
              <FolderPlus size={11} strokeWidth={1.8} />
            </Button>
          </Tooltip>
          <Tooltip content="新建知识库" side="bottom">
            <Button variant="ghost" size="icon-xs" onClick={() => setShowCreateDialog(true)} className="w-5 h-5 rounded text-muted-foreground hover:text-foreground">
              <Plus size={12} strokeWidth={1.8} />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Search */}
      <div className="px-2 pb-1.5 flex-shrink-0">
        <div className="flex items-center gap-1.5 px-2 py-[4px] rounded-md bg-muted/50 border border-transparent focus-within:border-border/50 transition-colors">
          <Search size={10} className="text-muted-foreground/50 flex-shrink-0" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索知识库..."
            className="flex-1 bg-transparent outline-none text-xs text-foreground placeholder:text-muted-foreground/40 border-none shadow-none focus-visible:ring-0 h-auto p-0"
          />
          {search && (
            <Button variant="ghost" size="icon-xs" onClick={() => setSearch('')} className="text-muted-foreground/30 hover:text-foreground w-4 h-4">
              <X size={9} />
            </Button>
          )}
        </div>
      </div>

      {/* Grouped list */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full px-1.5 space-y-px">
        {groupedItems.map(({ group, items: gItems }) => {
          const isCollapsed = collapsedGroups.has(group);
          const GroupIcon = defaultGroupIcons[group] || Database;
          const isEditingGroup = editingGroupName === group;

          return (
            <div key={group}>
              <div
                onContextMenu={e => handleGroupContext(e, group)}
                className="w-full flex items-center gap-1.5 px-1.5 py-[4px] text-xs text-foreground/45 hover:text-foreground/60 transition-colors group/grp"
              >
                <Button variant="ghost" onClick={() => toggleGroup(group)} className="flex items-center gap-1.5 min-w-0 flex-1 text-xs h-auto p-0 justify-start">
                  <ChevronRight size={10} className={`transition-transform duration-150 flex-shrink-0 ${isCollapsed ? '' : 'rotate-90'}`} />
                  <GroupIcon size={11} strokeWidth={1.5} className="flex-shrink-0" />
                  {isEditingGroup ? (
                    <InlineEditor
                      value={group}
                      onConfirm={v => { onRenameGroup(group, v); setEditingGroupName(null); }}
                      onCancel={() => setEditingGroupName(null)}
                      fontSize="text-xs"
                    />
                  ) : (
                    <span className="uppercase tracking-widest truncate text-xs">{group}</span>
                  )}
                </Button>
                <span className="text-xs text-muted-foreground/40 flex-shrink-0">{gItems.length}</span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={e => handleGroupContext(e, group)}
                  className="w-4 h-4 rounded text-muted-foreground/35 hover:text-foreground opacity-0 group-hover/grp:opacity-100 transition-all flex-shrink-0"
                >
                  <MoreHorizontal size={10} />
                </Button>
              </div>

              {!isCollapsed && (
                <div className="space-y-px ml-0.5">
                  {gItems.map(kb => {
                    const isSelected = kb.id === selectedId;
                    const isEditing = editingKbId === kb.id;
                    return (
                      <div
                        key={kb.id}
                        onClick={() => { if (!isEditing) onSelect(kb.id); }}
                        onContextMenu={e => handleKbContext(e, kb.id)}
                        className={`w-full flex items-center gap-2 px-1.5 py-[5px] rounded-lg text-left transition-all duration-150 group/kb cursor-pointer
                          ${isSelected
                            ? 'bg-accent text-foreground'
                            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                          }`}
                      >
                        <div
                          className="w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0"
                          style={{ background: `${kb.color}20` }}
                        >
                          <span>{kb.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <InlineEditor
                              value={kb.name}
                              onConfirm={v => { onRenameKb(kb.id, v); setEditingKbId(null); }}
                              onCancel={() => setEditingKbId(null)}
                            />
                          ) : (
                            <div className="contents">
                              <div className="text-xs truncate">{kb.name}</div>
                              <div className="flex items-center gap-1 mt-px">
                                <span className="text-[9px] text-muted-foreground/45">{kb.docCount} 文档</span>
                                <span className={`w-1 h-1 rounded-full flex-shrink-0 ${
                                  kb.status === 'ready' ? 'bg-primary' :
                                  kb.status === 'indexing' ? 'bg-amber-500 animate-pulse' :
                                  'bg-red-500'
                                }`} />
                              </div>
                            </div>
                          )}
                        </div>
                        {!isEditing && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={e => handleKbDots(e, kb.id)}
                            className="w-4 h-4 rounded text-muted-foreground/25 hover:text-foreground hover:bg-foreground/5 opacity-0 group-hover/kb:opacity-100 transition-all flex-shrink-0"
                          >
                            <MoreHorizontal size={9} />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {creatingGroup && (
          <div className="flex items-center gap-1 px-1.5 py-[3px]">
            <FolderPlus size={9} className="text-muted-foreground/40 flex-shrink-0" />
            <Input
              autoFocus
              placeholder="输入分组名称..."
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                  onCreateGroup((e.target as HTMLInputElement).value.trim());
                  setCreatingGroup(false);
                }
                if (e.key === 'Escape') setCreatingGroup(false);
              }}
              onBlur={e => {
                if (e.target.value.trim()) {
                  onCreateGroup(e.target.value.trim());
                }
                setCreatingGroup(false);
              }}
              className="flex-1 text-xs text-foreground px-1.5 py-0.5 min-w-0"
            />
          </div>
        )}
      </div>

      {/* Bottom new button */}
      <div className="px-2 py-1.5 flex-shrink-0 border-t border-border/30">
        <Button
          variant="outline"
          size="xs"
          onClick={() => setShowCreateDialog(true)}
          className="w-full flex items-center justify-center gap-1 py-[5px] text-xs text-muted-foreground hover:text-foreground border-dashed border-border/40 hover:border-border/70 h-auto"
        >
          <Plus size={11} strokeWidth={1.8} />
          <span>新建知识库</span>
        </Button>
      </div>

      {/* Context menus */}
      {contextMenu && contextMenu.type === 'group' && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} onDismiss={() => setContextMenu(null)}>
          <MenuItem icon={Pencil} label="重命名分组" onClick={() => { setEditingGroupName(contextMenu.id); setContextMenu(null); }} />
          <MenuItem icon={Plus} label="在此分组新建" onClick={() => { setShowCreateDialog(true); setContextMenu(null); }} />
          {groups.length > 1 && (
            <MenuItem icon={Trash2} label="删除分组" danger onClick={() => { onDeleteGroup(contextMenu.id); setContextMenu(null); }} />
          )}
        </ContextMenu>
      )}

      {contextMenu && contextMenu.type === 'kb' && (() => {
        const kb = items.find(i => i.id === contextMenu.id);
        if (!kb) return null;
        const otherGroups = groups.filter(g => g !== kb.group);
        return (
          <ContextMenu x={contextMenu.x} y={contextMenu.y} onDismiss={() => setContextMenu(null)}>
            <MenuItem icon={Pencil} label="重命名" onClick={() => { setEditingKbId(contextMenu.id); setContextMenu(null); }} />
            {otherGroups.length > 0 && (
              <div className="contents">
                <div className="px-2 py-0.5 text-[9px] text-muted-foreground/30">移动到</div>
                {otherGroups.map(g => (
                  <MenuItem key={g} icon={ArrowRightLeft} label={g} onClick={() => { onMoveKb(contextMenu.id, g); setContextMenu(null); }} />
                ))}
              </div>
            )}
            <div className="border-t border-border/20 my-0.5" />
            <MenuItem icon={Trash2} label="删除知识库" danger onClick={() => { onDeleteKb(contextMenu.id); setContextMenu(null); }} />
          </ContextMenu>
        );
      })()}

      {showCreateDialog && (
        <CreateKBDialog
          groups={groups}
          onConfirm={(name, group, icon, color) => { onCreateKb(name, group, icon, color); setShowCreateDialog(false); }}
          onCancel={() => setShowCreateDialog(false)}
        />
      )}
    </div>
  );
}
