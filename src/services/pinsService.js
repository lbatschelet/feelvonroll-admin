/**
 * Pin data helpers for filtering, sorting, and pagination.
 * Exports: getFilteredPins, paginatePins.
 */
export function getFilteredPins(pins, { filter, query, sort }) {
  const filtered = pins.filter((pin) => {
    if (filter === 'pending' && pin.approved !== 0) return false
    if (filter === 'approved' && pin.approved !== 1) return false
    if (filter === 'rejected' && pin.approved !== -1) return false

    if (!query) return true
    const haystack = [
      pin.id,
      pin.floor_index,
      pin.wellbeing,
      pin.note || '',
      Array.isArray(pin.reasons) ? pin.reasons.join(' ') : '',
      pin.group_key || '',
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(query)
  })

  return filtered.sort((a, b) => {
    if (sort === 'oldest') {
      return new Date(a.created_at) - new Date(b.created_at)
    }
    if (sort === 'floor') {
      return a.floor_index - b.floor_index
    }
    if (sort === 'wellbeing') {
      return b.wellbeing - a.wellbeing
    }
    return new Date(b.created_at) - new Date(a.created_at)
  })
}

export function paginatePins(pins, pageIndex, pageSize) {
  const total = pins.length
  const maxPage = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(pageIndex, 1), maxPage)
  const start = (safePage - 1) * pageSize
  return {
    items: pins.slice(start, start + pageSize),
    page: safePage,
    total,
    maxPage,
  }
}
