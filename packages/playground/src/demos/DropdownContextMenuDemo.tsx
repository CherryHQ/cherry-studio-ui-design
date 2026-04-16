import React from "react"
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { ChevronDown, User, Settings, LogOut, Plus, Trash2 } from "lucide-react"

export function DropdownContextMenuDemo() {
  return (
    <>
      <Section title="Dropdown Menu" install="npx shadcn@latest add dropdown-menu" props={[
        { name: "open", type: "boolean", default: "undefined", description: "Controlled open state" },
        { name: "onOpenChange", type: "(open) => void", default: "undefined", description: "Open change handler" },
      ]} code={`import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Button } from "@cherry-studio/ui"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuItem>Log out</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Open Menu <ChevronDown className="ml-2 h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem><User className="mr-2 h-4 w-4" /> Profile</DropdownMenuItem>
            <DropdownMenuItem><Settings className="mr-2 h-4 w-4" /> Settings</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger><Plus className="mr-2 h-4 w-4" /> New</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Document</DropdownMenuItem>
                <DropdownMenuItem>Spreadsheet</DropdownMenuItem>
                <DropdownMenuItem>Presentation</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive"><LogOut className="mr-2 h-4 w-4" /> Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Section>

      <Section title="Context Menu (right-click the area)">
        <ContextMenu>
          <ContextMenuTrigger className="flex h-[150px] w-full items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
            Right click here
          </ContextMenuTrigger>
          <ContextMenuContent className="w-56">
            <ContextMenuItem>Cut</ContextMenuItem>
            <ContextMenuItem>Copy</ContextMenuItem>
            <ContextMenuItem>Paste</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger>More</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem>Save As...</ContextMenuItem>
                <ContextMenuItem>Print...</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </Section>
    </>
  )
}
