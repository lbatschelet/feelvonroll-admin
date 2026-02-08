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
    shell.setStatus('Loading languages...', false)
    try {
      await data.loadLanguages()
      render.renderLanguageSelectors()
      render.renderLanguagesTable()
      shell.setStatus('Languages loaded', false)
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  const handleAddLanguage = async () => {
    const lang = views.languagesView.languageCode.value.trim()
    const label = views.languagesView.languageLabel.value.trim()
    if (!lang || !label) {
      shell.setStatus('Code and label are required', true)
      return
    }
    try {
      // New languages are added as inactive by default.
      await api.upsertLanguage({ token: state.token, lang, label, enabled: false })
      views.languagesView.languageCode.value = ''
      views.languagesView.languageLabel.value = ''
      await data.loadLanguages()
      render.renderLanguageSelectors()
      render.renderLanguagesTable()
      await onLanguagesChanged()

      // Verify the server actually stored it as inactive.
      const created = state.languages.find((l) => l.lang === lang)
      if (created && Number(created.enabled) === 1) {
        shell.setStatus(
          `Warning: "${lang}" was added but the API activated it anyway.`,
          true,
        )
      } else {
        shell.setStatus(
          `Language "${lang}" added (inactive). Translate all content before activating.`,
          false,
        )
      }
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  /**
   * Builds a human-readable summary of missing translations.
   */
  const formatMissing = (missing) => {
    const lines = []

    if (missing.translations?.length) {
      lines.push(`Missing translations (${missing.translations.length}):`)
      missing.translations.forEach((key) => {
        // Make the key more readable: questions.wellbeing.label → Questionnaire: wellbeing → label
        const nice = key
          .replace(/^questions\./, 'Question: ')
          .replace(/^options\./, 'Option: ')
        lines.push(`  • ${nice}`)
      })
    }

    if (missing.content_pages?.length) {
      lines.push(`Missing content pages (${missing.content_pages.length}):`)
      missing.content_pages.forEach((key) => {
        lines.push(`  • ${key}`)
      })
    }

    return lines.join('\n')
  }

  const handleLanguageToggle = async (input) => {
    const lang = input.dataset.lang
    const enabling = input.checked

    try {
      const result = await api.toggleLanguage({ token: state.token, lang, enabled: enabling })

      // If the API reports incomplete translations, show details and ask to force.
      if (result.incomplete) {
        const summary = formatMissing(result.missing)
        const forceEnable = window.confirm(
          `Language "${lang}" has incomplete translations:\n\n${summary}\n\nActivate anyway?`
        )

        if (forceEnable) {
          await api.toggleLanguage({ token: state.token, lang, enabled: true, force: true })
        } else {
          // Revert the checkbox visually.
          input.checked = false
          shell.setStatus('Activation cancelled -- translations are incomplete.', true)
          return
        }
      }

      await data.loadLanguages()
      render.renderLanguageSelectors()
      render.renderLanguagesTable()
      await onLanguagesChanged()

      // Verify the server state matches what we requested.
      const updated = state.languages.find((l) => l.lang === lang)
      if (updated && (Number(updated.enabled) === 1) !== enabling) {
        shell.setStatus(
          `Warning: toggle for "${lang}" did not persist.`,
          true,
        )
      }
    } catch (error) {
      input.checked = !enabling
      shell.setStatus(error.message, true)
    }
  }

  const handleLanguageDelete = async (button) => {
    const lang = button.dataset.lang
    const confirmed = window.confirm(`Delete language "${lang}"?`)
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
