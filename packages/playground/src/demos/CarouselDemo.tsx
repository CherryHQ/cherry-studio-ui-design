import React from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, Card, CardContent } from "@cherry-studio/ui"
import { Section } from "../components/Section"

export function CarouselDemo() {
  return (
    <Section title="Carousel">
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
  )
}
