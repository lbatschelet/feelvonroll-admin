/**
 * Bootstrap flow for initial admin login.
 * After successful bootstrap login, navigates to users page where
 * the create-user modal opens automatically.
 * Exports: createBootstrapFlow.
 */

export function createBootstrapFlow({ state, api, shell }) {
  const handleBootstrapLogin = async () => {
    const tokenInput = document.querySelector('#adminToken')
    const adminToken = tokenInput ? tokenInput.value.trim() : ''
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
      shell.setStatus('Create the first admin user', false)
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  return { handleBootstrapLogin }
}
