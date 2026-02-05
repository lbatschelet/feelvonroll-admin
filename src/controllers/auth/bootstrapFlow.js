/**
 * Bootstrap flow for initial admin login and user creation.
 * Exports: createBootstrapFlow.
 */
import { runWithButtonFeedback } from '../../utils/buttonFeedback'
import { buildResetLink, copyResetLink } from '../../utils/resetLink'

export function createBootstrapFlow({ state, api, shell, views }) {
  const { tokenInput, bootstrapName, bootstrapEmail, bootstrapCreateUser } = views.loginCard

  const handleBootstrapLogin = async () => {
    const adminToken = tokenInput.value.trim()
    if (!adminToken) {
      shell.setStatus('Admin Token fehlt', true)
      return
    }
    try {
      const result = await api.loginWithToken({ admin_token: adminToken })
      state.token = result.token
      state.bootstrapMode = true
      localStorage.setItem('admin_jwt', state.token)
      state.loggedIn = true
      shell.setPage('users')
      shell.setStatus('Bootstrap aktiv: bitte ersten User erstellen', false)
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  const handleBootstrapCreateUser = async () => {
    const name = bootstrapName.value.trim()
    const email = bootstrapEmail.value.trim()
    if (!name || !email) {
      shell.setStatus('Name und Email fehlen', true)
      return
    }
    try {
      await runWithButtonFeedback(bootstrapCreateUser, async () => {
        const result = await api.createUser({ token: state.token, name, email })
        bootstrapName.value = ''
        bootstrapEmail.value = ''
        state.lastResetLink = buildResetLink(result.reset_token)
        await copyResetLink(state.lastResetLink)
        state.bootstrapMode = false
        state.bootstrapRequired = false
        state.loggedIn = false
        state.token = ''
        localStorage.removeItem('admin_jwt')
        shell.setStatus(`User erstellt. Reset-Link kopiert`, false)
        shell.setAuthSection('login')
        shell.applyVisibility()
      })
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  return { handleBootstrapLogin, handleBootstrapCreateUser }
}
