import React, { useState, useEffect } from "react"
import { Skeleton, Button, Card, CardContent, CardHeader, Avatar, AvatarFallback } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

function LoadingCard({ loaded }: { loaded: boolean }) {
  if (!loaded) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader className="flex-row items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[60%]" />
            <Skeleton className="h-3 w-[40%]" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[70%]" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-20 rounded-[6px]" />
            <Skeleton className="h-8 w-20 rounded-[6px]" />
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="flex-row items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback>🍒</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="text-sm font-semibold">Cherry Studio</h4>
          <p className="text-xs text-muted-foreground">AI Development Environment</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">An AI-powered development environment for building smart applications with modern UI components.</p>
        <div className="flex gap-2 pt-2">
          <Button size="sm">Follow</Button>
          <Button size="sm" variant="outline">View</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function SkeletonDemo() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (loaded) {
      const timer = setTimeout(() => setLoaded(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [loaded])

  return (
    <>
      <Section title="Basic Shapes" install="npx shadcn@latest add skeleton" props={[
        { name: "className", type: "string", default: "undefined", description: "Sizing and shape via className" },
      ]} code={`import { Skeleton } from "@cherry-studio/ui"

<Skeleton className="h-12 w-12 rounded-full" />
<Skeleton className="h-4 w-64" />
<Skeleton className="h-[125px] w-full rounded-xl" />`}>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-50" />
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

      <Section title="Card Skeleton">
        <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-32 w-full rounded-[6px]" />
                <Skeleton className="h-4 w-[70%]" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-[85%]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="List Skeleton">
        <div className="max-w-md space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-[6px] flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-[60%]" />
                <Skeleton className="h-3 w-[80%]" />
              </div>
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Table Skeleton">
        <div className="max-w-lg space-y-2">
          <div className="flex gap-4 pb-2 border-b">
            <Skeleton className="h-4 w-[30%]" />
            <Skeleton className="h-4 w-[25%]" />
            <Skeleton className="h-4 w-[20%]" />
            <Skeleton className="h-4 w-[15%]" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 py-2">
              <Skeleton className="h-4 w-[30%]" />
              <Skeleton className="h-4 w-[25%]" />
              <Skeleton className="h-4 w-[20%]" />
              <Skeleton className="h-4 w-[15%]" />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Loading → Content Transition">
        <div className="space-y-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setLoaded(!loaded)}
          >
            {loaded ? "Reset to skeleton" : "Simulate load"}
          </Button>
          <LoadingCard loaded={loaded} />
        </div>
      </Section>
    </>
  )
}
