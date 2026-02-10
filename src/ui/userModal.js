/**
 * User modal builder for create/edit flows.
 * Exports: createUserModal.
 */
import { enablePasswordToggles } from '../utils/dom'

export function createUserModal() {
  const userModal = document.createElement('div')
  userModal.className = 'modal-backdrop'
  userModal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3 id="modalTitle">Create user</h3>
        <button type="button" class="modal-close" aria-label="Close">×</button>
      </div>
      <div class="modal-body">
        <div id="modalFormArea">
          <div class="question-row">
            <label class="field">
              <span>First name</span>
              <input type="text" id="modalUserFirstName" placeholder="First name" autocomplete="given-name" />
            </label>
            <label class="field">
              <span>Last name</span>
              <input type="text" id="modalUserLastName" placeholder="Last name" autocomplete="family-name" />
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
          <details class="modal-advanced" id="modalAdvanced">
            <summary>Set password manually</summary>
            <div class="question-row modal-password">
              <label class="field">
                <span>Password</span>
                <input
                  type="password"
                  id="modalUserPassword"
                  placeholder="Min. 8 characters"
                  autocomplete="new-password"
                />
              </label>
              <label class="field">
                <span>Confirm password</span>
                <input
                  type="password"
                  id="modalUserPasswordConfirm"
                  placeholder="Confirm password"
                  autocomplete="new-password"
                />
              </label>
            </div>
            <div id="modalPasswordMatch" class="password-match"></div>
          </details>
          <div class="admin-toggle">
            <label class="admin-toggle-row">
              <input type="checkbox" id="modalUserIsAdmin" />
              <strong>Admin</strong>
            </label>
            <p class="admin-toggle-hint">Admins can manage users, configure the questionnaire, and view audit logs. Regular users can only review and moderate pins.</p>
          </div>
        </div>
        <div id="modalResultArea" style="display: none;">
          <p class="modal-result-msg">User created successfully. Share the password link below so they can set their password.</p>
          <div class="reset-link-box">
            <div class="muted" id="modalResultExpiryLabel">Password link (valid for 24 hours)</div>
            <div class="reset-link-row">
              <input type="text" id="modalResultLink" readonly />
              <button type="button" id="modalCopyLink" class="ghost">Copy</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-actions">
        <button type="button" class="ghost" id="modalCancel">Cancel</button>
        <div class="split-btn" id="modalSplitBtn">
          <button type="button" id="modalCreateUser">Create password link</button>
          <button type="button" class="split-btn-caret" id="modalExpiryToggle" title="Token validity period">24h ▾</button>
          <div class="split-btn-menu" id="modalExpiryMenu">
            <button type="button" data-hours="1">1 hour</button>
            <button type="button" data-hours="24" class="is-active">24 hours</button>
            <button type="button" data-hours="168">7 days</button>
            <button type="button" data-hours="720">30 days</button>
          </div>
        </div>
        <button type="button" id="modalDone" style="display: none;">Done</button>
      </div>
    </div>
  `

  enablePasswordToggles(userModal)

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
    modalAdvanced: userModal.querySelector('#modalAdvanced'),
    modalPasswordMatch: userModal.querySelector('#modalPasswordMatch'),
    modalFormArea: userModal.querySelector('#modalFormArea'),
    modalResultArea: userModal.querySelector('#modalResultArea'),
    modalResultLink: userModal.querySelector('#modalResultLink'),
    modalResultExpiryLabel: userModal.querySelector('#modalResultExpiryLabel'),
    modalCopyLink: userModal.querySelector('#modalCopyLink'),
    modalSplitBtn: userModal.querySelector('#modalSplitBtn'),
    modalExpiryToggle: userModal.querySelector('#modalExpiryToggle'),
    modalExpiryMenu: userModal.querySelector('#modalExpiryMenu'),
    modalDone: userModal.querySelector('#modalDone'),
  }
}
