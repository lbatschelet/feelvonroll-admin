/**
 * Questionnaire actions for saving, adding, and translation handling.
 * Exports: createQuestionnaireActions, buildQuestionConfig, buildNewQuestion.
 */
import { validateQuestionTranslations } from '../services/questionnaireService'
import { runWithButtonFeedback } from '../utils/buttonFeedback'
import { getActiveLanguages } from '../services/languagesService'

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
    config.allow_multiple = Boolean(values.allow_multiple)
  }
  return config
}

export function buildNewQuestion({ key, type, required, isActive, sort, config, existingQuestions }) {
  const base = {
    question_key: key,
    type,
    required,
    sort: Number(sort || 0),
    is_active: isActive,
    config,
  }
  if (!base.sort) {
    const maxSort = Math.max(0, ...existingQuestions.map((question) => Number(question.sort || 0)))
    base.sort = maxSort + 10
  }
  return base
}

export function createQuestionnaireActions({ state, views, api, shell, data, render, renderDashboard }) {
  const { questionsBody, saveQuestionnaireButton, newQuestionTranslations } = views.questionnaireView

  const saveOption = async ({ question_key, option_key, sort, is_active, translation_key, label }) => {
    await api.upsertOption({
      token: state.token,
      question_key,
      option_key,
      sort,
      is_active,
      translation_key,
    })
    if (label !== undefined) {
      await saveTranslations({ [translation_key]: label })
    }
    await data.loadOptions()
    await data.loadTranslations()
    render.renderQuestionsList()
    shell.setStatus('Option gespeichert', false)
  }

  const saveTranslations = async (translations) => {
    const entries = Object.entries(translations)
    if (!entries.length) return
    for (const [translationKey, text] of entries) {
      await api.upsertTranslation({
        token: state.token,
        translation_key: translationKey,
        lang: state.selectedLanguage,
        text,
      })
    }
    await data.loadTranslations()
  }

  const saveQuestionnaire = async () => {
    const activeLanguages = getActiveLanguages(state.languages)
    const blocks = Array.from(questionsBody.querySelectorAll('.question-block'))
    const payloads = []

    for (const block of blocks) {
      const key = block.dataset.key
      const type = block.dataset.type
      const required = block.querySelector('[data-field="required"]')?.checked || false
      const isActive = block.querySelector('[data-field="is_active"]')?.checked || false
      const sort = Number(block.querySelector('[data-field="sort"]')?.value || 0)
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
        shell.setStatus(`${validation.message} für ${key}`, true)
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
          allow_multiple: block.querySelector('[data-field="allow_multiple"]')?.checked,
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

    await data.loadQuestions()
    await data.loadTranslations()
    render.renderQuestionsList()
    renderDashboard()
  }

  const collectNewQuestionTranslations = (type) => {
    const activeLanguages = getActiveLanguages(state.languages)
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

  const addQuestion = ({
    key,
    type,
    required,
    isActive,
    sort,
    configValues,
  }) => {
    const translationsByLang = collectNewQuestionTranslations(type)
    if (!translationsByLang) return false

    const config = buildQuestionConfig({ type, values: configValues })
    const base = buildNewQuestion({
      key,
      type,
      required,
      isActive,
      sort,
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
      newQuestionSort,
      newQuestionMin,
      newQuestionMax,
      newQuestionStep,
      newQuestionDefault,
      newQuestionUseForColor,
      newQuestionAllowMultiple,
      newQuestionRows,
      newQuestionType,
    } = views.questionnaireView
    newQuestionKey.value = ''
    newQuestionRequired.checked = false
    newQuestionActive.checked = true
    newQuestionSort.value = '50'
    newQuestionMin.value = '0'
    newQuestionMax.value = '1'
    newQuestionStep.value = '0.01'
    newQuestionDefault.value = '0.5'
    newQuestionUseForColor.checked = false
    newQuestionAllowMultiple.checked = false
    newQuestionRows.value = '3'
    render.renderNewQuestionTranslations(newQuestionType.value)
  }

  return {
    saveOption,
    saveTranslations,
    saveQuestionnaire,
    addQuestion,
    resetNewQuestionForm,
  }
}
