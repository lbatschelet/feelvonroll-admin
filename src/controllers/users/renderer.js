/**
 * Users renderer for table and reset-link display.
 * Exports: createUsersRenderer.
 */
import { escapeHtml, formatDate } from '../../utils/format'
import { copyResetLink } from '../../utils/resetLink'

export function createUsersRenderer({ state, views, shell }) {
  const { usersBody, resetLinkBox } = views.usersView

  const renderResetLink = () => {
    if (!state.lastResetLink) {
      resetLinkBox.innerHTML = ''
      return
    }
    resetLinkBox.innerHTML = `
      <div class="reset-link-box">
        <div class="muted">Latest reset link (24h)</div>
        <div class="reset-link-row">
          <input type="text" value="${state.lastResetLink}" readonly />
          <button id="copyResetLink" class="ghost" title="Copy reset link to clipboard">Copy</button>
        </div>
      </div>
    `
    const copyButton = resetLinkBox.querySelector('#copyResetLink')
    copyButton.addEventListener('click', async () => {
      await copyResetLink(state.lastResetLink)
    })
  }

  const renderUsers = () => {
    usersBody.innerHTML = ''
    if (!state.users.length) {
      usersBody.innerHTML = '<tr><td colspan="8" class="empty">No users found</td></tr>'
      renderResetLink()
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
        <td>
          <button class="ghost" data-action="edit" data-id="${user.id}" title="Edit user details">Edit</button>
          <button class="ghost" data-action="reset" data-id="${user.id}" title="Generate password reset link">Reset</button>
          <button class="danger" data-action="delete" data-id="${user.id}" title="Delete this user">Delete</button>
        </td>
      `
      usersBody.appendChild(row)
    })
    renderResetLink()
  }

  return { renderUsers, renderResetLink }
}
