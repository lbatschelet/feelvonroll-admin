/**
 * Unsaved changes confirmation dialog.
 * Exports: createUnsavedDialog.
 */
export function createUnsavedDialog() {
  const backdrop = document.createElement('div')
  backdrop.className = 'modal-backdrop unsaved-dialog'
  backdrop.innerHTML = `
    <div class="modal modal-sm">
      <div class="modal-header">
        <h3>Unsaved changes</h3>
      </div>
      <p class="unsaved-message">You have unsaved changes. What would you like to do?</p>
      <div class="modal-actions">
        <button type="button" class="ghost" id="unsavedStay">Stay</button>
        <button type="button" class="danger" id="unsavedDiscard">Discard</button>
        <button type="button" class="primary" id="unsavedSave">Save &amp; continue</button>
      </div>
    </div>
  `

  return {
    element: backdrop,
    stayButton: backdrop.querySelector('#unsavedStay'),
    discardButton: backdrop.querySelector('#unsavedDiscard'),
    saveButton: backdrop.querySelector('#unsavedSave'),
  }
}
