import React, { useState } from 'react';
import { Plus, Trash2, Search, Database, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_KNOWLEDGE_BASES } from '@/app/config/constants';

export function KnowledgeSection() {
  const [linkedKBs, setLinkedKBs] = useState<string[]>(['kb-1', 'kb-2']);
  const [topK, setTopK] = useState(5);
  const [scoreThreshold, setScoreThreshold] = useState(0.7);
  const [showKBPicker, setShowKBPicker] = useState(false);
  const [kbSearch, setKbSearch] = useState('');

  const linkedItems = MOCK_KNOWLEDGE_BASES.filter(kb => linkedKBs.includes(kb.id));
  const unlinkedItems = MOCK_KNOWLEDGE_BASES.filter(kb =>
    !linkedKBs.includes(kb.id) && (!kbSearch || kb.name.toLowerCase().includes(kbSearch.toLowerCase()))
  );

  const toggleLink = (id: string) => {
    setLinkedKBs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h3 className="text-[14px] text-foreground mb-1">知识库关联</h3>
        <p className="text-[10px] text-muted-foreground/55">选择知识库并配置检索参数</p>
      </div>

      {/* Linked */}
      <div>
        <label className="text-[10px] text-muted-foreground/60 mb-2 block">已关联知识库</label>
        {linkedItems.length === 0 ? (
          <div className="border border-dashed border-border/20 rounded-xl p-6 flex flex-col items-center">
            <Database size={20} strokeWidth={1.2} className="text-muted-foreground/20 mb-2" />
            <p className="text-[10px] text-muted-foreground/40 mb-1">暂未关联知识库</p>
            <p className="text-[9px] text-muted-foreground/30">关联知识库后，助手可以根据文档内容回答问题</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {linkedItems.map(kb => (
              <div key={kb.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/15 bg-accent/10 group hover:border-border/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-accent/50 flex items-center justify-center text-sm flex-shrink-0">{kb.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-foreground truncate">{kb.name}</div>
                  <div className="text-[9px] text-muted-foreground/40">{kb.docCount} 文档 · {kb.size}</div>
                </div>
                <button onClick={() => toggleLink(kb.id)} className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground/25 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={10} /></button>
              </div>
            ))}
          </div>
        )}
        <div className="relative mt-2">
          <button onClick={() => setShowKBPicker(!showKBPicker)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] text-muted-foreground/50 hover:text-foreground hover:bg-accent/30 transition-colors border border-border/15 hover:border-border/30">
            <Plus size={10} /> 添加知识库
          </button>
          <AnimatePresence>
            {showKBPicker && (
              <div className="contents">
                <div className="fixed inset-0 z-40" onClick={() => setShowKBPicker(false)} />
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border/30 rounded-xl shadow-xl p-2 min-w-[240px]">
                  <div className="relative mb-2">
                    <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                    <input value={kbSearch} onChange={e => setKbSearch(e.target.value)} placeholder="搜索知识库..."
                      className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-border/15 bg-accent/10 text-[10px] outline-none focus:border-border/40 transition-all" />
                  </div>
                  {unlinkedItems.length === 0 ? (
                    <p className="text-[9px] text-muted-foreground/40 px-2 py-3 text-center">没有更多可用的知识库</p>
                  ) : (
                    unlinkedItems.map(kb => (
                      <button key={kb.id} onClick={() => { toggleLink(kb.id); setShowKBPicker(false); }}
                        className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-left hover:bg-accent/40 transition-colors">
                        <span className="text-sm">{kb.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] text-foreground truncate">{kb.name}</div>
                          <div className="text-[8px] text-muted-foreground/40">{kb.docCount} 文档</div>
                        </div>
                      </button>
                    ))
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="h-px bg-border/10" />

      {/* Sliders */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] text-muted-foreground/60 mb-1.5 block">Top-K <span className="text-muted-foreground/35 ml-1">{topK}</span></label>
          <input type="range" min={1} max={20} step={1} value={topK} onChange={e => setTopK(parseInt(e.target.value))}
            className="w-full h-1 bg-accent/40 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:cursor-pointer" />
          <div className="flex justify-between mt-1"><span className="text-[8px] text-muted-foreground/30">1</span><span className="text-[8px] text-muted-foreground/30">20</span></div>
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground/60 mb-1.5 block">相似度阈值 <span className="text-muted-foreground/35 ml-1">{scoreThreshold.toFixed(2)}</span></label>
          <input type="range" min={0} max={1} step={0.05} value={scoreThreshold} onChange={e => setScoreThreshold(parseFloat(e.target.value))}
            className="w-full h-1 bg-accent/40 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:cursor-pointer" />
          <div className="flex justify-between mt-1"><span className="text-[8px] text-muted-foreground/30">0</span><span className="text-[8px] text-muted-foreground/30">1.0</span></div>
        </div>
      </div>

      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15">
        <AlertCircle size={12} className="text-amber-500/50 flex-shrink-0 mt-px" />
        <div>
          <p className="text-[10px] text-amber-600/60">提高 Top-K 可以获取更多上下文，但会增加 Token 消耗。</p>
          <p className="text-[9px] text-amber-600/40 mt-0.5">建议值：Top-K 3~8，阈值 0.6~0.8</p>
        </div>
      </div>
    </div>
  );
}
