/**
 * Profile controller for self profile modal.
 * Exports: createProfileController.
 */
import { runWithButtonFeedback } from '../utils/buttonFeedback'

export function createProfileController({ state, views, api, shell, onLogout }) {
  const {
    modalCloseButton,
    modalCancelButton,
    modalSaveButton,
    firstNameInput,
    lastNameInput,
    emailInput,
    currentPasswordInput,
    newPasswordInput,
    newPasswordConfirmInput,
  } = views.profileModal

  const openProfileModal = () => {
    const user = state.currentUser || {}
    firstNameInput.value = user.first_name || ''
    lastNameInput.value = user.last_name || ''
    emailInput.value = user.email || ''
    currentPasswordInput.value = ''
    newPasswordInput.value = ''
    newPasswordConfirmInput.value = ''
    views.profileModal.element.classList.add('is-visible')
  }

  const closeProfileModal = () => {
    views.profileModal.element.classList.remove('is-visible')
  }

  const handleSave = async () => {
    const first_name = firstNameInput.value.trim()
    const last_name = lastNameInput.value.trim()
    const email = emailInput.value.trim()
    const current_password = currentPasswordInput.value
    const new_password = newPasswordInput.value
    const new_password_confirm = newPasswordConfirmInput.value

    if (!first_name || !email) {
      shell.setStatus('First name and email are required', true)
      return
    }
    const wantsPasswordChange = new_password || new_password_confirm
    if (wantsPasswordChange && !current_password) {
      shell.setStatus('Current password is required to change password', true)
      return
    }
    if (wantsPasswordChange && new_password !== new_password_confirm) {
      shell.setStatus('New passwords do not match', true)
      return
    }
    if (wantsPasswordChange && new_password.length < 8) {
      shell.setStatus('New password must be at least 8 characters', true)
      return
    }

    try {
      await runWithButtonFeedback(modalSaveButton, async () => {
        await api.updateSelf({
          token: state.token,
          first_name,
          last_name,
          email,
          current_password,
          new_password,
          new_password_confirm,
        })
        state.currentUser = {
          ...(state.currentUser || {}),
          first_name,
          last_name,
          email,
        }
        shell.setUserDisplayName(`${first_name}`)
        closeProfileModal()
        if (new_password && onLogout) {
          shell.setStatus('Password updated. Please log in again.', false)
          onLogout()
          return
        }
        shell.setStatus('Profile saved', false)
      })
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  const bindEvents = () => {
    modalCloseButton.addEventListener('click', () => closeProfileModal())
    modalCancelButton.addEventListener('click', () => closeProfileModal())
    modalSaveButton.addEventListener('click', () => handleSave())
  }

  return { bindEvents, openProfileModal, closeProfileModal }
}
