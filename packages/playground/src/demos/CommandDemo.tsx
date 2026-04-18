import React, { useState } from "react"
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem,
  CommandList, CommandSeparator, CommandShortcut, Badge, Button,
  Dialog, DialogContent, DialogTitle, Kbd
} from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import {
  Calculator, Calendar, CreditCard, Settings, Smile, User,
  FileText, MessageSquare, Search, Moon, LogOut, Plus,
  Bot, BookOpen, Palette
} from "lucide-react"

export function CommandDemo() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  return (
    <>
      <Section title="Inline Command Palette" install="npx shadcn@latest add command" props={[
        { name: "value", type: "string", description: "Controlled selected value" },
        { name: "onValueChange", type: "(value) => void", description: "Selection handler" },
      ]} code={`import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@cherry-studio/ui"

<Command className="rounded-[24px] border shadow-popover">
  <CommandInput placeholder="Type a command..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem>Calendar</CommandItem>
      <CommandItem>Calculator</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>`}>
        <Command className="rounded-[24px] border shadow-popover max-w-lg">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem><Calendar className="mr-2 h-4 w-4" /> Calendar<CommandShortcut>⌘C</CommandShortcut></CommandItem>
              <CommandItem><Smile className="mr-2 h-4 w-4" /> Search Emoji<CommandShortcut>⌘E</CommandShortcut></CommandItem>
              <CommandItem><Calculator className="mr-2 h-4 w-4" /> Calculator<CommandShortcut>⌘K</CommandShortcut></CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem><User className="mr-2 h-4 w-4" /> Profile<CommandShortcut>⌘P</CommandShortcut></CommandItem>
              <CommandItem><CreditCard className="mr-2 h-4 w-4" /> Billing<CommandShortcut>⌘B</CommandShortcut></CommandItem>
              <CommandItem><Settings className="mr-2 h-4 w-4" /> Settings<CommandShortcut>⌘,</CommandShortcut></CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </Section>

      <Section title="Command Dialog (⌘K Style)">
        <div className="space-y-3">
          <Button variant="outline" className="w-full max-w-lg justify-between text-muted-foreground" onClick={() => setOpen(true)}>
            <span className="flex items-center"><Search className="mr-2 h-4 w-4" /> Search commands...</span>
            <Kbd className="pointer-events-none select-none gap-1 font-mono">
              <span className="text-xs">⌘</span>K
            </Kbd>
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="p-0 overflow-hidden max-w-lg">
              <DialogTitle className="sr-only">Command Palette</DialogTitle>
              <Command>
                <CommandInput placeholder="What are you looking for?" />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Quick Actions">
                    <CommandItem onSelect={() => setOpen(false)}><Plus className="mr-2 h-4 w-4" /> New Conversation<CommandShortcut>⌘N</CommandShortcut></CommandItem>
                    <CommandItem onSelect={() => setOpen(false)}><Bot className="mr-2 h-4 w-4" /> New Agent<CommandShortcut>⌘⇧A</CommandShortcut></CommandItem>
                    <CommandItem onSelect={() => setOpen(false)}><BookOpen className="mr-2 h-4 w-4" /> Knowledge Base</CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup heading="Navigation">
                    <CommandItem onSelect={() => setOpen(false)}><MessageSquare className="mr-2 h-4 w-4" /> Chat</CommandItem>
                    <CommandItem onSelect={() => setOpen(false)}><FileText className="mr-2 h-4 w-4" /> Files</CommandItem>
                    <CommandItem onSelect={() => setOpen(false)}><Settings className="mr-2 h-4 w-4" /> Settings<CommandShortcut>⌘,</CommandShortcut></CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup heading="Appearance">
                    <CommandItem onSelect={() => setOpen(false)}><Moon className="mr-2 h-4 w-4" /> Toggle Dark Mode<CommandShortcut>⌘D</CommandShortcut></CommandItem>
                    <CommandItem onSelect={() => setOpen(false)}><Palette className="mr-2 h-4 w-4" /> Change Theme</CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup heading="Account">
                    <CommandItem onSelect={() => setOpen(false)}><User className="mr-2 h-4 w-4" /> Profile</CommandItem>
                    <CommandItem onSelect={() => setOpen(false)} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </DialogContent>
          </Dialog>
        </div>
      </Section>

      <Section title="With Selection Feedback">
        <Command className="rounded-[24px] border shadow-popover max-w-lg">
          <CommandInput placeholder="Select a model..." />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup heading="OpenAI">
              <CommandItem value="gpt-4o" onSelect={setValue}>
                <Bot className="mr-2 h-4 w-4" />
                GPT-4o
                {value === "gpt-4o" && <Badge className="ml-auto" variant="secondary">Selected</Badge>}
              </CommandItem>
              <CommandItem value="gpt-4o-mini" onSelect={setValue}>
                <Bot className="mr-2 h-4 w-4" />
                GPT-4o Mini
                {value === "gpt-4o-mini" && <Badge className="ml-auto" variant="secondary">Selected</Badge>}
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Anthropic">
              <CommandItem value="claude-sonnet" onSelect={setValue}>
                <Bot className="mr-2 h-4 w-4" />
                Claude Sonnet 4
                {value === "claude-sonnet" && <Badge className="ml-auto" variant="secondary">Selected</Badge>}
              </CommandItem>
              <CommandItem value="claude-opus" onSelect={setValue}>
                <Bot className="mr-2 h-4 w-4" />
                Claude Opus 4
                {value === "claude-opus" && <Badge className="ml-auto" variant="secondary">Selected</Badge>}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
        {value && <p className="mt-3 text-sm text-muted-foreground">Selected: <span className="text-foreground font-medium">{value}</span></p>}
      </Section>
    </>
  )
}
