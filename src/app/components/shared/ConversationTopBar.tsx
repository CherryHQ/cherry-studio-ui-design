import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@cherry-studio/ui';

// ===========================
// 会话顶栏选择器
// ===========================
// 对齐现网（cherry-studio main）：会话的上下文选择器 —— 助手 / Agent、模型、
// 工作区 —— 不再挂在输入框底部，而是通过 ConversationTopBarPortal 渲染到内容区
// 顶栏（见 pages/home/components/ChatNavbar.tsx 和
// pages/agents/components/AgentChatNavbar/AgentContent.tsx）。输入框底部只留
// 工具入口和思考档位。
//
// 样式沿用现网 COMPOSER_BELOW_SELECTOR_BUTTON_CLASS：h-8 圆角胶囊、20px 图标、
// 12px 文字，图标默认 muted、hover 转 foreground。
export const TOPBAR_SELECTOR_CLASS =
  'h-8 shrink-0 gap-1.5 rounded-lg border border-transparent bg-transparent px-2.5 text-xs font-medium text-foreground shadow-none hover:bg-accent active:bg-accent disabled:bg-transparent';

interface TopBarSelectorProps {
  icon?: React.ReactNode;
  label: string;
  /** 可下拉时显示 chevron；现网里「会话中的 Agent」只能点开编辑，没有 chevron */
  showChevron?: boolean;
  open?: boolean;
  disabled?: boolean;
  /** 标签最大宽度，对齐现网的 max-w-40 / max-w-52 */
  labelClassName?: string;
  /** 图标槽的额外样式，比如模型不可用时的去饱和 */
  iconClassName?: string;
  className?: string;
  onClick?: () => void;
  title?: string;
}

export const TopBarSelector = React.forwardRef<HTMLButtonElement, TopBarSelectorProps>(
  ({ icon, label, showChevron, open, disabled, labelClassName, iconClassName, className, onClick, title, ...rest }, ref) => (
    <Button
      ref={ref}
      variant="ghost"
      size="inline"
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={`${TOPBAR_SELECTOR_CLASS} ${open ? 'bg-accent' : ''} ${className ?? ''}`}
      {...rest}
    >
      {/* Button 基类带 [&_svg:not([class*='size-'])]:size-4（inline 尺寸还会压到
          size-3），会把品牌 logo 内层的 svg 一起改掉 —— lobehub 的 Avatar 是
          「有底色的方块 + 内层 svg」，内层被强改尺寸后图标会缩到角上。这里把
          图标槽内的 svg 尺寸交还给组件自己，效果与模型列表里的一致。 */}
      {icon && (
        <span
          className={`flex size-5 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-auto! ${iconClassName ?? ''}`}
        >
          {icon}
        </span>
      )}
      <span className={`truncate ${labelClassName ?? 'max-w-40'}`}>{label}</span>
      {showChevron && (
        <ChevronDown
          size={14}
          className={`shrink-0 text-muted-foreground transition-transform duration-100 ${open ? 'rotate-180' : ''}`}
        />
      )}
    </Button>
  ),
);
TopBarSelector.displayName = 'TopBarSelector';
