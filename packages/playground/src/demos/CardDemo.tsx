import React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Button, Badge } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Bot, Sparkles, Zap } from "lucide-react"

export function CardDemo() {
  return (
    <Section title="Card">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">AI Assistant</CardTitle>
                <CardDescription>Smart conversation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">A versatile assistant powered by large language models.</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Badge variant="secondary">Free</Badge>
            <Button size="sm">Start</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <CardTitle className="text-base">Image Gen</CardTitle>
                <CardDescription>AI image generation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Generate stunning images from text prompts.</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Badge variant="secondary">Pro</Badge>
            <Button size="sm" variant="outline">Upgrade</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-base">Quick Actions</CardTitle>
                <CardDescription>Workflow automation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Automate repetitive tasks with custom workflows.</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Badge>New</Badge>
            <Button size="sm">Try</Button>
          </CardFooter>
        </Card>
      </div>
    </Section>
  )
}
