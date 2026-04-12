import React from "react"
import { CodeBlock } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

const codeBlockProps: PropDef[] = [
  { name: "code", type: "string", description: "Code content to display" },
  { name: "language", type: "string", default: '"plaintext"', description: "Syntax highlight language" },
  { name: "showLineNumbers", type: "boolean", default: "false", description: "Show line numbers" },
]

const tsExample = `interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user"
}

function getUser(id: string): Promise<User> {
  return fetch(\`/api/users/\${id}\`)
    .then(res => res.json())
}`

const pyExample = `import pandas as pd

df = pd.read_csv("data.csv")
summary = df.groupby("category").agg(
    count=("id", "count"),
    avg_price=("price", "mean"),
)
print(summary.head())`

const jsonExample = `{
  "model": "claude-sonnet-4",
  "temperature": 0.7,
  "max_tokens": 4096,
  "tools": ["web_search", "code_exec"]
}`

const cssExample = `.cherry-card {
  --card-radius: 12px;
  border-radius: var(--card-radius);
  background: hsl(var(--card));
  box-shadow: 0 1px 3px rgba(0,0,0,.08);
}`

const longCode = `import { createContext, useContext, useState, useMemo, ReactNode } from "react"

interface ThemeContextType {
  theme: "light" | "dark"
  setTheme: (theme: "light" | "dark") => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  const value = useMemo(() => ({
    theme,
    setTheme,
    toggleTheme: () => setTheme(t => t === "light" ? "dark" : "light"),
  }), [theme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}`

export function CodeBlockDemo() {
  return (
    <>
      <Section title="Basic Code Block" install="npm install @cherry-studio/ui" props={codeBlockProps} code={`import { CodeBlock } from "@cherry-studio/ui"

<CodeBlock language="typescript" code={code} />`}>
        <div className="max-w-lg">
          <CodeBlock language="typescript" code={tsExample} />
        </div>
      </Section>

      <Section title="Multiple Languages">
        <div className="max-w-lg space-y-3">
          <CodeBlock language="python" code={pyExample} />
          <CodeBlock language="json" code={jsonExample} />
          <CodeBlock language="css" code={cssExample} />
        </div>
      </Section>

      <Section title="Line Numbers">
        <div className="max-w-lg space-y-3">
          <p className="text-xs text-muted-foreground mb-1">showLineNumbers = true</p>
          <CodeBlock language="typescript" code={tsExample} showLineNumbers />
          <p className="text-xs text-muted-foreground mb-1 mt-4">showLineNumbers = false (default)</p>
          <CodeBlock language="typescript" code={tsExample} />
        </div>
      </Section>

      <Section title="Long Code">
        <div className="max-w-lg">
          <CodeBlock language="tsx" code={longCode} showLineNumbers />
        </div>
      </Section>
    </>
  )
}
