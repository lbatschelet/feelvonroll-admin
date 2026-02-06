/**
 * Questionnaire render helpers for language and question UI.
 * Exports: createQuestionnaireRender.
 */
import { createButton, createCheckbox, createInput, createLabeled } from '../utils/dom'
import { getActiveLanguages } from '../services/languagesService'

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
      empty.textContent = 'Keine Fragen vorhanden'
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
        wrapper.draggable = true

        const header = document.createElement('summary')
        header.className = 'question-header'
        const labelKey = `questions.${question.question_key}.label`
        const label = getTranslationFor(state.selectedLanguage, labelKey) || question.question_key
        header.innerHTML = `
          <div class="question-header-main">
            <div class="drag-handle" title="Ziehen zum Sortieren">⠿</div>
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
        requiredLabel.appendChild(document.createTextNode('Pflichtfeld'))
        const activeLabel = document.createElement('label')
        activeLabel.className = 'checkbox-inline'
        activeLabel.appendChild(activeToggle)
        activeLabel.appendChild(document.createTextNode('Aktiv'))
        toggles.appendChild(requiredLabel)
        toggles.appendChild(activeLabel)
        controls.appendChild(toggles)
        body.appendChild(controls)

        if (question.type === 'slider') {
          const sliderConfig = question.config || {}
          const sliderRow = document.createElement('div')
          sliderRow.className = 'question-row slider-only'
          const minInput = createInput('number', sliderConfig.min ?? 0)
          minInput.dataset.field = 'min'
          const maxInput = createInput('number', sliderConfig.max ?? 1)
          maxInput.dataset.field = 'max'
          const stepInput = createInput('number', sliderConfig.step ?? 0.01)
          stepInput.dataset.field = 'step'
          const defaultInput = createInput('number', sliderConfig.default ?? 0.5)
          defaultInput.dataset.field = 'default'
          const colorToggle = createCheckbox(Boolean(sliderConfig.use_for_color))
          colorToggle.dataset.field = 'use_for_color'
          sliderRow.appendChild(createLabeled('Min', minInput))
          sliderRow.appendChild(createLabeled('Max', maxInput))
          sliderRow.appendChild(createLabeled('Step', stepInput))
          sliderRow.appendChild(createLabeled('Default', defaultInput))
          sliderRow.appendChild(createLabeled('Pin-Farbe', colorToggle))
          body.appendChild(sliderRow)
        }

        if (question.type === 'multi') {
          const multiRow = document.createElement('div')
          multiRow.className = 'question-row multi-only'
          const allowMultiple = createCheckbox(Boolean(question.config?.allow_multiple))
          allowMultiple.dataset.field = 'allow_multiple'
          multiRow.appendChild(createLabeled('Mehrfach', allowMultiple))
          body.appendChild(multiRow)
        }

        if (question.type === 'text') {
          const textRow = document.createElement('div')
          textRow.className = 'question-row text-only'
          const rowsInput = createInput('number', question.config?.rows ?? 3)
          rowsInput.dataset.field = 'rows'
          textRow.appendChild(createLabeled('Rows', rowsInput))
          body.appendChild(textRow)
        }

        const translationsWrapper = document.createElement('div')
        translationsWrapper.className = 'translations-row'
        getActiveLanguages(state.languages).forEach((language) => {
          const group = document.createElement('div')
          group.className = 'translation-group'
          group.innerHTML = `<div class="translation-title">${language.label} (${language.lang})</div>`
          const labelInput = createInput(
            'text',
            getTranslationFor(language.lang, `questions.${question.question_key}.label`)
          )
          labelInput.dataset.lang = language.lang
          labelInput.dataset.field = 'label'
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
            group.appendChild(createLabeled('Legend low', legendLowInput))
            group.appendChild(createLabeled('Legend high', legendHighInput))
          }
          translationsWrapper.appendChild(group)
        })
        body.appendChild(translationsWrapper)

        if (question.type === 'multi') {
          const optionsWrapper = document.createElement('div')
          optionsWrapper.className = 'options-row'
          const optionList = document.createElement('div')
          optionList.className = 'option-list'
          const options = state.options
            .filter((option) => option.question_key === question.question_key)
            .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
          options.forEach((option) => {
            const row = document.createElement('div')
            row.className = 'option-row'
            row.dataset.questionKey = question.question_key
            row.dataset.optionKey = option.option_key
            row.draggable = true
            const dragHandle = document.createElement('div')
            dragHandle.className = 'option-drag'
            dragHandle.title = 'Ziehen zum Sortieren'
            const optionKeyInput = createInput('text', option.option_key, true)
            const optionSortInput = createInput('number', option.sort ?? 0)
            optionSortInput.dataset.field = 'option-sort'
            optionSortInput.style.display = 'none'
            const optionActiveInput = createCheckbox(Boolean(option.is_active))
            optionActiveInput.dataset.field = 'option-active'
            const optionLabelInput = createInput('text', getTranslation(option.translation_key || ''))
            optionLabelInput.dataset.field = 'option-label'
            row.appendChild(dragHandle)
            row.appendChild(createLabeled('Key', optionKeyInput))
            row.appendChild(createLabeled('Aktiv', optionActiveInput))
            row.appendChild(createLabeled('Label', optionLabelInput))

            const saveOptionButton = createButton('Speichern')
            saveOptionButton.dataset.action = 'option-save'
            const deleteOptionButton = createButton('Löschen', 'danger')
            deleteOptionButton.dataset.action = 'option-delete'
            row.appendChild(saveOptionButton)
            row.appendChild(deleteOptionButton)
            optionList.appendChild(row)
          })
          optionsWrapper.appendChild(optionList)
          body.appendChild(optionsWrapper)

          const addWrapper = document.createElement('div')
          addWrapper.className = 'option-add'
          addWrapper.dataset.questionKey = question.question_key
          const addKeyInput = createInput('text', '')
          addKeyInput.dataset.field = 'option-new-key'
          const addSortInput = createInput('number', '0')
          addSortInput.dataset.field = 'option-new-sort'
          addSortInput.style.display = 'none'
          const addLabelInput = createInput('text', '')
          addLabelInput.dataset.field = 'option-new-label'
          const addButton = createButton('Option hinzufügen')
          addButton.dataset.action = 'option-add'
          addWrapper.appendChild(createLabeled('Key', addKeyInput))
          addWrapper.appendChild(createLabeled('Label', addLabelInput))
          addWrapper.appendChild(addButton)
          body.appendChild(addWrapper)
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
    getActiveLanguages(state.languages).forEach((language) => {
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
