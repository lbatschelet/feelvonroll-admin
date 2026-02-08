/**
 * App bootstrapper wiring state, views, shell, and controllers.
 * Exports: initApp.
 */
import { createShell } from './shell'
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

export function initApp({ state, views }) {
  const pageRegistry = {
    dashboard: [views.dashboard.element],
    pins: [views.pinsView.toolsCard, views.pinsView.tableCard],
    questionnaire: [views.questionnaireView.element],
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
    updateUser: api.updateUser,
    updateSelf: api.updateSelf,
    deleteUser: api.deleteUser,
    resetUserPassword: api.resetUserPassword,
  }
  const auditApi = { fetchAuditLogs: api.fetchAuditLogs }
  const contentApi = {
    fetchContent: api.fetchContent,
    upsertContent: api.upsertContent,
    fetchLanguages: api.fetchLanguages,
  }

  const dashboardController = createDashboardController({ state, views })
  const shell = createShell({ state, views, pageRegistry })
  let profileController = null
  const authController = createAuthController({
    state,
    views,
    api: authApi,
    shell,
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

  shell.registerDirtyGuard(questionnaireController.getDirtyGuard())

  const pageHandlers = {
    dashboard: dashboardController.renderDashboard,
    users: usersController.renderUsers,
    audit: auditController.loadAuditLogs,
    languages: languagesController.loadLanguages,
    content: contentController.loadContent,
  }
  shell.setOnPageChange((page) => {
    const handler = pageHandlers[page]
    if (handler) {
      handler()
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

  authController.init()
}
