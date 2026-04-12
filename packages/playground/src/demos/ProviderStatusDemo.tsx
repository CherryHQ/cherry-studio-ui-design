import React from "react"
import { Card, CardContent, Badge, Progress } from "@cherry-studio/ui"
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
  online: { color: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20", dotColor: "bg-green-500", label: "Online" },
  degraded: { color: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20", dotColor: "bg-yellow-500", label: "Degraded" },
  offline: { color: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20", dotColor: "bg-red-500", label: "Offline" },
}

function latencyToPercent(ms: number) {
  if (ms === 0) return 0
  return Math.min(100, Math.max(5, 100 - (ms / 5)))
}

function latencyColor(ms: number) {
  if (ms === 0) return "text-muted-foreground/30"
  if (ms <= 100) return "text-green-600 dark:text-green-400"
  if (ms <= 200) return "text-yellow-600 dark:text-yellow-400"
  return "text-red-600 dark:text-red-400"
}

export function ProviderStatusDemo() {
  return (
    <Section title="Provider Status Cards" install="npm install @cherry-studio/ui">
      <div className="max-w-xl">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground">
            {providers.filter(p => p.status === "online").length} of {providers.length} providers online
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
            const cfg = statusConfig[provider.status]
            return (
              <Card key={provider.id} className="p-0">
                <CardContent className="p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${cfg.dotColor}`} />
                      <span className="text-lg">{provider.icon}</span>
                      <span className="text-xs font-medium">{provider.name}</span>
                    </div>
                    <Badge variant="outline" className={`text-[9px] ${cfg.color}`}>
                      {cfg.label}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{provider.models} models</span>
                    <span>Uptime: {provider.uptime}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">Latency</span>
                      <span className={`text-[10px] font-mono ${latencyColor(provider.latency)}`}>
                        {provider.latency > 0 ? `${provider.latency}ms` : "N/A"}
                      </span>
                    </div>
                    <Progress value={latencyToPercent(provider.latency)} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
