/**
 * Questionnaire actions for saving, adding, and translation handling.
 * Exports: createQuestionnaireActions, buildQuestionConfig, buildNewQuestion.
 */
import { validateQuestionTranslations } from '../services/questionnaireService'
import { runWithButtonFeedback } from '../utils/buttonFeedback'

export function buildQuestionConfig({ type, values }) {
  const config = {}
  if (type === 'slider') {
    config.min = Number(values.min ?? 0)
    config.max = Number(values.max ?? 1)
    config.step = Number(values.step ?? 0.01)
    config.default = Number(values.default ?? 0.5)
    config.use_for_color = Boolean(values.use_for_color)
  }
  if (type === 'text') {
    config.rows = Number(values.rows ?? 3)
  }
  if (type === 'multi') {
    config.allow_multiple = !values.single_choice
  }
  return config
}

export function buildNewQuestion({ key, type, required, isActive, config, existingQuestions }) {
  const base = {
    question_key: key,
    type,
    required,
    sort: 0,
    is_active: isActive,
    config,
  }
  const maxSort = Math.max(0, ...existingQuestions.map((question) => Number(question.sort || 0)))
  base.sort = maxSort + 1
  return base
}

export function createQuestionnaireActions({ state, views, api, shell, data, render, renderDashboard }) {
  const { questionsBody, saveQuestionnaireButton, newQuestionTranslations } = views.questionnaireView

  const saveOptionOrder = async (questionKey, optionKeys) => {
    const updates = optionKeys.map((option_key, index) => {
      const option = state.options.find(
        (item) => item.question_key === questionKey && item.option_key === option_key
      )
      return {
        question_key: questionKey,
        option_key,
        sort: index + 1,
        is_active: option ? Boolean(option.is_active) : true,
        translation_key: option?.translation_key || `options.${questionKey}.${option_key}`,
      }
    })
    for (const entry of updates) {
      await api.upsertOption({ token: state.token, ...entry })
    }
    state.options = state.options.map((option) => {
      if (option.question_key !== questionKey) return option
      const index = optionKeys.indexOf(option.option_key)
      if (index === -1) return option
      return { ...option, sort: index + 1 }
    })
    render.renderQuestionsList()
    shell.setStatus('Options reordered', false)
  }

  const saveQuestionnaire = async () => {
    const activeLanguages = state.languages
    const blocks = Array.from(questionsBody.querySelectorAll('.question-block'))
    const payloads = []

    for (const [index, block] of blocks.entries()) {
      const key = block.dataset.key
      const type = block.dataset.type
      const required = block.querySelector('[data-field="required"]')?.checked || false
      const isActive = block.querySelector('[data-field="is_active"]')?.checked || false
      const sort = index + 1
      const translationsByLang = {}

      for (const language of activeLanguages) {
        const label = block.querySelector(
          `input[data-field="label"][data-lang="${language.lang}"]`
        )?.value.trim()
        translationsByLang[language.lang] = { label }
        if (type === 'slider') {
          const legendLow = block.querySelector(
            `input[data-field="legend_low"][data-lang="${language.lang}"]`
          )?.value.trim()
          const legendHigh = block.querySelector(
            `input[data-field="legend_high"][data-lang="${language.lang}"]`
          )?.value.trim()
          translationsByLang[language.lang].legend_low = legendLow
          translationsByLang[language.lang].legend_high = legendHigh
        }
      }

      const validation = validateQuestionTranslations({
        type,
        languages: activeLanguages,
        valuesByLang: translationsByLang,
      })
      if (!validation.ok) {
        shell.setStatus(`${validation.message} for ${key}`, true)
        return
      }

      const config = buildQuestionConfig({
        type,
        values: {
          min: block.querySelector('[data-field="min"]')?.value,
          max: block.querySelector('[data-field="max"]')?.value,
          step: block.querySelector('[data-field="step"]')?.value,
          default: block.querySelector('[data-field="default"]')?.value,
          use_for_color: block.querySelector('[data-field="use_for_color"]')?.checked,
          rows: block.querySelector('[data-field="rows"]')?.value,
          single_choice: block.querySelector('[data-field="single_choice"]')?.checked,
        },
      })

      payloads.push({
        question: {
          question_key: key,
          type,
          required,
          sort,
          is_active: isActive,
          config,
        },
        translationsByLang,
      })
    }

    // Collect option translations from the table
    const optionTranslations = []
    const optionInputs = questionsBody.querySelectorAll('input[data-field="option-translation"]')
    optionInputs.forEach((input) => {
      const lang = input.dataset.lang
      const translationKey = input.dataset.translationKey
      const text = input.value.trim()
      if (translationKey && lang) {
        optionTranslations.push({ lang, translation_key: translationKey, text })
      }
    })

    try {
      await runWithButtonFeedback(saveQuestionnaireButton, async () => {
        for (const payload of payloads) {
          await api.upsertQuestion({ token: state.token, question: payload.question })
          for (const [lang, translations] of Object.entries(payload.translationsByLang)) {
            await api.upsertTranslation({
              token: state.token,
              translation_key: `questions.${payload.question.question_key}.label`,
              lang,
              text: translations.label,
            })
            if (payload.question.type === 'slider') {
              await api.upsertTranslation({
                token: state.token,
                translation_key: `questions.${payload.question.question_key}.legend_low`,
                lang,
                text: translations.legend_low || '',
              })
              await api.upsertTranslation({
                token: state.token,
                translation_key: `questions.${payload.question.question_key}.legend_high`,
                lang,
                text: translations.legend_high || '',
              })
            }
          }
        }
        for (const entry of optionTranslations) {
          await api.upsertTranslation({
            token: state.token,
            translation_key: entry.translation_key,
            lang: entry.lang,
            text: entry.text,
          })
        }
      })
    } catch (error) {
      shell.setStatus(error.message, true)
      return
    }

    await data.loadQuestions()
    await data.loadTranslations()
    render.renderQuestionsList()
    renderDashboard()
  }

  const collectNewQuestionTranslations = (type) => {
    const activeLanguages = state.languages
    const translationsByLang = {}
    for (const language of activeLanguages) {
      const labelInput = newQuestionTranslations.querySelector(
        `input[data-lang="${language.lang}"][data-field="label"]`
      )
      const label = labelInput?.value.trim() || ''
      translationsByLang[language.lang] = { label }
      if (type === 'slider') {
        const legendLowInput = newQuestionTranslations.querySelector(
          `input[data-lang="${language.lang}"][data-field="legend_low"]`
        )
        const legendHighInput = newQuestionTranslations.querySelector(
          `input[data-lang="${language.lang}"][data-field="legend_high"]`
        )
        const legendLow = legendLowInput?.value.trim() || ''
        const legendHigh = legendHighInput?.value.trim() || ''
        translationsByLang[language.lang].legend_low = legendLow
        translationsByLang[language.lang].legend_high = legendHigh
      }
    }
    const validation = validateQuestionTranslations({
      type,
      languages: activeLanguages,
      valuesByLang: translationsByLang,
    })
    if (!validation.ok) {
      shell.setStatus(validation.message, true)
      return null
    }
    return translationsByLang
  }

  const applyPendingTranslations = (questionKey, translationsByLang) => {
    Object.entries(translationsByLang).forEach(([lang, entries]) => {
      if (!state.pendingTranslationsByLang[lang]) {
        state.pendingTranslationsByLang[lang] = {}
      }
      state.pendingTranslationsByLang[lang][`questions.${questionKey}.label`] = entries.label
      if (entries.legend_low) {
        state.pendingTranslationsByLang[lang][`questions.${questionKey}.legend_low`] = entries.legend_low
      }
      if (entries.legend_high) {
        state.pendingTranslationsByLang[lang][`questions.${questionKey}.legend_high`] = entries.legend_high
      }
    })
  }

  const addQuestion = ({ key, type, required, isActive, configValues }) => {
    const translationsByLang = collectNewQuestionTranslations(type)
    if (!translationsByLang) return false

    const config = buildQuestionConfig({ type, values: configValues })
    const base = buildNewQuestion({
      key,
      type,
      required,
      isActive,
      config,
      existingQuestions: state.questions,
    })

    state.questions.push(base)
    applyPendingTranslations(key, translationsByLang)
    return true
  }

  const resetNewQuestionForm = () => {
    const {
      newQuestionKey,
      newQuestionRequired,
      newQuestionActive,
      newQuestionMin,
      newQuestionMax,
      newQuestionStep,
      newQuestionDefault,
      newQuestionUseForColor,
      newQuestionSingleChoice,
      newQuestionRows,
      newQuestionType,
    } = views.questionnaireView
    newQuestionKey.value = ''
    newQuestionRequired.checked = false
    newQuestionActive.checked = true
    newQuestionMin.value = '0'
    newQuestionMax.value = '1'
    newQuestionStep.value = '0.01'
    newQuestionDefault.value = '0.5'
    newQuestionUseForColor.checked = false
    newQuestionSingleChoice.checked = true
    newQuestionRows.value = '3'
    render.renderNewQuestionTranslations(newQuestionType.value)
  }

  return {
    saveOptionOrder,
    saveQuestionnaire,
    addQuestion,
    resetNewQuestionForm,
  }
}
