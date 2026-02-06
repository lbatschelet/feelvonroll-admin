/**
 * App shell controls navigation, page visibility, and status banner.
 * Exports: createShell.
 */
export function createShell({ state, views, pageRegistry = null, onPageChange = null }) {
  const { header, loginCard, pages } = views
  const registry = pageRegistry || {}
  let handlePageChange = onPageChange

  const setPage = (page) => {
    if (state.bootstrapMode && page !== 'users') {
      state.page = 'users'
    } else if (!state.isAdmin && (page === 'users' || page === 'audit')) {
      state.page = 'dashboard'
    } else {
      state.page = page
    }
    applyVisibility()
    if (handlePageChange) {
      handlePageChange(state.page)
    }
  }

  const setStatus = (message, isError) => {
    if (!message) {
      views.status.textContent = ''
      views.status.classList.remove('error')
      return
    }
    views.status.textContent = message
    views.status.classList.toggle('error', Boolean(isError))
  }

  const applyVisibility = () => {
    loginCard.element.style.display = state.loggedIn ? 'none' : 'block'
    pages.style.display = state.loggedIn ? 'block' : 'none'
    if (header.nav) {
      header.nav.style.display = state.loggedIn ? 'flex' : 'none'
    }
    if (header.userMenuButton) {
      header.userMenuButton.style.display = state.loggedIn ? 'inline-flex' : 'none'
    }
    if (!state.loggedIn && header.userMenuPanel) {
      header.userMenuPanel.classList.remove('is-open')
    }
    header.navButtons.forEach((button) => {
      const isActive = button.dataset.page === state.page
      button.classList.toggle('active', isActive)
      if (button.dataset.adminOnly) {
        button.style.display = state.isAdmin ? 'inline-flex' : 'none'
      }
    })
    const allPageElements = Object.values(registry).flat()
    allPageElements.forEach((element) => {
      element.style.display = 'none'
    })
    if (state.loggedIn) {
      const activeElements = registry[state.page] || []
      activeElements.forEach((element) => {
        element.style.display = 'block'
      })
    }
  }

  const setAuthSection = (section) => {
    const forceBootstrap = state.bootstrapRequired && !state.bootstrapMode
    loginCard.element.querySelectorAll('.auth-section').forEach((node) => {
      const isBootstrap = node.dataset.section === 'bootstrap'
      const isBootstrapUser = node.dataset.section === 'bootstrap-user'
      if (forceBootstrap) {
        node.style.display = isBootstrap ? 'block' : 'none'
        return
      }
      if (state.bootstrapMode && isBootstrapUser) {
        node.style.display = 'block'
        return
      }
      node.style.display = node.dataset.section === section ? 'block' : 'none'
    })
  }

  const setOnPageChange = (next) => {
    handlePageChange = next
  }

  const setUserDisplayName = (name) => {
    if (!header.userMenuButton) return
    header.userMenuButton.textContent = name || 'Profil'
  }

  return { setPage, applyVisibility, setStatus, setAuthSection, setOnPageChange, setUserDisplayName }
}
