/**
 * User modal controller for open/close, button states, expiry dropdown, and result display.
 * Exports: createUserModalController.
 */
import { copyResetLink } from '../../utils/resetLink'
import { showModal, hideModal } from '../../utils/adminModal'

const EXPIRY_OPTIONS = [
  { hours: 1, label: '1 hour', short: '1h' },
  { hours: 24, label: '24 hours', short: '24h' },
  { hours: 168, label: '7 days', short: '7d' },
  { hours: 720, label: '30 days', short: '30d' },
]

export function createUserModalController({ state, views }) {
  const {
    element,
    modalTitle,
    modalCreateUserButton,
    modalUserFirstName,
    modalUserLastName,
    modalUserEmail,
    modalUserPassword,
    modalUserPasswordConfirm,
    modalUserIsAdmin,
    modalFormArea,
    modalResultArea,
    modalResultLink,
    modalResultExpiryLabel,
    modalCopyLink,
    modalSplitBtn,
    modalExpiryToggle,
    modalExpiryMenu,
    modalCancelButton,
    modalDone,
    modalAdvanced,
    modalPasswordMatch,
  } = views.userModal

  let selectedExpiryHours = 24
  let onResultDismiss = null

  const getExpiryLabel = (hours) => {
    const opt = EXPIRY_OPTIONS.find((o) => o.hours === hours)
    return opt ? opt.label : `${hours}h`
  }

  const getExpiryShort = (hours) => {
    const opt = EXPIRY_OPTIONS.find((o) => o.hours === hours)
    return opt ? opt.short : `${hours}h`
  }

  /* ── Button state: toggles between "Create user" and "Create password link" ── */

  const updateButtonState = () => {
    if (state.editingUserId) return
    const hasPassword = modalUserPassword.value.length > 0 || modalUserPasswordConfirm.value.length > 0
    if (hasPassword) {
      modalCreateUserButton.textContent = 'Create user'
      modalExpiryToggle.style.display = 'none'
    } else {
      modalCreateUserButton.textContent = 'Create password link'
      modalExpiryToggle.style.display = ''
    }
  }

  /* ── Password match indicator ── */

  const updatePasswordMatch = () => {
    const pw = modalUserPassword.value
    const confirm = modalUserPasswordConfirm.value

    if (!pw && !confirm) {
      modalPasswordMatch.textContent = ''
      modalPasswordMatch.className = 'password-match'
      return
    }

    if (!confirm) {
      modalPasswordMatch.textContent = ''
      modalPasswordMatch.className = 'password-match'
      return
    }

    if (pw === confirm) {
      if (pw.length < 8) {
        modalPasswordMatch.textContent = 'Too short (min. 8 characters)'
        modalPasswordMatch.className = 'password-match is-error'
      } else {
        modalPasswordMatch.textContent = 'Passwords match'
        modalPasswordMatch.className = 'password-match is-ok'
      }
    } else {
      modalPasswordMatch.textContent = 'Passwords don\u2019t match'
      modalPasswordMatch.className = 'password-match is-error'
    }
  }

  /* ── Expiry dropdown ── */

  const closeExpiryMenu = () => {
    modalExpiryMenu.classList.remove('is-open')
  }

  const toggleExpiryMenu = () => {
    modalExpiryMenu.classList.toggle('is-open')
  }

  const selectExpiry = (hours) => {
    selectedExpiryHours = hours
    modalExpiryToggle.textContent = `${getExpiryShort(hours)} \u25BE`
    modalExpiryMenu.querySelectorAll('button').forEach((btn) => {
      btn.classList.toggle('is-active', Number(btn.dataset.hours) === hours)
    })
    closeExpiryMenu()
  }

  /* ── Internal event bindings ── */

  const bindModalEvents = () => {
    modalUserPassword.addEventListener('input', () => {
      updateButtonState()
      updatePasswordMatch()
    })
    modalUserPasswordConfirm.addEventListener('input', () => {
      updateButtonState()
      updatePasswordMatch()
    })

    /* Close advanced → clear passwords & reset button */
    modalAdvanced.addEventListener('toggle', () => {
      if (!modalAdvanced.open) {
        modalUserPassword.value = ''
        modalUserPasswordConfirm.value = ''
        modalPasswordMatch.textContent = ''
        modalPasswordMatch.className = 'password-match'
        updateButtonState()
      }
    })

    modalExpiryToggle.addEventListener('click', (e) => {
      e.stopPropagation()
      toggleExpiryMenu()
    })

    modalExpiryMenu.addEventListener('click', (e) => {
      e.stopPropagation()
      const btn = e.target.closest('button[data-hours]')
      if (!btn) return
      selectExpiry(Number(btn.dataset.hours))
    })

    document.addEventListener('click', () => closeExpiryMenu())
    modalSplitBtn.addEventListener('click', (e) => e.stopPropagation())

    modalCopyLink.addEventListener('click', async () => {
      await copyResetLink(modalResultLink.value)
      modalCopyLink.textContent = 'Copied!'
      setTimeout(() => {
        modalCopyLink.textContent = 'Copy'
      }, 2000)
    })

  }

  /* ── Modal state management ── */

  const resetModalState = () => {
    modalFormArea.style.display = ''
    modalResultArea.style.display = 'none'
    modalCancelButton.style.display = ''
    modalSplitBtn.style.display = ''
    modalDone.style.display = 'none'
    modalPasswordMatch.textContent = ''
    modalPasswordMatch.className = 'password-match'
    closeExpiryMenu()
    onResultDismiss = null
  }

  const openUserModal = () => {
    state.editingUserId = null
    resetModalState()
    modalTitle.textContent = 'Create user'
    modalCreateUserButton.textContent = 'Create password link'
    modalExpiryToggle.style.display = ''
    modalExpiryToggle.textContent = `${getExpiryShort(selectedExpiryHours)} \u25BE`
    modalAdvanced.open = false
    modalAdvanced.style.display = ''
    modalUserFirstName.value = ''
    modalUserLastName.value = ''
    modalUserEmail.value = ''
    modalUserPassword.value = ''
    modalUserPasswordConfirm.value = ''
    modalUserIsAdmin.checked = false
    showModal(element)
  }

  const openUserModalForEdit = (user) => {
    state.editingUserId = Number(user.id)
    resetModalState()
    modalTitle.textContent = 'Edit user'
    modalCreateUserButton.textContent = 'Save'
    modalExpiryToggle.style.display = 'none'
    modalAdvanced.open = false
    modalAdvanced.style.display = 'none'
    modalUserFirstName.value = user.first_name || ''
    modalUserLastName.value = user.last_name || ''
    modalUserEmail.value = user.email || ''
    modalUserPassword.value = ''
    modalUserPasswordConfirm.value = ''
    modalUserIsAdmin.checked = Boolean(user.is_admin)
    showModal(element)
  }

  const closeUserModal = () => {
    hideModal(element)
    const callback = onResultDismiss
    onResultDismiss = null
    resetModalState()
    if (callback) callback()
  }

  /* ── Result display (after creating a user with password link) ── */

  const showResult = ({ link, expiryHours, onDismiss, message = '', isError = false }) => {
    modalFormArea.style.display = 'none'
    modalResultArea.style.display = ''
    const msgEl = modalResultArea.querySelector('.modal-result-msg')
    if (msgEl) {
      msgEl.textContent = message
      msgEl.classList.toggle('modal-result-error', isError)
    }
    modalResultLink.value = link
    modalResultExpiryLabel.textContent = `Password link (valid for ${getExpiryLabel(expiryHours)})`
    modalCancelButton.style.display = 'none'
    modalSplitBtn.style.display = 'none'
    modalDone.style.display = ''
    modalCopyLink.textContent = 'Copy'
    onResultDismiss = onDismiss || null
  }

  /* ── Reset result display (for table reset actions) ── */

  const showResetResult = ({ link, expiryHours, message, isError = false }) => {
    state.editingUserId = null
    resetModalState()
    modalTitle.textContent = 'Password reset'
    modalFormArea.style.display = 'none'
    modalResultArea.style.display = ''
    modalResultArea.querySelector('.modal-result-msg').textContent = message
    modalResultArea.querySelector('.modal-result-msg').classList.toggle('modal-result-error', isError)
    modalResultLink.value = link
    modalResultExpiryLabel.textContent = `Reset link (valid for ${getExpiryLabel(expiryHours)})`
    modalCancelButton.style.display = 'none'
    modalSplitBtn.style.display = 'none'
    modalDone.style.display = ''
    modalCopyLink.textContent = 'Copy'
    onResultDismiss = null
    showModal(element)
  }

  const getSelectedExpiryHours = () => selectedExpiryHours

  return {
    openUserModal,
    openUserModalForEdit,
    closeUserModal,
    showResult,
    showResetResult,
    getSelectedExpiryHours,
    bindModalEvents,
  }
}
