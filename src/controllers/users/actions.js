/**
 * Users actions for CRUD and reset flows.
 * Exports: createUsersActions.
 */
import { runWithButtonFeedback } from '../../utils/buttonFeedback'
import { buildResetLink, copyResetLink } from '../../utils/resetLink'

export function createUsersActions({ state, views, api, shell, loader, renderer, modal, onLogout, resetDropdown }) {
  const {
    modalUserFirstName,
    modalUserLastName,
    modalUserEmail,
    modalUserPassword,
    modalUserPasswordConfirm,
    modalUserIsAdmin,
    modalCreateUserButton,
  } = views.userModal

  /* ── Reset: send email (default action) ── */

  const handleResetEmail = async (button) => {
    const id = Number(button.dataset.id)
    if (!id) return
    const expiryHours = resetDropdown.getSelectedHours(id)
    button.disabled = true
    const originalText = button.textContent
    button.textContent = 'Sending...'
    try {
      const result = await api.resetUserPasswordAndNotify({ token: state.token, id, expiry_hours: expiryHours })
      const link = buildResetLink(result.reset_token)
      state.lastResetLink = link
      await copyResetLink(link)

      if (result.email_sent) {
        /* Success: just show checkmark on button, no popup */
        button.textContent = '✓ Reset link sent'
        button.disabled = true
        setTimeout(() => {
          button.textContent = originalText
          button.disabled = false
        }, 3000)
        return
      }

      /* Email failed: show popup with link as fallback */
      button.textContent = originalText
      button.disabled = false
      modal.showResetResult({
        link,
        expiryHours,
        message: 'Email could not be sent. Use the link below instead.',
        isError: true,
      })
    } catch (error) {
      button.textContent = originalText
      button.disabled = false
      shell.setStatus(error.message, true)
    }
  }

  /* ── Reset: copy link (fallback from dropdown) ── */

  const handleCopyLink = async (userId) => {
    const expiryHours = resetDropdown.getSelectedHours(userId)
    try {
      const result = await api.resetUserPassword({ token: state.token, id: userId, expiry_hours: expiryHours })
      const link = buildResetLink(result.reset_token)
      state.lastResetLink = link
      await copyResetLink(link)
      modal.showResetResult({
        link,
        expiryHours,
        message: 'Reset link generated and copied to clipboard.',
      })
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  /* ── Delete ── */

  const handleDelete = async (button) => {
    const id = Number(button.dataset.delete || button.dataset.id)
    if (!id) return
    const confirmed = window.confirm('Delete this user?')
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
      shell.setStatus(`User ${id} deleted`, false)
    } catch (error) {
      shell.setStatus(error.message, true)
    } finally {
      button.disabled = false
    }
  }

  /* ── Create / Update via modal ── */

  const handleCreateOrUpdate = async () => {
    const first_name = modalUserFirstName.value.trim()
    const last_name = modalUserLastName.value.trim()
    const email = modalUserEmail.value.trim()
    const is_admin = modalUserIsAdmin.checked
    if (!first_name || !email) {
      shell.setStatus('First name and email are required', true)
      return
    }
    const password = modalUserPassword.value
    const passwordConfirm = modalUserPasswordConfirm.value
    const useReset = password.length === 0 && passwordConfirm.length === 0

    /* ── Edit mode ── */

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
          shell.setStatus('User updated', false)
        })
      } catch (error) {
        shell.setStatus(error.message, true)
      }
      return
    }

    /* ── Create mode: password validation ── */

    if (!useReset) {
      if (!password || password.length < 8) {
        shell.setStatus('Password must be at least 8 characters', true)
        return
      }
      if (password !== passwordConfirm) {
        shell.setStatus('Passwords do not match', true)
        return
      }
    }

    const expiryHours = modal.getSelectedExpiryHours()

    const bootstrapCleanup = () => {
      if (!state.bootstrapMode) return
      state.bootstrapMode = false
      state.bootstrapRequired = false
      state.loggedIn = false
      state.token = ''
      localStorage.removeItem('admin_jwt')
      shell.setAuthSection('login')
      shell.applyVisibility()
    }

    try {
      await runWithButtonFeedback(modalCreateUserButton, async () => {
        /* ── Created without password → send email, link as fallback ── */

        if (useReset) {
          const result = await api.createUserAndNotify({
            token: state.token,
            first_name,
            last_name,
            email,
            password: '',
            is_admin,
            expiry_hours: expiryHours,
          })

          if (result.email_sent) {
            modal.closeUserModal()
            shell.setStatus('User created. Password link sent by email.', false)
            if (state.bootstrapMode) {
              bootstrapCleanup()
            } else {
              await loader.loadUsers()
              renderer.renderUsers()
            }
            return
          }

          /* Email failed → show link as fallback */
          if (result.reset_token) {
            const link = buildResetLink(result.reset_token)
            state.lastResetLink = link
            await copyResetLink(link)

            modal.showResult({
              link,
              expiryHours,
              message: 'Email could not be sent. Use the link below instead.',
              isError: true,
              onDismiss: () => {
                if (state.bootstrapMode) {
                  shell.setStatus('User created. Reset link copied.', false)
                  bootstrapCleanup()
                } else {
                  shell.setStatus('User created. Reset link copied.', false)
                  loader.loadUsers().then(() => renderer.renderUsers())
                }
              },
            })
            return
          }
        }

        /* ── Created with password → close modal ── */

        const result = await api.createUser({
          token: state.token,
          first_name,
          last_name,
          email,
          password,
          is_admin,
        })

        modal.closeUserModal()

        if (state.bootstrapMode) {
          shell.setStatus('User created. Password set.', false)
          bootstrapCleanup()
          return
        }

        await loader.loadUsers()
        renderer.renderUsers()
        shell.setStatus('User created. Password set.', false)
      })
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  return { handleResetEmail, handleCopyLink, handleDelete, handleCreateOrUpdate }
}
