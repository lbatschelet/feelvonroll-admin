/**
 * Auth controller orchestrates login, bootstrap, reset, and refresh flows.
 * Exports: createAuthController.
 */
import { createTokenRefresh } from './auth/tokenRefresh'
import { createBootstrapFlow } from './auth/bootstrapFlow'
import { createPasswordResetFlow } from './auth/passwordReset'
import { createAuthSession } from './auth/session'

export function createAuthController({ state, views, api, shell }) {
  const tokenRefresh = createTokenRefresh({
    state,
    api,
    onLogout: () => authSession.handleLogout(),
  })
  const bootstrapFlow = createBootstrapFlow({ state, api, shell, views })
  const passwordReset = createPasswordResetFlow({ api, shell, views })
  const authSession = createAuthSession({ state, api, shell, views, tokenRefresh })

  const bindEvents = () => {
    const {
      loginUserButton,
      showSetPasswordButton,
      showLoginButton,
      setPasswordButton,
      bootstrapButton,
      bootstrapCreateUser,
    } = views.loginCard

    loginUserButton.addEventListener('click', () => authSession.handleLogin())
    showSetPasswordButton.addEventListener('click', () => shell.setAuthSection('set-password'))
    showLoginButton.addEventListener('click', () => shell.setAuthSection('login'))
    setPasswordButton.addEventListener('click', () => passwordReset.handleSetPassword())
    bootstrapButton.addEventListener('click', () => bootstrapFlow.handleBootstrapLogin())
    bootstrapCreateUser.addEventListener('click', () => bootstrapFlow.handleBootstrapCreateUser())

    views.header.navButtons.forEach((button) => {
      button.addEventListener('click', () => {
        if (button.dataset.action === 'logout') {
          authSession.handleLogout()
          return
        }
        shell.setPage(button.dataset.page)
      })
    })
  }

  return {
    bindEvents,
    init: authSession.init,
    setLoaders: authSession.setLoaders,
    handleLogout: authSession.handleLogout,
  }
}
