const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export function getApiBase() {
  return API_BASE
}

export async function fetchAdminPins({ token }) {
  const response = await fetch(`${API_BASE}/admin_pins.php`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }
  return response.json()
}

export async function updatePinApproval({ apiBase, token, id, approved }) {
  return updatePinApprovalBulk({ apiBase, token, ids: [id], approved })
}

export async function updatePinApprovalBulk({ token, ids, approved }) {
  const response = await fetch(`${API_BASE}/admin_pins.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'update_approval', ids, approved }),
  })
  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }
  return response.json()
}

export async function deletePins({ token, ids }) {
  const response = await fetch(`${API_BASE}/admin_pins.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'delete', ids }),
  })
  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }
  return response.json()
}

export async function fetchQuestions({ token }) {
  const response = await fetch(`${API_BASE}/admin_questions.php`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }
  return response.json()
}

export async function upsertQuestion({ token, question }) {
  const response = await fetch(`${API_BASE}/admin_questions.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'upsert', ...question }),
  })
  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }
  return response.json()
}

export async function deleteQuestion({ token, question_key }) {
  const response = await fetch(`${API_BASE}/admin_questions.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'delete', question_key }),
  })
  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }
  return response.json()
}

export async function fetchOptions({ token, question_key }) {
  const url = question_key
    ? `${API_BASE}/admin_options.php?question_key=${encodeURIComponent(question_key)}`
    : `${API_BASE}/admin_options.php`
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }
  return response.json()
}

export async function upsertOption({ token, option }) {
  const response = await fetch(`${API_BASE}/admin_options.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'upsert', ...option }),
  })
  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }
  return response.json()
}

export async function deleteOption({ token, question_key, option_key }) {
  const response = await fetch(`${API_BASE}/admin_options.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'delete', question_key, option_key }),
  })
  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }
  return response.json()
}

export async function fetchLanguages({ token }) {
  const response = await fetch(`${API_BASE}/admin_languages.php`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }
  return response.json()
}

export async function upsertLanguage({ token, lang, label, enabled }) {
  const response = await fetch(`${API_BASE}/admin_languages.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'upsert', lang, label, enabled }),
  })
  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }
  return response.json()
}

export async function toggleLanguage({ token, lang, enabled }) {
  const response = await fetch(`${API_BASE}/admin_languages.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'toggle', lang, enabled }),
  })
  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }
  return response.json()
}

export async function deleteLanguage({ token, lang }) {
  const response = await fetch(`${API_BASE}/admin_languages.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'delete', lang }),
  })
  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }
  return response.json()
}

export async function upsertTranslation({ token, translation_key, lang, text }) {
  const response = await fetch(`${API_BASE}/admin_translations.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'upsert', translation_key, lang, text }),
  })
  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }
  return response.json()
}

export async function deleteTranslation({ token, translation_key, lang }) {
  const response = await fetch(`${API_BASE}/admin_translations.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'delete', translation_key, lang }),
  })
  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }
  return response.json()
}

export async function fetchTranslations({ lang, prefix }) {
  const params = new URLSearchParams()
  if (lang) params.set('lang', lang)
  if (prefix) params.set('prefix', prefix)
  const query = params.toString()
  const url = `${API_BASE}/translations.php${query ? `?${query}` : ''}`
  const response = await fetch(url)
  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }
  return response.json()
}

export async function fetchAuthStatus() {
  const response = await fetch(`${API_BASE}/admin_auth.php`)
  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }
  return response.json()
}

export async function loginWithToken({ admin_token }) {
  const response = await fetch(`${API_BASE}/admin_auth.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'bootstrap_login', admin_token }),
  })
  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }
  return response.json()
}

export async function loginUser({ email, password }) {
  const response = await fetch(`${API_BASE}/admin_auth.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', email, password }),
  })
  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }
  return response.json()
}

export async function setPassword({ reset_token, password }) {
  const response = await fetch(`${API_BASE}/admin_auth.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_password', reset_token, password }),
  })
  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }
  return response.json()
}

export async function refreshToken({ token }) {
  const response = await fetch(`${API_BASE}/admin_auth.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action: 'refresh' }),
  })
  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }
  return response.json()
}

export async function fetchUsers({ token }) {
  const response = await fetch(`${API_BASE}/admin_users.php`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }
  return response.json()
}

export async function fetchAuditLogs({ token, limit = 50, offset = 0 }) {
  const params = new URLSearchParams()
  params.set('limit', String(limit))
  params.set('offset', String(offset))
  const response = await fetch(`${API_BASE}/admin_audit.php?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }
  return response.json()
}

export async function createUser({ token, name, email, password }) {
  const response = await fetch(`${API_BASE}/admin_users.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action: 'create', name, email, password }),
  })
  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }
  return response.json()
}

export async function resetUserPassword({ token, id }) {
  const response = await fetch(`${API_BASE}/admin_users.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action: 'reset', id }),
  })
  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }
  return response.json()
}

async function parseError(response) {
  let text = ''
  try {
    text = await response.text()
    const json = JSON.parse(text)
    if (json && json.error) {
      return `HTTP ${response.status}: ${json.error}`
    }
  } catch (error) {
    // ignore parsing errors
  }

  return `HTTP ${response.status}: ${text || response.statusText || 'Unbekannter Fehler'}`
}
