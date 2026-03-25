/**
 * Copy text to clipboard with fallback for restricted environments.
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback: use a temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
    } catch {
      // silently fail
    }
    document.body.removeChild(textarea);
  }
}
