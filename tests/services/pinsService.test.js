/**
 * Tests for pinsService filtering and pagination.
 * Exports: none.
 */
import { describe, expect, it } from 'vitest'
import { getFilteredPins, paginatePins } from '../../src/services/pinsService'

const basePins = [
  { id: 1, approved: 0, floor_index: 1, wellbeing: 20, note: 'hello', reasons: ['a'], created_at: '2024-01-01' },
  { id: 2, approved: 1, floor_index: 2, wellbeing: 80, note: 'world', reasons: ['b'], created_at: '2024-01-02' },
  { id: 3, approved: -1, floor_index: 3, wellbeing: 50, note: 'nope', reasons: [], created_at: '2023-12-31' },
]

describe('pinsService', () => {
  it('filters by approval state', () => {
    const pending = getFilteredPins(basePins, { filter: 'pending', query: '', sort: 'newest' })
    expect(pending.map((pin) => pin.id)).toEqual([1])
  })

  it('filters by query text', () => {
    const filtered = getFilteredPins(basePins, { filter: 'all', query: 'world', sort: 'newest' })
    expect(filtered.map((pin) => pin.id)).toEqual([2])
  })

  it('sorts by wellbeing', () => {
    const sorted = getFilteredPins(basePins, { filter: 'all', query: '', sort: 'wellbeing' })
    expect(sorted.map((pin) => pin.id)).toEqual([2, 3, 1])
  })

  it('paginates safely', () => {
    const result = paginatePins(basePins, 2, 2)
    expect(result.items.map((pin) => pin.id)).toEqual([3])
    expect(result.page).toBe(2)
    expect(result.maxPage).toBe(2)
  })
})
