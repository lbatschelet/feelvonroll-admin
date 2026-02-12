/**
 * App bootstrapper wiring state, views, shell, and controllers.
 * Exports: initApp.
 */
import { createShell } from './shell'
import { createRouter } from './router'
import * as api from '../adminApi'
import { createAuthController } from '../controllers/authController'
import { createPinsController } from '../controllers/pinsController'
import { createQuestionnaireController } from '../controllers/questionnaireController'
import { createLanguagesController } from '../controllers/languagesController'
import { createUsersController } from '../controllers/usersController'
import { createAuditController } from '../controllers/auditController'
import { createContentController } from '../controllers/contentController'
import { createDashboardController } from '../controllers/dashboardController'
import { createProfileController } from '../controllers/profileController'
import { createQuestionnairesController } from '../controllers/questionnairesController'
import { createStationsController } from '../controllers/stationsController'

export function initApp({ state, views }) {
  const pageRegistry = {
    dashboard: [views.dashboard.element],
    pins: [views.pinsView.toolsCard, views.pinsView.tableCard],
    questionnaire: [views.questionnaireView.element],
    questionnaires: [views.questionnairesView.element],
    stations: [views.stationsView.element],
    languages: [views.languagesView.element],
    users: [views.usersView.element],
    audit: [views.auditView.element],
    content: [views.contentView.element],
  }

  const authApi = {
    fetchAuthStatus: api.fetchAuthStatus,
    loginWithToken: api.loginWithToken,
    loginUser: api.loginUser,
    setPassword: api.setPassword,
    refreshToken: api.refreshToken,
    fetchSelf: api.fetchSelf,
  }
  const pinsApi = {
    fetchAdminPins: api.fetchAdminPins,
    updatePinApprovalBulk: api.updatePinApprovalBulk,
    deletePins: api.deletePins,
    exportPinsCsv: api.exportPinsCsv,
  }
  const questionnaireApi = {
    fetchLanguages: api.fetchLanguages,
    fetchQuestions: api.fetchQuestions,
    fetchOptions: api.fetchOptions,
    fetchTranslations: api.fetchTranslations,
    upsertQuestion: api.upsertQuestion,
    upsertTranslation: api.upsertTranslation,
    upsertOption: api.upsertOption,
    deleteOption: api.deleteOption,
  }
  const languagesApi = {
    fetchLanguages: api.fetchLanguages,
    upsertLanguage: api.upsertLanguage,
    toggleLanguage: api.toggleLanguage,
    deleteLanguage: api.deleteLanguage,
  }
  const usersApi = {
    fetchUsers: api.fetchUsers,
    createUser: api.createUser,
    createUserAndNotify: api.createUserAndNotify,
    updateUser: api.updateUser,
    updateSelf: api.updateSelf,
    deleteUser: api.deleteUser,
    resetUserPassword: api.resetUserPassword,
    resetUserPasswordAndNotify: api.resetUserPasswordAndNotify,
  }
  const auditApi = { fetchAuditLogs: api.fetchAuditLogs }
  const contentApi = {
    fetchContent: api.fetchContent,
    upsertContent: api.upsertContent,
    fetchLanguages: api.fetchLanguages,
  }
  const questionnairesApi = {
    fetchQuestionnaires: api.fetchQuestionnaires,
    upsertQuestionnaire: api.upsertQuestionnaire,
    deleteQuestionnaire: api.deleteQuestionnaire,
    saveQuestionnaireSlots: api.saveQuestionnaireSlots,
  }
  const stationsApi = {
    fetchStations: api.fetchStations,
    upsertStation: api.upsertStation,
    deleteStation: api.deleteStation,
  }

  const dashboardController = createDashboardController({ state, views })
  const router = createRouter()
  const shell = createShell({ state, views, pageRegistry, router })
  let profileController = null
  const authController = createAuthController({
    state,
    views,
    api: authApi,
    shell,
    router,
    onOpenProfile: () => profileController?.openProfileModal(),
  })
  profileController = createProfileController({
    state,
    views,
    api: usersApi,
    shell,
    onLogout: authController.handleLogout,
  })
  const pinsController = createPinsController({
    state,
    views,
    api: pinsApi,
    shell,
    renderDashboard: dashboardController.renderDashboard,
  })
  const questionnaireController = createQuestionnaireController({
    state,
    views,
    api: questionnaireApi,
    shell,
    renderDashboard: dashboardController.renderDashboard,
    renderPins: pinsController.renderPins,
  })
  const languagesController = createLanguagesController({
    state,
    views,
    api: languagesApi,
    shell,
    onLanguagesChanged: questionnaireController.loadQuestionnaire,
  })
  const usersController = createUsersController({
    state,
    views,
    api: usersApi,
    shell,
    onLogout: authController.handleLogout,
  })
  const auditController = createAuditController({ state, views, api: auditApi, shell })
  const contentController = createContentController({ state, views, api: contentApi, shell })
  const questionnairesController = createQuestionnairesController({
    state, views, api: questionnairesApi, shell,
    questionsApi: questionnaireApi,
  })
  const stationsController = createStationsController({
    state, views, api: stationsApi, questionnairesApi, shell,
  })

  shell.registerDirtyGuard(questionnaireController.getDirtyGuard())

  const pageHandlers = {
    dashboard: dashboardController.renderDashboard,
    users: usersController.renderUsers,
    audit: auditController.loadAuditLogs,
    languages: languagesController.loadLanguages,
    content: contentController.loadContent,
    questionnaires: questionnairesController.loadQuestionnaires,
    stations: stationsController.loadStations,
  }
  shell.setOnPageChange((page) => {
    const handler = pageHandlers[page]
    if (handler) {
      handler()
    }
    if (page === 'users') {
      usersController.onPageShow()
    }
  })

  authController.setLoaders({
    loadPins: pinsController.loadPins,
    loadQuestionnaire: questionnaireController.loadQuestionnaire,
    loadUsers: usersController.loadUsers,
    loadAuditLogs: auditController.loadAuditLogs,
  })

  authController.bindEvents()
  profileController.bindEvents()
  pinsController.bindEvents()
  questionnaireController.bindEvents()
  languagesController.bindEvents()
  usersController.bindEvents()
  auditController.bindEvents()
  contentController.bindEvents()
  questionnairesController.bindEvents()
  stationsController.bindEvents()

  authController.init()
}
