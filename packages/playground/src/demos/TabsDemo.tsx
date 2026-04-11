import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Button } from "@cherry-studio/ui"
import { Section } from "../components/Section"

export function TabsDemo() {
  return (
    <Section title="Tabs">
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
                <Label htmlFor="new">New password</Label>
                <Input id="new" type="password" />
              </div>
              <Button>Update</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Section>
  )
}
