import React, { useState } from "react"
import { VarManager, type Variable } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

const systemVars: Variable[] = [
  { key: "current_date", value: "2026-04-12", type: "string", system: true },
  { key: "current_time", value: "15:30:00", type: "string", system: true },
  { key: "model_name", value: "claude-sonnet-4", type: "string", system: true },
  { key: "user_locale", value: "zh-CN", type: "string", system: true },
]

const initialVars: Variable[] = [
  ...systemVars,
  { key: "OPENAI_API_KEY", value: "sk-proj-abc123", type: "secret" },
  { key: "BASE_URL", value: "https://api.openai.com/v1", type: "string" },
  { key: "MAX_TOKENS", value: "4096", type: "number" },
]

const varManagerProps: PropDef[] = [
  { name: "variables", type: "Variable[]", description: "Array of { key, value, type?, system? }" },
  { name: "onVariablesChange", type: "(vars: Variable[]) => void", description: "Callback on variables change" },
  { name: "className", type: "string", default: "undefined", description: "Additional CSS" },
]

export function VarManagerDemo() {
  const [vars, setVars] = useState<Variable[]>(initialVars)
  const [simpleVars, setSimpleVars] = useState<Variable[]>([
    { key: "API_KEY", value: "", type: "secret" },
    { key: "ENDPOINT", value: "https://api.example.com", type: "string" },
  ])

  return (
    <>
      <Section title="Variable Manager — Full" install="npm install @cherry-studio/ui" props={varManagerProps} code={`import { VarManager, type Variable } from "@cherry-studio/ui"

const [vars, setVars] = useState<Variable[]>([
  { key: "current_date", value: "2026-04-12", type: "string", system: true },
  { key: "API_KEY", value: "sk-xxx", type: "secret" },
])

<VarManager variables={vars} onVariablesChange={setVars} />`}>
        <div className="max-w-lg">
          <VarManager variables={vars} onVariablesChange={setVars} />
        </div>
      </Section>

      <Section title="Simple — Custom Variables Only">
        <div className="max-w-lg">
          <VarManager variables={simpleVars} onVariablesChange={setSimpleVars} />
          <p className="mt-2 text-xs text-muted-foreground">
            {simpleVars.length} variable{simpleVars.length !== 1 ? "s" : ""}
          </p>
        </div>
      </Section>
    </>
  )
}
