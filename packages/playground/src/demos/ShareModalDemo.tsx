import React, { useState } from "react"
import { ShareModal, Button, Avatar, AvatarFallback } from "@cherry-studio/ui"
import { Section } from "../components/Section"

const sampleMembers = [
  { name: "Alice Chen", email: "alice@example.com", role: "Owner", avatar: <Avatar className="size-8"><AvatarFallback>AC</AvatarFallback></Avatar> },
  { name: "Bob Li", email: "bob@example.com", role: "Editor", avatar: <Avatar className="size-8"><AvatarFallback>BL</AvatarFallback></Avatar> },
  { name: "Carol Wang", email: "carol@example.com", role: "Viewer", avatar: <Avatar className="size-8"><AvatarFallback>CW</AvatarFallback></Avatar> },
]

export function ShareModalDemo() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Section title="ShareModal" props={[
        { name: "open", type: "boolean", description: "Whether the modal is open" },
        { name: "onOpenChange", type: "(open: boolean) => void", description: "Open state handler" },
        { name: "title", type: "string", default: '"Share"', description: "Modal title" },
        { name: "shareUrl", type: "string", description: "Shareable link URL" },
        { name: "members", type: "ShareModalMember[]", description: "List of members with access" },
        { name: "onCopyLink", type: "() => void", description: "Copy link handler" },
      ]} code={`import { ShareModal } from "@cherry-studio/ui"

<ShareModal
  open={open}
  onOpenChange={setOpen}
  shareUrl="https://cherry.ai/share/abc123"
  members={members}
/>`}>
        <Button onClick={() => setOpen(true)}>Open Share Modal</Button>
        <ShareModal
          open={open}
          onOpenChange={setOpen}
          title="Share Conversation"
          shareUrl="https://cherry.ai/share/abc123"
          members={sampleMembers}
          onCopyLink={() => {}}
        />
      </Section>
    </>
  )
}
