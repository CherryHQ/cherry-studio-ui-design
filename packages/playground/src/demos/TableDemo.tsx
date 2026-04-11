import React from "react"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow, Badge } from "@cherry-studio/ui"
import { Section } from "../components/Section"

const data = [
  { model: "GPT-4o", provider: "OpenAI", tokens: "128K", status: "active" },
  { model: "Claude Opus 4", provider: "Anthropic", tokens: "200K", status: "active" },
  { model: "Gemini 2.5 Pro", provider: "Google", tokens: "1M", status: "active" },
  { model: "DeepSeek V3", provider: "DeepSeek", tokens: "64K", status: "inactive" },
  { model: "Qwen 3", provider: "Alibaba", tokens: "32K", status: "active" },
]

export function TableDemo() {
  return (
    <Section title="Table">
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
          {data.map((row) => (
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
    </Section>
  )
}
