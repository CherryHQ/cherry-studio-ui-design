import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@cherry-studio/ui"
import { Section } from "../components/Section"

export function AvatarDemo() {
  return (
    <Section title="Avatar">
      <div className="flex gap-4 items-center">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="user" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <Avatar className="h-14 w-14">
          <AvatarFallback className="text-lg">🍒</AvatarFallback>
        </Avatar>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">SM</AvatarFallback>
        </Avatar>
      </div>
    </Section>
  )
}
