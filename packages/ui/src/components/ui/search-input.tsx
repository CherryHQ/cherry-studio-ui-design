"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { cn } from "../../lib/utils"

interface SearchInputProps extends Omit<React.ComponentProps<"input">, "type" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  /** @default 11 */
  iconSize?: number;
  /** Show clear button when value is non-empty. @default true */
  clearable?: boolean;
  /** Wrapper className */
  wrapperClassName?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      value,
      onChange,
      iconSize = 11,
      clearable = true,
      placeholder,
      className,
      wrapperClassName,
      ...props
    },
    ref,
  ) {
    return (
      <div
        data-slot="search-input"
        className={cn(
          "flex items-center gap-1.5 px-2 py-[5px] rounded-lg bg-accent/15 border border-border/15",
          wrapperClassName,
        )}
      >
        <Search
          size={iconSize}
          className="text-muted-foreground/40 flex-shrink-0"
        />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "flex-1 min-w-0 h-auto bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 border-none shadow-none outline-none focus-visible:ring-0 p-0",
            className,
          )}
          {...props}
        />
        {clearable && value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-muted-foreground/40 hover:text-muted-foreground flex-shrink-0 transition-colors"
          >
            <X size={iconSize} />
          </button>
        )}
      </div>
    )
  },
)

export { SearchInput }
export type { SearchInputProps }
