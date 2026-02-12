/**
 * Languages view builder for language management table + modal.
 * Exports: createLanguagesView.
 */
import { icons } from '../utils/dom'

export function createLanguagesView() {
  const languagesCard = document.createElement('section')
  languagesCard.className = 'card languages-card'
  languagesCard.innerHTML = `
    <div class="card-header">
      <h2>Languages</h2>
      <div class="header-actions">
        <button class="button" id="addLanguageBtn">+ New Language</button>
      </div>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Label</th>
            <th>Active</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="languagesBody"></tbody>
      </table>
    </div>

    <!-- Language create/edit modal -->
    <div class="modal-backdrop" id="languageModal">
      <div class="modal">
        <div class="modal-header">
          <h3 id="languageModalTitle">New Language</h3>
          <button class="modal-close" id="closeLanguageModal" type="button">&times;</button>
        </div>
        <div class="modal-fields-row">
          <label class="field">
            <span>Code</span>
            <input type="text" id="languageCode" placeholder="e.g. en" title="Short language code" />
          </label>
          <label class="field">
            <span>Label</span>
            <input type="text" id="languageLabel" placeholder="e.g. English" title="Language name" />
          </label>
        </div>
        <div class="modal-actions">
          <span class="modal-actions-spacer"></span>
          <button class="ghost" id="cancelLanguageModal" type="button">Cancel</button>
          <button id="saveLanguageBtn" class="btn-save" type="button">${icons.save} Save</button>
        </div>
      </div>
    </div>
  `

  return {
    element: languagesCard,
    addBtn: languagesCard.querySelector('#addLanguageBtn'),
    languagesBody: languagesCard.querySelector('#languagesBody'),
    modal: languagesCard.querySelector('#languageModal'),
    modalTitle: languagesCard.querySelector('#languageModalTitle'),
    closeModalBtn: languagesCard.querySelector('#closeLanguageModal'),
    cancelModalBtn: languagesCard.querySelector('#cancelLanguageModal'),
    codeInput: languagesCard.querySelector('#languageCode'),
    labelInput: languagesCard.querySelector('#languageLabel'),
    saveBtn: languagesCard.querySelector('#saveLanguageBtn'),
  }
}
