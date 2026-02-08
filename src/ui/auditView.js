/**
 * Audit view builder for audit log table and pagination.
 * Exports: createAuditView.
 */
import { icons } from '../utils/dom'

export function createAuditView() {
  const auditCard = document.createElement('section')
  auditCard.className = 'card audit-card'
  auditCard.innerHTML = `
    <div class="card-header">
      <h2>Audit Log</h2>
      <button id="reloadAudit" class="icon-btn-ghost" title="Reload audit log">${icons.reload}</button>
    </div>
    <div class="card-header">
      <div class="card-header-left">
        <span id="auditCount" class="muted" title="Total audit entries">0</span>
      </div>
      <div class="header-actions">
        <select id="auditLimit" title="Rows per page">
          <option value="25">25</option>
          <option value="50" selected>50</option>
          <option value="100">100</option>
          <option value="200">200</option>
        </select>
        <div class="pagination">
          <button id="auditFirst" class="icon-btn-ghost" title="First page">${icons.chevronsLeft}</button>
          <button id="auditPrev" class="icon-btn-ghost" title="Previous page">${icons.chevronLeft}</button>
          <span id="auditPageInfo" class="page-info">Page 1 of 1</span>
          <button id="auditNext" class="icon-btn-ghost" title="Next page">${icons.chevronRight}</button>
          <button id="auditLast" class="icon-btn-ghost" title="Last page">${icons.chevronsRight}</button>
        </div>
      </div>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>User</th>
            <th>Action</th>
            <th>Target</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody id="auditBody"></tbody>
      </table>
    </div>
  `

  return {
    element: auditCard,
    reloadAuditButton: auditCard.querySelector('#reloadAudit'),
    auditLimitSelect: auditCard.querySelector('#auditLimit'),
    auditFirstButton: auditCard.querySelector('#auditFirst'),
    auditPrevButton: auditCard.querySelector('#auditPrev'),
    auditNextButton: auditCard.querySelector('#auditNext'),
    auditLastButton: auditCard.querySelector('#auditLast'),
    auditPageInfo: auditCard.querySelector('#auditPageInfo'),
    auditCount: auditCard.querySelector('#auditCount'),
    auditBody: auditCard.querySelector('#auditBody'),
  }
}
