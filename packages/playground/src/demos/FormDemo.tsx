import React, { useState } from "react"
import {
  Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Checkbox, Textarea, Badge
} from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { Loader2, CheckCircle } from "lucide-react"

const formProps: PropDef[] = [
  { name: "onSubmit", type: "(values: Record<string, unknown>) => void", default: "undefined", description: "Form submit handler" },
  { name: "className", type: "string", default: "undefined", description: "Additional CSS" },
]

export function FormDemo() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const data = new FormData(form)
    const newErrors: Record<string, string> = {}

    if (!data.get("firstName")) newErrors.firstName = "First name is required."
    if (!data.get("email")) newErrors.email = "Email is required."
    if (!data.get("role")) newErrors.role = "Please select a role."

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    }, 1500)
  }

  return (
    <>
      <Section title="Form Layout" install="npx shadcn@latest add form" props={formProps} code={`import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@cherry-studio/ui"

<form className="space-y-6">
  <div className="space-y-2">
    <Label htmlFor="name">Name</Label>
    <Input id="name" placeholder="John Doe" />
  </div>
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" placeholder="john@example.com" />
  </div>
  <Button type="submit">Submit</Button>
</form>`}>
        <form className="space-y-6 max-w-lg" noValidate onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="John" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" placeholder="Doe" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailForm">Email</Label>
            <Input id="emailForm" placeholder="john@example.com" />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio-form">Bio</Label>
            <Textarea id="bio-form" placeholder="Tell us about yourself..." />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="agree" />
            <Label htmlFor="agree">I agree to the terms of service</Label>
          </div>
          <div className="flex gap-3">
            <Button type="submit">Submit</Button>
            <Button type="button" variant="outline">Cancel</Button>
          </div>
        </form>
      </Section>

      <Section title="With Validation & Feedback">
        <form className="space-y-5 max-w-lg" noValidate onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="v-first" className={errors.firstName ? "text-destructive" : ""}>
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="v-first"
                name="firstName"
                placeholder="John"
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-last">Last Name</Label>
              <Input id="v-last" name="lastName" placeholder="Doe" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="v-email" className={errors.email ? "text-destructive" : ""}>
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="v-email"
              name="email"
              placeholder="john@example.com"
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label className={errors.role ? "text-destructive" : ""}>
              Role <span className="text-destructive">*</span>
            </Label>
            <Select name="role">
              <SelectTrigger aria-invalid={!!errors.role}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
          </div>

          <div className="flex gap-3 items-center">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Submitting..." : "Submit"}
            </Button>
            <Button type="button" variant="outline">Cancel</Button>
            {submitted && (
              <Badge variant="outline" className="bg-success-muted text-success border-success/20 gap-1">
                <CheckCircle className="h-3 w-3" /> Saved successfully
              </Badge>
            )}
          </div>
        </form>
      </Section>

      <Section title="Disabled Form">
        <fieldset disabled className="space-y-4 max-w-lg opacity-60">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input defaultValue="admin@cherrystudio.dev" />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input defaultValue="Administrator" />
          </div>
          <Button>Save Changes</Button>
        </fieldset>
      </Section>
    </>
  )
}
