import React, { useState } from "react"
import {
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,
  Badge, Checkbox, Button
} from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { ArrowUpDown, MoreHorizontal, Trash2 } from "lucide-react"

const data = [
  { id: "1", model: "GPT-4o", provider: "OpenAI", tokens: "128K", status: "active", calls: 12450 },
  { id: "2", model: "Claude Opus 4", provider: "Anthropic", tokens: "200K", status: "active", calls: 8320 },
  { id: "3", model: "Gemini 2.5 Pro", provider: "Google", tokens: "1M", status: "active", calls: 5670 },
  { id: "4", model: "DeepSeek V3", provider: "DeepSeek", tokens: "64K", status: "inactive", calls: 1230 },
  { id: "5", model: "Qwen 3", provider: "Alibaba", tokens: "32K", status: "active", calls: 3450 },
  { id: "6", model: "Llama 4", provider: "Meta", tokens: "128K", status: "inactive", calls: 890 },
]

export function TableDemo() {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<"calls" | null>(null)
  const [sortAsc, setSortAsc] = useState(true)

  const allSelected = selected.size === data.length
  const someSelected = selected.size > 0 && !allSelected

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(data.map((d) => d.id)))
    }
  }

  const toggleOne = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const sorted = [...data].sort((a, b) => {
    if (!sortField) return 0
    return sortAsc ? a[sortField] - b[sortField] : b[sortField] - a[sortField]
  })

  const handleSort = () => {
    if (sortField === "calls") {
      setSortAsc(!sortAsc)
    } else {
      setSortField("calls")
      setSortAsc(false)
    }
  }

  return (
    <>
      <Section title="Basic Table" install="npx shadcn@latest add table" props={[
        { name: "className", type: "string", description: "Additional CSS classes" },
      ]} code={`import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@cherry-studio/ui"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>GPT-4o</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  </TableBody>
</Table>`}>
        <div className="max-w-3xl overflow-x-auto">
        <Table>
          <TableCaption>Available AI models</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Model</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Context</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, 5).map((row) => (
              <TableRow key={row.model}>
                <TableCell className="font-medium">{row.model}</TableCell>
                <TableCell>{row.provider}</TableCell>
                <TableCell>{row.tokens}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={row.status === "active" ? "default" : "secondary"}>
                    {row.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </Section>

      <Section title="With Selection & Sorting">
        {selected.size > 0 && (
          <div className="flex items-center gap-2 mb-3 text-sm">
            <span className="text-muted-foreground">{selected.size} selected</span>
            <Button variant="outline" size="sm" onClick={() => setSelected(new Set())}>Clear</Button>
            <Button variant="destructive" size="sm"><Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete</Button>
          </div>
        )}
        <div className="max-w-3xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Context</TableHead>
              <TableHead>
                <button className="flex items-center gap-1 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" onClick={handleSort}>
                  API Calls <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row) => (
              <TableRow key={row.id} data-state={selected.has(row.id) ? "selected" : undefined}>
                <TableCell>
                  <Checkbox checked={selected.has(row.id)} onCheckedChange={() => toggleOne(row.id)} />
                </TableCell>
                <TableCell className="font-medium">{row.model}</TableCell>
                <TableCell>{row.provider}</TableCell>
                <TableCell>{row.tokens}</TableCell>
                <TableCell>{row.calls.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={row.status === "active" ? "default" : "secondary"}>
                    {row.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </Section>

      <Section title="Empty State">
        <div className="max-w-3xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                No results found.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        </div>
      </Section>
    </>
  )
}
