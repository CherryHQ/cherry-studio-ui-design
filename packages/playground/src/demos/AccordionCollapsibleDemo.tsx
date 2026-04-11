import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Collapsible, CollapsibleContent, CollapsibleTrigger, Button } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { ChevronsUpDown } from "lucide-react"

export function AccordionCollapsibleDemo() {
  return (
    <>
      <Section title="Accordion">
        <Accordion type="single" collapsible className="w-full max-w-lg">
          <AccordionItem value="item-1">
            <AccordionTrigger>What is Cherry Studio?</AccordionTrigger>
            <AccordionContent>Cherry Studio is an AI-powered development environment for building smart applications.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>How do I get started?</AccordionTrigger>
            <AccordionContent>You can start by creating a new project and selecting a template from the library.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Can I customize the UI?</AccordionTrigger>
            <AccordionContent>Yes! All components are fully customizable using Tailwind CSS and CSS variables.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </Section>

      <Section title="Collapsible">
        <Collapsible className="w-full max-w-lg space-y-2">
          <div className="flex items-center justify-between space-x-4 px-4">
            <h4 className="text-sm font-semibold">3 starred repositories</h4>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm"><ChevronsUpDown className="h-4 w-4" /></Button>
            </CollapsibleTrigger>
          </div>
          <div className="rounded-md border px-4 py-2 text-sm">@cherry-studio/ui</div>
          <CollapsibleContent className="space-y-2">
            <div className="rounded-md border px-4 py-2 text-sm">@cherry-studio/core</div>
            <div className="rounded-md border px-4 py-2 text-sm">@cherry-studio/cli</div>
          </CollapsibleContent>
        </Collapsible>
      </Section>
    </>
  )
}
