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
        <div class="muted">Letzter Reset-Link (24h)</div>
        <div class="reset-link-row">
          <input type="text" value="${state.lastResetLink}" readonly />
          <button id="copyResetLink" class="ghost">Kopieren</button>
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
      usersBody.innerHTML = '<tr><td colspan="6" class="empty">Keine User vorhanden</td></tr>'
      renderResetLink()
      return
    }
    state.users.forEach((user) => {
      const row = document.createElement('tr')
      const status = Number(user.must_set_password) === 1 ? 'Reset nötig' : 'Aktiv'
      row.innerHTML = `
        <td>${user.id}</td>
        <td>${escapeHtml(user.name || '')}</td>
        <td>${escapeHtml(user.email || '')}</td>
        <td>${status}</td>
        <td>${user.last_login_at ? formatDate(user.last_login_at) : '-'}</td>
        <td>
          <button class="ghost" data-action="edit" data-id="${user.id}">Bearbeiten</button>
          <button class="ghost" data-action="reset" data-id="${user.id}">Reset</button>
          <button class="danger" data-action="delete" data-id="${user.id}">Löschen</button>
        </td>
      `
      usersBody.appendChild(row)
    })
    renderResetLink()
  }

  return { renderUsers, renderResetLink }
}
