/**
 * Audit API client for admin audit logs.
 * Exports: fetchAuditLogs.
 */
import { API_BASE, requestJson } from './baseClient'

export function fetchAuditLogs({ token, limit = 50, offset = 0 }) {
  const params = new URLSearchParams()
  params.set('limit', String(limit))
  params.set('offset', String(offset))
  return requestJson(`${API_BASE}/admin_audit.php?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}
