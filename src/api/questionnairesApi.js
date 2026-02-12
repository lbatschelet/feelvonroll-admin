/**
 * Admin questionnaires API client (CRUD for questionnaires and slots).
 * Exports: fetchQuestionnaires, fetchQuestionnaireDetail, saveQuestionnaireFull,
 *          upsertQuestionnaire, deleteQuestionnaire, saveQuestionnaireSlots.
 */
import { API_BASE, requestJson } from './baseClient'

export function fetchQuestionnaires({ token }) {
  return requestJson(`${API_BASE}/admin_questionnaires.php`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

/** Fetch a single questionnaire with its slots and assigned questions. */
export function fetchQuestionnaireDetail({ token, id }) {
  return requestJson(`${API_BASE}/admin_questionnaires.php?id=${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

/** Atomic save: upsert questionnaire + replace all slots in one transaction. */
export function saveQuestionnaireFull({ token, ...data }) {
  return requestJson(`${API_BASE}/admin_questionnaires.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'save_full', ...data }),
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
