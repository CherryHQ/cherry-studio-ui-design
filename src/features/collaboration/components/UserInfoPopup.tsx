import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Input } from '@cherry-studio/ui';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { CURRENT_USER } from '../data';

interface UserInfoPopupProps {
  open: boolean;
  onClose: () => void;
}

// ===========================
// 头像弹窗（个人信息）
// ===========================
// 结构对齐客户端的 UserPopup：300px 宽、无标题、居中头像 + 居中姓名输入框。
// 这版在输入框下面多了一个登录 / 退出登录按钮 —— 登录本身发生在浏览器里，
// 这里只负责发起、等待和落地。邮箱绑定不在这里，属于协作模块自己的事。

export function UserInfoPopup({ open, onClose }: UserInfoPopupProps) {
  const {
    user, isLoggedIn, loginPending, beginBrowserLogin, reopenLoginTab, cancelBrowserLogin, logout,
  } = useAuth();

  // 姓名是本地资料，登录后默认跟随账号名；每次打开重新取一次，免得切换演示账号后
  // 还留着上一个人的名字。
  const [name, setName] = useState('');
  useEffect(() => {
    if (open) setName(user?.name ?? CURRENT_USER.name);
  }, [open, user?.name]);

  const contact = user?.phone ?? user?.email ?? '';

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      {/* Radix 打开时会自动聚焦第一个可聚焦元素，且对 input 会顺手 select() ——
          弹窗一开姓名就整段反选，像是要被替换掉。这里不自动聚焦，用户点了才进编辑。 */}
      <DialogContent
        className="w-[300px] gap-0 p-0 sm:max-w-[300px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>用户名</DialogTitle>
        </DialogHeader>

        {/* 头像 */}
        <div className="flex justify-center mt-[30px]">
          <div className="w-20 h-20 rounded-[25%] overflow-hidden">
            <div className={`w-full h-full bg-gradient-to-br ${CURRENT_USER.avatarColor} flex items-center justify-center text-white text-[28px]`}>
              {CURRENT_USER.avatarInitial}
            </div>
          </div>
        </div>

        {/* 姓名 + 登录入口 —— 按钮用主按钮（黑底白字），和上面的白底描边输入框
            分得开；宽度也比输入框窄一档 */}
        <div className="flex flex-col items-stretch gap-4 p-5">
          <Input
            placeholder="输入您的姓名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-center"
            maxLength={30}
          />

          {isLoggedIn ? (
            <div className="flex flex-col items-center gap-1.5">
              <Button size="sm" className="px-8" onClick={logout}>退出登录</Button>
              {contact && (
                <div className="text-[11px] text-muted-foreground">账号：<span className="tabular-nums">{contact}</span></div>
              )}
            </div>
          ) : loginPending ? (
            <div className="flex flex-col items-center gap-1.5">
              <Button size="sm" className="px-6" disabled>
                <Loader2 className="animate-spin" />
                登录中…
              </Button>
              {/* 两个次要动作压到和「将在浏览器中打开登录页」同一档：11px 灰字。
                  原生 button 不继承字号，字号 / 字重必须写在按钮自己身上 */}
              <div className="flex items-center gap-3">
                <button
                  onClick={reopenLoginTab}
                  className="text-[11px] font-normal text-muted-foreground hover:text-foreground transition-colors"
                >
                  重新打开
                </button>
                <button
                  onClick={cancelBrowserLogin}
                  className="text-[11px] font-normal text-muted-foreground hover:text-foreground transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <Button size="sm" className="px-10" onClick={beginBrowserLogin}>登录</Button>
              <div className="text-[11px] text-muted-foreground">将在浏览器中打开登录页</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
