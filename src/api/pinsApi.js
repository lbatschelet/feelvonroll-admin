/**
 * Pins API client for admin pin operations.
 * Exports: fetchAdminPins, updatePinApprovalBulk, deletePins, exportPinsCsv.
 */
import { API_BASE, requestBlob, requestJson } from './baseClient'

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

export function exportPinsCsv({ token }) {
  return requestBlob(`${API_BASE}/admin_pins.php?action=export_csv`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}
