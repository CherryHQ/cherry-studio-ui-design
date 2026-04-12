import React, { useState } from "react"
import { AttachmentList } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

const attachmentProps: PropDef[] = [
  { name: "items", type: "AttachmentItem[]", description: "Array of attachment items" },
  { name: "onRemove", type: "(id: string) => void", default: "undefined", description: "Remove handler" },
]

const fileItems = [
  { id: "1", name: "project-plan.pdf", size: 2_450_000, type: "application/pdf" },
  { id: "2", name: "data-export.csv", size: 890_000, type: "text/csv" },
  { id: "3", name: "meeting-notes.md", size: 15_200, type: "text/markdown" },
  { id: "4", name: "architecture.pdf", size: 5_100_000, type: "application/pdf" },
]

const imageItems = [
  { id: "i1", name: "screenshot-ui.png", size: 340_000, type: "image/png" },
  { id: "i2", name: "diagram.svg", size: 28_000, type: "image/svg+xml" },
  { id: "i3", name: "photo-team.jpg", size: 1_800_000, type: "image/jpeg" },
]

const progressItems = [
  { id: "p1", name: "dataset-v2.csv", size: 12_000_000, type: "text/csv", progress: 100 },
  { id: "p2", name: "model-weights.bin", size: 450_000_000, type: "application/octet-stream", progress: 67 },
  { id: "p3", name: "training-log.jsonl", size: 8_500_000, type: "application/json", progress: 23 },
  { id: "p4", name: "embeddings.npy", size: 120_000_000, type: "application/octet-stream", progress: 0 },
]

export function AttachmentListDemo() {
  const [removableItems, setRemovableItems] = useState([
    { id: "r1", name: "report-final.pdf", size: 3_200_000, type: "application/pdf" },
    { id: "r2", name: "budget.xlsx", size: 450_000, type: "application/vnd.ms-excel" },
    { id: "r3", name: "cover-image.png", size: 920_000, type: "image/png" },
    { id: "r4", name: "readme.md", size: 8_400, type: "text/markdown" },
    { id: "r5", name: "config.json", size: 1_200, type: "application/json" },
  ])

  return (
    <>
      <Section title="File Attachments" install="npm install @cherry-studio/ui" props={attachmentProps} code={`import { AttachmentList } from "@cherry-studio/ui"

<AttachmentList items={[
  { id: "1", name: "plan.pdf", size: 2450000, type: "application/pdf" },
  { id: "2", name: "data.csv", size: 890000, type: "text/csv" },
]} />`}>
        <div className="max-w-lg">
          <AttachmentList items={fileItems} />
        </div>
      </Section>

      <Section title="Image Attachments">
        <div className="max-w-lg">
          <AttachmentList items={imageItems} />
        </div>
      </Section>

      <Section title="With Progress">
        <div className="max-w-lg">
          <AttachmentList items={progressItems} />
        </div>
      </Section>

      <Section title="Removable">
        <div className="max-w-lg">
          <p className="text-xs text-muted-foreground mb-2">{removableItems.length} files attached</p>
          <AttachmentList
            items={removableItems}
            onRemove={(id) => setRemovableItems(prev => prev.filter(i => i.id !== id))}
          />
          {removableItems.length === 0 && (
            <p className="text-xs text-muted-foreground/50 text-center py-4">All attachments removed</p>
          )}
        </div>
      </Section>
    </>
  )
}
