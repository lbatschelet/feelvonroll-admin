/**
 * Tests for auditService pagination formatting.
 * Exports: none.
 */
import { describe, expect, it } from 'vitest'
import { formatAuditInfo, getAuditRange } from '../../src/services/auditService'

describe('auditService', () => {
  it('formats empty audit info', () => {
    expect(formatAuditInfo({ offset: 0, limit: 50, total: 0 })).toBe('0')
  })

  it('formats audit ranges', () => {
    const range = getAuditRange({ offset: 50, limit: 50, total: 120 })
    expect(range).toEqual({ start: 51, end: 100 })
    expect(formatAuditInfo({ offset: 50, limit: 50, total: 120 })).toBe('51-100 of 120')
  })
})
