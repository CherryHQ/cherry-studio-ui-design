import React from "react"
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@cherry-studio/ui"
import { Section } from "../components/Section"

export function InputOtpDemo() {
  return (
    <Section title="Input OTP">
      <div className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground mb-3">6-digit code</p>
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
      </div>
    </Section>
  )
}
