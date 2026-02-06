/**
 * Main entrypoint: builds views and initializes the app.
 * Exports: none.
 */
import './style.css'
import { createInitialState } from './state/state'
import { createLayout } from './ui/layout'
import { createHeader } from './ui/header'
import { createLoginCard } from './ui/loginCard'
import { createDashboardCard } from './ui/dashboard'
import { createPinsView } from './ui/pinsView'
import { createLanguagesView } from './ui/languagesView'
import { createQuestionnaireView } from './ui/questionnaireView'
import { createUsersView } from './ui/usersView'
import { createAuditView } from './ui/auditView'
import { createUserModal } from './ui/userModal'
import { createProfileModal } from './ui/profileModal'
import { initApp } from './app/app'

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

const usersView = createUsersView()
pages.appendChild(usersView.element)

const userModal = createUserModal()
document.body.appendChild(userModal.element)

const profileModal = createProfileModal()
document.body.appendChild(profileModal.element)

const auditView = createAuditView()
pages.appendChild(auditView.element)

app.appendChild(layout)

const views = {
  header,
  loginCard,
  dashboard,
  pinsView,
  languagesView,
  questionnaireView,
  usersView,
  auditView,
  userModal,
  profileModal,
  status,
  pages,
}

initApp({ state, views })
