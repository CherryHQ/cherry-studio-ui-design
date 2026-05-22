import { useState } from "react"
import { Button } from "@cherry-studio/ui"
import type { Annotation } from "@cherry-studio/ui"
import { GitPullRequest, Loader2 } from "lucide-react"
import { createIssue } from "../shared/issues"
import { loadSettings } from "../shared/storage"
import { useT } from "../shared/i18n"

/**
 * Creates a GitHub Issue or Linear ticket from this annotation. Opens the new
 * issue in a fresh tab on success. Token configured in extension Settings.
 */
export function FileIssueAction({ annotation }: { annotation: Annotation; onClose: () => void }) {
  const { t } = useT()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const settings = await loadSettings()
      if (!settings.issueTracker || settings.issueTracker === "none") {
        alert(t("action.fileIssue.notConfigured"))
        return
      }
      const enriched: Annotation = annotation.origin
        ? annotation
        : { ...annotation, origin: window.location.origin }
      const issue = await createIssue(enriched, settings)
      chrome.tabs.create({ url: issue.url })
    } catch (err) {
      alert(t("action.fileIssue.failed", { error: err instanceof Error ? err.message : String(err) }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      title={t("action.fileIssue")}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="size-3 animate-spin" />
      ) : (
        <GitPullRequest className="size-3" />
      )}
    </Button>
  )
}
