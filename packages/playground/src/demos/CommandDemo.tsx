import React from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Calculator, Calendar, CreditCard, Settings, Smile, User } from "lucide-react"

export function CommandDemo() {
  return (
    <Section title="Command Palette">
      <Command className="rounded-lg border shadow-md max-w-lg">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem><Calendar className="mr-2 h-4 w-4" /> Calendar</CommandItem>
            <CommandItem><Smile className="mr-2 h-4 w-4" /> Search Emoji</CommandItem>
            <CommandItem><Calculator className="mr-2 h-4 w-4" /> Calculator</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem><User className="mr-2 h-4 w-4" /> Profile</CommandItem>
            <CommandItem><CreditCard className="mr-2 h-4 w-4" /> Billing</CommandItem>
            <CommandItem><Settings className="mr-2 h-4 w-4" /> Settings</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </Section>
  )
}
