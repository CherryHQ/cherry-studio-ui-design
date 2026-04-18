import React, { useState } from "react"
import { Input, Button, Label, SocialLoginButton, PromptInput, Separator } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { Eye, EyeOff } from "lucide-react"

const signInProps: PropDef[] = [
  { name: "onSignIn", type: "(email: string, password: string) => void", default: "-", description: "登录回调" },
  { name: "onSocialLogin", type: "(provider: string) => void", default: "-", description: "社交登录回调" },
]

export function SignInDemo() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignIn = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <Section title="Sign In Page" description="Auth page — Figma Sign In screen" props={signInProps} code={`<div className="flex rounded-[var(--radius-window)]">
  <div className="w-[400px] flex flex-col justify-center px-12">
    <h2 className="text-[32px] tracking-[-0.96px]">Sign in to Cherry Studio</h2>
    <SocialLoginButton provider="google" label="Sign in with Google" />
    <Input placeholder="email@email.com" />
    <Input type="password" />
    <Button className="w-full">Sign in</Button>
  </div>
  <div className="flex-1 relative rounded-[var(--radius-button)] overflow-hidden">
    <PromptInput placeholder="Describe your scene..." modelName="Cherry 2.0" />
  </div>
</div>`}>
      <div className="flex rounded-[var(--radius-window)] border bg-background overflow-hidden h-[640px]">
        {/* Left: Form */}
        <div className="w-[400px] flex-shrink-0 flex flex-col items-center justify-center px-12">
          <div className="flex flex-col gap-10 w-full max-w-[320px]">
            {/* Title */}
            <h2 className="text-[32px] font-normal leading-[40px] tracking-[-0.96px] text-center text-foreground">
              Sign in to Cherry&nbsp;Studio
            </h2>

            <div className="flex flex-col gap-6 items-center w-full">
              {/* Google */}
              <SocialLoginButton
                provider="google"
                label="Sign in with Google"
                className="w-full h-11 rounded-[var(--radius-control)] text-sm font-semibold"
              />

              {/* Divider */}
              <div className="flex items-center gap-3 w-full">
                <Separator className="flex-1" />
                <span className="text-[11px] font-medium text-text-tertiary whitespace-nowrap">Or sign in with email</span>
                <Separator className="flex-1" />
              </div>

              {/* Form fields */}
              <div className="flex flex-col gap-4 w-full">
                {/* Email */}
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-medium">Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@email.com"
                    className="h-12 text-[13px]"
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Password</Label>
                    <span className="text-[11px] font-medium text-muted-foreground/70 cursor-pointer hover:text-foreground transition-colors">
                      Forgot password?
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-12 text-[13px] pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sign in button */}
              <Button
                className="w-full h-12 text-sm font-semibold"
                onClick={handleSignIn}
                disabled={loading || !email || !password}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>

              {/* Footer */}
              <p className="text-[11px] font-medium text-muted-foreground">
                Need an account?{" "}
                <a href="#" className="text-primary hover:underline">Sign up</a>
              </p>
            </div>
          </div>
        </div>

        {/* Right: Hero image */}
        <div className="flex-1 relative rounded-[var(--radius-button)] overflow-hidden m-5 bg-muted">
          {/* Placeholder image background */}
          <img
            src="https://picsum.photos/seed/cherry-signin/800/800"
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent from-70% to-black/20" />
          {/* Floating PromptInput + CTA */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 w-[320px]">
            <PromptInput
              value=""
              onChange={() => {}}
              onSubmit={() => {}}
              placeholder="Describe your scene..."
              modelName="Cherry 2.0"
            />
            <p className="text-[13px] text-white/80 font-medium">Try Cherry Studio for free</p>
          </div>
        </div>
      </div>
    </Section>
  )
}
