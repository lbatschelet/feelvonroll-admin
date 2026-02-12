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
  const { saveQuestionnaireButton, newQuestionTranslations } = views.questionnaireView

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
    shell.setStatus('Options reordered', false)
  }

  /**
   * Saves all questions from state to the backend.
   * Translations are read from state.translationsByLang / state.pendingTranslationsByLang.
   */
  const saveQuestionnaire = async () => {
    const activeLanguages = state.languages
    const sorted = state.questions
      .slice()
      .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))

    const payloads = []

    for (const [index, question] of sorted.entries()) {
      const key = question.question_key
      const type = question.type
      const sort = index + 1

      const translationsByLang = {}
      for (const language of activeLanguages) {
        const label =
          state.pendingTranslationsByLang[language.lang]?.[`questions.${key}.label`] ??
          state.translationsByLang[language.lang]?.[`questions.${key}.label`] ?? ''
        translationsByLang[language.lang] = { label }
        if (type === 'slider') {
          translationsByLang[language.lang].legend_low =
            state.pendingTranslationsByLang[language.lang]?.[`questions.${key}.legend_low`] ??
            state.translationsByLang[language.lang]?.[`questions.${key}.legend_low`] ?? ''
          translationsByLang[language.lang].legend_high =
            state.pendingTranslationsByLang[language.lang]?.[`questions.${key}.legend_high`] ??
            state.translationsByLang[language.lang]?.[`questions.${key}.legend_high`] ?? ''
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

      const config = question.config || {}

      payloads.push({
        question: {
          question_key: key,
          type,
          required: Boolean(question.required),
          sort,
          is_active: Boolean(question.is_active),
          config,
        },
        translationsByLang,
      })
    }

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
      })
    } catch (error) {
      shell.setStatus(error.message, true)
      return
    }

    // Clear pending translations
    state.pendingTranslationsByLang = {}

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
