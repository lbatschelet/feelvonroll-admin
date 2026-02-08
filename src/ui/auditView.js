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
    <div class="tools audit-tools">
      <select id="auditLimit">
        <option value="25">25</option>
        <option value="50" selected>50</option>
        <option value="100">100</option>
        <option value="200">200</option>
      </select>
      <button id="auditPrev" class="ghost">Previous</button>
      <span id="auditInfo">0</span>
      <button id="auditNext" class="ghost">Next</button>
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
    auditPrevButton: auditCard.querySelector('#auditPrev'),
    auditNextButton: auditCard.querySelector('#auditNext'),
    auditInfo: auditCard.querySelector('#auditInfo'),
    auditBody: auditCard.querySelector('#auditBody'),
  }
}
