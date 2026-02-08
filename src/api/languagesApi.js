/**
 * Languages API client for admin language operations.
 * Exports: fetchLanguages, upsertLanguage, toggleLanguage, checkLanguage, deleteLanguage.
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

export function toggleLanguage({ token, lang, enabled, force }) {
  return requestJson(`${API_BASE}/admin_languages.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'toggle', lang, enabled, force: force || false }),
  })
}

export function checkLanguage({ token, lang }) {
  return requestJson(`${API_BASE}/admin_languages.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'check', lang }),
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
