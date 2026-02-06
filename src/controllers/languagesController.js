/**
 * Languages controller for language management page.
 * Exports: createLanguagesController.
 */
import { createQuestionnaireData } from './questionnaireData'
import { createLanguagesRender } from './languagesRender'

export function createLanguagesController({ state, views, api, shell, onLanguagesChanged }) {
  const data = createQuestionnaireData({ state, api })
  const render = createLanguagesRender({ state, views })

  const loadLanguages = async () => {
    shell.setStatus('Lade Sprachen...', false)
    try {
      await data.loadLanguages()
      render.renderLanguageSelectors()
      render.renderLanguagesTable()
      shell.setStatus('Sprachen geladen', false)
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  const handleAddLanguage = async () => {
    const lang = views.languagesView.languageCode.value.trim()
    const label = views.languagesView.languageLabel.value.trim()
    if (!lang || !label) {
      shell.setStatus('Code und Label fehlen', true)
      return
    }
    try {
      await api.upsertLanguage({ token: state.token, lang, label })
      views.languagesView.languageCode.value = ''
      views.languagesView.languageLabel.value = ''
      await data.loadLanguages()
      render.renderLanguageSelectors()
      render.renderLanguagesTable()
      await onLanguagesChanged()
      shell.setStatus('Sprache gespeichert', false)
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  const handleLanguageToggle = async (input) => {
    const lang = input.dataset.lang
    try {
      await api.toggleLanguage({ token: state.token, lang, enabled: input.checked })
      await data.loadLanguages()
      render.renderLanguageSelectors()
      render.renderLanguagesTable()
      await onLanguagesChanged()
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  const handleLanguageDelete = async (button) => {
    const lang = button.dataset.lang
    const confirmed = window.confirm(`Sprache "${lang}" löschen?`)
    if (!confirmed) return
    try {
      await api.deleteLanguage({ token: state.token, lang })
      await data.loadLanguages()
      render.renderLanguageSelectors()
      render.renderLanguagesTable()
      await onLanguagesChanged()
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  const bindEvents = () => {
    views.languagesView.addLanguageButton.addEventListener('click', () => handleAddLanguage())
    views.languagesView.languagesBody.addEventListener('change', (event) => {
      const target = event.target
      if (target?.dataset?.action === 'lang-toggle') {
        handleLanguageToggle(target)
      }
    })
    views.languagesView.languagesBody.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]')
      if (!button) return
      if (button.dataset.action === 'lang-delete') {
        handleLanguageDelete(button)
      }
    })
  }

  return { bindEvents, loadLanguages }
}
