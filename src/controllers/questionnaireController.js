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

  const markClean = () => {
    state.questionnaireDirty = false
  }

  const markDirty = () => {
    state.questionnaireDirty = true
  }

  const loadQuestionnaire = async () => {
    shell.setStatus('Loading questionnaire...', false)
    try {
      await data.loadLanguages()
      languagesRender.renderLanguageSelectors()
      await Promise.all([data.loadQuestions(), data.loadOptions(), data.loadTranslations()])
      render.renderQuestionsList()
      render.renderCreateFormVisibility()
      markClean()
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


  const handleOptionActiveToggle = async (questionKey, optionKey, isActive) => {
    const option = state.options.find(
      (item) => item.question_key === questionKey && item.option_key === optionKey
    )
    if (!option) return
    try {
      await api.upsertOption({
        token: state.token,
        question_key: questionKey,
        option_key: optionKey,
        sort: option.sort,
        is_active: isActive,
        translation_key: option.translation_key,
      })
      option.is_active = isActive ? 1 : 0
      shell.setStatus(`Option ${isActive ? 'activated' : 'deactivated'}`, false)
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
    if (!option_key) {
      shell.setStatus('Option key is required', true)
      return
    }
    const existingOptions = state.options.filter((o) => o.question_key === question_key)
    const maxSort = Math.max(0, ...existingOptions.map((o) => Number(o.sort || 0)))
    try {
      await api.upsertOption({
        token: state.token,
        question_key,
        option_key,
        sort: maxSort + 1,
        is_active: true,
        translation_key: `options.${question_key}.${option_key}`,
      })
      wrapper.querySelector('[data-field="option-new-key"]').value = ''
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
      newQuestionSingleChoice,
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
        single_choice: newQuestionSingleChoice.checked,
        rows: newQuestionRows.value,
      },
    })
    if (!added) return
    actions.resetNewQuestionForm()
    closeQuestionModal()
    render.renderQuestionsList()
    markDirty()
  }

  const bindEvents = () => {
    views.questionnaireView.reloadQuestionnaireButton.addEventListener('click', () =>
      loadQuestionnaire()
    )
    views.questionnaireView.saveQuestionnaireButton.addEventListener('click', async () => {
      await actions.saveQuestionnaire()
      markClean()
    })
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

    // Track dirty state on any text input or checkbox change inside the questions body
    views.questionnaireView.questionsBody.addEventListener('input', () => markDirty())
    views.questionnaireView.questionsBody.addEventListener('change', (event) => {
      // Don't mark dirty for option-active toggles (they save immediately)
      if (!event.target.closest('[data-field="option-active"]')) {
        markDirty()
      }
    })

    views.questionnaireView.questionsBody.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]')
      if (!button) return
      if (button.dataset.action === 'option-delete') {
        handleOptionDelete(button)
      }
      if (button.dataset.action === 'option-add') {
        handleOptionAdd(button)
      }
    })

    views.questionnaireView.questionsBody.addEventListener('change', (event) => {
      const checkbox = event.target.closest('[data-field="option-active"]')
      if (!checkbox) return
      const questionKey = checkbox.dataset.questionKey
      const optionKey = checkbox.dataset.optionKey
      if (!questionKey || !optionKey) return
      handleOptionActiveToggle(questionKey, optionKey, checkbox.checked)
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
        optionRow.draggable = false
        draggingOption = null
        return
      }
      const wrapper = event.target.closest('.question-block')
      if (!wrapper) return
      wrapper.classList.remove('dragging')
      wrapper.draggable = false
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
        markDirty()
      }
    })
  }

  const saveAndClean = async () => {
    await actions.saveQuestionnaire()
    markClean()
  }

  const discardChanges = async () => {
    await loadQuestionnaire()
  }

  const getDirtyGuard = () => ({
    isDirty: () => state.questionnaireDirty && state.page === 'questionnaire',
    save: saveAndClean,
    discard: discardChanges,
  })

  return { bindEvents, loadQuestionnaire, loadTranslations, getDirtyGuard }
}
