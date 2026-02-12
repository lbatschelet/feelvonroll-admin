/**
 * DOM helper factory functions for form controls.
 * Exports: createInput, createCheckbox, createButton, createLabeled, icons.
 */

/** Reusable SVG icon strings */
export const icons = {
  trash: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>',
  pencil: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',
  save: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
  link: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  copy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  reload: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.3,13.43a1,1,0,0,0-1.25.65A7.14,7.14,0,0,1,12.18,19,7.1,7.1,0,0,1,5,12a7.1,7.1,0,0,1,7.18-7,7.26,7.26,0,0,1,4.65,1.67l-2.17-.36a1,1,0,0,0-1.15.83,1,1,0,0,0,.83,1.15l4.24.7h.17a1,1,0,0,0,.34-.06.33.33,0,0,0,.1-.06.78.78,0,0,0,.2-.11l.09-.11c0-.05.09-.09.13-.15s0-.1.05-.14a1.34,1.34,0,0,0,.07-.18l.75-4a1,1,0,0,0-2-.38l-.27,1.45A9.21,9.21,0,0,0,12.18,3,9.1,9.1,0,0,0,3,12a9.1,9.1,0,0,0,9.18,9A9.12,9.12,0,0,0,21,14.68,1,1,0,0,0,20.3,13.43Z"/></svg>',
  chevronLeft: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
  chevronRight: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>',
  chevronsLeft: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 18 5 12 11 6"/><polyline points="19 18 13 12 19 6"/></svg>',
  chevronsRight: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 6 19 12 13 18"/><polyline points="5 6 11 12 5 18"/></svg>',
}
export function createInput(type, value, readOnly = false) {
  const input = document.createElement('input')
  input.type = type
  input.value = value ?? ''
  input.readOnly = readOnly
  return input
}

export function createCheckbox(checked) {
  const input = document.createElement('input')
  input.type = 'checkbox'
  input.checked = Boolean(checked)
  return input
}

export function createButton(label, variant) {
  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = label
  if (variant === 'danger') {
    button.classList.add('danger')
  }
  return button
}

/** SVG icons for password toggle */
const eyeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
const eyeOffIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'

/**
 * Wraps a password <input> in a container with a visibility toggle button.
 * Call after the DOM element exists. Works with inputs created via innerHTML.
 *
 * @param {HTMLInputElement} input - The password input element.
 */
export function wrapPasswordToggle(input) {
  const wrap = document.createElement('div')
  wrap.className = 'pw-wrap'
  input.parentNode.insertBefore(wrap, input)
  wrap.appendChild(input)

  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'pw-toggle'
  btn.setAttribute('aria-label', 'Toggle password visibility')
  btn.innerHTML = eyeIcon
  wrap.appendChild(btn)

  btn.addEventListener('click', (e) => {
    e.preventDefault()
    const isHidden = input.type === 'password'
    input.type = isHidden ? 'text' : 'password'
    btn.innerHTML = isHidden ? eyeOffIcon : eyeIcon
  })
}

/**
 * Finds all password inputs inside a container and wraps each with a toggle.
 *
 * @param {HTMLElement} container
 */
export function enablePasswordToggles(container) {
  container.querySelectorAll('input[type="password"]').forEach(wrapPasswordToggle)
}

export function createLabeled(label, element) {
  const wrapper = document.createElement('label')
  wrapper.className = 'field'
  const text = document.createElement('span')
  text.textContent = label
  wrapper.appendChild(text)
  wrapper.appendChild(element)
  return wrapper
}
