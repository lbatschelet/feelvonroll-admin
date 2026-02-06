/**
 * Questionnaire view builder for question editor UI.
 * Exports: createQuestionnaireView.
 */
export function createQuestionnaireView() {
  const questionnaireCard = document.createElement('section')
  questionnaireCard.className = 'card questionnaire-card'
  questionnaireCard.innerHTML = `
    <div class="card-header">
      <h2>Fragebogen</h2>
      <div class="header-actions">
        <button id="reloadQuestionnaire" class="ghost">Neu laden</button>
        <button id="openQuestionModal" class="ghost">Neue Frage</button>
        <button id="saveQuestionnaire" class="primary">Änderungen speichern</button>
      </div>
    </div>
    <div class="question-languages">
      <label class="field">
        <span>Optionen-Sprache</span>
        <select id="languageSelect"></select>
      </label>
    </div>
    <div id="questionsBody" class="questionnaire-body"></div>
    <div class="modal-backdrop" id="questionModal">
      <div class="modal">
        <div class="modal-header">
          <h3>Neue Frage</h3>
          <button class="modal-close" id="closeQuestionModal" type="button">×</button>
        </div>
        <div class="question-row">
          <label class="field">
            <span>Key</span>
            <input type="text" id="newQuestionKey" placeholder="z.B. wellbeing" />
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
            <input type="checkbox" id="newQuestionRequired" />
          </label>
          <label class="field">
            <span>Aktiv</span>
            <input type="checkbox" id="newQuestionActive" checked />
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
          <label class="field">
            <span>Pin-Farbe</span>
            <input type="checkbox" id="newQuestionUseForColor" />
          </label>
        </div>
        <div class="question-row multi-only">
          <label class="field">
            <span>Mehrfach</span>
            <input type="checkbox" id="newQuestionAllowMultiple" />
          </label>
        </div>
        <div class="question-row text-only">
          <label class="field">
            <span>Rows</span>
            <input type="number" id="newQuestionRows" value="3" />
          </label>
        </div>
        <div class="modal-actions">
          <button class="ghost" id="cancelQuestionModal" type="button">Abbrechen</button>
          <button id="addQuestion" class="primary" type="button">Frage hinzufügen</button>
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
