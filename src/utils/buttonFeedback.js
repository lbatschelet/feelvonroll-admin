/**
 * Button feedback helper for async actions.
 * Exports: runWithButtonFeedback.
 */
export async function runWithButtonFeedback(button, action) {
  const originalText = button.textContent
  button.disabled = true
  button.classList.remove('success', 'error')
  button.textContent = 'Saving...'
  try {
    await action()
    button.classList.add('success')
    button.textContent = 'Saved ✓'
  } catch (error) {
    button.classList.add('error')
    button.textContent = 'Error'
    throw error
  } finally {
    setTimeout(() => {
      button.classList.remove('success', 'error')
      button.textContent = originalText
      button.disabled = false
    }, 900)
  }
}
