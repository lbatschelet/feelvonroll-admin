/**
 * Questionnaire render helpers for language and question UI.
 * Renders question tiles in a grid and populates the edit modal.
 * Exports: createQuestionnaireRender.
 */
import { createButton, createCheckbox, createInput, createLabeled, icons } from '../utils/dom'

export function createQuestionnaireRender({ state, views }) {
  const questionnaireView = views.questionnaireView
  const { questionsBody, newQuestionTranslations } = questionnaireView

  const getTranslationFor = (lang, key) =>
    state.translationsByLang[lang]?.[key] || state.pendingTranslationsByLang[lang]?.[key] || ''

  /* ── Tile grid ────────────────────────────────────────────── */

  const renderQuestionsList = () => {
    questionsBody.innerHTML = ''
    if (!state.questions.length) {
      const empty = document.createElement('div')
      empty.className = 'empty'
      empty.textContent = 'No questions yet'
      questionsBody.appendChild(empty)
    }

    state.questions
      .slice()
      .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
      .forEach((question) => {
        const tile = document.createElement('button')
        tile.type = 'button'
        tile.className = 'question-tile'
        tile.dataset.key = question.question_key
        if (!question.is_active) tile.classList.add('is-inactive')

        const labelKey = `questions.${question.question_key}.label`
        const label = getTranslationFor(state.selectedLanguage, labelKey) || question.question_key

        tile.innerHTML = `
          <span class="question-tile-label">${escapeHtml(label)}</span>
          <span class="question-tile-meta">
            <span class="question-tile-type">${question.type}</span>
            <span class="question-tile-key">${escapeHtml(question.question_key)}</span>
          </span>
        `
        questionsBody.appendChild(tile)
      })

    // "Add new" tile
    const addTile = document.createElement('button')
    addTile.type = 'button'
    addTile.className = 'question-tile question-tile-add'
    addTile.dataset.action = 'add-question'
    addTile.innerHTML = `<span class="question-tile-plus">+</span><span>New question</span>`
    questionsBody.appendChild(addTile)
  }

  /* ── Populate modal for editing an existing question ─────── */

  const populateModalForEdit = (question) => {
    const v = questionnaireView
    v.questionModalTitle.textContent = 'Edit question'
    v.addQuestionButton.textContent = 'Save'
    v.deleteQuestionButton.style.display = ''
    v.newQuestionKey.value = question.question_key
    v.newQuestionKey.readOnly = true
    v.newQuestionType.value = question.type
    v.newQuestionType.disabled = true
    v.newQuestionRequired.checked = Boolean(question.required)
    v.newQuestionActive.checked = Boolean(question.is_active)
    v.newQuestionUseForColor.checked = Boolean(question.config?.use_for_color)
    v.newQuestionSingleChoice.checked = !question.config?.allow_multiple

    if (question.type === 'slider') {
      v.newQuestionMin.value = question.config?.min ?? 0
      v.newQuestionMax.value = question.config?.max ?? 1
      v.newQuestionStep.value = question.config?.step ?? 0.01
      v.newQuestionDefault.value = question.config?.default ?? 0.5
    }
    if (question.type === 'text') {
      v.newQuestionRows.value = question.config?.rows ?? 3
    }

    renderCreateFormVisibility()
    renderEditTranslations(question)
    renderEditOptions(question)
  }

  const populateModalForCreate = () => {
    const v = questionnaireView
    v.questionModalTitle.textContent = 'New question'
    v.addQuestionButton.textContent = 'Add question'
    v.deleteQuestionButton.style.display = 'none'
    v.newQuestionKey.value = ''
    v.newQuestionKey.readOnly = false
    v.newQuestionType.value = 'slider'
    v.newQuestionType.disabled = false
    v.newQuestionRequired.checked = false
    v.newQuestionActive.checked = true
    v.newQuestionUseForColor.checked = false
    v.newQuestionSingleChoice.checked = true
    v.newQuestionMin.value = '0'
    v.newQuestionMax.value = '1'
    v.newQuestionStep.value = '0.01'
    v.newQuestionDefault.value = '0.5'
    v.newQuestionRows.value = '3'
    v.questionModalOptions.innerHTML = ''

    renderCreateFormVisibility()
    renderNewQuestionTranslations(v.newQuestionType.value)
  }

  /* ── Translations in edit modal ─────────────────────────── */

  const renderEditTranslations = (question) => {
    newQuestionTranslations.innerHTML = ''
    state.languages.forEach((language) => {
      const group = document.createElement('div')
      group.className = 'translation-group'
      group.innerHTML = `<div class="translation-title">${language.label} (${language.lang})</div>`
      const labelInput = createInput(
        'text',
        getTranslationFor(language.lang, `questions.${question.question_key}.label`)
      )
      labelInput.dataset.lang = language.lang
      labelInput.dataset.field = 'label'
      labelInput.title = 'Question label shown to users'
      group.appendChild(createLabeled('Label', labelInput))
      if (question.type === 'slider') {
        const legendLowInput = createInput(
          'text',
          getTranslationFor(language.lang, `questions.${question.question_key}.legend_low`)
        )
        legendLowInput.dataset.lang = language.lang
        legendLowInput.dataset.field = 'legend_low'
        const legendHighInput = createInput(
          'text',
          getTranslationFor(language.lang, `questions.${question.question_key}.legend_high`)
        )
        legendHighInput.dataset.lang = language.lang
        legendHighInput.dataset.field = 'legend_high'
        legendLowInput.title = 'Label for the lowest value'
        legendHighInput.title = 'Label for the highest value'
        group.appendChild(createLabeled('Legend low', legendLowInput))
        group.appendChild(createLabeled('Legend high', legendHighInput))
      }
      newQuestionTranslations.appendChild(group)
    })
  }

  /* ── Options in edit modal (for multi-choice questions) ──── */

  const renderEditOptions = (question) => {
    const container = questionnaireView.questionModalOptions
    container.innerHTML = ''
    if (question.type !== 'multi') return

    const options = state.options
      .filter((o) => o.question_key === question.question_key)
      .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))

    const section = document.createElement('div')
    section.className = 'options-section'
    const title = document.createElement('div')
    title.className = 'section-title'
    title.textContent = 'Options'
    section.appendChild(title)

    if (options.length > 0) {
      const table = document.createElement('table')
      table.className = 'options-table'
      const thead = document.createElement('thead')
      const headerRow = document.createElement('tr')
      headerRow.innerHTML = '<th class="col-drag"></th><th>Key</th>'
      state.languages.forEach((language) => {
        const th = document.createElement('th')
        th.textContent = `${language.label} (${language.lang})`
        headerRow.appendChild(th)
      })
      const activeTh = document.createElement('th')
      activeTh.className = 'col-toggle'
      activeTh.textContent = 'Active'
      headerRow.appendChild(activeTh)
      const actionsTh = document.createElement('th')
      actionsTh.className = 'col-action'
      headerRow.appendChild(actionsTh)
      thead.appendChild(headerRow)
      table.appendChild(thead)

      const tbody = document.createElement('tbody')
      tbody.className = 'option-list'
      options.forEach((option) => {
        const tr = document.createElement('tr')
        tr.className = 'option-row'
        tr.dataset.questionKey = question.question_key
        tr.dataset.optionKey = option.option_key

        const dragTd = document.createElement('td')
        dragTd.className = 'col-drag'
        const optionDragHandle = document.createElement('span')
        optionDragHandle.className = 'option-drag'
        optionDragHandle.title = 'Drag to reorder'
        optionDragHandle.textContent = '⠿'
        optionDragHandle.addEventListener('mousedown', () => { tr.draggable = true })
        optionDragHandle.addEventListener('mouseup', () => { tr.draggable = false })
        dragTd.appendChild(optionDragHandle)
        tr.appendChild(dragTd)

        const keyTd = document.createElement('td')
        keyTd.className = 'option-key-cell'
        keyTd.textContent = option.option_key
        keyTd.title = 'Option key (used in the API)'
        tr.appendChild(keyTd)

        const translationKey = option.translation_key || `options.${question.question_key}.${option.option_key}`
        state.languages.forEach((language) => {
          const td = document.createElement('td')
          const input = createInput('text', getTranslationFor(language.lang, translationKey))
          input.dataset.field = 'option-translation'
          input.dataset.lang = language.lang
          input.dataset.translationKey = translationKey
          input.title = `Label in ${language.label}`
          td.appendChild(input)
          tr.appendChild(td)
        })

        const activeTd = document.createElement('td')
        activeTd.className = 'col-toggle'
        const activeInput = createCheckbox(Boolean(option.is_active))
        activeInput.dataset.field = 'option-active'
        activeInput.title = 'Show this option to users'
        activeInput.dataset.questionKey = question.question_key
        activeInput.dataset.optionKey = option.option_key
        activeTd.appendChild(activeInput)
        tr.appendChild(activeTd)

        const actionTd = document.createElement('td')
        actionTd.className = 'col-action'
        const deleteBtn = document.createElement('button')
        deleteBtn.type = 'button'
        deleteBtn.className = 'icon-btn danger'
        deleteBtn.dataset.action = 'option-delete'
        deleteBtn.title = 'Delete this option'
        deleteBtn.innerHTML = icons.trash
        actionTd.appendChild(deleteBtn)
        tr.appendChild(actionTd)

        tbody.appendChild(tr)
      })
      table.appendChild(tbody)
      section.appendChild(table)
    }

    const addWrapper = document.createElement('div')
    addWrapper.className = 'option-add'
    addWrapper.dataset.questionKey = question.question_key
    const addKeyInput = createInput('text', '')
    addKeyInput.dataset.field = 'option-new-key'
    addKeyInput.placeholder = 'New option key'
    addKeyInput.title = 'Unique key for this option'
    const addButton = createButton('Add option')
    addButton.dataset.action = 'option-add'
    addWrapper.appendChild(addKeyInput)
    addWrapper.appendChild(addButton)
    section.appendChild(addWrapper)
    container.appendChild(section)
  }

  /* ── Form visibility toggles ──────────────────────────────── */

  const renderCreateFormVisibility = () => {
    const type = questionnaireView.newQuestionType.value
    questionnaireView.questionModal.querySelectorAll('.slider-only').forEach((node) => {
      node.style.display = type === 'slider' ? 'flex' : 'none'
    })
    questionnaireView.questionModal.querySelectorAll('.multi-only').forEach((node) => {
      node.style.display = type === 'multi' ? 'flex' : 'none'
    })
    questionnaireView.questionModal.querySelectorAll('.text-only').forEach((node) => {
      node.style.display = type === 'text' ? 'flex' : 'none'
    })
  }

  const renderNewQuestionTranslations = (type) => {
    newQuestionTranslations.innerHTML = ''
    state.languages.forEach((language) => {
      const group = document.createElement('div')
      group.className = 'translation-group'
      group.innerHTML = `<div class="translation-title">${language.label} (${language.lang})</div>`
      const labelInput = createInput('text', '')
      labelInput.dataset.lang = language.lang
      labelInput.dataset.field = 'label'
      group.appendChild(createLabeled('Label', labelInput))
      if (type === 'slider') {
        const legendLowInput = createInput('text', '')
        legendLowInput.dataset.lang = language.lang
        legendLowInput.dataset.field = 'legend_low'
        const legendHighInput = createInput('text', '')
        legendHighInput.dataset.lang = language.lang
        legendHighInput.dataset.field = 'legend_high'
        group.appendChild(createLabeled('Legend low', legendLowInput))
        group.appendChild(createLabeled('Legend high', legendHighInput))
      }
      newQuestionTranslations.appendChild(group)
    })
  }

  return {
    renderQuestionsList,
    renderCreateFormVisibility,
    renderNewQuestionTranslations,
    populateModalForEdit,
    populateModalForCreate,
    renderEditOptions,
  }
}

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str ?? ''
  return div.innerHTML
}
