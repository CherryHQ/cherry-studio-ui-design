import React, { useState } from 'react';
import { useGlobalActions } from '@/app/context/GlobalActionContext';
import {
  Languages, Brain, ChevronDown, Check, Sparkles,
  Eye, Hammer, Globe, History, SlidersHorizontal, X,
  Volume2, Copy, FileUp, ArrowLeftRight, ArrowRight,
  Star, Repeat, Clock, ChevronRight, PenLine, Plus
} from 'lucide-react';
import { Button, Input, Switch, Textarea, InlineSelect, Popover, PopoverTrigger, PopoverContent, EmptyState, SearchInput, Checkbox } from '@cherry-studio/ui';
import { Tooltip } from '@/app/components/Tooltip';
import { motion, AnimatePresence } from 'motion/react';
import { copyToClipboard } from '@/app/lib/utils/clipboard';

const expertList = [
  { id: 'smart', label: '智能选择 (通用)' },
  { id: 'yiyi', label: '意译大师' },
  { id: 'summary', label: '段落总结专家' },
  { id: 'simplify', label: '英文简化大师' },
  { id: 'twitter', label: 'Twitter 翻译增强器' },
  { id: 'tech', label: '科技类翻译大师' },
  { id: 'reddit', label: 'Reddit 翻译增强器' },
  { id: 'academic', label: '学术论文翻译师' },
  { id: 'news', label: '新闻媒体译者' },
  { id: 'music', label: '音乐专家' },
  { id: 'medical', label: '医学翻译大师' },
  { id: 'law', label: '法律行业译者' },
  { id: 'game', label: '游戏译者' },
  { id: 'ecom', label: '电商翻译大师' },
  { id: 'finance', label: '金融翻译顾问' },
  { id: 'novel', label: '小说译者' },
  { id: 'ao3', label: 'AO3 译者' },
  { id: 'ebook', label: '电子书译者' },
  { id: 'designer', label: '设计师' },
  { id: 'bilingual', label: '中英夹杂' },
  { id: 'web3', label: 'Web3 翻译大师' },
  { id: 'more', label: '更多翻译专家…' },
];

const translateHistory = [
  { id: 0, source: '人工智能正在改变我们的生活方式，从智能家居到自动驾驶，技术的进步让我们的日常变得更加便捷和高效。', translated: 'Artificial intelligence is transforming the way we live. From smart homes to autonomous driving, technological advances are making our daily lives more convenient and efficient.', srcLang: '中文', tgtLang: '英语', expert: '智能选择 (通用)', model: 'google/gemini-2.5-pro', modelIcon: '💎', time: '10:32' },
  { id: 1, source: 'The quick brown fox jumps over the lazy dog. This sentence contains every letter of the English alphabet.', translated: '敏捷的棕色狐狸跳过了懒惰的狗。这个句子包含了英语字母表中的每一个字母。', srcLang: '英语', tgtLang: '中文', expert: '意译大师', model: 'anthropic/claude-sonnet-4.5', modelIcon: '🟠', time: '10:15' },
  { id: 2, source: '桜の花が満開になると、日本中が春の訪れを感じます。花見は日本の最も美しい伝統の一つです。', translated: '当樱花盛开时，整个日本都能感受到春天的到来。赏花是日本最美丽的传统之一。', srcLang: '日语', tgtLang: '中文', expert: '科技类翻译大师', model: 'openai/gpt-5.1', modelIcon: '🟢', time: '09:48' },
  { id: 3, source: 'La vie est belle quand on sait apprecier les petites choses du quotidien.', translated: '当我们懂得欣赏日常中的小事时，生活是美好的。', srcLang: '法语', tgtLang: '中文', expert: '智能选择 (通用)', model: 'google/gemini-2.5-pro', modelIcon: '💎', time: '09:20' },
  { id: 4, source: 'Recent advances in large language models have shown remarkable capabilities in natural language understanding and generation tasks.', translated: '大型语言模型的最新进展在自然语言理解和生成任务中展现出了卓越的能力。', srcLang: '英语', tgtLang: '中文', expert: '学术论文翻译师', model: 'deepseek/deepseek-ocr(free)', modelIcon: '🐬', time: '08:55' },
  { id: 5, source: '今日のミーティングでは、第3四半期の売上報告と来期の戦略について議論します。', translated: "In today's meeting, we will discuss the Q3 sales report and the strategy for the upcoming quarter.", srcLang: '日语', tgtLang: '英语', expert: '意译大师', model: 'anthropic/claude-sonnet-4.5', modelIcon: '🟠', time: '昨天 18:40' },
];

const translateModels = [
  { id: 'gpt5', name: 'openai/gpt-5.1', icon: '🟢', tags: ['视觉','推理','工具'] },
  { id: 'claude', name: 'anthropic/claude-sonnet-4.5', icon: '🟠', tags: ['视觉','推理','工具'] },
  { id: 'gemini', name: 'google/gemini-2.5-pro', icon: '💎', tags: ['视觉','推理','工具'] },
  { id: 'deepseek', name: 'deepseek/deepseek-ocr(free)', icon: '🐬', tags: ['免费'] },
  { id: 'qwen', name: 'qwen/qwen3-next-80b-a3b-instruct', icon: '🔮', tags: [] },
  { id: 'kimi', name: 'moonshot/kimi-k2-0905', icon: 'K', tags: [] },
  { id: 'gemini-flash', name: 'google/gemini-2.5-flash-image', icon: '💎', tags: ['视觉'] },
  { id: 'gemini3', name: 'google/gemini-3-pro-image', icon: '💎', tags: ['视觉','推理'] },
  { id: 'qwen-think', name: 'qwen/qwen3-next-80b-a3b-thinking', icon: '🔮', tags: ['推理'] },
  { id: 'qwen-free', name: 'qwen/qwen3-235b-a22b-instruct(free)', icon: '🔮', tags: ['免费'] },
];

