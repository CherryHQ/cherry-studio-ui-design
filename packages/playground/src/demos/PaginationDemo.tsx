import React, { useState } from "react"
import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious, Button
} from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

function InteractivePagination({ totalPages = 10 }: { totalPages?: number }) {
  const [currentPage, setCurrentPage] = useState(1)

  const getVisiblePages = () => {
    const pages: (number | "ellipsis")[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }
    pages.push(1)
    if (currentPage > 3) pages.push("ellipsis")
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push("ellipsis")
    pages.push(totalPages)
    return pages
  }

  return (
    <div className="space-y-3">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.max(1, p - 1)) }}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          {getVisiblePages().map((page, i) => (
            <PaginationItem key={`${page}-${i}`}>
              {page === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={(e) => { e.preventDefault(); setCurrentPage(page) }}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.min(totalPages, p + 1)) }}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <p className="text-sm text-center text-muted-foreground">
        Page <span className="text-foreground font-medium">{currentPage}</span> of {totalPages}
      </p>
    </div>
  )
}

export function PaginationDemo() {
  return (
    <>
      <Section title="Basic" install="npx shadcn@latest add pagination" props={[
        { name: "className", type: "string", default: "undefined", description: "Additional CSS" },
      ]} code={`import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@cherry-studio/ui"

<Pagination>
  <PaginationContent>
    <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
    <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
    <PaginationItem><PaginationNext href="#" /></PaginationItem>
  </PaginationContent>
</Pagination>`}>
        <Pagination>
          <PaginationContent>
            <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
            <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
            <PaginationItem><PaginationLink href="#" isActive>2</PaginationLink></PaginationItem>
            <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
            <PaginationItem><PaginationEllipsis /></PaginationItem>
            <PaginationItem><PaginationNext href="#" /></PaginationItem>
          </PaginationContent>
        </Pagination>
      </Section>

      <Section title="Interactive Pagination">
        <InteractivePagination totalPages={20} />
      </Section>

      <Section title="Compact (Few Pages)">
        <InteractivePagination totalPages={5} />
      </Section>

      <Section title="With Summary">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Showing 1-10 of 97 results</p>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem><PaginationPrevious href="#" className="pointer-events-none opacity-50" /></PaginationItem>
              <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
              <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
              <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
              <PaginationItem><PaginationEllipsis /></PaginationItem>
              <PaginationItem><PaginationLink href="#">10</PaginationLink></PaginationItem>
              <PaginationItem><PaginationNext href="#" /></PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </Section>

      <Section title="Simple (Prev/Next Only)">
        <div className="flex items-center justify-between max-w-sm">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <span className="text-sm text-muted-foreground">Page 1 of 5</span>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </Section>
    </>
  )
}
