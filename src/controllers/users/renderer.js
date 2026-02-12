/**
 * Users renderer for table display.
 * Exports: createUsersRenderer.
 */
import { escapeHtml, formatDate } from '../../utils/format'
import { icons } from '../../utils/dom'

const EXPIRY_OPTIONS = [
  { hours: 1, label: '1 hour', short: '1h' },
  { hours: 24, label: '24 hours', short: '24h' },
  { hours: 168, label: '7 days', short: '7d' },
  { hours: 720, label: '30 days', short: '30d' },
]

export function createUsersRenderer({ state, views, shell }) {
  const { usersBody } = views.usersView

  const renderUsers = () => {
    usersBody.innerHTML = ''
    if (!state.users.length) {
      usersBody.innerHTML = '<tr><td colspan="8" class="empty">No users found</td></tr>'
      return
    }
    state.users.forEach((user) => {
      const row = document.createElement('tr')
      const status = Number(user.must_set_password) === 1 ? 'Reset required' : 'Active'
      const role = Number(user.is_admin) === 1 ? 'Admin' : 'User'
      row.innerHTML = `
        <td>${user.id}</td>
        <td>${escapeHtml(user.first_name || '')}</td>
        <td>${escapeHtml(user.last_name || '')}</td>
        <td>${escapeHtml(user.email || '')}</td>
        <td>${role}</td>
        <td>${status}</td>
        <td>${user.last_login_at ? formatDate(user.last_login_at) : '-'}</td>
        <td class="actions-cell">
          <div class="reset-split" data-id="${user.id}">
            <button class="ghost" data-action="reset-email" data-id="${user.id}" title="Send password reset email">Reset</button>
            <button class="ghost reset-caret" data-action="reset-menu" data-id="${user.id}" title="Reset options">▾</button>
          </div>
          <button class="icon-btn-ghost" data-action="edit" data-id="${user.id}" title="Edit user details">${icons.pencil}</button>
          <button class="icon-btn danger" data-action="delete" data-id="${user.id}" title="Delete this user">${icons.trash}</button>
        </td>
      `
      usersBody.appendChild(row)
    })
  }

  return { renderUsers, EXPIRY_OPTIONS }
}
