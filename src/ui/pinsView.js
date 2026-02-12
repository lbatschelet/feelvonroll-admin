/**
 * Pins view builder with tools and table.
 * Exports: createPinsView.
 */
import { icons } from '../utils/dom'

export function createPinsView() {
  const toolsCard = document.createElement('section')
  toolsCard.className = 'card tools-card'
  toolsCard.innerHTML = `
    <div class="tools">
      <input type="text" id="searchInput" placeholder="Search (ID, floor, text)" title="Filter by ID, floor, or note text" />
      <select id="filterSelect" title="Filter by approval status">
        <option value="all">All</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <select id="sortSelect" title="Sort pins">
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="floor">Floor</option>
        <option value="wellbeing">Wellbeing</option>
      </select>
      <select id="pageSizeSelect" title="Rows per page">
        <option value="10">10 per page</option>
        <option value="25" selected>25 per page</option>
        <option value="50">50 per page</option>
        <option value="100">100 per page</option>
      </select>
      <button id="reloadPins" class="icon-btn-ghost" title="Reload pin list">${icons.reload}</button>
      <button id="exportPinsCsv" class="ghost" title="Download pin data as CSV">Export CSV</button>
    </div>
  `

  const tableCard = document.createElement('section')
  tableCard.className = 'card'
  tableCard.innerHTML = `
    <div class="card-header">
      <div class="card-header-left">
        <h2>Pins</h2>
        <span id="pinCount" class="muted" title="Total pins matching filter">0</span>
      </div>
      <div class="header-actions">
        <div class="pagination">
          <button id="firstPage" class="icon-btn-ghost" title="First page">${icons.chevronsLeft}</button>
          <button id="prevPage" class="icon-btn-ghost" title="Previous page">${icons.chevronLeft}</button>
          <span id="pageInfo" class="page-info">Page 1 of 1</span>
          <button id="nextPage" class="icon-btn-ghost" title="Next page">${icons.chevronRight}</button>
          <button id="lastPage" class="icon-btn-ghost" title="Last page">${icons.chevronsRight}</button>
        </div>
        <span class="header-divider"></span>
        <button id="approveSelected" class="ghost" title="Mark selected pins as approved">Approve</button>
        <button id="pendingSelected" class="ghost" title="Mark selected pins as pending">Pending</button>
        <button id="blockSelected" class="ghost" title="Mark selected pins as rejected">Reject</button>
        <button id="deleteSelected" class="icon-btn danger" title="Delete selected pins">${icons.trash}</button>
      </div>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th><input type="checkbox" id="selectAll" /></th>
            <th>ID</th>
            <th>Floor</th>
            <th>Station</th>
            <th>Wellbeing</th>
            <th>Reasons</th>
            <th>Group</th>
            <th>Note</th>
            <th>Created</th>
            <th class="text-right">Status</th>
          </tr>
        </thead>
        <tbody id="pinsBody"></tbody>
      </table>
    </div>
  `

  return {
    toolsCard,
    tableCard,
    reloadButton: toolsCard.querySelector('#reloadPins'),
    exportCsvButton: toolsCard.querySelector('#exportPinsCsv'),
    pageSizeSelect: toolsCard.querySelector('#pageSizeSelect'),
    firstPageButton: tableCard.querySelector('#firstPage'),
    prevPageButton: tableCard.querySelector('#prevPage'),
    nextPageButton: tableCard.querySelector('#nextPage'),
    lastPageButton: tableCard.querySelector('#lastPage'),
    pageInfo: tableCard.querySelector('#pageInfo'),
    searchInput: toolsCard.querySelector('#searchInput'),
    filterSelect: toolsCard.querySelector('#filterSelect'),
    sortSelect: toolsCard.querySelector('#sortSelect'),
    pinCount: tableCard.querySelector('#pinCount'),
    approveSelected: tableCard.querySelector('#approveSelected'),
    pendingSelected: tableCard.querySelector('#pendingSelected'),
    blockSelected: tableCard.querySelector('#blockSelected'),
    deleteSelected: tableCard.querySelector('#deleteSelected'),
    selectAll: tableCard.querySelector('#selectAll'),
    pinsBody: tableCard.querySelector('#pinsBody'),
  }
}
