import React from "react"
import { Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, Button } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Inbox, Search, FileX } from "lucide-react"

export function EmptyFieldItemDemo() {
  return (
    <Section title="Empty State">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <Inbox className="h-10 w-10 text-muted-foreground/50" />
            </EmptyMedia>
            <EmptyTitle>No messages</EmptyTitle>
            <EmptyDescription>Start a conversation to see messages here.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm">New Chat</Button>
          </EmptyContent>
        </Empty>

        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <Search className="h-10 w-10 text-muted-foreground/50" />
            </EmptyMedia>
            <EmptyTitle>No results</EmptyTitle>
            <EmptyDescription>Try adjusting your search or filters.</EmptyDescription>
          </EmptyHeader>
        </Empty>

        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <FileX className="h-10 w-10 text-muted-foreground/50" />
            </EmptyMedia>
            <EmptyTitle>No files</EmptyTitle>
            <EmptyDescription>Upload files to get started.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" variant="outline">Upload</Button>
          </EmptyContent>
        </Empty>
      </div>
    </Section>
  )
}
