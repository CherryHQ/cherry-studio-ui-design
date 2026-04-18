import React from "react"
import { Avatar, AvatarFallback, Badge, Button, Separator } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { Share2, Globe, Twitter, Github, Heart, Eye, MessageSquare, Image as ImageIcon } from "lucide-react"

const STATS = [
  { label: "作品", value: "128" },
  { label: "获赞", value: "3.2K" },
  { label: "粉丝", value: "856" },
  { label: "关注", value: "92" },
]

const WORKS = [
  { id: "w1", title: "Cyberpunk Street", likes: 234, views: 1200, seed: "profile1" },
  { id: "w2", title: "Fantasy Castle", likes: 187, views: 890, seed: "profile2" },
  { id: "w3", title: "Ocean Sunset", likes: 312, views: 1560, seed: "profile3" },
  { id: "w4", title: "Space Station", likes: 98, views: 540, seed: "profile4" },
  { id: "w5", title: "Mountain Village", likes: 256, views: 1100, seed: "profile5" },
  { id: "w6", title: "Neon Alley", likes: 445, views: 2300, seed: "profile6" },
]

const profileProps: PropDef[] = [
  { name: "user", type: "UserProfile", default: "-", description: "用户信息" },
  { name: "works", type: "Work[]", default: "[]", description: "作品列表" },
]

export function ProfileDemo() {
  return (
    <Section title="Profile Page" props={profileProps} code={`// Header: Avatar + Name + Stats + Share
// Grid: SceneCards (3-col)`}>
      <div className="rounded-[24px] border bg-background overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <Avatar className="size-20 ring-2 ring-border">
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-accent-blue to-accent-violet text-primary-foreground">A</AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-lg font-semibold text-foreground tracking-tight">Alice Chen</h2>
                <Badge variant="secondary" className="text-[10px]">Pro</Badge>
              </div>
              <p className="text-sm text-muted-foreground/60 mb-3">AI artist & creative technologist. Exploring the intersection of code and art.</p>

              {/* Stats */}
              <div className="flex items-center gap-5 mb-3">
                {STATS.map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-sm font-bold text-foreground tabular-nums">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground/40">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button size="sm" className="gap-1.5"><Share2 size={12} /> Share</Button>
                <Button variant="outline" size="icon-sm" aria-label="Website"><Globe size={14} /></Button>
                <Button variant="outline" size="icon-sm" aria-label="Twitter"><Twitter size={14} /></Button>
                <Button variant="outline" size="icon-sm" aria-label="GitHub"><Github size={14} /></Button>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Works grid */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ImageIcon size={14} className="text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground tracking-tight">作品</h3>
              <span className="text-xs text-muted-foreground/40">{WORKS.length}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {WORKS.map(work => (
              <div key={work.id} className="group rounded-[var(--radius-button)] overflow-hidden border border-border/30 hover:border-border/60 transition-all cursor-pointer">
                <div className="aspect-[4/3] bg-gradient-to-br from-accent/20 to-accent-violet/20 relative">
                  <img src={`https://picsum.photos/seed/${work.seed}/400/300`} alt={work.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium text-foreground truncate tracking-tight">{work.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground/40">
                      <Heart size={9} /> {work.likes}
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground/40">
                      <Eye size={9} /> {work.views}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
