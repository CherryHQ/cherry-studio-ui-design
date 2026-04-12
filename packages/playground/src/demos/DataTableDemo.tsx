import React, { useState, useMemo } from "react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Checkbox, Button, Badge, Input,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious, PaginationEllipsis
} from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Search, Trash2, Download, Filter } from "lucide-react"

interface DataRow {
  id: string
  name: string
  provider: string
  tokens: string
  status: "active" | "inactive" | "error"
  calls: number
  cost: number
}

const allData: DataRow[] = [
  { id: "1", name: "GPT-4o", provider: "OpenAI", tokens: "128K", status: "active", calls: 12450, cost: 245.80 },
  { id: "2", name: "GPT-4o Mini", provider: "OpenAI", tokens: "128K", status: "active", calls: 34200, cost: 68.40 },
  { id: "3", name: "Claude Opus 4", provider: "Anthropic", tokens: "200K", status: "active", calls: 8320, cost: 332.80 },
  { id: "4", name: "Claude Sonnet 4", provider: "Anthropic", tokens: "200K", status: "active", calls: 15600, cost: 46.80 },
  { id: "5", name: "Gemini 2.5 Pro", provider: "Google", tokens: "1M", status: "active", calls: 5670, cost: 113.40 },
  { id: "6", name: "Gemini 2.5 Flash", provider: "Google", tokens: "1M", status: "active", calls: 22100, cost: 22.10 },
  { id: "7", name: "DeepSeek V3", provider: "DeepSeek", tokens: "64K", status: "inactive", calls: 1230, cost: 6.15 },
  { id: "8", name: "Qwen 3", provider: "Alibaba", tokens: "32K", status: "active", calls: 3450, cost: 10.35 },
  { id: "9", name: "Llama 4", provider: "Meta", tokens: "128K", status: "inactive", calls: 890, cost: 0 },
  { id: "10", name: "Mistral Large", provider: "Mistral", tokens: "128K", status: "error", calls: 0, cost: 0 },
  { id: "11", name: "Command R+", provider: "Cohere", tokens: "128K", status: "active", calls: 2100, cost: 42.00 },
  { id: "12", name: "Yi-Lightning", provider: "01.AI", tokens: "16K", status: "inactive", calls: 450, cost: 0.90 },
]

type SortField = "name" | "calls" | "cost"
type SortDir = "asc" | "desc"

const dataTableProps: PropDef[] = [
  { name: "columns", type: "ColumnDef[]", default: "required", description: "Column definitions" },
  { name: "data", type: "TData[]", default: "required", description: "Table data" },
  { name: "searchKey", type: "string", default: "undefined", description: "Column key to filter on" },
  { name: "enablePagination", type: "boolean", default: "true", description: "Enable pagination" },
  { name: "pageSize", type: "number", default: "10", description: "Rows per page" },
]

export function DataTableDemo() {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("calls")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [page, setPage] = useState(1)
  const pageSize = 5

  const filtered = useMemo(() => {
    return allData.filter((row) => {
      if (search && !row.name.toLowerCase().includes(search.toLowerCase()) && !row.provider.toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter !== "all" && row.status !== statusFilter) return false
      return true
    })
  }, [search, statusFilter])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1
      if (sortField === "name") return mul * a.name.localeCompare(b.name)
      return mul * ((a[sortField] as number) - (b[sortField] as number))
    })
  }, [filtered, sortField, sortDir])

  const totalPages = Math.ceil(sorted.length / pageSize)
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize)

  const allSelected = paged.length > 0 && paged.every((r) => selected.has(r.id))
  const someSelected = paged.some((r) => selected.has(r.id)) && !allSelected

  const toggleAll = () => {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(paged.map((r) => r.id)))
  }
  const toggleOne = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc")
    else { setSortField(field); setSortDir("desc") }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 ml-1 text-muted-foreground/40" />
    return sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5 ml-1" /> : <ArrowDown className="h-3.5 w-3.5 ml-1" />
  }

  const statusBadge = (status: DataRow["status"]) => {
    const styles = {
      active: "bg-green-500/15 text-green-700 border-green-500/20 dark:text-green-400",
      inactive: "bg-secondary text-secondary-foreground",
      error: "bg-red-500/15 text-red-700 border-red-500/20 dark:text-red-400",
    }
    return <Badge className={`text-[10px] ${styles[status]}`}>{status}</Badge>
  }

  return (
    <Section title="DataTable — Sortable, Filterable, Paginated, Selectable" install="npm install @cherry-studio/ui" props={dataTableProps} code={`<Table>
  <TableHeader>
    <TableRow>
      <TableHead><Checkbox checked={allSelected} onCheckedChange={toggleAll} /></TableHead>
      <TableHead><button onClick={() => handleSort("name")}>Name <ArrowUpDown /></button></TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {rows.map(row => (
      <TableRow key={row.id}>
        <TableCell><Checkbox checked={selected.has(row.id)} onCheckedChange={() => toggle(row.id)} /></TableCell>
        <TableCell>{row.name}</TableCell>
        <TableCell><Badge>{row.status}</Badge></TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>`}>
      <div className="max-w-4xl overflow-x-auto">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative max-w-60">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search models..." className="pl-8 h-8 text-xs" />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
            <SelectTrigger className="w-30 h-8 text-xs">
              <Filter className="h-3 w-3 mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">{selected.size} selected</span>
            <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => setSelected(new Set())}>Clear</Button>
            <Button variant="destructive" size="sm" className="h-7 text-[11px]"><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={allSelected ? true : someSelected ? "indeterminate" : false} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead>
                <button className="flex items-center hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" onClick={() => handleSort("name")}>
                  Model <SortIcon field="name" />
                </button>
              </TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Context</TableHead>
              <TableHead>
                <button className="flex items-center hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" onClick={() => handleSort("calls")}>
                  API Calls <SortIcon field="calls" />
                </button>
              </TableHead>
              <TableHead>
                <button className="flex items-center hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" onClick={() => handleSort("cost")}>
                  Cost <SortIcon field="cost" />
                </button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No results.</TableCell>
              </TableRow>
            ) : paged.map((row) => (
              <TableRow key={row.id} data-state={selected.has(row.id) ? "selected" : undefined}>
                <TableCell><Checkbox checked={selected.has(row.id)} onCheckedChange={() => toggleOne(row.id)} /></TableCell>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.provider}</TableCell>
                <TableCell className="text-muted-foreground">{row.tokens}</TableCell>
                <TableCell className="tabular-nums">{row.calls.toLocaleString()}</TableCell>
                <TableCell className="tabular-nums">${row.cost.toFixed(2)}</TableCell>
                <TableCell>{statusBadge(row.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-muted-foreground">
          Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of {sorted.length} results
        </p>
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage(Math.max(1, page - 1)) }} className={page === 1 ? "pointer-events-none opacity-50" : ""} />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink href="#" isActive={p === page} onClick={(e) => { e.preventDefault(); setPage(p) }}>{p}</PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage(Math.min(totalPages, page + 1)) }} className={page === totalPages ? "pointer-events-none opacity-50" : ""} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      </div>
    </Section>
  )
}
