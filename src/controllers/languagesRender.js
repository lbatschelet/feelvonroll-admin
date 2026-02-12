/**
 * Languages render helpers for language selectors and table.
 * Exports: createLanguagesRender.
 */
import { actionCell } from '../utils/adminTable'

export function createLanguagesRender({ state, views }) {
  const { languageSelect } = views.questionnaireView
  const { languagesBody } = views.languagesView

  const renderLanguageSelectors = () => {
    languageSelect.innerHTML = ''
    // Admin shows ALL languages (including inactive) so translators can work on them.
    state.languages.forEach((language) => {
      const option = document.createElement('option')
      option.value = language.lang
      const inactive = Number(language.enabled) !== 1
      option.textContent = `${language.label} (${language.lang})${inactive ? ' — inactive' : ''}`
      languageSelect.appendChild(option)
    })
    if (!state.languages.find((language) => language.lang === state.selectedLanguage)) {
      state.selectedLanguage = state.languages[0]?.lang || state.selectedLanguage
    }
    languageSelect.value = state.selectedLanguage
  }

  const renderLanguagesTable = () => {
    languagesBody.innerHTML = ''
    if (!state.languages.length) {
      languagesBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#94a3b8;">No languages found</td></tr>'
      return
    }

    state.languages.forEach((language) => {
      const row = document.createElement('tr')
      row.innerHTML = `
        <td><code>${language.lang}</code></td>
        <td>${language.label}</td>
        <td>
          <input type="checkbox" data-action="lang-toggle" data-lang="${language.lang}" title="Enable this language" ${
            Number(language.enabled) === 1 ? 'checked' : ''
          } />
        </td>
        ${actionCell([
          { type: 'edit', id: language.lang, title: 'Edit language' },
          { type: 'delete', id: language.lang, title: 'Delete language' },
        ])}
      `
      languagesBody.appendChild(row)
    })
  }

  return { renderLanguageSelectors, renderLanguagesTable }
}
