/**
 * Login card builder for admin authentication flows.
 * Exports: createLoginCard.
 */
export function createLoginCard() {
  const loginCard = document.createElement('section')
  loginCard.className = 'card login-card'
  loginCard.innerHTML = `
    <h2>Login</h2>
    <div class="auth-section" data-section="login">
      <div class="form-row">
        <label>Email</label>
        <input type="email" id="loginEmail" placeholder="name@domain.ch" title="Admin account email" />
      </div>
      <div class="form-row">
        <label>Password</label>
        <input type="password" id="loginPassword" placeholder="Password" title="Admin account password" />
      </div>
      <div class="form-actions">
        <button id="loginUserButton">Log in</button>
        <button id="showSetPassword" class="ghost">Set password</button>
      </div>
    </div>
    <div class="auth-section" data-section="set-password">
      <div class="form-row">
        <label>Reset token</label>
        <input type="text" id="resetToken" placeholder="Token" title="Paste the reset token you received" />
      </div>
      <div class="form-row">
        <label>New password</label>
        <input type="password" id="resetPassword" placeholder="New password" />
      </div>
      <div class="form-actions">
        <button id="setPasswordButton">Save password</button>
        <button id="showLogin" class="ghost">Back</button>
      </div>
    </div>
    <div class="auth-section" data-section="bootstrap">
      <div class="form-row">
        <label>Admin token</label>
        <input type="password" id="adminToken" placeholder="Token" title="One-time bootstrap token" />
      </div>
      <div class="form-actions">
        <button id="bootstrapButton">Start setup</button>
      </div>
    </div>
    <div class="auth-section" data-section="bootstrap-user">
      <div class="form-row">
        <label>First user (first name)</label>
        <input type="text" id="bootstrapFirstName" placeholder="First name" />
      </div>
      <div class="form-row">
        <label>First user (last name)</label>
        <input type="text" id="bootstrapLastName" placeholder="Last name" />
      </div>
      <div class="form-row">
        <label>First user (email)</label>
        <input type="email" id="bootstrapEmail" placeholder="name@domain.ch" />
      </div>
      <div class="form-actions">
        <button type="button" id="bootstrapCreateUser">Create user</button>
      </div>
    </div>
  `

  return {
    element: loginCard,
    loginEmail: loginCard.querySelector('#loginEmail'),
    loginPassword: loginCard.querySelector('#loginPassword'),
    loginUserButton: loginCard.querySelector('#loginUserButton'),
    showSetPasswordButton: loginCard.querySelector('#showSetPassword'),
    showLoginButton: loginCard.querySelector('#showLogin'),
    resetTokenInput: loginCard.querySelector('#resetToken'),
    resetPasswordInput: loginCard.querySelector('#resetPassword'),
    setPasswordButton: loginCard.querySelector('#setPasswordButton'),
    tokenInput: loginCard.querySelector('#adminToken'),
    bootstrapButton: loginCard.querySelector('#bootstrapButton'),
    bootstrapFirstName: loginCard.querySelector('#bootstrapFirstName'),
    bootstrapLastName: loginCard.querySelector('#bootstrapLastName'),
    bootstrapEmail: loginCard.querySelector('#bootstrapEmail'),
    bootstrapCreateUser: loginCard.querySelector('#bootstrapCreateUser'),
  }
}
