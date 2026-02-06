/**
 * Users API client for admin user management.
 * Exports: fetchUsers, fetchSelf, createUser, updateUser, updateSelf, deleteUser, resetUserPassword.
 */
import { API_BASE, requestJson } from './baseClient'

export function fetchUsers({ token }) {
  return requestJson(`${API_BASE}/admin_users.php`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function fetchSelf({ token }) {
  return requestJson(`${API_BASE}/admin_users.php?action=self`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function createUser({ token, first_name, last_name, email, password, is_admin }) {
  return requestJson(`${API_BASE}/admin_users.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action: 'create', first_name, last_name, email, password, is_admin }),
  })
}

export function updateUser({ token, id, first_name, last_name, email, is_admin }) {
  return requestJson(`${API_BASE}/admin_users.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action: 'update', id, first_name, last_name, email, is_admin }),
  })
}

export function updateSelf({ token, first_name, last_name, email, current_password, new_password, new_password_confirm }) {
  return requestJson(`${API_BASE}/admin_users.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      action: 'self_update',
      first_name,
      last_name,
      email,
      current_password,
      new_password,
      new_password_confirm,
    }),
  })
}

export function deleteUser({ token, id }) {
  return requestJson(`${API_BASE}/admin_users.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action: 'delete', id }),
  })
}

export function resetUserPassword({ token, id }) {
  return requestJson(`${API_BASE}/admin_users.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action: 'reset', id }),
  })
}
