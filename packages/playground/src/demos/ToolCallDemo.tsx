import { ToolCallCard } from "@cherry-studio/ui"
import { Section } from "../components/Section"

export function ToolCallDemo() {
  return (
    <Section
      title="Tool Call Card"
      props={[
        {
          name: "toolName",
          type: "string",
          default: "-",
          description: "Name of the tool being called",
        },
        {
          name: "args",
          type: "Record<string, unknown>",
          default: "{}",
          description: "Arguments passed to the tool",
        },
        {
          name: "status",
          type: '"pending" | "running" | "done" | "error"',
          default: '"pending"',
          description: "Current execution status",
        },
        {
          name: "result",
          type: "unknown",
          default: "-",
          description: "Tool execution result (shown when done)",
        },
        {
          name: "error",
          type: "string",
          default: "-",
          description: "Error message (shown when error)",
        },
      ]}
    >
      <div className="space-y-3">
        <ToolCallCard
          toolName="get_weather"
          args={{ city: "San Francisco", units: "celsius" }}
          status="pending"
        />
        <ToolCallCard
          toolName="get_weather"
          args={{ city: "San Francisco", units: "celsius" }}
          status="running"
        />
        <ToolCallCard
          toolName="get_weather"
          args={{ city: "San Francisco", units: "celsius" }}
          status="done"
          result={{ temp: 18, condition: "Partly cloudy" }}
        />
        <ToolCallCard
          toolName="search_web"
          args={{ query: "latest AI news" }}
          status="error"
          error="Network timeout after 30s"
        />
      </div>
    </Section>
  )
}

export default ToolCallDemo
