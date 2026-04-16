import React from "react"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { cn } from "@cherry-studio/ui"

function ListItem({ title, children, href = "#" }: { title: string; children: React.ReactNode; href?: string }) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a href={href} className="block select-none space-y-1 rounded-xl p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  )
}

export function NavigationMenuDemo() {
  return (
    <>
      <Section title="Navigation Menu" install="npx shadcn@latest add navigation-menu" props={[
          { name: "className", type: "string", default: "undefined", description: "Additional CSS classes" },
        ]} code={`import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from "@cherry-studio/ui"

<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
      <NavigationMenuContent>...</NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`}>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 md:w-100 lg:w-125 lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a href="#" className="flex h-full w-full select-none flex-col justify-end rounded-xl bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-sm">
                        <div className="mb-2 text-lg font-medium">Cherry Studio</div>
                        <p className="text-sm leading-tight text-muted-foreground">AI-powered development environment</p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <ListItem title="Introduction">Learn the basics of Cherry Studio.</ListItem>
                  <ListItem title="Installation">How to install and configure.</ListItem>
                  <ListItem title="Typography">Styles for headings, text, and lists.</ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Components</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-100 gap-3 p-4 md:w-125 md:grid-cols-2">
                  <ListItem title="Alert Dialog">A modal for important confirmations.</ListItem>
                  <ListItem title="Hover Card">Preview content on hover.</ListItem>
                  <ListItem title="Tabs">Tabbed content interface.</ListItem>
                  <ListItem title="Tooltip">Informational popup on hover.</ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                Documentation
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </Section>

      <Section title="Simple Links" code={`<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">Home</NavigationMenuLink>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">Chat</NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`}>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                Home
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                Chat
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                Assistants
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                Settings
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </Section>
    </>
  )
}
