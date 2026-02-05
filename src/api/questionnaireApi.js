/**
 * Questionnaire API client for questions/options/admin translations.
 * Exports: fetchQuestions, upsertQuestion, deleteQuestion, fetchOptions, upsertOption, deleteOption, fetchTranslations.
 */
import { API_BASE, requestJson } from './baseClient'

export function fetchQuestions({ token }) {
  return requestJson(`${API_BASE}/admin_questions.php`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function upsertQuestion({ token, question }) {
  return requestJson(`${API_BASE}/admin_questions.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'upsert', ...question }),
  })
}

export function deleteQuestion({ token, question_key }) {
  return requestJson(`${API_BASE}/admin_questions.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'delete', question_key }),
  })
}

export function fetchOptions({ token, question_key }) {
  const url = question_key
    ? `${API_BASE}/admin_options.php?question_key=${encodeURIComponent(question_key)}`
    : `${API_BASE}/admin_options.php`
  return requestJson(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function upsertOption({ token, option }) {
  return requestJson(`${API_BASE}/admin_options.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'upsert', ...option }),
  })
}

export function deleteOption({ token, question_key, option_key }) {
  return requestJson(`${API_BASE}/admin_options.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'delete', question_key, option_key }),
  })
}

export function fetchTranslations({ lang, prefix }) {
  const params = new URLSearchParams()
  if (lang) params.set('lang', lang)
  if (prefix) params.set('prefix', prefix)
  const query = params.toString()
  const url = `${API_BASE}/translations.php${query ? `?${query}` : ''}`
  return requestJson(url)
}
