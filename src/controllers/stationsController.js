/**
 * Stations controller (admin: CRUD for QR-code stations + capture mode).
 * Exports: createStationsController.
 */

export function createStationsController({ state, views, api, questionnairesApi, shell }) {
  const view = views.stationsView

  // ── State ──────────────────────────────────────────────────────

  let stations = []
  let questionnaires = []
  let captureWindow = null

  // ── Load ───────────────────────────────────────────────────────

  const loadStations = async () => {
    shell.setStatus('Loading stations...', false)
    try {
      ;[stations, questionnaires] = await Promise.all([
        api.fetchStations({ token: state.token }),
        questionnairesApi.fetchQuestionnaires({ token: state.token }),
      ])
      renderList()
      shell.setStatus('')
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  // ── Render list ────────────────────────────────────────────────

  const renderList = () => {
    view.tableBody.innerHTML = ''
    if (!stations.length) {
      view.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#94a3b8;">No stations yet</td></tr>'
      return
    }
    stations.forEach((s) => {
      const tr = document.createElement('tr')
      tr.innerHTML = `
        <td><code>${esc(s.station_key)}</code></td>
        <td>${esc(s.name)}</td>
        <td>${s.floor_index}</td>
        <td>${esc(s.questionnaire_name || '— Default —')}</td>
        <td>${parseInt(s.is_active) ? 'Yes' : 'No'}</td>
        <td>
          <button class="button ghost small" data-edit="${s.id}">Edit</button>
          <button class="button ghost small danger" data-delete="${s.id}">Delete</button>
        </td>
      `
      view.tableBody.appendChild(tr)
    })
  }

  // ── Edit form ──────────────────────────────────────────────────

  const openEditForm = (station = null) => {
    view.editSection.style.display = ''
    view.editTitle.textContent = station ? 'Edit Station' : 'New Station'
    view.idInput.value = station ? station.id : ''
    view.keyInput.value = station ? station.station_key : ''
    view.nameInput.value = station ? station.name : ''
    view.descInput.value = station ? (station.description || '') : ''
    view.floorInput.value = station ? station.floor_index : 0
    view.activeCheck.checked = station ? parseInt(station.is_active) : true

    view.camX.value = station ? station.camera_x : 0
    view.camY.value = station ? station.camera_y : 0
    view.camZ.value = station ? station.camera_z : 0
    view.tgtX.value = station ? station.target_x : 0
    view.tgtY.value = station ? station.target_y : 0
    view.tgtZ.value = station ? station.target_z : 0

    populateQuestionnaireSelect(station ? station.questionnaire_id : null)
  }

  const closeEditForm = () => {
    view.editSection.style.display = 'none'
  }

  const populateQuestionnaireSelect = (selectedId) => {
    const select = view.questionnaireSelect
    select.innerHTML = '<option value="">— Default —</option>'
    questionnaires.forEach((q) => {
      const option = document.createElement('option')
      option.value = q.id
      option.textContent = q.name
      if (selectedId && parseInt(q.id) === parseInt(selectedId)) {
        option.selected = true
      }
      select.appendChild(option)
    })
  }

  // ── Capture mode ───────────────────────────────────────────────

  const openCaptureMode = () => {
    // Get the webapp URL from the config or derive from current host
    const webappBase = import.meta.env.VITE_WEBAPP_BASE || 'https://feelvonroll.ch'
    const captureUrl = `${webappBase}?mode=capture`

    captureWindow = window.open(captureUrl, 'feelvonroll-capture', 'width=1200,height=800')

    // Listen for postMessage from the capture window
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'feelvonroll-capture') {
        const { camera, target, floor_index } = event.data
        if (camera) {
          view.camX.value = camera.x.toFixed(2)
          view.camY.value = camera.y.toFixed(2)
          view.camZ.value = camera.z.toFixed(2)
        }
        if (target) {
          view.tgtX.value = target.x.toFixed(2)
          view.tgtY.value = target.y.toFixed(2)
          view.tgtZ.value = target.z.toFixed(2)
        }
        if (floor_index !== undefined) {
          view.floorInput.value = floor_index
        }
        shell.setStatus('Position captured from webapp', false)
        window.removeEventListener('message', handleMessage)
        if (captureWindow && !captureWindow.closed) {
          captureWindow.close()
        }
        captureWindow = null
      }
    }
    window.addEventListener('message', handleMessage)
  }

  // ── Save ───────────────────────────────────────────────────────

  const handleSave = async () => {
    const data = {
      station_key: view.keyInput.value.trim(),
      name: view.nameInput.value.trim(),
      description: view.descInput.value.trim() || null,
      floor_index: parseInt(view.floorInput.value || '0'),
      camera_x: parseFloat(view.camX.value || '0'),
      camera_y: parseFloat(view.camY.value || '0'),
      camera_z: parseFloat(view.camZ.value || '0'),
      target_x: parseFloat(view.tgtX.value || '0'),
      target_y: parseFloat(view.tgtY.value || '0'),
      target_z: parseFloat(view.tgtZ.value || '0'),
      questionnaire_id: view.questionnaireSelect.value ? parseInt(view.questionnaireSelect.value) : null,
      is_active: view.activeCheck.checked,
    }
    const id = view.idInput.value ? parseInt(view.idInput.value) : null
    if (id) data.id = id

    if (!data.station_key || !data.name) {
      shell.setStatus('Key and Name are required', true)
      return
    }

    shell.setStatus('Saving...', false)
    try {
      await api.upsertStation({ token: state.token, ...data })
      shell.setStatus('Station saved', false)
      closeEditForm()
      await loadStations()
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  // ── Delete ─────────────────────────────────────────────────────

  const handleDelete = async (id) => {
    if (!confirm('Delete this station?')) return
    shell.setStatus('Deleting...', false)
    try {
      await api.deleteStation({ token: state.token, id })
      shell.setStatus('Deleted', false)
      await loadStations()
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  // ── Events ─────────────────────────────────────────────────────

  const bindEvents = () => {
    view.addBtn.addEventListener('click', () => openEditForm(null))

    view.tableBody.addEventListener('click', (e) => {
      const editBtn = e.target.closest('[data-edit]')
      if (editBtn) {
        const id = parseInt(editBtn.dataset.edit)
        const s = stations.find((s) => parseInt(s.id) === id)
        if (s) openEditForm(s)
        return
      }

      const deleteBtn = e.target.closest('[data-delete]')
      if (deleteBtn) {
        handleDelete(parseInt(deleteBtn.dataset.delete))
      }
    })

    view.saveBtn.addEventListener('click', handleSave)
    view.cancelBtn.addEventListener('click', closeEditForm)
    view.captureBtn.addEventListener('click', openCaptureMode)
  }

  return { loadStations, bindEvents }
}

function esc(str) {
  const div = document.createElement('div')
  div.textContent = str ?? ''
  return div.innerHTML
}
