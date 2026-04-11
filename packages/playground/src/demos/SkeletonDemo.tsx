import React from "react"
import { Skeleton } from "@cherry-studio/ui"
import { Section } from "../components/Section"

export function SkeletonDemo() {
  return (
    <Section title="Skeleton">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[80%]" />
          <Skeleton className="h-4 w-[60%]" />
        </div>
        <Skeleton className="h-[125px] w-full rounded-xl" />
      </div>
    </Section>
  )
}
