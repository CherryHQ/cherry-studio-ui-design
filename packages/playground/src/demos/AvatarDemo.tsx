import React from "react"
import { Avatar, AvatarFallback, AvatarImage, Badge } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

export function AvatarDemo() {
  return (
    <>
      <Section title="Sizes" install="npx shadcn@latest add avatar" props={[
        { name: "className", type: "string", description: "Size and styling via className" },
      ]} code={`import { Avatar, AvatarFallback, AvatarImage } from "@cherry-studio/ui"

<Avatar className="h-8 w-8">
  <AvatarImage src="https://example.com/avatar.png" />
  <AvatarFallback>AB</AvatarFallback>
</Avatar>`}>
        <div className="flex gap-4 items-end">
          <div className="text-center space-y-1.5">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px]">XS</AvatarFallback>
            </Avatar>
            <p className="text-xs text-muted-foreground">24px</p>
          </div>
          <div className="text-center space-y-1.5">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">SM</AvatarFallback>
            </Avatar>
            <p className="text-xs text-muted-foreground">32px</p>
          </div>
          <div className="text-center space-y-1.5">
            <Avatar>
              <AvatarFallback>MD</AvatarFallback>
            </Avatar>
            <p className="text-xs text-muted-foreground">40px</p>
          </div>
          <div className="text-center space-y-1.5">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="text-lg">LG</AvatarFallback>
            </Avatar>
            <p className="text-xs text-muted-foreground">56px</p>
          </div>
          <div className="text-center space-y-1.5">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">XL</AvatarFallback>
            </Avatar>
            <p className="text-xs text-muted-foreground">80px</p>
          </div>
        </div>
      </Section>

      <Section title="With Image & Fallback">
        <div className="flex gap-4 items-center">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="user" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback className="text-lg">🍒</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback className="bg-accent-violet text-primary-foreground">GP</AvatarFallback>
          </Avatar>
        </div>
      </Section>

      <Section title="With Status Indicator">
        <div className="flex gap-6 items-center">
          {[
            { initials: "JD", status: "bg-success", label: "Online" },
            { initials: "AK", status: "bg-warning", label: "Away" },
            { initials: "MZ", status: "bg-error", label: "Busy" },
            { initials: "SL", status: "bg-muted-foreground", label: "Offline" },
          ].map(({ initials, status, label }) => (
            <div key={initials} className="text-center space-y-1.5">
              <div className="relative inline-flex">
                <Avatar>
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${status}`} />
              </div>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Avatar Group / Stack">
        <div className="space-y-4">
          <div className="flex -space-x-3">
            {["JD", "AK", "MZ", "SL", "🍒"].map((initials, i) => (
              <Avatar key={i} className="border-2 border-background">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
            ))}
            <Avatar className="border-2 border-background">
              <AvatarFallback className="text-xs bg-muted">+3</AvatarFallback>
            </Avatar>
          </div>
          <p className="text-sm text-muted-foreground">8 team members</p>
        </div>
      </Section>

      <Section title="Practical: User Card">
        <div className="flex items-center gap-3 rounded-[12px] border p-3 max-w-xs">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarFallback>🍒</AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-success" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Cherry Studio</p>
            <p className="text-xs text-muted-foreground truncate">AI Development Environment</p>
          </div>
          <Badge variant="secondary" className="shrink-0 text-[10px]">Pro</Badge>
        </div>
      </Section>
    </>
  )
}
