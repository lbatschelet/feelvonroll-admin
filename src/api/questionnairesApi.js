/**
 * Admin questionnaires API client (CRUD for questionnaires and slots).
 * Exports: fetchQuestionnaires, upsertQuestionnaire, deleteQuestionnaire, saveQuestionnaireSlots.
 */
import { API_BASE, requestJson } from './baseClient'

export function fetchQuestionnaires({ token }) {
  return requestJson(`${API_BASE}/admin_questionnaires.php`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function upsertQuestionnaire({ token, ...data }) {
  return requestJson(`${API_BASE}/admin_questionnaires.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'upsert', ...data }),
  })
}

export function deleteQuestionnaire({ token, id }) {
  return requestJson(`${API_BASE}/admin_questionnaires.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'delete', id }),
  })
}

export function saveQuestionnaireSlots({ token, questionnaire_id, slots }) {
  return requestJson(`${API_BASE}/admin_questionnaires.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'save_slots', questionnaire_id, slots }),
  })
}
