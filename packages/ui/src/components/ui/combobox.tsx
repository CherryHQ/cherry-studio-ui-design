"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Badge } from "./badge"
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "./command"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

export interface ComboboxOption {
  value: string
  label: string
  disabled?: boolean
}

export interface ComboboxProps {
  options: ComboboxOption[]
  /** Single select value */
  value?: string
  onValueChange?: (value: string) => void
  /** Multi select values */
  values?: string[]
  onValuesChange?: (values: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
}

const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  ({
    options, value, onValueChange, values, onValuesChange,
    placeholder = "Select...", searchPlaceholder = "Search...",
    emptyMessage = "No results found.", disabled, className,
  }, ref) => {
    const [open, setOpen] = React.useState(false)
    const isMulti = !!onValuesChange

    const selected = isMulti
      ? options.filter((o) => values?.includes(o.value))
      : options.find((o) => o.value === value)

    const handleSelect = (val: string) => {
      if (isMulti) {
        const next = values?.includes(val)
          ? (values || []).filter((v) => v !== val)
          : [...(values || []), val]
        onValuesChange?.(next)
      } else {
        onValueChange?.(val === value ? "" : val)
        setOpen(false)
      }
    }

    const triggerLabel = isMulti
      ? (selected as ComboboxOption[]).length > 0
        ? (selected as ComboboxOption[]).map((s) => (
            <Badge key={s.value} variant="secondary" className="text-xs mr-1">{s.label}</Badge>
          ))
        : <span className="text-muted-foreground">{placeholder}</span>
      : (selected as ComboboxOption | undefined)?.label || <span className="text-muted-foreground">{placeholder}</span>

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn("w-full justify-between font-normal h-10", className)}
          >
            <span className="flex flex-wrap items-center gap-0.5 truncate">{triggerLabel}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    onSelect={() => handleSelect(opt.value)}
                  >
                    <Check className={cn(
                      "mr-2 h-4 w-4",
                      (isMulti ? values?.includes(opt.value) : value === opt.value)
                        ? "opacity-100" : "opacity-0"
                    )} />
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }
)
Combobox.displayName = "Combobox"

export { Combobox }
