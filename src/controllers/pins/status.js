/**
 * Pin status helpers for display and transitions.
 * Exports: getNextStatus, getStatusLabel, getStatusClass.
 */
export function getNextStatus(current) {
  if (current === 1) return -1
  if (current === -1) return 0
  return 1
}

export function getStatusLabel(status) {
  if (status === 1) return 'Freigegeben'
  if (status === -1) return 'Abgelehnt'
  return 'Wartet'
}

export function getStatusClass(status) {
  if (status === 1) return 'approved'
  if (status === -1) return 'rejected'
  return 'pending'
}
