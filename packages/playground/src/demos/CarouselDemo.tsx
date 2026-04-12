import React, { useState, useEffect, useCallback } from "react"
import {
  Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,
  Card, CardContent, Badge
} from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { type CarouselApi } from "@cherry-studio/ui"

export function CarouselDemo() {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!api) return
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())
    api.on("select", () => setCurrent(api.selectedScrollSnap()))
  }, [api])

  return (
    <>
      <Section title="Basic Carousel" install="npx shadcn@latest add carousel" props={[
        { name: "opts", type: "EmblaOptionsType", default: "{}", description: "Embla carousel options" },
        { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Carousel direction" },
        { name: "setApi", type: "(api) => void", default: "undefined", description: "Carousel API ref" },
      ]} code={`import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@cherry-studio/ui"

<Carousel>
  <CarouselContent>
    <CarouselItem>Slide 1</CarouselItem>
    <CarouselItem>Slide 2</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>`}>
        <div className="max-w-sm mx-auto">
          <Carousel>
            <CarouselContent>
              {Array.from({ length: 5 }).map((_, i) => (
                <CarouselItem key={i}>
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-6">
                      <span className="text-4xl font-semibold">{i + 1}</span>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </Section>

      <Section title="With Indicators">
        <div className="max-w-sm mx-auto space-y-4">
          <Carousel setApi={setApi}>
            <CarouselContent>
              {Array.from({ length: 5 }).map((_, i) => (
                <CarouselItem key={i}>
                  <Card>
                    <CardContent className="flex aspect-video items-center justify-center p-6 bg-gradient-to-br from-primary/5 to-primary/20">
                      <div className="text-center">
                        <span className="text-3xl font-semibold">Slide {i + 1}</span>
                        <p className="text-sm text-muted-foreground mt-1">of {count}</p>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
          <div className="flex justify-center gap-1.5">
            {Array.from({ length: count }).map((_, i) => (
              <button
                key={i}
                className={`h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                  i === current ? "w-6 bg-primary" : "w-2.5 bg-muted-foreground/30"
                }`}
                onClick={() => api?.scrollTo(i)}
              />
            ))}
          </div>
        </div>
      </Section>

      <Section title="Multiple Items Per View">
        <div className="max-w-2xl mx-auto">
          <Carousel opts={{ align: "start" }}>
            <CarouselContent className="-ml-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <CarouselItem key={i} className="pl-4 basis-1/3">
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-4">
                      <span className="text-2xl font-semibold">{i + 1}</span>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </Section>

      <Section title="Practical: Feature Cards">
        <div className="max-w-2xl mx-auto">
          <Carousel opts={{ align: "start" }}>
            <CarouselContent className="-ml-4">
              {[
                { emoji: "💬", title: "Smart Chat", desc: "Multi-model conversations with context awareness" },
                { emoji: "🤖", title: "AI Agents", desc: "Autonomous agents for complex task execution" },
                { emoji: "📚", title: "Knowledge Base", desc: "RAG-powered document retrieval and Q&A" },
                { emoji: "🎨", title: "Image Gen", desc: "Create images with DALL-E and Midjourney" },
                { emoji: "🔌", title: "Extensions", desc: "Extend with plugins and custom tools" },
              ].map((feature, i) => (
                <CarouselItem key={i} className="pl-4 basis-1/2">
                  <Card className="h-full">
                    <CardContent className="p-5 space-y-2">
                      <span className="text-2xl">{feature.emoji}</span>
                      <h4 className="font-semibold text-sm">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground">{feature.desc}</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </Section>

      <Section title="Vertical Orientation">
        <div className="max-w-xs mx-auto">
          <Carousel orientation="vertical" className="max-h-[300px]">
            <CarouselContent className="-mt-4 h-[300px]">
              {Array.from({ length: 5 }).map((_, i) => (
                <CarouselItem key={i} className="pt-4 basis-1/2">
                  <Card>
                    <CardContent className="flex items-center justify-center p-4">
                      <span className="text-xl font-semibold">Item {i + 1}</span>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </Section>
    </>
  )
}
