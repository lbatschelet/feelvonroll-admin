/**
 * Shared table rendering helpers for admin list pages.
 * Provides consistent action button cells, pagination, and display helpers.
 * Exports: actionCell, checkTd, toggleTd, updatePagination, emptyRow.
 */
import { icons } from './dom'

/**
 * Render a read-only (display-only) checkbox table cell.
 * @param {*} value - truthy/falsy value
 * @returns {string} HTML <td> with a disabled checkbox
 */
export function checkTd(value) {
  return `<td class="col-toggle"><input type="checkbox" disabled ${value ? 'checked' : ''} /></td>`
}

/**
 * Render an interactive toggle checkbox in a table cell.
 * Emits a 'change' event that can be caught with event delegation.
 *
 * @param {*} value - truthy/falsy for initial checked state
 * @param {string} field - data attribute name (e.g. 'active')
 * @param {string|number} id - row identifier
 * @returns {string} HTML <td>
 */
export function toggleTd(value, field, id) {
  return `<td class="col-toggle"><input type="checkbox" data-toggle="${field}" data-id="${id}" ${value ? 'checked' : ''} /></td>`
}

/**
 * Build an HTML string for a table action cell.
 *
 * @param {Array<{type: string, id?: string|number, key?: string, title?: string, html?: string}>} actions
 *   Supported types: 'edit', 'delete', 'link', 'custom'
 * @returns {string} HTML for a <td class="actions-cell">
 */
export function actionCell(actions) {
  const buttons = actions.map((a) => {
    switch (a.type) {
      case 'edit':
        return `<button class="icon-btn-ghost" data-edit="${a.id}" title="${a.title || 'Edit'}">${icons.pencil}</button>`
      case 'delete':
        return `<button class="icon-btn danger" data-delete="${a.id}" title="${a.title || 'Delete'}">${icons.trash}</button>`
      case 'link':
        return `<button class="icon-btn-ghost" data-link="${a.key}" title="${a.title || 'Open link'}">${icons.link}</button>`
      case 'custom':
        return a.html || ''
      default:
        return ''
    }
  })
  return `<td class="actions-cell">${buttons.join('')}</td>`
}

/**
 * Update pagination controls (first/prev/next/last buttons and page info text).
 * Shared between Pins and Audit tables.
 *
 * @param {object} opts
 * @param {number} opts.page - Current page (1-based)
 * @param {number} opts.maxPage - Total pages
 * @param {HTMLElement} opts.pageInfo - Span showing "Page X of Y"
 * @param {HTMLButtonElement} opts.firstBtn - First page button
 * @param {HTMLButtonElement} opts.prevBtn - Previous page button
 * @param {HTMLButtonElement} opts.nextBtn - Next page button
 * @param {HTMLButtonElement} opts.lastBtn - Last page button
 */
export function updatePagination({ page, maxPage, pageInfo, firstBtn, prevBtn, nextBtn, lastBtn }) {
  pageInfo.textContent = `Page ${page} of ${maxPage}`
  firstBtn.disabled = page <= 1
  prevBtn.disabled = page <= 1
  nextBtn.disabled = page >= maxPage
  lastBtn.disabled = page >= maxPage
}

/**
 * Generate an HTML string for an empty-state table row.
 *
 * @param {number} colspan - Number of columns to span
 * @param {string} [message='No entries'] - Message to display
 * @returns {string} HTML <tr> with a single <td>
 */
export function emptyRow(colspan, message = 'No entries') {
  return `<tr><td colspan="${colspan}" class="empty">${message}</td></tr>`
}
