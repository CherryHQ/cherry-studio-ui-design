import React from 'react';
import { SimpleTooltip } from '@cherry-studio/ui';

/**
 * Isolation wrapper that strips Figma runtime props (_fgT, _fgS, _fgB, etc.)
 * before they reach native DOM elements via Radix Slot's prop merging.
 */
const FigmaClean = React.forwardRef<HTMLDivElement, Record<string, unknown>>(
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
FigmaClean.displayName = 'FigmaClean';

export function Tooltip({ children, content, side = 'right' }: { children: React.ReactNode; content: string; side?: 'right' | 'top' | 'bottom' | 'left' }) {
  if (!content) {
    return <div className="contents">{children}</div>;
  }

  return (
    <SimpleTooltip content={content} side={side} sideOffset={8} delayDuration={400}>
      <FigmaClean>{children}</FigmaClean>
    </SimpleTooltip>
  );
}
