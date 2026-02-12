/**
 * Questionnaires editor view (admin: manage questionnaires and their slots).
 * Uses a modal for editing. Exports: createQuestionnairesView.
 */
import { icons } from '../utils/dom'

export function createQuestionnairesView() {
  const card = document.createElement('section')
  card.className = 'card questionnaires-card'
  card.style.display = 'none'
  card.innerHTML = `
    <div class="card-header">
      <h2>Questionnaires</h2>
      <button class="button" id="addQuestionnaireBtn">+ New Questionnaire</button>
    </div>

    <div id="questionnairesListWrap">
      <table class="table">
        <thead>
          <tr>
            <th>Key</th>
            <th>Name</th>
            <th>Slots</th>
            <th>Default</th>
            <th>Active</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="questionnairesTableBody"></tbody>
      </table>
    </div>

    <!-- Questionnaire edit modal -->
    <div class="modal-backdrop" id="questionnaireModal">
      <div class="modal modal-wide">
        <div class="modal-header">
          <h3 id="questionnaireEditTitle">New Questionnaire</h3>
          <button class="modal-close" id="closeQuestionnaireModal" type="button">&times;</button>
        </div>

        <div class="modal-fields-row">
          <label class="field">
            <span>Key</span>
            <input type="text" id="qnrKeyInput" placeholder="e.g. station_foyer" />
          </label>
          <label class="field">
            <span>Name</span>
            <input type="text" id="qnrNameInput" placeholder="e.g. Foyer Questionnaire" />
          </label>
        </div>
        <label class="field" style="margin-bottom:12px">
          <span>Description</span>
          <textarea id="qnrDescInput" rows="2" placeholder="Optional description"></textarea>
        </label>
        <div class="modal-checks-row">
          <label class="checkbox-inline"><input type="checkbox" id="qnrActiveCheck" checked /> Active</label>
        </div>
        <input type="hidden" id="qnrIdInput" />

        <h4 style="margin-top:0.5rem;margin-bottom:6px;">Slots</h4>
        <p class="form-hint">Each slot is a position in the questionnaire. A fixed slot always shows the same question. A pool slot randomly picks from assigned questions.</p>

        <div id="slotsContainer"></div>
        <button class="button ghost" id="addSlotBtn" type="button">+ Add Slot</button>

        <div class="modal-actions" style="margin-top:1rem">
          <button class="icon-btn danger" id="deleteQuestionnaireBtn" type="button" title="Delete this questionnaire" style="display:none">${icons.trash}</button>
          <span class="modal-actions-spacer"></span>
          <button class="ghost" id="cancelQuestionnaireBtn" type="button">Cancel</button>
          <button class="btn-save" id="saveQuestionnaireBtn">${icons.save} Save</button>
        </div>
      </div>
    </div>
  `

  return {
    element: card,
    addBtn: card.querySelector('#addQuestionnaireBtn'),
    tableBody: card.querySelector('#questionnairesTableBody'),
    modal: card.querySelector('#questionnaireModal'),
    editTitle: card.querySelector('#questionnaireEditTitle'),
    closeModalBtn: card.querySelector('#closeQuestionnaireModal'),
    keyInput: card.querySelector('#qnrKeyInput'),
    nameInput: card.querySelector('#qnrNameInput'),
    descInput: card.querySelector('#qnrDescInput'),
    activeCheck: card.querySelector('#qnrActiveCheck'),
    idInput: card.querySelector('#qnrIdInput'),
    deleteBtn: card.querySelector('#deleteQuestionnaireBtn'),
    slotsContainer: card.querySelector('#slotsContainer'),
    addSlotBtn: card.querySelector('#addSlotBtn'),
    saveBtn: card.querySelector('#saveQuestionnaireBtn'),
    cancelBtn: card.querySelector('#cancelQuestionnaireBtn'),
  }
}
