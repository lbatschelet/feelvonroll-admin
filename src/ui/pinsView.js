/**
 * Pins view builder with tools and table.
 * Exports: createPinsView.
 */
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
      <button id="reloadPins" title="Reload pin list">Reload</button>
      <button id="exportPinsCsv" class="ghost" title="Download pin data as CSV">Export CSV</button>
    </div>
    <div class="pagination">
      <button id="prevPage" class="ghost">Previous</button>
      <span id="pageInfo">Page 1</span>
      <button id="nextPage" class="ghost">Next</button>
    </div>
  `

  const tableCard = document.createElement('section')
  tableCard.className = 'card'
  tableCard.innerHTML = `
    <div class="card-header">
      <h2>Pins</h2>
      <div class="header-actions">
        <span id="pinCount">0</span>
        <button id="approveSelected" class="ghost" title="Mark selected pins as approved">Approve</button>
        <button id="pendingSelected" class="ghost" title="Mark selected pins as pending">Pending</button>
        <button id="blockSelected" class="ghost" title="Mark selected pins as rejected">Reject</button>
        <button id="deleteSelected" class="danger" title="Delete selected pins">Delete</button>
      </div>
      </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th><input type="checkbox" id="selectAll" /></th>
            <th>ID</th>
            <th>Floor</th>
            <th>Wellbeing</th>
            <th>Reasons</th>
            <th>Group</th>
            <th>Note</th>
            <th>Created</th>
            <th>Status</th>
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
    prevPageButton: toolsCard.querySelector('#prevPage'),
    nextPageButton: toolsCard.querySelector('#nextPage'),
    pageInfo: toolsCard.querySelector('#pageInfo'),
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
