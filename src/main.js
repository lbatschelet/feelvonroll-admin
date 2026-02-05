import './style.css'
import {
  createUser,
  deleteLanguage,
  deleteOption,
  deletePins,
  fetchAdminPins,
  fetchAuthStatus,
  fetchAuditLogs,
  fetchLanguages,
  fetchOptions,
  fetchQuestions,
  fetchTranslations,
  fetchUsers,
  loginUser,
  loginWithToken,
  refreshToken,
  resetUserPassword,
  setPassword,
  toggleLanguage,
  updatePinApprovalBulk,
  upsertLanguage,
  upsertOption,
  upsertQuestion,
  upsertTranslation,
} from './adminApi'

const app = document.querySelector('#app')

const state = {
  token: localStorage.getItem('admin_jwt') || '',
  page: 'dashboard',
  pins: [],
  error: '',
  query: '',
  filter: 'all',
  sort: 'newest',
  pageIndex: 1,
  pageSize: 25,
  loggedIn: false,
  bootstrapRequired: false,
  bootstrapMode: false,
  languages: [],
  questions: [],
  options: [],
  translations: {},
  translationsByLang: {},
  pendingTranslationsByLang: {},
  selectedLanguage: 'de',
  draggingKey: null,
  users: [],
  audit: {
    items: [],
    total: 0,
    limit: 50,
    offset: 0,
  },
  refreshTimer: null,
  lastResetLink: '',
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
  <nav class="nav">
    <button class="nav-button" data-page="dashboard">Übersicht</button>
    <button class="nav-button" data-page="pins">Pins</button>
    <button class="nav-button" data-page="questionnaire">Fragebogen</button>
    <button class="nav-button" data-page="users">User</button>
    <button class="nav-button" data-page="audit">Audit</button>
    <button class="nav-button ghost" data-action="logout">Logout</button>
  </nav>
`
layout.appendChild(header)

const loginCard = document.createElement('section')
loginCard.className = 'card login-card'
loginCard.innerHTML = `
  <h2>Admin Login</h2>
  <div class="auth-section" data-section="login">
    <div class="form-row">
      <label>Email</label>
      <input type="email" id="loginEmail" placeholder="name@domain.ch" />
    </div>
    <div class="form-row">
      <label>Passwort</label>
      <input type="password" id="loginPassword" placeholder="Passwort" />
    </div>
    <div class="form-actions">
      <button id="loginUserButton">Login</button>
      <button id="showSetPassword" class="ghost">Passwort setzen</button>
    </div>
  </div>
  <div class="auth-section" data-section="set-password">
    <div class="form-row">
      <label>Reset Token</label>
      <input type="text" id="resetToken" placeholder="Token" />
    </div>
    <div class="form-row">
      <label>Neues Passwort</label>
      <input type="password" id="resetPassword" placeholder="Neues Passwort" />
    </div>
    <div class="form-actions">
      <button id="setPasswordButton">Passwort speichern</button>
      <button id="showLogin" class="ghost">Zurück</button>
    </div>
  </div>
  <div class="auth-section" data-section="bootstrap">
    <div class="form-row">
      <label>Admin Token</label>
      <input type="password" id="adminToken" placeholder="Token" />
    </div>
    <div class="form-actions">
      <button id="bootstrapButton">Einrichten</button>
    </div>
  </div>
  <div class="auth-section" data-section="bootstrap-user">
    <div class="form-row">
      <label>Erster User (Name)</label>
      <input type="text" id="bootstrapName" placeholder="Name" />
    </div>
    <div class="form-row">
      <label>Erster User (Email)</label>
      <input type="email" id="bootstrapEmail" placeholder="name@domain.ch" />
    </div>
    <div class="form-actions">
    <button type="button" id="bootstrapCreateUser">User erstellen</button>
    </div>
  </div>
`
layout.appendChild(loginCard)

const status = document.createElement('div')
status.className = 'status'
layout.appendChild(status)

const pages = document.createElement('div')
pages.className = 'pages'
layout.appendChild(pages)

const dashboardCard = document.createElement('section')
dashboardCard.className = 'card dashboard-card'
dashboardCard.innerHTML = `
  <div class="card-header">
    <h2>Übersicht</h2>
  </div>
  <div class="dashboard-grid">
    <div class="dashboard-item">
      <span class="muted">Pins gesamt</span>
      <strong id="dashboardPinsTotal">0</strong>
    </div>
    <div class="dashboard-item">
      <span class="muted">Pins wartend</span>
      <strong id="dashboardPinsPending">0</strong>
    </div>
    <div class="dashboard-item">
      <span class="muted">Pins freigegeben</span>
      <strong id="dashboardPinsApproved">0</strong>
    </div>
    <div class="dashboard-item">
      <span class="muted">Pins abgelehnt</span>
      <strong id="dashboardPinsRejected">0</strong>
    </div>
    <div class="dashboard-item">
      <span class="muted">Fragen</span>
      <strong id="dashboardQuestionsTotal">0</strong>
    </div>
    <div class="dashboard-item">
      <span class="muted">Aktive Sprachen</span>
      <strong id="dashboardLanguagesActive">0</strong>
    </div>
  </div>
`
pages.appendChild(dashboardCard)

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
    <select id="pageSizeSelect">
      <option value="10">10 pro Seite</option>
      <option value="25" selected>25 pro Seite</option>
      <option value="50">50 pro Seite</option>
      <option value="100">100 pro Seite</option>
    </select>
    <button id="reloadPins">Pins laden</button>
  </div>
  <div class="pagination">
    <button id="prevPage" class="ghost">Zurück</button>
    <span id="pageInfo">Seite 1</span>
    <button id="nextPage" class="ghost">Weiter</button>
  </div>
`
pages.appendChild(toolsCard)

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
pages.appendChild(tableCard)

const languagesCard = document.createElement('section')
languagesCard.className = 'card languages-card'
languagesCard.innerHTML = `
  <div class="card-header">
    <h2>Sprachen</h2>
  </div>
  <div class="language-tools">
    <select id="languageSelectAdmin"></select>
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
pages.appendChild(languagesCard)

const questionnaireCard = document.createElement('section')
questionnaireCard.className = 'card questionnaire-card'
questionnaireCard.innerHTML = `
  <div class="card-header">
    <h2>Fragebogen</h2>
    <button id="reloadQuestionnaire" class="ghost">Neu laden</button>
    <button id="saveQuestionnaire" class="primary">Änderungen speichern</button>
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
    <div class="question-row question-translations" id="newQuestionTranslations"></div>
    <div class="question-row slider-only">
      <label class="field">
        <span>Min</span>
        <input type="number" id="newQuestionMin" value="0" />
      </label>
      <label class="field">
        <span>Max</span>
        <input type="number" id="newQuestionMax" value="1" />
      </label>
      <label class="field">
        <span>Step</span>
        <input type="number" id="newQuestionStep" value="0.01" />
      </label>
      <label class="field">
        <span>Default</span>
        <input type="number" id="newQuestionDefault" value="0.5" />
      </label>
      <label class="field">
        <span>Pin-Farbe</span>
        <input type="checkbox" id="newQuestionUseForColor" />
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
  <div class="question-languages">
    <label class="field">
      <span>Optionen-Sprache</span>
      <select id="languageSelect"></select>
    </label>
  </div>
  <div id="questionsBody" class="questionnaire-body"></div>
`
pages.appendChild(questionnaireCard)

const usersCard = document.createElement('section')
usersCard.className = 'card users-card'
usersCard.innerHTML = `
  <div class="card-header">
    <h2>User</h2>
    <button id="reloadUsers" class="ghost">Neu laden</button>
  </div>
  <div class="user-create">
    <div class="question-row">
      <label class="field">
        <span>Name</span>
        <input type="text" id="newUserName" placeholder="Name" />
      </label>
      <label class="field">
        <span>Email</span>
        <input type="email" id="newUserEmail" placeholder="name@domain.ch" />
      </label>
      <button type="button" id="addUser">User erstellen</button>
    </div>
  </div>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Passwort</th>
          <th>Letzter Login</th>
          <th>Aktion</th>
        </tr>
      </thead>
      <tbody id="usersBody"></tbody>
    </table>
  </div>
  <div class="reset-link" id="resetLinkBox"></div>
`
pages.appendChild(usersCard)

const auditCard = document.createElement('section')
auditCard.className = 'card audit-card'
auditCard.innerHTML = `
  <div class="card-header">
    <h2>Audit Log</h2>
    <button id="reloadAudit" class="ghost">Neu laden</button>
  </div>
  <div class="tools audit-tools">
    <select id="auditLimit">
      <option value="25">25</option>
      <option value="50" selected>50</option>
      <option value="100">100</option>
      <option value="200">200</option>
    </select>
    <button id="auditPrev" class="ghost">Zurück</button>
    <span id="auditInfo">0</span>
    <button id="auditNext" class="ghost">Weiter</button>
  </div>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Zeit</th>
          <th>User</th>
          <th>Aktion</th>
          <th>Ziel</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody id="auditBody"></tbody>
    </table>
  </div>
`
pages.appendChild(auditCard)

app.appendChild(layout)

const loginEmail = loginCard.querySelector('#loginEmail')
const loginPassword = loginCard.querySelector('#loginPassword')
const loginUserButton = loginCard.querySelector('#loginUserButton')
const showSetPasswordButton = loginCard.querySelector('#showSetPassword')
const showLoginButton = loginCard.querySelector('#showLogin')
const resetTokenInput = loginCard.querySelector('#resetToken')
const resetPasswordInput = loginCard.querySelector('#resetPassword')
const setPasswordButton = loginCard.querySelector('#setPasswordButton')
const tokenInput = loginCard.querySelector('#adminToken')
const bootstrapButton = loginCard.querySelector('#bootstrapButton')
const bootstrapName = loginCard.querySelector('#bootstrapName')
const bootstrapEmail = loginCard.querySelector('#bootstrapEmail')
const bootstrapCreateUser = loginCard.querySelector('#bootstrapCreateUser')
const dashboardPinsTotal = dashboardCard.querySelector('#dashboardPinsTotal')
const dashboardPinsPending = dashboardCard.querySelector('#dashboardPinsPending')
const dashboardPinsApproved = dashboardCard.querySelector('#dashboardPinsApproved')
const dashboardPinsRejected = dashboardCard.querySelector('#dashboardPinsRejected')
const dashboardQuestionsTotal = dashboardCard.querySelector('#dashboardQuestionsTotal')
const dashboardLanguagesActive = dashboardCard.querySelector('#dashboardLanguagesActive')
const reloadButton = toolsCard.querySelector('#reloadPins')
const pageSizeSelect = toolsCard.querySelector('#pageSizeSelect')
const prevPageButton = toolsCard.querySelector('#prevPage')
const nextPageButton = toolsCard.querySelector('#nextPage')
const pageInfo = toolsCard.querySelector('#pageInfo')
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
const languageSelectAdmin = languagesCard.querySelector('#languageSelectAdmin')
const languageCode = languagesCard.querySelector('#languageCode')
const languageLabel = languagesCard.querySelector('#languageLabel')
const addLanguageButton = languagesCard.querySelector('#addLanguage')
const languagesBody = languagesCard.querySelector('#languagesBody')
const reloadQuestionnaireButton = questionnaireCard.querySelector('#reloadQuestionnaire')
const saveQuestionnaireButton = questionnaireCard.querySelector('#saveQuestionnaire')
const languageSelect = questionnaireCard.querySelector('#languageSelect')
const questionsBody = questionnaireCard.querySelector('#questionsBody')
const newQuestionKey = questionnaireCard.querySelector('#newQuestionKey')
const newQuestionType = questionnaireCard.querySelector('#newQuestionType')
const newQuestionRequired = questionnaireCard.querySelector('#newQuestionRequired')
const newQuestionActive = questionnaireCard.querySelector('#newQuestionActive')
const newQuestionSort = questionnaireCard.querySelector('#newQuestionSort')
const newQuestionTranslations = questionnaireCard.querySelector('#newQuestionTranslations')
const newQuestionMin = questionnaireCard.querySelector('#newQuestionMin')
const newQuestionMax = questionnaireCard.querySelector('#newQuestionMax')
const newQuestionStep = questionnaireCard.querySelector('#newQuestionStep')
const newQuestionDefault = questionnaireCard.querySelector('#newQuestionDefault')
const newQuestionUseForColor = questionnaireCard.querySelector('#newQuestionUseForColor')
const newQuestionAllowMultiple = questionnaireCard.querySelector('#newQuestionAllowMultiple')
const newQuestionRows = questionnaireCard.querySelector('#newQuestionRows')
const addQuestionButton = questionnaireCard.querySelector('#addQuestion')
const reloadUsersButton = usersCard.querySelector('#reloadUsers')
const newUserName = usersCard.querySelector('#newUserName')
const newUserEmail = usersCard.querySelector('#newUserEmail')
const addUserButton = usersCard.querySelector('#addUser')
const usersBody = usersCard.querySelector('#usersBody')
const resetLinkBox = usersCard.querySelector('#resetLinkBox')
const reloadAuditButton = auditCard.querySelector('#reloadAudit')
const auditLimitSelect = auditCard.querySelector('#auditLimit')
const auditPrevButton = auditCard.querySelector('#auditPrev')
const auditNextButton = auditCard.querySelector('#auditNext')
const auditInfo = auditCard.querySelector('#auditInfo')
const auditBody = auditCard.querySelector('#auditBody')

tokenInput.value = ''

loginUserButton.addEventListener('click', () => handleLogin())
showSetPasswordButton.addEventListener('click', () => setAuthSection('set-password'))
showLoginButton.addEventListener('click', () => setAuthSection('login'))
setPasswordButton.addEventListener('click', () => handleSetPassword())
bootstrapButton.addEventListener('click', () => handleBootstrapLogin())
bootstrapCreateUser.addEventListener('click', () => handleBootstrapCreateUser())
header.querySelectorAll('.nav-button').forEach((button) => {
  button.addEventListener('click', () => {
    if (button.dataset.action === 'logout') {
      handleLogout()
      return
    }
    setPage(button.dataset.page)
  })
})
reloadButton.addEventListener('click', () => loadPins())
searchInput.addEventListener('input', (event) => {
  state.query = event.target.value.trim().toLowerCase()
  state.pageIndex = 1
  renderPins()
})
filterSelect.addEventListener('change', (event) => {
  state.filter = event.target.value
  state.pageIndex = 1
  renderPins()
})
sortSelect.addEventListener('change', (event) => {
  state.sort = event.target.value
  state.pageIndex = 1
  renderPins()
})

pageSizeSelect.addEventListener('change', (event) => {
  state.pageSize = Number(event.target.value || 25)
  state.pageIndex = 1
  renderPins()
})

prevPageButton.addEventListener('click', () => {
  state.pageIndex = Math.max(state.pageIndex - 1, 1)
  renderPins()
})

nextPageButton.addEventListener('click', () => {
  state.pageIndex += 1
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
    await loadTranslations()
    updateQuestionCreateForm()
    renderQuestions()
  } catch (error) {
    setStatus(error.message, true)
  }
})

reloadQuestionnaireButton.addEventListener('click', () => loadQuestionnaire())
saveQuestionnaireButton.addEventListener('click', () => saveQuestionnaire())
reloadUsersButton.addEventListener('click', () => loadUsers())
addUserButton.addEventListener('click', () => handleCreateUser())
reloadAuditButton.addEventListener('click', () => loadAuditLogs())
auditLimitSelect.addEventListener('change', (event) => {
  state.audit.limit = Number(event.target.value || 50)
  state.audit.offset = 0
  loadAuditLogs()
})
auditPrevButton.addEventListener('click', () => {
  state.audit.offset = Math.max(state.audit.offset - state.audit.limit, 0)
  loadAuditLogs()
})
auditNextButton.addEventListener('click', () => {
  state.audit.offset += state.audit.limit
  loadAuditLogs()
})

newQuestionType.addEventListener('change', () => updateQuestionCreateForm())

addQuestionButton.addEventListener('click', async () => {
  const key = newQuestionKey.value.trim()
  const type = newQuestionType.value
  if (!key) {
    setStatus('Question-Key fehlt', true)
    return
  }
  if (state.questions.some((question) => question.question_key === key)) {
    setStatus('Question-Key existiert bereits', true)
    return
  }
  const translationsByLang = collectNewQuestionTranslations(type)
  if (!translationsByLang) return

  const base = {
    question_key: key,
    type,
    required: newQuestionRequired.checked,
    sort: Number(newQuestionSort.value || 0),
    is_active: newQuestionActive.checked,
    config: {},
  }

  if (type === 'slider') {
    base.config = {
      min: Number(newQuestionMin.value || 0),
      max: Number(newQuestionMax.value || 1),
      step: Number(newQuestionStep.value || 0.01),
      default: Number(newQuestionDefault.value || 0.5),
      use_for_color: newQuestionUseForColor.checked,
    }
  }

  if (type === 'multi') {
    base.config = { allow_multiple: newQuestionAllowMultiple.checked }
  }

  if (type === 'text') {
    base.config = { rows: Number(newQuestionRows.value || 3) }
  }

  if (!base.sort) {
    const maxSort = Math.max(0, ...state.questions.map((question) => Number(question.sort || 0)))
    base.sort = maxSort + 10
  }

  state.questions.push(base)
  applyPendingTranslations(key, translationsByLang)
  resetNewQuestionForm()
  renderQuestions()
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

initAuthStatus()

async function loadPins() {
  setStatus('Lade Pins...', false)
  try {
    const rawPins = await fetchAdminPins({ token: state.token })
    state.pins = rawPins.map(normalizePin)
    state.error = ''
    renderPins()
    renderDashboard()
    setStatus(`Verbunden (${state.pins.length} Einträge)`, false)
  } catch (error) {
    state.error = error.message
    renderPins()
    renderDashboard()
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
    renderDashboard()
    setStatus('Fragebogen geladen', false)
  } catch (error) {
    setStatus(error.message, true)
  }
}

async function loadUsers() {
  try {
    const users = await fetchUsers({ token: state.token })
    state.users = users
    renderUsers()
  } catch (error) {
    setStatus(error.message, true)
  }
}

async function loadAuditLogs() {
  try {
    const result = await fetchAuditLogs({
      token: state.token,
      limit: state.audit.limit,
      offset: state.audit.offset,
    })
    state.audit.items = result.items || []
    state.audit.total = result.total || 0
    state.audit.limit = result.limit || state.audit.limit
    state.audit.offset = result.offset || state.audit.offset
    renderAuditLogs()
  } catch (error) {
    setStatus(error.message, true)
  }
}

async function loadLanguages() {
  const languages = await fetchLanguages({ token: state.token })
  state.languages = languages
  const activeLanguages = getActiveLanguages()
  const fallbackLanguage = activeLanguages[0]?.lang || languages[0]?.lang || 'de'
  if (!state.selectedLanguage || !activeLanguages.find((lang) => lang.lang === state.selectedLanguage)) {
    state.selectedLanguage = fallbackLanguage
  }
  languageSelectAdmin.innerHTML = ''
  state.languages.forEach((language) => {
    const option = document.createElement('option')
    option.value = language.lang
    option.textContent = `${language.label} (${language.lang})`
    languageSelectAdmin.appendChild(option)
  })
  languageSelectAdmin.value = state.selectedLanguage

  languageSelect.innerHTML = ''
  getActiveLanguages().forEach((language) => {
    const option = document.createElement('option')
    option.value = language.lang
    option.textContent = `${language.label} (${language.lang})`
    languageSelect.appendChild(option)
  })
  languageSelect.value = state.selectedLanguage
  renderDashboard()
}

async function loadQuestions() {
  state.questions = await fetchQuestions({ token: state.token })
}

async function loadOptions() {
  state.options = await fetchOptions({ token: state.token })
}

async function loadTranslations() {
  const activeLanguages = getActiveLanguages()
  const questionTranslationsByLang = {}
  await Promise.all(
    activeLanguages.map(async (language) => {
      questionTranslationsByLang[language.lang] = await fetchTranslations({
        lang: language.lang,
        prefix: 'questions.',
      })
    })
  )
  const optionTranslations = await fetchTranslations({
    lang: state.selectedLanguage,
    prefix: 'options.',
  })
  state.translations = {
    ...(questionTranslationsByLang[state.selectedLanguage] || {}),
    ...optionTranslations,
  }
  state.translationsByLang = questionTranslationsByLang
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
        await loadTranslations()
        renderLanguages()
        updateQuestionCreateForm()
        renderQuestions()
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

  const activeLanguages = getActiveLanguages()
  const optionsByQuestion = new Map()
  state.options.forEach((option) => {
    if (!optionsByQuestion.has(option.question_key)) {
      optionsByQuestion.set(option.question_key, [])
    }
    optionsByQuestion.get(option.question_key).push(option)
  })

  state.questions.forEach((question, index) => {
    const wrapper = document.createElement('details')
    wrapper.className = 'question-block'
    wrapper.dataset.key = question.question_key
    wrapper.dataset.type = question.type
    wrapper.draggable = true

    const header = document.createElement('summary')
    header.className = 'question-header'
    header.innerHTML = `
      <span class="drag-handle">⋮⋮</span>
      <div>
        <strong>${question.question_key}</strong>
        <span class="muted">(${question.type})</span>
      </div>
    `
    wrapper.appendChild(header)

    const body = document.createElement('div')
    body.className = 'question-body'
    wrapper.appendChild(body)

    const requiredToggle = createCheckbox(question.required)
    requiredToggle.dataset.field = 'required'
    const activeToggle = createCheckbox(question.is_active)
    activeToggle.dataset.field = 'is_active'
    const sortInput = createInput('number', String(question.sort ?? (index + 1) * 10))
    sortInput.dataset.field = 'sort'

    const controlsRow = document.createElement('div')
    controlsRow.className = 'question-row'
    controlsRow.appendChild(createLabeled('Required', requiredToggle))
    controlsRow.appendChild(createLabeled('Aktiv', activeToggle))
    controlsRow.appendChild(createLabeled('Sort', sortInput))
    body.appendChild(controlsRow)

    const translationRow = document.createElement('div')
    translationRow.className = 'question-row translations-row'
    activeLanguages.forEach((language) => {
      const group = document.createElement('div')
      group.className = 'translation-group'
      const title = document.createElement('div')
      title.className = 'translation-title'
      title.textContent = `${language.label} (${language.lang})`
      group.appendChild(title)

      const labelKey = `questions.${question.question_key}.label`
      const labelInput = createInput('text', getTranslationFor(language.lang, labelKey))
      labelInput.dataset.field = 'label'
      labelInput.dataset.lang = language.lang
      group.appendChild(createLabeled('Label', labelInput))

      if (question.type === 'slider') {
        const legendLowKey = `questions.${question.question_key}.legend_low`
        const legendHighKey = `questions.${question.question_key}.legend_high`
        const legendLowInput = createInput('text', getTranslationFor(language.lang, legendLowKey))
        legendLowInput.dataset.field = 'legend_low'
        legendLowInput.dataset.lang = language.lang
        const legendHighInput = createInput('text', getTranslationFor(language.lang, legendHighKey))
        legendHighInput.dataset.field = 'legend_high'
        legendHighInput.dataset.lang = language.lang
        group.appendChild(createLabeled('Legend low', legendLowInput))
        group.appendChild(createLabeled('Legend high', legendHighInput))
      }

      translationRow.appendChild(group)
    })
    body.appendChild(translationRow)

    const configRow = document.createElement('div')
    configRow.className = 'question-row'
    if (question.type === 'slider') {
      const minInput = createInput('number', String(question.config?.min ?? 0))
      minInput.dataset.field = 'min'
      const maxInput = createInput('number', String(question.config?.max ?? 1))
      maxInput.dataset.field = 'max'
      const stepInput = createInput('number', String(question.config?.step ?? 0.01))
      stepInput.dataset.field = 'step'
      const defaultInput = createInput('number', String(question.config?.default ?? 0.5))
      defaultInput.dataset.field = 'default'
      const useForColor = createCheckbox(Boolean(question.config?.use_for_color))
      useForColor.dataset.field = 'use_for_color'
      configRow.appendChild(createLabeled('Min', minInput))
      configRow.appendChild(createLabeled('Max', maxInput))
      configRow.appendChild(createLabeled('Step', stepInput))
      configRow.appendChild(createLabeled('Default', defaultInput))
      configRow.appendChild(createLabeled('Pin-Farbe', useForColor))
    } else if (question.type === 'text') {
      const rowsInput = createInput('number', String(question.config?.rows ?? 3))
      rowsInput.dataset.field = 'rows'
      configRow.appendChild(createLabeled('Rows', rowsInput))
    } else if (question.type === 'multi') {
      const allowMultiple = createCheckbox(Boolean(question.config?.allow_multiple))
      allowMultiple.dataset.field = 'allow_multiple'
      configRow.appendChild(createLabeled('Mehrfach', allowMultiple))
    }
    if (configRow.childElementCount) {
      body.appendChild(configRow)
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
            await deleteOption({
              token: state.token,
              question_key: question.question_key,
              option_key: option.option_key,
            })
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

      body.appendChild(optionWrap)
    }

    wrapper.addEventListener('dragstart', () => {
      wrapper.classList.add('is-dragging')
      state.draggingKey = question.question_key
    })
    wrapper.addEventListener('dragend', () => {
      wrapper.classList.remove('is-dragging')
      state.draggingKey = null
    })
    wrapper.addEventListener('dragover', (event) => {
      event.preventDefault()
      wrapper.classList.add('is-drop-target')
    })
    wrapper.addEventListener('dragleave', () => {
      wrapper.classList.remove('is-drop-target')
    })
    wrapper.addEventListener('drop', (event) => {
      event.preventDefault()
      wrapper.classList.remove('is-drop-target')
      if (!state.draggingKey || state.draggingKey === question.question_key) return
      reorderQuestions(state.draggingKey, question.question_key)
    })

    questionsBody.appendChild(wrapper)
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

async function saveQuestionnaire() {
  const activeLanguages = getActiveLanguages()
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
      if (!label) {
        setStatus(`Label fehlt (${language.lang}) für ${key}`, true)
        return
      }
      translationsByLang[language.lang] = { label }
      if (type === 'slider') {
        const legendLow = block.querySelector(
          `input[data-field="legend_low"][data-lang="${language.lang}"]`
        )?.value.trim()
        const legendHigh = block.querySelector(
          `input[data-field="legend_high"][data-lang="${language.lang}"]`
        )?.value.trim()
        if (!legendLow || !legendHigh) {
          setStatus(`Legenden fehlen (${language.lang}) für ${key}`, true)
          return
        }
        translationsByLang[language.lang].legend_low = legendLow
        translationsByLang[language.lang].legend_high = legendHigh
      }
    }

    const config = {}
    if (type === 'slider') {
      config.min = Number(block.querySelector('[data-field="min"]')?.value || 0)
      config.max = Number(block.querySelector('[data-field="max"]')?.value || 1)
      config.step = Number(block.querySelector('[data-field="step"]')?.value || 0.01)
      config.default = Number(block.querySelector('[data-field="default"]')?.value || 0.5)
      config.use_for_color = Boolean(block.querySelector('[data-field="use_for_color"]')?.checked)
    }
    if (type === 'text') {
      config.rows = Number(block.querySelector('[data-field="rows"]')?.value || 3)
    }
    if (type === 'multi') {
      config.allow_multiple = Boolean(block.querySelector('[data-field="allow_multiple"]')?.checked)
    }

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

  await runWithButtonFeedback(saveQuestionnaireButton, async () => {
    for (const payload of payloads) {
      await upsertQuestion({ token: state.token, question: payload.question })
      for (const [lang, translations] of Object.entries(payload.translationsByLang)) {
        await upsertTranslation({
          token: state.token,
          translation_key: `questions.${payload.question.question_key}.label`,
          lang,
          text: translations.label,
        })
        if (translations.legend_low) {
          await upsertTranslation({
            token: state.token,
            translation_key: `questions.${payload.question.question_key}.legend_low`,
            lang,
            text: translations.legend_low,
          })
        }
        if (translations.legend_high) {
          await upsertTranslation({
            token: state.token,
            translation_key: `questions.${payload.question.question_key}.legend_high`,
            lang,
            text: translations.legend_high,
          })
        }
      }
    }
    state.pendingTranslationsByLang = {}
    await loadQuestions()
    await loadTranslations()
    renderQuestions()
    renderDashboard()
    setStatus('Fragebogen gespeichert', false)
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

function getTranslationFor(lang, key) {
  return (
    state.pendingTranslationsByLang[lang]?.[key] ||
    state.translationsByLang[lang]?.[key] ||
    ''
  )
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
  renderNewQuestionTranslations(type)
}

function renderNewQuestionTranslations(type) {
  newQuestionTranslations.innerHTML = ''
  getActiveLanguages().forEach((language) => {
    const group = document.createElement('div')
    group.className = 'translation-group'
    const title = document.createElement('div')
    title.className = 'translation-title'
    title.textContent = `${language.label} (${language.lang})`
    group.appendChild(title)

    const labelInput = createInput('text', '')
    labelInput.dataset.lang = language.lang
    labelInput.dataset.field = 'label'
    group.appendChild(createLabeled('Label', labelInput))

    if (type === 'slider') {
      const legendLowInput = createInput('text', '')
      legendLowInput.dataset.lang = language.lang
      legendLowInput.dataset.field = 'legend_low'
      const legendHighInput = createInput('text', '')
      legendHighInput.dataset.lang = language.lang
      legendHighInput.dataset.field = 'legend_high'
      group.appendChild(createLabeled('Legend low', legendLowInput))
      group.appendChild(createLabeled('Legend high', legendHighInput))
    }

    newQuestionTranslations.appendChild(group)
  })
}

function collectNewQuestionTranslations(type) {
  const activeLanguages = getActiveLanguages()
  const translationsByLang = {}
  for (const language of activeLanguages) {
    const labelInput = newQuestionTranslations.querySelector(
      `input[data-lang="${language.lang}"][data-field="label"]`
    )
    const label = labelInput?.value.trim() || ''
    if (!label) {
      setStatus(`Label fehlt (${language.lang})`, true)
      return null
    }
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
      if (!legendLow || !legendHigh) {
        setStatus(`Legenden fehlen (${language.lang})`, true)
        return null
      }
      translationsByLang[language.lang].legend_low = legendLow
      translationsByLang[language.lang].legend_high = legendHigh
    }
  }
  return translationsByLang
}

function applyPendingTranslations(questionKey, translationsByLang) {
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

function resetNewQuestionForm() {
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
  newQuestionTranslations.querySelectorAll('input').forEach((input) => {
    input.value = ''
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
  const filteredPins = getFilteredPins()
  const total = filteredPins.length
  pinCount.textContent = String(total)

  const totalPages = Math.max(Math.ceil(total / state.pageSize), 1)
  if (state.pageIndex > totalPages) {
    state.pageIndex = totalPages
  }
  const start = (state.pageIndex - 1) * state.pageSize
  const pagePins = filteredPins.slice(start, start + state.pageSize)

  pageInfo.textContent = `Seite ${state.pageIndex} von ${totalPages}`
  prevPageButton.disabled = state.pageIndex <= 1
  nextPageButton.disabled = state.pageIndex >= totalPages

  if (!pagePins.length) {
    const row = document.createElement('tr')
    row.innerHTML = `<td colspan="9" class="empty">Keine Pins vorhanden</td>`
    pinsBody.appendChild(row)
    return
  }

  pagePins.forEach((pin) => {
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
      <td>${formatPercent(pin.wellbeing)}</td>
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

function renderUsers() {
  usersBody.innerHTML = ''
  if (!state.users.length) {
    usersBody.innerHTML = '<tr><td colspan="6" class="empty">Keine User vorhanden</td></tr>'
    renderResetLink()
    return
  }
  state.users.forEach((user) => {
    const row = document.createElement('tr')
    const status = user.must_set_password ? 'Reset nötig' : 'Aktiv'
    row.innerHTML = `
      <td>${user.id}</td>
      <td>${escapeHtml(user.name || '')}</td>
      <td>${escapeHtml(user.email || '')}</td>
      <td>${status}</td>
      <td>${user.last_login_at ? formatDate(user.last_login_at) : '-'}</td>
      <td><button class="ghost" data-action="reset" data-id="${user.id}">Reset</button></td>
    `
    usersBody.appendChild(row)
  })

  usersBody.querySelectorAll('button[data-action="reset"]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = Number(button.dataset.id)
      if (!id) return
      button.disabled = true
      try {
        const result = await resetUserPassword({ token: state.token, id })
        state.lastResetLink = buildResetLink(result.reset_token)
        renderResetLink()
        setStatus(`Reset-Link (24h) für User ${id} bereit`, false)
      } catch (error) {
        setStatus(error.message, true)
      } finally {
        button.disabled = false
      }
    })
  })
  renderResetLink()
}

function renderResetLink() {
  if (!state.lastResetLink) {
    resetLinkBox.innerHTML = ''
    return
  }
  resetLinkBox.innerHTML = `
    <div class="reset-link-box">
      <div class="muted">Letzter Reset-Link (24h)</div>
      <div class="reset-link-row">
        <input type="text" value="${state.lastResetLink}" readonly />
        <button id="copyResetLink" class="ghost">Kopieren</button>
      </div>
    </div>
  `
  const copyButton = resetLinkBox.querySelector('#copyResetLink')
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(state.lastResetLink)
      setStatus('Reset-Link kopiert', false)
    } catch (error) {
      setStatus('Kopieren fehlgeschlagen', true)
    }
  })
}

function renderAuditLogs() {
  auditBody.innerHTML = ''
  if (!state.audit.items.length) {
    auditBody.innerHTML = '<tr><td colspan="5" class="empty">Keine Einträge</td></tr>'
    auditInfo.textContent = '0'
    auditPrevButton.disabled = true
    auditNextButton.disabled = true
    return
  }
  state.audit.items.forEach((item) => {
    const row = document.createElement('tr')
    const payload = item.payload ? escapeHtml(JSON.stringify(item.payload)) : ''
    row.innerHTML = `
      <td>${formatDate(item.created_at)}</td>
      <td>${escapeHtml(item.user_email || '-') }</td>
      <td>${escapeHtml(item.action || '')}</td>
      <td>${escapeHtml(item.target || '')}</td>
      <td>${payload}</td>
    `
    auditBody.appendChild(row)
  })
  const start = state.audit.offset + 1
  const end = Math.min(state.audit.offset + state.audit.limit, state.audit.total)
  auditInfo.textContent = `${start}-${end} von ${state.audit.total}`
  auditPrevButton.disabled = state.audit.offset <= 0
  auditNextButton.disabled = state.audit.offset + state.audit.limit >= state.audit.total
}

function renderDashboard() {
  dashboardPinsTotal.textContent = String(state.pins.length)
  dashboardPinsPending.textContent = String(state.pins.filter((pin) => pin.approved === 0).length)
  dashboardPinsApproved.textContent = String(state.pins.filter((pin) => pin.approved === 1).length)
  dashboardPinsRejected.textContent = String(state.pins.filter((pin) => pin.approved === -1).length)
  dashboardQuestionsTotal.textContent = String(state.questions.length)
  dashboardLanguagesActive.textContent = String(getActiveLanguages().length)
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
  const email = loginEmail.value.trim()
  const password = loginPassword.value
  if (!email || !password) {
    setStatus('Bitte Email und Passwort angeben', true)
    return
  }
  try {
    const result = await loginUser({ email, password })
    state.token = result.token
    state.bootstrapMode = false
    localStorage.setItem('admin_jwt', state.token)
    state.loggedIn = true
    await loadPins()
    await loadQuestionnaire()
    await loadUsers()
    await loadAuditLogs()
    setPage('dashboard')
    startTokenRefresh()
  } catch (error) {
    setStatus(error.message, true)
  }
}

async function handleBootstrapLogin() {
  const adminToken = tokenInput.value.trim()
  if (!adminToken) {
    setStatus('Admin Token fehlt', true)
    return
  }
  try {
    const result = await loginWithToken({ admin_token: adminToken })
    state.token = result.token
    state.bootstrapMode = true
    localStorage.setItem('admin_jwt', state.token)
    state.loggedIn = true
    setPage('users')
    setStatus('Bootstrap aktiv: bitte ersten User erstellen', false)
  } catch (error) {
    setStatus(error.message, true)
  }
}

async function handleSetPassword() {
  const resetToken = resetTokenInput.value.trim()
  const password = resetPasswordInput.value
  if (!resetToken || !password) {
    setStatus('Reset-Token und Passwort fehlen', true)
    return
  }
  try {
    await setPassword({ reset_token: resetToken, password })
    resetTokenInput.value = ''
    resetPasswordInput.value = ''
    setStatus('Passwort gesetzt. Bitte einloggen.', false)
    const url = new URL(window.location.href)
    url.searchParams.delete('reset_token')
    window.history.replaceState({}, '', url.toString())
    setAuthSection('login')
  } catch (error) {
    setStatus(error.message, true)
  }
}

async function handleBootstrapCreateUser() {
  const name = bootstrapName.value.trim()
  const email = bootstrapEmail.value.trim()
  if (!name || !email) {
    setStatus('Name und Email fehlen', true)
    return
  }
  await runWithButtonFeedback(bootstrapCreateUser, async () => {
    const result = await createUser({ token: state.token, name, email })
    bootstrapName.value = ''
    bootstrapEmail.value = ''
    state.lastResetLink = buildResetLink(result.reset_token)
    openResetLink(state.lastResetLink)
    state.bootstrapMode = false
    state.loggedIn = false
    state.token = ''
    localStorage.removeItem('admin_jwt')
    setStatus(`User erstellt. Reset-Link (24h) bereit`, false)
    setAuthSection('set-password')
    applyVisibility()
  })
}

async function handleCreateUser() {
  const name = newUserName.value.trim()
  const email = newUserEmail.value.trim()
  if (!name || !email) {
    setStatus('Name und Email fehlen', true)
    return
  }
  await runWithButtonFeedback(addUserButton, async () => {
    const result = await createUser({ token: state.token, name, email })
    newUserName.value = ''
    newUserEmail.value = ''
    state.lastResetLink = buildResetLink(result.reset_token)
    openResetLink(state.lastResetLink)
    renderResetLink()
    await loadUsers()
    setStatus(`User erstellt. Reset-Link (24h) bereit`, false)
  })
}

async function handleLogout() {
  state.token = ''
  state.loggedIn = false
  state.bootstrapMode = false
  state.users = []
  state.lastResetLink = ''
  localStorage.removeItem('admin_jwt')
  stopTokenRefresh()
  setAuthSection(state.bootstrapRequired ? 'bootstrap' : 'login')
  applyVisibility()
}

function startTokenRefresh() {
  stopTokenRefresh()
  state.refreshTimer = setInterval(async () => {
    if (!state.token) return
    try {
      const result = await refreshToken({ token: state.token })
      state.token = result.token
      localStorage.setItem('admin_jwt', state.token)
    } catch (error) {
      handleLogout()
    }
  }, 30 * 60 * 1000)
}

function stopTokenRefresh() {
  if (state.refreshTimer) {
    clearInterval(state.refreshTimer)
    state.refreshTimer = null
  }
}

async function initAuthStatus() {
  try {
    const status = await fetchAuthStatus()
    state.bootstrapRequired = Boolean(status.bootstrap_required)
  } catch (error) {
    state.bootstrapRequired = false
  }

  const url = new URL(window.location.href)
  const resetToken = url.searchParams.get('reset_token')
  if (resetToken) {
    resetTokenInput.value = resetToken
    setAuthSection('set-password')
  }

  if (state.token) {
    try {
      await loadPins()
      state.loggedIn = true
      await loadQuestionnaire()
      await loadUsers()
      await loadAuditLogs()
      setPage('dashboard')
      startTokenRefresh()
      return
    } catch (error) {
      state.token = ''
      localStorage.removeItem('admin_jwt')
    }
  }

  state.loggedIn = false
  if (!resetToken) {
    setAuthSection(state.bootstrapRequired ? 'bootstrap' : 'login')
  }
  applyVisibility()
}

function setAuthSection(section) {
  const forceBootstrap = state.bootstrapRequired && !state.bootstrapMode
  loginCard.querySelectorAll('.auth-section').forEach((node) => {
    const isBootstrap = node.dataset.section === 'bootstrap'
    const isBootstrapUser = node.dataset.section === 'bootstrap-user'
    if (forceBootstrap) {
      node.style.display = isBootstrap ? 'block' : 'none'
      return
    }
    if (state.bootstrapMode && isBootstrapUser) {
      node.style.display = 'block'
      return
    }
    node.style.display = node.dataset.section === section ? 'block' : 'none'
  })
}

function applyVisibility() {
  loginCard.style.display = state.loggedIn ? 'none' : 'block'
  pages.style.display = state.loggedIn ? 'block' : 'none'
  const nav = header.querySelector('.nav')
  if (nav) {
    nav.style.display = state.loggedIn ? 'flex' : 'none'
  }
  header.querySelectorAll('.nav-button').forEach((button) => {
    const isActive = button.dataset.page === state.page
    button.classList.toggle('active', isActive)
  })
  dashboardCard.style.display = state.loggedIn && state.page === 'dashboard' ? 'block' : 'none'
  toolsCard.style.display = state.loggedIn && state.page === 'pins' ? 'block' : 'none'
  tableCard.style.display = state.loggedIn && state.page === 'pins' ? 'block' : 'none'
  languagesCard.style.display = state.loggedIn && state.page === 'questionnaire' ? 'block' : 'none'
  questionnaireCard.style.display = state.loggedIn && state.page === 'questionnaire' ? 'block' : 'none'
  usersCard.style.display = state.loggedIn && state.page === 'users' ? 'block' : 'none'
  auditCard.style.display = state.loggedIn && state.page === 'audit' ? 'block' : 'none'
}

function setPage(page) {
  if (state.bootstrapMode && page !== 'users') {
    state.page = 'users'
  } else {
    state.page = page
  }
  applyVisibility()
  if (state.page === 'dashboard') {
    renderDashboard()
  }
  if (state.page === 'users') {
    renderUsers()
  }
  if (state.page === 'audit') {
    loadAuditLogs()
  }
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

function getActiveLanguages() {
  return state.languages.filter((language) => language.enabled)
}

function reorderQuestions(dragKey, dropKey) {
  const items = [...state.questions]
  const fromIndex = items.findIndex((question) => question.question_key === dragKey)
  const toIndex = items.findIndex((question) => question.question_key === dropKey)
  if (fromIndex < 0 || toIndex < 0) return
  const [moved] = items.splice(fromIndex, 1)
  items.splice(toIndex, 0, moved)
  state.questions = items.map((question, index) => ({
    ...question,
    sort: (index + 1) * 10,
  }))
  renderQuestions()
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

function formatPercent(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '-'
  const formatted = numeric.toLocaleString('de-CH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  return `${formatted}%`
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function buildResetLink(resetToken) {
  if (!resetToken) return ''
  const url = new URL(window.location.href)
  url.searchParams.set('reset_token', resetToken)
  return url.toString()
}

function openResetLink(link) {
  if (!link) return
  const popup = window.open(link, '_blank', 'noopener')
  if (!popup) {
    setStatus('Popup blockiert. Bitte Reset-Link manuell öffnen.', true)
  }
}
