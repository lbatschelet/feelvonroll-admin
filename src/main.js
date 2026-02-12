/**
 * Main entrypoint: routes to admin app or reset page based on pathname.
 * Exports: none.
 */
import './style.css'

const pathname = window.location.pathname

if (pathname === '/reset') {
  bootResetPage()
} else {
  bootAdminApp()
}

/**
 * Boots the lightweight reset page (no admin shell).
 */
async function bootResetPage() {
  const { createResetPage } = await import('./ui/resetPage')
  const { requestReset, setPassword, validateToken } = await import('./api/authApi')
  const { createResetRequestFlow } = await import('./controllers/reset/requestFlow')
  const { createResetPasswordFlow } = await import('./controllers/reset/passwordFlow')

  const app = document.querySelector('#app')
  const resetPage = createResetPage()
  app.appendChild(resetPage.element)

  const token = new URLSearchParams(window.location.search).get('token')
  if (token) {
    resetPage.requestSection.style.display = 'none'
    resetPage.setPasswordSection.style.display = ''

    /* Resolve email from token for display */
    validateToken({ reset_token: token })
      .then((result) => {
        if (result.email) {
          resetPage.emailHint.textContent = `Setting password for ${result.email}`
          resetPage.emailHint.style.display = ''
        }
      })
      .catch(() => {
        /* Token invalid/expired — passwordFlow will show the error on submit */
      })
  }

  const views = { resetPage }
  const api = { requestReset, setPassword }

  createResetRequestFlow({ api, views }).bindEvents()
  createResetPasswordFlow({ api, views }).bindEvents()

  app.style.visibility = 'visible'
}

/**
 * Boots the full admin application.
 */
async function bootAdminApp() {
  const { createInitialState } = await import('./state/state')
  const { createLayout } = await import('./ui/layout')
  const { createHeader } = await import('./ui/header')
  const { createLoginCard } = await import('./ui/loginCard')
  const { createDashboardCard } = await import('./ui/dashboard')
  const { createPinsView } = await import('./ui/pinsView')
  const { createLanguagesView } = await import('./ui/languagesView')
  const { createQuestionnaireView } = await import('./ui/questionnaireView')
  const { createQuestionnairesView } = await import('./ui/questionnairesView')
  const { createStationsView } = await import('./ui/stationsView')
  const { createUsersView } = await import('./ui/usersView')
  const { createAuditView } = await import('./ui/auditView')
  const { createContentView } = await import('./ui/contentView')
  const { createUserModal } = await import('./ui/userModal')
  const { createProfileModal } = await import('./ui/profileModal')
  const { createUnsavedDialog } = await import('./ui/unsavedDialog')
  const { createFooter } = await import('./ui/footer')
  const { initApp } = await import('./app/app')

  const app = document.querySelector('#app')
  const state = createInitialState()

  const { layout, status, pages } = createLayout()

  const header = createHeader()
  layout.appendChild(header.element)

  const loginCard = createLoginCard()
  layout.appendChild(loginCard.element)

  layout.appendChild(status)
  layout.appendChild(pages)

  const dashboard = createDashboardCard()
  pages.appendChild(dashboard.element)

  const pinsView = createPinsView()
  pages.appendChild(pinsView.toolsCard)
  pages.appendChild(pinsView.tableCard)

  const languagesView = createLanguagesView()
  pages.appendChild(languagesView.element)

  const questionnaireView = createQuestionnaireView()
  pages.appendChild(questionnaireView.element)

  const questionnairesView = createQuestionnairesView()
  pages.appendChild(questionnairesView.element)

  const stationsView = createStationsView()
  pages.appendChild(stationsView.element)

  const usersView = createUsersView()
  pages.appendChild(usersView.element)

  const userModal = createUserModal()
  document.body.appendChild(userModal.element)

  const profileModal = createProfileModal()
  document.body.appendChild(profileModal.element)

  const auditView = createAuditView()
  pages.appendChild(auditView.element)

  const contentView = createContentView()
  pages.appendChild(contentView.element)

  const unsavedDialog = createUnsavedDialog()
  document.body.appendChild(unsavedDialog.element)

  const footer = createFooter()
  layout.appendChild(footer.element)

  app.appendChild(layout)

  const views = {
    header,
    loginCard,
    dashboard,
    pinsView,
    languagesView,
    questionnaireView,
    questionnairesView,
    stationsView,
    usersView,
    auditView,
    contentView,
    userModal,
    profileModal,
    unsavedDialog,
    status,
    pages,
  }

  initApp({ state, views })
}
