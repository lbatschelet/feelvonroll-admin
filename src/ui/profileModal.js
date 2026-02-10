/**
 * Profile modal builder for self profile edits.
 * Exports: createProfileModal.
 */
import { enablePasswordToggles } from '../utils/dom'

export function createProfileModal() {
  const profileModal = document.createElement('div')
  profileModal.className = 'modal-backdrop'
  profileModal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>Edit profile</h3>
        <button type="button" class="modal-close" aria-label="Close">×</button>
      </div>
      <div class="modal-body">
        <div class="question-row">
          <label class="field">
            <span>First name</span>
            <input type="text" id="profileFirstName" autocomplete="given-name" />
          </label>
          <label class="field">
            <span>Last name</span>
            <input type="text" id="profileLastName" autocomplete="family-name" />
          </label>
        </div>
        <div class="question-row">
          <label class="field">
            <span>Email</span>
            <input type="email" id="profileEmail" autocomplete="email" />
          </label>
        </div>
        <div class="question-row">
          <label class="field">
            <span>Current password</span>
            <input type="password" id="profileCurrentPassword" autocomplete="current-password" title="Required to save profile changes" />
          </label>
        </div>
        <div class="question-row modal-password">
          <label class="field">
            <span>New password</span>
            <input type="password" id="profileNewPassword" autocomplete="new-password" />
          </label>
          <label class="field">
            <span>Confirm new password</span>
            <input type="password" id="profileNewPasswordConfirm" autocomplete="new-password" />
          </label>
        </div>
      </div>
      <div class="modal-actions">
        <button type="button" class="ghost" id="profileCancel">Cancel</button>
        <button type="button" id="profileSave">Save</button>
      </div>
    </div>
  `

  enablePasswordToggles(profileModal)

  return {
    element: profileModal,
    modalCloseButton: profileModal.querySelector('.modal-close'),
    modalCancelButton: profileModal.querySelector('#profileCancel'),
    modalSaveButton: profileModal.querySelector('#profileSave'),
    firstNameInput: profileModal.querySelector('#profileFirstName'),
    lastNameInput: profileModal.querySelector('#profileLastName'),
    emailInput: profileModal.querySelector('#profileEmail'),
    currentPasswordInput: profileModal.querySelector('#profileCurrentPassword'),
    newPasswordInput: profileModal.querySelector('#profileNewPassword'),
    newPasswordConfirmInput: profileModal.querySelector('#profileNewPasswordConfirm'),
  }
}
