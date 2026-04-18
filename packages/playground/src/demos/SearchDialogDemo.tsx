import React, { useState } from "react"
import {
  Dialog, DialogContent, DialogTitle,
  Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator,
  Button, Badge, Kbd
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import {
  Search, MessageSquare, FileText, Settings, Zap,
  Bot, FolderOpen, Palette, Keyboard, ArrowRight
} from "lucide-react"

const searchResults = {
  assistants: [
    { id: "general", label: "General Assistant", icon: <Bot className="size-4" /> },
    { id: "coder", label: "Code Expert", icon: <Bot className="size-4" /> },
    { id: "writer", label: "Creative Writer", icon: <Bot className="size-4" /> },
  ],
  files: [
    { id: "readme", label: "README.md", path: "~/projects/cherry-studio", icon: <FileText className="size-4" /> },
    { id: "config", label: "cherry.config.ts", path: "~/projects/cherry-studio", icon: <FileText className="size-4" /> },
  ],
  actions: [
    { id: "new-chat", label: "New Chat", shortcut: "⌘N", icon: <MessageSquare className="size-4" /> },
    { id: "settings", label: "Open Settings", shortcut: "⌘,", icon: <Settings className="size-4" /> },
    { id: "theme", label: "Toggle Theme", shortcut: "⌘⇧D", icon: <Palette className="size-4" /> },
    { id: "shortcuts", label: "Keyboard Shortcuts", shortcut: "⌘K ⌘S", icon: <Keyboard className="size-4" /> },
  ],
}

export function SearchDialogDemo() {
  const [open, setOpen] = useState(false)

  return (
    <Section title="Search Dialog (⌘K Pattern)" props={[
        { name: "open", type: "boolean", default: "false", description: "Whether the search dialog is open" },
        { name: "onOpenChange", type: "(open: boolean) => void", default: "undefined", description: "Callback when dialog open state changes" },
        { name: "placeholder", type: "string", default: '"Search..."', description: "Placeholder text for the search input" },
      ]} code={`import { Dialog, DialogContent, Command, CommandInput, CommandList, CommandGroup, CommandItem } from "@cherry-studio/ui"

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="p-0 max-w-lg">
    <Command>
      <CommandInput placeholder="Search assistants, files, actions..." />
      <CommandList>
        <CommandGroup heading="Assistants">
          <CommandItem>General Assistant</CommandItem>
        </CommandGroup>
        <CommandGroup heading="Actions">
          <CommandItem>New Chat</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  </DialogContent>
</Dialog>`}>
      <div className="space-y-3">
        <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
          <Search className="size-4" />
          Search anything...
          <Kbd className="ml-4">⌘K</Kbd>
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="p-0 max-w-lg gap-0 overflow-hidden">
            <DialogTitle className="sr-only">Search</DialogTitle>
            <Command className="rounded-none border-0">
              <div className="flex items-center border-b px-3">
                <Search className="size-4 text-muted-foreground shrink-0 mr-2" />
                <CommandInput placeholder="Search assistants, files, actions..." className="border-0 focus:ring-0" />
              </div>
              <CommandList className="max-h-80">
                <CommandEmpty>
                  <div className="py-6 text-center">
                    <Search className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No results found</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Try different keywords</p>
                  </div>
                </CommandEmpty>

                <CommandGroup heading="Assistants">
                  {searchResults.assistants.map((item) => (
                    <CommandItem key={item.id} className="gap-2" onSelect={() => setOpen(false)}>
                      {item.icon}
                      <span>{item.label}</span>
                      <ArrowRight className="size-3 text-muted-foreground/30 ml-auto" />
                    </CommandItem>
                  ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Recent Files">
                  {searchResults.files.map((item) => (
                    <CommandItem key={item.id} className="gap-2" onSelect={() => setOpen(false)}>
                      {item.icon}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm">{item.label}</div>
                        <div className="text-[10px] text-muted-foreground/50 truncate">{item.path}</div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Quick Actions">
                  {searchResults.actions.map((item) => (
                    <CommandItem key={item.id} className="gap-2" onSelect={() => setOpen(false)}>
                      {item.icon}
                      <span className="flex-1">{item.label}</span>
                      <Badge variant="outline" className="text-xs font-mono px-1.5 py-0">{item.shortcut}</Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>

              <div className="flex items-center gap-3 border-t px-3 py-2 text-[10px] text-muted-foreground/50">
                <span className="flex items-center gap-1"><Kbd>↑↓</Kbd> Navigate</span>
                <span className="flex items-center gap-1"><Kbd>↵</Kbd> Select</span>
                <span className="flex items-center gap-1"><Kbd>Esc</Kbd> Close</span>
              </div>
            </Command>
          </DialogContent>
        </Dialog>
      </div>
    </Section>
  )
}
