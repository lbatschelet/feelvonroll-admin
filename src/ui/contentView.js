/**
 * Content view builder for managing content pages (e.g. about text).
 * Exports: createContentView.
 */
import { icons } from '../utils/dom'

export function createContentView() {
  const element = document.createElement('section')
  element.className = 'card content-card'
  element.innerHTML = `
    <div class="card-header">
      <div class="card-header-left">
        <h2>Content Pages</h2>
      </div>
      <div class="header-actions">
        <button id="contentReload" class="icon-btn-ghost" title="Reload content">${icons.reload}</button>
      </div>
    </div>
    <div class="content-page-tabs">
      <button class="nav-button active" data-content-key="about">About</button>
    </div>
    <div id="contentEditors" class="content-editors"></div>
  `

  return {
    element,
    reloadButton: element.querySelector('#contentReload'),
    tabButtons: Array.from(element.querySelectorAll('[data-content-key]')),
    editorsContainer: element.querySelector('#contentEditors'),
  }
}
