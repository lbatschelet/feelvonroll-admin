/**
 * DOM helper factory functions for form controls.
 * Exports: createInput, createCheckbox, createButton, createLabeled.
 */
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

export function createLabeled(label, element) {
  const wrapper = document.createElement('label')
  wrapper.className = 'field'
  const text = document.createElement('span')
  text.textContent = label
  wrapper.appendChild(text)
  wrapper.appendChild(element)
  return wrapper
}
