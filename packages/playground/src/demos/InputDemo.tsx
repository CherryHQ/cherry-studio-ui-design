import React, { useState } from "react"
import { Input, Textarea, Label, Button } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { Search, Eye, EyeOff, Mail, Lock } from "lucide-react"

export function InputDemo() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <>
      <Section title="Input" install="npx shadcn@latest add input" props={[
        { name: "type", type: "string", default: '"text"', description: "HTML input type" },
        { name: "placeholder", type: "string", default: "undefined", description: "Placeholder text" },
        { name: "disabled", type: "boolean", default: "false", description: "Disable the input" },
        { name: "className", type: "string", default: "undefined", description: "Additional CSS classes" },
      ] satisfies PropDef[]} code={`import { Input, Label, Button, } from "@cherry-studio/ui"

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="name@example.com" />
</div>`}>
        <div className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="name@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="disabled">Disabled</Label>
            <Input id="disabled" disabled placeholder="Disabled input" value="Cannot edit" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="readonly">Read Only</Label>
            <Input id="readonly" readOnly defaultValue="Read only value" className="bg-muted/50" />
          </div>
        </div>
      </Section>

      <Section title="With Icons">
        <div className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="search" className="pl-9" placeholder="Search..." />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-icon">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email-icon" className="pl-9" placeholder="name@example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="pl-9 pr-9"
                placeholder="Enter password"
                defaultValue="secret123"
              />
              <Button variant="ghost"
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Error State">
        <div className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <Label htmlFor="error-email" className="text-destructive">Email</Label>
            <Input id="error-email" type="email" placeholder="name@example.com" defaultValue="invalid-email" aria-invalid="true" />
            <p className="text-sm text-destructive">Please enter a valid email address.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="error-name" className="text-destructive">Username</Label>
            <Input id="error-name" defaultValue="ab" aria-invalid="true" />
            <p className="text-sm text-destructive">Username must be at least 3 characters.</p>
          </div>
        </div>
      </Section>

      <Section title="File Input">
        <div className="max-w-sm space-y-2">
          <Label htmlFor="file">Upload file</Label>
          <Input id="file" type="file" />
        </div>
      </Section>

      <Section title="Textarea">
        <div className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" placeholder="Type your message here..." />
            <p className="text-xs text-muted-foreground text-right">0 / 500</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio-disabled">Disabled</Label>
            <Textarea id="bio-disabled" disabled placeholder="Disabled textarea" value="Cannot edit this." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio-error" className="text-destructive">Bio</Label>
            <Textarea id="bio-error" defaultValue="x" aria-invalid="true" />
            <p className="text-sm text-destructive">Bio must be at least 10 characters.</p>
          </div>
        </div>
      </Section>
    </>
  )
}
