import React from "react"
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  Input, Label, Button, Badge
} from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { User, Settings, Bell, Shield, MessageSquare, Bot, BookOpen } from "lucide-react"

export function TabsDemo() {
  return (
    <>
      <Section title="Basic Tabs" install="npx shadcn@latest add tabs" props={[
        { name: "value", type: "string", description: "Controlled active tab" },
        { name: "defaultValue", type: "string", description: "Default active tab" },
        { name: "onValueChange", type: "(value) => void", description: "Tab change handler" },
      ]} code={`import { Tabs, TabsContent, TabsList, TabsTrigger } from "@cherry-studio/ui"

<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account settings...</TabsContent>
  <TabsContent value="password">Change password...</TabsContent>
</Tabs>`}>
        <Tabs defaultValue="account" className="w-full max-w-lg">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Make changes to your account here.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue="Cherry" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="framework">Framework</Label>
                  <Input id="framework" defaultValue="React" />
                </div>
                <Button>Save</Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Change your password here.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="current">Current password</Label>
                  <Input id="current" type="password" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-pw">New password</Label>
                  <Input id="new-pw" type="password" />
                </div>
                <Button>Update</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="With Icons & Badges">
        <Tabs defaultValue="chat" className="w-full max-w-lg">
          <TabsList>
            <TabsTrigger value="chat" className="gap-1.5"><MessageSquare className="h-4 w-4" /> Chat</TabsTrigger>
            <TabsTrigger value="agents" className="gap-1.5"><Bot className="h-4 w-4" /> Agents</TabsTrigger>
            <TabsTrigger value="knowledge" className="gap-1.5"><BookOpen className="h-4 w-4" /> Knowledge</TabsTrigger>
          </TabsList>
          <TabsContent value="chat" className="mt-3">
            <p className="text-sm text-muted-foreground">Multi-model conversations with context awareness and branching.</p>
          </TabsContent>
          <TabsContent value="agents" className="mt-3">
            <p className="text-sm text-muted-foreground">Autonomous AI agents for complex task execution and workflows.</p>
          </TabsContent>
          <TabsContent value="knowledge" className="mt-3">
            <p className="text-sm text-muted-foreground">RAG-powered document retrieval, Q&A, and knowledge management.</p>
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="With Disabled Tab">
        <Tabs defaultValue="general" className="w-full max-w-lg">
          <TabsList>
            <TabsTrigger value="general"><Settings className="mr-1.5 h-3.5 w-3.5" /> General</TabsTrigger>
            <TabsTrigger value="notifications"><Bell className="mr-1.5 h-3.5 w-3.5" /> Notifications</TabsTrigger>
            <TabsTrigger value="security" disabled><Shield className="mr-1.5 h-3.5 w-3.5" /> Security</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="mt-3">
            <div className="space-y-3 max-w-sm">
              <div className="space-y-1">
                <Label>Display Name</Label>
                <Input defaultValue="Cherry Studio" />
              </div>
              <div className="space-y-1">
                <Label>Language</Label>
                <Input defaultValue="English" disabled />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="notifications" className="mt-3">
            <p className="text-sm text-muted-foreground">Notification preferences will appear here.</p>
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="Many Tabs (Scrollable)">
        <Tabs defaultValue="all" className="w-full max-w-lg">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="assistants">Assistants</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="plugins">Plugins</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-3">
            <p className="text-sm text-muted-foreground">Showing all resources.</p>
          </TabsContent>
          <TabsContent value="assistants" className="mt-3">
            <p className="text-sm text-muted-foreground">Custom AI assistants.</p>
          </TabsContent>
          <TabsContent value="agents" className="mt-3">
            <p className="text-sm text-muted-foreground">Autonomous agents.</p>
          </TabsContent>
          <TabsContent value="knowledge" className="mt-3">
            <p className="text-sm text-muted-foreground">Knowledge bases.</p>
          </TabsContent>
          <TabsContent value="tools" className="mt-3">
            <p className="text-sm text-muted-foreground">External tools.</p>
          </TabsContent>
          <TabsContent value="plugins" className="mt-3">
            <p className="text-sm text-muted-foreground">Community plugins.</p>
          </TabsContent>
        </Tabs>
      </Section>
    </>
  )
}
