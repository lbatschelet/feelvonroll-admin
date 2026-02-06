/**
 * User modal builder for create/edit flows.
 * Exports: createUserModal.
 */
export function createUserModal() {
  const userModal = document.createElement('div')
  userModal.className = 'modal-backdrop'
  userModal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3 id="modalTitle">User erstellen</h3>
        <button type="button" class="modal-close" aria-label="Schliessen">×</button>
      </div>
      <div class="modal-body">
        <div class="question-row">
          <label class="field">
            <span>Vorname</span>
            <input type="text" id="modalUserFirstName" placeholder="Vorname" autocomplete="given-name" />
          </label>
          <label class="field">
            <span>Nachname</span>
            <input type="text" id="modalUserLastName" placeholder="Nachname" autocomplete="family-name" />
          </label>
        </div>
        <div class="question-row">
          <label class="field">
            <span>Email</span>
            <input
              type="email"
              id="modalUserEmail"
              placeholder="name@domain.ch"
              autocomplete="email"
            />
          </label>
        </div>
        <div class="question-row modal-password">
          <label class="field">
            <span>Passwort</span>
            <input
              type="password"
              id="modalUserPassword"
              placeholder="Passwort"
              autocomplete="new-password"
            />
          </label>
          <label class="field">
            <span>Passwort bestätigen</span>
            <input
              type="password"
              id="modalUserPasswordConfirm"
              placeholder="Passwort bestätigen"
              autocomplete="new-password"
            />
          </label>
        </div>
        <p class="modal-hint">Passwort leer lassen, um einen Reset-Link zu erstellen.</p>
        <label class="field checkbox-field">
          <input type="checkbox" id="modalUserIsAdmin" />
          <span>Admin</span>
        </label>
        <div class="reset-link" id="modalResetLink"></div>
      </div>
      <div class="modal-actions">
        <button type="button" class="ghost" id="modalCancel">Abbrechen</button>
        <button type="button" id="modalCreateUser">User erstellen</button>
      </div>
    </div>
  `

  return {
    element: userModal,
    modalCloseButton: userModal.querySelector('.modal-close'),
    modalCancelButton: userModal.querySelector('#modalCancel'),
    modalCreateUserButton: userModal.querySelector('#modalCreateUser'),
    modalTitle: userModal.querySelector('#modalTitle'),
    modalUserFirstName: userModal.querySelector('#modalUserFirstName'),
    modalUserLastName: userModal.querySelector('#modalUserLastName'),
    modalUserEmail: userModal.querySelector('#modalUserEmail'),
    modalUserIsAdmin: userModal.querySelector('#modalUserIsAdmin'),
    modalUserPassword: userModal.querySelector('#modalUserPassword'),
    modalUserPasswordConfirm: userModal.querySelector('#modalUserPasswordConfirm'),
    modalResetLink: userModal.querySelector('#modalResetLink'),
  }
}
