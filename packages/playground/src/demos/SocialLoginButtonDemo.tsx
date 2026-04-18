import React, { useState } from "react"
import { SocialLoginButton } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

const socialLoginProps: PropDef[] = [
  { name: "provider", type: '"google" | "apple" | "github" | "microsoft"', default: "-", description: "OAuth 服务提供商" },
  { name: "label", type: "string", default: "auto", description: "按钮文字" },
  { name: "onClick", type: "() => void", default: "-", description: "点击回调" },
  { name: "disabled", type: "boolean", default: "false", description: "是否禁用" },
  { name: "loading", type: "boolean", default: "false", description: "��载状态" },
]

export function SocialLoginButtonDemo() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleClick = (provider: string) => {
    setLoading(provider)
    setTimeout(() => setLoading(null), 2000)
  }

  return (
    <>
      <Section title="Social Login Buttons" props={socialLoginProps} code={`import { SocialLoginButton } from "@cherry-studio/ui"

<SocialLoginButton provider="google" onClick={() => {}} />
<SocialLoginButton provider="github" onClick={() => {}} />`}>
        <div className="space-y-2 max-w-sm">
          <SocialLoginButton provider="google" onClick={() => handleClick("google")} loading={loading === "google"} />
          <SocialLoginButton provider="apple" onClick={() => handleClick("apple")} loading={loading === "apple"} />
          <SocialLoginButton provider="github" onClick={() => handleClick("github")} loading={loading === "github"} />
          <SocialLoginButton provider="microsoft" onClick={() => handleClick("microsoft")} loading={loading === "microsoft"} />
        </div>
      </Section>

      <Section title="Custom Labels">
        <div className="space-y-2 max-w-sm">
          <SocialLoginButton provider="google" label="使用 Google 账号登录" />
          <SocialLoginButton provider="github" label="GitHub 登录" />
        </div>
      </Section>

      <Section title="Disabled State">
        <div className="space-y-2 max-w-sm">
          <SocialLoginButton provider="google" disabled />
          <SocialLoginButton provider="apple" disabled />
        </div>
      </Section>
    </>
  )
}
