/**
 * Questionnaire actions for saving, adding, and translation handling.
 * Exports: createQuestionnaireActions, buildQuestionConfig, buildNewQuestion.
 */
import { validateQuestionTranslations } from '../services/questionnaireService'


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
  const { newQuestionTranslations } = views.questionnaireView

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
   * Saves a single question + translations to the backend.
   */
  const saveSingleQuestion = async (question, translationsByLang) => {
    await api.upsertQuestion({ token: state.token, question })
    for (const [lang, translations] of Object.entries(translationsByLang)) {
      await api.upsertTranslation({
        token: state.token,
        translation_key: `questions.${question.question_key}.label`,
        lang,
        text: translations.label,
      })
      if (question.type === 'slider') {
        await api.upsertTranslation({
          token: state.token,
          translation_key: `questions.${question.question_key}.legend_low`,
          lang,
          text: translations.legend_low || '',
        })
        await api.upsertTranslation({
          token: state.token,
          translation_key: `questions.${question.question_key}.legend_high`,
          lang,
          text: translations.legend_high || '',
        })
      }
    }
  }

  /**
   * Deletes a question from the backend.
   */
  const deleteQuestion = async (questionKey) => {
    await api.deleteQuestion({ token: state.token, question_key: questionKey })
  }

  /**
   * Reload data from server and re-render.
   */
  const reloadAndRender = async () => {
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
    saveSingleQuestion,
    deleteQuestion,
    reloadAndRender,
    collectNewQuestionTranslations,
    resetNewQuestionForm,
  }
}
