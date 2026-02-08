/**
 * Content API client for managing content pages.
 * Exports: fetchContent, upsertContent.
 */
import { API_BASE, requestJson } from './baseClient'

/**
 * Fetches all content entries for a given page key.
 * @param {{ token: string, pageKey: string }} params
 * @returns {Promise<Array>}
 */
export function fetchContent({ token, pageKey }) {
  return requestJson(`${API_BASE}/admin_content.php?page_key=${encodeURIComponent(pageKey)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

/**
 * Creates or updates a content page entry.
 * @param {{ token: string, pageKey: string, lang: string, body: string }} params
 * @returns {Promise<Object>}
 */
export function upsertContent({ token, pageKey, lang, body }) {
  return requestJson(`${API_BASE}/admin_content.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'upsert', page_key: pageKey, lang, body }),
  })
}
