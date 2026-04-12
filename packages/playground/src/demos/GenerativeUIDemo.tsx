import React, { useState } from "react"
import {
  Button, Badge, Card, RadioGroup, RadioGroupItem, Label,
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { AlertTriangle, Check } from "lucide-react"

export function GenerativeUIDemo() {
  const [selected, setSelected] = useState<string | null>(null)
  const [radioValue, setRadioValue] = useState("")

  const pillOptions = ["Summarize", "Explain simply", "Translate to English", "Fix grammar", "Make shorter"]

  return (
    <>
      <Section title="Button Selection (Prompt + Pills)" code={`// AI suggests actions as pill buttons
<div className="flex flex-wrap gap-2">
  {options.map(opt => (
    <Button key={opt} variant={selected === opt ? "default" : "outline"} size="sm"
      onClick={() => setSelected(opt)} disabled={!!selected}>
      {opt}
    </Button>
  ))}
</div>`}>
        <div className="max-w-md space-y-3">
          <Card className="p-3">
            <p className="text-xs text-muted-foreground mb-2">What would you like to do with this text?</p>
            <div className="flex flex-wrap gap-1.5">
              {pillOptions.map((opt) => (
                <Button
                  key={opt}
                  variant={selected === opt ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setSelected(opt)}
                  disabled={selected !== null && selected !== opt}
                >
                  {selected === opt && <Check className="size-3 mr-1" />}
                  {opt}
                </Button>
              ))}
            </div>
            {selected && (
              <div className="mt-3 pt-2 border-t">
                <p className="text-xs text-muted-foreground">Selected: <span className="text-foreground font-medium">{selected}</span></p>
                <Button variant="ghost" size="sm" className="text-xs h-6 mt-1 px-2" onClick={() => setSelected(null)}>
                  Reset
                </Button>
              </div>
            )}
          </Card>
        </div>
      </Section>

      <Section title="Radio Selection (Single Choice)">
        <div className="max-w-md">
          <Card className="p-3 space-y-3">
            <p className="text-xs text-muted-foreground">Choose a response style:</p>
            <RadioGroup value={radioValue} onValueChange={setRadioValue} className="space-y-2">
              {[
                { value: "concise", label: "Concise", desc: "Brief and to the point" },
                { value: "detailed", label: "Detailed", desc: "Comprehensive with examples" },
                { value: "step-by-step", label: "Step by Step", desc: "Structured walkthrough" },
              ].map((opt) => (
                <div key={opt.value} className="flex items-start space-x-2.5 rounded-md border p-2.5 hover:bg-accent/30 transition-colors">
                  <RadioGroupItem value={opt.value} id={opt.value} className="mt-0.5" />
                  <Label htmlFor={opt.value} className="flex-1 cursor-pointer">
                    <div className="text-xs font-medium">{opt.label}</div>
                    <div className="text-[10px] text-muted-foreground">{opt.desc}</div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {radioValue && (
              <Badge variant="secondary" className="text-[10px]">
                <Check className="size-2.5 mr-1" /> {radioValue}
              </Badge>
            )}
          </Card>
        </div>
      </Section>

      <Section title="Destructive Confirmation">
        <div className="max-w-md">
          <Card className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-destructive" />
              <p className="text-xs font-medium">This action will delete all conversation history.</p>
            </div>
            <p className="text-[10px] text-muted-foreground">This cannot be undone. All messages, attachments, and settings will be permanently removed.</p>
            <div className="flex gap-2 pt-1">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="text-xs h-7">Delete All</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>This will permanently delete all conversation history. This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button variant="outline" size="sm" className="text-xs h-7">Cancel</Button>
            </div>
          </Card>
        </div>
      </Section>
    </>
  )
}
