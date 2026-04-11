import React, { useState } from "react"
import { Calendar } from "@cherry-studio/ui"
import { Section } from "../components/Section"

export function CalendarDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  return (
    <Section title="Calendar">
      <div className="flex gap-8 items-start flex-wrap">
        <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
        <div className="text-sm text-muted-foreground">
          Selected: <span className="text-foreground font-medium">{date?.toLocaleDateString("zh-CN") ?? "None"}</span>
        </div>
      </div>
    </Section>
  )
}
