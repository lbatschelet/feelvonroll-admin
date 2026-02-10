/**
 * Minimal client-side router using the History API.
 * Exports: createRouter.
 *
 * Single responsibility: URL ↔ page-key mapping and history management.
 * Knows nothing about views, state, or auth.
 */

const ROUTES = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/pins': 'pins',
  '/questionnaire': 'questionnaire',
  '/languages': 'languages',
  '/users': 'users',
  '/audit': 'audit',
  '/content': 'content',
}

const PUBLIC_PATHS = ['/reset', '/login']

export function createRouter() {
  let onChange = null

  const resolve = (pathname) => ROUTES[pathname] || null
  const isPublic = (pathname) => PUBLIC_PATHS.includes(pathname)
  const currentPath = () => window.location.pathname
  const currentPage = () => resolve(currentPath())

  const pathForPage = (page) => {
    const entry = Object.entries(ROUTES).find(([path, value]) => value === page && path !== '/')
    return entry ? entry[0] : null
  }

  const push = (page) => {
    const path = pathForPage(page)
    if (path && path !== currentPath()) {
      history.pushState(null, '', path)
    }
  }

  const replace = (page) => {
    const path = pathForPage(page)
    if (path) {
      history.replaceState(null, '', path)
    }
  }

  const listen = (callback) => {
    onChange = callback
    window.addEventListener('popstate', () => {
      const page = currentPage()
      if (page && onChange) onChange(page)
    })
  }

  return { resolve, isPublic, currentPath, currentPage, pathForPage, push, replace, listen }
}
