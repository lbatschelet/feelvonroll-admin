/**
 * Languages render helpers for language selectors and table.
 * Exports: createLanguagesRender.
 */
import { icons } from '../utils/dom'

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
      const row = document.createElement('tr')
      row.innerHTML = `<td colspan="4" class="empty">No languages found</td>`
      languagesBody.appendChild(row)
      return
    }

    state.languages.forEach((language) => {
      const row = document.createElement('tr')
      row.innerHTML = `
        <td>${language.lang}</td>
        <td>${language.label}</td>
        <td>
          <input type="checkbox" data-action="lang-toggle" data-lang="${language.lang}" title="Enable this language" ${
            Number(language.enabled) === 1 ? 'checked' : ''
          } />
        </td>
        <td class="actions-cell">
          <button class="icon-btn danger" data-action="lang-delete" data-lang="${language.lang}" title="Delete language">${icons.trash}</button>
        </td>
      `
      languagesBody.appendChild(row)
    })
  }

  return { renderLanguageSelectors, renderLanguagesTable }
}
