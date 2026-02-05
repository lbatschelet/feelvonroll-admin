/**
 * Pins renderer for table rows and pagination UI.
 * Exports: createPinsRenderer.
 */
import { escapeHtml, formatDate, formatPercent } from '../../utils/format'
import { getFilteredPins, paginatePins } from '../../services/pinsService'
import { getStatusClass, getStatusLabel, getNextStatus } from './status'

export function createPinsRenderer({ state, views, api, shell }) {
  const {
    pinCount,
    pageInfo,
    prevPageButton,
    nextPageButton,
    pinsBody,
  } = views.pinsView

  const translateOption = (questionKey, optionKey) => {
    const key = `options.${questionKey}.${optionKey}`
    return state.translations[key] || optionKey
  }

  const renderPins = () => {
    pinsBody.innerHTML = ''
    const filteredPins = getFilteredPins(state.pins, {
      filter: state.filter,
      query: state.query,
      sort: state.sort,
    })
    const { items: pagePins, page, total, maxPage } = paginatePins(
      filteredPins,
      state.pageIndex,
      state.pageSize
    )
    state.pageIndex = page
    pinCount.textContent = String(total)

    pageInfo.textContent = `Seite ${page} von ${maxPage}`
    prevPageButton.disabled = page <= 1
    nextPageButton.disabled = page >= maxPage

    if (!pagePins.length) {
      const row = document.createElement('tr')
      row.innerHTML = `<td colspan="9" class="empty">Keine Pins vorhanden</td>`
      pinsBody.appendChild(row)
      return
    }

    pagePins.forEach((pin) => {
      const row = document.createElement('tr')
      const reasons = Array.isArray(pin.reasons)
        ? pin.reasons.map((key) => translateOption('reasons', key)).join(', ')
        : ''
      const groupLabel = pin.group_key ? translateOption('group', pin.group_key) : ''
      const statusLabel = getStatusLabel(pin.approved)
      row.innerHTML = `
        <td><input type="checkbox" data-id="${pin.id}" /></td>
        <td>${pin.id}</td>
        <td>${pin.floor_index}</td>
        <td>${formatPercent(pin.wellbeing)}</td>
        <td>${reasons}</td>
        <td>${groupLabel}</td>
        <td>${escapeHtml(pin.note || '')}</td>
        <td>${formatDate(pin.created_at)}</td>
        <td>
          <button class="toggle ${getStatusClass(pin.approved)}" data-id="${pin.id}">
            ${statusLabel}
          </button>
        </td>
      `
      pinsBody.appendChild(row)
    })

    pinsBody.querySelectorAll('.toggle').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = Number(button.dataset.id)
        const pin = state.pins.find((item) => item.id === id)
        if (!pin) return
        const nextApproved = getNextStatus(pin.approved)
        button.disabled = true
        try {
          await api.updatePinApprovalBulk({
            token: state.token,
            ids: [id],
            approved: nextApproved,
          })
          pin.approved = nextApproved
          renderPins()
        } catch (error) {
          shell.setStatus(error.message, true)
          button.disabled = false
        }
      })
    })
  }

  return { renderPins }
}
