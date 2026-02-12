/**
 * Questionnaire controller orchestrates data, render, actions, and sort modules.
 * Each question is saved directly to the API from the modal (no batch save).
 * Exports: createQuestionnaireController.
 */
import { createQuestionnaireData } from './questionnaireData'
import { createQuestionnaireRender } from './questionnaireRender'
import { createQuestionnaireActions, buildQuestionConfig, buildNewQuestion } from './questionnaireActions'
import { createLanguagesRender } from './languagesRender'
import { showModal, hideModal, bindModalClose } from '../utils/adminModal'

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

  const loadQuestionnaire = async () => {
    shell.setStatus('Loading questions...', false)
    try {
      await data.loadLanguages()
      languagesRender.renderLanguageSelectors()
      await Promise.all([data.loadQuestions(), data.loadOptions(), data.loadTranslations()])
      render.renderQuestionsList()
      renderDashboard()
      shell.setStatus('')
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
    showModal(views.questionnaireView.questionModal)
    views.questionnaireView.newQuestionKey.focus()
  }

  const openModalForEdit = (questionKey) => {
    const question = state.questions.find((q) => q.question_key === questionKey)
    if (!question) return
    editingQuestionKey = questionKey
    render.populateModalForEdit(question)
    showModal(views.questionnaireView.questionModal)
  }

  const closeModal = () => {
    hideModal(views.questionnaireView.questionModal)
    editingQuestionKey = null
  }

  /* ── Save from modal (directly to API) ───────────────────── */

  const handleModalSave = async () => {
    if (editingQuestionKey) {
      await handleEditSave()
    } else {
      await handleCreateSave()
    }
  }

  const handleCreateSave = async () => {
    const v = views.questionnaireView
    const key = v.newQuestionKey.value.trim()
    if (!key) {
      shell.setStatus('Key is required', true)
      return
    }
    if (state.questions.find((q) => q.question_key === key)) {
      shell.setStatus('Key already exists', true)
      return
    }

    const type = v.newQuestionType.value
    const translationsByLang = actions.collectNewQuestionTranslations(type)
    if (!translationsByLang) return

    const config = buildQuestionConfig({
      type,
      values: {
        min: v.newQuestionMin.value,
        max: v.newQuestionMax.value,
        step: v.newQuestionStep.value,
        default: v.newQuestionDefault.value,
        use_for_color: v.newQuestionUseForColor.checked,
        single_choice: v.newQuestionSingleChoice.checked,
        rows: v.newQuestionRows.value,
      },
    })
    const question = buildNewQuestion({
      key,
      type,
      required: v.newQuestionRequired.checked,
      isActive: v.newQuestionActive.checked,
      config,
      existingQuestions: state.questions,
    })

    shell.setStatus('Saving...', false)
    try {
      await actions.saveSingleQuestion(question, translationsByLang)
      closeModal()
      shell.setStatus('Question created', false)
      await actions.reloadAndRender()
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  const handleEditSave = async () => {
    const question = state.questions.find((q) => q.question_key === editingQuestionKey)
    if (!question) return

    const v = views.questionnaireView

    // Build updated question object
    const updated = {
      question_key: editingQuestionKey,
      type: question.type,
      required: v.newQuestionRequired.checked,
      sort: question.sort,
      is_active: v.newQuestionActive.checked,
      config: { ...(question.config || {}) },
    }

    if (question.type === 'slider') {
      updated.config.min = Number(v.newQuestionMin.value)
      updated.config.max = Number(v.newQuestionMax.value)
      updated.config.step = Number(v.newQuestionStep.value)
      updated.config.default = Number(v.newQuestionDefault.value)
      updated.config.use_for_color = v.newQuestionUseForColor.checked
    }
    if (question.type === 'multi') {
      updated.config.allow_multiple = !v.newQuestionSingleChoice.checked
    }
    if (question.type === 'text') {
      updated.config.rows = Number(v.newQuestionRows.value)
    }

    // Collect translations from the modal
    const translationsByLang = {}
    const translationInputs = v.newQuestionTranslations.querySelectorAll('input[data-lang]')
    for (const language of state.languages) {
      translationsByLang[language.lang] = {}
    }
    translationInputs.forEach((input) => {
      const lang = input.dataset.lang
      const field = input.dataset.field
      if (!lang || !field || !translationsByLang[lang]) return
      translationsByLang[lang][field] = input.value.trim()
    })

    shell.setStatus('Saving...', false)
    try {
      await actions.saveSingleQuestion(updated, translationsByLang)
      closeModal()
      shell.setStatus('Question saved', false)
      await actions.reloadAndRender()
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  /* ── Delete question ────────────────────────────────────── */

  const handleDeleteQuestion = async (questionKey) => {
    if (!window.confirm(`Delete question "${questionKey}"?`)) return
    shell.setStatus('Deleting...', false)
    try {
      await actions.deleteQuestion(questionKey)
      closeModal()
      shell.setStatus('Question deleted', false)
      await actions.reloadAndRender()
    } catch (error) {
      shell.setStatus(error.message, true)
    }
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
    views.questionnaireView.newQuestionType.addEventListener('change', () => {
      render.renderCreateFormVisibility()
      if (!editingQuestionKey) {
        render.renderNewQuestionTranslations(views.questionnaireView.newQuestionType.value)
      }
    })
    views.questionnaireView.addQuestionButton.addEventListener('click', handleModalSave)
    views.questionnaireView.deleteQuestionButton.addEventListener('click', () => {
      if (editingQuestionKey) handleDeleteQuestion(editingQuestionKey)
    })

    bindModalClose(views.questionnaireView.questionModal, closeModal, [
      views.questionnaireView.closeQuestionModalButton,
      views.questionnaireView.cancelQuestionModalButton,
    ])

    // "+ New Question" button in header
    views.questionnaireView.addQuestionBtn.addEventListener('click', () => openModalForCreate())

    // Active toggle in table
    views.questionnaireView.questionsBody.addEventListener('change', async (event) => {
      const toggle = event.target.closest('[data-toggle="active"]')
      if (!toggle) return
      const key = toggle.dataset.id
      const question = state.questions.find((q) => q.question_key === key)
      if (!question) return
      const newActive = toggle.checked
      try {
        await api.upsertQuestion({
          token: state.token,
          question: { ...question, is_active: newActive },
        })
        question.is_active = newActive
        shell.setStatus(`Question ${newActive ? 'activated' : 'deactivated'}`, false)
      } catch (error) {
        toggle.checked = !newActive
        shell.setStatus(error.message, true)
      }
    })

    // Table row edit/delete clicks
    views.questionnaireView.questionsBody.addEventListener('click', (event) => {
      const editBtn = event.target.closest('[data-edit]')
      if (editBtn) {
        openModalForEdit(editBtn.dataset.edit)
        return
      }
      const deleteBtn = event.target.closest('[data-delete]')
      if (deleteBtn) {
        handleDeleteQuestion(deleteBtn.dataset.delete)
      }
    })

    // Option action buttons inside the modal
    views.questionnaireView.questionModalOptions.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]')
      if (!button) return
      if (button.dataset.action === 'option-delete') handleOptionDelete(button)
      if (button.dataset.action === 'option-add') handleOptionAdd(button)
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

  return { bindEvents, loadQuestionnaire, loadTranslations }
}
