import React, { useState } from "react"
import { Calendar } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import type { DateRange } from "react-day-picker"

export function CalendarDemo() {
  const [singleDate, setSingleDate] = useState<Date | undefined>(new Date())
  const [multipleDates, setMultipleDates] = useState<Date[] | undefined>([
    new Date(),
    new Date(Date.now() + 2 * 86400000),
    new Date(Date.now() + 5 * 86400000),
  ])
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(Date.now() + 7 * 86400000),
  })

  const disabledDays = [
    { dayOfWeek: [0, 6] },
  ]

  return (
    <>
      <Section title="Single Date Selection" install="npx shadcn@latest add calendar" props={[
        { name: "mode", type: '"single" | "range" | "multiple"', description: "Selection mode" },
        { name: "selected", type: "Date | DateRange | Date[]", default: "undefined", description: "Selected date(s)" },
        { name: "onSelect", type: "(date) => void", default: "undefined", description: "Selection handler" },
      ]} code={`import { Calendar } from "@cherry-studio/ui"

const [date, setDate] = useState<Date | undefined>(new Date())

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  className="rounded-md border"
/>`}>
        <div className="flex gap-8 items-start flex-wrap">
          <Calendar
            mode="single"
            selected={singleDate}
            onSelect={setSingleDate}
            className="rounded-md border"
          />
          <div className="text-sm text-muted-foreground">
            Selected: <span className="text-foreground font-medium">
              {singleDate?.toLocaleDateString("zh-CN") ?? "None"}
            </span>
          </div>
        </div>
      </Section>

      <Section title="Date Range">
        <div className="flex gap-8 items-start flex-wrap">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
            className="rounded-md border"
          />
          <div className="text-sm text-muted-foreground space-y-1">
            <div>From: <span className="text-foreground font-medium">{dateRange?.from?.toLocaleDateString("zh-CN") ?? "—"}</span></div>
            <div>To: <span className="text-foreground font-medium">{dateRange?.to?.toLocaleDateString("zh-CN") ?? "—"}</span></div>
          </div>
        </div>
      </Section>

      <Section title="Multiple Dates">
        <div className="flex gap-8 items-start flex-wrap">
          <Calendar
            mode="multiple"
            selected={multipleDates}
            onSelect={setMultipleDates}
            className="rounded-md border"
          />
          <div className="text-sm text-muted-foreground">
            Selected: <span className="text-foreground font-medium">{multipleDates?.length ?? 0} dates</span>
          </div>
        </div>
      </Section>

      <Section title="Disabled Weekends">
        <Calendar
          mode="single"
          disabled={disabledDays}
          className="rounded-md border"
        />
      </Section>

      <Section title="With Dropdown Navigation">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          startMonth={new Date(2020, 0)}
          endMonth={new Date(2030, 11)}
          className="rounded-md border"
        />
      </Section>
    </>
  )
}
