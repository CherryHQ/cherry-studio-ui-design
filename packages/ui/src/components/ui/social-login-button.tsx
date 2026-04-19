"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Spinner } from "./spinner"
import { GoogleLogo, GitHubLogo, MicrosoftLogo } from "./brand-logos"

type SocialProvider = "google" | "apple" | "github" | "microsoft"

interface SocialLoginButtonProps extends Omit<React.ComponentProps<typeof Button>, "children"> {
  provider: SocialProvider
  label?: string
  loading?: boolean
}

function AppleIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  )
}

const providerConfig: Record<SocialProvider, {
  icon: React.ComponentType<{ size?: number; className?: string }>
  defaultLabel: string
}> = {
  google: { icon: GoogleLogo, defaultLabel: "Continue with Google" },
  apple: { icon: AppleIcon, defaultLabel: "Continue with Apple" },
  github: { icon: GitHubLogo, defaultLabel: "Continue with GitHub" },
  microsoft: { icon: MicrosoftLogo, defaultLabel: "Continue with Microsoft" },
}

function SocialLoginButton({
  provider, label, loading, disabled, className, ...props
}: SocialLoginButtonProps) {
  const config = providerConfig[provider]
  const Icon = config.icon

  return (
    <Button
      data-slot="social-login-button"
      variant="secondary"
      disabled={disabled || loading}
      className={cn(
        "w-full gap-2.5 rounded-[var(--radius-button)] text-sm font-medium",
        className
      )}
      {...props}
    >
      {loading ? <Spinner className="size-4" /> : <Icon size={18} />}
      <span>{label || config.defaultLabel}</span>
    </Button>
  )
}

export { SocialLoginButton }
export type { SocialLoginButtonProps, SocialProvider }
