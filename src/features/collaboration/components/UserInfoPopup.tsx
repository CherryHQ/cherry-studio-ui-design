import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Button } from '@cherry-studio/ui';
import { Mail, Check, AlertCircle } from 'lucide-react';
import { EmailAuthWizard } from './EmailAuthWizard';
import { CURRENT_USER } from '../data';

interface UserInfoPopupProps {
  open: boolean;
  onClose: () => void;
  // External controlled email state
  boundEmail: string | null;
  onBindEmail: (email: string) => void;
  onUnbind: () => void;
  // When user enters this popup explicitly to bind email
  initiallyOpenWizard?: boolean;
}

export function UserInfoPopup({
  open, onClose, boundEmail, onBindEmail, onUnbind, initiallyOpenWizard,
}: UserInfoPopupProps) {
  const [wizardOpen, setWizardOpen] = useState(initiallyOpenWizard ?? false);

  return (
    <>
      <Dialog open={open && !wizardOpen} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-[460px]">
          <DialogHeader>
            <DialogTitle>个人信息</DialogTitle>
            <DialogDescription>账号资料与邮箱授权</DialogDescription>
          </DialogHeader>

          {/* Identity */}
          <div className="flex items-center gap-3 px-1 py-1">
            <div className="w-12 h-12 rounded-full overflow-hidden ring-1 ring-border flex-shrink-0">
              <div className={`w-full h-full bg-gradient-to-br ${CURRENT_USER.avatarColor} flex items-center justify-center text-white text-[16px]`}>
                {CURRENT_USER.avatarInitial}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] text-foreground">{CURRENT_USER.name}</div>
              <div className="text-[11px] text-muted-foreground truncate">{CURRENT_USER.email}</div>
            </div>
          </div>

          {/* Email auth section */}
          <div className="rounded-lg border border-border p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[12px] text-foreground/80">
              <Mail size={13} strokeWidth={1.6} />
              <span>协作邮箱授权</span>
            </div>
            <div className="text-[11px] text-muted-foreground leading-relaxed">
              Cherry Studio 通过 SMTP 协议在你的邮箱之间收发协作消息。绑定后即可使用协作模块。
            </div>

            {boundEmail ? (
              <div className="flex items-center justify-between mt-2 px-2.5 py-2 rounded-md bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                    <Check size={11} strokeWidth={2.4} />
                  </div>
                  <div>
                    <div className="text-[12px] text-foreground">{boundEmail}</div>
                    <div className="text-[10px] text-muted-foreground">已绑定</div>
                  </div>
                </div>
                <button
                  onClick={onUnbind}
                  className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                >
                  解绑
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-2 px-2.5 py-2 rounded-md bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <AlertCircle size={13} strokeWidth={1.8} />
                  <span className="text-[12px]">尚未绑定</span>
                </div>
                <Button size="sm" onClick={() => setWizardOpen(true)}>
                  立即绑定
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <Button variant="outline" onClick={onClose}>关闭</Button>
          </div>
        </DialogContent>
      </Dialog>

      <EmailAuthWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onComplete={(email) => {
          onBindEmail(email);
          setWizardOpen(false);
        }}
      />
    </>
  );
}
