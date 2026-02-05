import './style.css'
import {
  deleteLanguage,
  deleteOption,
  deletePins,
  fetchAdminPins,
  fetchLanguages,
  fetchOptions,
  fetchQuestions,
  fetchTranslations,
  toggleLanguage,
  updatePinApprovalBulk,
  upsertLanguage,
  upsertOption,
  upsertQuestion,
  upsertTranslation,
} from './adminApi'

const app = document.querySelector('#app')

const state = {
  token: localStorage.getItem('admin_token') || '',
  pins: [],
  error: '',
  query: '',
  filter: 'all',
  sort: 'newest',
  loggedIn: false,
  languages: [],
  questions: [],
  options: [],
  translations: {},
  selectedLanguage: 'de',
}

const layout = document.createElement('div')
layout.className = 'layout'

const header = document.createElement('header')
header.className = 'header'
header.innerHTML = `
  <div>
    <h1>Feelvonroll Admin</h1>
    <p>Verwalte Pins und Freigaben</p>
  </div>
`
layout.appendChild(header)

const loginCard = document.createElement('section')
loginCard.className = 'card login-card'
loginCard.innerHTML = `
  <h2>Admin Login</h2>
  <div class="form-row">
    <label>Admin Token</label>
    <input type="password" id="adminToken" placeholder="Token" />
  </div>
  <div class="form-actions">
    <button id="loginButton">Verbinden</button>
  </div>
`
layout.appendChild(loginCard)

const status = document.createElement('div')
status.className = 'status'
layout.appendChild(status)

const toolsCard = document.createElement('section')
toolsCard.className = 'card tools-card'
toolsCard.innerHTML = `
  <div class="tools">
    <input type="text" id="searchInput" placeholder="Suche (ID, Etage, Text)" />
    <select id="filterSelect">
      <option value="all">Alle</option>
      <option value="pending">Wartet</option>
      <option value="approved">Freigegeben</option>
      <option value="rejected">Abgelehnt</option>
    </select>
    <select id="sortSelect">
      <option value="newest">Neueste zuerst</option>
      <option value="oldest">Älteste zuerst</option>
      <option value="floor">Etage</option>
      <option value="wellbeing">Wohlbefinden</option>
    </select>
    <button id="reloadPins">Pins laden</button>
  </div>
`
layout.appendChild(toolsCard)

const tableCard = document.createElement('section')
tableCard.className = 'card'
tableCard.innerHTML = `
  <div class="card-header">
    <h2>Pins</h2>
    <div class="header-actions">
      <span id="pinCount">0</span>
      <button id="approveSelected" class="ghost">Freigeben</button>
      <button id="pendingSelected" class="ghost">Wartend</button>
      <button id="blockSelected" class="ghost">Ablehnen</button>
      <button id="deleteSelected" class="danger">Löschen</button>
    </div>
    </div>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th><input type="checkbox" id="selectAll" /></th>
          <th>ID</th>
          <th>Etage</th>
          <th>Wohlbefinden</th>
          <th>Gründe</th>
          <th>Gruppe</th>
          <th>Notiz</th>
          <th>Erstellt</th>
          <th>Freigabe</th>
        </tr>
      </thead>
      <tbody id="pinsBody"></tbody>
    </table>
  </div>
`
layout.appendChild(tableCard)

const languagesCard = document.createElement('section')
languagesCard.className = 'card languages-card'
languagesCard.innerHTML = `
  <div class="card-header">
    <h2>Sprachen</h2>
  </div>
  <div class="language-tools">
    <select id="languageSelect"></select>
    <input type="text" id="languageCode" placeholder="Code (z.B. de)" />
    <input type="text" id="languageLabel" placeholder="Label (z.B. Deutsch)" />
    <button id="addLanguage">Hinzufügen</button>
  </div>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Code</th>
          <th>Label</th>
          <th>Aktiv</th>
          <th>Aktion</th>
        </tr>
      </thead>
      <tbody id="languagesBody"></tbody>
    </table>
  </div>
`
layout.appendChild(languagesCard)

