import React, { useState } from "react"
import { Card, CardContent, Badge, Progress, Button } from "@cherry-studio/ui"
import { Section } from "../components/Section"

interface Provider {
  id: string; name: string; icon: string
  status: "online" | "degraded" | "offline"
  models: number; latency: number; uptime: string
}

const providers: Provider[] = [
  { id: "openai", name: "OpenAI", icon: "🟢", status: "online", models: 8, latency: 120, uptime: "99.9%" },
  { id: "anthropic", name: "Anthropic", icon: "🟤", status: "online", models: 5, latency: 95, uptime: "99.8%" },
  { id: "google", name: "Google AI", icon: "🔵", status: "online", models: 4, latency: 180, uptime: "99.5%" },
  { id: "ollama", name: "Ollama (Local)", icon: "🦙", status: "online", models: 12, latency: 45, uptime: "100%" },
  { id: "mistral", name: "Mistral AI", icon: "🟠", status: "degraded", models: 3, latency: 450, uptime: "97.2%" },
  { id: "deepseek", name: "DeepSeek", icon: "🔷", status: "offline", models: 2, latency: 0, uptime: "0%" },
]

const statusConfig: Record<string, { color: string; dotColor: string; label: string }> = {
  online: { color: "bg-success-muted text-success border-success/20", dotColor: "bg-success", label: "Online" },
  degraded: { color: "bg-warning-muted text-warning border-warning/20", dotColor: "bg-warning", label: "Degraded" },
  offline: { color: "bg-error-muted text-error border-error/20", dotColor: "bg-error", label: "Offline" },
}

function latencyToPercent(ms: number) {
  if (ms === 0) return 0
  return Math.min(100, Math.max(5, 100 - (ms / 5)))
}

function latencyColor(ms: number) {
  if (ms === 0) return "text-muted-foreground/30"
  if (ms <= 100) return "text-success"
  if (ms <= 200) return "text-warning"
  return "text-error"
}

export function ProviderStatusDemo() {
  const [statuses, setStatuses] = useState<Record<string, Provider["status"]>>(
    Object.fromEntries(providers.map(p => [p.id, p.status]))
  )

  const toggleStatus = (id: string) => {
    setStatuses(prev => {
      const current = prev[id]
      const next = current === "online" ? "offline" : "online"
      return { ...prev, [id]: next }
    })
  }

  const onlineCount = Object.values(statuses).filter(s => s === "online").length

  return (
    <Section title="Provider Status Cards" install="npm install @cherry-studio/ui" props={[
        { name: "providers", type: "Provider[]", default: "[]", description: "List of providers with status information" },
        { name: "status", type: '"online" | "degraded" | "offline"', default: '"online"', description: "Connection status of the provider" },
        { name: "latency", type: "number", default: "0", description: "Response latency in milliseconds" },
      ]}>
      <div className="max-w-xl">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground">
            {onlineCount} of {providers.length} providers online
          </p>
          <div className="flex items-center gap-3">
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1">
                <div className={`h-1.5 w-1.5 rounded-full ${cfg.dotColor}`} />
                <span className="text-[10px] text-muted-foreground">{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {providers.map(provider => {
            const currentStatus = statuses[provider.id]
            const cfg = statusConfig[currentStatus]
            const isOnline = currentStatus === "online"
            const displayLatency = isOnline ? provider.latency : 0
            return (
              <Card key={provider.id} className="p-0">
                <CardContent className="p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${cfg.dotColor}`} />
                      <span className="text-lg">{provider.icon}</span>
                      <span className="text-xs font-medium">{provider.name}</span>
                    </div>
                    <Badge variant="outline" className={`text-xs ${cfg.color}`}>
                      {cfg.label}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{provider.models} models</span>
                    <span>Uptime: {isOnline ? provider.uptime : "0%"}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">Latency</span>
                      <span className={`text-[10px] font-mono ${latencyColor(displayLatency)}`}>
                        {displayLatency > 0 ? `${displayLatency}ms` : "N/A"}
                      </span>
                    </div>
                    <Progress value={latencyToPercent(displayLatency)} className="h-1" />
                  </div>

                  <Button
                    size="sm"
                    variant={isOnline ? "outline" : "default"}
                    className="w-full h-6 text-[10px]"
                    onClick={() => toggleStatus(provider.id)}
                  >
                    {isOnline ? "Disconnect" : "Connect"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
