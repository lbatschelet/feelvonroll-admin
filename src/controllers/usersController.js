/**
 * Users controller orchestrates loader, renderer, modal, and actions.
 * Exports: createUsersController.
 */
import { createUsersLoader } from './users/loader'
import { createUsersRenderer } from './users/renderer'
import { createUserModalController } from './users/modal'
import { createUsersActions } from './users/actions'
import { createResetDropdown } from './users/resetDropdown'

export function createUsersController({ state, views, api, shell, onLogout }) {
  const loader = createUsersLoader({ state, api })
  const renderer = createUsersRenderer({ state, views, shell })
  const modal = createUserModalController({ state, views })
  const resetDropdown = createResetDropdown()
  const actions = createUsersActions({ state, views, api, shell, loader, renderer, modal, onLogout, resetDropdown })

  resetDropdown.setCallbacks({
    onCopyLink: (userId) => actions.handleCopyLink(userId),
  })

  const loadUsers = async () => {
    try {
      await loader.loadUsers()
      renderer.renderUsers()
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  const bindEvents = () => {
    const { addUserButton, usersBody } = views.usersView
    const { modalCloseButton, modalCancelButton, modalCreateUserButton, modalDone } = views.userModal

    modal.bindModalEvents()

    addUserButton.addEventListener('click', () => modal.openUserModal())
    modalCloseButton.addEventListener('click', () => modal.closeUserModal())
    modalCancelButton.addEventListener('click', () => modal.closeUserModal())
    modalCreateUserButton.addEventListener('click', () => actions.handleCreateOrUpdate())
    modalDone.addEventListener('click', () => modal.closeUserModal())

    usersBody.addEventListener('click', (event) => {
      /* Edit button (from actionCell: data-edit="id") */
      const editBtn = event.target.closest('button[data-edit]')
      if (editBtn) {
        const id = Number(editBtn.dataset.edit)
        const user = state.users.find((item) => Number(item.id) === id)
        if (user) modal.openUserModalForEdit(user)
        return
      }

      /* Delete button (from actionCell: data-delete="id") */
      const deleteBtn = event.target.closest('button[data-delete]')
      if (deleteBtn) {
        actions.handleDelete(deleteBtn)
        return
      }

      /* Reset split buttons (custom: data-action) */
      const actionBtn = event.target.closest('button[data-action]')
      if (!actionBtn) return

      if (actionBtn.dataset.action === 'reset-email') {
        actions.handleResetEmail(actionBtn)
      }

      if (actionBtn.dataset.action === 'reset-menu') {
        event.stopPropagation()
        const userId = Number(actionBtn.dataset.id)
        if (resetDropdown.isOpen()) {
          resetDropdown.close()
        } else {
          resetDropdown.open(actionBtn, userId)
        }
      }
    })
  }

  /** Auto-open create modal in bootstrap mode */
  const onPageShow = () => {
    if (state.bootstrapMode) {
      modal.openUserModal()
    }
  }

  return { bindEvents, loadUsers, renderUsers: renderer.renderUsers, onPageShow }
}
