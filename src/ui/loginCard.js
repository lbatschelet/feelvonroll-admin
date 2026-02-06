/**
 * Login card builder for admin authentication flows.
 * Exports: createLoginCard.
 */
export function createLoginCard() {
  const loginCard = document.createElement('section')
  loginCard.className = 'card login-card'
  loginCard.innerHTML = `
    <h2>Admin Login</h2>
    <div class="auth-section" data-section="login">
      <div class="form-row">
        <label>Email</label>
        <input type="email" id="loginEmail" placeholder="name@domain.ch" />
      </div>
      <div class="form-row">
        <label>Passwort</label>
        <input type="password" id="loginPassword" placeholder="Passwort" />
      </div>
      <div class="form-actions">
        <button id="loginUserButton">Login</button>
        <button id="showSetPassword" class="ghost">Passwort setzen</button>
      </div>
    </div>
    <div class="auth-section" data-section="set-password">
      <div class="form-row">
        <label>Reset Token</label>
        <input type="text" id="resetToken" placeholder="Token" />
      </div>
      <div class="form-row">
        <label>Neues Passwort</label>
        <input type="password" id="resetPassword" placeholder="Neues Passwort" />
      </div>
      <div class="form-actions">
        <button id="setPasswordButton">Passwort speichern</button>
        <button id="showLogin" class="ghost">Zurück</button>
      </div>
    </div>
    <div class="auth-section" data-section="bootstrap">
      <div class="form-row">
        <label>Admin Token</label>
        <input type="password" id="adminToken" placeholder="Token" />
      </div>
      <div class="form-actions">
        <button id="bootstrapButton">Einrichten</button>
      </div>
    </div>
    <div class="auth-section" data-section="bootstrap-user">
      <div class="form-row">
        <label>Erster User (Vorname)</label>
        <input type="text" id="bootstrapFirstName" placeholder="Vorname" />
      </div>
      <div class="form-row">
        <label>Erster User (Nachname)</label>
        <input type="text" id="bootstrapLastName" placeholder="Nachname" />
      </div>
      <div class="form-row">
        <label>Erster User (Email)</label>
        <input type="email" id="bootstrapEmail" placeholder="name@domain.ch" />
      </div>
      <div class="form-actions">
        <button type="button" id="bootstrapCreateUser">User erstellen</button>
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