const questionnaireCard = document.createElement('section')
questionnaireCard.className = 'card questionnaire-card'
questionnaireCard.innerHTML = `
  <div class="card-header">
    <h2>Fragebogen</h2>
    <button id="reloadQuestionnaire" class="ghost">Neu laden</button>
  </div>
  <div class="question-create">
    <div class="question-row">
      <label class="field">
        <span>Key</span>
        <input type="text" id="newQuestionKey" placeholder="z.B. wellbeing" />
      </label>
      <label class="field">
        <span>Type</span>
        <select id="newQuestionType">
          <option value="slider">Slider</option>
          <option value="multi">Multiple choice</option>
          <option value="text">Text</option>
        </select>
      </label>
      <label class="field">
        <span>Required</span>
        <input type="checkbox" id="newQuestionRequired" />
      </label>
      <label class="field">
        <span>Aktiv</span>
        <input type="checkbox" id="newQuestionActive" checked />
      </label>
      <label class="field">
        <span>Sort</span>
        <input type="number" id="newQuestionSort" value="50" />
      </label>
    </div>
    <div class="question-row">
      <label class="field">
        <span>Label</span>
        <input type="text" id="newQuestionLabel" placeholder="Fragetext" />
      </label>
      <label class="field slider-only">
        <span>Legend low</span>
        <input type="text" id="newQuestionLegendLow" />
      </label>
      <label class="field slider-only">
        <span>Legend high</span>
        <input type="text" id="newQuestionLegendHigh" />
      </label>
    </div>
    <div class="question-row slider-only">
      <label class="field">
        <span>Min</span>
        <input type="number" id="newQuestionMin" value="1" />
      </label>
      <label class="field">
        <span>Max</span>
        <input type="number" id="newQuestionMax" value="10" />
      </label>
      <label class="field">
        <span>Step</span>
        <input type="number" id="newQuestionStep" value="1" />
      </label>
      <label class="field">
        <span>Default</span>
        <input type="number" id="newQuestionDefault" value="5" />
      </label>
    </div>
    <div class="question-row multi-only">
      <label class="field">
        <span>Mehrfach</span>
        <input type="checkbox" id="newQuestionAllowMultiple" />
      </label>
    </div>
    <div class="question-row text-only">
      <label class="field">
        <span>Rows</span>
        <input type="number" id="newQuestionRows" value="3" />
      </label>
    </div>
    <button id="addQuestion">Frage hinzufügen</button>
  </div>
  <div id="questionsBody" class="questionnaire-body"></div>
`
layout.appendChild(questionnaireCard)

app.appendChild(layout)

const tokenInput = loginCard.querySelector('#adminToken')
const loginButton = loginCard.querySelector('#loginButton')
const reloadButton = toolsCard.querySelector('#reloadPins')
const searchInput = toolsCard.querySelector('#searchInput')
const filterSelect = toolsCard.querySelector('#filterSelect')
const sortSelect = toolsCard.querySelector('#sortSelect')
const pinCount = tableCard.querySelector('#pinCount')
const approveSelected = tableCard.querySelector('#approveSelected')
const pendingSelected = tableCard.querySelector('#pendingSelected')
const blockSelected = tableCard.querySelector('#blockSelected')
const deleteSelected = tableCard.querySelector('#deleteSelected')
const selectAll = tableCard.querySelector('#selectAll')
const pinsBody = tableCard.querySelector('#pinsBody')
const languageSelect = languagesCard.querySelector('#languageSelect')
const languageCode = languagesCard.querySelector('#languageCode')
const languageLabel = languagesCard.querySelector('#languageLabel')
const addLanguageButton = languagesCard.querySelector('#addLanguage')
const languagesBody = languagesCard.querySelector('#languagesBody')
const reloadQuestionnaireButton = questionnaireCard.querySelector('#reloadQuestionnaire')
const questionsBody = questionnaireCard.querySelector('#questionsBody')
const newQuestionKey = questionnaireCard.querySelector('#newQuestionKey')
const newQuestionType = questionnaireCard.querySelector('#newQuestionType')
const newQuestionRequired = questionnaireCard.querySelector('#newQuestionRequired')
const newQuestionActive = questionnaireCard.querySelector('#newQuestionActive')
const newQuestionSort = questionnaireCard.querySelector('#newQuestionSort')
const newQuestionLabel = questionnaireCard.querySelector('#newQuestionLabel')
const newQuestionLegendLow = questionnaireCard.querySelector('#newQuestionLegendLow')
const newQuestionLegendHigh = questionnaireCard.querySelector('#newQuestionLegendHigh')
const newQuestionMin = questionnaireCard.querySelector('#newQuestionMin')
const newQuestionMax = questionnaireCard.querySelector('#newQuestionMax')
const newQuestionStep = questionnaireCard.querySelector('#newQuestionStep')
const newQuestionDefault = questionnaireCard.querySelector('#newQuestionDefault')
const newQuestionAllowMultiple = questionnaireCard.querySelector('#newQuestionAllowMultiple')
const newQuestionRows = questionnaireCard.querySelector('#newQuestionRows')
const addQuestionButton = questionnaireCard.querySelector('#addQuestion')

