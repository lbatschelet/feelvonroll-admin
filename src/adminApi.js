const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export function getApiBase() {
  return API_BASE
}

export async function fetchAdminPins({ token }) {
  const response = await fetch(`${API_BASE}/admin_pins.php`, {
    headers: { 'X-Admin-Token': token },
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
      'X-Admin-Token': token,
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
      'X-Admin-Token': token,
    },
    body: JSON.stringify({ action: 'delete', ids }),
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
