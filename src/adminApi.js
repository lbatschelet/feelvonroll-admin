const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE || '/api'

export function getDefaultApiBase() {
  return DEFAULT_API_BASE
}

export async function fetchAdminPins({ apiBase, token }) {
  const response = await fetch(`${apiBase}/admin_pins.php`, {
    headers: { 'X-Admin-Token': token },
  })
  if (!response.ok) {
    throw new Error('Pins konnten nicht geladen werden')
  }
  return response.json()
}

export async function updatePinApproval({ apiBase, token, id, approved }) {
  const response = await fetch(`${apiBase}/admin_pins.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': token,
    },
    body: JSON.stringify({ id, approved }),
  })
  if (!response.ok) {
    throw new Error('Status konnte nicht gespeichert werden')
  }
  return response.json()
}
