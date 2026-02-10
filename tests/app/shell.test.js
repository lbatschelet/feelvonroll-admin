/**
 * @vitest-environment jsdom
 *
 * Shell role gating tests.
 */
import { describe, expect, it, vi } from 'vitest'
import { createShell } from '../../src/app/shell'

const buildRouter = () => ({
  push: vi.fn(),
  replace: vi.fn(),
  listen: vi.fn(),
  currentPage: vi.fn().mockReturnValue('dashboard'),
  currentPath: vi.fn().mockReturnValue('/dashboard'),
  resolve: vi.fn(),
  isPublic: vi.fn(),
  pathForPage: vi.fn(),
})

const buildViews = () => {
  const headerNav = document.createElement('nav')
  const usersButton = document.createElement('button')
  usersButton.dataset.page = 'users'
  usersButton.dataset.adminOnly = 'true'
  const dashboardButton = document.createElement('button')
  dashboardButton.dataset.page = 'dashboard'
  const userMenuButton = document.createElement('button')
  const userMenuPanel = document.createElement('div')
  return {
    header: {
      nav: headerNav,
      navButtons: [dashboardButton, usersButton],
      userMenuButton,
      userMenuPanel,
    },
    loginCard: { element: document.createElement('section') },
    pages: document.createElement('div'),
    status: document.createElement('div'),
  }
}

describe('shell', () => {
  it('redirects non-admin away from users page', () => {
    const views = buildViews()
    const router = buildRouter()
    const state = {
      page: 'dashboard',
      loggedIn: true,
      bootstrapMode: false,
      bootstrapRequired: false,
      isAdmin: false,
    }
    const shell = createShell({ state, views, pageRegistry: { dashboard: [], users: [] }, router })

    shell.setPage('users')

    expect(state.page).toBe('dashboard')
  })

  it('calls router.push when navigating', () => {
    const views = buildViews()
    const router = buildRouter()
    const state = {
      page: 'dashboard',
      loggedIn: true,
      bootstrapMode: false,
      bootstrapRequired: false,
      isAdmin: true,
    }
    const shell = createShell({ state, views, pageRegistry: { dashboard: [], users: [] }, router })

    shell.setPage('users')

    expect(router.push).toHaveBeenCalledWith('users')
    expect(state.page).toBe('users')
  })

  it('registers popstate listener via router.listen', () => {
    const views = buildViews()
    const router = buildRouter()
    const state = {
      page: 'dashboard',
      loggedIn: true,
      bootstrapMode: false,
      bootstrapRequired: false,
      isAdmin: true,
    }
    createShell({ state, views, pageRegistry: { dashboard: [], users: [] }, router })

    expect(router.listen).toHaveBeenCalledTimes(1)
  })
})
