import './style.css'
import { deletePins, fetchAdminPins, getDefaultApiBase, updatePinApprovalBulk } from './adminApi'

const app = document.querySelector('#app')

const state = {
  apiBase: localStorage.getItem('admin_api_base') || getDefaultApiBase(),
  token: localStorage.getItem('admin_token') || '',
  pins: [],
  error: '',
}

const layout = document.createElement('div')
layout.className = 'layout'

const header = document.createElement('header')
header.className = 'header'
header.innerHTML = `
  <div>
    <h1>Feelvonroll Admin</h1>
    <p>Verwalte Pins und Freigaben</p>
  </div>
`
layout.appendChild(header)

const configCard = document.createElement('section')
configCard.className = 'card'
configCard.innerHTML = `
  <h2>API Verbindung</h2>
  <div class="form-row">
    <label>API Base</label>
    <input type="text" id="apiBase" placeholder="https://domain.tld/api" />
  </div>
  <div class="form-row">
    <label>Admin Token</label>
    <input type="password" id="adminToken" placeholder="Token" />
  </div>
  <div class="form-actions">
    <button id="saveConfig">Speichern</button>
    <button id="reloadPins">Pins laden</button>
  </div>
`
layout.appendChild(configCard)

const status = document.createElement('div')
status.className = 'status'
layout.appendChild(status)

const tableCard = document.createElement('section')
tableCard.className = 'card'
tableCard.innerHTML = `
  <div class="card-header">
    <h2>Pins</h2>
    <div class="header-actions">
      <span id="pinCount">0</span>
      <button id="approveSelected" class="ghost">Freigeben</button>
      <button id="blockSelected" class="ghost">Sperren</button>
      <button id="deleteSelected" class="danger">Löschen</button>
    </div>
    </div>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th><input type="checkbox" id="selectAll" /></th>
          <th>ID</th>
          <th>Etage</th>
          <th>Wohlbefinden</th>
          <th>Gründe</th>
          <th>Notiz</th>
          <th>Erstellt</th>
          <th>Freigabe</th>
        </tr>
      </thead>
      <tbody id="pinsBody"></tbody>
    </table>
  </div>
`
layout.appendChild(tableCard)

app.appendChild(layout)

const apiBaseInput = configCard.querySelector('#apiBase')
const tokenInput = configCard.querySelector('#adminToken')
const saveButton = configCard.querySelector('#saveConfig')
const reloadButton = configCard.querySelector('#reloadPins')
const pinCount = tableCard.querySelector('#pinCount')
const approveSelected = tableCard.querySelector('#approveSelected')
const blockSelected = tableCard.querySelector('#blockSelected')
const deleteSelected = tableCard.querySelector('#deleteSelected')
const selectAll = tableCard.querySelector('#selectAll')
const pinsBody = tableCard.querySelector('#pinsBody')

apiBaseInput.value = state.apiBase
tokenInput.value = state.token

saveButton.addEventListener('click', () => {
  state.apiBase = apiBaseInput.value.trim() || getDefaultApiBase()
  state.token = tokenInput.value.trim()
  localStorage.setItem('admin_api_base', state.apiBase)
  localStorage.setItem('admin_token', state.token)
  setStatus('Gespeichert', false)
})

reloadButton.addEventListener('click', () => {
  loadPins()
})

approveSelected.addEventListener('click', () => bulkUpdateApproval(1))
blockSelected.addEventListener('click', () => bulkUpdateApproval(0))
deleteSelected.addEventListener('click', bulkDelete)
selectAll.addEventListener('change', () => {
  const checked = selectAll.checked
  pinsBody.querySelectorAll('input[type="checkbox"][data-id]').forEach((input) => {
    input.checked = checked
  })
})

loadPins()

async function loadPins() {
  setStatus('Lade Pins...', false)
  try {
    state.pins = await fetchAdminPins({ apiBase: state.apiBase, token: state.token })
    state.error = ''
    renderPins()
    setStatus(`Verbunden (${state.pins.length} Einträge)`, false)
  } catch (error) {
    state.error = error.message
    renderPins()
    setStatus(error.message, true)
  }
}

function renderPins() {
  pinsBody.innerHTML = ''
  pinCount.textContent = String(state.pins.length)

  if (!state.pins.length) {
    const row = document.createElement('tr')
    row.innerHTML = `<td colspan="7" class="empty">Keine Pins vorhanden</td>`
    pinsBody.appendChild(row)
    return
  }

  state.pins.forEach((pin) => {
    const row = document.createElement('tr')
    const reasons = Array.isArray(pin.reasons) ? pin.reasons.join(', ') : ''
    row.innerHTML = `
      <td><input type="checkbox" data-id="${pin.id}" /></td>
      <td>${pin.id}</td>
      <td>${pin.floor_index}</td>
      <td>${pin.wellbeing}/10</td>
      <td>${reasons}</td>
      <td>${escapeHtml(pin.note || '')}</td>
      <td>${formatDate(pin.created_at)}</td>
      <td>
        <button class="toggle ${pin.approved ? 'approved' : ''}" data-id="${pin.id}">
          ${pin.approved ? 'Freigegeben' : 'Gesperrt'}
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
      const nextApproved = pin.approved ? 0 : 1
      button.disabled = true
      try {
        await updatePinApprovalBulk({
          apiBase: state.apiBase,
          token: state.token,
          ids: [id],
          approved: nextApproved,
        })
        pin.approved = nextApproved
        renderPins()
      } catch (error) {
        setStatus(error.message, true)
        button.disabled = false
      }
    })
  })
}

async function bulkUpdateApproval(approved) {
  const ids = getSelectedIds()
  if (!ids.length) {
    setStatus('Keine Pins ausgewählt', true)
    return
  }
  setStatus('Speichere...', false)
  try {
    await updatePinApprovalBulk({ apiBase: state.apiBase, token: state.token, ids, approved })
    state.pins.forEach((pin) => {
      if (ids.includes(pin.id)) {
        pin.approved = approved
      }
    })
    renderPins()
    setStatus(`Aktualisiert (${ids.length})`, false)
  } catch (error) {
    setStatus(error.message, true)
  }
}

async function bulkDelete() {
  const ids = getSelectedIds()
  if (!ids.length) {
    setStatus('Keine Pins ausgewählt', true)
    return
  }
  const confirmed = window.confirm(`Pins wirklich löschen? (${ids.length})`)
  if (!confirmed) return
  setStatus('Lösche...', false)
  try {
    await deletePins({ apiBase: state.apiBase, token: state.token, ids })
    state.pins = state.pins.filter((pin) => !ids.includes(pin.id))
    renderPins()
    setStatus(`Gelöscht (${ids.length})`, false)
  } catch (error) {
    setStatus(error.message, true)
  }
}

function getSelectedIds() {
  return Array.from(pinsBody.querySelectorAll('input[type="checkbox"][data-id]:checked')).map(
    (input) => Number(input.dataset.id)
  )
}

function setStatus(message, isError) {
  status.textContent = message
  status.className = `status ${isError ? 'error' : ''}`
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('de-CH')
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
