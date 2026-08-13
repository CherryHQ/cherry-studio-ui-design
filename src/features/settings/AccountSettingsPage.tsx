import { Loader2, LogOut, User } from 'lucide-react';
import { Button } from '@cherry-studio/ui';
import { useAuth } from '@/app/context/AuthContext';

// ===========================
// 设置 → 账号
// ===========================
// Cherry Studio 是账号系统，CherryIN 是模型服务里的一个 provider，两者不在这里
// 打架：这一页只管身份（头像 / 用户名 / 绑定的手机号或邮箱 / 退出登录）。
// 免费额度不在这里展示 —— 内测期间额度策略会频繁调整，落到界面上就成了承诺。
//
// 组织 / 切换组织 / 切换用户是企业版的概念，社区版这版不做。

export function AccountSettingsPage() {
  const { user, isLoggedIn, loginPending, beginBrowserLogin, reopenLoginTab, cancelBrowserLogin, logout } = useAuth();

  const contact = user?.phone ?? user?.email ?? '';
  const contactLabel = user?.phone ? '手机号' : '邮箱';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <User size={16} className="text-muted-foreground" />
          <h2 className="text-sm font-medium text-foreground">账号</h2>
        </div>
        <p className="text-xs text-muted-foreground">管理登录 Cherry Studio 的账号信息。</p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-thin">
        <div className="border border-section-border rounded-[var(--radius-button)] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-section-border/60">
            <span className="text-xs font-medium text-foreground">用户</span>
          </div>

          <Row label="头像">
            <span className="w-8 h-8 rounded-full bg-cherry-primary/10 ring-1 ring-border flex items-center justify-center overflow-hidden">
              <User size={16} className={isLoggedIn ? 'text-cherry-primary' : 'text-muted-foreground/50'} strokeWidth={1.8} />
            </span>
          </Row>

          <Row label="用户名">
            <span className={`text-xs ${isLoggedIn ? 'text-foreground' : 'text-muted-foreground/50'}`}>
              {isLoggedIn ? user?.name : '未登录'}
            </span>
          </Row>

          {isLoggedIn && (
            <Row label={contactLabel} last>
              <span className="text-xs text-foreground tabular-nums">{contact}</span>
            </Row>
          )}

          {/* 操作行 */}
          <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-section-border/60">
            {isLoggedIn ? (
              <Button
                variant="ghost"
                size="xs"
                onClick={logout}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
              >
                <LogOut size={11} />
                退出登录
              </Button>
            ) : loginPending ? (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 size={12} className="animate-spin" />
                  正在浏览器中完成登录…
                </span>
                <button onClick={reopenLoginTab} className="text-xs text-cherry-primary hover:underline">重新打开</button>
                <button onClick={cancelBrowserLogin} className="text-xs text-muted-foreground hover:text-foreground transition-colors">取消</button>
              </div>
            ) : (
              <Button size="xs" onClick={beginBrowserLogin}>登录</Button>
            )}
          </div>
        </div>

        {!isLoggedIn && (
          <p className="mt-3 text-xs text-muted-foreground/60">
            登录将在浏览器中完成，成功后自动返回客户端。
          </p>
        )}
      </div>
    </div>
  );
}

function Row({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 px-4 py-3 ${last ? '' : 'border-b border-section-border/60'}`}>
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
