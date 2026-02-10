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

  enablePasswordToggles(loginCard)

  return {
    element: loginCard,
    loginEmail: loginCard.querySelector('#loginEmail'),
    loginPassword: loginCard.querySelector('#loginPassword'),
    loginUserButton: loginCard.querySelector('#loginUserButton'),
    tokenInput: loginCard.querySelector('#adminToken'),
    bootstrapButton: loginCard.querySelector('#bootstrapButton'),
    bootstrapFirstName: loginCard.querySelector('#bootstrapFirstName'),
    bootstrapLastName: loginCard.querySelector('#bootstrapLastName'),
    bootstrapEmail: loginCard.querySelector('#bootstrapEmail'),
    bootstrapCreateUser: loginCard.querySelector('#bootstrapCreateUser'),
  }
}
