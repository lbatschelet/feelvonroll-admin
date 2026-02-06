/**
 * Questionnaire controller orchestrates data, render, actions, and sort modules.
 * Exports: createQuestionnaireController.
 */
import { createQuestionnaireData } from './questionnaireData'
import { createQuestionnaireRender } from './questionnaireRender'
import { createQuestionnaireActions } from './questionnaireActions'
import { reorderQuestions } from './questionnaireSort'
import { createLanguagesRender } from './languagesRender'

export function createQuestionnaireController({ state, views, api, shell, renderDashboard, renderPins }) {
  const data = createQuestionnaireData({ state, api })
  const render = createQuestionnaireRender({ state, views })
  const languagesRender = createLanguagesRender({ state, views })
  const actions = createQuestionnaireActions({
    state,
    views,
    api,
    shell,
    data,
    render,
    renderDashboard,
  })
  let draggingOption = null

  const loadQuestionnaire = async () => {
    shell.setStatus('Loading questionnaire...', false)
    try {
      await data.loadLanguages()
      languagesRender.renderLanguageSelectors()
      await Promise.all([data.loadQuestions(), data.loadOptions(), data.loadTranslations()])
      render.renderQuestionsList()
      render.renderCreateFormVisibility()
      renderDashboard()
      shell.setStatus('Questionnaire loaded', false)
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  const loadTranslations = async () => {
    await data.loadTranslations()
    render.renderQuestionsList()
    renderPins()
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
    const confirmed = window.confirm('Delete this option?')
    if (!confirmed) return
    try {
      await api.deleteOption({ token: state.token, question_key, option_key })
      await data.loadOptions()
      await data.loadTranslations()
      render.renderQuestionsList()
      shell.setStatus('Option deleted', false)
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
      shell.setStatus('Option key is required', true)
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
      shell.setStatus('Option added', false)
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  const openQuestionModal = () => {
    views.questionnaireView.questionModal.classList.add('is-visible')
    views.questionnaireView.newQuestionKey.focus()
  }

  const closeQuestionModal = () => {
    views.questionnaireView.questionModal.classList.remove('is-visible')
  }

  const handleAddQuestion = () => {
    const {
      newQuestionKey,
      newQuestionType,
      newQuestionRequired,
      newQuestionActive,
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
      shell.setStatus('Key is required', true)
      return
    }
    if (state.questions.find((question) => question.question_key === key)) {
      shell.setStatus('Key already exists', true)
      return
    }
    const type = newQuestionType.value
    const required = newQuestionRequired.checked
    const isActive = newQuestionActive.checked
    const added = actions.addQuestion({
      key,
      type,
      required,
      isActive,
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
    closeQuestionModal()
    render.renderQuestionsList()
  }

  const bindEvents = () => {
    views.questionnaireView.languageSelect.addEventListener('change', (event) => {
      state.selectedLanguage = event.target.value
      loadTranslations()
    })
    views.questionnaireView.reloadQuestionnaireButton.addEventListener('click', () =>
      loadQuestionnaire()
    )
    views.questionnaireView.saveQuestionnaireButton.addEventListener('click', () =>
      actions.saveQuestionnaire()
    )
    views.questionnaireView.openQuestionModalButton.addEventListener('click', () =>
      openQuestionModal()
    )
    views.questionnaireView.closeQuestionModalButton.addEventListener('click', () =>
      closeQuestionModal()
    )
    views.questionnaireView.cancelQuestionModalButton.addEventListener('click', () =>
      closeQuestionModal()
    )
    views.questionnaireView.newQuestionType.addEventListener('change', () =>
      render.renderCreateFormVisibility()
    )
    views.questionnaireView.addQuestionButton.addEventListener('click', () => handleAddQuestion())

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
      const optionRow = event.target.closest('.option-row')
      if (optionRow) {
        draggingOption = {
          questionKey: optionRow.dataset.questionKey,
          optionKey: optionRow.dataset.optionKey,
        }
        optionRow.classList.add('dragging')
        return
      }
      const wrapper = event.target.closest('.question-block')
      if (!wrapper) return
      state.draggingKey = wrapper.dataset.key
      wrapper.classList.add('dragging')
    })
    views.questionnaireView.questionsBody.addEventListener('dragend', (event) => {
      const optionRow = event.target.closest('.option-row')
      if (optionRow) {
        optionRow.classList.remove('dragging')
        draggingOption = null
        return
      }
      const wrapper = event.target.closest('.question-block')
      if (!wrapper) return
      wrapper.classList.remove('dragging')
      state.draggingKey = null
    })
    views.questionnaireView.questionsBody.addEventListener('dragover', (event) => {
      const optionRow = event.target.closest('.option-row')
      if (optionRow && draggingOption) {
        if (optionRow.dataset.questionKey !== draggingOption.questionKey) return
        event.preventDefault()
        optionRow.classList.add('drag-over')
        return
      }
      const wrapper = event.target.closest('.question-block')
      if (!wrapper) return
      event.preventDefault()
      wrapper.classList.add('drag-over')
    })
    views.questionnaireView.questionsBody.addEventListener('dragleave', (event) => {
      const optionRow = event.target.closest('.option-row')
      if (optionRow) {
        optionRow.classList.remove('drag-over')
        return
      }
      const wrapper = event.target.closest('.question-block')
      if (!wrapper) return
      wrapper.classList.remove('drag-over')
    })
    views.questionnaireView.questionsBody.addEventListener('drop', (event) => {
      const optionRow = event.target.closest('.option-row')
      if (optionRow && draggingOption) {
        event.preventDefault()
        optionRow.classList.remove('drag-over')
        if (optionRow.dataset.questionKey !== draggingOption.questionKey) return
        const list = optionRow.closest('.option-list')
        if (!list) return
        const dragSelector = `.option-row[data-option-key="${draggingOption.optionKey}"]`
        const draggingEl = list.querySelector(dragSelector)
        if (!draggingEl || draggingEl === optionRow) return
        list.insertBefore(draggingEl, optionRow)
        const orderedKeys = Array.from(list.querySelectorAll('.option-row')).map(
          (row) => row.dataset.optionKey
        )
        actions.saveOptionOrder(draggingOption.questionKey, orderedKeys)
        return
      }
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
