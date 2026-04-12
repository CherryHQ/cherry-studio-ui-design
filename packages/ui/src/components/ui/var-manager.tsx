"use client"

import * as React from "react"
import { Plus, Trash2, Lock } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Input } from "./input"

export interface Variable {
  key: string
  value: string
  type?: "string" | "secret" | "number"
  system?: boolean
}

export interface VarManagerProps {
  variables: Variable[]
  onVariablesChange?: (variables: Variable[]) => void
  className?: string
}

const VarManager = React.forwardRef<HTMLDivElement, VarManagerProps>(
  ({ variables, onVariablesChange, className }, ref) => {
    const addVariable = () => {
      onVariablesChange?.([...variables, { key: "", value: "", type: "string" }])
    }

    const removeVariable = (index: number) => {
      onVariablesChange?.(variables.filter((_, i) => i !== index))
    }

    const updateVariable = (index: number, field: keyof Variable, val: string) => {
      onVariablesChange?.(
        variables.map((v, i) =>
          i === index ? { ...v, [field]: val } : v
        )
      )
    }

    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        {variables.map((v, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2 rounded-md border border-input px-2.5 py-1.5",
              v.system && "bg-muted/50 opacity-70"
            )}
          >
            {v.system && <Lock className="size-3 text-muted-foreground/50 shrink-0" />}
            <Input
              value={v.key}
              onChange={(e) => updateVariable(i, "key", e.target.value)}
              placeholder="Key"
              disabled={v.system}
              className="h-7 border-0 shadow-none px-1 font-mono text-xs bg-transparent focus-visible:ring-0"
            />
            <span className="text-muted-foreground/30">=</span>
            <Input
              value={v.value}
              onChange={(e) => updateVariable(i, "value", e.target.value)}
              placeholder="Value"
              disabled={v.system}
              type={v.type === "secret" ? "password" : "text"}
              className="h-7 border-0 shadow-none px-1 font-mono text-xs bg-transparent focus-visible:ring-0 flex-1"
            />
            <select
              value={v.type || "string"}
              onChange={(e) => updateVariable(i, "type", e.target.value)}
              disabled={v.system}
              className="h-7 rounded border border-input bg-background px-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="string">string</option>
              <option value="secret">secret</option>
              <option value="number">number</option>
            </select>
            {!v.system && (
              <Button
                variant="ghost"
                size="icon"
                className="size-6 shrink-0"
                onClick={() => removeVariable(i)}
              >
                <Trash2 className="size-3 text-muted-foreground" />
              </Button>
            )}
          </div>
        ))}
        <Button variant="outline" size="sm" className="w-full" onClick={addVariable}>
          <Plus className="size-3.5 mr-1.5" /> Add Variable
        </Button>
      </div>
    )
  }
)
VarManager.displayName = "VarManager"

export { VarManager }
