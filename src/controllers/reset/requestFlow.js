/**
 * Reset request flow: email form → request_reset API call.
 * Exports: createResetRequestFlow.
 */
export function createResetRequestFlow({ api, views }) {
  const { requestEmail, requestButton, requestStatus } = views.resetPage

  const setStatus = (message, isError) => {
    requestStatus.textContent = message
    requestStatus.classList.toggle('error', Boolean(isError))
  }

  const handleRequest = async () => {
    const email = requestEmail.value.trim()
    if (!email) {
      setStatus('Please enter your email address.', true)
      return
    }
    requestButton.disabled = true
    requestButton.textContent = 'Sending...'
    try {
      await api.requestReset({ email })
      requestEmail.value = ''
      setStatus('If an account with that email exists, a reset link has been sent.', false)
    } catch (error) {
      setStatus(error.message, true)
    } finally {
      requestButton.disabled = false
      requestButton.textContent = 'Send reset link'
    }
  }

  const bindEvents = () => {
    requestButton.addEventListener('click', handleRequest)
    requestEmail.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleRequest()
    })
  }

  return { bindEvents }
}
