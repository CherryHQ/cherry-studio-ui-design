import React from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@cherry-studio/ui';
import type { Tab } from '@/app/types';

export function GenericPage({ tab }: { tab: Tab }) {
  const Icon = tab.icon;
  const descriptions: Record<string, string> = {
    search: '全局搜索功能，快速查找聊天记录、文件和知识库内容。',
    painting: '使用 AI 生成精美的图片和艺术作品。',
    translate: '多语言实时翻译，支持文档和对话翻译。',
    explore: '发现和探索社区分享的优质提示词和助手。',
    library: '管理和浏览你的资源库。',
    knowledge: '创建和管理知识库，为 AI 提供专业领域知识。',
    file: '管理你的文件和文档。',
    code: '使用 AI 辅助编程，支持多种编程语言。',
    note: '智能笔记，结合 AI 能力进行知识整理。',
  };
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="h-11 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs">
          <Icon size={13} className="text-muted-foreground" />
          <span className="text-foreground">{tab.title}</span>
        </div>
        <Button variant="ghost" size="icon-sm" className="w-7 h-7">
          <Settings size={14} strokeWidth={1.6} />
        </Button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-accent/80 flex items-center justify-center mx-auto mb-4">
            <Icon size={28} className="text-muted-foreground" strokeWidth={1.4} />
          </div>
          <h2 className="text-lg text-foreground mb-2">{tab.title}</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">{descriptions[tab.menuItemId || ''] || '此功能正在开发中。'}</p>
        </div>
      </div>
    </div>
  );
}
