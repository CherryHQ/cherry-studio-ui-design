import React from "react"
import {
  Input, Card, CardContent, Avatar, AvatarFallback, Button
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Search, MessageSquare, FileText, Code2, Image, Sparkles } from "lucide-react"

const quickActions = [
  { icon: MessageSquare, label: "New Chat", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  { icon: FileText, label: "Translate", color: "bg-green-500/15 text-green-600 dark:text-green-400" },
  { icon: Code2, label: "Code", color: "bg-orange-500/15 text-orange-600 dark:text-orange-400" },
  { icon: Image, label: "Image Gen", color: "bg-purple-500/15 text-purple-600 dark:text-purple-400" },
]

const recentSessions = [
  { id: "1", title: "React Performance Optimization", emoji: "⚛️", time: "10 min ago", model: "Claude Sonnet 4" },
  { id: "2", title: "Database Schema Design", emoji: "🗄️", time: "2 hours ago", model: "GPT-4o" },
  { id: "3", title: "Marketing Copy Review", emoji: "✍️", time: "Yesterday", model: "Claude Sonnet 4" },
  { id: "4", title: "Bug Investigation #128", emoji: "🐛", time: "Yesterday", model: "Claude Opus 4" },
  { id: "5", title: "API Integration Guide", emoji: "🔌", time: "2 days ago", model: "GPT-4o" },
]

export function HomeDemo() {
  return (
    <Section title="Home / Welcome Page" install="npm install @cherry-studio/ui">
      <div className="max-w-lg rounded-xl border bg-background p-6 space-y-6">
        <div className="text-center space-y-3">
          <div className="text-3xl">🍒</div>
          <h2 className="text-sm font-semibold">Welcome to Cherry Studio</h2>
          <p className="text-[11px] text-muted-foreground">What would you like to do today?</p>
        </div>

        <div className="relative max-w-sm mx-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Ask anything or search..." className="pl-9 h-9 text-xs rounded-full" />
          <Button size="sm" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0">
            <Sparkles size={14} />
          </Button>
        </div>

        <div className="flex justify-center gap-3">
          {quickActions.map(action => (
            <button key={action.label} className="flex flex-col items-center gap-1.5 group">
              <div className={`h-10 w-10 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                <action.icon size={18} />
              </div>
              <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">{action.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Recent</p>
          {recentSessions.map(session => (
            <Card key={session.id} className="p-0 cursor-pointer hover:bg-accent/30 transition-colors">
              <CardContent className="p-2.5 flex items-center gap-2.5">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-sm">{session.emoji}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{session.title}</p>
                  <p className="text-[10px] text-muted-foreground">{session.model}</p>
                </div>
                <span className="text-[9px] text-muted-foreground/60 shrink-0">{session.time}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  )
}
