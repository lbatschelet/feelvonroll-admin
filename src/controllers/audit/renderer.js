/**
 * Audit renderer for audit log table and pagination.
 * Exports: createAuditRenderer.
 */
import { escapeHtml, formatDate } from '../../utils/format'

export function createAuditRenderer({ state, views }) {
  const {
    auditCount,
    auditPageInfo,
    auditFirstButton,
    auditPrevButton,
    auditNextButton,
    auditLastButton,
    auditBody,
  } = views.auditView

  const renderAuditLogs = () => {
    auditBody.innerHTML = ''

    const total = state.audit.total || 0
    const limit = state.audit.limit || 50
    const maxPage = Math.max(1, Math.ceil(total / limit))
    const page = Math.min(maxPage, Math.max(1, Math.floor(state.audit.offset / limit) + 1))

    // Clamp offset to valid range
    state.audit.offset = (page - 1) * limit

    auditCount.textContent = String(total)
    auditPageInfo.textContent = `Page ${page} of ${maxPage}`
    auditFirstButton.disabled = page <= 1
    auditPrevButton.disabled = page <= 1
    auditNextButton.disabled = page >= maxPage
    auditLastButton.disabled = page >= maxPage

    if (!state.audit.items.length) {
      auditBody.innerHTML = '<tr><td colspan="5" class="empty">No entries</td></tr>'
      return
    }
    state.audit.items.forEach((item) => {
      const row = document.createElement('tr')
      const payload = item.payload ? escapeHtml(JSON.stringify(item.payload)) : ''
      row.innerHTML = `
        <td>${formatDate(item.created_at)}</td>
        <td>${escapeHtml(item.user_email || '-')}</td>
        <td>${escapeHtml(item.action || '')}</td>
        <td>${escapeHtml(item.target || '')}</td>
        <td>${payload}</td>
      `
      auditBody.appendChild(row)
    })
  }

  return { renderAuditLogs }
}
