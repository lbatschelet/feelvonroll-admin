/**
 * Auth session flow for login/logout and initial auth checks.
 * Exports: createAuthSession.
 */
export function createAuthSession({ state, api, shell, views, tokenRefresh, router }) {
  const { loginEmail, loginPassword, tokenInput } = views.loginCard
  let loaders = {
    loadPins: async () => {},
    loadQuestionnaire: async () => {},
    loadUsers: async () => {},
    loadAuditLogs: async () => {},
  }

  const setLoaders = (next) => {
    loaders = { ...loaders, ...next }
  }

  const revealApp = () => {
    document.querySelector('#app').style.visibility = 'visible'
  }

  const handleLogin = async () => {
    const email = loginEmail.value.trim()
    const password = loginPassword.value
    if (!email || !password) {
      shell.setStatus('Please enter email and password', true)
      return
    }
    try {
      const result = await api.loginUser({ email, password })
      state.token = result.token
      state.currentUserId = result.user?.id || null
      state.currentUser = result.user || null
      state.isAdmin = Boolean(result.user?.is_admin)
      shell.setUserDisplayName(result.user?.first_name || 'Profile')
      state.bootstrapMode = false
      localStorage.setItem('admin_jwt', state.token)
      state.loggedIn = true
      await loaders.loadPins()
      await loaders.loadQuestionnaire()
      if (state.isAdmin) {
        await loaders.loadUsers()
        await loaders.loadAuditLogs()
      }
      shell.setPage(router.currentPage() || 'dashboard')
      tokenRefresh.startTokenRefresh()
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  const handleLogout = async () => {
    state.token = ''
    state.loggedIn = false
    state.bootstrapMode = false
    state.users = []
    state.lastResetLink = ''
    state.currentUserId = null
    state.currentUser = null
    state.isAdmin = false
    shell.setUserDisplayName('Profile')
    localStorage.removeItem('admin_jwt')
    tokenRefresh.stopTokenRefresh()
    shell.setAuthSection(state.bootstrapRequired ? 'bootstrap' : 'login')
    router.replace('dashboard')
    shell.applyVisibility()
  }

  const initAuthStatus = async () => {
    try {
      const status = await api.fetchAuthStatus()
      state.bootstrapRequired = Boolean(status.bootstrap_required)
    } catch (error) {
      state.bootstrapRequired = false
    }

    if (state.bootstrapRequired) {
      state.token = ''
      localStorage.removeItem('admin_jwt')
      state.loggedIn = false
      shell.setAuthSection('bootstrap')
      shell.applyVisibility()
      revealApp()
      return
    }

    if (state.token) {
      try {
        if (api.fetchSelf) {
          const self = await api.fetchSelf({ token: state.token })
          state.currentUserId = self?.id || null
          state.currentUser = self || null
          state.isAdmin = Boolean(self?.is_admin)
          shell.setUserDisplayName(self?.first_name || 'Profile')
        }
        await loaders.loadPins()
        state.loggedIn = true
        await loaders.loadQuestionnaire()
        if (state.isAdmin) {
          await loaders.loadUsers()
          await loaders.loadAuditLogs()
        }
        shell.setPage(router.currentPage() || 'dashboard')
        tokenRefresh.startTokenRefresh()
        revealApp()
        return
      } catch (error) {
        state.token = ''
        localStorage.removeItem('admin_jwt')
      }
    }

    state.loggedIn = false
    shell.setAuthSection(state.bootstrapRequired ? 'bootstrap' : 'login')
    shell.applyVisibility()
    revealApp()
  }

  const init = () => {
    tokenInput.value = ''
    initAuthStatus()
  }

  return { setLoaders, handleLogin, handleLogout, init }
}
