import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  deletePins,
  fetchAdminPins,
  fetchLanguages,
  fetchQuestions,
  getApiBase,
  updatePinApprovalBulk,
  upsertTranslation,
} from './adminApi.js'

const buildResponse = ({ ok = true, jsonData = {}, textData = '', status = 200, statusText = '' } = {}) => ({
  ok,
  status,
  statusText,
  json: () => Promise.resolve(jsonData),
  text: () => Promise.resolve(textData),
})

describe('adminApi', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the default API base', () => {
    expect(getApiBase()).toBe('/api')
  })

  it('fetchAdminPins includes admin token', async () => {
    fetch.mockResolvedValue(buildResponse({ jsonData: [] }))

    const result = await fetchAdminPins({ token: 'secret' })

    expect(fetch).toHaveBeenCalledWith('/api/admin_pins.php', {
      headers: { 'X-Admin-Token': 'secret' },
    })
    expect(result).toEqual([])
  })

  it('fetchAdminPins surfaces API error text', async () => {
    fetch.mockResolvedValue(
      buildResponse({
        ok: false,
        status: 401,
        textData: JSON.stringify({ error: 'Unauthorized' }),
      })
    )

    await expect(fetchAdminPins({ token: 'bad' })).rejects.toThrow('HTTP 401: Unauthorized')
  })

  it('updatePinApprovalBulk posts approval payload', async () => {
    fetch.mockResolvedValue(buildResponse({ jsonData: { updated: 1 } }))

    const result = await updatePinApprovalBulk({ token: 'secret', ids: [1, 2], approved: true })

    expect(fetch).toHaveBeenCalledWith(
      '/api/admin_pins.php',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': 'secret',
        },
        body: JSON.stringify({ action: 'update_approval', ids: [1, 2], approved: true }),
      })
    )
    expect(result).toEqual({ updated: 1 })
  })

  it('deletePins posts delete payload', async () => {
    fetch.mockResolvedValue(buildResponse({ jsonData: { deleted: 2 } }))

    const result = await deletePins({ token: 'secret', ids: [3, 4] })

    expect(fetch).toHaveBeenCalledWith(
      '/api/admin_pins.php',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ action: 'delete', ids: [3, 4] }),
      })
    )
    expect(result).toEqual({ deleted: 2 })
  })

  it('fetchQuestions includes admin token', async () => {
    fetch.mockResolvedValue(buildResponse({ jsonData: [] }))

    const result = await fetchQuestions({ token: 'secret' })

    expect(fetch).toHaveBeenCalledWith('/api/admin_questions.php', {
      headers: { 'X-Admin-Token': 'secret' },
    })
    expect(result).toEqual([])
  })

  it('fetchLanguages includes admin token', async () => {
    fetch.mockResolvedValue(buildResponse({ jsonData: [] }))

    const result = await fetchLanguages({ token: 'secret' })

    expect(fetch).toHaveBeenCalledWith('/api/admin_languages.php', {
      headers: { 'X-Admin-Token': 'secret' },
    })
    expect(result).toEqual([])
  })

  it('upsertTranslation posts translation payload', async () => {
    fetch.mockResolvedValue(buildResponse({ jsonData: { ok: true } }))

    const result = await upsertTranslation({
      token: 'secret',
      translation_key: 'questions.note.label',
      lang: 'de',
      text: 'Anmerkung',
    })

    expect(fetch).toHaveBeenCalledWith(
      '/api/admin_translations.php',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': 'secret',
        },
        body: JSON.stringify({
          action: 'upsert',
          translation_key: 'questions.note.label',
          lang: 'de',
          text: 'Anmerkung',
        }),
      })
    )
    expect(result).toEqual({ ok: true })
  })
})
