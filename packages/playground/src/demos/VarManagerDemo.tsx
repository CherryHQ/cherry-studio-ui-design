import React, { useState } from "react"
import { VarManager, SYSTEM_VARIABLES, type VariableDef, type VarType, Button, } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

const varManagerProps: PropDef[] = [
  { name: "systemVars", type: "VariableDef[]", description: "Read-only system variables" },
  { name: "userVars", type: "VariableDef[]", description: "User-defined custom variables" },
  { name: "onInsert", type: "(name: string) => void", description: "Insert variable name into editor" },
  { name: "onAdd", type: "() => string", description: "Add new variable, returns its ID" },
  { name: "onUpdate", type: "(id, field, value) => void", description: "Update a variable field" },
  { name: "onRemove", type: "(id: string) => void", description: "Remove a variable" },
]

let nextId = 1

export function VarManagerDemo() {
  const [userVars, setUserVars] = useState<VariableDef[]>([
    { id: "u-1", name: "API_KEY", defaultValue: "sk-proj-abc123", description: "OpenAI API key", type: "string" },
    { id: "u-2", name: "MAX_TOKENS", defaultValue: "4096", description: "Max output tokens", type: "number" },
    { id: "u-3", name: "DEBUG_MODE", defaultValue: "false", description: "Enable debug logging", type: "boolean" },
  ])
  const [open, setOpen] = useState(true)
  const [lastInserted, setLastInserted] = useState<string | null>(null)

  const handleAdd = () => {
    const id = `u-new-${nextId++}`
    setUserVars(prev => [...prev, { id, name: "", defaultValue: "", description: "", type: "string" }])
    return id
  }

  const handleUpdate = (id: string, field: keyof VariableDef, value: string) => {
    setUserVars(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v))
  }

  const handleUpdateType = (id: string, type: VarType) => {
    setUserVars(prev => prev.map(v => v.id === id ? { ...v, type } : v))
  }

  const handleRemove = (id: string) => {
    setUserVars(prev => prev.filter(v => v.id !== id))
  }

  return (
    <Section
      title="Variable Manager"
      install="npm install @cherry-studio/ui"
      props={varManagerProps}
      code={`import { VarManager, SYSTEM_VARIABLES Button, } from "@cherry-studio/ui"

<VarManager
  systemVars={SYSTEM_VARIABLES}
  userVars={userVars}
  onClose={() => setOpen(false)}
  onInsert={(name) => console.log("Insert:", name)}
  onAdd={() => { /* add and return id */ }}
  onUpdate={(id, field, value) => { /* update */ }}
  onUpdateType={(id, type) => { /* update type */ }}
  onRemove={(id) => { /* remove */ }}
/>`}
    >
      <div className="relative h-[500px] border rounded-[24px] bg-muted/30 overflow-hidden">
        {!open && (
          <div className="flex items-center justify-center h-full">
            <Button variant="ghost"
              onClick={() => setOpen(true)}
              className="px-4 py-2 rounded-[12px] bg-primary text-primary-foreground text-sm"
            >
              Open Variable Manager
            </Button>
          </div>
        )}
        {open && (
          <VarManager
            systemVars={SYSTEM_VARIABLES}
            userVars={userVars}
            onClose={() => setOpen(false)}
            onInsert={(name) => setLastInserted(name)}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onUpdateType={handleUpdateType}
            onRemove={handleRemove}
            noBackdrop
          />
        )}
        {lastInserted && (
          <div className="absolute bottom-3 left-3 text-xs text-muted-foreground bg-card border rounded-[12px] px-3 py-1.5">
            Last inserted: <code className="font-mono text-foreground">{`{{${lastInserted}}}`}</code>
          </div>
        )}
      </div>
    </Section>
  )
}
