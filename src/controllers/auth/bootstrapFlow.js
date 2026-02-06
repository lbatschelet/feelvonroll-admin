/**
 * Bootstrap flow for initial admin login and user creation.
 * Exports: createBootstrapFlow.
 */
import { runWithButtonFeedback } from '../../utils/buttonFeedback'
import { buildResetLink, copyResetLink } from '../../utils/resetLink'

export function createBootstrapFlow({ state, api, shell, views }) {
  const { tokenInput, bootstrapFirstName, bootstrapLastName, bootstrapEmail, bootstrapCreateUser } =
    views.loginCard

  const handleBootstrapLogin = async () => {
    const adminToken = tokenInput.value.trim()
    if (!adminToken) {
      shell.setStatus('Admin token is required', true)
      return
    }
    try {
      const result = await api.loginWithToken({ admin_token: adminToken })
      state.token = result.token
      state.bootstrapMode = true
      localStorage.setItem('admin_jwt', state.token)
      state.loggedIn = true
      shell.setPage('users')
      shell.setStatus('Bootstrap active: create the first user', false)
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  const handleBootstrapCreateUser = async () => {
    const first_name = bootstrapFirstName.value.trim()
    const last_name = bootstrapLastName.value.trim()
    const email = bootstrapEmail.value.trim()
    if (!first_name || !email) {
      shell.setStatus('First name and email are required', true)
      return
    }
    try {
      await runWithButtonFeedback(bootstrapCreateUser, async () => {
        const result = await api.createUser({ token: state.token, first_name, last_name, email, is_admin: true })
        bootstrapFirstName.value = ''
        bootstrapLastName.value = ''
        bootstrapEmail.value = ''
        state.lastResetLink = buildResetLink(result.reset_token)
        await copyResetLink(state.lastResetLink)
        state.bootstrapMode = false
        state.bootstrapRequired = false
        state.loggedIn = false
        state.token = ''
        localStorage.removeItem('admin_jwt')
        shell.setStatus(`User created. Reset link copied`, false)
        shell.setAuthSection('login')
        shell.applyVisibility()
      })
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  return { handleBootstrapLogin, handleBootstrapCreateUser }
}
