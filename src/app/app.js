/**
 * App bootstrapper wiring state, views, shell, and controllers.
 * Exports: initApp.
 */
import { createShell } from './shell'
import * as api from '../adminApi'
import { createAuthController } from '../controllers/authController'
import { createPinsController } from '../controllers/pinsController'
import { createQuestionnaireController } from '../controllers/questionnaireController'
import { createUsersController } from '../controllers/usersController'
import { createAuditController } from '../controllers/auditController'
import { createDashboardController } from '../controllers/dashboardController'

export function initApp({ state, views }) {
  const pageRegistry = {
    dashboard: [views.dashboard.element],
    pins: [views.pinsView.toolsCard, views.pinsView.tableCard],
    questionnaire: [views.languagesView.element, views.questionnaireView.element],
    users: [views.usersView.element],
    audit: [views.auditView.element],
  }

  const authApi = {
    fetchAuthStatus: api.fetchAuthStatus,
    loginWithToken: api.loginWithToken,
    loginUser: api.loginUser,
    setPassword: api.setPassword,
    refreshToken: api.refreshToken,
  }
  const pinsApi = {
    fetchAdminPins: api.fetchAdminPins,
    updatePinApprovalBulk: api.updatePinApprovalBulk,
    deletePins: api.deletePins,
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
    toggleLanguage: api.toggleLanguage,
    deleteLanguage: api.deleteLanguage,
  }
  const usersApi = {
    fetchUsers: api.fetchUsers,
    createUser: api.createUser,
    updateUser: api.updateUser,
    deleteUser: api.deleteUser,
    resetUserPassword: api.resetUserPassword,
  }
  const auditApi = { fetchAuditLogs: api.fetchAuditLogs }

  const dashboardController = createDashboardController({ state, views })
  const shell = createShell({ state, views, pageRegistry })
  const authController = createAuthController({ state, views, api: authApi, shell })
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
  const usersController = createUsersController({
    state,
    views,
    api: usersApi,
    shell,
    onLogout: authController.handleLogout,
  })
  const auditController = createAuditController({ state, views, api: auditApi, shell })

  const pageHandlers = {
    dashboard: dashboardController.renderDashboard,
    users: usersController.renderUsers,
    audit: auditController.loadAuditLogs,
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
  pinsController.bindEvents()
  questionnaireController.bindEvents()
  usersController.bindEvents()
  auditController.bindEvents()

  authController.init()
}
