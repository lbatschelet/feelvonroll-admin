/**
 * Pins actions for bulk updates and selection handling.
 * Exports: createPinsActions.
 */
export function createPinsActions({ state, views, api, shell, render }) {
  const { pinsBody } = views.pinsView

  const getSelectedIds = () =>
    Array.from(pinsBody.querySelectorAll('input[type="checkbox"][data-id]:checked')).map(
      (input) => Number(input.dataset.id)
    )

  const bulkUpdateApproval = async (approved) => {
    const ids = getSelectedIds()
    if (!ids.length) {
      shell.setStatus('Keine Pins ausgewählt', true)
      return
    }
    shell.setStatus('Speichere...', false)
    try {
      await api.updatePinApprovalBulk({ token: state.token, ids, approved })
      state.pins.forEach((pin) => {
        if (ids.includes(pin.id)) {
          pin.approved = approved
        }
      })
      render.renderPins()
      shell.setStatus(`Aktualisiert (${ids.length})`, false)
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  const bulkDelete = async () => {
    const ids = getSelectedIds()
    if (!ids.length) {
      shell.setStatus('Keine Pins ausgewählt', true)
      return
    }
    const confirmed = window.confirm(`Pins wirklich löschen? (${ids.length})`)
    if (!confirmed) return
    shell.setStatus('Lösche...', false)
    try {
      await api.deletePins({ token: state.token, ids })
      state.pins = state.pins.filter((pin) => !ids.includes(pin.id))
      render.renderPins()
      shell.setStatus(`Gelöscht (${ids.length})`, false)
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  return { bulkUpdateApproval, bulkDelete }
}
