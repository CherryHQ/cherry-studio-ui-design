import React from "react"
import {
  SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuBadge,
  SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton,
  SidebarSeparator, SidebarTrigger, SidebarInset,
  Badge
} from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import {
  Home, MessageSquare, Bot, BookOpen, Settings, FileText,
  Image, Puzzle, ChevronDown, User, LogOut, Bell,
  Inbox, Star, Clock
} from "lucide-react"

const sidebarProps: PropDef[] = [
  { name: "collapsible", type: '"offcanvas" | "icon" | "none"', default: '"offcanvas"', description: "Collapse behavior" },
  { name: "defaultOpen", type: "boolean", default: "true", description: "Initial sidebar state" },
]

export function SidebarDemo() {
  return (
    <>
      <Section title="Full Sidebar" install="npx shadcn@latest add sidebar" props={sidebarProps} code={`import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@cherry-studio/ui"

<SidebarProvider>
  <Sidebar>
    <SidebarHeader>...</SidebarHeader>
    <SidebarContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton isActive>Home</SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarContent>
  </Sidebar>
</SidebarProvider>`}>
        <div className="h-[500px] rounded-xl border overflow-hidden relative" style={{ transform: "translate(0)" }}>
          <SidebarProvider defaultOpen={true}>
            <Sidebar>
              <SidebarHeader className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">C</div>
                  <span className="text-sm font-semibold">Cherry Studio</span>
                </div>
              </SidebarHeader>

              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton isActive>
                          <Home className="h-4 w-4" />
                          <span>Home</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <MessageSquare className="h-4 w-4" />
                          <span>Chat</span>
                          <SidebarMenuBadge>3</SidebarMenuBadge>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <Bot className="h-4 w-4" />
                          <span>Agents</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <BookOpen className="h-4 w-4" />
                          <span>Knowledge</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup>
                  <SidebarGroupLabel>Library</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <FileText className="h-4 w-4" />
                          <span>Files</span>
                          <SidebarMenuBadge>156</SidebarMenuBadge>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <Image className="h-4 w-4" />
                          <span>Images</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <Puzzle className="h-4 w-4" />
                          <span>Extensions</span>
                          <SidebarMenuBadge>
                            <Badge variant="secondary" className="text-[9px] px-1 h-4">New</Badge>
                          </SidebarMenuBadge>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup>
                  <SidebarGroupLabel>With Sub-menu</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <Inbox className="h-4 w-4" />
                          <span>Inbox</span>
                        </SidebarMenuButton>
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton isActive>
                              <span>All Messages</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton>
                              <span>Unread</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton>
                              <span>Starred</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>

              <SidebarFooter className="p-2">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px]">S</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">Siin</p>
                          <p className="text-[10px] text-muted-foreground truncate">siin@gmail.com</p>
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>
            </Sidebar>

            <SidebarInset>
              <header className="flex items-center gap-2 border-b px-4 h-12">
                <SidebarTrigger />
                <span className="text-sm font-medium">Dashboard</span>
              </header>
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                Main content area
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </Section>

      <Section title="Collapsed Sidebar">
        <div className="h-[400px] rounded-xl border overflow-hidden relative" style={{ transform: "translate(0)" }}>
          <SidebarProvider defaultOpen={false}>
            <Sidebar collapsible="icon">
              <SidebarHeader className="p-2 flex items-center justify-center">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">C</div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {[
                        { icon: Home, label: "Home", active: true },
                        { icon: MessageSquare, label: "Chat" },
                        { icon: Bot, label: "Agents" },
                        { icon: BookOpen, label: "Knowledge" },
                        { icon: FileText, label: "Files" },
                      ].map(({ icon: Icon, label, active }) => (
                        <SidebarMenuItem key={label}>
                          <SidebarMenuButton tooltip={label} isActive={active}>
                            <Icon className="h-4 w-4" />
                            <span>{label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
              <SidebarFooter className="p-2">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Settings">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>
            </Sidebar>
            <SidebarInset>
              <header className="flex items-center gap-2 border-b px-4 h-12">
                <SidebarTrigger />
                <span className="text-sm font-medium">Content</span>
              </header>
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                Toggle the sidebar to expand
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </Section>
    </>
  )
}
