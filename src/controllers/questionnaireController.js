/**
 * Questionnaire controller orchestrates data, render, actions, and sort modules.
 * Exports: createQuestionnaireController.
 */
import { createQuestionnaireData } from './questionnaireData'
import { createQuestionnaireRender } from './questionnaireRender'
import { createQuestionnaireActions } from './questionnaireActions'
import { reorderQuestions } from './questionnaireSort'

export function createQuestionnaireController({ state, views, api, shell, renderDashboard, renderPins }) {
  const data = createQuestionnaireData({ state, api })
  const render = createQuestionnaireRender({ state, views })
  const actions = createQuestionnaireActions({
    state,
    views,
    api,
    shell,
    data,
    render,
    renderDashboard,
  })

  const loadQuestionnaire = async () => {
    shell.setStatus('Lade Fragebogen...', false)
    try {
      await data.loadLanguages()
      render.renderLanguageSelectors()
      await Promise.all([data.loadQuestions(), data.loadOptions(), data.loadTranslations()])
      render.renderLanguagesTable()
      render.renderQuestionsList()
      render.renderCreateFormVisibility()
      renderDashboard()
      shell.setStatus('Fragebogen geladen', false)
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  const loadTranslations = async () => {
    await data.loadTranslations()
    render.renderQuestionsList()
    renderPins()
  }

  const handleLanguageToggle = async (input) => {
    const lang = input.dataset.lang
    try {
      await api.toggleLanguage({ token: state.token, lang, enabled: input.checked })
      await data.loadLanguages()
      render.renderLanguageSelectors()
      await data.loadTranslations()
      render.renderLanguagesTable()
      render.renderCreateFormVisibility()
      render.renderQuestionsList()
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  const handleLanguageDelete = async (button) => {
    const lang = button.dataset.lang
    const confirmed = window.confirm(`Sprache "${lang}" löschen?`)
    if (!confirmed) return
    try {
      await api.deleteLanguage({ token: state.token, lang })
      await data.loadLanguages()
      render.renderLanguageSelectors()
      render.renderLanguagesTable()
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  const handleOptionSave = async (button) => {
    const row = button.closest('.option-row')
    if (!row) return
    const question_key = row.dataset.questionKey
    const option_key = row.dataset.optionKey
    const sort = Number(row.querySelector('[data-field="option-sort"]')?.value || 0)
    const is_active = Boolean(row.querySelector('[data-field="option-active"]')?.checked)
    const label = row.querySelector('[data-field="option-label"]')?.value || ''
    const option = state.options.find(
      (item) => item.question_key === question_key && item.option_key === option_key
    )
    if (!option) return
    try {
      await actions.saveOption({
        question_key,
        option_key,
        sort,
        is_active,
        translation_key: option.translation_key,
        label,
      })
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  const handleOptionDelete = async (button) => {
    const row = button.closest('.option-row')
    if (!row) return
    const question_key = row.dataset.questionKey
    const option_key = row.dataset.optionKey
    const confirmed = window.confirm('Option wirklich löschen?')
    if (!confirmed) return
    try {
      await api.deleteOption({ token: state.token, question_key, option_key })
      await data.loadOptions()
      await data.loadTranslations()
      render.renderQuestionsList()
      shell.setStatus('Option gelöscht', false)
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  const handleOptionAdd = async (button) => {
    const wrapper = button.closest('.option-add')
    if (!wrapper) return
    const question_key = wrapper.dataset.questionKey
    const option_key = wrapper.querySelector('[data-field="option-new-key"]')?.value.trim()
    const sort = Number(wrapper.querySelector('[data-field="option-new-sort"]')?.value || 0)
    const label = wrapper.querySelector('[data-field="option-new-label"]')?.value || ''
    if (!option_key) {
      shell.setStatus('Option Key fehlt', true)
      return
    }
    try {
      await api.upsertOption({
        token: state.token,
        question_key,
        option_key,
        sort,
        is_active: true,
        translation_key: `options.${question_key}.${option_key}`,
      })
      await actions.saveTranslations({ [`options.${question_key}.${option_key}`]: label })
      wrapper.querySelector('[data-field="option-new-key"]').value = ''
      wrapper.querySelector('[data-field="option-new-sort"]').value = ''
      wrapper.querySelector('[data-field="option-new-label"]').value = ''
      await data.loadOptions()
      await data.loadTranslations()
      render.renderQuestionsList()
      shell.setStatus('Option hinzugefügt', false)
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  const handleAddLanguage = async () => {
    const lang = views.languagesView.languageCode.value.trim()
    const label = views.languagesView.languageLabel.value.trim()
    if (!lang || !label) {
      shell.setStatus('Code und Label fehlen', true)
      return
    }
    try {
      await api.upsertLanguage({ token: state.token, lang, label })
      views.languagesView.languageCode.value = ''
      views.languagesView.languageLabel.value = ''
      await data.loadLanguages()
      render.renderLanguageSelectors()
      await data.loadTranslations()
      render.renderQuestionsList()
      shell.setStatus('Sprache gespeichert', false)
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  const handleAddQuestion = () => {
    const {
      newQuestionKey,
      newQuestionType,
      newQuestionRequired,
      newQuestionActive,
      newQuestionSort,
      newQuestionMin,
      newQuestionMax,
      newQuestionStep,
      newQuestionDefault,
      newQuestionUseForColor,
      newQuestionAllowMultiple,
      newQuestionRows,
    } = views.questionnaireView
    const key = newQuestionKey.value.trim()
    if (!key) {
      shell.setStatus('Key fehlt', true)
      return
    }
    if (state.questions.find((question) => question.question_key === key)) {
      shell.setStatus('Key existiert bereits', true)
      return
    }
    const type = newQuestionType.value
    const required = newQuestionRequired.checked
    const isActive = newQuestionActive.checked
    const sort = Number(newQuestionSort.value || 0)
    const added = actions.addQuestion({
      key,
      type,
      required,
      isActive,
      sort,
      configValues: {
        min: newQuestionMin.value,
        max: newQuestionMax.value,
        step: newQuestionStep.value,
        default: newQuestionDefault.value,
        use_for_color: newQuestionUseForColor.checked,
        allow_multiple: newQuestionAllowMultiple.checked,
        rows: newQuestionRows.value,
      },
    })
    if (!added) return
    actions.resetNewQuestionForm()
    render.renderQuestionsList()
  }

  const bindEvents = () => {
    views.questionnaireView.languageSelect.addEventListener('change', (event) => {
      state.selectedLanguage = event.target.value
      loadTranslations()
    })
    views.languagesView.addLanguageButton.addEventListener('click', () => handleAddLanguage())
    views.questionnaireView.reloadQuestionnaireButton.addEventListener('click', () =>
      loadQuestionnaire()
    )
    views.questionnaireView.saveQuestionnaireButton.addEventListener('click', () =>
      actions.saveQuestionnaire()
    )
    views.questionnaireView.newQuestionType.addEventListener('change', () =>
      render.renderCreateFormVisibility()
    )
    views.questionnaireView.addQuestionButton.addEventListener('click', () => handleAddQuestion())

    views.languagesView.languagesBody.addEventListener('change', (event) => {
      const target = event.target
      if (target?.dataset?.action === 'lang-toggle') {
        handleLanguageToggle(target)
      }
    })
    views.languagesView.languagesBody.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]')
      if (!button) return
      if (button.dataset.action === 'lang-delete') {
        handleLanguageDelete(button)
      }
    })

    views.questionnaireView.questionsBody.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]')
      if (!button) return
      if (button.dataset.action === 'option-save') {
        handleOptionSave(button)
      }
      if (button.dataset.action === 'option-delete') {
        handleOptionDelete(button)
      }
      if (button.dataset.action === 'option-add') {
        handleOptionAdd(button)
      }
    })

    views.questionnaireView.questionsBody.addEventListener('dragstart', (event) => {
      const wrapper = event.target.closest('.question-block')
      if (!wrapper) return
      state.draggingKey = wrapper.dataset.key
      wrapper.classList.add('dragging')
    })
    views.questionnaireView.questionsBody.addEventListener('dragend', (event) => {
      const wrapper = event.target.closest('.question-block')
      if (!wrapper) return
      wrapper.classList.remove('dragging')
      state.draggingKey = null
    })
    views.questionnaireView.questionsBody.addEventListener('dragover', (event) => {
      const wrapper = event.target.closest('.question-block')
      if (!wrapper) return
      event.preventDefault()
      wrapper.classList.add('drag-over')
    })
    views.questionnaireView.questionsBody.addEventListener('dragleave', (event) => {
      const wrapper = event.target.closest('.question-block')
      if (!wrapper) return
      wrapper.classList.remove('drag-over')
    })
    views.questionnaireView.questionsBody.addEventListener('drop', (event) => {
      const wrapper = event.target.closest('.question-block')
      if (!wrapper) return
      event.preventDefault()
      wrapper.classList.remove('drag-over')
      const dragKey = state.draggingKey
      const dropKey = wrapper.dataset.key
      if (dragKey && dragKey !== dropKey) {
        state.questions = reorderQuestions(state.questions, dragKey, dropKey)
        render.renderQuestionsList()
      }
    })
  }

  return { bindEvents, loadQuestionnaire, loadTranslations }
}
