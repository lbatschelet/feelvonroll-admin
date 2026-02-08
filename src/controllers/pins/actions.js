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
      shell.setStatus('No pins selected', true)
      return
    }
    shell.setStatus('Saving...', false)
    try {
      await api.updatePinApprovalBulk({ token: state.token, ids, approved })
      state.pins.forEach((pin) => {
        if (ids.includes(pin.id)) {
          pin.approved = approved
        }
      })
      render.renderPins()
      shell.setStatus(`Updated (${ids.length})`, false)
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  const bulkDelete = async () => {
    const ids = getSelectedIds()
    if (!ids.length) {
      shell.setStatus('No pins selected', true)
      return
    }
    const confirmed = window.confirm(`Delete selected pins? (${ids.length})`)
    if (!confirmed) return
    shell.setStatus('Deleting...', false)
    try {
      await api.deletePins({ token: state.token, ids })
      state.pins = state.pins.filter((pin) => !ids.includes(pin.id))
      render.renderPins()
      shell.setStatus(`Deleted (${ids.length})`, false)
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  const exportCsv = async () => {
    shell.setStatus('Exporting CSV...', false)
    try {
      const { blob } = await api.exportPinsCsv({ token: state.token })
      const now = new Date()
      const date = String(now.getFullYear())
        + String(now.getMonth() + 1).padStart(2, '0')
        + String(now.getDate()).padStart(2, '0')
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${date}_feelvonRoll_pins.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      shell.setStatus('CSV exported', false)
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  return { bulkUpdateApproval, bulkDelete, exportCsv }
}
