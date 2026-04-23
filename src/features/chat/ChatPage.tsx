import React from 'react';
import {
  Hash, ChevronRight, ChevronDown, Sparkles, Clock, Settings,
  Paperclip, MapPin, Send,
} from 'lucide-react';
import { Button, Input, BrandLogo } from '@cherry-studio/ui';

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
          <div className="flex items-center gap-1.5 text-xs text-foreground">
            <BrandLogo id="gemini" size={14} />
            <span>Gemini 2.5 Flash Preview 04-17</span>
            <ChevronDown size={12} />
          </div>
          <div className="flex items-center gap-0.5 ml-2">
            <Button variant="ghost" size="icon-sm">
              <Clock size={14} strokeWidth={1.6} />
            </Button>
            <Button variant="ghost" size="icon-sm">
              <Settings size={14} strokeWidth={1.6} />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
        <div className="w-full max-w-2xl">
          <div className="bg-muted/30 border border-border/40 rounded-xl overflow-hidden">
            <div className="px-4 pt-4 pb-2">
              <Input type="text" placeholder="你想知道什么?" className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 border-none shadow-none focus-visible:ring-0" />
            </div>
            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-sm"><Paperclip size={15} strokeWidth={1.6} /></Button>
                <Button variant="ghost" size="xs" className="gap-1 text-muted-foreground"><Hash size={13} /><span>模型</span><ChevronDown size={11} /></Button>
                <Button variant="ghost" size="xs" className="gap-1 text-muted-foreground"><MapPin size={13} /><span>思考</span></Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="xs" className="gap-1 text-muted-foreground">默认助手<ChevronDown size={11} /></Button>
                <Button variant="default" size="icon-sm" className="rounded-full"><Send size={14} className="ml-0.5" /></Button>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full max-w-2xl mt-6 mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-foreground">最近话题</h3>
            <Button variant="ghost" size="xs" className="text-muted-foreground">查看更多</Button>
          </div>
          <p className="text-xs text-muted-foreground">发送消息以开始你的第一个话题。</p>
        </div>
      </div>
    </div>
  );
}
