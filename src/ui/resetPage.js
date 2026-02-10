/**
 * Reset page view with two sections: request reset and set password.
 * Exports: createResetPage.
 */
import { enablePasswordToggles } from '../utils/dom'

export function createResetPage() {
  const page = document.createElement('div')
  page.className = 'layout'
  page.innerHTML = `
    <header class="header">
      <div class="header-brand">
        <a class="header-title" href="/" title="Back to login"><em>feel</em><strong>vonRoll</strong> Admin</a>
      </div>
    </header>
    <section class="card login-card">
      <div class="reset-section" data-section="request">
        <h2>Reset password</h2>
        <p class="form-hint">Enter your email address and we will send you a link to reset your password.</p>
        <div class="form-row">
          <label>Email</label>
          <input type="email" id="resetRequestEmail" placeholder="name@domain.ch" />
        </div>
        <div class="form-actions">
          <button id="resetRequestButton">Send reset link</button>
        </div>
        <div id="resetRequestStatus" class="status"></div>
        <p class="form-hint" style="margin-top: 12px;"><a href="/">Back to login</a></p>
      </div>
      <div class="reset-section" data-section="set-password" style="display:none;">
        <h2>Set new password</h2>
        <p class="form-hint" id="resetEmailHint" style="display:none;"></p>
        <div class="form-row">
          <label>New password</label>
          <input type="password" id="resetNewPassword" placeholder="Min. 8 characters" autocomplete="new-password" />
        </div>
        <div class="form-row">
          <label>Confirm password</label>
          <input type="password" id="resetConfirmPassword" placeholder="Confirm password" autocomplete="new-password" />
        </div>
        <div id="resetPasswordMatch" class="password-match"></div>
        <div class="form-actions">
          <button id="resetSetPasswordButton">Set password</button>
        </div>
        <div id="resetSetStatus" class="status"></div>
        <p class="form-hint" style="margin-top: 12px;"><a href="/">Back to login</a></p>
      </div>
    </section>
  `

  enablePasswordToggles(page)

  return {
    element: page,
    /* Request reset section */
    requestSection: page.querySelector('[data-section="request"]'),
    requestEmail: page.querySelector('#resetRequestEmail'),
    requestButton: page.querySelector('#resetRequestButton'),
    requestStatus: page.querySelector('#resetRequestStatus'),
    /* Set password section */
    setPasswordSection: page.querySelector('[data-section="set-password"]'),
    emailHint: page.querySelector('#resetEmailHint'),
    newPassword: page.querySelector('#resetNewPassword'),
    confirmPassword: page.querySelector('#resetConfirmPassword'),
    passwordMatch: page.querySelector('#resetPasswordMatch'),
    setPasswordButton: page.querySelector('#resetSetPasswordButton'),
    setStatus: page.querySelector('#resetSetStatus'),
  }
}
