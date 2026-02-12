/**
 * Stations view (admin: manage QR-code stations).
 * Uses a modal for editing. List shows link button per station.
 * Exports: createStationsView.
 */
import { icons } from '../utils/dom'

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

    <!-- Station edit modal -->
    <div class="modal-backdrop" id="stationModal">
      <div class="modal modal-wide">
        <div class="modal-header">
          <h3 id="stationEditTitle">New Station</h3>
          <button class="modal-close" id="closeStationModal" type="button">&times;</button>
        </div>
        <div class="modal-fields-row">
          <label class="field">
            <span>Key</span>
            <input type="text" id="stKeyInput" placeholder="e.g. foyer_eg" />
          </label>
          <label class="field">
            <span>Name</span>
            <input type="text" id="stNameInput" placeholder="e.g. Foyer Erdgeschoss" />
          </label>
        </div>
        <label class="field" style="margin-bottom:12px">
          <span>Description</span>
          <textarea id="stDescInput" rows="2" placeholder="Optional description"></textarea>
        </label>
        <div class="modal-fields-row">
          <label class="field">
            <span>Floor Index</span>
            <input type="number" id="stFloorInput" value="0" min="0" />
          </label>
          <label class="field">
            <span>Questionnaire</span>
            <select id="stQuestionnaireSelect">
              <option value="">— Default —</option>
            </select>
          </label>
        </div>
        <div class="modal-checks-row">
          <label class="checkbox-inline"><input type="checkbox" id="stActiveCheck" checked /> Active</label>
        </div>

        <div class="station-link-section" id="stationLinkSection" style="display:none">
          <label class="field">
            <span>Station Link</span>
            <div class="copy-row">
              <input type="text" id="stLinkDisplay" readonly />
              <button type="button" class="icon-btn-ghost" id="stCopyLink" title="Copy link">${icons.copy}</button>
            </div>
          </label>
        </div>

        <h4 style="margin-top:1rem;margin-bottom:6px;">Camera Position</h4>
        <p class="form-hint">Set the 3D camera position and look-at target. Use "Capture from Webapp" to pick interactively.</p>

        <div class="position-grid">
          <label class="field"><span>Camera X</span> <input type="number" step="any" id="stCamX" value="0" /></label>
          <label class="field"><span>Camera Y</span> <input type="number" step="any" id="stCamY" value="0" /></label>
          <label class="field"><span>Camera Z</span> <input type="number" step="any" id="stCamZ" value="0" /></label>
          <label class="field"><span>Target X</span> <input type="number" step="any" id="stTgtX" value="0" /></label>
          <label class="field"><span>Target Y</span> <input type="number" step="any" id="stTgtY" value="0" /></label>
          <label class="field"><span>Target Z</span> <input type="number" step="any" id="stTgtZ" value="0" /></label>
        </div>

        <button class="button ghost" id="capturePositionBtn" type="button" style="margin-bottom:12px">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-right: 4px;">
            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
          </svg>
          Capture from Webapp
        </button>

        <input type="hidden" id="stIdInput" />

        <div class="modal-actions">
          <button class="icon-btn danger" id="deleteStationBtn" type="button" title="Delete this station" style="display:none">${icons.trash}</button>
          <span class="modal-actions-spacer"></span>
          <button class="ghost" id="cancelStationBtn" type="button">Cancel</button>
          <button class="btn-save" id="saveStationBtn">${icons.save} Save</button>
        </div>
      </div>
    </div>
  `

  return {
    element: card,
    addBtn: card.querySelector('#addStationBtn'),
    tableBody: card.querySelector('#stationsTableBody'),
    modal: card.querySelector('#stationModal'),
    editTitle: card.querySelector('#stationEditTitle'),
    closeModalBtn: card.querySelector('#closeStationModal'),
    keyInput: card.querySelector('#stKeyInput'),
    nameInput: card.querySelector('#stNameInput'),
    descInput: card.querySelector('#stDescInput'),
    floorInput: card.querySelector('#stFloorInput'),
    questionnaireSelect: card.querySelector('#stQuestionnaireSelect'),
    activeCheck: card.querySelector('#stActiveCheck'),
    linkSection: card.querySelector('#stationLinkSection'),
    linkDisplay: card.querySelector('#stLinkDisplay'),
    copyLinkBtn: card.querySelector('#stCopyLink'),
    camX: card.querySelector('#stCamX'),
    camY: card.querySelector('#stCamY'),
    camZ: card.querySelector('#stCamZ'),
    tgtX: card.querySelector('#stTgtX'),
    tgtY: card.querySelector('#stTgtY'),
    tgtZ: card.querySelector('#stTgtZ'),
    captureBtn: card.querySelector('#capturePositionBtn'),
    deleteBtn: card.querySelector('#deleteStationBtn'),
    idInput: card.querySelector('#stIdInput'),
    saveBtn: card.querySelector('#saveStationBtn'),
    cancelBtn: card.querySelector('#cancelStationBtn'),
  }
}
