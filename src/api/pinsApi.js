/**
 * Pins API client for admin pin operations.
 * Exports: fetchAdminPins, updatePinApprovalBulk, deletePins.
 */
import { API_BASE, requestJson } from './baseClient'

export function fetchAdminPins({ token }) {
  return requestJson(`${API_BASE}/admin_pins.php`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function updatePinApprovalBulk({ token, ids, approved }) {
  return requestJson(`${API_BASE}/admin_pins.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'update_approval', ids, approved }),
  })
}

export function deletePins({ token, ids }) {
  return requestJson(`${API_BASE}/admin_pins.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'delete', ids }),
  })
}
