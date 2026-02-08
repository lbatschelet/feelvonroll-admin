/**
 * Questionnaire render helpers for language and question UI.
 * Exports: createQuestionnaireRender.
 */
import { createButton, createCheckbox, createInput, createLabeled, icons } from '../utils/dom'

export function createQuestionnaireRender({ state, views }) {
  const questionnaireView = views.questionnaireView
  const { questionsBody, newQuestionTranslations } = questionnaireView

  const getTranslation = (key) => state.translations[key] || ''

  const getTranslationFor = (lang, key) =>
    state.translationsByLang[lang]?.[key] || state.pendingTranslationsByLang[lang]?.[key] || ''

  const renderQuestionsList = () => {
    questionsBody.innerHTML = ''
    if (!state.questions.length) {
      const empty = document.createElement('div')
      empty.className = 'empty'
      empty.textContent = 'No questions found'
      questionsBody.appendChild(empty)
      return
    }

    state.questions
      .slice()
      .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
      .forEach((question, index) => {
        const wrapper = document.createElement('details')
        wrapper.className = 'question-block'
        wrapper.dataset.key = question.question_key
        wrapper.dataset.type = question.type
        wrapper.open = false

        const header = document.createElement('summary')
        header.className = 'question-header'
        const labelKey = `questions.${question.question_key}.label`
        const label = getTranslationFor(state.selectedLanguage, labelKey) || question.question_key
        header.innerHTML = `
          <div class="question-header-main">
            <div class="drag-handle" title="Drag to reorder">⠿</div>
            <div class="question-title">
              <span class="question-index">${index + 1}.</span>
              <span class="question-label">${label}</span>
              <span class="muted">(${question.question_key})</span>
            </div>
          </div>
          <div class="question-header-meta">
            <span class="question-type">${question.type}</span>
            <span class="question-header-chevron">▾</span>
          </div>
        `
        wrapper.appendChild(header)

        const body = document.createElement('div')
        body.className = 'question-body'

        const controls = document.createElement('div')
        controls.className = 'question-controls'
        const toggles = document.createElement('div')
        toggles.className = 'question-toggles'
        const requiredToggle = createCheckbox(Boolean(question.required))
        requiredToggle.dataset.field = 'required'
        const activeToggle = createCheckbox(Boolean(question.is_active))
        activeToggle.dataset.field = 'is_active'
        const requiredLabel = document.createElement('label')
        requiredLabel.className = 'checkbox-inline'
        requiredLabel.appendChild(requiredToggle)
        requiredLabel.appendChild(document.createTextNode('Required'))
        requiredToggle.title = 'Must be answered before submitting'
        const activeLabel = document.createElement('label')
        activeLabel.className = 'checkbox-inline'
        activeLabel.appendChild(activeToggle)
        activeLabel.appendChild(document.createTextNode('Active'))
        activeToggle.title = 'Visible to end users'
        toggles.appendChild(requiredLabel)
        toggles.appendChild(activeLabel)
        if (question.type === 'slider') {
          const colorToggle = createCheckbox(Boolean(question.config?.use_for_color))
          colorToggle.dataset.field = 'use_for_color'
          colorToggle.title = 'Use this slider to color pins on the map'
          const colorLabel = document.createElement('label')
          colorLabel.className = 'checkbox-inline'
          colorLabel.appendChild(colorToggle)
          colorLabel.appendChild(document.createTextNode('Pin color'))
          toggles.appendChild(colorLabel)
        }
        if (question.type === 'multi') {
          const singleChoiceToggle = createCheckbox(!question.config?.allow_multiple)
          singleChoiceToggle.dataset.field = 'single_choice'
          singleChoiceToggle.title = 'Checked: only one option can be selected. Unchecked: multiple options can be selected.'
          const singleChoiceLabel = document.createElement('label')
          singleChoiceLabel.className = 'checkbox-inline'
          singleChoiceLabel.appendChild(singleChoiceToggle)
          singleChoiceLabel.appendChild(document.createTextNode('Single choice'))
          toggles.appendChild(singleChoiceLabel)
        }
        controls.appendChild(toggles)
        body.appendChild(controls)

        if (question.type === 'slider') {
          const sliderConfig = question.config || {}
          const sliderRow = document.createElement('div')
          sliderRow.className = 'question-row slider-only'
          const minInput = createInput('number', sliderConfig.min ?? 0)
          minInput.dataset.field = 'min'
          minInput.title = 'Lowest possible value'
          const maxInput = createInput('number', sliderConfig.max ?? 1)
          maxInput.dataset.field = 'max'
          maxInput.title = 'Highest possible value'
          const stepInput = createInput('number', sliderConfig.step ?? 0.01)
          stepInput.dataset.field = 'step'
          stepInput.title = 'Step size between values'
          const defaultInput = createInput('number', sliderConfig.default ?? 0.5)
          defaultInput.dataset.field = 'default'
          defaultInput.title = 'Default value shown to users'
          sliderRow.appendChild(createLabeled('Min', minInput))
          sliderRow.appendChild(createLabeled('Max', maxInput))
          sliderRow.appendChild(createLabeled('Step', stepInput))
          sliderRow.appendChild(createLabeled('Default', defaultInput))
          body.appendChild(sliderRow)
        }

        if (question.type === 'text') {
          const textRow = document.createElement('div')
          textRow.className = 'question-row text-only'
          const rowsInput = createInput('number', question.config?.rows ?? 3)
          rowsInput.dataset.field = 'rows'
          rowsInput.title = 'Height of the text field'
          textRow.appendChild(createLabeled('Rows', rowsInput))
          body.appendChild(textRow)
        }

        const translationsWrapper = document.createElement('div')
        translationsWrapper.className = 'translations-row'
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
          translationsWrapper.appendChild(group)
        })
        body.appendChild(translationsWrapper)

        if (question.type === 'multi') {
          const activeLanguages = state.languages
          const options = state.options
            .filter((option) => option.question_key === question.question_key)
            .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))

          const optionsWrapper = document.createElement('div')
          optionsWrapper.className = 'options-section'
          const optionsTitle = document.createElement('div')
          optionsTitle.className = 'section-title'
          optionsTitle.textContent = 'Options'
          optionsWrapper.appendChild(optionsTitle)

          if (options.length > 0) {
            const table = document.createElement('table')
            table.className = 'options-table'
            const thead = document.createElement('thead')
            const headerRow = document.createElement('tr')
            headerRow.innerHTML = '<th class="col-drag"></th><th>Key</th>'
            activeLanguages.forEach((language) => {
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
              activeLanguages.forEach((language) => {
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
            optionsWrapper.appendChild(table)
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
          optionsWrapper.appendChild(addWrapper)
          body.appendChild(optionsWrapper)
        }

        // Enable draggable only when the drag handle is grabbed
        const dragHandle = header.querySelector('.drag-handle')
        if (dragHandle) {
          dragHandle.addEventListener('mousedown', () => { wrapper.draggable = true })
          dragHandle.addEventListener('mouseup', () => { wrapper.draggable = false })
        }

        wrapper.appendChild(body)
        questionsBody.appendChild(wrapper)
      })
  }

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
    renderNewQuestionTranslations(type)
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
  }
}
