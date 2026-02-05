/**
 * Translations API client for admin translation upserts/deletes.
 * Exports: upsertTranslation, deleteTranslation.
 */
import { API_BASE, requestJson } from './baseClient'

export function upsertTranslation({ token, translation_key, lang, text }) {
  return requestJson(`${API_BASE}/admin_translations.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'upsert', translation_key, lang, text }),
  })
}

export function deleteTranslation({ token, translation_key, lang }) {
  return requestJson(`${API_BASE}/admin_translations.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'delete', translation_key, lang }),
  })
}
