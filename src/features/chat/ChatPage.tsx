import React from 'react';
import {
  Hash, ChevronRight, ChevronDown, Sparkles, Clock, Settings,
  Paperclip, MapPin, Send,
} from 'lucide-react';

export function ChatPage({ title }: { title: string }) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="h-11 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs">
          <Hash size={13} className="text-muted-foreground" />
          <span className="text-muted-foreground">默认助手</span>
          <ChevronRight size={11} className="text-muted-foreground/50" />
          <span className="text-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-primary">
            <Sparkles size={12} />
            <span>Gemini 2.5 Flash Preview 04-17</span>
            <ChevronDown size={12} />
          </div>
          <div className="flex items-center gap-0.5 ml-2">
            <button className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <Clock size={14} strokeWidth={1.6} />
            </button>
            <button className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <Settings size={14} strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
        <div className="w-full max-w-2xl">
          <div className="bg-muted/30 border border-border/40 rounded-xl overflow-hidden">
            <div className="px-4 pt-4 pb-2">
              <input type="text" placeholder="你想知道什么?" className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none" />
            </div>
            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><Paperclip size={15} strokeWidth={1.6} /></button>
                <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><Hash size={13} /><span>模型</span><ChevronDown size={11} /></button>
                <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><MapPin size={13} /><span>思考</span></button>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors">默认助手<ChevronDown size={11} /></button>
                <button className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-80 transition-opacity"><Send size={14} className="ml-0.5" /></button>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full max-w-2xl mt-6 mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-foreground">最近话题</h3>
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">查看更多</button>
          </div>
          <p className="text-xs text-muted-foreground">发送消息以开始你的第一个话题。</p>
        </div>
      </div>
    </div>
  );
}
