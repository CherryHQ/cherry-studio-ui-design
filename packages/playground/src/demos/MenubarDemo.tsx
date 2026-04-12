import React from "react"
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

export function MenubarDemo() {
  return (
    <>
      <Section title="Menubar" install="npx shadcn@latest add menubar" props={[
          { name: "className", type: "string", default: "undefined", description: "Additional CSS classes" },
        ]} code={`import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@cherry-studio/ui"

<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New Tab</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`}>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>New Tab <MenubarShortcut>⌘T</MenubarShortcut></MenubarItem>
              <MenubarItem>New Window <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>Share</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem>Email</MenubarItem>
                  <MenubarItem>Messages</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSeparator />
              <MenubarItem>Print <MenubarShortcut>⌘P</MenubarShortcut></MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Undo <MenubarShortcut>⌘Z</MenubarShortcut></MenubarItem>
              <MenubarItem>Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut></MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Cut</MenubarItem>
              <MenubarItem>Copy</MenubarItem>
              <MenubarItem>Paste</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarCheckboxItem checked>Toolbar</MenubarCheckboxItem>
              <MenubarCheckboxItem>Sidebar</MenubarCheckboxItem>
              <MenubarSeparator />
              <MenubarItem>Reload <MenubarShortcut>⌘R</MenubarShortcut></MenubarItem>
              <MenubarItem>Full Screen <MenubarShortcut>⌘F</MenubarShortcut></MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </Section>

      <Section title="With Checkbox & Radio Items" code={`<Menubar>
  <MenubarMenu>
    <MenubarTrigger>Options</MenubarTrigger>
    <MenubarContent>
      <MenubarCheckboxItem checked>Show Toolbar</MenubarCheckboxItem>
      <MenubarCheckboxItem>Show Statusbar</MenubarCheckboxItem>
      <MenubarSeparator />
      <MenubarRadioGroup value="claude">
        <MenubarRadioItem value="gpt">GPT-4o</MenubarRadioItem>
        <MenubarRadioItem value="claude">Claude Sonnet</MenubarRadioItem>
        <MenubarRadioItem value="gemini">Gemini Pro</MenubarRadioItem>
      </MenubarRadioGroup>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`}>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Options</MenubarTrigger>
            <MenubarContent>
              <MenubarCheckboxItem checked>Show Toolbar</MenubarCheckboxItem>
              <MenubarCheckboxItem>Show Statusbar</MenubarCheckboxItem>
              <MenubarCheckboxItem checked>Show Line Numbers</MenubarCheckboxItem>
              <MenubarSeparator />
              <MenubarRadioGroup value="claude">
                <MenubarRadioItem value="gpt">GPT-4o</MenubarRadioItem>
                <MenubarRadioItem value="claude">Claude Sonnet</MenubarRadioItem>
                <MenubarRadioItem value="gemini">Gemini Pro</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Theme</MenubarTrigger>
            <MenubarContent>
              <MenubarRadioGroup value="dark">
                <MenubarRadioItem value="light">Light</MenubarRadioItem>
                <MenubarRadioItem value="dark">Dark</MenubarRadioItem>
                <MenubarRadioItem value="system">System</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </Section>
    </>
  )
}
