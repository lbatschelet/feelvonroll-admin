/**
 * Questionnaire data loaders and translation merging.
 * Exports: loadLanguages, loadQuestions, loadOptions, loadTranslations,
 *          computeSelectedLanguage, mergeTranslations.
 */
export function computeSelectedLanguage({ languages, selectedLanguage }) {
  const fallbackLanguage = languages[0]?.lang || 'de'
  if (!selectedLanguage || !languages.find((lang) => lang.lang === selectedLanguage)) {
    return fallbackLanguage
  }
  return selectedLanguage
}

export function mergeTranslations({ questionTranslationsByLang, optionTranslations, selectedLanguage }) {
  return {
    ...(questionTranslationsByLang[selectedLanguage] || {}),
    ...optionTranslations,
  }
}

export function createQuestionnaireData({ state, api }) {
  const loadLanguages = async () => {
    const languages = await api.fetchLanguages({ token: state.token })
    state.languages = languages
    state.selectedLanguage = computeSelectedLanguage({
      languages,
      selectedLanguage: state.selectedLanguage,
    })
    return languages
  }

  const loadQuestions = async () => {
    state.questions = await api.fetchQuestions({ token: state.token })
    return state.questions
  }

  const loadOptions = async () => {
    state.options = await api.fetchOptions({ token: state.token })
    return state.options
  }

  const loadTranslations = async () => {
    const allByLang = {}
    await Promise.all(
      state.languages.map(async (language) => {
        const [questionTranslations, optionTranslations] = await Promise.all([
          api.fetchTranslations({ lang: language.lang, prefix: 'questions.' }),
          api.fetchTranslations({ lang: language.lang, prefix: 'options.' }),
        ])
        allByLang[language.lang] = { ...questionTranslations, ...optionTranslations }
      })
    )
    state.translationsByLang = allByLang
    state.translations = allByLang[state.selectedLanguage] || {}
    return state.translations
  }

  return { loadLanguages, loadQuestions, loadOptions, loadTranslations }
}