tokenInput.value = state.token

loginButton.addEventListener('click', () => handleLogin())
reloadButton.addEventListener('click', () => loadPins())
searchInput.addEventListener('input', (event) => {
  state.query = event.target.value.trim().toLowerCase()
  renderPins()
})
filterSelect.addEventListener('change', (event) => {
  state.filter = event.target.value
  renderPins()
})
sortSelect.addEventListener('change', (event) => {
  state.sort = event.target.value
  renderPins()
})

languageSelect.addEventListener('change', (event) => {
  state.selectedLanguage = event.target.value
  loadTranslations()
})

addLanguageButton.addEventListener('click', async () => {
  const lang = languageCode.value.trim().toLowerCase()
  const label = languageLabel.value.trim()
  if (!lang || !label) {
    setStatus('Bitte Code und Label angeben', true)
    return
  }
  try {
    await upsertLanguage({ token: state.token, lang, label, enabled: true })
    languageCode.value = ''
    languageLabel.value = ''
    await loadLanguages()
  } catch (error) {
    setStatus(error.message, true)
  }
})

reloadQuestionnaireButton.addEventListener('click', () => loadQuestionnaire())

newQuestionType.addEventListener('change', () => updateQuestionCreateForm())

addQuestionButton.addEventListener('click', async () => {
  const key = newQuestionKey.value.trim()
  const type = newQuestionType.value
  if (!key) {
    setStatus('Question-Key fehlt', true)
    return
  }
  const label = newQuestionLabel.value.trim()
  if (!label) {
    setStatus('Label fehlt', true)
    return
  }

  const base = {
    question_key: key,
    type,
    required: newQuestionRequired.checked,
    sort: Number(newQuestionSort.value || 0),
    is_active: newQuestionActive.checked,
    config: {},
  }

  const translations = {
    [`questions.${key}.label`]: label,
  }

  if (type === 'slider') {
    base.config = {
      min: Number(newQuestionMin.value || 1),
      max: Number(newQuestionMax.value || 10),
      step: Number(newQuestionStep.value || 1),
      default: Number(newQuestionDefault.value || 5),
    }
    translations[`questions.${key}.legend_low`] = newQuestionLegendLow.value.trim()
    translations[`questions.${key}.legend_high`] = newQuestionLegendHigh.value.trim()
  }

  if (type === 'multi') {
    base.config = { allow_multiple: newQuestionAllowMultiple.checked }
  }

  if (type === 'text') {
    base.config = { rows: Number(newQuestionRows.value || 3) }
  }

  await runWithButtonFeedback(addQuestionButton, async () => {
    await upsertQuestion({ token: state.token, question: base })
    await saveTranslations(translations)
    newQuestionKey.value = ''
    newQuestionLabel.value = ''
    newQuestionLegendLow.value = ''
    newQuestionLegendHigh.value = ''
    await loadQuestions()
    await loadOptions()
    await loadTranslations()
    renderQuestions()
  })
})

