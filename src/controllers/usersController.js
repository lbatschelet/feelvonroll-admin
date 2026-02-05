/**
 * Users controller orchestrates loader, renderer, modal, and actions.
 * Exports: createUsersController.
 */
import { createUsersLoader } from './users/loader'
import { createUsersRenderer } from './users/renderer'
import { createUserModalController } from './users/modal'
import { createUsersActions } from './users/actions'

export function createUsersController({ state, views, api, shell, onLogout }) {
  const loader = createUsersLoader({ state, api })
  const renderer = createUsersRenderer({ state, views, shell })
  const modal = createUserModalController({ state, views })
  const actions = createUsersActions({ state, views, api, shell, loader, renderer, modal, onLogout })

  const loadUsers = async () => {
    try {
      await loader.loadUsers()
      renderer.renderUsers()
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  const bindEvents = () => {
    const { reloadUsersButton, addUserButton, usersBody } = views.usersView
    const { modalCloseButton, modalCancelButton, modalCreateUserButton } = views.userModal

    reloadUsersButton.addEventListener('click', () => loadUsers())
    addUserButton.addEventListener('click', () => modal.openUserModal())
    modalCloseButton.addEventListener('click', () => modal.closeUserModal())
    modalCancelButton.addEventListener('click', () => modal.closeUserModal())
    modalCreateUserButton.addEventListener('click', () => actions.handleCreateOrUpdate())

    usersBody.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]')
      if (!button) return
      if (button.dataset.action === 'edit') {
        const id = Number(button.dataset.id)
        const user = state.users.find((item) => Number(item.id) === id)
        if (!user) return
        modal.openUserModalForEdit(user)
      }
      if (button.dataset.action === 'reset') {
        actions.handleReset(button)
      }
      if (button.dataset.action === 'delete') {
        actions.handleDelete(button)
      }
    })
  }

  return { bindEvents, loadUsers, renderUsers: renderer.renderUsers }
}
