import React from "react"
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Checkbox, Textarea } from "@cherry-studio/ui"
import { Section } from "../components/Section"

export function FormDemo() {
  return (
    <Section title="Form Layout">
      <form className="space-y-6 max-w-lg" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" placeholder="John" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" placeholder="Doe" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="emailForm">Email</Label>
          <Input id="emailForm" type="email" placeholder="john@example.com" />
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" placeholder="Tell us about yourself..." />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="agree" />
          <Label htmlFor="agree">I agree to the terms of service</Label>
        </div>
        <div className="flex gap-3">
          <Button type="submit">Submit</Button>
          <Button type="button" variant="outline">Cancel</Button>
        </div>
      </form>
    </Section>
  )
}
