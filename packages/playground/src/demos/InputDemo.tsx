import React from "react"
import { Input, Textarea, Label } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Search, Eye } from "lucide-react"

export function InputDemo() {
  return (
    <>
      <Section title="Input">
        <div className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="name@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="disabled">Disabled</Label>
            <Input id="disabled" disabled placeholder="Disabled input" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="with-icon">With Icon</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="with-icon" className="pl-9" placeholder="Search..." />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input id="file" type="file" />
          </div>
        </div>
      </Section>

      <Section title="Textarea">
        <div className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" placeholder="Type your message here..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Disabled</Label>
            <Textarea id="bio" disabled placeholder="Disabled textarea" />
          </div>
        </div>
      </Section>
    </>
  )
}
