/**
 * Auth API client for admin authentication flows.
 * Exports: fetchAuthStatus, loginWithToken, loginUser, setPassword, requestReset, refreshToken.
 */
import { API_BASE, requestJson } from './baseClient'

export function fetchAuthStatus() {
  return requestJson(`${API_BASE}/admin_auth.php`)
}

export function loginWithToken({ admin_token }) {
  return requestJson(`${API_BASE}/admin_auth.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'bootstrap_login', admin_token }),
  })
}

export function loginUser({ email, password }) {
  return requestJson(`${API_BASE}/admin_auth.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', email, password }),
  })
}

export function validateToken({ reset_token }) {
  return requestJson(`${API_BASE}/admin_auth.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'validate_token', reset_token }),
  })
}

export function setPassword({ reset_token, password }) {
  return requestJson(`${API_BASE}/admin_auth.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_password', reset_token, password }),
  })
}

export function requestReset({ email }) {
  return requestJson(`${API_BASE}/admin_auth.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'request_reset', email }),
  })
}

export function refreshToken({ token }) {
  return requestJson(`${API_BASE}/admin_auth.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action: 'refresh' }),
  })
}
