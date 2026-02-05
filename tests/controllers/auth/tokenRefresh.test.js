/**
 * Tests for token refresh helper.
 */
import { describe, expect, it, vi } from 'vitest'
import { createTokenRefresh } from '../../../src/controllers/auth/tokenRefresh'

describe('createTokenRefresh', () => {
  it('refreshes token and updates storage', async () => {
    const state = { token: 'old-token', refreshTimer: null }
    const api = { refreshToken: vi.fn().mockResolvedValue({ token: 'new-token' }) }
    const storage = { setItem: vi.fn(), removeItem: vi.fn() }
    let callback
    const setIntervalFn = (fn) => {
      callback = fn
      return 42
    }
    const clearIntervalFn = vi.fn()
    const onLogout = vi.fn()
    const refresh = createTokenRefresh({
      state,
      api,
      onLogout,
      storage,
      setIntervalFn,
      clearIntervalFn,
    })

    refresh.startTokenRefresh()
    await callback()

    expect(api.refreshToken).toHaveBeenCalledWith({ token: 'old-token' })
    expect(state.token).toBe('new-token')
    expect(storage.setItem).toHaveBeenCalledWith('admin_jwt', 'new-token')
  })

  it('stops refresh timer', () => {
    const state = { token: 'token', refreshTimer: 123 }
    const api = { refreshToken: vi.fn() }
    const storage = { setItem: vi.fn(), removeItem: vi.fn() }
    const clearIntervalFn = vi.fn()
    const refresh = createTokenRefresh({ state, api, onLogout: vi.fn(), storage, clearIntervalFn })

    refresh.stopTokenRefresh()

    expect(clearIntervalFn).toHaveBeenCalledWith(123)
    expect(state.refreshTimer).toBeNull()
  })
})