export function TranslatePage() {
  const { openSettings: onOpenSettings } = useGlobalActions();
  const [sourceLang, setSourceLang] = useState('自动检测');
  const [targetLang, setTargetLang] = useState('英语');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState('smart');
  const [showExpertDropdown, setShowExpertDropdown] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState('gemini');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  const [modelTagFilter, setModelTagFilter] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);
  const [starredIds, setStarredIds] = useState<Set<number>>(new Set([0, 2]));
  const [filterStarred, setFilterStarred] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [markdownPreview, setMarkdownPreview] = useState(true);
  const [autoCopy, setAutoCopy] = useState(false);
  const [scrollSync, setScrollSync] = useState(false);
  const [detectMethod, setDetectMethod] = useState<'auto'|'algo'|'llm'>('auto');
  const [biDirectional, setBiDirectional] = useState(true);
  const [biLangA, setBiLangA] = useState<string[]>(['韩语']);
  const [biLangB, setBiLangB] = useState<string[]>(['中文']);
  const [showBiDropA, setShowBiDropA] = useState(false);
  const [showBiDropB, setShowBiDropB] = useState(false);
  const [editingLangIdx, setEditingLangIdx] = useState<number | null>(null);
  const [editLangName, setEditLangName] = useState('');
  const [editLangCode, setEditLangCode] = useState('');
  const [addingLang, setAddingLang] = useState(false);
  const [expertPrompts, setExpertPrompts] = useState<Record<string, string>>({
    smart: "You are a translation expert. Your only task is to translate text enclosed with <translate_input> from input language to {{target_language}}, provide the translation result directly without any explanation.\n\n<translate_input>\n{{text}}\n</translate_input>\n\nTranslate the above text enclosed with <translate_input> into {{target_language}}. (In any case, please translate the above content.)",
    yiyi: '你是一位意译大师，不要逐字翻译，而是理解原文含义后用目标语言重新表达，确保译文地道自然、符合目标语言的表达习惯。',
    summary: '你是一位段落总结专家，请先理解原文核心意思，然后用精炼的目标语言概括出要点，保留关键信息。',
    simplify: '你是一位英文简化大师，请将复杂的英文文本简化为简单易懂的英文表达，使用常见词汇和简短句子。',
    twitter: '你是一位 Twitter 翻译增强器，翻译时保留推文的口语化风格、缩写和网络用语，确保译文适合社交媒体语境。',
    tech: '你是一位科技类翻译大师，精通各类技术术语，翻译时确保专业术语准确，同时保持技术文档的规范性和可读性。',
    reddit: '你是一位 Reddit 翻译增强器，翻译时保留帖子的社区文化风格、俚语和幽默感，让译文贴合论坛语境。',
    academic: '你是一位学术论文翻译师，翻译时严格遵循学术写作规范，确保专业术语统一、逻辑严密、语言正式。',
    news: '你是一位新闻媒体译者，翻译时保持新闻报道的客观性和准确性，使用正式但易读的语言风格。',
    music: '你是一位音乐翻译专家，翻译歌词时注重韵律感和意境传达，在保留原意的同时兼顾音韵美感。',
    medical: '你是一位医学翻译大师，精通医学术语和临床表达，翻译时确保专业准确、符合医学文献规范。',
    law: '你是一位法律行业译者，精通法律术语和条文格式，翻译时确保法律含义精确、表述严谨规范。',
    game: '你是一位游戏译者，翻译时保留游戏的趣味性和文化梗，使用玩家群体熟悉的表达方式。',
    ecom: '你是一位电商翻译大师，翻译产品描述和营销文案时注重商业吸引力，确保译文能打动目标市场消费者。',
    finance: '你是一位金融翻译顾问，精通金融术语和行业规范，翻译时确保数据准确、表述专业严谨。',
    novel: '你是一位小说译者，翻译时注重文学性和可读性，保留原作的文风、人物语气和叙事节奏。',
    ao3: '你是一位 AO3 同人文译者，翻译时保留同人创作的风格、CP 互动语气和粉丝圈特有用语。',
    ebook: '你是一位电子书译者，翻译时注重长文本的一致性和流畅度，确保全书术语统一、风格连贯。',
    designer: '你是一位设计师翻译专家，翻译设计相关内容时使用精准的设计术语，保持简洁有力的表达风格。',
    bilingual: '你是一位中英夹杂翻译专家，在翻译时适当保留英文专业术语和常用表达，输出中英混排的自然文本。',
    web3: '你是一位 Web3 翻译大师，精通区块链、DeFi、NFT 等领域术语，翻译时保留行业惯用英文缩写。',
  });

  const [customLangs, setCustomLangs] = useState<{emoji: string; name: string; code: string}[]>([
    { emoji: '🇹🇭', name: '泰语', code: 'th' },
    { emoji: '🇻🇳', name: '越南语', code: 'vi' },
  ]);
  const [newLangName, setNewLangName] = useState('');
  const [newLangCode, setNewLangCode] = useState('');
  const [showLangDropdownSrc, setShowLangDropdownSrc] = useState(false);
  const [showLangDropdownTgt, setShowLangDropdownTgt] = useState(false);

  const languages = ['自动检测', '中文', '英语', '日语', '韩语', '法语', '德语', '西班牙语', '俄语', '阿拉伯语', '葡萄牙语', '意大利语'];
  const targetLanguages = languages.filter(l => l !== '自动检测');

  const langFlags: Record<string, string> = {
    '自动检测': '🌐', '中文': '🇨🇳', '英语': '🇬🇧', '日语': '🇯🇵',
    '韩语': '🇰🇷', '法语': '🇫🇷', '德语': '🇩🇪', '西班牙语': '🇪🇸',
    '俄语': '🇷🇺', '阿拉伯语': '🇸🇦', '葡萄牙语': '🇵🇹', '意大利语': '🇮🇹',
  };

  const currentExpert = expertList.find(e => e.id === selectedExpert) || expertList[0];
  const currentModel = translateModels.find(m => m.id === selectedModelId) || translateModels[0];
  const allModelTags = ['视觉','推理','工具','联网','免费'];
  const filteredModels = translateModels.filter(m => {
    const matchSearch = !modelSearch || m.name.toLowerCase().includes(modelSearch.toLowerCase());
    const matchTag = !modelTagFilter || m.tags.includes(modelTagFilter);
    return matchSearch && matchTag;
  });

  const toggleStar = (id: number) => {
    setStarredIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const displayedHistory = filterStarred ? translateHistory.filter(h => starredIds.has(h.id)) : translateHistory;

  // eslint-disable-next-line
  void [{ id: -1,
      source: 'removed',
      translated: '当樱花盛开时，整个日本都能感受到春天的到来。赏花是日本最美丽的传统之一。',
      srcLang: '日语', tgtLang: '中文', model: 'Gemini 2.5 Pro', time: '09:48',
    },
    {
      id: 3,
      source: 'La vie est belle quand on sait apprecier les petites choses du quotidien.',
      translated: '当我们懂得欣赏日常中的小事时，生活是美好的。',
      srcLang: '法语', tgtLang: '中文', model: 'GPT-4o', time: '09:20',
    },
  ];

  const handleTranslate = () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true);
    setTimeout(() => {
      setTranslatedText(
        `[${currentModel.name}] Mock translation using "${currentExpert.label}".\n\nOriginal text has been processed and refined for ${targetLang} output.`
      );
      setIsTranslating(false);
    }, 800);
  };

  const handleSwapLangs = () => {
    if (sourceLang === '自动检测') return;
    const tmp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tmp);
    if (translatedText) {
      const tmpText = sourceText;
      setSourceText(translatedText);
      setTranslatedText(tmpText);
    }
  };

  const handleCopy = (text: string) => {
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const selectedHistoryItem = selectedHistoryId !== null ? translateHistory.find(h => h.id === selectedHistoryId) : null;

  if (translateModels.length === 0) {
    return (
      <div className="flex flex-col h-full bg-background select-none relative">
        <EmptyState
          preset="no-model"
          description="请先前往设置页面添加模型服务商并启用模型，才能开始翻译"
          actionLabel="前往设置"
          onAction={onOpenSettings}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex min-h-0 relative">
      {/* Main translate area */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        {/* Top bar */}
        <div className="h-11 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs min-w-0">
            <Languages size={14} className="text-muted-foreground flex-shrink-0" />
            <span className="text-foreground flex-shrink-0">翻译</span>
            <span className="text-muted-foreground/30 flex-shrink-0">·</span>
            {/* Expert dropdown */}
            <Popover open={showExpertDropdown} onOpenChange={(v) => { setShowExpertDropdown(v); if (v) setShowModelDropdown(false); }}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost" size="xs"
                  className="flex items-center gap-1 px-1.5 py-0.5 text-muted-foreground hover:text-foreground flex-shrink-0"
                >
                  <Brain size={11} className="text-primary/60" />
                  <span className="max-w-[110px] truncate text-xs">{currentExpert.label}</span>
                  <ChevronDown size={9} className="text-muted-foreground/40" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-48 p-0 py-1 rounded-xl max-h-[340px] overflow-y-auto">
                {expertList.map(e => (
                  <Button
                    variant="ghost" size="xs"
                    key={e.id}
                    onClick={() => { setSelectedExpert(e.id); setShowExpertDropdown(false); }}
                    className="w-full text-left px-1.5 py-[2px] text-xs justify-start"
                  >
                    <div className={`flex items-center gap-1.5 px-2 py-[5px] rounded-lg transition-colors ${
                      e.id === selectedExpert ? 'bg-accent text-foreground' : 'text-foreground hover:bg-accent/50'
                    }`}>
                      {e.id === selectedExpert ? <Check size={11} className="text-primary flex-shrink-0" /> : <span className="w-[11px] flex-shrink-0" />}
                      <span>{e.label}</span>
                    </div>
                  </Button>
                ))}
              </PopoverContent>
            </Popover>
            {/* Model icon selector */}
            <Popover open={showModelDropdown} onOpenChange={(v) => { setShowModelDropdown(v); if (v) setShowExpertDropdown(false); if (!v) setModelSearch(''); }}>
              <PopoverTrigger asChild>
                <Tooltip content={currentModel.name} side="bottom">
                  <Button
                    variant="ghost" size="icon-xs"
                    className={`w-7 h-7 flex-shrink-0 ${
                      showModelDropdown ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                  >
                    <Sparkles size={13} className="text-primary/70" />
                  </Button>
                </Tooltip>
              </PopoverTrigger>
              <PopoverContent align="center" className="w-[340px] p-0 rounded-xl overflow-hidden">
                {/* Search */}
                <div className="border-b border-border/30">
                  <SearchInput
                    value={modelSearch}
                    onChange={setModelSearch}
                    placeholder="搜索模型..."
                    iconSize={13}
                    wrapperClassName="px-3 py-2.5 rounded-none border-0 bg-transparent"
                    autoFocus
                  />
                </div>
                {/* Tag filters */}
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/30 flex-wrap">
                  <Button
                    variant="ghost" size="xs"
                    onClick={() => setModelTagFilter(null)}
                    className={`text-xs px-2 py-0.5 rounded-full border ${
                      !modelTagFilter ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border/50 text-muted-foreground hover:bg-accent/50'
                    }`}
                  >按标签筛选</Button>
                  {allModelTags.map(tag => (
                    <Button
                      variant="ghost" size="xs"
                      key={tag}
                      onClick={() => setModelTagFilter(modelTagFilter === tag ? null : tag)}
                      className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                        modelTagFilter === tag ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border/50 text-muted-foreground hover:bg-accent/50'
                      }`}
                    >
                      {tag === '视觉' && <Eye size={9} />}
                      {tag === '推理' && <Brain size={9} />}
                      {tag === '工具' && <Hammer size={9} />}
                      {tag === '联网' && <Globe size={9} />}
                      {tag === '免费' && '🆓'}
                      {tag}
                    </Button>
                  ))}
                </div>
                {/* Model list */}
                <div className="max-h-[280px] overflow-y-auto py-1">
                  {filteredModels.map(m => (
                    <Button
                      variant="ghost" size="xs"
                      key={m.id}
                      onClick={() => { setSelectedModelId(m.id); setShowModelDropdown(false); setModelSearch(''); }}
                      className="w-full text-left px-1.5 py-[2px] text-xs justify-start"
                    >
                      <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${
                        m.id === selectedModelId ? 'bg-accent text-foreground' : 'text-foreground hover:bg-accent/50'
                      }`}>
                        <span className="w-5 h-5 rounded flex items-center justify-center text-xs flex-shrink-0">{m.icon}</span>
                        <span className="flex-1 truncate">{m.name}</span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {m.tags.map(t => (
                            <span key={t} className={`text-xs px-1 py-[1px] rounded ${
                              t === '免费' ? 'bg-muted text-muted-foreground' : 'bg-accent/50 text-muted-foreground/60'
                            }`}>{t}</span>
                          ))}
                        </div>
                      </div>
                    </Button>
                  ))}
                  {filteredModels.length === 0 && (
                    <div className="px-3 py-4 text-center text-xs text-muted-foreground/40">无匹配模型</div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost" size="icon-xs"
              onClick={() => setHistoryOpen(v => !v)}
              className={`w-7 h-7 ${
                historyOpen ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <History size={14} strokeWidth={1.6} />
            </Button>
            <Button
              variant="ghost" size="icon-xs"
              onClick={() => setSettingsOpen(v => !v)}
              className={`w-7 h-7 ${
                settingsOpen ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <SlidersHorizontal size={14} strokeWidth={1.6} />
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col p-4">
          {/* Translation card - fills available height */}
          <div className="flex-1 flex flex-col bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm min-h-0">
            {/* Language selector row */}
            <div className="flex items-center h-10 px-2 flex-shrink-0">
              <Popover open={showLangDropdownSrc} onOpenChange={(v) => { setShowLangDropdownSrc(v); if (v) setShowLangDropdownTgt(false); }}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm"
                    className="flex-1 h-full flex items-center justify-center gap-1.5 text-xs text-foreground hover:bg-accent/50 py-1.5">
                    <span className="text-xs text-muted-foreground/40 mr-0.5">源语言</span>
                    <span className="text-sm leading-none">{langFlags[sourceLang] || '🌐'}</span>
                    <span>{sourceLang}</span>
                    <ChevronDown size={11} className="text-muted-foreground/50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-40 p-0 py-1 rounded-xl max-h-[240px] overflow-y-auto">
                  {languages.map(l => (
                    <Button variant="ghost" size="sm" key={l} onClick={() => { setSourceLang(l); setShowLangDropdownSrc(false); }}
                      className={`w-full text-left text-xs justify-start ${l === sourceLang ? 'text-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}`}>
                      <span className={`flex items-center gap-2 px-3 py-[6px] ${l === sourceLang ? 'bg-accent rounded-lg mx-1 my-0.5 px-2' : ''}`}><span className="text-sm leading-none">{langFlags[l] || '🌐'}</span>{l}</span>
                    </Button>
                  ))}
                </PopoverContent>
              </Popover>
              <Button variant="ghost" size="icon-xs" onClick={handleSwapLangs}
                className={`w-8 h-8 rounded-full flex-shrink-0 ${
                  sourceLang === '自动检测' ? 'text-muted-foreground/30 cursor-not-allowed' : 'text-muted-foreground hover:text-foreground hover:bg-accent active:scale-[0.97]'
                }`}>
                <ArrowLeftRight size={14} />
              </Button>
              <Popover open={showLangDropdownTgt} onOpenChange={(v) => { setShowLangDropdownTgt(v); if (v) setShowLangDropdownSrc(false); }}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm"
                    className="flex-1 h-full flex items-center justify-center gap-1.5 text-xs text-foreground hover:bg-accent/50 py-1.5">
                    <span className="text-xs text-muted-foreground/40 mr-0.5">目标语言</span>
                    <span className="text-sm leading-none">{langFlags[targetLang] || '🌐'}</span>
                    <span>{targetLang}</span>
                    <ChevronDown size={11} className="text-muted-foreground/50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-40 p-0 py-1 rounded-xl max-h-[240px] overflow-y-auto">
                  {targetLanguages.map(l => (
                    <Button variant="ghost" size="sm" key={l} onClick={() => { setTargetLang(l); setShowLangDropdownTgt(false); }}
                      className={`w-full text-left text-xs justify-start ${l === targetLang ? 'text-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}`}>
                      <span className={`flex items-center gap-2 px-3 py-[6px] ${l === targetLang ? 'bg-accent rounded-lg mx-1 my-0.5 px-2' : ''}`}><span className="text-sm leading-none">{langFlags[l] || '🌐'}</span>{l}</span>
                    </Button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>

            {/* Two-column text area - fills remaining height */}
            <div className="flex-1 flex min-h-0">
              {/* Source */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 relative min-h-0">
                  <Textarea
                    value={sourceText}
                    onChange={e => setSourceText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleTranslate(); }}
                    placeholder="输入需要翻译的文本..."
                    className="w-full h-full resize-none bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
                  />
                  {sourceText && (
                    <Button variant="ghost" size="icon-xs" onClick={() => { setSourceText(''); setTranslatedText(''); }}
                      className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full text-muted-foreground/40 hover:text-muted-foreground hover:bg-accent/50">
                      <X size={11} />
                    </Button>
                  )}
                </div>
                {/* Source toolbar */}
                <div className="flex items-center justify-between px-3 py-1.5 flex-shrink-0">
                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon-xs" className="text-muted-foreground/40 hover:text-muted-foreground hover:bg-accent/50">
                      <Volume2 size={12} />
                    </Button>
                    <Button variant="ghost" size="icon-xs" onClick={() => sourceText && handleCopy(sourceText)}
                      className="text-muted-foreground/40 hover:text-muted-foreground hover:bg-accent/50">
                      <Copy size={12} />
                    </Button>
                    <Button variant="ghost" size="icon-xs" className="text-muted-foreground/40 hover:text-muted-foreground hover:bg-accent/50">
                      <FileUp size={12} />
                    </Button>
                  </div>
                  <span className="text-xs text-muted-foreground/50">{sourceText.length}</span>
                </div>
              </div>
              {/* Center divider - subtle */}
              <div className="w-px bg-border/30 my-3 flex-shrink-0" />
              {/* Target */}
              <div className="flex-1 flex flex-col min-h-0 bg-muted/10 rounded-br-2xl">
                <div className="flex-1 px-4 py-3 text-sm min-h-0 overflow-y-auto">
                  {isTranslating ? (
                    <div className="flex items-center gap-2 text-muted-foreground/60">
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <span>翻译中...</span>
                    </div>
                  ) : translatedText ? (
                    <div className="text-foreground whitespace-pre-wrap">{translatedText}</div>
                  ) : (
                    <span className="text-muted-foreground/50">翻译结果将显示在这里</span>
                  )}
                </div>
                {/* Target toolbar */}
                <div className="flex items-center justify-between px-3 py-1.5 flex-shrink-0">
                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon-xs" className="text-muted-foreground/40 hover:text-muted-foreground hover:bg-accent/50">
                      <Volume2 size={12} />
                    </Button>
                    <Button variant="ghost" size="icon-xs" onClick={() => translatedText && handleCopy(translatedText)}
                      className="text-muted-foreground/40 hover:text-muted-foreground hover:bg-accent/50">
                      {copied ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    {translatedText && <span className="text-xs text-muted-foreground/50">{translatedText.length}</span>}
                    <Button
                      variant="default" size="sm"
                      onClick={handleTranslate}
                      disabled={!sourceText.trim() || isTranslating}
                      className={`px-3 py-1 text-xs flex items-center gap-1.5 ${
                        !sourceText.trim() || isTranslating
                          ? 'bg-muted text-muted-foreground/40 cursor-not-allowed'
                          : ''
                      }`}>
                      <Languages size={12} />
                      <span>翻译</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating History Panel */}
      <AnimatePresence>
        {historyOpen && (
          <div>
            <div className="absolute inset-0 z-[var(--z-overlay)] bg-muted" onClick={() => { setHistoryOpen(false); setSelectedHistoryId(null); }} />
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="absolute top-2 right-2 bottom-2 w-[280px] z-[var(--z-popover)] slide-panel"
            >
              <div className="h-11 flex items-center justify-between px-3 flex-shrink-0 border-b border-border/30">
                <h3 className="text-xs text-foreground flex items-center gap-1.5">
                  <Clock size={12} className="text-muted-foreground" />
                  <span>翻译历史</span>
                  <span className="text-muted-foreground/40 ml-0.5">({displayedHistory.length})</span>
                </h3>
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost" size="icon-xs"
                    onClick={() => setFilterStarred(v => !v)}
                    className={`w-6 h-6 ${
                      filterStarred ? 'text-warning bg-warning/10' : 'text-muted-foreground/50 hover:text-warning hover:bg-accent/50'
                    }`}
                  >
                    <Star size={12} className={filterStarred ? 'fill-current' : ''} />
                  </Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => { setHistoryOpen(false); setSelectedHistoryId(null); }}
                    className="w-6 h-6 text-muted-foreground/50 hover:text-foreground hover:bg-accent/50">
                    <X size={12} />
                  </Button>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto">
                {selectedHistoryItem ? (
                  <div className="p-3">
                    <Button variant="ghost" size="xs" onClick={() => setSelectedHistoryId(null)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3">
                      <ChevronRight size={11} className="rotate-180" />
                      <span>返回列表</span>
                    </Button>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs px-1.5 py-0.5 rounded-md bg-accent/50 text-muted-foreground">{selectedHistoryItem.srcLang}</span>
                        <ArrowRight size={10} className="text-muted-foreground/40" />
                        <span className="text-xs px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">{selectedHistoryItem.tgtLang}</span>
                        <span className="flex-1" />
                        <Button variant="ghost" size="icon-xs" onClick={() => toggleStar(selectedHistoryItem.id)}
                          className={`w-5 h-5 ${starredIds.has(selectedHistoryItem.id) ? 'text-warning' : 'text-muted-foreground/40 hover:text-warning'}`}>
                          <Star size={11} className={starredIds.has(selectedHistoryItem.id) ? 'fill-current' : ''} />
                        </Button>
                        <span className="text-xs text-muted-foreground/40">{selectedHistoryItem.time}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground/60">
                        <span className="flex items-center gap-1">
                          <Brain size={10} />
                          <span>{selectedHistoryItem.expert}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-xs">{selectedHistoryItem.modelIcon}</span>
                          <span className="truncate max-w-[120px]">{selectedHistoryItem.model}</span>
                        </span>
                      </div>
                      <div className="bg-muted/30 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground/50">原文</span>
                          <Button variant="ghost" size="icon-xs" onClick={() => handleCopy(selectedHistoryItem.source)}
                            className="w-5 h-5 text-muted-foreground/40 hover:text-muted-foreground">
                            <Copy size={10} />
                          </Button>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{selectedHistoryItem.source}</p>
                      </div>
                      <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-primary/70">译文</span>
                          <Button variant="ghost" size="icon-xs" onClick={() => handleCopy(selectedHistoryItem.translated)}
                            className="w-5 h-5 text-muted-foreground/40 hover:text-primary">
                            <Copy size={10} />
                          </Button>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{selectedHistoryItem.translated}</p>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button variant="ghost" size="sm" onClick={() => { setSourceText(selectedHistoryItem.source); setTranslatedText(''); setSelectedHistoryId(null); setHistoryOpen(false); }}
                          className="flex-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground bg-accent/50 hover:bg-accent">
                          <Repeat size={11} />
                          <span>重新翻译</span>
                        </Button>
                        <Button variant="default" size="sm" onClick={() => handleCopy(selectedHistoryItem.translated)}
                          className="flex-1 flex items-center justify-center gap-1.5 text-xs">
                          <Copy size={11} />
                          <span>复制译文</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {displayedHistory.length === 0 ? (
                      <EmptyState icon={Star} title="暂无收藏记录" compact />
                    ) : displayedHistory.map(item => (
                      <div
                        key={item.id}
                        className="relative p-2.5 rounded-xl hover:bg-accent/50 transition-colors group cursor-pointer"
                        onClick={() => setSelectedHistoryId(item.id)}
                      >
                        <Button variant="ghost" size="icon-xs"
                          onClick={e => { e.stopPropagation(); toggleStar(item.id); }}
                          className={`absolute top-2 right-2 w-5 h-5 transition-all ${
                            starredIds.has(item.id) ? 'text-warning' : 'text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-warning'
                          }`}
                        >
                          <Star size={10} className={starredIds.has(item.id) ? 'fill-current' : ''} />
                        </Button>
                        <div className="flex items-center gap-1.5 mb-1.5 pr-5">
                          <span className="text-xs px-1 py-[1px] rounded bg-accent/50 text-muted-foreground">{item.srcLang}</span>
                          <ArrowRight size={8} className="text-muted-foreground/40" />
                          <span className="text-xs px-1 py-[1px] rounded bg-primary/10 text-primary">{item.tgtLang}</span>
                          <span className="text-xs text-muted-foreground/50 ml-auto">{item.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{item.source}</p>
                        <p className="text-xs text-foreground line-clamp-1">{item.translated}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground/40">
                          <span className="flex items-center gap-1">
                            <Brain size={9} />
                            <span>{item.expert}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-xs">{item.modelIcon}</span>
                            <span className="truncate max-w-[100px]">{item.model}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Settings Drawer */}
      {settingsOpen && (
        <div>
          {/* Backdrop */}
          <div className="absolute inset-0 z-[var(--z-overlay)] bg-muted" onClick={() => setSettingsOpen(false)} />
          {/* Drawer */}
          <div className="absolute top-0 right-0 bottom-0 w-[300px] z-[var(--z-popover)] flex flex-col bg-popover border-l border-border rounded-l-2xl shadow-2xl">
            <div className="h-11 flex items-center justify-between px-4 flex-shrink-0 border-b border-border/30">
              <h3 className="text-xs text-foreground flex items-center gap-1.5">
                <SlidersHorizontal size={12} className="text-muted-foreground" />
                <span>翻译设置</span>
              </h3>
              <Button variant="ghost" size="icon-xs" onClick={() => setSettingsOpen(false)}
                className="w-6 h-6 text-muted-foreground/50 hover:text-foreground hover:bg-accent/50">
                <X size={12} />
              </Button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto" onClick={() => { setShowBiDropA(false); setShowBiDropB(false); }}>
              <div className="p-4 space-y-5">
                {[
                  { label: 'Markdown 预览', value: markdownPreview, set: setMarkdownPreview },
                  { label: '翻译完成后自动复制', value: autoCopy, set: setAutoCopy },
                  { label: '滚动同步设置', value: scrollSync, set: setScrollSync },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{item.label}</span>
                    <Switch size="sm" checked={item.value} onCheckedChange={() => item.set(!item.value)} />
                  </div>
                ))}

                {/* Detect method */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-foreground">自动检测方法</span>
                    <Tooltip content="选择语言检测使用的方法" side="top">
                      <span className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30 flex items-center justify-center text-xs text-muted-foreground/50 cursor-help">?</span>
                    </Tooltip>
                  </div>
                  <InlineSelect
                    value={detectMethod}
                    options={[{ value: 'auto', label: '自动' }, { value: 'algo', label: '算法' }, { value: 'llm', label: 'LLM' }]}
                    onChange={v => setDetectMethod(v as 'auto' | 'algo' | 'llm')}
                  />
                </div>

                {/* Bidirectional */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-foreground">双向翻译设置</span>
                      <Tooltip content="同时翻译两个方向" side="top">
                        <span className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30 flex items-center justify-center text-xs text-muted-foreground/50 cursor-help">?</span>
                      </Tooltip>
                    </div>
                    <Switch size="sm" checked={biDirectional} onCheckedChange={setBiDirectional} />
                  </div>
                  {biDirectional && (
                    <div className="flex items-center gap-2">
                      {/* Lang A dropdown */}
                      <Popover open={showBiDropA} onOpenChange={(v) => { setShowBiDropA(v); if (v) setShowBiDropB(false); }}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="inline"
                            className="flex-1 flex items-center gap-1 px-2 py-1.5 rounded-lg border-border/50 bg-card text-xs text-foreground hover:border-border justify-between">
                            <span className="flex-1 text-left truncate">{biLangA.length ? biLangA.join(', ') : '选择语言'}</span>
                            <ChevronDown size={10} className="text-muted-foreground/40 flex-shrink-0" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="max-h-[140px] overflow-y-auto p-1 w-[var(--radix-popover-trigger-width)]" align="start">
                          {targetLanguages.map(lang => (
                            <Button variant="ghost" size="inline" key={lang}
                              onClick={() => setBiLangA(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang])}
                              className="w-full px-1 py-[1px] text-xs justify-start">
                              <div className={`flex items-center gap-2 px-2 py-1 rounded-md transition-colors ${biLangA.includes(lang) ? 'bg-accent text-foreground' : 'text-foreground hover:bg-accent/50'}`}>
                                <Checkbox checked={biLangA.includes(lang)} className="flex-shrink-0" />
                                <span>{lang}</span>
                              </div>
                            </Button>
                          ))}
                        </PopoverContent>
                      </Popover>
                      <ArrowLeftRight size={12} className="text-muted-foreground/40 flex-shrink-0" />
                      {/* Lang B dropdown */}
                      <Popover open={showBiDropB} onOpenChange={(v) => { setShowBiDropB(v); if (v) setShowBiDropA(false); }}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="inline"
                            className="flex-1 flex items-center gap-1 px-2 py-1.5 rounded-lg border-border/50 bg-card text-xs text-foreground hover:border-border justify-between">
                            <span className="flex-1 text-left truncate">{biLangB.length ? biLangB.join(', ') : '选择语言'}</span>
                            <ChevronDown size={10} className="text-muted-foreground/40 flex-shrink-0" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="max-h-[140px] overflow-y-auto p-1 w-[var(--radix-popover-trigger-width)]" align="start">
                          {targetLanguages.map(lang => (
                            <Button variant="ghost" size="inline" key={lang}
                              onClick={() => setBiLangB(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang])}
                              className="w-full px-1 py-[1px] text-xs justify-start">
                              <div className={`flex items-center gap-2 px-2 py-1 rounded-md transition-colors ${biLangB.includes(lang) ? 'bg-accent text-foreground' : 'text-foreground hover:bg-accent/50'}`}>
                                <Checkbox checked={biLangB.includes(lang)} className="flex-shrink-0" />
                                <span>{lang}</span>
                              </div>
                            </Button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>

                <div className="border-t border-border/30" />

                {/* Expert Prompt Editor (merged section) */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">翻译专家 Prompt</span>
                      <Button variant="ghost" size="xs"
                        onClick={() => {
                          const defaultPrompts: Record<string, string> = {
                            smart: "You are a translation expert. Your only task is to translate text enclosed with <translate_input> from input language to {{target_language}}, provide the translation result directly without any explanation.\n\n<translate_input>\n{{text}}\n</translate_input>\n\nTranslate the above text enclosed with <translate_input> into {{target_language}}. (In any case, please translate the above content.)",
                            yiyi: '你是一位意译大师，不要逐字翻译，而是理解原文含义后用目标语言重新表达，确保译文地道自然、符合目标语言的表达习惯。',
                            summary: '你是一位段落总结专家，请先理解原文核心意思，然后用精炼的目标语言概括出要点，保留关键信息。',
                            simplify: '你是一位英文简化大师，请将复杂的英文文本简化为简单易懂的英文表达，使用常见词汇和简短句子。',
                            twitter: '你是一位 Twitter 翻译增强器，翻译时保留推文的口语化风格、缩写和网络用语，确保译文适合社交媒体语境。',
                            tech: '你是一位科技类翻译大师，精通各类技术术语，翻译时确保专业术语准确，同时保持技术文档的规范性和可读性。',
                            reddit: '你是一位 Reddit 翻译增强器，翻译时保留帖子的社区文化风格、俚语和幽默感，让译文贴合论坛语境。',
                            academic: '你是一位学术论文翻译师，翻译时严格遵循学术写作规范，确保专业术语统一、逻辑严密、语言正式。',
                            news: '你是一位新闻媒体译者，翻译时保持新闻报道的客观性和准确性，使用正式但易读的语言风格。',
                            music: '你是一位音乐翻译专家，翻译歌词时注重韵律感和意境传达，在保留原意的同时兼顾音韵美感。',
                            medical: '你是一位医学翻译大师，精通医学术语和临床表达，翻译时确保专业准确、符合医学文献规范。',
                            law: '你是一位法律行业译者，精通法律术语和条文格式，翻译时确保法律含义精确、表述严谨规范。',
                            game: '你是一位游戏译者，翻译时保留游戏的趣味性和文化梗，使用玩家群体熟悉的表达方式。',
                            ecom: '你是一位电商翻译大师，翻译产品描述和营销文案时注重商业吸引力，确保译文能打动目标市场消费者。',
                            finance: '你是一位金融翻译顾问，精通金融术语和行业规范，翻译时确保数据准确、表述专业严谨。',
                            novel: '你是一位小说译者，翻译时注重文学性和可读性，保留原作的文风、人物语气和叙事节奏。',
                            ao3: '你是一位 AO3 同人文译者，翻译时保留同人创作的风格、CP 互动语气和粉丝圈特有用语。',
                            ebook: '你是一位电子书译者，翻译时注重长文本的一致性和流畅度，确保全书术语统一、风格连贯。',
                            designer: '你是一位设计师翻译专家，翻译设计相关内容时使用精准的设计术语，保持简洁有力的表达风格。',
                            bilingual: '你是一位中英夹杂翻译专家，在翻译时适当保留英文专业术语和常用表达，输出中英混排的自然文本。',
                            web3: '你是一位 Web3 翻译大师，精通区块链、DeFi、NFT 等领域术语，翻译时保留行业惯用英文缩写。',
                          };
                          setExpertPrompts(prev => ({ ...prev, [selectedExpert]: defaultPrompts[selectedExpert] || '' }));
                        }}
                        className="text-xs text-muted-foreground/50 hover:text-primary h-auto p-0"
                      >
                        恢复默认
                      </Button>
                    </div>
                    <InlineSelect
                      value={selectedExpert}
                      options={expertList.filter(e => e.id !== 'more').map(e => ({ value: e.id, label: e.label }))}
                      onChange={setSelectedExpert}
                      className="w-full"
                    />
                    <Textarea
                      value={expertPrompts[selectedExpert] || ''}
                      onChange={e => setExpertPrompts(prev => ({ ...prev, [selectedExpert]: e.target.value }))}
                      placeholder="输入该专家的自定义 Prompt..."
                      className="w-full bg-muted/30 rounded-xl p-3 text-xs text-muted-foreground/60 leading-relaxed outline-none resize-y min-h-[120px] border border-border/30 focus:border-primary/30 transition-colors"
                    />
                    <span className="text-xs text-muted-foreground/40">切换专家即可编辑对应的 Prompt，顶栏专家选择会同步联动</span>
                  </div>

                  {/* Custom languages */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">自定义语言</span>
                      {customLangs.length > 0 && <span className="text-xs text-muted-foreground/40">{customLangs.length} 项</span>}
                    </div>
                    {customLangs.map((lang, i) => (
                      editingLangIdx === i ? (
                        <div key={i} className="flex items-center gap-1.5 rounded-lg bg-accent/50 px-2 py-1.5">
                          <Input value={editLangName} onChange={e => setEditLangName(e.target.value)}
                            className="flex-1 min-w-0 bg-card rounded-md px-2 py-1 text-xs text-foreground border border-border/30 focus:border-border h-auto shadow-none" autoFocus />
                          <Input value={editLangCode} onChange={e => setEditLangCode(e.target.value)}
                            className="w-14 bg-card rounded-md px-1.5 py-1 text-xs text-foreground font-mono border border-border/30 focus:border-border flex-shrink-0 h-auto shadow-none" />
                          <Button variant="ghost" size="icon-xs" onClick={() => {
                            if (editLangName.trim() && editLangCode.trim()) {
                              setCustomLangs(prev => prev.map((l, j) => j === i ? { ...l, name: editLangName.trim(), code: editLangCode.trim() } : l));
                            }
                            setEditingLangIdx(null);
                          }} className="w-5 h-5 text-muted-foreground flex-shrink-0"><Check size={10} /></Button>
                          <Button variant="ghost" size="icon-xs" onClick={() => setEditingLangIdx(null)}
                            className="w-5 h-5 text-muted-foreground/40 hover:text-foreground flex-shrink-0"><X size={10} /></Button>
                        </div>
                      ) : (
                        <div key={i} className="flex items-center gap-2 px-2 py-[5px] rounded-lg hover:bg-muted/30 group transition-colors">
                          <span className="text-sm text-foreground truncate min-w-0">{lang.name}</span>
                          <span className="text-xs text-muted-foreground/50 font-mono flex-shrink-0">{lang.code}</span>
                          <span className="flex-1" />
                          <Button variant="ghost" size="icon-xs" onClick={() => { setEditingLangIdx(i); setEditLangName(lang.name); setEditLangCode(lang.code); }}
                            className="w-4 h-4 text-muted-foreground/40 hover:text-foreground opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"><PenLine size={9} /></Button>
                          <Button variant="ghost" size="icon-xs" onClick={() => setCustomLangs(prev => prev.filter((_, j) => j !== i))}
                            className="w-4 h-4 text-muted-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"><X size={9} /></Button>
                        </div>
                      )
                    ))}
                    {addingLang ? (
                      <div className="flex items-center gap-1.5 rounded-lg border border-dashed border-border/50 px-2 py-1.5">
                        <Input value={newLangName} onChange={e => setNewLangName(e.target.value)}
                          className="flex-1 min-w-0 bg-muted/30 rounded-md px-2 py-1 text-xs text-foreground border border-border/30 focus:border-border placeholder:text-muted-foreground/60 h-auto shadow-none"
                          placeholder="语言名称" autoFocus />
                        <Input value={newLangCode} onChange={e => setNewLangCode(e.target.value)}
                          className="w-14 bg-muted/30 rounded-md px-1.5 py-1 text-xs text-foreground font-mono border border-border/30 focus:border-border placeholder:text-muted-foreground/60 flex-shrink-0 h-auto shadow-none"
                          placeholder="代码" />
                        <Button variant="ghost" size="icon-xs"
                          onClick={() => {
                            if (newLangName.trim() && newLangCode.trim()) {
                              setCustomLangs(prev => [...prev, { emoji: '', name: newLangName.trim(), code: newLangCode.trim() }]);
                              setNewLangName(''); setNewLangCode('');
                            }
                            setAddingLang(false);
                          }}
                          disabled={!newLangName.trim() || !newLangCode.trim()}
                          className={`w-5 h-5 flex-shrink-0 ${
                            newLangName.trim() && newLangCode.trim() ? 'text-muted-foreground' : 'text-muted-foreground/30 cursor-not-allowed'
                          }`}
                        ><Check size={10} /></Button>
                        <Button variant="ghost" size="icon-xs" onClick={() => { setAddingLang(false); setNewLangName(''); setNewLangCode(''); }}
                          className="w-5 h-5 text-muted-foreground/40 hover:text-foreground flex-shrink-0"><X size={10} /></Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="inline" onClick={() => setAddingLang(true)}
                        className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg border border-dashed border-border/40 text-xs text-muted-foreground/40 hover:text-muted-foreground hover:border-border/60">
                        <Plus size={11} />
                        <span>添加语言</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
