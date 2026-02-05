/**
 * Token refresh helper for JWT session upkeep.
 * Exports: createTokenRefresh.
 */
export function createTokenRefresh({
  state,
  api,
  onLogout,
  storage = localStorage,
  setIntervalFn = setInterval,
  clearIntervalFn = clearInterval,
}) {
  const startTokenRefresh = () => {
    stopTokenRefresh()
    state.refreshTimer = setIntervalFn(async () => {
      if (!state.token) return
      try {
        const result = await api.refreshToken({ token: state.token })
        state.token = result.token
        storage.setItem('admin_jwt', state.token)
      } catch (error) {
        onLogout()
      }
    }, 30 * 60 * 1000)
  }

  const stopTokenRefresh = () => {
    if (state.refreshTimer) {
      clearIntervalFn(state.refreshTimer)
      state.refreshTimer = null
    }
  }

  return { startTokenRefresh, stopTokenRefresh }
}
