/**
 * Stations view (admin: manage QR-code stations).
 * Exports: createStationsView.
 */
export function createStationsView() {
  const card = document.createElement('section')
  card.className = 'card stations-card'
  card.style.display = 'none'
  card.innerHTML = `
    <div class="card-header">
      <h2>Stations</h2>
      <button class="button" id="addStationBtn">+ New Station</button>
    </div>

    <div id="stationsListWrap">
      <table class="table">
        <thead>
          <tr>
            <th>Key</th>
            <th>Name</th>
            <th>Floor</th>
            <th>Questionnaire</th>
            <th>Active</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="stationsTableBody"></tbody>
      </table>
    </div>

    <!-- Station edit form (hidden by default) -->
    <div id="stationEditSection" style="display: none;">
      <h3 id="stationEditTitle">Edit Station</h3>
      <div class="form-grid">
        <label>Key
          <input type="text" id="stKeyInput" placeholder="e.g. foyer_eg" />
        </label>
        <label>Name
          <input type="text" id="stNameInput" placeholder="e.g. Foyer Erdgeschoss" />
        </label>
        <label>Description
          <textarea id="stDescInput" rows="2" placeholder="Optional description"></textarea>
        </label>
        <label>Floor Index
          <input type="number" id="stFloorInput" value="0" min="0" />
        </label>
        <label>Questionnaire
          <select id="stQuestionnaireSelect">
            <option value="">— Default —</option>
          </select>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" id="stActiveCheck" checked />
          Active
        </label>
      </div>

      <h4 style="margin-top: 1rem;">Camera Position</h4>
      <p class="form-hint">Set the 3D camera position and look-at target for this station. Use "Capture from Webapp" to pick interactively.</p>

      <div class="position-grid">
        <label>Camera X <input type="number" step="any" id="stCamX" value="0" /></label>
        <label>Camera Y <input type="number" step="any" id="stCamY" value="0" /></label>
        <label>Camera Z <input type="number" step="any" id="stCamZ" value="0" /></label>
        <label>Target X <input type="number" step="any" id="stTgtX" value="0" /></label>
        <label>Target Y <input type="number" step="any" id="stTgtY" value="0" /></label>
        <label>Target Z <input type="number" step="any" id="stTgtZ" value="0" /></label>
      </div>

      <button class="button ghost" id="capturePositionBtn" type="button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-right: 4px;">
          <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
        </svg>
        Capture from Webapp
      </button>

      <input type="hidden" id="stIdInput" />

      <div class="form-actions" style="margin-top: 1rem;">
        <button class="button" id="saveStationBtn">Save Station</button>
        <button class="button ghost" id="cancelStationBtn">Cancel</button>
      </div>
    </div>
  `

  return {
    element: card,
    addBtn: card.querySelector('#addStationBtn'),
    tableBody: card.querySelector('#stationsTableBody'),
    editSection: card.querySelector('#stationEditSection'),
    editTitle: card.querySelector('#stationEditTitle'),
    keyInput: card.querySelector('#stKeyInput'),
    nameInput: card.querySelector('#stNameInput'),
    descInput: card.querySelector('#stDescInput'),
    floorInput: card.querySelector('#stFloorInput'),
    questionnaireSelect: card.querySelector('#stQuestionnaireSelect'),
    activeCheck: card.querySelector('#stActiveCheck'),
    camX: card.querySelector('#stCamX'),
    camY: card.querySelector('#stCamY'),
    camZ: card.querySelector('#stCamZ'),
    tgtX: card.querySelector('#stTgtX'),
    tgtY: card.querySelector('#stTgtY'),
    tgtZ: card.querySelector('#stTgtZ'),
    captureBtn: card.querySelector('#capturePositionBtn'),
    idInput: card.querySelector('#stIdInput'),
    saveBtn: card.querySelector('#saveStationBtn'),
    cancelBtn: card.querySelector('#cancelStationBtn'),
  }
}
