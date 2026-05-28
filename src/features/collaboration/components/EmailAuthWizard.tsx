import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Input, Button } from '@cherry-studio/ui';
import { Mail, Check, Loader2, ExternalLink, AlertCircle, ArrowLeft } from 'lucide-react';

// Provider detection
type Provider = 'gmail' | 'qq' | 'unsupported' | null;

function detectProvider(email: string): Provider {
  const lower = email.toLowerCase();
  if (lower.endsWith('@gmail.com')) return 'gmail';
  if (lower.endsWith('@qq.com')) return 'qq';
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'unsupported';
  return null;
}

// Step machine
type Step =
  | 'input-email'
  | 'gmail-oauth'           // fake OAuth modal
  | 'qq-step-1'             // guide to enable IMAP/SMTP
  | 'qq-step-2'             // paste auth code
  | 'qq-step-3'             // testing
  | 'done';

interface EmailAuthWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: (email: string) => void;
  // Constraint: provided email must not equal this value (for Agent email vs user email)
  forbidEmail?: string;
  // UI title context
  title?: string;
  description?: string;
}

export function EmailAuthWizard({
  open,
  onClose,
  onComplete,
  forbidEmail,
  title = '绑定邮箱',
  description = '绑定后即可收发协作消息',
}: EmailAuthWizardProps) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<Step>('input-email');
  const [authCode, setAuthCode] = useState('');
  const provider = detectProvider(email);

  const forbidden = !!forbidEmail && email.toLowerCase() === forbidEmail.toLowerCase();
  const validEmail = provider !== null && !forbidden;
  const canProceed = validEmail && provider !== 'unsupported';

  const handleClose = () => {
    setEmail('');
    setStep('input-email');
    setAuthCode('');
    onClose();
  };

  const handleNext = () => {
    if (provider === 'gmail') {
      setStep('gmail-oauth');
      // simulate OAuth: auto-advance after 1.5s
      setTimeout(() => {
        setStep('done');
      }, 1500);
    } else if (provider === 'qq') {
      setStep('qq-step-1');
    }
  };

  const handleSubmitAuthCode = () => {
    setStep('qq-step-3');
    setTimeout(() => setStep('done'), 1200);
  };

  const handleFinish = () => {
    onComplete(email);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Step: input email */}
        {step === 'input-email' && (
          <div className="space-y-3">
            <div>
              <label className="text-[12px] text-foreground/80 block mb-1.5">邮箱地址</label>
              <div className="relative">
                <Mail size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="user@gmail.com 或 user@qq.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-8 text-[12.5px]"
                />
              </div>
              <div className="mt-1.5 text-[11px] text-muted-foreground">
                第一阶段支持 Gmail 和 QQ 邮箱
              </div>
            </div>

            {forbidden && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-destructive/10 text-destructive text-[12px]">
                <AlertCircle size={13} strokeWidth={1.8} className="flex-shrink-0 mt-0.5" />
                <span>Agent 邮箱不能与你的用户邮箱相同</span>
              </div>
            )}

            {provider === 'unsupported' && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[12px]">
                <AlertCircle size={13} strokeWidth={1.8} className="flex-shrink-0 mt-0.5" />
                <span>暂不支持该邮箱服务商，敬请期待</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={handleClose}>取消</Button>
              <Button onClick={handleNext} disabled={!canProceed}>下一步</Button>
            </div>
          </div>
        )}

        {/* Step: Gmail OAuth fake window */}
        {step === 'gmail-oauth' && (
          <div className="py-6 space-y-4">
            <div className="rounded-lg border border-border bg-foreground/[0.02] p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-white border border-border flex items-center justify-center text-[11px] font-bold">
                  <span style={{ background: 'conic-gradient(from 0deg, #4285F4, #34A853, #FBBC05, #EA4335, #4285F4)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>G</span>
                </div>
                <span className="text-[12px] text-foreground/80">Google 账号登录</span>
              </div>
              <div className="text-[13px] text-foreground mb-1">允许 Cherry Studio 访问你的邮件？</div>
              <div className="text-[11px] text-muted-foreground mb-4">{email}</div>
              <div className="space-y-1.5 text-[11px] text-muted-foreground">
                <div>· 读取你的邮件</div>
                <div>· 代表你发送邮件</div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-[11px] text-primary">
                <Loader2 size={11} className="animate-spin" />
                <span>授权中…</span>
              </div>
            </div>
          </div>
        )}

        {/* Step: QQ step 1 — guide */}
        {step === 'qq-step-1' && (
          <div className="space-y-4">
            <Stepper current={1} total={3} />
            <div className="space-y-2">
              <div className="text-[13px] text-foreground">① 开通 IMAP/SMTP 服务</div>
              <div className="text-[12px] text-muted-foreground leading-relaxed">
                登录 <a href="#" className="text-primary underline">QQ 邮箱网页版</a>，依次点击：<br />
                <span className="font-mono text-foreground/80">设置 → 账户 → POP3/IMAP/SMTP 服务 → 开启</span><br />
                按提示完成密保验证后，系统会生成一个 16 位授权码。
              </div>
              <div className="mt-3 p-3 rounded-md border border-border bg-foreground/[0.02] text-[11px] text-muted-foreground flex items-start gap-2">
                <ExternalLink size={11} strokeWidth={1.8} className="flex-shrink-0 mt-0.5" />
                <span>需要在 QQ 邮箱网页版完成操作，完成后回到这里继续。</span>
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('input-email')}>
                <ArrowLeft size={13} className="mr-1" /> 上一步
              </Button>
              <Button onClick={() => setStep('qq-step-2')}>已开通，下一步</Button>
            </div>
          </div>
        )}

        {/* Step: QQ step 2 — auth code */}
        {step === 'qq-step-2' && (
          <div className="space-y-4">
            <Stepper current={2} total={3} />
            <div className="space-y-2">
              <div className="text-[13px] text-foreground">② 粘贴授权码</div>
              <div className="text-[12px] text-muted-foreground">
                把 QQ 邮箱给你的 16 位授权码粘贴到下方。SMTP 服务器信息会自动填入。
              </div>
            </div>
            <Input
              placeholder="例如：abcd efgh ijkl mnop"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              className="text-[12.5px] font-mono"
            />
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('qq-step-1')}>
                <ArrowLeft size={13} className="mr-1" /> 上一步
              </Button>
              <Button onClick={handleSubmitAuthCode} disabled={authCode.trim().length < 8}>
                提交
              </Button>
            </div>
          </div>
        )}

        {/* Step: QQ step 3 — testing */}
        {step === 'qq-step-3' && (
          <div className="space-y-4 py-4">
            <Stepper current={3} total={3} />
            <div className="flex items-center gap-2 text-[12px] text-foreground">
              <Loader2 size={13} className="animate-spin text-primary" />
              <span>正在验证 SMTP 连接…</span>
            </div>
          </div>
        )}

        {/* Step: done */}
        {step === 'done' && (
          <div className="py-4 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Check size={18} strokeWidth={2.4} />
            </div>
            <div className="text-[13px] text-foreground">{email} 绑定成功</div>
            <div className="text-[11px] text-muted-foreground">
              现在可以收发协作消息了
            </div>
            <Button onClick={handleFinish}>完成</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stepper({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => {
        const idx = i + 1;
        const isActive = idx === current;
        const isDone = idx < current;
        return (
          <div key={i} className="flex items-center gap-1.5">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                isActive ? 'bg-primary text-primary-foreground' : isDone ? 'bg-primary/30 text-primary' : 'bg-foreground/[0.08] text-muted-foreground'
              }`}
            >
              {idx}
            </div>
            {idx < total && <div className={`w-6 h-px ${isDone ? 'bg-primary/30' : 'bg-border'}`} />}
          </div>
        );
      })}
    </div>
  );
}
