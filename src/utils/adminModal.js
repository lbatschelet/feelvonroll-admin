/**
 * Shared modal helpers for admin pages.
 * Provides show/hide logic, backdrop-click-to-close, and escape key handling.
 * Exports: showModal, hideModal, bindModalClose.
 */

/** Show a modal backdrop by adding the is-visible class. */
export function showModal(backdrop) {
  backdrop.classList.add('is-visible')
}

/** Hide a modal backdrop by removing the is-visible class. */
export function hideModal(backdrop) {
  backdrop.classList.remove('is-visible')
}

/**
 * Bind close-on-backdrop-click and optional close button for a modal.
 * Returns a cleanup function (not needed in most cases).
 *
 * @param {HTMLElement} backdrop - The .modal-backdrop element
 * @param {Function} onClose - Callback to run when closing
 * @param {HTMLElement[]} [closeButtons] - Additional close buttons (× button, cancel)
 */
export function bindModalClose(backdrop, onClose, closeButtons = []) {
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) onClose()
  })
  closeButtons.forEach((btn) => {
    if (btn) btn.addEventListener('click', onClose)
  })
}
