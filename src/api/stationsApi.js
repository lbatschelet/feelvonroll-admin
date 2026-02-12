/**
 * Admin stations API client (CRUD for QR-code stations).
 * Exports: fetchStations, upsertStation, deleteStation.
 */
import { API_BASE, requestJson } from './baseClient'

export function fetchStations({ token }) {
  return requestJson(`${API_BASE}/admin_stations.php`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function upsertStation({ token, ...data }) {
  return requestJson(`${API_BASE}/admin_stations.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'upsert', ...data }),
  })
}

export function deleteStation({ token, id }) {
  return requestJson(`${API_BASE}/admin_stations.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'delete', id }),
  })
}
