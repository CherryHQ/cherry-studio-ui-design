import React, { useState } from "react"
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator, Badge, Button, } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

export function InputOtpDemo() {
  const [value6, setValue6] = useState("")
  const [value4, setValue4] = useState("")
  const [completed, setCompleted] = useState(false)

  return (
    <>
      <Section title="6-Digit Code" install="npx shadcn@latest add input-otp" props={[
        { name: "maxLength", type: "number", description: "Number of input slots" },
        { name: "value", type: "string", default: "undefined", description: "Controlled value" },
        { name: "onChange", type: "(value) => void", default: "undefined", description: "Change handler" },
        { name: "onComplete", type: "() => void", default: "undefined", description: "Called when all slots filled" },
      ]} code={`import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator Button, } from "@cherry-studio/ui"

<InputOTP maxLength={6} value={value} onChange={setValue}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>`}>
        <div className="space-y-3">
          <InputOTP maxLength={6} value={value6} onChange={setValue6}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <p className="text-sm text-muted-foreground">
            Entered: <span className="font-mono text-foreground">{value6 || "—"}</span>
            {value6.length === 6 && <Badge className="ml-2" variant="secondary">Complete</Badge>}
          </p>
        </div>
      </Section>

      <Section title="4-Digit PIN">
        <div className="space-y-3">
          <InputOTP maxLength={4} value={value4} onChange={setValue4}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
          <p className="text-sm text-muted-foreground">
            {value4.length === 4 ? "PIN entered" : `${4 - value4.length} digits remaining`}
          </p>
        </div>
      </Section>

      <Section title="With Completion Callback">
        <div className="space-y-3">
          <InputOTP
            maxLength={6}
            onComplete={() => setCompleted(true)}
            onChange={() => setCompleted(false)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          {completed && (
            <p className="text-sm text-success font-medium">
              Verification code submitted!
            </p>
          )}
        </div>
      </Section>

      <Section title="Disabled">
        <InputOTP maxLength={6} disabled value="123456">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </Section>

      <Section title="Practical: Verification Flow">
        <div className="max-w-sm space-y-4 rounded-xl border p-6">
          <div className="space-y-1.5 text-center">
            <h4 className="text-lg font-semibold">Verify your email</h4>
            <p className="text-sm text-muted-foreground">
              We sent a 6-digit code to <span className="font-medium text-foreground">user@example.com</span>
            </p>
          </div>
          <div className="flex justify-center">
            <InputOTP maxLength={6}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Didn't receive the code?{" "}
            <Button variant="ghost" className="text-primary hover:underline font-medium focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">Resend</Button>
          </p>
        </div>
      </Section>
    </>
  )
}
