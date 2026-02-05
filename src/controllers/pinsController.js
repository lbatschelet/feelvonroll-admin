/**
 * Pins controller orchestrates loader, renderer, and actions.
 * Exports: createPinsController.
 */
import { createPinsLoader } from './pins/loader'
import { createPinsRenderer } from './pins/renderer'
import { createPinsActions } from './pins/actions'

export function createPinsController({ state, views, api, shell, renderDashboard }) {
  const loader = createPinsLoader({ state, api })
  const renderer = createPinsRenderer({ state, views, api, shell })
  const actions = createPinsActions({ state, views, api, shell, render: renderer })

  const loadPins = async () => {
    shell.setStatus('Lade Pins...', false)
    try {
      await loader.loadPins()
      state.error = ''
      renderer.renderPins()
      renderDashboard()
      shell.setStatus(`Verbunden (${state.pins.length} Einträge)`, false)
    } catch (error) {
      state.error = error.message
      renderer.renderPins()
      renderDashboard()
      shell.setStatus(error.message, true)
    }
  }

  const bindEvents = () => {
    const {
      reloadButton,
      pageSizeSelect,
      prevPageButton,
      nextPageButton,
      searchInput,
      filterSelect,
      sortSelect,
      approveSelected,
      pendingSelected,
      blockSelected,
      deleteSelected,
      selectAll,
      pinsBody,
    } = views.pinsView

    reloadButton.addEventListener('click', () => loadPins())
    searchInput.addEventListener('input', (event) => {
      state.query = event.target.value.toLowerCase()
      state.pageIndex = 1
      renderer.renderPins()
    })
    filterSelect.addEventListener('change', (event) => {
      state.filter = event.target.value
      state.pageIndex = 1
      renderer.renderPins()
    })
    sortSelect.addEventListener('change', (event) => {
      state.sort = event.target.value
      state.pageIndex = 1
      renderer.renderPins()
    })
    pageSizeSelect.addEventListener('change', (event) => {
      state.pageSize = Number(event.target.value)
      state.pageIndex = 1
      renderer.renderPins()
    })
    prevPageButton.addEventListener('click', () => {
      state.pageIndex = Math.max(1, state.pageIndex - 1)
      renderer.renderPins()
    })
    nextPageButton.addEventListener('click', () => {
      state.pageIndex += 1
      renderer.renderPins()
    })
    approveSelected.addEventListener('click', () => actions.bulkUpdateApproval(1))
    pendingSelected.addEventListener('click', () => actions.bulkUpdateApproval(0))
    blockSelected.addEventListener('click', () => actions.bulkUpdateApproval(-1))
    deleteSelected.addEventListener('click', actions.bulkDelete)
    selectAll.addEventListener('change', () => {
      const checked = selectAll.checked
      pinsBody.querySelectorAll('input[type="checkbox"][data-id]').forEach((input) => {
        input.checked = checked
      })
    })
  }

  return { bindEvents, loadPins, renderPins: renderer.renderPins }
}
