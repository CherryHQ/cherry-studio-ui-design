import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Input, Textarea, Button } from '@cherry-studio/ui';
import { Mail } from 'lucide-react';

interface AddFriendDialogProps {
  open: boolean;
  onClose: () => void;
}

// Dialog assumes the user has already bound their own email — the call site is
// responsible for routing un-bound users to the bind flow first. This keeps the
// dialog focused on a single action (entering the OTHER person's email).
export function AddFriendDialog({ open, onClose }: AddFriendDialogProps) {
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSend = () => {
    setSent(true);
  };

  const handleClose = () => {
    setEmail('');
    setNote('');
    setSent(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>添加好友</DialogTitle>
          <DialogDescription>
            输入对方的邮箱，发送好友请求。
          </DialogDescription>
        </DialogHeader>

        {!sent ? (
          <div className="space-y-3">
            <div>
              <label className="text-[12px] text-foreground/80 block mb-1.5">对方邮箱地址</label>
              <div className="relative">
                <Mail size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="friend@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-8 text-[12.5px]"
                />
              </div>
            </div>
            <div>
              <label className="text-[12px] text-foreground/80 block mb-1.5">附言（可选）</label>
              <Textarea
                placeholder="向对方介绍下自己…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="text-[12.5px] resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={handleClose}>取消</Button>
              <Button onClick={handleSend} disabled={!valid}>
                发送请求
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center">
              ✓
            </div>
            <div className="text-[13px] text-foreground">好友请求已发送至 {email}</div>
            <div className="text-[11px] text-muted-foreground">对方接受后，将出现在你的通讯录里</div>
            <Button onClick={handleClose}>完成</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
