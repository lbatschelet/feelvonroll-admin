/**
 * Pins renderer for table rows and pagination UI.
 * Exports: createPinsRenderer.
 */
import { escapeHtml, formatDate, formatPercent } from '../../utils/format'
import { getFilteredPins, paginatePins } from '../../services/pinsService'
import { getStatusClass, getStatusLabel, getNextStatus } from './status'
import { updatePagination, emptyRow } from '../../utils/adminTable'

export function createPinsRenderer({ state, views, api, shell }) {
  const {
    pinCount,
    pageInfo,
    firstPageButton,
    prevPageButton,
    nextPageButton,
    lastPageButton,
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

    updatePagination({
      page,
      maxPage,
      pageInfo,
      firstBtn: firstPageButton,
      prevBtn: prevPageButton,
      nextBtn: nextPageButton,
      lastBtn: lastPageButton,
    })

    if (!pagePins.length) {
      pinsBody.innerHTML = emptyRow(10, 'No pins found')
      return
    }

    pagePins.forEach((pin) => {
      const row = document.createElement('tr')
      const reasons = Array.isArray(pin.reasons)
        ? pin.reasons.map((key) => translateOption('reasons', key)).join(', ')
        : ''
      const groupLabel = pin.group_key ? translateOption('group', pin.group_key) : ''
      const statusLabel = getStatusLabel(pin.approved)
      const stationLabel = pin.station_key ? escapeHtml(pin.station_key) : ''
      row.innerHTML = `
        <td><input type="checkbox" data-id="${pin.id}" /></td>
        <td>${pin.id}</td>
        <td>${pin.floor_index}</td>
        <td>${stationLabel}</td>
        <td>${formatPercent(pin.wellbeing)}</td>
        <td>${reasons}</td>
        <td>${groupLabel}</td>
        <td><div class="note-cell${(pin.note || '').length > 120 ? ' clamped' : ''}">${escapeHtml(pin.note || '')}</div></td>
        <td>${formatDate(pin.created_at)}</td>
        <td class="text-right">
          <button class="toggle ${getStatusClass(pin.approved)}" data-id="${pin.id}" title="Click to cycle status">
            ${statusLabel}
          </button>
        </td>
      `
      pinsBody.appendChild(row)
    })

    pinsBody.querySelectorAll('.note-cell.clamped').forEach((cell) => {
      cell.addEventListener('click', () => {
        cell.classList.toggle('clamped')
        cell.classList.toggle('expanded')
      })
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
