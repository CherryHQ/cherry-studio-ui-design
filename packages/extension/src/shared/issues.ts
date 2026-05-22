import type { Annotation } from "@cherry-studio/ui"
import { generateSingleAnnotationPrompt } from "@cherry-studio/ui"
import type { ExtensionSettings } from "./storage"

/**
 * One-click issue creation in GitHub or Linear. Uses lightweight REST APIs
 * (no SDK dependency). Tokens are stored in chrome.storage.local.
 */

export interface CreatedIssue {
  url: string
  id: string
  tracker: "github" | "linear"
}

export async function createIssue(
  annotation: Annotation,
  settings: ExtensionSettings,
): Promise<CreatedIssue> {
  if (settings.issueTracker === "github") {
    return createGitHubIssue(annotation, settings)
  }
  if (settings.issueTracker === "linear") {
    return createLinearIssue(annotation, settings)
  }
  throw new Error("No issue tracker configured. Open extension settings.")
}

function buildIssueBody(annotation: Annotation): string {
  const lines: string[] = [
    `**Page**: ${annotation.origin || "—"}${annotation.page}`,
    "",
    `**${annotation.category.toUpperCase()}**: ${annotation.comment}`,
    "",
    `**Element**: \`${annotation.elementLabel}\``,
    `**Path**: ${annotation.breadcrumb}`,
  ]
  if (annotation.className) lines.push(`**className**: \`${annotation.className}\``)
  if (annotation.sourceHint) lines.push(`**Source hint**: \`${annotation.sourceHint}\``)
  lines.push(`**Size**: ${annotation.rect.width}×${annotation.rect.height}px`)

  if (annotation.screenshot) {
    lines.push("", "<details><summary>Screenshot</summary>", "")
    lines.push(`<img src="${annotation.screenshot}" alt="annotated element" />`)
    lines.push("</details>")
  }

  lines.push("", "<details><summary>AI Fix Prompt</summary>", "")
  lines.push("```", generateSingleAnnotationPrompt(annotation), "```")
  lines.push("</details>")

  lines.push("", "_Filed via [Marker](https://github.com/marker)_")
  return lines.join("\n")
}

async function createGitHubIssue(
  annotation: Annotation,
  settings: ExtensionSettings,
): Promise<CreatedIssue> {
  if (!settings.githubToken || !settings.defaultRepo) {
    throw new Error("GitHub token and repo not configured.")
  }
  const [owner, repo] = settings.defaultRepo.split("/")
  if (!owner || !repo) throw new Error("Invalid repo format. Use 'owner/repo'.")

  const title = `[${annotation.category}] ${annotation.comment.slice(0, 80)}`
  const body = buildIssueBody(annotation)

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${settings.githubToken}`,
      accept: "application/vnd.github+json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      title,
      body,
      labels: ["ui", `marker/${annotation.category}`],
    }),
  })
  if (!res.ok) throw new Error(`GitHub API: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return { url: data.html_url, id: String(data.number), tracker: "github" }
}

async function createLinearIssue(
  annotation: Annotation,
  settings: ExtensionSettings,
): Promise<CreatedIssue> {
  // Linear uses GraphQL — simplified single-team approach
  // User must set the team ID in `defaultRepo` field for now (e.g. "TEAM_xxx")
  if (!settings.githubToken || !settings.defaultRepo) {
    throw new Error("Linear API key and team ID not configured (use defaultRepo field).")
  }

  const title = `[${annotation.category}] ${annotation.comment.slice(0, 80)}`
  const description = buildIssueBody(annotation)

  const query = `
    mutation CreateIssue($teamId: String!, $title: String!, $description: String!) {
      issueCreate(input: { teamId: $teamId, title: $title, description: $description }) {
        success
        issue { id, identifier, url }
      }
    }
  `
  const res = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      authorization: settings.githubToken,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { teamId: settings.defaultRepo, title, description },
    }),
  })
  if (!res.ok) throw new Error(`Linear API: ${res.status} ${await res.text()}`)
  const data = await res.json()
  if (data.errors) throw new Error(JSON.stringify(data.errors))
  const issue = data.data.issueCreate.issue
  return { url: issue.url, id: issue.identifier, tracker: "linear" }
}
