import React, { useState, useRef, useCallback } from "react"
import { Button, Badge, Progress, AttachmentList, type AttachmentItem } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { Upload, X, FileText, Image, Music, File, CheckCircle } from "lucide-react"

interface UploadedFile {
  id: string
  name: string
  size: string
  type: string
  progress: number
  status: "uploading" | "done" | "error"
}

const FILE_ICONS: Record<string, React.ElementType> = {
  document: FileText,
  image: Image,
  audio: Music,
  default: File,
}

function getFileIcon(name: string) {
  if (/\.(pdf|doc|txt|md)$/i.test(name)) return FILE_ICONS.document
  if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(name)) return FILE_ICONS.image
  if (/\.(mp3|wav|ogg)$/i.test(name)) return FILE_ICONS.audio
  return FILE_ICONS.default
}

function DropZone({ onFiles, compact }: { onFiles: (files: File[]) => void; compact?: boolean }) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length) onFiles(files)
  }, [onFiles])

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
        dragOver
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/30"
      } ${compact ? "p-4" : "p-8"}`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || [])
          if (files.length) onFiles(files)
          e.target.value = ""
        }}
      />
      <Upload className={`text-muted-foreground ${compact ? "h-5 w-5" : "h-8 w-8"}`} />
      {!compact && (
        <>
          <div className="text-sm font-medium">Drop files here or click to browse</div>
          <p className="text-xs text-muted-foreground">PDF, Images, Documents up to 10MB</p>
        </>
      )}
      {compact && <span className="text-xs text-muted-foreground">Drop or click</span>}
    </div>
  )
}

const fileUploadProps: PropDef[] = [
  { name: "accept", type: "string", default: "undefined", description: "Accepted file types" },
  { name: "maxSize", type: "number", default: "undefined", description: "Max file size in bytes" },
  { name: "onUpload", type: "(files: File[]) => void", default: "required", description: "Upload handler" },
]

export function FileUploadDemo() {
  const [files, setFiles] = useState<UploadedFile[]>([
    { id: "1", name: "architecture.pdf", size: "2.4 MB", type: "document", progress: 100, status: "done" },
    { id: "2", name: "screenshot.png", size: "890 KB", type: "image", progress: 65, status: "uploading" },
  ])

  const handleFiles = (newFiles: File[]) => {
    const uploads: UploadedFile[] = newFiles.map((f, i) => ({
      id: `${Date.now()}-${i}`,
      name: f.name,
      size: f.size > 1024 * 1024 ? `${(f.size / 1024 / 1024).toFixed(1)} MB` : `${(f.size / 1024).toFixed(0)} KB`,
      type: f.type.split("/")[0] || "default",
      progress: 0,
      status: "uploading" as const,
    }))
    setFiles((prev) => [...prev, ...uploads])

    // Simulate upload progress
    uploads.forEach((u) => {
      let p = 0
      const timer = setInterval(() => {
        p += Math.random() * 30
        if (p >= 100) {
          p = 100
          clearInterval(timer)
          setFiles((prev) => prev.map((f) => f.id === u.id ? { ...f, progress: 100, status: "done" as const } : f))
        } else {
          setFiles((prev) => prev.map((f) => f.id === u.id ? { ...f, progress: Math.round(p) } : f))
        }
      }, 300)
    })
  }

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id))

  return (
    <>
      <Section title="Drag & Drop Zone" install="npm install @cherry-studio/ui" props={fileUploadProps} code={`import { Button } from "@cherry-studio/ui"
import { Upload } from "lucide-react"

<div className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer">
  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
  <p className="text-sm mt-2">Drop files here or click to browse</p>
</div>`}>
        <DropZone onFiles={handleFiles} />
      </Section>

      <Section title="Compact Drop Zone">
        <div className="max-w-xs">
          <DropZone onFiles={handleFiles} compact />
        </div>
      </Section>

      <Section title="With File List">
        <div className="max-w-lg space-y-3">
          <DropZone onFiles={handleFiles} compact />
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file) => {
                const Icon = getFileIcon(file.name)
                return (
                  <div key={file.id} className="flex items-center gap-3 rounded-xl border p-3">
                    <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium truncate">{file.name}</p>
                        <span className="text-[10px] text-muted-foreground ml-2 shrink-0">{file.size}</span>
                      </div>
                      {file.status === "uploading" && (
                        <Progress value={file.progress} className="h-1" />
                      )}
                    </div>
                    {file.status === "done" && (
                      <CheckCircle className="h-4 w-4 text-success shrink-0" />
                    )}
                    {file.status === "uploading" && (
                      <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{file.progress}%</span>
                    )}
                    <Button variant="ghost" onClick={() => removeFile(file.id)} className="p-0.5 rounded-sm text-muted-foreground/40 hover:text-foreground transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Section>

      <Section title="Button Trigger">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => document.getElementById("file-btn")?.click()}>
              <Upload className="mr-2 h-4 w-4" /> Upload File
            </Button>
            <Button variant="outline" onClick={() => document.getElementById("file-btn-multi")?.click()}>
              <Upload className="mr-2 h-4 w-4" /> Upload Multiple
            </Button>
          </div>
          <input id="file-btn" type="file" className="hidden" onChange={(e) => { if (e.target.files?.length) handleFiles(Array.from(e.target.files)); e.target.value = "" }} />
          <input id="file-btn-multi" type="file" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) handleFiles(Array.from(e.target.files)); e.target.value = "" }} />
        </div>
      </Section>

      <Section title="AttachmentList Component" code={`import { AttachmentList } from "@cherry-studio/ui"

<AttachmentList
  items={[
    { id: "1", name: "report.pdf", size: 245000, type: "application/pdf" },
    { id: "2", name: "photo.png", size: 1200000, type: "image/png" },
  ]}
  onRemove={(id) => console.log("remove", id)}
/>`}>
        <AttachmentList
          items={[
            { id: "a1", name: "Project-Brief.pdf", size: 2450000, type: "application/pdf" },
            { id: "a2", name: "screenshot.png", size: 540000, type: "image/png" },
            { id: "a3", name: "data.csv", size: 12000, type: "text/csv" },
            { id: "a4", name: "profile-photo.jpg", size: 1800000, type: "image/jpeg" },
            { id: "a5", name: "README.md", size: 8200, type: "text/markdown" },
          ]}
          onRemove={() => {}}
        />
      </Section>
    </>
  )
}
