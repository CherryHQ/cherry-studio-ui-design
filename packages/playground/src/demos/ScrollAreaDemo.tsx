import React from "react"
import { ScrollArea, ScrollBar, Separator, Badge } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { FileText, Image, Code, Music, Video } from "lucide-react"

const tags = Array.from({ length: 50 }).map((_, i) => `Tag ${i + 1}`)

const artworks = [
  { title: "Cherry Blossom", artist: "Studio Design", width: 200 },
  { title: "Mountain Sunset", artist: "Nature AI", width: 250 },
  { title: "Ocean Waves", artist: "Deep Blue", width: 180 },
  { title: "City Lights", artist: "Urban AI", width: 220 },
  { title: "Forest Path", artist: "Green World", width: 190 },
  { title: "Desert Star", artist: "Sand & Sky", width: 210 },
  { title: "Snow Peak", artist: "Alpine AI", width: 240 },
]

const files = [
  { name: "README.md", icon: FileText, size: "2.4 KB", type: "Markdown" },
  { name: "screenshot.png", icon: Image, size: "1.2 MB", type: "Image" },
  { name: "index.tsx", icon: Code, size: "4.8 KB", type: "TypeScript" },
  { name: "podcast.mp3", icon: Music, size: "32 MB", type: "Audio" },
  { name: "demo.mp4", icon: Video, size: "128 MB", type: "Video" },
  { name: "utils.ts", icon: Code, size: "1.1 KB", type: "TypeScript" },
  { name: "logo.svg", icon: Image, size: "3.2 KB", type: "SVG" },
  { name: "notes.md", icon: FileText, size: "890 B", type: "Markdown" },
  { name: "theme.css", icon: Code, size: "2.7 KB", type: "CSS" },
  { name: "preview.jpg", icon: Image, size: "456 KB", type: "Image" },
  { name: "config.json", icon: Code, size: "1.5 KB", type: "JSON" },
  { name: "report.md", icon: FileText, size: "5.3 KB", type: "Markdown" },
]

export function ScrollAreaDemo() {
  return (
    <>
      <Section title="Vertical Scroll" install="npx shadcn@latest add scroll-area" props={[
        { name: "className", type: "string", default: "undefined", description: "Additional CSS" },
        { name: "type", type: '"auto" | "always" | "scroll" | "hover"', default: '"hover"', description: "Scrollbar visibility" },
      ]} code={`import { ScrollArea } from "@cherry-studio/ui"

<ScrollArea className="h-72 w-48 rounded-[12px] border">
  <div className="p-4">
    {items.map((item) => (
      <div key={item}>{item}</div>
    ))}
  </div>
</ScrollArea>`}>
        <ScrollArea className="h-72 w-48 rounded-[12px] border">
          <div className="p-4">
            <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
            {tags.map((tag, i) => (
              <React.Fragment key={tag}>
                <div className="text-sm">{tag}</div>
                {i < tags.length - 1 && <Separator className="my-2" />}
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
      </Section>

      <Section title="Horizontal Scroll">
        <ScrollArea className="w-full max-w-lg whitespace-nowrap rounded-[12px] border">
          <div className="flex w-max space-x-4 p-4">
            {artworks.map((artwork) => (
              <div key={artwork.title} className="shrink-0" style={{ width: artwork.width }}>
                <div className="overflow-hidden rounded-[12px]">
                  <div
                    className="bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center"
                    style={{ height: 120, width: artwork.width }}
                  >
                    <span className="text-2xl">🎨</span>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium">{artwork.title}</p>
                  <p className="text-xs text-muted-foreground">{artwork.artist}</p>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Section>

      <Section title="Practical: File List">
        <ScrollArea className="h-80 w-full max-w-md rounded-[12px] border">
          <div className="p-3 space-y-1">
            {files.map((file) => {
              const Icon = file.icon
              return (
                <div
                  key={file.name}
                  className="flex items-center gap-3 rounded-[12px] px-3 py-2 hover:bg-accent cursor-pointer transition-colors"
                >
                  <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.size}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">{file.type}</Badge>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </Section>

      <Section title="Custom Height with Long Content">
        <ScrollArea className="h-48 w-full max-w-md rounded-[12px] border p-4">
          <div className="space-y-4 text-sm">
            <h4 className="font-semibold">Cherry Studio v2.0 Release Notes</h4>
            <p className="text-muted-foreground">
              We're excited to announce Cherry Studio v2.0, a major update that brings a completely
              redesigned UI, improved performance, and powerful new features.
            </p>
            <h5 className="font-medium">New Features</h5>
            <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
              <li>Multi-model chat with side-by-side comparison</li>
              <li>AI Agents with autonomous task execution</li>
              <li>Knowledge base with RAG-powered retrieval</li>
              <li>Image generation with DALL-E and Midjourney support</li>
              <li>Plugin ecosystem for extending functionality</li>
              <li>Redesigned settings with inline configuration</li>
            </ul>
            <h5 className="font-medium">Improvements</h5>
            <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
              <li>50% faster startup time</li>
              <li>Reduced memory usage by 30%</li>
              <li>Improved dark mode with better contrast</li>
              <li>Keyboard shortcuts for all major actions</li>
              <li>Better mobile responsiveness</li>
            </ul>
            <h5 className="font-medium">Bug Fixes</h5>
            <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
              <li>Fixed conversation history sync issues</li>
              <li>Fixed markdown rendering in code blocks</li>
              <li>Fixed sidebar collapse animation glitch</li>
              <li>Fixed file upload size limit handling</li>
            </ul>
          </div>
        </ScrollArea>
      </Section>
    </>
  )
}
