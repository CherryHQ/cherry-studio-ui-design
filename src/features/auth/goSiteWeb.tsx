import { useState } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { ChevronDown, CreditCard, LogOut } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@cherry-studio/ui';
import cherryLogoImg from '@/assets/cherry-icon.png';
import {
  buildGoDocsUrl, buildGoPageUrl, buildGoSubscriptionUrl, buildLoginUrl,
} from '@/app/lib/authStorage';
import type { AuthSnapshot } from '@/app/lib/authStorage';
import { GoSiteThemeSelector } from './goSiteTheme';

// ===========================
// 官网网页端公共外壳（对齐 cherry-studio-website 的 SimpleHeader）
// 四个网页端路由（?go=1 / ?subscription=1 / ?checkout=go / ?docs=go）共用：
// 页头 GoSiteHeader + 账号菜单 AccountMenu + 单色前景主按钮 SiteButton。
// 全部依赖 .go-site 作用域 token，并与官网一样支持 light / dark / system。
// ===========================

/** 文字导航项的统一样式 */
const NAV_ITEM =
  'px-4 py-2 text-base font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground';
/** 当前页导航项高亮 */
const NAV_ITEM_ACTIVE = 'px-4 py-2 text-base font-medium text-foreground';

export function GoSiteHeader({ user, onLogout, active }: {
  user: AuthSnapshot['user'];
  onLogout: () => void;
  /** 当前所在页：go=Go 介绍页（Go tab 高亮、锚点 #go）；docs=文档页（文档 tab 高亮） */
  active?: 'go' | 'docs';
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={cherryLogoImg} alt="Cherry Studio" className="h-8 w-auto rounded-[22%]" />
            <span className="hidden text-lg font-semibold text-foreground sm:block">Cherry Studio</span>
          </div>
          <div className="flex items-center gap-1">
            <nav className="hidden items-center gap-1 lg:flex">
              <a
                href="https://www.cherryai.com.cn/"
                target="_blank"
                rel="noreferrer"
                className={NAV_ITEM}
              >
                首页
              </a>
              {active === 'docs' ? (
                <span className={NAV_ITEM_ACTIVE}>文档</span>
              ) : (
                <button
                  onClick={() => window.open(buildGoDocsUrl(), '_blank')?.focus()}
                  className={`cursor-pointer ${NAV_ITEM}`}
                >
                  文档
                </button>
              )}
              {active === 'go' ? (
                <a href="#go" className={NAV_ITEM_ACTIVE}>
                  Go
                </a>
              ) : (
                <button
                  onClick={() => { window.location.href = buildGoPageUrl(); }}
                  className={`cursor-pointer ${NAV_ITEM}`}
                >
                  Go
                </button>
              )}
            </nav>
            <GoSiteThemeSelector className="ml-1" />
            <span className="mx-2 h-4 w-px bg-border" />
            {user ? (
              <AccountMenu
                name={user.name}
                onLogout={onLogout}
                triggerClassName="flex items-center gap-2 px-3 py-2 text-base font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
              />
            ) : (
              <button
                onClick={() => window.open(buildLoginUrl(), '_blank')?.focus()}
                className={`cursor-pointer ${NAV_ITEM}`}
              >
                登录
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

/** 右上角账号菜单 —— 用户名 + 下拉箭头，点开「我的订阅 / 退出登录」 */
function AccountMenu({ name, onLogout, triggerClassName }: {
  name: string;
  onLogout: () => void;
  /** 覆盖触发按钮类；不传则用页头默认 */
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerClasses = triggerClassName ?? 'flex items-center gap-2 px-3 py-2 text-base font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground';
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className={triggerClasses}>
          <span>{name}</span>
          <ChevronDown size={12} className="text-muted-foreground/60" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="go-site w-[180px] rounded-xl border-border bg-popover p-1.5 text-popover-foreground"
        style={{ backgroundColor: 'var(--popover)', boxShadow: 'var(--go-popover-shadow)' }}
      >
        {/* 我的订阅 —— 进「我的订阅」页查看订阅情况（?subscription=1） */}
        <button
          onClick={() => { setOpen(false); window.location.href = buildGoSubscriptionUrl(); }}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground/85 transition-colors hover:bg-accent/60 hover:text-foreground focus-visible:bg-accent/60 focus-visible:outline-none"
        >
          <CreditCard size={15} className="text-muted-foreground" />
          我的订阅
        </button>
        <button
          onClick={() => { setOpen(false); onLogout(); }}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground/85 transition-colors hover:bg-accent/60 hover:text-foreground focus-visible:bg-accent/60 focus-visible:outline-none"
        >
          <LogOut size={15} className="text-muted-foreground" />
          退出登录
        </button>
      </PopoverContent>
    </Popover>
  );
}

// --- 官网主按钮：单色前景（bg-foreground text-background），非樱桃红 ---
// md=页级 CTA（h-12），sm=卡片内动作（h-9）

export function SiteButton({ size = 'md', className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'md' | 'sm';
}) {
  const sizeCls = size === 'sm' ? 'h-9 px-5 text-sm rounded-lg' : 'h-12 px-8 text-base rounded-xl';
  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap bg-foreground font-medium text-background transition-all duration-200 hover:bg-foreground/90 active:scale-[0.98] ${sizeCls} ${className ?? ''}`}
      {...props}
    />
  );
}
