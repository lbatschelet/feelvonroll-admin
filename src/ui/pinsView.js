/**
 * Pins view builder with tools and table.
 * Exports: createPinsView.
 */
export function createPinsView() {
  const toolsCard = document.createElement('section')
  toolsCard.className = 'card tools-card'
  toolsCard.innerHTML = `
    <div class="tools">
      <input type="text" id="searchInput" placeholder="Suche (ID, Etage, Text)" />
      <select id="filterSelect">
        <option value="all">Alle</option>
        <option value="pending">Wartet</option>
        <option value="approved">Freigegeben</option>
        <option value="rejected">Abgelehnt</option>
      </select>
      <select id="sortSelect">
        <option value="newest">Neueste zuerst</option>
        <option value="oldest">Älteste zuerst</option>
        <option value="floor">Etage</option>
        <option value="wellbeing">Wohlbefinden</option>
      </select>
      <select id="pageSizeSelect">
        <option value="10">10 pro Seite</option>
        <option value="25" selected>25 pro Seite</option>
        <option value="50">50 pro Seite</option>
        <option value="100">100 pro Seite</option>
      </select>
      <button id="reloadPins">Pins laden</button>
      <button id="exportPinsCsv" class="ghost">CSV export</button>
    </div>
    <div class="pagination">
      <button id="prevPage" class="ghost">Zurück</button>
      <span id="pageInfo">Seite 1</span>
      <button id="nextPage" class="ghost">Weiter</button>
    </div>
  `

  const tableCard = document.createElement('section')
  tableCard.className = 'card'
  tableCard.innerHTML = `
    <div class="card-header">
      <h2>Pins</h2>
      <div class="header-actions">
        <span id="pinCount">0</span>
        <button id="approveSelected" class="ghost">Freigeben</button>
        <button id="pendingSelected" class="ghost">Wartend</button>
        <button id="blockSelected" class="ghost">Ablehnen</button>
        <button id="deleteSelected" class="danger">Löschen</button>
      </div>
      </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th><input type="checkbox" id="selectAll" /></th>
            <th>ID</th>
            <th>Etage</th>
            <th>Wohlbefinden</th>
            <th>Gründe</th>
            <th>Gruppe</th>
            <th>Notiz</th>
            <th>Erstellt</th>
            <th>Freigabe</th>
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
