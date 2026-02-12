/**
 * Login card builder for admin authentication flows.
 * Exports: createLoginCard.
 */
import { enablePasswordToggles } from '../utils/dom'

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
        <a href="/reset" class="forgot-link">Forgot password?</a>
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
  `

  enablePasswordToggles(loginCard)

  return {
    element: loginCard,
    loginEmail: loginCard.querySelector('#loginEmail'),
    loginPassword: loginCard.querySelector('#loginPassword'),
    loginUserButton: loginCard.querySelector('#loginUserButton'),
    tokenInput: loginCard.querySelector('#adminToken'),
    bootstrapButton: loginCard.querySelector('#bootstrapButton'),
  }
}
