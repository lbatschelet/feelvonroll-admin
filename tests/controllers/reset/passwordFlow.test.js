/**
 * @vitest-environment jsdom
 *
 * Tests for the password reset set-password flow controller.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createResetPasswordFlow } from '../../../src/controllers/reset/passwordFlow'

const buildViews = () => {
  const newPassword = document.createElement('input')
  const confirmPassword = document.createElement('input')
  const passwordMatch = document.createElement('div')
  const setPasswordButton = document.createElement('button')
  setPasswordButton.textContent = 'Set password'
  const setStatus = document.createElement('div')
  return { resetPage: { newPassword, confirmPassword, passwordMatch, setPasswordButton, setStatus } }
}

describe('resetPasswordFlow', () => {
  let api, views

  beforeEach(() => {
    api = { setPassword: vi.fn().mockResolvedValue({ ok: true }) }
    views = buildViews()
    // Simulate a token in the URL
    window.history.replaceState(null, '', '/reset?token=test-token-123')
  })

  it('shows error when passwords do not match', async () => {
    const flow = createResetPasswordFlow({ api, views })
    flow.bindEvents()

    views.resetPage.newPassword.value = 'password1'
    views.resetPage.confirmPassword.value = 'password2'
    views.resetPage.setPasswordButton.click()

    await vi.waitFor(() => {
      expect(views.resetPage.setStatus.textContent).toContain('do not match')
    })
    expect(api.setPassword).not.toHaveBeenCalled()
  })

  it('shows error for short password', async () => {
    const flow = createResetPasswordFlow({ api, views })
    flow.bindEvents()

    views.resetPage.newPassword.value = 'short'
    views.resetPage.confirmPassword.value = 'short'
    views.resetPage.setPasswordButton.click()

    await vi.waitFor(() => {
      expect(views.resetPage.setStatus.textContent).toContain('8 characters')
    })
    expect(api.setPassword).not.toHaveBeenCalled()
  })

  it('calls API with token and password on success', async () => {
    const flow = createResetPasswordFlow({ api, views })
    flow.bindEvents()

    views.resetPage.newPassword.value = 'longenough1'
    views.resetPage.confirmPassword.value = 'longenough1'
    views.resetPage.setPasswordButton.click()

    await vi.waitFor(() => {
      expect(api.setPassword).toHaveBeenCalledWith({
        reset_token: 'test-token-123',
        password: 'longenough1',
      })
    })
    expect(views.resetPage.setStatus.textContent).toContain('successfully')
  })

  it('updates password match indicator on input', () => {
    const flow = createResetPasswordFlow({ api, views })
    flow.bindEvents()

    views.resetPage.newPassword.value = 'password123'
    views.resetPage.confirmPassword.value = 'password123'
    views.resetPage.newPassword.dispatchEvent(new Event('input'))
    views.resetPage.confirmPassword.dispatchEvent(new Event('input'))

    expect(views.resetPage.passwordMatch.textContent).toContain('match')
    expect(views.resetPage.passwordMatch.className).toContain('is-ok')
  })

  it('shows mismatch indicator', () => {
    const flow = createResetPasswordFlow({ api, views })
    flow.bindEvents()

    views.resetPage.newPassword.value = 'password123'
    views.resetPage.confirmPassword.value = 'different'
    views.resetPage.confirmPassword.dispatchEvent(new Event('input'))

    expect(views.resetPage.passwordMatch.className).toContain('is-error')
  })
})
