/**
 * Questionnaire view builder for question editor UI.
 * Exports: createQuestionnaireView.
 */
export function createQuestionnaireView() {
  const questionnaireCard = document.createElement('section')
  questionnaireCard.className = 'card questionnaire-card'
  questionnaireCard.innerHTML = `
    <div class="card-header">
      <h2>Questionnaire</h2>
      <div class="header-actions">
        <button id="reloadQuestionnaire" class="ghost" title="Reload questionnaire data">Reload</button>
        <button id="openQuestionModal" class="ghost">New question</button>
        <button id="saveQuestionnaire" class="primary" title="Save all questionnaire changes">Save changes</button>
      </div>
    </div>
    <div class="question-languages">
      <label class="field">
        <span>Editing language</span>
        <select id="languageSelect" title="Language used for editing translations"></select>
      </label>
    </div>
    <div id="questionsBody" class="questionnaire-body"></div>
    <div class="modal-backdrop" id="questionModal">
      <div class="modal">
        <div class="modal-header">
          <h3>New question</h3>
          <button class="modal-close" id="closeQuestionModal" type="button">×</button>
        </div>
        <div class="question-row">
          <label class="field">
            <span>Key</span>
            <input type="text" id="newQuestionKey" placeholder="e.g. wellbeing" title="Unique identifier used in the API" />
          </label>
          <label class="field">
            <span>Type</span>
            <select id="newQuestionType">
              <option value="slider">Slider</option>
              <option value="multi">Multiple choice</option>
              <option value="text">Text</option>
            </select>
          </label>
          <label class="field">
            <span>Required</span>
            <input type="checkbox" id="newQuestionRequired" title="Must be answered before submitting" />
          </label>
          <label class="field">
            <span>Active</span>
            <input type="checkbox" id="newQuestionActive" checked title="Visible to end users" />
          </label>
          <label class="field slider-only">
            <span>Pin color</span>
            <input
              type="checkbox"
              id="newQuestionUseForColor"
              title="Use this slider to color pins on the map"
            />
          </label>
        </div>
        <div class="question-row question-translations" id="newQuestionTranslations"></div>
        <div class="question-row slider-only">
          <label class="field">
            <span>Min</span>
            <input type="number" id="newQuestionMin" value="0" />
          </label>
          <label class="field">
            <span>Max</span>
            <input type="number" id="newQuestionMax" value="1" />
          </label>
          <label class="field">
            <span>Step</span>
            <input type="number" id="newQuestionStep" value="0.01" />
          </label>
          <label class="field">
            <span>Default</span>
            <input type="number" id="newQuestionDefault" value="0.5" />
          </label>
        </div>
        <div class="question-row multi-only">
          <label class="field">
            <span>Allow multiple</span>
            <input type="checkbox" id="newQuestionAllowMultiple" title="Allow selecting multiple options" />
          </label>
        </div>
        <div class="question-row text-only">
          <label class="field">
            <span>Rows</span>
            <input type="number" id="newQuestionRows" value="3" title="Height of the text field" />
          </label>
        </div>
        <div class="modal-actions">
          <button class="ghost" id="cancelQuestionModal" type="button">Cancel</button>
          <button id="addQuestion" class="primary" type="button">Add question</button>
        </div>
      </div>
    </div>
  `

  return {
    element: questionnaireCard,
    reloadQuestionnaireButton: questionnaireCard.querySelector('#reloadQuestionnaire'),
    saveQuestionnaireButton: questionnaireCard.querySelector('#saveQuestionnaire'),
    openQuestionModalButton: questionnaireCard.querySelector('#openQuestionModal'),
    questionModal: questionnaireCard.querySelector('#questionModal'),
    closeQuestionModalButton: questionnaireCard.querySelector('#closeQuestionModal'),
    cancelQuestionModalButton: questionnaireCard.querySelector('#cancelQuestionModal'),
    languageSelect: questionnaireCard.querySelector('#languageSelect'),
    questionsBody: questionnaireCard.querySelector('#questionsBody'),
    newQuestionKey: questionnaireCard.querySelector('#newQuestionKey'),
    newQuestionType: questionnaireCard.querySelector('#newQuestionType'),
    newQuestionRequired: questionnaireCard.querySelector('#newQuestionRequired'),
    newQuestionActive: questionnaireCard.querySelector('#newQuestionActive'),
    newQuestionTranslations: questionnaireCard.querySelector('#newQuestionTranslations'),
    newQuestionMin: questionnaireCard.querySelector('#newQuestionMin'),
    newQuestionMax: questionnaireCard.querySelector('#newQuestionMax'),
    newQuestionStep: questionnaireCard.querySelector('#newQuestionStep'),
    newQuestionDefault: questionnaireCard.querySelector('#newQuestionDefault'),
    newQuestionUseForColor: questionnaireCard.querySelector('#newQuestionUseForColor'),
    newQuestionAllowMultiple: questionnaireCard.querySelector('#newQuestionAllowMultiple'),
    newQuestionRows: questionnaireCard.querySelector('#newQuestionRows'),
    addQuestionButton: questionnaireCard.querySelector('#addQuestion'),
  }
}
