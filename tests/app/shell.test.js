/**
 * @vitest-environment jsdom
 *
 * Shell role gating tests.
 */
import { describe, expect, it } from 'vitest'
import { createShell } from '../../src/app/shell'

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
    const state = {
      page: 'dashboard',
      loggedIn: true,
      bootstrapMode: false,
      bootstrapRequired: false,
      isAdmin: false,
    }
    const shell = createShell({ state, views, pageRegistry: { dashboard: [], users: [] } })

    shell.setPage('users')

    expect(state.page).toBe('dashboard')
  })
})
