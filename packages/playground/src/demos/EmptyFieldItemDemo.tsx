import React, { useState } from "react"
import {
  Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent,
  Field, FieldSet, FieldLegend, FieldGroup, FieldLabel, FieldContent, FieldTitle, FieldDescription, FieldError, FieldSeparator,
  Item, ItemGroup, ItemSeparator, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions, ItemHeader, ItemFooter,
  Button, Input, Checkbox, Badge
} from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { Inbox, Search, FileX, User, Mail, Bell, Star, FileText, Image, Music, MoreHorizontal, WifiOff, ShieldX, Rocket, Upload } from "lucide-react"

const emptyProps: PropDef[] = [
  { name: "children", type: "ReactNode", default: "required", description: "Empty state content" },
]

export function EmptyFieldItemDemo() {
  const [terms, setTerms] = useState(false)
  const [newsletter, setNewsletter] = useState(true)

  return (
    <>
      {/* ─── Empty ─── */}
      <Section title="Empty State" install="npx shadcn@latest add empty" props={emptyProps} code={`import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent, Button } from "@cherry-studio/ui"
import { Inbox } from "lucide-react"

<Empty>
  <EmptyHeader>
    <EmptyMedia><Inbox className="h-10 w-10" /></EmptyMedia>
    <EmptyTitle>No messages</EmptyTitle>
    <EmptyDescription>Start a conversation.</EmptyDescription>
  </EmptyHeader>
  <EmptyContent><Button size="sm">New Chat</Button></EmptyContent>
</Empty>`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Empty>
            <EmptyHeader>
              <EmptyMedia><Inbox className="h-10 w-10 text-muted-foreground/50" /></EmptyMedia>
              <EmptyTitle>No messages</EmptyTitle>
              <EmptyDescription>Start a conversation to see messages here.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent><Button size="sm">New Chat</Button></EmptyContent>
          </Empty>
          <Empty>
            <EmptyHeader>
              <EmptyMedia><Search className="h-10 w-10 text-muted-foreground/50" /></EmptyMedia>
              <EmptyTitle>No results</EmptyTitle>
              <EmptyDescription>Try adjusting your search or filters.</EmptyDescription>
            </EmptyHeader>
          </Empty>
          <Empty>
            <EmptyHeader>
              <EmptyMedia><FileX className="h-10 w-10 text-muted-foreground/50" /></EmptyMedia>
              <EmptyTitle>No files</EmptyTitle>
              <EmptyDescription>Upload files to get started.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent><Button size="sm" variant="outline">Upload</Button></EmptyContent>
          </Empty>
        </div>
      </Section>

      <Section title="More Empty State Scenarios">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Empty>
            <EmptyHeader>
              <EmptyMedia><WifiOff className="h-10 w-10 text-muted-foreground/50" /></EmptyMedia>
              <EmptyTitle>Network error</EmptyTitle>
              <EmptyDescription>Unable to connect. Check your internet connection.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent><Button size="sm" variant="outline">Retry</Button></EmptyContent>
          </Empty>
          <Empty>
            <EmptyHeader>
              <EmptyMedia><ShieldX className="h-10 w-10 text-muted-foreground/50" /></EmptyMedia>
              <EmptyTitle>No permission</EmptyTitle>
              <EmptyDescription>You don't have access to this resource. Contact your admin.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent><Button size="sm" variant="outline">Request Access</Button></EmptyContent>
          </Empty>
          <Empty>
            <EmptyHeader>
              <EmptyMedia><Rocket className="h-10 w-10 text-muted-foreground/50" /></EmptyMedia>
              <EmptyTitle>Get started</EmptyTitle>
              <EmptyDescription>Create your first project to begin building.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent><Button size="sm">Create Project</Button></EmptyContent>
          </Empty>
          <Empty>
            <EmptyHeader>
              <EmptyMedia><Upload className="h-10 w-10 text-muted-foreground/50" /></EmptyMedia>
              <EmptyTitle>Upload files</EmptyTitle>
              <EmptyDescription>Drag and drop files here, or click to browse.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent><Button size="sm" variant="outline">Browse Files</Button></EmptyContent>
          </Empty>
          <Empty>
            <EmptyHeader>
              <EmptyMedia><Star className="h-10 w-10 text-muted-foreground/50" /></EmptyMedia>
              <EmptyTitle>No favorites</EmptyTitle>
              <EmptyDescription>Star items to add them to your favorites list.</EmptyDescription>
            </EmptyHeader>
          </Empty>
          <Empty>
            <EmptyHeader>
              <EmptyMedia><Bell className="h-10 w-10 text-muted-foreground/50" /></EmptyMedia>
              <EmptyTitle>All caught up</EmptyTitle>
              <EmptyDescription>No new notifications. Check back later.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </Section>

      {/* ─── Field ─── */}
      <Section title="Field — Vertical (Default)">
        <div className="max-w-md">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="f-name">Full Name</FieldLabel>
              <Input id="f-name" placeholder="John Doe" />
            </Field>
            <Field>
              <FieldLabel htmlFor="f-email">Email</FieldLabel>
              <Input id="f-email" type="email" placeholder="john@example.com" />
              <FieldDescription>We'll never share your email.</FieldDescription>
            </Field>
          </FieldGroup>
        </div>
      </Section>

      <Section title="Field — Horizontal">
        <div className="max-w-lg">
          <FieldGroup>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="f-user">Username</FieldLabel>
              <Input id="f-user" placeholder="johndoe" className="max-w-50" />
            </Field>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="f-bio">Bio</FieldLabel>
              <Input id="f-bio" placeholder="Tell us about yourself" className="max-w-50" />
            </Field>
          </FieldGroup>
        </div>
      </Section>

      <Section title="Field — With Error">
        <div className="max-w-md">
          <FieldGroup>
            <Field data-invalid="true">
              <FieldLabel htmlFor="f-err">Email</FieldLabel>
              <Input id="f-err" defaultValue="invalid" aria-invalid="true" />
              <FieldError>Please enter a valid email address.</FieldError>
            </Field>
            <Field data-invalid="true">
              <FieldLabel htmlFor="f-err2">Password</FieldLabel>
              <Input id="f-err2" type="password" aria-invalid="true" />
              <FieldError errors={[
                { message: "Must be at least 8 characters" },
                { message: "Must contain a number" },
              ]} />
            </Field>
          </FieldGroup>
        </div>
      </Section>

      <Section title="FieldSet with Legend & Separator">
        <div className="max-w-md">
          <FieldSet>
            <FieldLegend>Account Settings</FieldLegend>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="fs-name">Display Name</FieldLabel>
                <Input id="fs-name" defaultValue="Cherry Studio" />
              </Field>
              <FieldSeparator>or</FieldSeparator>
              <Field>
                <FieldLabel htmlFor="fs-email">Contact Email</FieldLabel>
                <Input id="fs-email" defaultValue="hello@cherrystudio.dev" />
                <FieldDescription>Used for notifications and account recovery.</FieldDescription>
              </Field>
            </FieldGroup>
          </FieldSet>
        </div>
      </Section>

      <Section title="Field — With Checkbox">
        <div className="max-w-md">
          <FieldGroup>
            <Field orientation="horizontal">
              <Checkbox id="f-terms" checked={terms} onCheckedChange={(v) => setTerms(v === true)} />
              <FieldContent>
                <FieldTitle>Accept terms {terms && <Badge variant="outline" className="ml-1 text-xs">Accepted</Badge>}</FieldTitle>
                <FieldDescription>You agree to our Terms of Service and Privacy Policy.</FieldDescription>
              </FieldContent>
            </Field>
            <Field orientation="horizontal">
              <Checkbox id="f-news" checked={newsletter} onCheckedChange={(v) => setNewsletter(v === true)} />
              <FieldContent>
                <FieldTitle>Newsletter {newsletter && <Badge variant="outline" className="ml-1 text-xs">Subscribed</Badge>}</FieldTitle>
                <FieldDescription>Receive product updates and news.</FieldDescription>
              </FieldContent>
            </Field>
          </FieldGroup>
        </div>
      </Section>

      {/* ─── Item ─── */}
      <Section title="Item — Default">
        <div className="max-w-lg">
          <ItemGroup>
            <Item>
              <ItemMedia><User className="h-4 w-4 text-muted-foreground" /></ItemMedia>
              <ItemContent>
                <ItemTitle>John Doe</ItemTitle>
                <ItemDescription>Software Engineer at Cherry Studio</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button size="sm" variant="outline">View</Button>
              </ItemActions>
            </Item>
            <ItemSeparator />
            <Item>
              <ItemMedia><User className="h-4 w-4 text-muted-foreground" /></ItemMedia>
              <ItemContent>
                <ItemTitle>Jane Smith</ItemTitle>
                <ItemDescription>Product Designer</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button size="sm" variant="outline">View</Button>
              </ItemActions>
            </Item>
          </ItemGroup>
        </div>
      </Section>

      <Section title="Item — Variants">
        <div className="max-w-lg space-y-3">
          <Item variant="outline">
            <ItemMedia variant="icon"><FileText className="text-accent-blue" /></ItemMedia>
            <ItemContent>
              <ItemTitle>Outline Variant</ItemTitle>
              <ItemDescription>Item with visible border</ItemDescription>
            </ItemContent>
          </Item>
          <Item variant="muted">
            <ItemMedia variant="icon"><Image className="text-accent-emerald" /></ItemMedia>
            <ItemContent>
              <ItemTitle>Muted Variant</ItemTitle>
              <ItemDescription>Item with muted background</ItemDescription>
            </ItemContent>
          </Item>
        </div>
      </Section>

      <Section title="Item — With Header & Footer">
        <div className="max-w-lg">
          <Item variant="outline">
            <ItemHeader>
              <ItemTitle>Cherry Studio v2.0 <Badge className="ml-1">New</Badge></ItemTitle>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </ItemHeader>
            <ItemContent>
              <ItemDescription>Major update with redesigned UI, multi-model chat, and AI agents.</ItemDescription>
            </ItemContent>
            <ItemFooter>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Star className="h-3 w-3" /> 2.4k stars
              </div>
              <Button size="sm" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
            </ItemFooter>
          </Item>
        </div>
      </Section>

      <Section title="Item — Practical: Notification List">
        <div className="max-w-lg">
          <ItemGroup>
            {[
              { icon: Mail, title: "New message from AI", desc: "Your code review is ready", time: "2m ago", unread: true },
              { icon: Bell, title: "Build succeeded", desc: "Pipeline #1234 completed", time: "15m ago", unread: true },
              { icon: Star, title: "New follower", desc: "Jane started following you", time: "1h ago", unread: false },
            ].map((notif, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ItemSeparator />}
                <Item size="sm" className={notif.unread ? "bg-primary/5" : ""}>
                  <ItemMedia variant="icon"><notif.icon className="text-muted-foreground" /></ItemMedia>
                  <ItemContent>
                    <ItemTitle>{notif.title} {notif.unread && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}</ItemTitle>
                    <ItemDescription>{notif.desc}</ItemDescription>
                  </ItemContent>
                  <span className="text-[10px] text-muted-foreground shrink-0">{notif.time}</span>
                </Item>
              </React.Fragment>
            ))}
          </ItemGroup>
        </div>
      </Section>
    </>
  )
}
