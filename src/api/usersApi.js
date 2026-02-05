/**
 * Users API client for admin user management.
 * Exports: fetchUsers, createUser, updateUser, deleteUser, resetUserPassword.
 */
import { API_BASE, requestJson } from './baseClient'

export function fetchUsers({ token }) {
  return requestJson(`${API_BASE}/admin_users.php`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function createUser({ token, name, email, password }) {
  return requestJson(`${API_BASE}/admin_users.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action: 'create', name, email, password }),
  })
}

export function updateUser({ token, id, name, email }) {
  return requestJson(`${API_BASE}/admin_users.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action: 'update', id, name, email }),
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
