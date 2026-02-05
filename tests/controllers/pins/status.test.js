/**
 * Tests for pin status helpers.
 */
import { describe, expect, it } from 'vitest'
import { getNextStatus, getStatusClass, getStatusLabel } from '../../../src/controllers/pins/status'

describe('pin status helpers', () => {
  it('cycles status correctly', () => {
    expect(getNextStatus(1)).toBe(-1)
    expect(getNextStatus(-1)).toBe(0)
    expect(getNextStatus(0)).toBe(1)
  })

  it('maps status to label and class', () => {
    expect(getStatusLabel(1)).toBe('Freigegeben')
    expect(getStatusLabel(-1)).toBe('Abgelehnt')
    expect(getStatusLabel(0)).toBe('Wartet')
    expect(getStatusClass(1)).toBe('approved')
    expect(getStatusClass(-1)).toBe('rejected')
    expect(getStatusClass(0)).toBe('pending')
  })
})
