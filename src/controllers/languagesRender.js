/**
 * Languages render helpers for language selectors and table.
 * Exports: createLanguagesRender.
 */
import { getActiveLanguages } from '../services/languagesService'

export function createLanguagesRender({ state, views }) {
  const { languageSelect } = views.questionnaireView
  const { languagesBody } = views.languagesView

  const renderLanguageSelectors = () => {
    languageSelect.innerHTML = ''
    const active = getActiveLanguages(state.languages)
    active.forEach((language) => {
      const option = document.createElement('option')
      option.value = language.lang
      option.textContent = `${language.label} (${language.lang})`
      languageSelect.appendChild(option)
    })
    if (!active.find((language) => language.lang === state.selectedLanguage)) {
      state.selectedLanguage = active[0]?.lang || state.selectedLanguage
    }
    languageSelect.value = state.selectedLanguage
  }

  const renderLanguagesTable = () => {
    languagesBody.innerHTML = ''
    if (!state.languages.length) {
      const row = document.createElement('tr')
      row.innerHTML = `<td colspan="4" class="empty">Keine Sprachen vorhanden</td>`
      languagesBody.appendChild(row)
      return
    }

    state.languages.forEach((language) => {
      const row = document.createElement('tr')
      row.innerHTML = `
        <td>${language.lang}</td>
        <td>${language.label}</td>
        <td>
          <input type="checkbox" data-action="lang-toggle" data-lang="${language.lang}" ${
            language.enabled ? 'checked' : ''
          } />
        </td>
        <td>
          <button class="ghost" data-action="lang-delete" data-lang="${language.lang}">Löschen</button>
        </td>
      `
      languagesBody.appendChild(row)
    })
  }

  return { renderLanguageSelectors, renderLanguagesTable }
}
