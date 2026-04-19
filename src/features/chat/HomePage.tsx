import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Plus, X, ChevronRight, ChevronDown, ChevronUp,
  Paperclip, Sparkles, ArrowRight,
  AtSign, SlidersHorizontal, FlaskConical, Cat, Brush,
  Brain, Link, Zap, Maximize2, MoreHorizontal,
  Hammer, Share2, Globe, RotateCcw,
  Image as ImageIcon, Bot, BookOpen, LayoutGrid, Languages,
} from 'lucide-react';
import { Tooltip } from '@/app/components/Tooltip';
import { Button, Switch } from '@cherry-studio/ui';

export function HomePage() {
  const [inputText, setInputText] = useState('');
  const [activeMode, setActiveMode] = useState('fast');
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showStatsTooltip, setShowStatsTooltip] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAtMenu, setShowAtMenu] = useState(false);
  const [showPlusMore, setShowPlusMore] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>(['m1', 'm2', 'm3', 'm5']);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const plusBtnRef = useRef<HTMLButtonElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const atBtnRef = useRef<HTMLButtonElement>(null);
  const atMenuRef = useRef<HTMLDivElement>(null);

  const [atSearchText, setAtSearchText] = useState('');
  const [atMode, setAtMode] = useState('regular');
  const [atMultiSelect, setAtMultiSelect] = useState(false);

  const atModes = [
    { id: 'regular', label: '常规', icon: SlidersHorizontal },
    { id: 'webpage', label: '网页', icon: Globe },
    { id: 'image', label: '图片', icon: ImageIcon },
    { id: 'video', label: '视频', icon: Cat },
    { id: 'enhance', label: '提示词增强', icon: Zap },
    { id: 'agent', label: '智能体模式', icon: Bot },
  ];
  const allModels = [
    { id: 'm1', name: 'Gemini 3 Pro Preview', provider: 'Google' },
    { id: 'm2', name: 'Gemini 3.1 Pro Preview', provider: 'Google' },
    { id: 'm3', name: 'Gemini 3 Flash Preview', provider: 'Google' },
    { id: 'm4', name: 'Gemini 2.5 Pro', provider: 'Google' },
    { id: 'm5', name: 'Gemini 2.5 Flash', provider: 'Google' },
    { id: 'm6', name: 'GPT 5.2', provider: 'OpenAI' },
    { id: 'm7', name: 'GPT 5.2 Pro', provider: 'OpenAI' },
    { id: 'm8', name: 'Claude Opus 4.6', provider: 'Anthropic' },
    { id: 'm9', name: 'DeepSeek V3', provider: 'DeepSeek' },
  ];
  const filteredAtModels = allModels.filter(m =>
    !atSearchText || m.name.toLowerCase().includes(atSearchText.toLowerCase())
  );

  const modes = [
    { id: 'fast', label: '快速', icon: SlidersHorizontal },
    { id: 'pro', label: '专业', icon: FlaskConical },
    { id: 'agent', label: '智能体', icon: Cat },
    { id: 'draw', label: '绘图', icon: Brush },
  ];

  const plusMenuItems = [
    { id: 'attach', label: '添加图片或附件', icon: Paperclip, shortcut: null, separator: true },
    { id: 'genimg', label: '生成图片', icon: ImageIcon, shortcut: null },
    { id: 'reasoning', label: '推理', icon: Brain, shortcut: null },
    { id: 'websearch', label: '网络搜索', icon: Globe, shortcut: null },
    { id: 'knowledge', label: '知识库', icon: BookOpen, shortcut: null },
    { id: 'mcp', label: 'MCP', icon: Hammer, shortcut: null },
    { id: 'webcontext', label: '网页上下文', icon: Link, shortcut: null },
  ];

  const plusMenuSecondary = [
    { id: 'quickphrase', label: '快捷短语', icon: Zap, shortcut: null },
    { id: 'expand', label: '展开输入框', icon: Maximize2, shortcut: '\u2318\u21e7E' },
    { id: 'clearctx', label: '清除上下文', icon: RotateCcw, shortcut: '\u2318K' },
  ];

  useEffect(() => {
    if (!showPlusMenu) return;
    const handler = (e: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target as Node) &&
          plusBtnRef.current && !plusBtnRef.current.contains(e.target as Node)) {
        setShowPlusMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPlusMenu]);

  useEffect(() => {
    if (!showAtMenu) { setAtSearchText(''); setAtMode('regular'); setAtMultiSelect(false); return; }
    const handler = (e: MouseEvent) => {
      if (atMenuRef.current && !atMenuRef.current.contains(e.target as Node) &&
          atBtnRef.current && !atBtnRef.current.contains(e.target as Node)) {
        setShowAtMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showAtMenu]);

  const toggleModel = (id: string) => {
    if (atMultiSelect) {
      setSelectedModels(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    } else {
      setSelectedModels(prev => prev.includes(id) ? [] : [id]);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto">
        <div className="w-full max-w-[640px] flex flex-col items-center gap-4">
          {/* Input Card */}
          <div className="w-full rounded-2xl border border-border/60 bg-background shadow-sm relative">
            {/* Plus Menu Popover - positioned above card */}
            {showPlusMenu && (
              <div
                ref={plusMenuRef}
                className="absolute bottom-full left-0 mb-2 w-44 bg-popover border border-border rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150"
              >
                <div className="px-1 flex flex-col">
                  {plusMenuItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.id}>
                        <Button
                          variant="ghost"
                          onClick={() => setShowPlusMenu(false)}
                          className="w-full flex items-center gap-2 px-2 py-[5px] h-auto text-xs text-popover-foreground hover:bg-accent/50 rounded-lg justify-start"
                        >
                          <Icon size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.shortcut && (
                            <span className="text-[9px] text-muted-foreground/60 tracking-wider">{item.shortcut}</span>
                          )}
                        </Button>
                        {(item as { separator?: boolean }).separator && idx < plusMenuItems.length - 1 && (
                          <div className="my-0.5 mx-1.5 border-t border-border/60" />
                        )}
                      </div>
                    );
                  })}
                  {/* 更多 - 级联子菜单 */}
                  <div className="my-0.5 mx-1.5 border-t border-border/60" />
                  <div className="relative">
                    <Button
                      variant="ghost"
                      onMouseEnter={() => setShowPlusMore(true)}
                      onMouseLeave={() => setShowPlusMore(false)}
                      className="w-full flex items-center gap-2 px-2 py-[5px] h-auto text-xs text-muted-foreground hover:text-popover-foreground hover:bg-accent/50 rounded-lg justify-start"
                    >
                      <MoreHorizontal size={13} strokeWidth={1.5} className="flex-shrink-0" />
                      <span className="flex-1 text-left">更多</span>
                      <ChevronRight size={12} />
                    </Button>
                    {showPlusMore && (
                      <div
                        onMouseEnter={() => setShowPlusMore(true)}
                        onMouseLeave={() => setShowPlusMore(false)}
                        className="absolute left-full bottom-0 ml-1.5 w-40 bg-popover border border-border rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-left-1 duration-100"
                      >
                        <div className="px-1 flex flex-col">
                          {plusMenuSecondary.map(item => {
                            const Icon = item.icon;
                            return (
                              <Button
                                key={item.id}
                                variant="ghost"
                                onClick={() => {
                                  if (item.id === 'expand') { setIsExpanded(v => !v); }
                                  setShowPlusMenu(false);
                                  setShowPlusMore(false);
                                }}
                                className="w-full flex items-center gap-2 px-2 py-[5px] h-auto text-xs text-popover-foreground hover:bg-accent/50 rounded-lg justify-start"
                              >
                                <Icon size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
                                <span className="flex-1 text-left">{item.label}</span>
                                {item.shortcut && (
                                  <span className="text-[9px] text-muted-foreground/60 tracking-wider">{item.shortcut}</span>
                                )}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Textarea */}
            <div className="px-4 pt-3.5 pb-1">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={handleInput}
                placeholder="请输入你想要了解的问题"
                rows={2}
                className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none [&::-webkit-scrollbar]:hidden transition-[min-height] duration-200"
                style={{ minHeight: isExpanded ? '180px' : '52px' }}
              />
            </div>
            {/* Bottom toolbar */}
            <div className="flex items-center justify-between px-3 pb-2.5 pt-0.5">
              <div className="flex items-center gap-0.5">
                <Button
                  ref={plusBtnRef}
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => { setShowPlusMenu(v => !v); setShowAtMenu(false); }}
                  className={`w-7 h-7 rounded-md transition-colors ${
                    showPlusMenu
                      ? 'bg-accent text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Plus size={16} strokeWidth={1.6} />
                </Button>
                <div className="relative">
                  <Button
                    ref={atBtnRef}
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => { setShowAtMenu(v => !v); setShowPlusMenu(false); }}
                    className={`w-7 h-7 rounded-md transition-colors ${
                      showAtMenu ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <AtSign size={16} strokeWidth={1.6} />
                  </Button>
                  {showAtMenu && (
                    <div
                      ref={atMenuRef}
                      className="absolute bottom-full left-0 mb-2 w-[380px] bg-popover border border-border rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 overflow-hidden flex flex-col"
                    >
                      {/* Title bar */}
                      <div className="px-4 pt-3 pb-1.5">
                        <h3 className="text-sm text-foreground font-semibold">模式与模型</h3>
                      </div>
                      {/* Two-panel body */}
                      <div className="flex flex-1 min-h-0">
                        {/* Left: Mode navigation */}
                        <div className="w-[120px] flex flex-col pl-1.5 pr-1 pb-1.5">
                          {atModes.map(mode => {
                            const MIcon = mode.icon;
                            const isActive = atMode === mode.id;
                            return (
                              <Button key={mode.id} variant="ghost" onClick={() => setAtMode(mode.id)}
                                className={`flex items-center gap-2 px-2.5 py-[5px] h-auto text-left rounded-md text-xs justify-start ${
                                  isActive
                                    ? 'bg-accent text-foreground'
                                    : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                                }`}>
                                <MIcon size={13} strokeWidth={1.5} className="flex-shrink-0" />
                                <span className="truncate">{mode.label}</span>
                              </Button>
                            );
                          })}
                        </div>
                        {/* Right: Search + Model list */}
                        <div className="flex-1 flex flex-col min-w-0 pr-2.5 pb-1.5">
                          {/* Search */}
                          <div className="pb-1.5">
                            <div className="flex items-center gap-1.5 px-2.5 h-[28px] bg-muted/30 rounded-md border border-border/40">
                              <Search size={12} className="text-muted-foreground/40 flex-shrink-0" />
                              <Input type="text" value={atSearchText} onChange={e => setAtSearchText(e.target.value)}
                                placeholder="搜索" className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/40 border-0 h-auto p-0 focus-visible:ring-0" autoFocus />
                              {atSearchText && <Button variant="ghost" size="icon-xs" onClick={() => setAtSearchText('')} className="text-muted-foreground hover:text-foreground w-auto h-auto p-0"><X size={10} /></Button>}
                            </div>
                          </div>
                          {/* Multi-select toggle row */}
                          <div className="flex items-center justify-between px-0.5 pb-1">
                            <label className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                              <span>多选</span>
                              <Switch checked={atMultiSelect} onCheckedChange={v => setAtMultiSelect(v)} />
                            </label>
                            {selectedModels.length > 0 && (
                              <span className="text-xs text-muted-foreground">已选 {selectedModels.length} 个</span>
                            )}
                          </div>
                          {/* Model items */}
                          <div className="flex-1 max-h-[200px] overflow-y-auto space-y-[1px] px-0.5 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/20">
                            {filteredAtModels.length === 0 ? (
                              <div className="py-6 text-center text-xs text-muted-foreground/50">无结果</div>
                            ) : filteredAtModels.map(item => {
                              const sel = selectedModels.includes(item.id);
                              return (
                                <Button key={item.id} variant="ghost" onClick={() => toggleModel(item.id)}
                                  className={`w-full flex items-center gap-2 px-2.5 py-[5px] h-auto text-left rounded-md transition-all group justify-start ${
                                    sel ? 'bg-primary/10' : 'hover:bg-accent/40'
                                  }`}>
                                  <Sparkles size={12} strokeWidth={1.8} className={`flex-shrink-0 ${sel ? 'text-primary' : 'text-muted-foreground/30'}`} />
                                  <span className={`flex-1 text-xs truncate ${sel ? 'text-foreground' : 'text-muted-foreground'}`}>{item.name}</span>
                                  <Globe size={10} className="text-muted-foreground/25 flex-shrink-0" />
                                  <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all ${
                                    sel ? 'bg-primary text-white' : 'border border-border/50'
                                  }`}>
                                    {sel && <svg width="9" height="9" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                  </div>
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      {/* Bottom status bar */}
                      <div className="border-t border-border/40 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {/* Active mode pill */}
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-muted/50 rounded-md">
                            {(() => { const am = atModes.find(m => m.id === atMode); const Icon = am?.icon || SlidersHorizontal; return <Icon size={11} strokeWidth={1.5} className="text-muted-foreground" />; })()}
                            <span className="text-xs text-foreground">{atModes.find(m => m.id === atMode)?.label}</span>
                          </div>
                          {/* Selected model sparkles */}
                          {selectedModels.length > 0 && (
                            <div className="flex items-center gap-0.5">
                              {selectedModels.slice(0, 5).map(id => (
                                <Sparkles key={id} size={9} className="text-primary/70" />
                              ))}
                              {selectedModels.length > 5 && <span className="text-[9px] text-muted-foreground ml-0.5">+{selectedModels.length - 5}</span>}
                            </div>
                          )}
                          <ChevronUp size={11} className="text-muted-foreground/50" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            <span className="text-xs text-muted-foreground">x{Math.max(selectedModels.length, 1)}</span>
                            <ChevronDown size={10} className="text-muted-foreground/50" />
                          </div>
                          <Button variant="ghost" size="icon-xs" className="w-6 h-6 rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-accent/50 transition-colors">
                            <Share2 size={12} strokeWidth={1.5} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Stats with tooltip */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="xs"
                    className="flex items-center gap-1.5 px-1.5 h-7 rounded-md text-xs text-muted-foreground/70 hover:text-muted-foreground hover:bg-accent transition-colors select-none"
                    onMouseEnter={() => setShowStatsTooltip(true)}
                    onMouseLeave={() => setShowStatsTooltip(false)}
                  >
                    <span className="flex items-center gap-0.5">{'\u2261'} 2/5</span>
                    <span className="flex items-center gap-0.5">{'\u2191'} 78/78</span>
                  </Button>
                  {showStatsTooltip && (
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-popover border border-border rounded-lg shadow-lg py-2 px-3 z-50 text-xs">
                      <div className="flex items-center justify-between py-1">
                        <span className="text-popover-foreground">上下文 / 最大上下文数</span>
                        <span className="text-popover-foreground ml-3">2/5</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-popover-foreground">预估 Token 数</span>
                        <span className="text-popover-foreground ml-3">78</span>
                      </div>
                    </div>
                  )}
                </div>
                {/* Translate */}
                <Tooltip content="翻译" side="bottom"><Button variant="ghost" size="icon-sm" className="w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  <Languages size={14} strokeWidth={1.6} />
                </Button></Tooltip>
                {/* Layout grid */}
                <Tooltip content="布局" side="bottom"><Button variant="ghost" size="icon-sm" className="w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  <LayoutGrid size={14} strokeWidth={1.6} />
                </Button></Tooltip>
                {/* Send */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className={`w-7 h-7 rounded-full transition-colors ml-0.5 ${
                    inputText.trim()
                      ? 'bg-foreground text-background hover:opacity-80'
                      : 'bg-muted text-muted-foreground/50'
                  }`}
                >
                  <ArrowRight size={14} strokeWidth={2} />
                </Button>
              </div>
            </div>
          </div>

          {/* Mode pills */}
          <div className="flex items-center gap-2">
            {modes.map(mode => {
              const Icon = mode.icon;
              const isActive = activeMode === mode.id;
              return (
                <Button
                  key={mode.id}
                  variant="ghost"
                  size="xs"
                  onClick={() => setActiveMode(mode.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all border ${
                    isActive
                      ? 'border-border bg-background text-foreground shadow-sm'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <Icon size={11} strokeWidth={1.8} />
                  <span>{mode.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
