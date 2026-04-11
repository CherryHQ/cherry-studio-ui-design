import React from "react"
import { InputGroup, InputGroupInput, InputGroupText } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Search, Mail, Globe, DollarSign } from "lucide-react"

export function InputGroupDemo() {
  return (
    <Section title="Input Group">
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
          <InputGroupText><Globe className="h-4 w-4" /></InputGroupText>
          <InputGroupInput placeholder="https://" />
          <InputGroupText>.com</InputGroupText>
        </InputGroup>

        <InputGroup>
          <InputGroupText><DollarSign className="h-4 w-4" /></InputGroupText>
          <InputGroupInput type="number" placeholder="0.00" />
          <InputGroupText>USD</InputGroupText>
        </InputGroup>
      </div>
    </Section>
  )
}
