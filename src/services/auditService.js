/**
 * Audit helpers for pagination labels and ranges.
 * Exports: getAuditRange, formatAuditInfo.
 */
export function getAuditRange({ offset, limit, total }) {
  if (!total) {
    return { start: 0, end: 0 }
  }
  const start = offset + 1
  const end = Math.min(offset + limit, total)
  return { start, end }
}

export function formatAuditInfo({ offset, limit, total }) {
  const { start, end } = getAuditRange({ offset, limit, total })
  if (!total) return '0'
  return `${start}-${end} of ${total}`
}
