import React from "react"

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-medium text-foreground/80">{title}</h3>
      <div className="rounded-xl border border-border bg-card p-6">{children}</div>
    </section>
  )
}
