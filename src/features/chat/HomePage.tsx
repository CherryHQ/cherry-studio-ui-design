import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, ChevronRight, ChevronDown,
  Paperclip, Sparkles, ArrowRight,
  AtSign, SlidersHorizontal, FlaskConical, Cat, Brush,
  Brain, Link, Zap, Maximize2, MoreHorizontal,
  Hammer, Globe, RotateCcw,
  Image as ImageIcon, Bot, BookOpen, LayoutGrid, Languages,
} from 'lucide-react';
import { Tooltip } from '@/app/components/Tooltip';
import { Button, Textarea, Popover, PopoverTrigger, PopoverContent } from '@cherry-studio/ui';
import { ModelPickerPanel } from '@/app/components/shared/ModelPickerPanel';

export function HomePage() {
  const [inputText, setInputText] = useState('');
  const [activeMode, setActiveMode] = useState('fast');
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showStatsTooltip, setShowStatsTooltip] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAtMenu, setShowAtMenu] = useState(false);
  const [showPlusMore, setShowPlusMore] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>(['claude-4-opus', 'gemini-25-pro']);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [atMultiSelect, setAtMultiSelect] = useState(false);

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
    if (!showAtMenu) { setAtMultiSelect(false); }
  }, [showAtMenu]);

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
            {/* Textarea */}
            <div className="px-4 pt-3.5 pb-1">
              <Textarea
                ref={textareaRef}
                value={inputText}
                onChange={handleInput}
                placeholder="请输入你想要了解的问题"
                rows={2}
                className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none scrollbar-hide transition-[min-height] duration-200"
                style={{ minHeight: isExpanded ? '180px' : '52px' }}
              />
            </div>
            {/* Bottom toolbar */}
            <div className="flex items-center justify-between px-3 pb-2.5 pt-0.5">
              <div className="flex items-center gap-0.5">
                <Popover open={showPlusMenu} onOpenChange={(v) => { setShowPlusMenu(v); if (v) setShowAtMenu(false); }}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className={`rounded-md transition-colors ${
                        showPlusMenu
                          ? 'bg-accent text-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <Plus size={16} strokeWidth={1.6} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="top" align="start" className="w-44 p-0 py-1 rounded-xl">
                    <div className="px-1 flex flex-col">
                      {plusMenuItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.id}>
                            <Button size="inline"
                              variant="ghost"
                              onClick={() => setShowPlusMenu(false)}
                              className="w-full flex items-center gap-2 px-2 py-[5px] text-xs text-popover-foreground hover:bg-accent/50 rounded-lg justify-start"
                            >
                              <Icon size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
                              <span className="flex-1 text-left">{item.label}</span>
                              {item.shortcut && (
                                <span className="text-xs text-muted-foreground/60 tracking-wider">{item.shortcut}</span>
                              )}
                            </Button>
                            {(item as { separator?: boolean }).separator && idx < plusMenuItems.length - 1 && (
                              <div className="my-0.5 mx-1.5 border-t border-border/30" />
                            )}
                          </div>
                        );
                      })}
                      {/* 更多 - 级联子菜单 */}
                      <div className="my-0.5 mx-1.5 border-t border-border/30" />
                      <Popover open={showPlusMore} onOpenChange={setShowPlusMore}>
                        <PopoverTrigger asChild>
                          <Button size="inline"
                            variant="ghost"
                            className="w-full flex items-center gap-2 px-2 py-[5px] text-xs text-muted-foreground hover:text-popover-foreground hover:bg-accent/50 rounded-lg justify-start"
                          >
                            <MoreHorizontal size={13} strokeWidth={1.5} className="flex-shrink-0" />
                            <span className="flex-1 text-left">更多</span>
                            <ChevronRight size={12} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent side="right" align="end" className="w-40 p-0 py-1 rounded-xl">
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
                                    <span className="text-xs text-muted-foreground/60 tracking-wider">{item.shortcut}</span>
                                  )}
                                </Button>
                              );
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </PopoverContent>
                </Popover>
                <Popover open={showAtMenu} onOpenChange={(v) => { setShowAtMenu(v); if (v) setShowPlusMenu(false); }}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className={`rounded-md transition-colors ${
                        showAtMenu ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <AtSign size={16} strokeWidth={1.6} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="top" align="start" className="w-[480px] p-0 rounded-xl overflow-hidden">
                    <ModelPickerPanel
                      selectedModels={selectedModels}
                      onSelectModel={(id) => {
                        if (atMultiSelect) {
                          setSelectedModels(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
                        } else {
                          setSelectedModels(prev => prev.includes(id) ? [] : [id]);
                          setShowAtMenu(false);
                        }
                      }}
                      multiModel={atMultiSelect}
                      onToggleMultiModel={() => setAtMultiSelect(v => !v)}
                      onClose={() => setShowAtMenu(false)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-center gap-1">
                {/* Stats with tooltip */}
                <Popover open={showStatsTooltip} onOpenChange={setShowStatsTooltip}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="xs"
                      className="flex items-center gap-1.5 px-1.5 h-7 rounded-md text-xs text-muted-foreground/60 hover:text-muted-foreground hover:bg-accent transition-colors select-none"
                      onMouseEnter={() => setShowStatsTooltip(true)}
                      onMouseLeave={() => setShowStatsTooltip(false)}
                    >
                      <span className="flex items-center gap-0.5">{'\u2261'} 2/5</span>
                      <span className="flex items-center gap-0.5">{'\u2191'} 78/78</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="top" align="end" className="w-48 py-2 px-3 text-xs">
                    <div className="flex items-center justify-between py-1">
                      <span className="text-popover-foreground">上下文 / 最大上下文数</span>
                      <span className="text-popover-foreground ml-3">2/5</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-popover-foreground">预估 Token 数</span>
                      <span className="text-popover-foreground ml-3">78</span>
                    </div>
                  </PopoverContent>
                </Popover>
                {/* Translate */}
                <Tooltip content="翻译" side="bottom"><Button variant="ghost" size="icon-sm" className="rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  <Languages size={14} strokeWidth={1.6} />
                </Button></Tooltip>
                {/* Layout grid */}
                <Tooltip content="布局" side="bottom"><Button variant="ghost" size="icon-sm" className="rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  <LayoutGrid size={14} strokeWidth={1.6} />
                </Button></Tooltip>
                {/* Send */}
                <Button
                  variant="default"
                  size="icon-sm"
                  disabled={!inputText.trim()}
                  className="rounded-full transition-colors ml-0.5"
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
