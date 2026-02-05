/**
 * Reset link helpers for building and copying user reset URLs.
 * Exports: buildResetLink, copyResetLink.
 */
export function buildResetLink(resetToken) {
  const url = new URL(window.location.href)
  url.searchParams.set('reset_token', resetToken)
  return url.toString()
}

export async function copyResetLink(link) {
  try {
    await navigator.clipboard.writeText(link)
  } catch (error) {
    const textarea = document.createElement('textarea')
    textarea.value = link
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    textarea.remove()
  }
}
