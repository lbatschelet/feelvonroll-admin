/**
 * Questionnaire view builder for question editor UI.
 * Uses a card/tile grid for questions and a modal for editing.
 * Exports: createQuestionnaireView.
 */
import { icons } from '../utils/dom'

export function createQuestionnaireView() {
  const questionnaireCard = document.createElement('section')
  questionnaireCard.className = 'card questionnaire-card'
  questionnaireCard.innerHTML = `
    <div class="card-header">
      <h2>Questions</h2>
      <div class="header-actions">
        <button id="reloadQuestionnaire" class="icon-btn-ghost" title="Reload questionnaire data">${icons.reload}</button>
        <button id="saveQuestionnaire" class="primary" title="Save all questionnaire changes">Save changes</button>
      </div>
    </div>
    <div class="question-languages" style="display:none">
      <select id="languageSelect"></select>
    </div>
    <div id="questionsBody" class="questions-grid"></div>
    <div class="modal-backdrop" id="questionModal">
      <div class="modal modal-wide">
        <div class="modal-header">
          <h3 id="questionModalTitle">New question</h3>
          <button class="modal-close" id="closeQuestionModal" type="button">&times;</button>
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
            <span>Single choice</span>
            <input type="checkbox" id="newQuestionSingleChoice" checked title="Checked: only one option can be selected. Unchecked: multiple options can be selected." />
          </label>
        </div>
        <div class="question-row text-only">
          <label class="field">
            <span>Rows</span>
            <input type="number" id="newQuestionRows" value="3" title="Height of the text field" />
          </label>
        </div>
        <div id="questionModalOptions"></div>
        <div class="modal-actions">
          <button class="icon-btn danger" id="deleteQuestion" type="button" title="Delete this question" style="display:none">${icons.trash}</button>
          <span class="modal-actions-spacer"></span>
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
    questionModal: questionnaireCard.querySelector('#questionModal'),
    questionModalTitle: questionnaireCard.querySelector('#questionModalTitle'),
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
    newQuestionSingleChoice: questionnaireCard.querySelector('#newQuestionSingleChoice'),
    newQuestionRows: questionnaireCard.querySelector('#newQuestionRows'),
    addQuestionButton: questionnaireCard.querySelector('#addQuestion'),
    deleteQuestionButton: questionnaireCard.querySelector('#deleteQuestion'),
    questionModalOptions: questionnaireCard.querySelector('#questionModalOptions'),
  }
}