approveSelected.addEventListener('click', () => bulkUpdateApproval(1))
pendingSelected.addEventListener('click', () => bulkUpdateApproval(0))
blockSelected.addEventListener('click', () => bulkUpdateApproval(-1))
deleteSelected.addEventListener('click', bulkDelete)
selectAll.addEventListener('change', () => {
  const checked = selectAll.checked
  pinsBody.querySelectorAll('input[type="checkbox"][data-id]').forEach((input) => {
    input.checked = checked
  })
})

applyVisibility()

async function loadPins() {
  setStatus('Lade Pins...', false)
  try {
    const rawPins = await fetchAdminPins({ token: state.token })
    state.pins = rawPins.map(normalizePin)
    state.error = ''
    renderPins()
    setStatus(`Verbunden (${state.pins.length} Einträge)`, false)
  } catch (error) {
    state.error = error.message
    renderPins()
    setStatus(error.message, true)
  }
}

async function loadQuestionnaire() {
  setStatus('Lade Fragebogen...', false)
  try {
    await loadLanguages()
    await Promise.all([loadQuestions(), loadOptions(), loadTranslations()])
    renderLanguages()
    renderQuestions()
    updateQuestionCreateForm()
    setStatus('Fragebogen geladen', false)
  } catch (error) {
    setStatus(error.message, true)
  }
}

async function loadLanguages() {
  const languages = await fetchLanguages({ token: state.token })
  state.languages = languages
  if (!state.selectedLanguage || !languages.find((lang) => lang.lang === state.selectedLanguage)) {
    state.selectedLanguage = languages[0]?.lang || 'de'
  }
  languageSelect.innerHTML = ''
  state.languages.forEach((language) => {
    const option = document.createElement('option')
    option.value = language.lang
    option.textContent = `${language.label} (${language.lang})`
    languageSelect.appendChild(option)
  })
  languageSelect.value = state.selectedLanguage
}

async function loadQuestions() {
  state.questions = await fetchQuestions({ token: state.token })
}

async function loadOptions() {
  state.options = await fetchOptions({ token: state.token })
}

async function loadTranslations() {
  const [questionTranslations, optionTranslations] = await Promise.all([
    fetchTranslations({ lang: state.selectedLanguage, prefix: 'questions.' }),
    fetchTranslations({ lang: state.selectedLanguage, prefix: 'options.' }),
  ])
  state.translations = { ...questionTranslations, ...optionTranslations }
  renderQuestions()
  renderPins()
}

