import React, { useState } from "react"
import { TreeNav, TreeNavGroup, type TreeNavItem } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import {
  Folder, FolderOpen, FileText, Image, Code, Music,
  Star, Clock, Trash2, Tag, BookOpen, Database, Bot
} from "lucide-react"

const fileTree: TreeNavItem[] = [
  {
    id: "src",
    label: "src",
    icon: <Folder className="text-accent-blue" />,
    children: [
      {
        id: "components",
        label: "components",
        icon: <Folder className="text-accent-blue" />,
        children: [
          { id: "button.tsx", label: "button.tsx", icon: <Code className="text-accent-emerald" />, count: 46 },
          { id: "input.tsx", label: "input.tsx", icon: <Code className="text-accent-emerald" />, count: 32 },
          { id: "dialog.tsx", label: "dialog.tsx", icon: <Code className="text-accent-emerald" />, count: 58 },
        ],
      },
      {
        id: "features",
        label: "features",
        icon: <Folder className="text-accent-blue" />,
        children: [
          { id: "chat", label: "chat", icon: <Folder className="text-accent-blue" />, children: [
            { id: "ChatPage.tsx", label: "ChatPage.tsx", icon: <Code className="text-accent-emerald" /> },
            { id: "Composer.tsx", label: "Composer.tsx", icon: <Code className="text-accent-emerald" /> },
          ]},
          { id: "settings", label: "settings", icon: <Folder className="text-accent-blue" />, children: [
            { id: "SettingsPage.tsx", label: "SettingsPage.tsx", icon: <Code className="text-accent-emerald" /> },
          ]},
        ],
      },
      { id: "App.tsx", label: "App.tsx", icon: <Code className="text-accent-emerald" /> },
      { id: "main.tsx", label: "main.tsx", icon: <Code className="text-accent-emerald" /> },
    ],
  },
  { id: "README.md", label: "README.md", icon: <FileText className="text-muted-foreground" /> },
  { id: "package.json", label: "package.json", icon: <FileText className="text-accent-amber" /> },
]

const knowledgeTree: TreeNavItem[] = [
  {
    id: "work",
    label: "Work",
    icon: <Database className="text-accent-blue" />,
    count: 3,
    children: [
      { id: "api-docs", label: "API Documentation", icon: <BookOpen />, count: 24 },
      { id: "design-spec", label: "Design Specification", icon: <BookOpen />, count: 12 },
      { id: "onboarding", label: "Onboarding Guide", icon: <BookOpen />, count: 8 },
    ],
  },
  {
    id: "personal",
    label: "Personal",
    icon: <Database className="text-accent-violet" />,
    count: 2,
    children: [
      { id: "notes", label: "Meeting Notes", icon: <BookOpen />, count: 45 },
      { id: "research", label: "AI Research", icon: <BookOpen />, count: 18 },
    ],
  },
]

export function TreeNavDemo() {
  const [fileActive, setFileActive] = useState("button.tsx")
  const [kbActive, setKbActive] = useState("api-docs")

  return (
    <>
      <Section title="File Explorer" install="npm install @cherry-studio/ui" props={[
          { name: "items", type: "TreeNavItem[]", description: "Tree nodes array" },
          { name: "activeId", type: "string", default: "undefined", description: "Selected node ID" },
          { name: "defaultExpanded", type: "string[]", default: "undefined", description: "Initially expanded IDs" },
          { name: "onSelect", type: "(id: string) => void", default: "undefined", description: "Selection handler" },
        ]} code={`import { TreeNav, type TreeNavItem } from "@cherry-studio/ui"

const items: TreeNavItem[] = [
  { id: "src", label: "src", children: [
    { id: "app.tsx", label: "App.tsx" },
  ]},
]

<TreeNav items={items} activeId="app.tsx" onSelect={setActive} />`}>
        <div className="max-w-xs rounded-[12px] border bg-card p-2">
          <TreeNav
            items={fileTree}
            activeId={fileActive}
            defaultExpanded={["src", "components"]}
            onSelect={setFileActive}
          />
        </div>
      </Section>

      <Section title="Knowledge Base Tree">
        <div className="max-w-xs rounded-[12px] border bg-card p-2">
          <TreeNav
            items={knowledgeTree}
            activeId={kbActive}
            defaultExpanded={["work", "personal"]}
            onSelect={setKbActive}
          />
        </div>
      </Section>

      <Section title="With Groups">
        <div className="max-w-xs rounded-[12px] border bg-card p-2 space-y-1">
          <TreeNavGroup title="Favorites">
            <TreeNav
              items={[
                { id: "starred", label: "Starred", icon: <Star className="text-accent-amber" />, count: 5 },
                { id: "recent", label: "Recent", icon: <Clock />, count: 12 },
              ]}
              activeId="starred"
              onSelect={() => {}}
            />
          </TreeNavGroup>
          <TreeNavGroup title="Folders" defaultOpen>
            <TreeNav
              items={[
                { id: "docs", label: "Documents", icon: <Folder className="text-accent-blue" />, count: 23, children: [
                  { id: "reports", label: "Reports", icon: <Folder className="text-accent-blue" />, count: 8 },
                  { id: "drafts", label: "Drafts", icon: <Folder className="text-accent-blue" />, count: 3 },
                ]},
                { id: "images", label: "Images", icon: <Folder className="text-accent-emerald" />, count: 45 },
                { id: "audio", label: "Audio", icon: <Folder className="text-accent-violet" />, count: 7 },
              ]}
              defaultExpanded={["docs"]}
              onSelect={() => {}}
            />
          </TreeNavGroup>
          <TreeNavGroup title="Tags">
            <TreeNav
              items={[
                { id: "tag-react", label: "React", icon: <Tag />, count: 15 },
                { id: "tag-design", label: "Design", icon: <Tag />, count: 8 },
                { id: "tag-api", label: "API", icon: <Tag />, count: 22 },
              ]}
              onSelect={() => {}}
            />
          </TreeNavGroup>
        </div>
      </Section>

      <Section title="Deeply Nested">
        <div className="max-w-xs rounded-[12px] border bg-card p-2">
          <TreeNav
            items={[
              { id: "root", label: "Root", icon: <Folder />, children: [
                { id: "l1", label: "Level 1", icon: <Folder />, children: [
                  { id: "l2", label: "Level 2", icon: <Folder />, children: [
                    { id: "l3", label: "Level 3", icon: <Folder />, children: [
                      { id: "deep-file", label: "deep-file.ts", icon: <Code className="text-accent-emerald" /> },
                    ]},
                  ]},
                ]},
              ]},
            ]}
            defaultExpanded={["root", "l1", "l2", "l3"]}
            onSelect={() => {}}
          />
        </div>
      </Section>
    </>
  )
}
