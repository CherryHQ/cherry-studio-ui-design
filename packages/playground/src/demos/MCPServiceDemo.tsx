import React, { useState } from "react"
import {
  Card, Badge, Switch, Button, Input, Checkbox, Label,
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Plug, RefreshCw, Settings, Terminal } from "lucide-react"

const mcpServices = [
  {
    id: "filesystem",
    name: "Filesystem",
    icon: "📁",
    version: "1.2.0",
    status: "connected",
    endpoint: "stdio://mcp-filesystem",
    tools: [
      { name: "read_file", desc: "Read contents of a file", enabled: true },
      { name: "write_file", desc: "Write content to a file", enabled: true },
      { name: "list_directory", desc: "List files in a directory", enabled: true },
      { name: "delete_file", desc: "Delete a file", enabled: false },
    ],
  },
  {
    id: "github",
    name: "GitHub",
    icon: "🐙",
    version: "2.0.1",
    status: "connected",
    endpoint: "stdio://mcp-github",
    tools: [
      { name: "search_repos", desc: "Search GitHub repositories", enabled: true },
      { name: "create_issue", desc: "Create a new issue", enabled: true },
      { name: "get_pull_request", desc: "Get PR details", enabled: true },
    ],
  },
  {
    id: "database",
    name: "Database",
    icon: "🗄️",
    version: "0.9.0",
    status: "disconnected",
    endpoint: "stdio://mcp-postgres",
    tools: [
      { name: "query", desc: "Execute SQL query", enabled: false },
      { name: "list_tables", desc: "List database tables", enabled: false },
    ],
  },
]

export function MCPServiceDemo() {
  const [services, setServices] = useState(mcpServices)

  const toggleService = (id: string) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: s.status === "connected" ? "disconnected" : "connected" } : s
      )
    )
  }

  const toggleTool = (serviceId: string, toolName: string) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === serviceId
          ? { ...s, tools: s.tools.map((t) => (t.name === toolName ? { ...t, enabled: !t.enabled } : t)) }
          : s
      )
    )
  }

  return (
    <Section title="MCP Service Manager" props={[
        { name: "services", type: "MCPService[]", default: "[]", description: "List of MCP services to manage" },
        { name: "onToggle", type: "(serviceId: string) => void", default: "undefined", description: "Callback when a service is connected/disconnected" },
        { name: "onToolToggle", type: "(serviceId: string, toolName: string) => void", default: "undefined", description: "Callback when a tool is enabled/disabled" },
      ]} code={`// Compose with: Card, Badge, Switch, Accordion, Checkbox, Input, Button`}>
      <div className="max-w-lg space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{services.filter((s) => s.status === "connected").length} of {services.length} services connected</p>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            <Plug className="size-3 mr-1" /> Add Service
          </Button>
        </div>

        <Accordion type="multiple" defaultValue={["filesystem"]} className="space-y-2">
          {services.map((service) => (
            <AccordionItem key={service.id} value={service.id} className="border rounded-xl overflow-hidden">
              <div className="flex items-center gap-2.5 px-3 py-0 border-b-0">
                <span className="text-base">{service.icon}</span>
                <AccordionTrigger className="flex-1 py-2.5 hover:no-underline">
                  <div className="flex items-center gap-2 flex-1 text-left">
                    <span className="text-xs font-medium">{service.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-[8px] px-1.5 py-0 ${
                        service.status === "connected"
                          ? "bg-success-muted text-success border-success/20"
                          : "bg-error-muted text-error border-error/20"
                      }`}
                    >
                      {service.status}
                    </Badge>
                    <Badge variant="secondary" className="text-[8px] px-1.5 py-0">v{service.version}</Badge>
                  </div>
                </AccordionTrigger>
                <Switch
                  checked={service.status === "connected"}
                  onCheckedChange={() => toggleService(service.id)}
                  className="scale-75"
                />
              </div>

              <AccordionContent className="px-3 pb-3 pt-0">
                {/* Endpoint */}
                <div className="flex items-center gap-2 mb-3 text-xs">
                  <Terminal className="size-3 text-muted-foreground" />
                  <code className="text-[10px] font-mono text-muted-foreground flex-1 truncate">{service.endpoint}</code>
                  <Button variant="ghost" size="icon" className="size-5">
                    <RefreshCw className="size-2.5" />
                  </Button>
                </div>

                {/* Tools */}
                <div className="space-y-1.5">
                  <p className="text-[10px] text-muted-foreground font-medium">Tools ({service.tools.length})</p>
                  {service.tools.map((tool) => (
                    <div key={tool.name} className="flex items-start gap-2 py-1.5 border-b border-border/50 last:border-0">
                      <Checkbox
                        id={`${service.id}-${tool.name}`}
                        checked={tool.enabled}
                        onCheckedChange={() => toggleTool(service.id, tool.name)}
                        className="mt-0.5"
                        disabled={service.status === "disconnected"}
                      />
                      <Label htmlFor={`${service.id}-${tool.name}`} className="flex-1 cursor-pointer">
                        <code className="text-[10px] font-mono text-foreground/80">{tool.name}</code>
                        <p className="text-[10px] text-muted-foreground/60">{tool.desc}</p>
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  )
}
