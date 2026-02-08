/**
 * Languages view builder for language management table.
 * Exports: createLanguagesView.
 */
export function createLanguagesView() {
  const languagesCard = document.createElement('section')
  languagesCard.className = 'card languages-card'
  languagesCard.innerHTML = `
    <div class="card-header">
      <h2>Languages</h2>
    </div>
    <div class="language-tools">
      <input type="text" id="languageCode" placeholder="Code (e.g. en)" title="Short language code" />
      <input type="text" id="languageLabel" placeholder="Label (e.g. English)" title="Language name" />
      <button id="addLanguage">Add language</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Label</th>
            <th>Active</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="languagesBody"></tbody>
      </table>
    </div>
  `

  return {
    element: languagesCard,
    languageCode: languagesCard.querySelector('#languageCode'),
    languageLabel: languagesCard.querySelector('#languageLabel'),
    addLanguageButton: languagesCard.querySelector('#addLanguage'),
    languagesBody: languagesCard.querySelector('#languagesBody'),
  }
}
