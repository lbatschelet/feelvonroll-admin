/**
 * Tests for the auth API client – requestReset and setPassword functions.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { requestReset, setPassword } from '../../src/api/authApi'

const buildResponse = ({ ok = true, jsonData = {}, status = 200, textData = '' } = {}) => ({
  ok,
  status,
  statusText: '',
  json: () => Promise.resolve(jsonData),
  text: () => Promise.resolve(textData || JSON.stringify(jsonData)),
  headers: { get: () => '' },
})

describe('authApi', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('requestReset sends correct payload', async () => {
    fetch.mockResolvedValue(buildResponse({ jsonData: { ok: true } }))

    const result = await requestReset({ email: 'test@example.com' })

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin_auth.php'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ action: 'request_reset', email: 'test@example.com' }),
      })
    )
    expect(result).toEqual({ ok: true })
  })

  it('setPassword sends correct payload', async () => {
    fetch.mockResolvedValue(buildResponse({ jsonData: { ok: true } }))

    const result = await setPassword({ reset_token: 'abc123', password: 'newpass99' })

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin_auth.php'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ action: 'set_password', reset_token: 'abc123', password: 'newpass99' }),
      })
    )
    expect(result).toEqual({ ok: true })
  })
})
