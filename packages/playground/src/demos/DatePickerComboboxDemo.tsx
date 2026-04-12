import React, { useState } from "react"
import {
  Button, Calendar, Popover, PopoverContent, PopoverTrigger,
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
  Badge
} from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { CalendarIcon, Check, ChevronsUpDown, Bot } from "lucide-react"
import type { DateRange } from "react-day-picker"

/* ─── DatePicker ─── */

function DatePicker() {
  const [date, setDate] = useState<Date | undefined>()
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-60 justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? date.toLocaleDateString("zh-CN") : <span className="text-muted-foreground">Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={(d) => { setDate(d); setOpen(false) }} />
      </PopoverContent>
    </Popover>
  )
}

function DateRangePicker() {
  const [range, setRange] = useState<DateRange | undefined>()
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-75 justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {range?.from ? (
            range.to ? (
              <>{range.from.toLocaleDateString("zh-CN")} — {range.to.toLocaleDateString("zh-CN")}</>
            ) : range.from.toLocaleDateString("zh-CN")
          ) : <span className="text-muted-foreground">Pick a date range</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={2} />
      </PopoverContent>
    </Popover>
  )
}

/* ─── Combobox ─── */

const models = [
  { value: "gpt-4o", label: "GPT-4o", provider: "OpenAI" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini", provider: "OpenAI" },
  { value: "claude-opus", label: "Claude Opus 4", provider: "Anthropic" },
  { value: "claude-sonnet", label: "Claude Sonnet 4", provider: "Anthropic" },
  { value: "gemini-pro", label: "Gemini 2.5 Pro", provider: "Google" },
  { value: "gemini-flash", label: "Gemini 2.5 Flash", provider: "Google" },
  { value: "deepseek-v3", label: "DeepSeek V3", provider: "DeepSeek" },
  { value: "qwen-3", label: "Qwen 3", provider: "Alibaba" },
]

function Combobox() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const selected = models.find((m) => m.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-60 justify-between font-normal">
          {selected ? (
            <span className="flex items-center gap-2">
              <Bot className="h-3.5 w-3.5" /> {selected.label}
            </span>
          ) : <span className="text-muted-foreground">Select model...</span>}
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Search model..." />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            {["OpenAI", "Anthropic", "Google", "DeepSeek", "Alibaba"].map((provider) => {
              const providerModels = models.filter((m) => m.provider === provider)
              if (providerModels.length === 0) return null
              return (
                <CommandGroup key={provider} heading={provider}>
                  {providerModels.map((model) => (
                    <CommandItem key={model.value} value={model.value} onSelect={(v) => { setValue(v === value ? "" : v); setOpen(false) }}>
                      <Check className={`mr-2 h-3.5 w-3.5 ${value === model.value ? "opacity-100" : "opacity-0"}`} />
                      {model.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function MultiCombobox() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>(["gpt-4o"])

  const toggle = (val: string) => {
    setSelected((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    )
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-75 justify-between font-normal h-auto min-h-9">
            {selected.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selected.map((v) => (
                  <Badge key={v} variant="secondary" className="text-[10px]">
                    {models.find((m) => m.value === v)?.label}
                  </Badge>
                ))}
              </div>
            ) : <span className="text-muted-foreground">Select models...</span>}
            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput placeholder="Search model..." />
            <CommandList>
              <CommandEmpty>No model found.</CommandEmpty>
              {models.map((model) => (
                <CommandItem key={model.value} value={model.value} onSelect={() => toggle(model.value)}>
                  <Check className={`mr-2 h-3.5 w-3.5 ${selected.includes(model.value) ? "opacity-100" : "opacity-0"}`} />
                  {model.label}
                  <span className="ml-auto text-[10px] text-muted-foreground">{model.provider}</span>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

/* ─── Demo ─── */

const datePickerProps: PropDef[] = [
  { name: "date", type: "Date", default: "undefined", description: "Selected date" },
  { name: "onDateChange", type: "(date: Date) => void", default: "undefined", description: "Date change handler" },
]

export function DatePickerComboboxDemo() {
  return (
    <>
      <Section title="DatePicker (Popover + Calendar)" install="npm install @cherry-studio/ui" props={datePickerProps} code={`import { Button, Calendar, Popover, PopoverContent, PopoverTrigger } from "@cherry-studio/ui"

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Pick a date</Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0">
    <Calendar mode="single" selected={date} onSelect={setDate} />
  </PopoverContent>
</Popover>`}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">Single Date</p>
            <DatePicker />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">Date Range (2 months)</p>
            <DateRangePicker />
          </div>
        </div>
      </Section>

      <Section title="Combobox (Popover + Command)">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">Single Select</p>
            <Combobox />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">Multi Select</p>
            <MultiCombobox />
          </div>
        </div>
      </Section>
    </>
  )
}
