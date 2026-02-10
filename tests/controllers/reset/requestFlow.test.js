/**
 * @vitest-environment jsdom
 *
 * Tests for the password reset request flow controller.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createResetRequestFlow } from '../../../src/controllers/reset/requestFlow'

const buildViews = () => {
  const requestEmail = document.createElement('input')
  const requestButton = document.createElement('button')
  requestButton.textContent = 'Send reset link'
  const requestStatus = document.createElement('div')
  return { resetPage: { requestEmail, requestButton, requestStatus } }
}

describe('resetRequestFlow', () => {
  let api, views

  beforeEach(() => {
    api = { requestReset: vi.fn().mockResolvedValue({ ok: true }) }
    views = buildViews()
  })

  it('shows error when email is empty', async () => {
    const flow = createResetRequestFlow({ api, views })
    flow.bindEvents()

    views.resetPage.requestEmail.value = ''
    views.resetPage.requestButton.click()

    // Let promises resolve
    await vi.waitFor(() => {
      expect(views.resetPage.requestStatus.textContent).toContain('email')
    })
    expect(api.requestReset).not.toHaveBeenCalled()
  })

  it('calls API and shows success message', async () => {
    const flow = createResetRequestFlow({ api, views })
    flow.bindEvents()

    views.resetPage.requestEmail.value = 'test@example.com'
    views.resetPage.requestButton.click()

    await vi.waitFor(() => {
      expect(api.requestReset).toHaveBeenCalledWith({ email: 'test@example.com' })
    })
    expect(views.resetPage.requestStatus.textContent).toContain('reset link has been sent')
  })

  it('shows API error on failure', async () => {
    api.requestReset.mockRejectedValue(new Error('Network error'))
    const flow = createResetRequestFlow({ api, views })
    flow.bindEvents()

    views.resetPage.requestEmail.value = 'test@example.com'
    views.resetPage.requestButton.click()

    await vi.waitFor(() => {
      expect(views.resetPage.requestStatus.textContent).toContain('Network error')
    })
  })
})
