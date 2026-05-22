/**
 * Background service worker.
 *
 * Responsibilities:
 *  - Forward keyboard commands (declared in manifest) to the active tab.
 *  - Optional: persist annotations across sessions (chrome.storage already
 *    handles that), watch for storage quota exhaustion.
 */

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-annotation-mode") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) return
    chrome.tabs.sendMessage(tab.id, { type: "toggle-annotation-mode" }).catch(() => {
      // Content script may not be loaded on this page (e.g. chrome:// URL)
    })
  }
})

// Welcome on first install — open extension's bundled welcome page
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({ url: chrome.runtime.getURL("src/welcome/index.html") })
  }
})

export {}
