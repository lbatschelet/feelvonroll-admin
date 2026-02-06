/**
 * User modal controller for open/close and reset link rendering.
 * Exports: createUserModalController.
 */
import { copyResetLink } from '../../utils/resetLink'

export function createUserModalController({ state, views }) {
  const {
    modalTitle,
    modalCreateUserButton,
    modalUserFirstName,
    modalUserLastName,
    modalUserEmail,
    modalUserPassword,
    modalUserPasswordConfirm,
    modalUserIsAdmin,
    modalResetLink,
  } = views.userModal

  const openUserModal = () => {
    state.editingUserId = null
    modalTitle.textContent = 'Create user'
    modalCreateUserButton.textContent = 'Create user'
    modalUserFirstName.value = ''
    modalUserLastName.value = ''
    modalUserEmail.value = ''
    modalUserPassword.value = ''
    modalUserPasswordConfirm.value = ''
    modalUserIsAdmin.checked = false
    modalResetLink.innerHTML = ''
    views.userModal.element.classList.add('is-visible')
  }

  const openUserModalForEdit = (user) => {
    state.editingUserId = Number(user.id)
    modalTitle.textContent = 'Edit user'
    modalCreateUserButton.textContent = 'Save'
    modalUserFirstName.value = user.first_name || ''
    modalUserLastName.value = user.last_name || ''
    modalUserEmail.value = user.email || ''
    modalUserPassword.value = ''
    modalUserPasswordConfirm.value = ''
    modalUserIsAdmin.checked = Boolean(user.is_admin)
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
        <div class="muted">Reset link (24h)</div>
        <div class="reset-link-row">
          <input type="text" value="${link}" readonly />
          <button id="copyModalResetLink" class="ghost">Copy</button>
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
