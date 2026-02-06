/**
 * Profile modal builder for self profile edits.
 * Exports: createProfileModal.
 */
export function createProfileModal() {
  const profileModal = document.createElement('div')
  profileModal.className = 'modal-backdrop'
  profileModal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>Profil bearbeiten</h3>
        <button type="button" class="modal-close" aria-label="Schliessen">×</button>
      </div>
      <div class="modal-body">
        <div class="question-row">
          <label class="field">
            <span>Vorname</span>
            <input type="text" id="profileFirstName" autocomplete="given-name" />
          </label>
          <label class="field">
            <span>Nachname</span>
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
            <span>Aktuelles Passwort</span>
            <input type="password" id="profileCurrentPassword" autocomplete="current-password" />
          </label>
        </div>
        <div class="question-row modal-password">
          <label class="field">
            <span>Neues Passwort</span>
            <input type="password" id="profileNewPassword" autocomplete="new-password" />
          </label>
          <label class="field">
            <span>Neues Passwort bestätigen</span>
            <input type="password" id="profileNewPasswordConfirm" autocomplete="new-password" />
          </label>
        </div>
      </div>
      <div class="modal-actions">
        <button type="button" class="ghost" id="profileCancel">Abbrechen</button>
        <button type="button" id="profileSave">Speichern</button>
      </div>
    </div>
  `

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
