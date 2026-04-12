import React, { useState } from "react"
import { DatePicker, DateRangePicker, Button } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import type { DateRange } from "react-day-picker"
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"

export function DatePickerDemo() {
  const [date, setDate] = useState<Date | undefined>()
  const [range, setRange] = useState<DateRange | undefined>()
  const [presetRange, setPresetRange] = useState<DateRange | undefined>()

  return (
    <>
      <Section
        title="DatePicker"
        install="npx shadcn@latest add date-picker"
        props={[
          { name: "date", type: "Date | undefined", description: "Currently selected date" },
          { name: "onDateChange", type: "(date: Date | undefined) => void", description: "Callback when date changes" },
          { name: "placeholder", type: "string", default: '"Pick a date"', description: "Placeholder text when no date is selected" },
          { name: "disabled", type: "boolean", default: "false", description: "Disable the picker" },
          { name: "formatStr", type: "string", default: '"PPP"', description: "date-fns format string for display" },
        ] satisfies PropDef[]}
        code={`import { DatePicker } from "@cherry-studio/ui"

const [date, setDate] = useState<Date | undefined>()

<DatePicker date={date} onDateChange={setDate} />
<DatePicker date={date} onDateChange={setDate} placeholder="Select birthday" />
<DatePicker disabled />`}
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">Default</p>
            <DatePicker date={date} onDateChange={setDate} />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">Custom placeholder</p>
            <DatePicker date={date} onDateChange={setDate} placeholder="Select birthday" />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">Disabled</p>
            <DatePicker disabled />
          </div>
        </div>
      </Section>

      <Section
        title="DateRangePicker"
        code={`import { DateRangePicker } from "@cherry-studio/ui"
import type { DateRange } from "react-day-picker"

const [range, setRange] = useState<DateRange | undefined>()

<DateRangePicker dateRange={range} onDateRangeChange={setRange} numberOfMonths={2} />`}
      >
        <div className="space-y-1.5">
          <p className="text-sm text-muted-foreground">Range with 2 months</p>
          <DateRangePicker dateRange={range} onDateRangeChange={setRange} numberOfMonths={2} />
        </div>
      </Section>

      <Section
        title="Practical: Preset Ranges"
        code={`const today = new Date()
const thisWeek = { from: startOfWeek(today, { weekStartsOn: 1 }), to: endOfWeek(today, { weekStartsOn: 1 }) }
const thisMonth = { from: startOfMonth(today), to: endOfMonth(today) }

<Button variant="outline" size="sm" onClick={() => setRange(thisWeek)}>This Week</Button>
<Button variant="outline" size="sm" onClick={() => setRange(thisMonth)}>This Month</Button>
<DateRangePicker dateRange={range} onDateRangeChange={setRange} />`}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date()
                setPresetRange({ from: startOfWeek(today, { weekStartsOn: 1 }), to: endOfWeek(today, { weekStartsOn: 1 }) })
              }}
            >
              This Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date()
                setPresetRange({ from: startOfMonth(today), to: endOfMonth(today) })
              }}
            >
              This Month
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setPresetRange(undefined)}>
              Clear
            </Button>
          </div>
          <DateRangePicker dateRange={presetRange} onDateRangeChange={setPresetRange} numberOfMonths={2} />
        </div>
      </Section>
    </>
  )
}
