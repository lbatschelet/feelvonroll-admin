/**
 * Users actions for CRUD and reset flows.
 * Exports: createUsersActions.
 */
import { runWithButtonFeedback } from '../../utils/buttonFeedback'
import { buildResetLink, copyResetLink } from '../../utils/resetLink'

export function createUsersActions({ state, views, api, shell, loader, renderer, modal, onLogout }) {
  const {
    modalUserFirstName,
    modalUserLastName,
    modalUserEmail,
    modalUserPassword,
    modalUserPasswordConfirm,
    modalUserIsAdmin,
    modalCreateUserButton,
  } = views.userModal

  const handleReset = async (button) => {
    const id = Number(button.dataset.id)
    if (!id) return
    button.disabled = true
    try {
      const result = await api.resetUserPassword({ token: state.token, id })
      state.lastResetLink = buildResetLink(result.reset_token)
      renderer.renderResetLink()
      await copyResetLink(state.lastResetLink)
      shell.setStatus(`Reset-Link für User ${id} kopiert`, false)
    } catch (error) {
      shell.setStatus(error.message, true)
    } finally {
      button.disabled = false
    }
  }

  const handleDelete = async (button) => {
    const id = Number(button.dataset.id)
    if (!id) return
    const confirmed = window.confirm('User wirklich löschen?')
    if (!confirmed) return
    button.disabled = true
    try {
      await api.deleteUser({ token: state.token, id })
      if (state.currentUserId === id) {
        await onLogout()
        return
      }
      await loader.loadUsers()
      renderer.renderUsers()
      shell.setStatus(`User ${id} gelöscht`, false)
    } catch (error) {
      shell.setStatus(error.message, true)
    } finally {
      button.disabled = false
    }
  }

  const handleCreateOrUpdate = async () => {
    const first_name = modalUserFirstName.value.trim()
    const last_name = modalUserLastName.value.trim()
    const email = modalUserEmail.value.trim()
    const is_admin = modalUserIsAdmin.checked
    if (!first_name || !email) {
      shell.setStatus('Vorname und Email fehlen', true)
      return
    }
    const password = modalUserPassword.value
    const passwordConfirm = modalUserPasswordConfirm.value
    const useReset = password.length === 0 && passwordConfirm.length === 0

    if (state.editingUserId) {
      try {
        await runWithButtonFeedback(modalCreateUserButton, async () => {
          await api.updateUser({
            token: state.token,
            id: state.editingUserId,
            first_name,
            last_name,
            email,
            is_admin,
          })
          modal.closeUserModal()
          await loader.loadUsers()
          renderer.renderUsers()
          shell.setStatus('User aktualisiert', false)
        })
      } catch (error) {
        shell.setStatus(error.message, true)
      }
      return
    }

    if (!useReset) {
      if (!password || password.length < 8) {
        shell.setStatus('Passwort muss mindestens 8 Zeichen haben', true)
        return
      }
      if (password !== passwordConfirm) {
        shell.setStatus('Passwörter stimmen nicht überein', true)
        return
      }
    }

    try {
      await runWithButtonFeedback(modalCreateUserButton, async () => {
        const result = await api.createUser({
          token: state.token,
          first_name,
          last_name,
          email,
          password: useReset ? '' : password,
          is_admin,
        })

        modalUserFirstName.value = ''
        modalUserLastName.value = ''
        modalUserEmail.value = ''
        modalUserPassword.value = ''
        modalUserPasswordConfirm.value = ''
        modalUserIsAdmin.checked = false
        modal.renderModalResetLink('')

        if (useReset && result.reset_token) {
          state.lastResetLink = buildResetLink(result.reset_token)
          renderer.renderResetLink()
          modal.renderModalResetLink(state.lastResetLink)
          await copyResetLink(state.lastResetLink)
        }

        modal.closeUserModal()

        if (state.bootstrapMode) {
          state.bootstrapMode = false
          state.bootstrapRequired = false
          state.loggedIn = false
          state.token = ''
          localStorage.removeItem('admin_jwt')
          shell.setStatus(
            useReset ? 'User erstellt. Reset-Link kopiert' : 'User erstellt. Passwort gesetzt',
            false
          )
          shell.setAuthSection('login')
          shell.applyVisibility()
          return
        }

        await loader.loadUsers()
        renderer.renderUsers()
        shell.setStatus(
          useReset ? 'User erstellt. Reset-Link kopiert' : 'User erstellt. Passwort gesetzt',
          false
        )
      })
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  return { handleReset, handleDelete, handleCreateOrUpdate }
}
