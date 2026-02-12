/**
 * Questionnaire controller orchestrates data, render, actions, and sort modules.
 * Uses a tile grid with an edit/create modal instead of inline editing.
 * Exports: createQuestionnaireController.
 */
import { createQuestionnaireData } from './questionnaireData'
import { createQuestionnaireRender } from './questionnaireRender'
import { createQuestionnaireActions } from './questionnaireActions'
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

  let editingQuestionKey = null
  let draggingOption = null

  const markClean = () => { state.questionnaireDirty = false }
  const markDirty = () => { state.questionnaireDirty = true }

  const loadQuestionnaire = async () => {
    shell.setStatus('Loading questionnaire...', false)
    try {
      await data.loadLanguages()
      languagesRender.renderLanguageSelectors()
      await Promise.all([data.loadQuestions(), data.loadOptions(), data.loadTranslations()])
      render.renderQuestionsList()
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

  /* ── Modal open/close ────────────────────────────────────── */

  const openModalForCreate = () => {
    editingQuestionKey = null
    render.populateModalForCreate()
    render.renderNewQuestionTranslations(views.questionnaireView.newQuestionType.value)
    views.questionnaireView.questionModal.classList.add('is-visible')
    views.questionnaireView.newQuestionKey.focus()
  }

  const openModalForEdit = (questionKey) => {
    const question = state.questions.find((q) => q.question_key === questionKey)
    if (!question) return
    editingQuestionKey = questionKey
    render.populateModalForEdit(question)
    views.questionnaireView.questionModal.classList.add('is-visible')
  }

  const closeModal = () => {
    views.questionnaireView.questionModal.classList.remove('is-visible')
    editingQuestionKey = null
  }

  /* ── Save (create or update) from modal ─────────────────── */

  const handleModalSave = () => {
    if (editingQuestionKey) {
      handleEditSave()
    } else {
      handleAddQuestion()
    }
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
    if (state.questions.find((q) => q.question_key === key)) {
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
    closeModal()
    render.renderQuestionsList()
    markDirty()
  }

  const handleEditSave = () => {
    const question = state.questions.find((q) => q.question_key === editingQuestionKey)
    if (!question) return

    const v = views.questionnaireView
    question.required = v.newQuestionRequired.checked
    question.is_active = v.newQuestionActive.checked

    if (question.type === 'slider') {
      question.config = question.config || {}
      question.config.min = Number(v.newQuestionMin.value)
      question.config.max = Number(v.newQuestionMax.value)
      question.config.step = Number(v.newQuestionStep.value)
      question.config.default = Number(v.newQuestionDefault.value)
      question.config.use_for_color = v.newQuestionUseForColor.checked
    }
    if (question.type === 'multi') {
      question.config = question.config || {}
      question.config.allow_multiple = !v.newQuestionSingleChoice.checked
    }
    if (question.type === 'text') {
      question.config = question.config || {}
      question.config.rows = Number(v.newQuestionRows.value)
    }

    // Collect translations from the modal
    const translationInputs = v.newQuestionTranslations.querySelectorAll('input[data-lang]')
    translationInputs.forEach((input) => {
      const lang = input.dataset.lang
      const field = input.dataset.field
      if (!lang || !field) return
      const tKey = `questions.${editingQuestionKey}.${field}`
      if (!state.pendingTranslationsByLang[lang]) {
        state.pendingTranslationsByLang[lang] = {}
      }
      state.pendingTranslationsByLang[lang][tKey] = input.value.trim()
      if (!state.translationsByLang[lang]) {
        state.translationsByLang[lang] = {}
      }
      state.translationsByLang[lang][tKey] = input.value.trim()
    })

    closeModal()
    render.renderQuestionsList()
    markDirty()
  }

  /* ── Delete question ────────────────────────────────────── */

  const handleDeleteQuestion = () => {
    if (!editingQuestionKey) return
    if (!window.confirm(`Delete question "${editingQuestionKey}"?`)) return
    state.questions = state.questions.filter((q) => q.question_key !== editingQuestionKey)
    closeModal()
    render.renderQuestionsList()
    markDirty()
    shell.setStatus('Question removed (save to apply)', false)
  }

  /* ── Option handlers ────────────────────────────────────── */

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
    if (!window.confirm('Delete this option?')) return
    try {
      await api.deleteOption({ token: state.token, question_key, option_key })
      await data.loadOptions()
      await data.loadTranslations()
      if (editingQuestionKey) {
        const question = state.questions.find((q) => q.question_key === editingQuestionKey)
        if (question) render.renderEditOptions(question)
      }
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
      if (editingQuestionKey) {
        const question = state.questions.find((q) => q.question_key === editingQuestionKey)
        if (question) render.renderEditOptions(question)
      }
      shell.setStatus('Option added', false)
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  /* ── Events ─────────────────────────────────────────────── */

  const bindEvents = () => {
    views.questionnaireView.reloadQuestionnaireButton.addEventListener('click', () =>
      loadQuestionnaire()
    )
    views.questionnaireView.saveQuestionnaireButton.addEventListener('click', async () => {
      await actions.saveQuestionnaire()
      markClean()
    })
    views.questionnaireView.closeQuestionModalButton.addEventListener('click', closeModal)
    views.questionnaireView.cancelQuestionModalButton.addEventListener('click', closeModal)
    views.questionnaireView.newQuestionType.addEventListener('change', () => {
      render.renderCreateFormVisibility()
      if (!editingQuestionKey) {
        render.renderNewQuestionTranslations(views.questionnaireView.newQuestionType.value)
      }
    })
    views.questionnaireView.addQuestionButton.addEventListener('click', handleModalSave)
    views.questionnaireView.deleteQuestionButton.addEventListener('click', handleDeleteQuestion)

    // Track dirty state on modal inputs
    views.questionnaireView.questionModal.addEventListener('input', () => {
      if (editingQuestionKey) markDirty()
    })

    // Tile clicks: open edit or create modal
    views.questionnaireView.questionsBody.addEventListener('click', (event) => {
      const addTile = event.target.closest('[data-action="add-question"]')
      if (addTile) {
        openModalForCreate()
        return
      }
      const tile = event.target.closest('.question-tile[data-key]')
      if (tile) {
        openModalForEdit(tile.dataset.key)
      }
    })

    // Option action buttons inside the modal
    views.questionnaireView.questionModalOptions.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]')
      if (!button) return
      if (button.dataset.action === 'option-delete') {
        handleOptionDelete(button)
      }
      if (button.dataset.action === 'option-add') {
        handleOptionAdd(button)
      }
    })

    views.questionnaireView.questionModalOptions.addEventListener('change', (event) => {
      const checkbox = event.target.closest('[data-field="option-active"]')
      if (!checkbox) return
      const questionKey = checkbox.dataset.questionKey
      const optionKey = checkbox.dataset.optionKey
      if (!questionKey || !optionKey) return
      handleOptionActiveToggle(questionKey, optionKey, checkbox.checked)
    })

    // Option drag-and-drop within the modal
    views.questionnaireView.questionModalOptions.addEventListener('dragstart', (event) => {
      const optionRow = event.target.closest('.option-row')
      if (!optionRow) return
      draggingOption = {
        questionKey: optionRow.dataset.questionKey,
        optionKey: optionRow.dataset.optionKey,
      }
      optionRow.classList.add('dragging')
    })
    views.questionnaireView.questionModalOptions.addEventListener('dragend', (event) => {
      const optionRow = event.target.closest('.option-row')
      if (optionRow) {
        optionRow.classList.remove('dragging')
        optionRow.draggable = false
      }
      draggingOption = null
    })
    views.questionnaireView.questionModalOptions.addEventListener('dragover', (event) => {
      const optionRow = event.target.closest('.option-row')
      if (optionRow && draggingOption && optionRow.dataset.questionKey === draggingOption.questionKey) {
        event.preventDefault()
        optionRow.classList.add('drag-over')
      }
    })
    views.questionnaireView.questionModalOptions.addEventListener('dragleave', (event) => {
      const optionRow = event.target.closest('.option-row')
      if (optionRow) optionRow.classList.remove('drag-over')
    })
    views.questionnaireView.questionModalOptions.addEventListener('drop', (event) => {
      const optionRow = event.target.closest('.option-row')
      if (!optionRow || !draggingOption) return
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
