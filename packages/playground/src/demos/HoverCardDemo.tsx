import React from "react"
import { HoverCard, HoverCardContent, HoverCardTrigger, Avatar, AvatarFallback, AvatarImage, Button } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { CalendarDays } from "lucide-react"

export function HoverCardDemo() {
  return (
    <Section title="Hover Card">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="link" className="text-base">@cherry-studio</Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex justify-between space-x-4">
            <Avatar>
              <AvatarFallback>🍒</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Cherry Studio</h4>
              <p className="text-sm text-muted-foreground">An AI-powered development environment for building smart applications.</p>
              <div className="flex items-center pt-2">
                <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
                <span className="text-xs text-muted-foreground">Joined December 2024</span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </Section>
  )
}
