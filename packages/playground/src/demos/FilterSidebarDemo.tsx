import React, { useState } from "react"
import {
  FilterSidebar, FilterSection, FilterItem,
  TreeNav, TreeNavGroup, type TreeNavItem, Badge, Input
} from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import {
  Inbox, Clock, Star, Trash2, FileText, Image, Code, Music, Video,
  Folder, Tag, Search, Bot, BookOpen, Puzzle
} from "lucide-react"

export function FilterSidebarDemo() {
  const [activeFilter, setActiveFilter] = useState("all")
  const [activeType, setActiveType] = useState("")
  const [libraryFilter, setLibraryFilter] = useState("all")

  return (
    <>
      <Section title="File Manager Sidebar" install="npm install @cherry-studio/ui" props={[
        { name: "width", type: "number", default: "220", description: "Sidebar width in px" },
      ]} code={`import { FilterSidebar, FilterSection, FilterItem } from "@cherry-studio/ui"

<FilterSidebar width={200}>
  <FilterSection title="Library">
    <FilterItem icon={<Inbox />} label="All" count={156} active />
    <FilterItem icon={<Star />} label="Starred" count={8} />
  </FilterSection>
</FilterSidebar>`}>
        <div className="h-[400px] rounded-xl border overflow-hidden">
          <FilterSidebar width={200}>
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                <Input placeholder="Search files..." className="h-7 pl-7 text-xs" />
              </div>
            </div>

            <FilterSection title="Library">
              <FilterItem icon={<Inbox />} label="All Files" count={156} active={activeFilter === "all"} onClick={() => setActiveFilter("all")} />
              <FilterItem icon={<Clock />} label="Recent" count={12} active={activeFilter === "recent"} onClick={() => setActiveFilter("recent")} />
              <FilterItem icon={<Star />} label="Starred" count={8} active={activeFilter === "starred"} onClick={() => setActiveFilter("starred")} />
              <FilterItem icon={<Trash2 />} label="Trash" count={3} active={activeFilter === "trash"} onClick={() => setActiveFilter("trash")} />
            </FilterSection>

            <FilterSection title="File Types">
              <FilterItem icon={<FileText />} label="Documents" count={45} active={activeType === "doc"} onClick={() => setActiveType(activeType === "doc" ? "" : "doc")} />
              <FilterItem icon={<Image />} label="Images" count={32} active={activeType === "img"} onClick={() => setActiveType(activeType === "img" ? "" : "img")} />
              <FilterItem icon={<Code />} label="Code" count={67} active={activeType === "code"} onClick={() => setActiveType(activeType === "code" ? "" : "code")} />
              <FilterItem icon={<Music />} label="Audio" count={8} active={activeType === "audio"} onClick={() => setActiveType(activeType === "audio" ? "" : "audio")} />
              <FilterItem icon={<Video />} label="Video" count={4} active={activeType === "video"} onClick={() => setActiveType(activeType === "video" ? "" : "video")} />
            </FilterSection>

            <FilterSection title="Folders">
              <TreeNav
                items={[
                  { id: "projects", label: "Projects", icon: <Folder className="text-accent-blue" />, count: 23, children: [
                    { id: "cherry-v2", label: "Cherry V2", icon: <Folder className="text-accent-blue" />, count: 15 },
                    { id: "website", label: "Website", icon: <Folder className="text-accent-blue" />, count: 8 },
                  ]},
                  { id: "assets", label: "Assets", icon: <Folder className="text-accent-amber" />, count: 45 },
                  { id: "archive", label: "Archive", icon: <Folder className="text-muted-foreground" />, count: 12 },
                ]}
                defaultExpanded={["projects"]}
                onSelect={() => {}}
              />
            </FilterSection>

            <FilterSection title="Tags">
              <FilterItem icon={<Tag />} label="Important" count={5} />
              <FilterItem icon={<Tag />} label="Draft" count={12} />
              <FilterItem icon={<Tag />} label="Shared" count={3} />
            </FilterSection>
          </FilterSidebar>
        </div>
      </Section>

      <Section title="Library/Resource Sidebar">
        <div className="h-[350px] rounded-xl border overflow-hidden">
          <FilterSidebar width={200}>
            <FilterSection>
              <FilterItem icon={<Inbox />} label="All Resources" count={86} active={libraryFilter === "all"} onClick={() => setLibraryFilter("all")} />
            </FilterSection>

            <FilterSection title="Categories">
              <FilterItem icon={<Bot />} label="Assistants" count={12} active={libraryFilter === "assistant"} onClick={() => setLibraryFilter("assistant")} />
              <FilterItem icon={<Bot />} label="Agents" count={8} active={libraryFilter === "agent"} onClick={() => setLibraryFilter("agent")} />
              <FilterItem icon={<BookOpen />} label="Knowledge" count={5} active={libraryFilter === "knowledge"} onClick={() => setLibraryFilter("knowledge")} />
              <FilterItem icon={<Puzzle />} label="Plugins" count={15} active={libraryFilter === "plugin"} onClick={() => setLibraryFilter("plugin")} />
            </FilterSection>

            <FilterSection title="Tags">
              <div className="flex flex-wrap gap-1 px-1">
                {["Coding", "Writing", "Research", "Chat", "Tools"].map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px] cursor-pointer hover:bg-accent">
                    {tag}
                  </Badge>
                ))}
              </div>
            </FilterSection>
          </FilterSidebar>
        </div>
      </Section>

      <Section title="Minimal Sidebar">
        <div className="h-[250px] rounded-xl border overflow-hidden">
          <FilterSidebar width={180}>
            <FilterSection>
              <FilterItem label="Inbox" count={24} active />
              <FilterItem label="Sent" count={156} />
              <FilterItem label="Drafts" count={3} />
              <FilterItem label="Spam" count={12} />
              <FilterItem label="Trash" />
            </FilterSection>
          </FilterSidebar>
        </div>
      </Section>
    </>
  )
}
