import { useMemo, useState } from 'react';
import { X, ExternalLink, Code2, Eye } from 'lucide-react';
import { Dialog, DialogContent } from '@cherrystudio/ui/components/primitives/dialog';

interface HtmlArtifactDialogProps {
  open: boolean;
  onClose: () => void;
  fileName: string | null;
}

// Renders a mock HTML artifact preview. In production this would sandbox the
// authored HTML in an iframe; for the prototype we recognise a small set of
// known filenames and render a hand-crafted React preview (so the artifact
// stays interactive without needing a real iframe wiring).
export function HtmlArtifactDialog({ open, onClose, fileName }: HtmlArtifactDialogProps) {
  const [view, setView] = useState<'preview' | 'source'>('preview');

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-[680px] sm:!max-w-[680px] !w-[min(680px,90vw)] !h-[min(620px,86vh)] !rounded-2xl !p-0 !gap-0 !grid-cols-1 overflow-hidden border border-border/20 shadow-xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 h-12 border-b border-border/15 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-md flex items-center justify-center bg-orange-500/10 text-orange-600 dark:text-orange-400 flex-shrink-0">
              <Code2 size={13} strokeWidth={1.8} />
            </div>
            <span className="text-[13px] font-medium text-foreground truncate">{fileName ?? '附件'}</span>
            <span className="text-[10.5px] text-muted-foreground bg-foreground/[0.05] px-1.5 py-0.5 rounded flex-shrink-0">HTML 原型</span>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setView('preview')}
              className={`px-2 h-7 rounded-md text-[11.5px] inline-flex items-center gap-1 transition-colors ${
                view === 'preview' ? 'bg-foreground/[0.06] text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
              }`}
            >
              <Eye size={12} strokeWidth={1.8} />
              预览
            </button>
            <button
              onClick={() => setView('source')}
              className={`px-2 h-7 rounded-md text-[11.5px] inline-flex items-center gap-1 transition-colors ${
                view === 'source' ? 'bg-foreground/[0.06] text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
              }`}
            >
              <Code2 size={12} strokeWidth={1.8} />
              源码
            </button>
            <button
              title="在新窗口打开"
              className="w-7 h-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
            >
              <ExternalLink size={13} strokeWidth={1.8} />
            </button>
            <button
              onClick={onClose}
              aria-label="关闭"
              className="w-7 h-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-foreground/[0.015]">
          {view === 'preview' ? (
            <ArtifactPreview fileName={fileName ?? ''} />
          ) : (
            <ArtifactSource fileName={fileName ?? ''} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ArtifactPreview({ fileName }: { fileName: string }) {
  if (fileName.includes('工资计算器') || fileName.toLowerCase().includes('salary')) {
    return <SalaryCalculator />;
  }
  // Generic fallback for any other .html file.
  return (
    <div className="px-6 py-8">
      <div className="text-[13px] text-foreground/80 mb-3">{fileName}</div>
      <div className="text-[12px] text-muted-foreground leading-relaxed">
        这是一个 HTML 原型。生产环境下会沙箱化渲染作者上传的 HTML；当前预览仅展示文件元信息。
      </div>
    </div>
  );
}

function ArtifactSource({ fileName }: { fileName: string }) {
  return (
    <pre className="font-mono text-[11.5px] leading-relaxed text-foreground/80 px-5 py-4 whitespace-pre-wrap break-words">
{`<!-- ${fileName} -->
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>工资计算器</title>
    <style>
      body { font-family: system-ui; padding: 24px; max-width: 480px; }
      input { width: 100%; padding: 8px; }
      .row { display: flex; justify-content: space-between; }
    </style>
  </head>
  <body>
    <h2>员工薪资测算</h2>
    <label>城市</label>
    <select id="city">…</select>
    <label>税前月薪 (¥)</label>
    <input id="gross" type="number" />
    <button onclick="calc()">计算</button>
    <div id="out"></div>
    <script>
      const RATES = { '北京': {社保: 0.105, 公积金: 0.12, 起征点: 5000} };
      function calc() { /* … */ }
    </script>
  </body>
</html>`}
    </pre>
  );
}

// ===========================
// 工资计算器 — mock interactive preview
// ===========================

const CITY_CONFIG: Record<string, { social: number; fund: number; base: number; label: string }> = {
  beijing:  { social: 0.105, fund: 0.12, base: 5000, label: '北京' },
  shanghai: { social: 0.105, fund: 0.07, base: 5000, label: '上海' },
  shenzhen: { social: 0.080, fund: 0.05, base: 5000, label: '深圳' },
  hangzhou: { social: 0.103, fund: 0.10, base: 5000, label: '杭州' },
};

function SalaryCalculator() {
  const [city, setCity] = useState<keyof typeof CITY_CONFIG>('beijing');
  const [gross, setGross] = useState(20000);

  const result = useMemo(() => {
    const cfg = CITY_CONFIG[city];
    const socialDeduction = Math.round(gross * cfg.social);
    const fundDeduction = Math.round(gross * cfg.fund);
    const afterDeduction = gross - socialDeduction - fundDeduction;
    const taxable = Math.max(0, afterDeduction - cfg.base);
    const tax = Math.round(approximateMonthlyTax(taxable));
    const net = afterDeduction - tax;
    return { socialDeduction, fundDeduction, afterDeduction, taxable, tax, net };
  }, [city, gross]);

  return (
    <div className="px-6 py-6 max-w-[560px] mx-auto">
      <div className="text-[15px] font-semibold text-foreground mb-1">员工薪资测算</div>
      <div className="text-[11.5px] text-muted-foreground mb-5">
        基于 2026 个税规则估算，仅供参考。社保 / 公积金费率按各城市标准比例。
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-[11.5px] text-muted-foreground mb-1.5">城市</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value as keyof typeof CITY_CONFIG)}
            className="w-full h-9 px-2.5 rounded-md border border-border/60 bg-background text-[12.5px] text-foreground outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
          >
            {Object.entries(CITY_CONFIG).map(([key, c]) => (
              <option key={key} value={key}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11.5px] text-muted-foreground mb-1.5">税前月薪 (¥)</label>
          <input
            type="number"
            value={gross}
            min={0}
            onChange={(e) => setGross(Math.max(0, Number(e.target.value) || 0))}
            className="w-full h-9 px-2.5 rounded-md border border-border/60 bg-background text-[12.5px] text-foreground outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border/60 bg-background overflow-hidden">
        <Row label="税前月薪" value={`¥${gross.toLocaleString()}`} />
        <Row label="社保扣除" value={`-¥${result.socialDeduction.toLocaleString()}`} muted />
        <Row label="公积金扣除" value={`-¥${result.fundDeduction.toLocaleString()}`} muted />
        <Row label="个税扣除" value={`-¥${result.tax.toLocaleString()}`} muted />
        <div className="border-t border-border/40" />
        <Row label="税后到手" value={`¥${result.net.toLocaleString()}`} emphasize />
      </div>

      <div className="mt-4 text-[10.5px] text-muted-foreground leading-relaxed">
        起征点 ¥{CITY_CONFIG[city].base.toLocaleString()} · 应纳税所得额 ¥{result.taxable.toLocaleString()}
      </div>
    </div>
  );
}

function Row({ label, value, muted, emphasize }: { label: string; value: string; muted?: boolean; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between px-3.5 py-2">
      <span className={`text-[12.5px] ${muted ? 'text-muted-foreground' : 'text-foreground/85'}`}>{label}</span>
      <span className={`tabular-nums ${emphasize ? 'text-[14px] font-semibold text-foreground' : muted ? 'text-[12.5px] text-muted-foreground' : 'text-[12.5px] text-foreground/85'}`}>{value}</span>
    </div>
  );
}

// 2026 月度累进个税近似 (按月度简化版)
function approximateMonthlyTax(taxable: number): number {
  const brackets: { upTo: number; rate: number; sub: number }[] = [
    { upTo: 3000,    rate: 0.03, sub: 0 },
    { upTo: 12000,   rate: 0.10, sub: 210 },
    { upTo: 25000,   rate: 0.20, sub: 1410 },
    { upTo: 35000,   rate: 0.25, sub: 2660 },
    { upTo: 55000,   rate: 0.30, sub: 4410 },
    { upTo: 80000,   rate: 0.35, sub: 7160 },
    { upTo: Infinity, rate: 0.45, sub: 15160 },
  ];
  const b = brackets.find(b => taxable <= b.upTo)!;
  return Math.max(0, taxable * b.rate - b.sub);
}
