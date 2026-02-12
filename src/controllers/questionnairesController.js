/**
 * Questionnaires controller (admin: CRUD for questionnaires and slots).
 * Exports: createQuestionnairesController.
 */

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
      tr.innerHTML = `
        <td><code>${esc(q.questionnaire_key)}</code></td>
        <td>${esc(q.name)}</td>
        <td>${q.slot_count || 0}</td>
        <td>${parseInt(q.is_default) ? 'Yes' : ''}</td>
        <td>${parseInt(q.is_active) ? 'Yes' : 'No'}</td>
        <td>
          <button class="button ghost small" data-edit="${q.id}">Edit</button>
          ${parseInt(q.is_default) ? '' : `<button class="button ghost small danger" data-delete="${q.id}">Delete</button>`}
        </td>
      `
      view.tableBody.appendChild(tr)
    })
  }

  // ── Render edit form ───────────────────────────────────────────

  const openEditForm = (questionnaire = null) => {
    view.editSection.style.display = ''
    view.editTitle.textContent = questionnaire ? 'Edit Questionnaire' : 'New Questionnaire'
    view.idInput.value = questionnaire ? questionnaire.id : ''
    view.keyInput.value = questionnaire ? questionnaire.questionnaire_key : ''
    view.nameInput.value = questionnaire ? questionnaire.name : ''
    view.descInput.value = questionnaire ? (questionnaire.description || '') : ''
    view.activeCheck.checked = questionnaire ? parseInt(questionnaire.is_active) : true
    view.keyInput.disabled = questionnaire ? parseInt(questionnaire.is_default) : false

    if (questionnaire) {
      loadSlotsForQuestionnaire(parseInt(questionnaire.id))
    } else {
      renderSlots([])
    }
  }

  const closeEditForm = () => {
    view.editSection.style.display = 'none'
    view.slotsContainer.innerHTML = ''
  }

  // ── Slots rendering ────────────────────────────────────────────

  let currentSlots = []

  const loadSlotsForQuestionnaire = async (qid) => {
    // We need to get slot details -- for now derive from questionnaires data
    // The admin endpoint could return slots; for now we'll use a simpler approach
    // by loading the questionnaire detail. For MVP, start with empty and let user rebuild.
    // TODO: Add a detail endpoint that returns slots
    renderSlots([])
  }

  const renderSlots = (slots) => {
    currentSlots = slots
    view.slotsContainer.innerHTML = ''
    slots.forEach((slot, index) => renderSlotRow(slot, index))
  }

  const renderSlotRow = (slot, index) => {
    const row = document.createElement('div')
    row.className = 'slot-row'
    row.dataset.index = index

    const questionCheckboxes = availableQuestions.map((q) => {
      const checked = (slot.questions || []).includes(q.question_key) ? 'checked' : ''
      return `<label class="slot-question-label"><input type="checkbox" value="${esc(q.question_key)}" ${checked} /> ${esc(q.question_key)}</label>`
    }).join('')

    row.innerHTML = `
      <div class="slot-header">
        <strong>Slot ${index + 1}</strong>
        <select class="slot-mode">
          <option value="fixed" ${slot.mode === 'fixed' ? 'selected' : ''}>Fixed</option>
          <option value="pool" ${slot.mode === 'pool' ? 'selected' : ''}>Pool</option>
        </select>
        <label class="slot-pool-count" ${slot.mode !== 'pool' ? 'style="display:none"' : ''}>
          Pick <input type="number" min="1" value="${slot.pool_count || 1}" class="slot-count-input" style="width:3rem" />
        </label>
        <label class="checkbox-label"><input type="checkbox" class="slot-required" ${slot.required ? 'checked' : ''} /> Required</label>
        <input type="number" class="slot-sort" value="${slot.sort ?? (index + 1) * 10}" style="width:4rem" title="Sort order" />
        <button class="button ghost small danger slot-remove" type="button">Remove</button>
      </div>
      <div class="slot-questions">
        ${questionCheckboxes || '<em style="color:#94a3b8;">No questions in library</em>'}
      </div>
    `

    // Toggle pool count visibility
    const modeSelect = row.querySelector('.slot-mode')
    const poolCountLabel = row.querySelector('.slot-pool-count')
    modeSelect.addEventListener('change', () => {
      poolCountLabel.style.display = modeSelect.value === 'pool' ? '' : 'none'
    })

    // Remove slot
    row.querySelector('.slot-remove').addEventListener('click', () => {
      row.remove()
    })

    view.slotsContainer.appendChild(row)
  }

  const addSlot = () => {
    const existingSlots = view.slotsContainer.querySelectorAll('.slot-row')
    const nextSort = (existingSlots.length + 1) * 10
    renderSlotRow({ mode: 'fixed', pool_count: 1, required: false, sort: nextSort, questions: [] }, existingSlots.length)
  }

  // ── Collect form data ──────────────────────────────────────────

  const collectSlots = () => {
    const rows = view.slotsContainer.querySelectorAll('.slot-row')
    return Array.from(rows).map((row) => {
      const mode = row.querySelector('.slot-mode').value
      const poolCount = parseInt(row.querySelector('.slot-count-input')?.value || '1')
      const required = row.querySelector('.slot-required').checked
      const sort = parseInt(row.querySelector('.slot-sort').value || '0')
      const checkboxes = row.querySelectorAll('.slot-questions input[type="checkbox"]:checked')
      const questions = Array.from(checkboxes).map((cb) => cb.value)
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
      closeEditForm()
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
      await loadQuestionnaires()
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  // ── Events ─────────────────────────────────────────────────────

  const bindEvents = () => {
    view.addBtn.addEventListener('click', async () => {
      await loadAvailableQuestions()
      openEditForm(null)
    })

    view.tableBody.addEventListener('click', async (e) => {
      const editBtn = e.target.closest('[data-edit]')
      if (editBtn) {
        const id = parseInt(editBtn.dataset.edit)
        const q = questionnaires.find((q) => parseInt(q.id) === id)
        if (q) {
          await loadAvailableQuestions()
          openEditForm(q)
        }
        return
      }

      const deleteBtn = e.target.closest('[data-delete]')
      if (deleteBtn) {
        handleDelete(parseInt(deleteBtn.dataset.delete))
      }
    })

    view.saveBtn.addEventListener('click', handleSave)
    view.cancelBtn.addEventListener('click', closeEditForm)
    view.addSlotBtn.addEventListener('click', addSlot)
  }

  return { loadQuestionnaires, bindEvents }
}

function esc(str) {
  const div = document.createElement('div')
  div.textContent = str ?? ''
  return div.innerHTML
}
