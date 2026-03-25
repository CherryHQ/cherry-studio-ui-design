import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

/**
 * Isolation wrapper that strips Figma runtime props (_fgT, _fgS, _fgB, etc.)
 * before they reach native DOM elements via Radix Slot's prop merging.
 */
const TriggerSlot = React.forwardRef<HTMLDivElement, Record<string, unknown>>(
  (props, ref) => {
    const cleaned: Record<string, unknown> = {};
    for (const key of Object.keys(props)) {
      if (!key.startsWith('_fg')) {
        cleaned[key] = props[key];
      }
    }
    return <div ref={ref} className="contents" {...cleaned} />;
  }
);
TriggerSlot.displayName = 'TriggerSlot';

export function Tooltip({ children, content, side = 'right' }: { children: React.ReactNode; content: string; side?: 'right' | 'top' | 'bottom' | 'left' }) {
  if (!content) {
    return <div className="contents">{children}</div>;
  }

  return (
    <TooltipPrimitive.Provider delayDuration={400}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <TriggerSlot>{children}</TriggerSlot>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={8}
            className="z-[9999] bg-popover text-popover-foreground text-[10px] px-2.5 py-1.5 rounded-lg border border-border/50 shadow-lg select-none animate-in fade-in zoom-in-95 duration-150 max-w-[240px] leading-relaxed"
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}