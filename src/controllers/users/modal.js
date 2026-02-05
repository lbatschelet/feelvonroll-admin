/**
 * User modal controller for open/close and reset link rendering.
 * Exports: createUserModalController.
 */
import { copyResetLink } from '../../utils/resetLink'

export function createUserModalController({ state, views }) {
  const {
    modalTitle,
    modalCreateUserButton,
    modalUserName,
    modalUserEmail,
    modalUserPassword,
    modalUserPasswordConfirm,
    modalResetLink,
  } = views.userModal

  const openUserModal = () => {
    state.editingUserId = null
    modalTitle.textContent = 'User erstellen'
    modalCreateUserButton.textContent = 'User erstellen'
    modalUserName.value = ''
    modalUserEmail.value = ''
    modalUserPassword.value = ''
    modalUserPasswordConfirm.value = ''
    modalResetLink.innerHTML = ''
    views.userModal.element.classList.add('is-visible')
  }

  const openUserModalForEdit = (user) => {
    state.editingUserId = Number(user.id)
    modalTitle.textContent = 'User bearbeiten'
    modalCreateUserButton.textContent = 'Speichern'
    modalUserName.value = user.name || ''
    modalUserEmail.value = user.email || ''
    modalUserPassword.value = ''
    modalUserPasswordConfirm.value = ''
    modalResetLink.innerHTML = ''
    views.userModal.element.classList.add('is-visible')
  }

  const closeUserModal = () => {
    views.userModal.element.classList.remove('is-visible')
  }

  const renderModalResetLink = (link) => {
    if (!link) {
      modalResetLink.innerHTML = ''
      return
    }
    modalResetLink.innerHTML = `
      <div class="reset-link-box">
        <div class="muted">Reset-Link (24h)</div>
        <div class="reset-link-row">
          <input type="text" value="${link}" readonly />
          <button id="copyModalResetLink" class="ghost">Kopieren</button>
        </div>
      </div>
    `
    const copyButton = modalResetLink.querySelector('#copyModalResetLink')
    copyButton.addEventListener('click', async () => {
      await copyResetLink(link)
    })
  }

  return { openUserModal, openUserModalForEdit, closeUserModal, renderModalResetLink }
}
