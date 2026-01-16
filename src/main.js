import './style.css'
import { deletePins, fetchAdminPins, updatePinApprovalBulk } from './adminApi'

const app = document.querySelector('#app')

const state = {
  token: localStorage.getItem('admin_token') || '',
  pins: [],
  error: '',
  query: '',
  filter: 'all',
  sort: 'newest',
  loggedIn: false,
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

const loginCard = document.createElement('section')
loginCard.className = 'card login-card'
loginCard.innerHTML = `
  <h2>Admin Login</h2>
  <div class="form-row">
    <label>Admin Token</label>
    <input type="password" id="adminToken" placeholder="Token" />
  </div>
  <div class="form-actions">
    <button id="loginButton">Verbinden</button>
  </div>
`
layout.appendChild(loginCard)

const status = document.createElement('div')
status.className = 'status'
layout.appendChild(status)

const toolsCard = document.createElement('section')
toolsCard.className = 'card tools-card'
toolsCard.innerHTML = `
  <div class="tools">
    <input type="text" id="searchInput" placeholder="Suche (ID, Etage, Text)" />
    <select id="filterSelect">
      <option value="all">Alle</option>
      <option value="pending">Wartet</option>
      <option value="approved">Freigegeben</option>
      <option value="rejected">Abgelehnt</option>
    </select>
    <select id="sortSelect">
      <option value="newest">Neueste zuerst</option>
      <option value="oldest">Älteste zuerst</option>
      <option value="floor">Etage</option>
      <option value="wellbeing">Wohlbefinden</option>
    </select>
    <button id="reloadPins">Pins laden</button>
  </div>
`
layout.appendChild(toolsCard)

const tableCard = document.createElement('section')
tableCard.className = 'card'
tableCard.innerHTML = `
  <div class="card-header">
    <h2>Pins</h2>
    <div class="header-actions">
      <span id="pinCount">0</span>
      <button id="approveSelected" class="ghost">Freigeben</button>
      <button id="pendingSelected" class="ghost">Wartend</button>
      <button id="blockSelected" class="ghost">Ablehnen</button>
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

const tokenInput = loginCard.querySelector('#adminToken')
const loginButton = loginCard.querySelector('#loginButton')
const reloadButton = toolsCard.querySelector('#reloadPins')
const searchInput = toolsCard.querySelector('#searchInput')
const filterSelect = toolsCard.querySelector('#filterSelect')
const sortSelect = toolsCard.querySelector('#sortSelect')
const pinCount = tableCard.querySelector('#pinCount')
const approveSelected = tableCard.querySelector('#approveSelected')
const pendingSelected = tableCard.querySelector('#pendingSelected')
const blockSelected = tableCard.querySelector('#blockSelected')
const deleteSelected = tableCard.querySelector('#deleteSelected')
const selectAll = tableCard.querySelector('#selectAll')
const pinsBody = tableCard.querySelector('#pinsBody')

tokenInput.value = state.token

loginButton.addEventListener('click', () => handleLogin())
reloadButton.addEventListener('click', () => loadPins())
searchInput.addEventListener('input', (event) => {
  state.query = event.target.value.trim().toLowerCase()
  renderPins()
})
filterSelect.addEventListener('change', (event) => {
  state.filter = event.target.value
  renderPins()
})
sortSelect.addEventListener('change', (event) => {
  state.sort = event.target.value
  renderPins()
})

approveSelected.addEventListener('click', () => bulkUpdateApproval(1))
pendingSelected.addEventListener('click', () => bulkUpdateApproval(0))
blockSelected.addEventListener('click', () => bulkUpdateApproval(-1))
deleteSelected.addEventListener('click', bulkDelete)
selectAll.addEventListener('change', () => {
  const checked = selectAll.checked
  pinsBody.querySelectorAll('input[type="checkbox"][data-id]').forEach((input) => {
    input.checked = checked
  })
})

applyVisibility()

async function loadPins() {
  setStatus('Lade Pins...', false)
  try {
    const rawPins = await fetchAdminPins({ token: state.token })
    state.pins = rawPins.map(normalizePin)
    state.error = ''
    renderPins()
    setStatus(`Verbunden (${state.pins.length} Einträge)`, false)
  } catch (error) {
    state.error = error.message
    renderPins()
    setStatus(error.message, true)
  }
}

function normalizePin(pin) {
  return {
    ...pin,
    id: Number(pin.id),
    floor_index: Number(pin.floor_index),
    position_x: Number(pin.position_x),
    position_y: Number(pin.position_y),
    position_z: Number(pin.position_z),
    wellbeing: Number(pin.wellbeing),
    approved: Number(pin.approved),
  }
}

function renderPins() {
  pinsBody.innerHTML = ''
  pinCount.textContent = String(getFilteredPins().length)

  const filteredPins = getFilteredPins()
  if (!filteredPins.length) {
    const row = document.createElement('tr')
    row.innerHTML = `<td colspan="8" class="empty">Keine Pins vorhanden</td>`
    pinsBody.appendChild(row)
    return
  }

  filteredPins.forEach((pin) => {
    const row = document.createElement('tr')
    const reasons = Array.isArray(pin.reasons) ? pin.reasons.join(', ') : ''
    const statusLabel = getStatusLabel(pin.approved)
    row.innerHTML = `
      <td><input type="checkbox" data-id="${pin.id}" /></td>
      <td>${pin.id}</td>
      <td>${pin.floor_index}</td>
      <td>${pin.wellbeing}/10</td>
      <td>${reasons}</td>
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
        await updatePinApprovalBulk({
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

function getNextStatus(current) {
  if (current === 1) return -1
  if (current === -1) return 0
  return 1
}

function getStatusLabel(status) {
  if (status === 1) return 'Freigegeben'
  if (status === -1) return 'Abgelehnt'
  return 'Wartet'
}

function getStatusClass(status) {
  if (status === 1) return 'approved'
  if (status === -1) return 'rejected'
  return 'pending'
}

async function bulkUpdateApproval(approved) {
  const ids = getSelectedIds()
  if (!ids.length) {
    setStatus('Keine Pins ausgewählt', true)
    return
  }
  setStatus('Speichere...', false)
  try {
    await updatePinApprovalBulk({ token: state.token, ids, approved })
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
    await deletePins({ token: state.token, ids })
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

async function handleLogin() {
  state.token = tokenInput.value.trim()
  localStorage.setItem('admin_token', state.token)
  await loadPins()
  if (!state.error) {
    state.loggedIn = true
    applyVisibility()
  }
}

function applyVisibility() {
  loginCard.style.display = state.loggedIn ? 'none' : 'block'
  toolsCard.style.display = state.loggedIn ? 'block' : 'none'
  tableCard.style.display = state.loggedIn ? 'block' : 'none'
}

function getFilteredPins() {
  const filtered = state.pins.filter((pin) => {
    if (state.filter === 'approved' && !pin.approved) return false
    if (state.filter === 'pending' && pin.approved !== 0) return false
    if (state.filter === 'approved' && pin.approved !== 1) return false
    if (state.filter === 'rejected' && pin.approved !== -1) return false

    if (!state.query) return true
    const haystack = [
      pin.id,
      pin.floor_index,
      pin.wellbeing,
      pin.note || '',
      Array.isArray(pin.reasons) ? pin.reasons.join(' ') : '',
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(state.query)
  })

  return filtered.sort((a, b) => {
    if (state.sort === 'oldest') {
      return new Date(a.created_at) - new Date(b.created_at)
    }
    if (state.sort === 'floor') {
      return a.floor_index - b.floor_index
    }
    if (state.sort === 'wellbeing') {
      return b.wellbeing - a.wellbeing
    }
    return new Date(b.created_at) - new Date(a.created_at)
  })
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
