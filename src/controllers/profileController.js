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
      shell.setStatus('Vorname und Email fehlen', true)
      return
    }
    if (!current_password) {
      shell.setStatus('Aktuelles Passwort fehlt', true)
      return
    }
    if ((new_password || new_password_confirm) && new_password !== new_password_confirm) {
      shell.setStatus('Neue Passwörter stimmen nicht überein', true)
      return
    }
    if (new_password && new_password.length < 8) {
      shell.setStatus('Neues Passwort muss mindestens 8 Zeichen haben', true)
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
          shell.setStatus('Passwort geändert. Bitte neu anmelden.', false)
          onLogout()
          return
        }
        shell.setStatus('Profil gespeichert', false)
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
