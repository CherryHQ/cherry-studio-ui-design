import React, { useState } from "react"
import { Slider, Progress } from "@cherry-studio/ui"
import { Section } from "../components/Section"

export function SliderProgressDemo() {
  const [value, setValue] = useState([50])
  const [progress, setProgress] = useState(30)

  return (
    <>
      <Section title="Slider">
        <div className="space-y-6 max-w-md">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Value</span>
              <span className="text-muted-foreground">{value[0]}</span>
            </div>
            <Slider value={value} onValueChange={setValue} max={100} step={1} />
          </div>
          <div className="space-y-2">
            <div className="text-sm">Temperature: 0.7</div>
            <Slider defaultValue={[70]} max={100} step={1} />
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Disabled</div>
            <Slider defaultValue={[40]} max={100} disabled />
          </div>
        </div>
      </Section>

      <Section title="Progress">
        <div className="space-y-6 max-w-md">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setProgress(Math.max(0, progress - 10))} className="px-3 py-1 rounded-md border text-sm">-10</button>
            <button onClick={() => setProgress(Math.min(100, progress + 10))} className="px-3 py-1 rounded-md border text-sm">+10</button>
          </div>
        </div>
      </Section>
    </>
  )
}
