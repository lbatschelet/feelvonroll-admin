/**
 * Base API client utilities for JSON requests and error parsing.
 * Exports: API_BASE, getApiBase, requestJson.
 */
export const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export function getApiBase() {
  return API_BASE
}

async function parseError(response) {
  let text = ''
  try {
    text = await response.text()
    const json = JSON.parse(text)
    if (json && json.error) {
      return `HTTP ${response.status}: ${json.error}`
    }
  } catch (error) {
    // ignore parsing errors
  }

  return `HTTP ${response.status}: ${text || response.statusText || 'Unbekannter Fehler'}`
}

export async function requestJson(url, options = {}) {
  const response = await fetch(url, options)
  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(message)
  }
  return response.json()
}
