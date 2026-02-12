/**
 * Questionnaires controller (admin: CRUD for questionnaires and slots).
 * Slots support drag-and-drop reordering and a search-dropdown for question selection.
 * Exports: createQuestionnairesController.
 */
import { icons } from '../utils/dom'
import { showModal, hideModal, bindModalClose } from '../utils/adminModal'
import { actionCell, checkTd, toggleTd } from '../utils/adminTable'

export function createQuestionnairesController({ state, views, api, shell, questionsApi }) {
  const view = views.questionnairesView

  // ── State ──────────────────────────────────────────────────────

  let questionnaires = []
  let availableQuestions = []

  // ── Load ───────────────────────────────────────────────────────

  const loadQuestionnaires = async () => {
    shell.setStatus('Loading questionnaires...', false)
    try {
      questionnaires = await api.fetchQuestionnaires({ token: state.token })
      renderList()
      shell.setStatus('')
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  const loadAvailableQuestions = async () => {
    try {
      availableQuestions = await questionsApi.fetchQuestions({ token: state.token })
    } catch (error) {
      availableQuestions = []
    }
  }

  // ── Render list ────────────────────────────────────────────────

  const renderList = () => {
    view.tableBody.innerHTML = ''
    if (!questionnaires.length) {
      view.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#94a3b8;">No questionnaires yet</td></tr>'
      return
    }
    questionnaires.forEach((q) => {
      const tr = document.createElement('tr')
      const actions = [{ type: 'edit', id: q.id, title: 'Edit questionnaire' }]
      if (!parseInt(q.is_default)) {
        actions.push({ type: 'delete', id: q.id, title: 'Delete questionnaire' })
      }
      tr.innerHTML = `
        <td><code>${esc(q.questionnaire_key)}</code></td>
        <td>${esc(q.name)}</td>
        <td>${q.slot_count || 0}</td>
        ${checkTd(parseInt(q.is_default))}
        ${toggleTd(parseInt(q.is_active), 'active', q.id)}
        ${actionCell(actions)}
      `
      view.tableBody.appendChild(tr)
    })
  }

  // ── Modal ──────────────────────────────────────────────────────

  let editingQuestionnaire = null

  const openEditModal = (questionnaire = null) => {
    editingQuestionnaire = questionnaire
    showModal(view.modal)
    view.editTitle.textContent = questionnaire ? 'Edit Questionnaire' : 'New Questionnaire'
    view.deleteBtn.style.display = (questionnaire && !parseInt(questionnaire.is_default)) ? '' : 'none'
    view.idInput.value = questionnaire ? questionnaire.id : ''
    view.keyInput.value = questionnaire ? questionnaire.questionnaire_key : ''
    view.keyInput.readOnly = questionnaire ? parseInt(questionnaire.is_default) : false
    view.nameInput.value = questionnaire ? questionnaire.name : ''
    view.descInput.value = questionnaire ? (questionnaire.description || '') : ''
    view.activeCheck.checked = questionnaire ? parseInt(questionnaire.is_active) : true

    if (questionnaire) {
      loadSlotsForQuestionnaire(parseInt(questionnaire.id))
    } else {
      renderSlots([])
    }
  }

  const closeEditModal = () => {
    hideModal(view.modal)
    view.slotsContainer.innerHTML = ''
    editingQuestionnaire = null
  }

  // ── Slots rendering ────────────────────────────────────────────

  const loadSlotsForQuestionnaire = async (qid) => {
    // TODO: Add a detail endpoint that returns slots
    renderSlots([])
  }

  const renderSlots = (slots) => {
    view.slotsContainer.innerHTML = ''
    slots.forEach((slot, index) => renderSlotRow(slot, index))
  }

  const getQuestionLabel = (key) => {
    const tKey = `questions.${key}.label`
    // Prefer English, fall back to any available language
    if (state.translationsByLang?.['en']?.[tKey]) return state.translationsByLang['en'][tKey]
    for (const lang of Object.keys(state.translationsByLang || {})) {
      if (state.translationsByLang[lang][tKey]) return state.translationsByLang[lang][tKey]
    }
    return key
  }

  const renderSlotRow = (slot, index) => {
    const row = document.createElement('div')
    row.className = 'slot-row'
    row.dataset.index = index
    row.draggable = false

    const selectedQuestions = slot.questions || []

    // Build chips HTML
    const chipsHtml = selectedQuestions.map((key) =>
      `<span class="chip" data-key="${esc(key)}">${esc(getQuestionLabel(key))} <button type="button" class="chip-remove" data-remove="${esc(key)}">&times;</button></span>`
    ).join('')

    row.innerHTML = `
      <div class="slot-header">
        <span class="slot-drag" title="Drag to reorder">⠿</span>
        <strong>Slot ${index + 1}</strong>
        <select class="slot-mode">
          <option value="fixed" ${slot.mode === 'fixed' ? 'selected' : ''}>Fixed</option>
          <option value="pool" ${slot.mode === 'pool' ? 'selected' : ''}>Pool</option>
        </select>
        <label class="slot-pool-count" ${slot.mode !== 'pool' ? 'style="display:none"' : ''}>
          Pick <input type="number" min="1" value="${slot.pool_count || 1}" class="slot-count-input" style="width:3rem" />
        </label>
        <label class="checkbox-label"><input type="checkbox" class="slot-required" ${slot.required ? 'checked' : ''} /> Required</label>
        <button class="icon-btn danger slot-remove" type="button" title="Remove slot">${icons.trash}</button>
      </div>
      <div class="slot-questions">
        <div class="chip-list">${chipsHtml}</div>
        <div class="search-dropdown-wrap">
          <input type="text" class="search-dropdown-input" placeholder="Search and add question..." />
          <div class="search-dropdown-menu" style="display:none"></div>
        </div>
      </div>
    `

    // Mode toggle
    const modeSelect = row.querySelector('.slot-mode')
    const poolCountLabel = row.querySelector('.slot-pool-count')
    const searchWrap = row.querySelector('.search-dropdown-wrap')

    const updateFixedLimit = () => {
      const isFixed = modeSelect.value === 'fixed'
      const chipCount = row.querySelectorAll('.chip').length
      searchWrap.style.display = (isFixed && chipCount >= 1) ? 'none' : ''
    }

    modeSelect.addEventListener('change', () => {
      poolCountLabel.style.display = modeSelect.value === 'pool' ? '' : 'none'
      updateFixedLimit()
    })

    // Remove slot
    row.querySelector('.slot-remove').addEventListener('click', () => row.remove())

    // Drag handle
    const dragHandle = row.querySelector('.slot-drag')
    dragHandle.addEventListener('mousedown', () => { row.draggable = true })
    dragHandle.addEventListener('mouseup', () => { row.draggable = false })

    // Chip remove
    row.querySelector('.chip-list').addEventListener('click', (e) => {
      const removeBtn = e.target.closest('.chip-remove')
      if (!removeBtn) return
      removeBtn.closest('.chip').remove()
      updateFixedLimit()
    })

    // Search dropdown
    setupSearchDropdown(row, updateFixedLimit)

    // Initial limit check
    updateFixedLimit()

    view.slotsContainer.appendChild(row)
  }

  const setupSearchDropdown = (row, onChipChange) => {
    const input = row.querySelector('.search-dropdown-input')
    const menu = row.querySelector('.search-dropdown-menu')
    const chipList = row.querySelector('.chip-list')

    const getSelectedKeys = () => {
      return Array.from(chipList.querySelectorAll('.chip')).map((c) => c.dataset.key)
    }

    const renderMenu = (filter) => {
      const selected = new Set(getSelectedKeys())
      const filtered = availableQuestions.filter((q) => {
        if (selected.has(q.question_key)) return false
        if (!filter) return true
        const label = getQuestionLabel(q.question_key).toLowerCase()
        return label.includes(filter) || q.question_key.toLowerCase().includes(filter)
      })
      menu.innerHTML = ''
      if (filtered.length === 0) {
        menu.innerHTML = '<div class="search-dropdown-empty">No matching questions</div>'
        menu.style.display = ''
        return
      }
      filtered.forEach((q) => {
        const item = document.createElement('button')
        item.type = 'button'
        item.className = 'search-dropdown-item'
        item.dataset.key = q.question_key
        item.textContent = `${getQuestionLabel(q.question_key)} (${q.question_key})`
        menu.appendChild(item)
      })
      menu.style.display = ''
    }

    input.addEventListener('focus', () => renderMenu(input.value.trim().toLowerCase()))
    input.addEventListener('input', () => renderMenu(input.value.trim().toLowerCase()))

    menu.addEventListener('click', (e) => {
      const item = e.target.closest('.search-dropdown-item')
      if (!item) return
      const key = item.dataset.key
      // Add chip
      const chip = document.createElement('span')
      chip.className = 'chip'
      chip.dataset.key = key
      chip.innerHTML = `${esc(getQuestionLabel(key))} <button type="button" class="chip-remove" data-remove="${esc(key)}">&times;</button>`
      chip.querySelector('.chip-remove').addEventListener('click', () => {
        chip.remove()
        if (onChipChange) onChipChange()
      })
      chipList.appendChild(chip)
      input.value = ''
      menu.style.display = 'none'
      if (onChipChange) onChipChange()
    })

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (!row.querySelector('.search-dropdown-wrap').contains(e.target)) {
        menu.style.display = 'none'
      }
    })
  }

  const addSlot = () => {
    const existingSlots = view.slotsContainer.querySelectorAll('.slot-row')
    const nextSort = (existingSlots.length + 1) * 10
    renderSlotRow({ mode: 'fixed', pool_count: 1, required: false, sort: nextSort, questions: [] }, existingSlots.length)
  }

  // ── Collect form data ──────────────────────────────────────────

  const collectSlots = () => {
    const rows = view.slotsContainer.querySelectorAll('.slot-row')
    return Array.from(rows).map((row, index) => {
      const mode = row.querySelector('.slot-mode').value
      const poolCount = parseInt(row.querySelector('.slot-count-input')?.value || '1')
      const required = row.querySelector('.slot-required').checked
      const sort = (index + 1) * 10
      const questions = Array.from(row.querySelectorAll('.chip')).map((c) => c.dataset.key)
      return { mode, pool_count: poolCount, required, sort, questions }
    })
  }

  // ── Save ───────────────────────────────────────────────────────

  const handleSave = async () => {
    const data = {
      questionnaire_key: view.keyInput.value.trim(),
      name: view.nameInput.value.trim(),
      description: view.descInput.value.trim() || null,
      is_active: view.activeCheck.checked,
    }
    const id = view.idInput.value ? parseInt(view.idInput.value) : null
    if (id) data.id = id

    if (!data.questionnaire_key || !data.name) {
      shell.setStatus('Key and Name are required', true)
      return
    }

    shell.setStatus('Saving...', false)
    try {
      const result = await api.upsertQuestionnaire({ token: state.token, ...data })
      const qid = result.id || id

      // Save slots
      const slots = collectSlots()
      if (qid && slots.length > 0) {
        await api.saveQuestionnaireSlots({ token: state.token, questionnaire_id: qid, slots })
      }

      shell.setStatus('Questionnaire saved', false)
      closeModal()
      await loadQuestionnaires()
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  // ── Delete ─────────────────────────────────────────────────────

  const handleDelete = async (id) => {
    if (!confirm('Delete this questionnaire?')) return
    shell.setStatus('Deleting...', false)
    try {
      await api.deleteQuestionnaire({ token: state.token, id })
      shell.setStatus('Deleted', false)
      closeEditModal()
      await loadQuestionnaires()
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  // ── Slot drag-and-drop ─────────────────────────────────────────

  let draggingSlot = null

  const bindSlotDragEvents = () => {
    const container = view.slotsContainer

    container.addEventListener('dragstart', (e) => {
      const row = e.target.closest('.slot-row')
      if (!row) return
      draggingSlot = row
      row.classList.add('dragging')
    })

    container.addEventListener('dragend', (e) => {
      const row = e.target.closest('.slot-row')
      if (row) {
        row.classList.remove('dragging')
        row.draggable = false
      }
      draggingSlot = null
    })

    container.addEventListener('dragover', (e) => {
      const row = e.target.closest('.slot-row')
      if (row && draggingSlot && row !== draggingSlot) {
        e.preventDefault()
        row.classList.add('drag-over')
      }
    })

    container.addEventListener('dragleave', (e) => {
      const row = e.target.closest('.slot-row')
      if (row) row.classList.remove('drag-over')
    })

    container.addEventListener('drop', (e) => {
      const row = e.target.closest('.slot-row')
      if (!row || !draggingSlot || row === draggingSlot) return
      e.preventDefault()
      row.classList.remove('drag-over')
      container.insertBefore(draggingSlot, row)
      // Renumber slot headers
      container.querySelectorAll('.slot-row').forEach((r, i) => {
        const strong = r.querySelector('.slot-header strong')
        if (strong) strong.textContent = `Slot ${i + 1}`
      })
    })
  }

  // ── Events ─────────────────────────────────────────────────────

  const bindEvents = () => {
    view.addBtn.addEventListener('click', async () => {
      await loadAvailableQuestions()
      openEditModal(null)
    })

    view.tableBody.addEventListener('change', async (e) => {
      const toggle = e.target.closest('[data-toggle="active"]')
      if (!toggle) return
      const id = parseInt(toggle.dataset.id)
      const q = questionnaires.find((q) => parseInt(q.id) === id)
      if (!q) return
      const newActive = toggle.checked
      try {
        await api.upsertQuestionnaire({
          token: state.token,
          id,
          questionnaire_key: q.questionnaire_key,
          name: q.name,
          is_active: newActive,
        })
        q.is_active = newActive ? 1 : 0
        shell.setStatus(`Questionnaire ${newActive ? 'activated' : 'deactivated'}`, false)
      } catch (error) {
        toggle.checked = !newActive
        shell.setStatus(error.message, true)
      }
    })

    view.tableBody.addEventListener('click', async (e) => {
      const editBtn = e.target.closest('[data-edit]')
      if (editBtn) {
        const id = parseInt(editBtn.dataset.edit)
        const q = questionnaires.find((q) => parseInt(q.id) === id)
        if (q) {
          await loadAvailableQuestions()
          openEditModal(q)
        }
        return
      }

      const deleteBtn = e.target.closest('[data-delete]')
      if (deleteBtn) {
        handleDelete(parseInt(deleteBtn.dataset.delete))
      }
    })

    view.saveBtn.addEventListener('click', handleSave)
    view.addSlotBtn.addEventListener('click', addSlot)

    view.deleteBtn.addEventListener('click', () => {
      if (editingQuestionnaire) handleDelete(parseInt(editingQuestionnaire.id))
    })

    bindModalClose(view.modal, closeEditModal, [view.cancelBtn, view.closeModalBtn])

    bindSlotDragEvents()
  }

  return { loadQuestionnaires, bindEvents }
}

function esc(str) {
  const div = document.createElement('div')
  div.textContent = str ?? ''
  return div.innerHTML
}
