/**
 * Languages API client for admin language operations.
 * Exports: fetchLanguages, upsertLanguage, toggleLanguage, deleteLanguage.
 */
import { API_BASE, requestJson } from './baseClient'

export function fetchLanguages({ token }) {
  return requestJson(`${API_BASE}/admin_languages.php`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function upsertLanguage({ token, lang, label, enabled }) {
  return requestJson(`${API_BASE}/admin_languages.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'upsert', lang, label, enabled }),
  })
}

export function toggleLanguage({ token, lang, enabled }) {
  return requestJson(`${API_BASE}/admin_languages.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'toggle', lang, enabled }),
  })
}

export function deleteLanguage({ token, lang }) {
  return requestJson(`${API_BASE}/admin_languages.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'delete', lang }),
  })
}
