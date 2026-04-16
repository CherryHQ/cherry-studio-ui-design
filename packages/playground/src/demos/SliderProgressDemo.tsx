import React, { useState, useEffect } from "react"
import { Slider, Progress, Button } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

export function SliderProgressDemo() {
  const [value, setValue] = useState([50])
  const [range, setRange] = useState([20, 80])
  const [progress, setProgress] = useState(30)
  const [autoProgress, setAutoProgress] = useState(0)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    if (autoProgress >= 100) { setRunning(false); return }
    const timer = setTimeout(() => setAutoProgress((p) => Math.min(100, p + 2)), 50)
    return () => clearTimeout(timer)
  }, [autoProgress, running])

  return (
    <>
      <Section title="Slider" install="npx shadcn@latest add slider" props={[
        { name: "value", type: "number[]", description: "Controlled value" },
        { name: "defaultValue", type: "number[]", description: "Default value" },
        { name: "max", type: "number", default: "100", description: "Maximum value" },
        { name: "step", type: "number", default: "1", description: "Step increment" },
        { name: "onValueChange", type: "(value) => void", description: "Value change handler" },
      ]} code={`import { Slider } from "@cherry-studio/ui"

const [value, setValue] = useState([50])

<Slider value={value} onValueChange={setValue} max={100} step={1} />`}>
        <div className="space-y-6 max-w-md">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Value</span>
              <span className="text-muted-foreground font-mono">{value[0]}</span>
            </div>
            <Slider value={value} onValueChange={setValue} max={100} step={1} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Temperature</span>
              <span className="text-muted-foreground font-mono">0.7</span>
            </div>
            <Slider defaultValue={[70]} max={100} step={1} />
            <p className="text-xs text-muted-foreground">Controls randomness. Lower = more focused, higher = more creative.</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step: 10</span>
              <span className="text-muted-foreground font-mono">50</span>
            </div>
            <Slider defaultValue={[50]} max={100} step={10} />
          </div>
        </div>
      </Section>

      <Section title="Range Slider">
        <div className="space-y-2 max-w-md">
          <div className="flex justify-between text-sm">
            <span>Price Range</span>
            <span className="text-muted-foreground font-mono">${range[0]} — ${range[1]}</span>
          </div>
          <Slider value={range} onValueChange={setRange} max={100} step={1} />
        </div>
      </Section>

      <Section title="Disabled">
        <div className="max-w-md">
          <Slider defaultValue={[40]} max={100} disabled />
        </div>
      </Section>

      <Section title="Progress">
        <div className="space-y-6 max-w-md">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Manual</span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setProgress(Math.max(0, progress - 10))}>-10</Button>
              <Button size="sm" variant="outline" onClick={() => setProgress(Math.min(100, progress + 10))}>+10</Button>
              <Button size="sm" variant="outline" onClick={() => setProgress(0)}>Reset</Button>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Animated Progress">
        <div className="space-y-3 max-w-md">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{autoProgress >= 100 ? "Complete!" : running ? "Uploading..." : "Ready"}</span>
              <span className="text-muted-foreground">{autoProgress}%</span>
            </div>
            <Progress value={autoProgress} />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { setAutoProgress(0); setRunning(true) }}
            disabled={running}
          >
            {running ? "Uploading..." : "Start Upload"}
          </Button>
        </div>
      </Section>

      <Section title="Practical: Settings Sliders">
        <div className="space-y-6 max-w-md rounded-xl border p-4">
          {[
            { label: "Max Tokens", value: 4096, max: 8192, step: 256 },
            { label: "Top P", value: 90, max: 100, step: 5 },
            { label: "Frequency Penalty", value: 0, max: 200, step: 10 },
          ].map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{item.label}</span>
                <span className="text-muted-foreground font-mono text-xs">
                  {item.label === "Top P" ? (item.value / 100).toFixed(2) :
                   item.label === "Frequency Penalty" ? (item.value / 100).toFixed(1) :
                   item.value}
                </span>
              </div>
              <Slider defaultValue={[item.value]} max={item.max} step={item.step} />
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
