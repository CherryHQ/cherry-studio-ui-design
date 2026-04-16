import React from "react"
import { PlanCard } from "@cherry-studio/ui"
import { Section } from "../components/Section"

export function PlanCardDemo() {
  return (
    <>
      <Section title="PlanCard Variants" props={[
        { name: "name", type: "string", description: "Plan name" },
        { name: "price", type: "string", description: "Price display" },
        { name: "period", type: "string", description: "Billing period (e.g. '/month')" },
        { name: "description", type: "string", description: "Short plan description" },
        { name: "features", type: "string[]", description: "List of included features" },
        { name: "highlighted", type: "boolean", default: "false", description: "Highlight with primary border" },
        { name: "actionLabel", type: "string", default: '"Get Started"', description: "CTA button label" },
      ]} code={`import { PlanCard } from "@cherry-studio/ui"

<PlanCard
  name="Creator"
  price="$9.99"
  period="/month"
  features={["Unlimited chats", "All models"]}
  highlighted
/>`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
          <PlanCard
            name="Free"
            price="$0"
            period="/month"
            description="For personal exploration"
            features={["5 chats/day", "GPT-3.5 access", "Basic assistants", "Community support"]}
            actionLabel="Current Plan"
          />
          <PlanCard
            name="Creator"
            price="$9.99"
            period="/month"
            description="For power users"
            features={["Unlimited chats", "All models", "Custom assistants", "Priority support", "API access"]}
            highlighted
            actionLabel="Upgrade"
          />
          <PlanCard
            name="Studio"
            price="$29.99"
            period="/month"
            description="For teams and businesses"
            features={["Everything in Creator", "Team workspace", "Admin dashboard", "SSO", "SLA guarantee"]}
            actionLabel="Contact Sales"
          />
        </div>
      </Section>
    </>
  )
}
