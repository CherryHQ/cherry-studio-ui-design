import React, { useState, useEffect } from "react"
import { WorkflowSteps, StatusDot, Button, type WorkflowStep } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { Search, Globe, FileText, Code2, Rocket, CheckCircle2, Settings } from "lucide-react"

const completedSteps: WorkflowStep[] = [
  { id: "1", label: "Searching codebase", icon: <Search />, status: "done", description: "Found 12 relevant files" },
  { id: "2", label: "Reviewing architecture", icon: <Globe />, status: "done", description: "Analyzed project structure" },
  { id: "3", label: "Writing implementation", icon: <Code2 />, status: "done", description: "Created 3 new files" },
  { id: "4", label: "Running tests", icon: <Rocket />, status: "done" },
  { id: "5", label: "Complete", icon: <CheckCircle2 />, status: "done" },
]

const inProgressSteps: WorkflowStep[] = [
  { id: "1", label: "Analyzing requirements", icon: <Search />, status: "done" },
  { id: "2", label: "Reading documentation", icon: <FileText />, status: "done", description: "Processed 8 documents" },
  { id: "3", label: "Generating code", icon: <Code2 />, status: "running", description: "Writing component..." },
  { id: "4", label: "Configure build", icon: <Settings />, status: "pending" },
  { id: "5", label: "Deploy", icon: <Rocket />, status: "pending" },
]

const errorSteps: WorkflowStep[] = [
  { id: "1", label: "Fetching data", icon: <Search />, status: "done" },
  { id: "2", label: "Processing", icon: <Code2 />, status: "error", description: "TypeError: Cannot read property of undefined" },
  { id: "3", label: "Deploy", icon: <Rocket />, status: "pending" },
]

export function WorkflowStepsDemo() {
  const [liveSteps, setLiveSteps] = useState<WorkflowStep[]>([
    { id: "1", label: "Initialize", icon: <Settings />, status: "pending" },
    { id: "2", label: "Search files", icon: <Search />, status: "pending" },
    { id: "3", label: "Generate code", icon: <Code2 />, status: "pending" },
    { id: "4", label: "Build & test", icon: <Rocket />, status: "pending" },
    { id: "5", label: "Done", icon: <CheckCircle2 />, status: "pending" },
  ])
  const [running, setRunning] = useState(false)
  const [step, setStep] = useState(-1)

  useEffect(() => {
    if (!running || step >= liveSteps.length) {
      if (step >= liveSteps.length) setRunning(false)
      return
    }
    const timer = setTimeout(() => {
      setLiveSteps((prev) =>
        prev.map((s, i) => ({
          ...s,
          status: i < step ? "done" : i === step ? "running" : "pending",
        })) as WorkflowStep[]
      )
      const finishTimer = setTimeout(() => {
        setLiveSteps((prev) =>
          prev.map((s, i) => ({
            ...s,
            status: i <= step ? "done" : "pending",
          })) as WorkflowStep[]
        )
        setStep((s) => s + 1)
      }, 800)
      return () => clearTimeout(finishTimer)
    }, 200)
    return () => clearTimeout(timer)
  }, [running, step, liveSteps.length])

  const startDemo = () => {
    setLiveSteps((prev) => prev.map((s) => ({ ...s, status: "pending" as const })))
    setStep(0)
    setRunning(true)
  }

  return (
    <>
      <Section title="Completed Workflow" install="npm install @cherry-studio/ui" props={[
        { name: "steps", type: "WorkflowStep[]", description: "Array of workflow steps" },
        { name: "showConnectors", type: "boolean", default: "true", description: "Show connector lines between steps" },
      ]} code={`import { WorkflowSteps, type WorkflowStep } from "@cherry-studio/ui"

const steps: WorkflowStep[] = [
  { id: "1", label: "Search", status: "done" },
  { id: "2", label: "Generate", status: "running" },
  { id: "3", label: "Deploy", status: "pending" },
]

<WorkflowSteps steps={steps} />`}>
        <div className="max-w-sm">
          <WorkflowSteps steps={completedSteps} />
        </div>
      </Section>

      <Section title="In Progress">
        <div className="max-w-sm">
          <WorkflowSteps steps={inProgressSteps} />
        </div>
      </Section>

      <Section title="With Error">
        <div className="max-w-sm">
          <WorkflowSteps steps={errorSteps} />
        </div>
      </Section>

      <Section title="Status Dots">
        <div className="flex items-center gap-4">
          {(["done", "running", "pending", "error"] as const).map((status) => (
            <div key={status} className="flex items-center gap-2">
              <StatusDot status={status} />
              <span className="text-xs text-muted-foreground capitalize">{status}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Animated Demo">
        <div className="max-w-sm space-y-3">
          <Button size="sm" variant="outline" onClick={startDemo} disabled={running}>
            {running ? "Running..." : "Start Workflow"}
          </Button>
          <WorkflowSteps steps={liveSteps} />
        </div>
      </Section>

      <Section title="Without Connectors">
        <div className="max-w-sm">
          <WorkflowSteps steps={completedSteps.slice(0, 3)} showConnectors={false} />
        </div>
      </Section>
    </>
  )
}
