/**
 * Audit renderer for audit log table and pagination.
 * Exports: createAuditRenderer.
 */
import { escapeHtml, formatDate } from '../../utils/format'
import { formatAuditInfo } from '../../services/auditService'

export function createAuditRenderer({ state, views }) {
  const { auditInfo, auditBody, auditPrevButton, auditNextButton } = views.auditView

  const renderAuditLogs = () => {
    auditBody.innerHTML = ''
    if (!state.audit.items.length) {
      auditBody.innerHTML = '<tr><td colspan="5" class="empty">No entries</td></tr>'
      auditInfo.textContent = '0'
      auditPrevButton.disabled = true
      auditNextButton.disabled = true
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
    auditInfo.textContent = formatAuditInfo({
      offset: state.audit.offset,
      limit: state.audit.limit,
      total: state.audit.total,
    })
    auditPrevButton.disabled = state.audit.offset <= 0
    auditNextButton.disabled = state.audit.offset + state.audit.limit >= state.audit.total
  }

  return { renderAuditLogs }
}
