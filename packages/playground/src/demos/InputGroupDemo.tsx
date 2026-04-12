import React from "react"
import { InputGroup, InputGroupInput, InputGroupText, Button } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { Search, Mail, Globe, DollarSign, Copy, Eye, Lock } from "lucide-react"

export function InputGroupDemo() {
  return (
    <>
      <Section title="Prefix Icon" install="npm install @cherry-studio/ui" props={[
          { name: "className", type: "string", default: "undefined", description: "Additional CSS" },
        ]} code={`import { InputGroup, InputGroupInput, InputGroupText } from "@cherry-studio/ui"
import { Search } from "lucide-react"

<InputGroup>
  <InputGroupText><Search className="h-4 w-4" /></InputGroupText>
  <InputGroupInput placeholder="Search..." />
</InputGroup>`}>
        <div className="space-y-4 max-w-md">
          <InputGroup>
            <InputGroupText><Search className="h-4 w-4" /></InputGroupText>
            <InputGroupInput placeholder="Search..." />
          </InputGroup>
          <InputGroup>
            <InputGroupText><Mail className="h-4 w-4" /></InputGroupText>
            <InputGroupInput placeholder="Email address" />
          </InputGroup>
          <InputGroup>
            <InputGroupText><Lock className="h-4 w-4" /></InputGroupText>
            <InputGroupInput type="password" placeholder="Password" />
          </InputGroup>
        </div>
      </Section>

      <Section title="Prefix & Suffix">
        <div className="space-y-4 max-w-md">
          <InputGroup>
            <InputGroupText><Globe className="h-4 w-4" /></InputGroupText>
            <InputGroupInput placeholder="your-site" />
            <InputGroupText position="suffix">.com</InputGroupText>
          </InputGroup>
          <InputGroup>
            <InputGroupText><DollarSign className="h-4 w-4" /></InputGroupText>
            <InputGroupInput type="number" placeholder="0.00" />
            <InputGroupText position="suffix">USD</InputGroupText>
          </InputGroup>
          <InputGroup>
            <InputGroupText>https://</InputGroupText>
            <InputGroupInput placeholder="api.example.com" />
            <InputGroupText position="suffix">/v1</InputGroupText>
          </InputGroup>
        </div>
      </Section>

      <Section title="With Button Action">
        <div className="space-y-4 max-w-md">
          <div className="flex">
            <InputGroup className="flex-1">
              <InputGroupText><Search className="h-4 w-4" /></InputGroupText>
              <InputGroupInput placeholder="Search models..." />
            </InputGroup>
            <Button className="rounded-l-none ml-[-1px]">Search</Button>
          </div>
          <div className="flex">
            <InputGroup className="flex-1">
              <InputGroupInput readOnly defaultValue="sk-xxxx...xxxx" className="font-mono text-xs" />
            </InputGroup>
            <Button variant="outline" size="icon" className="rounded-l-none ml-[-1px]">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Section>

      <Section title="States">
        <div className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">Disabled</p>
            <InputGroup>
              <InputGroupText><Mail className="h-4 w-4" /></InputGroupText>
              <InputGroupInput disabled placeholder="Disabled" value="user@example.com" />
            </InputGroup>
          </div>
          <div className="space-y-1.5">
            <p className="text-sm text-destructive">Error</p>
            <InputGroup className="border-destructive focus-within:ring-destructive">
              <InputGroupText><Globe className="h-4 w-4" /></InputGroupText>
              <InputGroupInput placeholder="https://" defaultValue="not-a-url" />
            </InputGroup>
            <p className="text-sm text-destructive">Please enter a valid URL.</p>
          </div>
        </div>
      </Section>
    </>
  )
}
