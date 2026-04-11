import React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@cherry-studio/ui"
import { Section } from "../components/Section"

export function SelectDemo() {
  return (
    <>
      <Section title="Basic Select">
        <div className="max-w-[280px]">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="orange">Orange</SelectItem>
              <SelectItem value="grape">Grape</SelectItem>
              <SelectItem value="mango">Mango</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      <Section title="Grouped Select">
        <div className="max-w-[280px]">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>OpenAI</SelectLabel>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Anthropic</SelectLabel>
                <SelectItem value="claude-opus">Claude Opus 4</SelectItem>
                <SelectItem value="claude-sonnet">Claude Sonnet 4</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Google</SelectLabel>
                <SelectItem value="gemini-pro">Gemini 2.5 Pro</SelectItem>
                <SelectItem value="gemini-flash">Gemini 2.5 Flash</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </Section>
    </>
  )
}