function renderLanguages() {
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
        <input type="checkbox" data-lang="${language.lang}" ${language.enabled ? 'checked' : ''} />
      </td>
      <td>
        <button class="ghost" data-action="delete" data-lang="${language.lang}">Löschen</button>
      </td>
    `
    languagesBody.appendChild(row)
  })

  languagesBody.querySelectorAll('input[type="checkbox"][data-lang]').forEach((input) => {
    input.addEventListener('change', async () => {
      const lang = input.dataset.lang
      try {
        await toggleLanguage({ token: state.token, lang, enabled: input.checked })
        await loadLanguages()
        renderLanguages()
      } catch (error) {
        setStatus(error.message, true)
      }
    })
  })

  languagesBody.querySelectorAll('button[data-action="delete"]').forEach((button) => {
    button.addEventListener('click', async () => {
      const lang = button.dataset.lang
      const confirmed = window.confirm(`Sprache "${lang}" löschen?`)
      if (!confirmed) return
      try {
        await deleteLanguage({ token: state.token, lang })
        await loadLanguages()
        renderLanguages()
      } catch (error) {
        setStatus(error.message, true)
      }
    })
  })
}

function renderQuestions() {
  questionsBody.innerHTML = ''
  if (!state.questions.length) {
    questionsBody.innerHTML = '<div class="empty">Keine Fragen vorhanden</div>'
    return
  }

  const optionsByQuestion = new Map()
  state.options.forEach((option) => {
    if (!optionsByQuestion.has(option.question_key)) {
      optionsByQuestion.set(option.question_key, [])
    }
    optionsByQuestion.get(option.question_key).push(option)
  })

  state.questions.forEach((question) => {
    const wrapper = document.createElement('div')
    wrapper.className = 'question-block'

    const header = document.createElement('div')
    header.className = 'question-header'
    header.innerHTML = `
      <div>
        <strong>${question.question_key}</strong>
        <span class="muted">(${question.type})</span>
      </div>
    `
    wrapper.appendChild(header)

    const labelKey = `questions.${question.question_key}.label`
    const labelInput = createInput('text', getTranslation(labelKey))

    const requiredToggle = createCheckbox(question.required)
    const activeToggle = createCheckbox(question.is_active)
    const sortInput = createInput('number', String(question.sort ?? 0))

    const controlsRow = document.createElement('div')
    controlsRow.className = 'question-row'
    controlsRow.appendChild(createLabeled('Label', labelInput))
    controlsRow.appendChild(createLabeled('Required', requiredToggle))
    controlsRow.appendChild(createLabeled('Aktiv', activeToggle))
    controlsRow.appendChild(createLabeled('Sort', sortInput))
    wrapper.appendChild(controlsRow)

    const configRow = document.createElement('div')
    configRow.className = 'question-row'

    if (question.type === 'slider') {
      const minInput = createInput('number', String(question.config?.min ?? 1))
      const maxInput = createInput('number', String(question.config?.max ?? 10))
      const stepInput = createInput('number', String(question.config?.step ?? 1))
      const defaultInput = createInput('number', String(question.config?.default ?? 6))
      const legendLowKey = `questions.${question.question_key}.legend_low`
      const legendHighKey = `questions.${question.question_key}.legend_high`
      const legendLowInput = createInput('text', getTranslation(legendLowKey))
      const legendHighInput = createInput('text', getTranslation(legendHighKey))
      configRow.appendChild(createLabeled('Min', minInput))
      configRow.appendChild(createLabeled('Max', maxInput))
      configRow.appendChild(createLabeled('Step', stepInput))
      configRow.appendChild(createLabeled('Default', defaultInput))
      configRow.appendChild(createLabeled('Legend low', legendLowInput))
      configRow.appendChild(createLabeled('Legend high', legendHighInput))
      wrapper.appendChild(configRow)

      const saveButton = createButton('Speichern')
      saveButton.addEventListener('click', async () => {
        await saveQuestion(saveButton, {
          question_key: question.question_key,
          type: question.type,
          required: requiredToggle.checked,
          sort: Number(sortInput.value || 0),
          is_active: activeToggle.checked,
          config: {
            min: Number(minInput.value || 1),
            max: Number(maxInput.value || 10),
            step: Number(stepInput.value || 1),
            default: Number(defaultInput.value || 6),
          },
          translations: {
            [labelKey]: labelInput.value.trim(),
            [legendLowKey]: legendLowInput.value.trim(),
            [legendHighKey]: legendHighInput.value.trim(),
          },
        })
      })
      wrapper.appendChild(saveButton)
    } else if (question.type === 'text') {
      const rowsInput = createInput('number', String(question.config?.rows ?? 3))
      configRow.appendChild(createLabeled('Rows', rowsInput))
      wrapper.appendChild(configRow)

      const saveButton = createButton('Speichern')
      saveButton.addEventListener('click', async () => {
        await saveQuestion(saveButton, {
          question_key: question.question_key,
          type: question.type,
          required: requiredToggle.checked,
          sort: Number(sortInput.value || 0),
          is_active: activeToggle.checked,
          config: { rows: Number(rowsInput.value || 3) },
          translations: {
            [labelKey]: labelInput.value.trim(),
          },
        })
      })
      wrapper.appendChild(saveButton)
    } else if (question.type === 'multi') {
      const allowMultiple = createCheckbox(Boolean(question.config?.allow_multiple))
      configRow.appendChild(createLabeled('Mehrfach', allowMultiple))
      wrapper.appendChild(configRow)

      const saveButton = createButton('Speichern')
      saveButton.addEventListener('click', async () => {
        await saveQuestion(saveButton, {
          question_key: question.question_key,
          type: question.type,
          required: requiredToggle.checked,
          sort: Number(sortInput.value || 0),
          is_active: activeToggle.checked,
          config: { allow_multiple: allowMultiple.checked },
          translations: {
            [labelKey]: labelInput.value.trim(),
          },
        })
      })
      wrapper.appendChild(saveButton)
    }

    const optionList = optionsByQuestion.get(question.question_key) || []
    if (optionList.length || question.type === 'multi') {
      const optionWrap = document.createElement('div')
      optionWrap.className = 'option-list'
      optionWrap.innerHTML = '<h3>Optionen</h3>'

      optionList.forEach((option) => {
        const optionRow = document.createElement('div')
        optionRow.className = 'option-row'
        const optionLabelKey = `options.${question.question_key}.${option.option_key}`
        const optionLabelInput = createInput('text', getTranslation(optionLabelKey))
        const optionSortInput = createInput('number', String(option.sort ?? 0))
        const optionActive = createCheckbox(option.is_active)
        const saveOptionButton = createButton('Speichern')
        const deleteOptionButton = createButton('Löschen', 'danger')

        saveOptionButton.addEventListener('click', async () => {
          await saveOption(saveOptionButton, {
            question_key: question.question_key,
            option_key: option.option_key,
            sort: Number(optionSortInput.value || 0),
            is_active: optionActive.checked,
            translation_key: optionLabelKey,
            label: optionLabelInput.value.trim(),
          })
        })
        deleteOptionButton.addEventListener('click', async () => {
          const confirmed = window.confirm(`Option "${option.option_key}" löschen?`)
          if (!confirmed) return
          try {
            await deleteOption({ token: state.token, question_key: question.question_key, option_key: option.option_key })
            await loadOptions()
            await loadTranslations()
            renderQuestions()
          } catch (error) {
            setStatus(error.message, true)
          }
        })

        optionRow.appendChild(createLabeled('Key', createInput('text', option.option_key, true)))
        optionRow.appendChild(createLabeled('Label', optionLabelInput))
        optionRow.appendChild(createLabeled('Sort', optionSortInput))
        optionRow.appendChild(createLabeled('Aktiv', optionActive))
        optionRow.appendChild(saveOptionButton)
        optionRow.appendChild(deleteOptionButton)
        optionWrap.appendChild(optionRow)
      })

      const addRow = document.createElement('div')
      addRow.className = 'option-row'
      const newKeyInput = createInput('text', '')
      const newLabelInput = createInput('text', '')
      const newSortInput = createInput('number', '0')
      const newActive = createCheckbox(true)
      const addButton = createButton('Hinzufügen')
      addButton.addEventListener('click', async () => {
        const optionKey = newKeyInput.value.trim()
        if (!optionKey) {
          setStatus('Option-Key fehlt', true)
          return
        }
        const optionLabelKey = `options.${question.question_key}.${optionKey}`
        await saveOption(addButton, {
          question_key: question.question_key,
          option_key: optionKey,
          sort: Number(newSortInput.value || 0),
          is_active: newActive.checked,
          translation_key: optionLabelKey,
          label: newLabelInput.value.trim(),
        })
        newKeyInput.value = ''
        newLabelInput.value = ''
        newSortInput.value = '0'
        newActive.checked = true
      })
      addRow.appendChild(createLabeled('Key', newKeyInput))
      addRow.appendChild(createLabeled('Label', newLabelInput))
      addRow.appendChild(createLabeled('Sort', newSortInput))
      addRow.appendChild(createLabeled('Aktiv', newActive))
      addRow.appendChild(addButton)
      optionWrap.appendChild(addRow)

      wrapper.appendChild(optionWrap)
    }

    questionsBody.appendChild(wrapper)
  })
}

async function saveQuestion(button, { question_key, type, required, sort, is_active, config, translations }) {
  await runWithButtonFeedback(button, async () => {
    await upsertQuestion({
      token: state.token,
      question: { question_key, type, required, sort, is_active, config },
    })
    await saveTranslations(translations)
    await loadQuestions()
    await loadTranslations()
    renderQuestions()
    setStatus('Frage gespeichert', false)
  })
}

async function saveOption(button, { question_key, option_key, sort, is_active, translation_key, label }) {
  await runWithButtonFeedback(button, async () => {
    await upsertOption({
      token: state.token,
      option: { question_key, option_key, sort, is_active },
    })
    await saveTranslations({ [translation_key]: label })
    await loadOptions()
    await loadTranslations()
    renderQuestions()
    setStatus('Option gespeichert', false)
  })
}

async function saveTranslations(translations) {
  const entries = Object.entries(translations || {})
  for (const [translation_key, text] of entries) {
    await upsertTranslation({ token: state.token, translation_key, lang: state.selectedLanguage, text })
  }
}

function getTranslation(key) {
  return state.translations[key] || ''
}

function createInput(type, value, readOnly = false) {
  const input = document.createElement('input')
  input.type = type
  input.value = value ?? ''
  input.readOnly = readOnly
  return input
}

function createCheckbox(checked) {
  const input = document.createElement('input')
  input.type = 'checkbox'
  input.checked = Boolean(checked)
  return input
}

function createButton(label, variant) {
  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = label
  if (variant === 'danger') {
    button.classList.add('danger')
  }
  return button
}

function createLabeled(label, element) {
  const wrapper = document.createElement('label')
  wrapper.className = 'field'
  const text = document.createElement('span')
  text.textContent = label
  wrapper.appendChild(text)
  wrapper.appendChild(element)
  return wrapper
}

function updateQuestionCreateForm() {
  const type = newQuestionType.value
  questionnaireCard.querySelectorAll('.slider-only').forEach((node) => {
    node.style.display = type === 'slider' ? '' : 'none'
  })
  questionnaireCard.querySelectorAll('.multi-only').forEach((node) => {
    node.style.display = type === 'multi' ? '' : 'none'
  })
  questionnaireCard.querySelectorAll('.text-only').forEach((node) => {
    node.style.display = type === 'text' ? '' : 'none'
  })
}

async function runWithButtonFeedback(button, action) {
  const originalText = button.textContent
  button.disabled = true
  button.classList.remove('success', 'error')
  button.textContent = 'Speichern...'
  try {
    await action()
    button.classList.add('success')
    button.textContent = 'Gespeichert ✓'
  } catch (error) {
    button.classList.add('error')
    button.textContent = 'Fehler'
    setStatus(error.message, true)
  } finally {
    setTimeout(() => {
      button.classList.remove('success', 'error')
      button.textContent = originalText
      button.disabled = false
    }, 900)
  }
}

function normalizePin(pin) {
  return {
    ...pin,
    id: Number(pin.id),
    floor_index: Number(pin.floor_index),
    position_x: Number(pin.position_x),
    position_y: Number(pin.position_y),
    position_z: Number(pin.position_z),
    wellbeing: Number(pin.wellbeing),
    approved: Number(pin.approved),
    group_key: pin.group_key || null,
  }
}

function renderPins() {
  pinsBody.innerHTML = ''
  pinCount.textContent = String(getFilteredPins().length)

  const filteredPins = getFilteredPins()
  if (!filteredPins.length) {
    const row = document.createElement('tr')
    row.innerHTML = `<td colspan="9" class="empty">Keine Pins vorhanden</td>`
    pinsBody.appendChild(row)
    return
  }

  filteredPins.forEach((pin) => {
    const row = document.createElement('tr')
    const reasons = Array.isArray(pin.reasons)
      ? pin.reasons.map((key) => translateOption('reasons', key)).join(', ')
      : ''
    const groupLabel = pin.group_key ? translateOption('group', pin.group_key) : ''
    const statusLabel = getStatusLabel(pin.approved)
    row.innerHTML = `
      <td><input type="checkbox" data-id="${pin.id}" /></td>
      <td>${pin.id}</td>
      <td>${pin.floor_index}</td>
      <td>${pin.wellbeing}/10</td>
      <td>${reasons}</td>
      <td>${groupLabel}</td>
      <td>${escapeHtml(pin.note || '')}</td>
      <td>${formatDate(pin.created_at)}</td>
      <td>
        <button class="toggle ${getStatusClass(pin.approved)}" data-id="${pin.id}">
          ${statusLabel}
        </button>
      </td>
    `
    pinsBody.appendChild(row)
  })

  pinsBody.querySelectorAll('.toggle').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = Number(button.dataset.id)
      const pin = state.pins.find((item) => item.id === id)
      if (!pin) return
      const nextApproved = getNextStatus(pin.approved)
      button.disabled = true
      try {
        await updatePinApprovalBulk({
          token: state.token,
          ids: [id],
          approved: nextApproved,
        })
        pin.approved = nextApproved
        renderPins()
      } catch (error) {
        setStatus(error.message, true)
        button.disabled = false
      }
    })
  })
}

function getNextStatus(current) {
  if (current === 1) return -1
  if (current === -1) return 0
  return 1
}

function getStatusLabel(status) {
  if (status === 1) return 'Freigegeben'
  if (status === -1) return 'Abgelehnt'
  return 'Wartet'
}

function translateOption(questionKey, optionKey) {
  const key = `options.${questionKey}.${optionKey}`
  return state.translations[key] || optionKey
}

function getStatusClass(status) {
  if (status === 1) return 'approved'
  if (status === -1) return 'rejected'
  return 'pending'
}

async function bulkUpdateApproval(approved) {
  const ids = getSelectedIds()
  if (!ids.length) {
    setStatus('Keine Pins ausgewählt', true)
    return
  }
  setStatus('Speichere...', false)
  try {
    await updatePinApprovalBulk({ token: state.token, ids, approved })
    state.pins.forEach((pin) => {
      if (ids.includes(pin.id)) {
        pin.approved = approved
      }
    })
    renderPins()
    setStatus(`Aktualisiert (${ids.length})`, false)
  } catch (error) {
    setStatus(error.message, true)
  }
}

async function bulkDelete() {
  const ids = getSelectedIds()
  if (!ids.length) {
    setStatus('Keine Pins ausgewählt', true)
    return
  }
  const confirmed = window.confirm(`Pins wirklich löschen? (${ids.length})`)
  if (!confirmed) return
  setStatus('Lösche...', false)
  try {
    await deletePins({ token: state.token, ids })
    state.pins = state.pins.filter((pin) => !ids.includes(pin.id))
    renderPins()
    setStatus(`Gelöscht (${ids.length})`, false)
  } catch (error) {
    setStatus(error.message, true)
  }
}

function getSelectedIds() {
  return Array.from(pinsBody.querySelectorAll('input[type="checkbox"][data-id]:checked')).map(
    (input) => Number(input.dataset.id)
  )
}

async function handleLogin() {
  state.token = tokenInput.value.trim()
  localStorage.setItem('admin_token', state.token)
  await loadPins()
  if (!state.error) {
    state.loggedIn = true
    applyVisibility()
    await loadQuestionnaire()
  }
}

function applyVisibility() {
  loginCard.style.display = state.loggedIn ? 'none' : 'block'
  toolsCard.style.display = state.loggedIn ? 'block' : 'none'
  tableCard.style.display = state.loggedIn ? 'block' : 'none'
  languagesCard.style.display = state.loggedIn ? 'block' : 'none'
  questionnaireCard.style.display = state.loggedIn ? 'block' : 'none'
}

function getFilteredPins() {
  const filtered = state.pins.filter((pin) => {
    if (state.filter === 'approved' && !pin.approved) return false
    if (state.filter === 'pending' && pin.approved !== 0) return false
    if (state.filter === 'approved' && pin.approved !== 1) return false
    if (state.filter === 'rejected' && pin.approved !== -1) return false

    if (!state.query) return true
    const haystack = [
      pin.id,
      pin.floor_index,
      pin.wellbeing,
      pin.note || '',
      Array.isArray(pin.reasons) ? pin.reasons.join(' ') : '',
      pin.group_key || '',
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(state.query)
  })

  return filtered.sort((a, b) => {
    if (state.sort === 'oldest') {
      return new Date(a.created_at) - new Date(b.created_at)
    }
    if (state.sort === 'floor') {
      return a.floor_index - b.floor_index
    }
    if (state.sort === 'wellbeing') {
      return b.wellbeing - a.wellbeing
    }
    return new Date(b.created_at) - new Date(a.created_at)
  })
}

function setStatus(message, isError) {
  status.textContent = message
  status.className = `status ${isError ? 'error' : ''}`
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('de-CH')
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
