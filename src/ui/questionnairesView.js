/**
 * Questionnaires editor view (admin: manage questionnaires and their slots).
 * Exports: createQuestionnairesView.
 */
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

    <!-- Questionnaire edit form (hidden by default) -->
    <div id="questionnaireEditSection" style="display: none;">
      <h3 id="questionnaireEditTitle">Edit Questionnaire</h3>
      <div class="form-grid">
        <label>Key
          <input type="text" id="qnrKeyInput" placeholder="e.g. station_foyer" />
        </label>
        <label>Name
          <input type="text" id="qnrNameInput" placeholder="e.g. Foyer Questionnaire" />
        </label>
        <label>Description
          <textarea id="qnrDescInput" rows="2" placeholder="Optional description"></textarea>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" id="qnrActiveCheck" checked />
          Active
        </label>
      </div>
      <input type="hidden" id="qnrIdInput" />

      <h4 style="margin-top: 1rem;">Slots</h4>
      <p class="form-hint">Each slot is a position in the questionnaire. A fixed slot always shows the same question. A pool slot randomly picks from assigned questions.</p>

      <div id="slotsContainer"></div>
      <button class="button ghost" id="addSlotBtn" type="button">+ Add Slot</button>

      <div class="form-actions" style="margin-top: 1rem;">
        <button class="button" id="saveQuestionnaireBtn">Save Questionnaire</button>
        <button class="button ghost" id="cancelQuestionnaireBtn">Cancel</button>
      </div>
    </div>
  `

  return {
    element: card,
    addBtn: card.querySelector('#addQuestionnaireBtn'),
    tableBody: card.querySelector('#questionnairesTableBody'),
    editSection: card.querySelector('#questionnaireEditSection'),
    editTitle: card.querySelector('#questionnaireEditTitle'),
    keyInput: card.querySelector('#qnrKeyInput'),
    nameInput: card.querySelector('#qnrNameInput'),
    descInput: card.querySelector('#qnrDescInput'),
    activeCheck: card.querySelector('#qnrActiveCheck'),
    idInput: card.querySelector('#qnrIdInput'),
    slotsContainer: card.querySelector('#slotsContainer'),
    addSlotBtn: card.querySelector('#addSlotBtn'),
    saveBtn: card.querySelector('#saveQuestionnaireBtn'),
    cancelBtn: card.querySelector('#cancelQuestionnaireBtn'),
  }
}
